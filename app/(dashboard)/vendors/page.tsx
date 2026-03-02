"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";

interface Contact {
    name: string;
    mobile: string;
}

interface Vendor {
    _id: string;
    name: string;
    company: string;
    contacts: Contact[];
    city: string;
    type: string;
    createdAt: string;
}

export default function VendorsPage() {
    const { token } = useAuth();
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [vendorToDelete, setVendorToDelete] = useState<string | null>(null);
    
    const [formData, setFormData] = useState({
        name: "",
        company: "",
        contacts: [{ name: "", mobile: "" }],
        city: "",
        type: ""
    });

    useEffect(() => {
        fetchVendors();
    }, [token]);

    const fetchVendors = async () => {
        if (!token) return;
        
        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
            const response = await fetch(`${baseUrl}/vendors`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (data.success) {
                const vendorData = data.data?.vendors || data.data || [];
                setVendors(Array.isArray(vendorData) ? vendorData : []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
            const url = editingVendor 
                ? `${baseUrl}/vendors/${editingVendor._id}`
                : `${baseUrl}/vendors`;
            
            const response = await fetch(url, {
                method: editingVendor ? "PUT" : "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                setShowModal(false);
                setEditingVendor(null);
                setFormData({
                    name: "",
                    company: "",
                    contacts: [{ name: "", mobile: "" }],
                    city: "",
                    type: ""
                });
                fetchVendors();
            } else {
                alert(data.message || "Failed to save vendor");
            }
        } catch (err: any) {
            alert(err.message || "An error occurred");
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (vendor: Vendor) => {
        setEditingVendor(vendor);
        setFormData({
            name: vendor.name,
            company: vendor.company,
            contacts: vendor.contacts.length > 0 ? vendor.contacts : [{ name: "", mobile: "" }],
            city: vendor.city,
            type: vendor.type
        });
        setShowModal(true);
        setOpenDropdown(null);
    };

    const handleDelete = async () => {
        if (!vendorToDelete) return;

        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
            const response = await fetch(`${baseUrl}/vendors/${vendorToDelete}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (data.success) {
                setShowDeleteModal(false);
                setVendorToDelete(null);
                fetchVendors();
            } else {
                alert(data.message || "Failed to delete vendor");
            }
        } catch (err: any) {
            alert(err.message || "An error occurred");
        }
    };

    const handleDeleteClick = (vendorId: string) => {
        setVendorToDelete(vendorId);
        setShowDeleteModal(true);
        setOpenDropdown(null);
    };

    const addContact = () => {
        setFormData({
            ...formData,
            contacts: [...formData.contacts, { name: "", mobile: "" }]
        });
    };

    const removeContact = (index: number) => {
        if (formData.contacts.length === 1) return;
        setFormData({
            ...formData,
            contacts: formData.contacts.filter((_, i) => i !== index)
        });
    };

    const updateContact = (index: number, field: 'name' | 'mobile', value: string) => {
        const newContacts = [...formData.contacts];
        if (field === 'mobile') {
            // Only allow numbers, +, -, and spaces
            value = value.replace(/[^0-9+\-\s]/g, '');
            // Limit to 10 digits (remove +, -, spaces for counting)
            const digitsOnly = value.replace(/[^0-9]/g, '');
            if (digitsOnly.length > 10) {
                value = value.slice(0, value.length - (digitsOnly.length - 10));
            }
        }
        newContacts[index][field] = value;
        setFormData({ ...formData, contacts: newContacts });
    };

    
    const totalPages = vendors.length > 0 ? Math.ceil(vendors.length / itemsPerPage) : 1;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentVendors = vendors.slice(startIndex, endIndex);

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Vendor Management</h1>
                <p className="text-gray-600 mt-2">Manage vendor information and relationships</p>
            </div>

            {loading ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
                    <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#76C043]"></div>
                        <p className="ml-3 text-gray-600">Loading vendors...</p>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <p className="text-base text-gray-600">
                                Total <span className="font-medium text-gray-900">{vendors.length}</span> vendors
                            </p>
                            <button 
                                onClick={() => {
                                    setEditingVendor(null);
                                    setFormData({
                                        name: "",
                                        company: "",
                                        contacts: [{ name: "", mobile: "" }],
                                        city: "",
                                        type: ""
                                    });
                                    setShowModal(true);
                                }}
                                className="px-4 py-2 bg-[#76C043] text-white text-sm font-medium rounded-lg hover:bg-[#65a83a] transition-colors"
                            >
                                + Add Vendor
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto overflow-y-visible">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Vendor Name</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Company</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Contacts</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">City</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {vendors.map((vendor) => (
                                    <tr key={vendor._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-base font-semibold text-gray-900">{vendor.name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-base text-gray-700">{vendor.company}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-base text-gray-600">
                                                {vendor.contacts.map((contact, idx) => (
                                                    <div key={idx} className="mb-1">
                                                        <span className="font-medium">{contact.name}</span>
                                                        <span className="text-gray-500"> - {contact.mobile}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-base text-gray-600">{vendor.city}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                                {vendor.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <button
                                                    data-vendor-id={vendor._id}
                                                    onClick={() => setOpenDropdown(openDropdown === vendor._id ? null : vendor._id)}
                                                    className="px-3 py-1 text-xs font-medium rounded-lg transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200"
                                                >
                                                    Actions ▾
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    
                    {/* Pagination */}
                    <div className="mt-6 flex items-center justify-between px-6 py-4 bg-gray-50">
                        <div className="text-sm text-gray-700">
                            Page {currentPage} of {totalPages}
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
</div>
                </div>
            )}

            {/* Dropdown Portal - Outside table overflow */}
            {openDropdown && (
                <>
                    <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setOpenDropdown(null)}
                    />
                    <div className="fixed bg-white rounded-lg shadow-lg border border-gray-200 z-20 min-w-[120px]" style={{
                        top: `${document.querySelector(`[data-vendor-id="${openDropdown}"]`)?.getBoundingClientRect().bottom + 4}px`,
                        right: `${window.innerWidth - document.querySelector(`[data-vendor-id="${openDropdown}"]`)?.getBoundingClientRect().right}px`
                    }}>
                        {vendors.find(v => v._id === openDropdown) && (
                            <>
                                <button
                                    onClick={() => handleEdit(vendors.find(v => v._id === openDropdown)!)}
                                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-gray-700 rounded-t-lg whitespace-nowrap"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDeleteClick(openDropdown)}
                                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-red-600 rounded-b-lg whitespace-nowrap"
                                >
                                    Delete
                                </button>
                            </>
                        )}
                    </div>
                </>
            )}

            {showModal && (
                <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editingVendor ? "Edit Vendor" : "Add Vendor"}
                            </h2>
                            <button 
                                onClick={() => {
                                    setShowModal(false);
                                    setEditingVendor(null);
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#76C043] focus:border-transparent"
                                        placeholder="e.g., Rajesh Kumar"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.company}
                                        onChange={(e) => setFormData({...formData, company: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#76C043] focus:border-transparent"
                                        placeholder="e.g., Tech Solutions Pvt Ltd"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.city}
                                        onChange={(e) => setFormData({...formData, city: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#76C043] focus:border-transparent"
                                        placeholder="e.g., Mumbai"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.type}
                                        onChange={(e) => setFormData({...formData, type: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#76C043] focus:border-transparent"
                                        placeholder="e.g., IT Equipment, Office Furniture"
                                    />
                                </div>

                                <div className="col-span-2">
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="block text-sm font-medium text-gray-700">Contacts *</label>
                                        <button
                                            type="button"
                                            onClick={addContact}
                                            className="text-sm text-[#76C043] hover:text-[#65a83a] font-medium"
                                        >
                                            + Add Contact
                                        </button>
                                    </div>
                                    
                                    {formData.contacts.map((contact, index) => (
                                        <div key={index} className="grid grid-cols-2 gap-4 mb-3 p-4 bg-gray-50 rounded-lg">
                                            <div>
                                                <input
                                                    type="text"
                                                    required
                                                    value={contact.name}
                                                    onChange={(e) => updateContact(index, 'name', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#76C043] focus:border-transparent"
                                                    placeholder="Contact Name"
                                                />
                                            </div>
                                            <div className="flex gap-2">
                                                <input
                                                    type="tel"
                                                    required
                                                    value={contact.mobile}
                                                    onChange={(e) => updateContact(index, 'mobile', e.target.value)}
                                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#76C043] focus:border-transparent"
                                                    placeholder="Mobile Number"
                                                />
                                                {formData.contacts.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeContact(index)}
                                                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-6 flex gap-3 justify-end">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        setEditingVendor(null);
                                    }}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-4 py-2 bg-[#76C043] text-white rounded-lg hover:bg-[#65a83a] transition-colors disabled:opacity-50"
                                >
                                    {submitting ? "Saving..." : editingVendor ? "Update Vendor" : "Add Vendor"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showDeleteModal && (
                <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-900">Confirm Deletion</h2>
                        </div>

                        <div className="p-6">
                            <p className="text-gray-700">Are you sure you want to delete this vendor? This action cannot be undone.</p>
                        </div>

                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3 justify-end">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setVendorToDelete(null);
                                }}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
