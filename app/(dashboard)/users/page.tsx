"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";

interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    mobile?: string;
    asset?: string;
    designation?: string;
    isActive: boolean;
}

interface Asset {
    _id: string;
    name: string;
    category: string;
    brand: string;
    model: string;
    serialNumber: string;
    status: string;
    assetType: string;
}

interface SelectedAsset {
    assetId: string;
    name: string;
    serialNumber: string;
}

export default function UsersPage() {
    const { user, token } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [assets, setAssets] = useState<Asset[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);
    const [selectedAssets, setSelectedAssets] = useState<SelectedAsset[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string>("");
    
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "user",
        mobile: "",
        designation: "",
        assignmentNotes: ""
    });

    const [assetSelection, setAssetSelection] = useState({
        category: "",
        assetId: ""
    });

    useEffect(() => {
        fetchUsers();
        fetchAssets();
    }, [token]);

    useEffect(() => {
        if (assetSelection.category) {
            const filtered = assets.filter(a => 
                a.category === assetSelection.category && 
                a.status === 'available' && 
                a.assetType === 'assignable'
            );
            setFilteredAssets(filtered);
        } else {
            setFilteredAssets([]);
        }
    }, [assetSelection.category, assets]);

    const fetchUsers = async () => {
        if (!token) return;
        
        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
            const response = await fetch(`${baseUrl}/users`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (data.success) {
                setUsers(data.data || []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchAssets = async () => {
        if (!token) return;
        
        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
            const response = await fetch(`${baseUrl}/master-data?assetType=assignable&status=available&limit=1000`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (data.success) {
                const assetList = data.data.masterData || [];
                setAssets(assetList);
                
                // Extract unique categories
                const uniqueCategories = [...new Set(assetList.map((a: Asset) => a.category))];
                setCategories(uniqueCategories);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddAsset = () => {
        if (!assetSelection.assetId) return;
        
        const asset = assets.find(a => a._id === assetSelection.assetId);
        if (!asset) {
            alert('Selected asset not found. Please refresh the page.');
            fetchAssets(); // Refresh asset list
            return;
        }

        // Check if already added
        if (selectedAssets.find(a => a.assetId === asset._id)) {
            alert('Asset already added');
            return;
        }

        // Verify asset is still available
        if (asset.status !== 'available') {
            alert(`Asset "${asset.name}" is no longer available (status: ${asset.status})`);
            fetchAssets(); // Refresh asset list
            return;
        }

        setSelectedAssets([...selectedAssets, {
            assetId: asset._id,
            name: asset.name,
            serialNumber: asset.serialNumber
        }]);

        // Reset selection
        setAssetSelection({ category: "", assetId: "" });
    };

    const handleRemoveAsset = (assetId: string) => {
        setSelectedAssets(selectedAssets.filter(a => a.assetId !== assetId));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
            const assetIds = selectedAssets.map(a => a.assetId);
            
            const response = await fetch(`${baseUrl}/users/with-assignment`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    userData: formData,
                    assetIds: assetIds,
                    notes: formData.assignmentNotes
                })
            });

            const data = await response.json();

            if (data.success) {
                setShowModal(false);
                setFormData({
                    name: "",
                    email: "",
                    password: "",
                    role: "user",
                    mobile: "",
                    designation: "",
                    assignmentNotes: ""
                });
                const assignedCount = selectedAssets.length;
                setSelectedAssets([]);
                setAssetSelection({ category: "", assetId: "" });
                
                // Show success message
                if (assignedCount > 0) {
                    setSuccessMessage(`User created successfully and ${assignedCount} device${assignedCount > 1 ? 's' : ''} assigned!`);
                } else {
                    setSuccessMessage('User created successfully!');
                }
                setTimeout(() => setSuccessMessage(""), 5000);
                
                fetchUsers();
                fetchAssets();
            } else {
                alert(data.message || "Failed to create user");
            }
        } catch (err: any) {
            console.error('Error creating user:', err);
            alert(err.message || "An error occurred while creating user");
        } finally {
            setSubmitting(false);
        }
    };

    const toggleUserStatus = async (userId: string) => {
        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
            const response = await fetch(`${baseUrl}/users/${userId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (data.success) {
                setShowDeleteModal(false);
                setUserToDelete(null);
                fetchUsers();
            } else {
                alert(data.message || "Failed to delete user");
            }
        } catch (err: any) {
            alert(err.message || "An error occurred");
        }
    };

    const handleDeleteClick = (userId: string) => {
        setUserToDelete(userId);
        setShowDeleteModal(true);
        setOpenDropdown(null);
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            {/* Success Message */}
            {successMessage && (
                <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3 animate-fade-in">
                    <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-green-800 font-medium">{successMessage}</p>
                    <button 
                        onClick={() => setSuccessMessage("")}
                        className="ml-auto text-green-600 hover:text-green-800"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            )}

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                <p className="text-gray-600 mt-2">Create and manage user accounts</p>
            </div>

            {loading ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
                    <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#76C043]"></div>
                        <p className="ml-3 text-gray-600">Loading users...</p>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-600">
                                Total <span className="font-medium text-gray-900">{users.length}</span> users
                            </p>
                            <button 
                                onClick={() => setShowModal(true)}
                                className="px-4 py-2 bg-[#76C043] text-white text-sm font-medium rounded-lg hover:bg-[#65a83a] transition-colors"
                            >
                                + Create Account
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Mobile</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Designation</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {users.map((u) => (
                                    <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-semibold text-gray-900">{u.name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-700">{u.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-600">{u.mobile || '-'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-600">{u.designation || '-'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="relative">
                                                <button
                                                    onClick={() => setOpenDropdown(openDropdown === u._id ? null : u._id)}
                                                    className="px-3 py-1 text-xs font-medium rounded-lg transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200"
                                                >
                                                    Actions ▾
                                                </button>
                                                {openDropdown === u._id && (
                                                    <>
                                                        <div 
                                                            className="fixed inset-0 z-10" 
                                                            onClick={() => setOpenDropdown(null)}
                                                        />
                                                        <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                                                            <button
                                                                onClick={() => handleDeleteClick(u._id)}
                                                                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-red-600 rounded-lg"
                                                            >
                                                                Deactivate
                                                            </button>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
                            <h2 className="text-xl font-bold text-gray-900">Create Account</h2>
                            <button 
                                onClick={() => setShowModal(false)}
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
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#76C043] focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#76C043] focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                                    <input
                                        type="password"
                                        required
                                        value={formData.password}
                                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#76C043] focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                                    <select
                                        required
                                        value={formData.role}
                                        onChange={(e) => setFormData({...formData, role: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#76C043] focus:border-transparent"
                                    >
                                        <option value="user">User</option>
                                        <option value="manager">Manager</option>
                                        <option value="hr">HR</option>
                                        <option value="admin">Admin</option>
                                        {user?.role === "Superadmin" && <option value="superadmin">Superadmin</option>}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number *</label>
                                    <input
                                        type="tel"
                                        required
                                        value={formData.mobile}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/[^0-9+\-\s]/g, '');
                                            setFormData({...formData, mobile: value});
                                        }}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#76C043] focus:border-transparent"
                                        placeholder="e.g., +91 98765 43210"
                                    />
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                                    <input
                                        type="text"
                                        value={formData.designation}
                                        onChange={(e) => setFormData({...formData, designation: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#76C043] focus:border-transparent"
                                    />
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Assignment Notes <span className="text-gray-500 text-xs">(Optional - will be added to all assigned assets)</span>
                                    </label>
                                    <textarea
                                        value={formData.assignmentNotes}
                                        onChange={(e) => setFormData({...formData, assignmentNotes: e.target.value})}
                                        placeholder="e.g., Initial assignment, Replacement device, etc."
                                        rows={2}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#76C043] focus:border-transparent resize-none"
                                    />
                                </div>

                                {/* Asset Assignment Section */}
                                <div className="col-span-2 border-t border-gray-200 pt-6 mt-4">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Asset Assignment (Optional)</h3>
                                    <p className="text-sm text-gray-600 mb-4">Select category and assets to assign to this user. You can add multiple devices.</p>
                                    
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                        <div className="grid grid-cols-2 gap-4 mb-3">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Category <span className="text-gray-500">(Select first)</span>
                                                </label>
                                                <select
                                                    value={assetSelection.category}
                                                    onChange={(e) => setAssetSelection({...assetSelection, category: e.target.value, assetId: ""})}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#76C043] focus:border-transparent bg-white"
                                                >
                                                    <option value="">-- Select Category --</option>
                                                    {categories.map((cat) => (
                                                        <option key={cat} value={cat}>{cat}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Asset <span className="text-gray-500">(Available in selected category)</span>
                                                </label>
                                                <select
                                                    value={assetSelection.assetId}
                                                    onChange={(e) => setAssetSelection({...assetSelection, assetId: e.target.value})}
                                                    disabled={!assetSelection.category}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#76C043] focus:border-transparent disabled:bg-gray-100 bg-white"
                                                >
                                                    <option value="">-- Select Asset --</option>
                                                    {filteredAssets.map((asset) => (
                                                        <option key={asset._id} value={asset._id}>
                                                            {asset.name} - {asset.serialNumber}
                                                        </option>
                                                    ))}
                                                </select>
                                                {assetSelection.category && filteredAssets.length === 0 && (
                                                    <p className="text-xs text-amber-600 mt-1">No available assets in this category</p>
                                                )}
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={handleAddAsset}
                                            disabled={!assetSelection.assetId}
                                            className="px-4 py-2 bg-[#76C043] text-white text-sm font-medium rounded-lg hover:bg-[#65a83a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                            Add Device for Assignment
                                        </button>
                                    </div>

                                    {/* Selected Assets List */}
                                    {selectedAssets.length > 0 && (
                                        <div className="mt-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <p className="text-sm font-semibold text-gray-900">
                                                    Devices to be Assigned ({selectedAssets.length})
                                                </p>
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedAssets([])}
                                                    className="text-xs text-red-600 hover:text-red-700 font-medium"
                                                >
                                                    Clear All
                                                </button>
                                            </div>
                                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                                {selectedAssets.map((asset, index) => (
                                                    <div key={asset.assetId} className="flex items-center justify-between bg-white border border-gray-200 px-4 py-3 rounded-lg hover:border-[#76C043] transition-colors">
                                                        <div className="flex items-center gap-3">
                                                            <span className="flex items-center justify-center w-6 h-6 bg-[#76C043] text-white text-xs font-bold rounded-full">
                                                                {index + 1}
                                                            </span>
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-900">{asset.name}</p>
                                                                <p className="text-xs text-gray-500">S/N: {asset.serialNumber}</p>
                                                            </div>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveAsset(asset.assetId)}
                                                            className="text-red-600 hover:text-red-700 p-1 hover:bg-red-50 rounded transition-colors"
                                                            title="Remove this asset"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-6 flex gap-3 justify-end border-t border-gray-200 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        setSelectedAssets([]);
                                        setAssetSelection({ category: "", assetId: "" });
                                        setFormData({
                                            name: "",
                                            email: "",
                                            password: "",
                                            role: "user",
                                            mobile: "",
                                            designation: "",
                                            assignmentNotes: ""
                                        });
                                    }}
                                    className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-5 py-2.5 bg-[#76C043] text-white rounded-lg hover:bg-[#65a83a] transition-colors disabled:opacity-50 font-medium flex items-center gap-2"
                                >
                                    {submitting ? (
                                        <>
                                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Creating User...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            {selectedAssets.length > 0 ? `Create User & Assign ${selectedAssets.length} Device${selectedAssets.length > 1 ? 's' : ''}` : 'Create User'}
                                        </>
                                    )}
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
                            <h2 className="text-xl font-bold text-gray-900">Confirm Deactivation</h2>
                        </div>

                        <div className="p-6">
                            <p className="text-gray-700">Are you sure you want to remove this user? This action cannot be undone.</p>
                        </div>

                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3 justify-end">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setUserToDelete(null);
                                }}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => userToDelete && toggleUserStatus(userToDelete)}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
