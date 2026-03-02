"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";

interface Asset {
    _id: string;
    brand: string;
    model: string;
    serialNumber: string;
    status: string;
    purchaseDate: string;
    purchaseCost: number;
    location?: string;
    invoiceImage?: string;
}

export default function AssetsPage() {
    const { user, token } = useAuth();
    const [assets, setAssets] = useState<Asset[]>([]);
    const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    
    // Clear any cached data on mount
    useEffect(() => {
        setAssets([]);
    }, []);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [assetToDelete, setAssetToDelete] = useState<Asset | null>(null);
    const [deleting, setDeleting] = useState(false);
    
    // Filter state
    const [filters, setFilters] = useState({
        category: "",
        brand: "",
        status: ""
    });
    
    // Form state
    const [formData, setFormData] = useState({
        name: "",
        category: "",
        brand: "",
        model: "",
        serialNumber: "",
        assetType: "assignable",
        status: "available",
        purchaseDate: "",
        purchaseCost: "",
        location: "",
        description: "",
        quantity: 1
    });

    useEffect(() => {
        fetchAssets();
    }, [token]);
    
    // Apply filters whenever assets or filters change
    useEffect(() => {
        let filtered = assets;
        
        if (filters.category) {
            filtered = filtered.filter(a => a.category === filters.category);
        }
        if (filters.brand) {
            filtered = filtered.filter(a => a.brand === filters.brand);
        }
        if (filters.status) {
            filtered = filtered.filter(a => a.status === filters.status);
        }
        
        setFilteredAssets(filtered);
        setCurrentPage(1); // Reset to first page when filters change
    }, [assets, filters]);

    // Pagination calculations
    const totalPages = Math.ceil(filteredAssets.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentAssets = filteredAssets.slice(startIndex, endIndex);

    const fetchAssets = async () => {
        if (!token) return;
        
        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
            // Add cache busting and no-cache headers
            const response = await fetch(`${baseUrl}/assets?limit=1000&t=${Date.now()}`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Cache-Control": "no-cache, no-store, must-revalidate",
                    "Pragma": "no-cache"
                },
                cache: 'no-store'
            });

            const data = await response.json();
            
            console.log('API Response:', data);
            console.log('Fetched assets from API:', data.data?.assets?.length);
            console.log('First 3 assets:', data.data?.assets?.slice(0, 3).map((a: any) => a.brand + ' ' + a.model));

            if (data.success) {
                // Force clear and set fresh data
                setAssets([]);
                setTimeout(() => {
                    const assetData = data.data?.assets || data.data || [];
                    setAssets(Array.isArray(assetData) ? assetData : []);
                }, 0);
            } else {
                setError(data.message || "Failed to fetch assets");
            }
        } catch (err: any) {
            setError(err.message || "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
            
            // Create FormData for file upload
            const formDataToSend = new FormData();
            formDataToSend.append('name', formData.name);
            formDataToSend.append('category', formData.category);
            formDataToSend.append('brand', formData.brand);
            formDataToSend.append('model', formData.model);
            formDataToSend.append('serialNumber', formData.serialNumber);
            formDataToSend.append('assetType', formData.assetType);
            formDataToSend.append('status', formData.status);
            formDataToSend.append('quantity', formData.quantity.toString());
            
            if (formData.purchaseDate) formDataToSend.append('purchaseDate', formData.purchaseDate);
            if (formData.purchaseCost) formDataToSend.append('purchaseCost', formData.purchaseCost);
            if (formData.location) formDataToSend.append('location', formData.location);
            if (formData.description) formDataToSend.append('description', formData.description);
            if (invoiceFile) formDataToSend.append('invoiceImage', invoiceFile);
            
            const response = await fetch(`${baseUrl}/assets/bulk`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                },
                body: formDataToSend
            });

            const data = await response.json();

            if (data.success) {
                setShowModal(false);
                setFormData({
                    name: "",
                    category: "",
                    brand: "",
                    model: "",
                    serialNumber: "",
                    assetType: "assignable",
                    status: "available",
                    purchaseDate: "",
                    purchaseCost: "",
                    location: "",
                    description: "",
                    quantity: 1
                });
                setInvoiceFile(null);
                fetchAssets(); // Refresh the list
            } else {
                alert(data.message || "Failed to create asset");
            }
        } catch (err: any) {
            alert(err.message || "An error occurred");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteAsset = async () => {
        if (!assetToDelete) return;

        setDeleting(true);
        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
            const response = await fetch(`${baseUrl}/assets/${assetToDelete._id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (data.success) {
                setShowDeleteModal(false);
                setAssetToDelete(null);
                fetchAssets();
            } else {
                alert(data.message || "Failed to delete asset");
            }
        } catch (err: any) {
            alert(err.message || "An error occurred");
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    {user?.role === "Staff" ? "My Assets" : "Assets"}
                </h1>
                <p className="text-gray-600 mt-2">
                    {user?.role === "Staff" 
                        ? "View your assigned assets" 
                        : "Manage and track all assets"}
                </p>
            </div>

            {loading ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
                    <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#76C043]"></div>
                        <p className="ml-3 text-gray-600">Loading assets...</p>
                    </div>
                </div>
            ) : error ? (
                <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6">
                    <p className="text-red-600">{error}</p>
                </div>
            ) : assets.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <h3 className="mt-4 text-lg font-medium text-gray-900">No assets found</h3>
                    <p className="mt-2 text-sm text-gray-500">Get started by creating a new asset.</p>
                    <button 
                        onClick={() => setShowModal(true)}
                        className="mt-4 px-4 py-2 bg-[#76C043] text-white text-sm font-medium rounded-lg hover:bg-[#65a83a] transition-colors"
                    >
                        + Add Asset
                    </button>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* Stats Bar */}
                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-600">
                                Showing <span className="font-medium text-gray-900">{filteredAssets.length}</span> of {assets.length} assets
                            </p>
                            <button 
                                onClick={() => setShowModal(true)}
                                className="px-4 py-2 bg-[#76C043] text-white text-sm font-medium rounded-lg hover:bg-[#65a83a] transition-colors"
                            >
                                + Add Asset
                            </button>
                        </div>
                    </div>
                    
                    {/* Filters */}
                    <div className="px-6 py-4 bg-white border-b border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <select
                                    value={filters.category}
                                    onChange={(e) => setFilters({...filters, category: e.target.value})}
                                    className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#76C043] focus:border-transparent"
                                >
                                    <option value="">All Categories</option>
                                    {[...new Set(assets.map(a => a.category))].map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                                <select
                                    value={filters.brand}
                                    onChange={(e) => setFilters({...filters, brand: e.target.value})}
                                    className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#76C043] focus:border-transparent"
                                >
                                    <option value="">All Brands</option>
                                    {[...new Set(assets.map(a => a.brand))].map(brand => (
                                        <option key={brand} value={brand}>{brand}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    value={filters.status}
                                    onChange={(e) => setFilters({...filters, status: e.target.value})}
                                    className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#76C043] focus:border-transparent"
                                >
                                    <option value="">All Status</option>
                                    <option value="available">Available</option>
                                    <option value="assigned">Assigned</option>
                                    <option value="maintenance">Maintenance</option>
                                    <option value="retired">Retired</option>
                                </select>
                            </div>
                            <div className="flex items-end">
                                <button
                                    onClick={() => setFilters({ category: "", brand: "", status: "" })}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Brand</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Model</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Serial Number</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Location</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Purchase Cost</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Invoice</th>
                                    {(user?.role === "Admin" || user?.role === "Superadmin") && (
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Action</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {currentAssets.map((asset) => (
                                    <tr key={asset._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-base font-semibold text-gray-900">{asset.brand}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-base text-gray-700">{asset.model}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-base text-gray-700 capitalize">{asset.category}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-base text-gray-600 font-mono">{asset.serialNumber}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                                asset.status === 'available' ? 'bg-green-100 text-green-700' :
                                                asset.status === 'assigned' ? 'bg-blue-100 text-blue-700' :
                                                asset.status === 'under-repair' ? 'bg-yellow-100 text-yellow-700' :
                                                asset.status === 'damaged' ? 'bg-red-100 text-red-700' :
                                                asset.status === 'retired' ? 'bg-gray-100 text-gray-700' :
                                                'bg-gray-100 text-gray-700'
                                            }`}>
                                                {asset.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-600">{asset.location || '-'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">₹{asset.purchaseCost?.toLocaleString('en-IN') || '-'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {asset.invoiceImage ? (
                                                <a 
                                                    href={`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'}/${asset.invoiceImage}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 text-sm text-[#76C043] hover:text-[#65a83a] font-medium"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                    View
                                                </a>
                                            ) : (
                                                <span className="text-sm text-gray-400">-</span>
                                            )}
                                        </td>
                                        {(user?.role === "Admin" || user?.role === "Superadmin") && (
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <button
                                                    onClick={() => {
                                                        setAssetToDelete(asset);
                                                        setShowDeleteModal(true);
                                                    }}
                                                    className="px-3 py-1.5 text-xs font-medium rounded bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                                                    title="Delete Asset"
                                                >
                                                    🗑️ Delete
                                                </button>
                                            </td>
                                        )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                            Showing <span className="font-semibold">{startIndex + 1}</span> to <span className="font-semibold">{Math.min(endIndex, filteredAssets.length)}</span> of <span className="font-semibold">{filteredAssets.length}</span> assets
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            
                            <div className="flex items-center gap-1">
                                {[...Array(totalPages)].map((_, i) => {
                                    const page = i + 1;
                                    // Show first, last, current, and pages around current
                                    if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                                        return (
                                            <button
                                                key={page}
                                                onClick={() => setCurrentPage(page)}
                                                className={`px-3 py-2 text-sm font-medium rounded-lg ${
                                                    currentPage === page
                                                        ? 'bg-[#76C043] text-white'
                                                        : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                                                }`}
                                            >
                                                {page}
                                            </button>
                                        );
                                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                                        return <span key={page} className="px-2 text-gray-500">...</span>;
                                    }
                                    return null;
                                })}
                            </div>

                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">Add New Asset</h2>
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#76C043] focus:border-transparent"
                                        placeholder="e.g., Laptop, Monitor"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.category}
                                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#76C043] focus:border-transparent"
                                        placeholder="e.g., Electronics, Furniture"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Brand *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.brand}
                                        onChange={(e) => setFormData({...formData, brand: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#76C043] focus:border-transparent"
                                        placeholder="e.g., Dell, HP"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Model *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.model}
                                        onChange={(e) => setFormData({...formData, model: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#76C043] focus:border-transparent"
                                        placeholder="e.g., Latitude 5420"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Serial Number *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.serialNumber}
                                        onChange={(e) => setFormData({...formData, serialNumber: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#76C043] focus:border-transparent"
                                        placeholder="e.g., SN123456"
                                    />
                                    {formData.quantity > 1 && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            Will auto-increment: {formData.serialNumber}-1, {formData.serialNumber}-2, etc.
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        max="100"
                                        value={formData.quantity}
                                        onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#76C043] focus:border-transparent"
                                        placeholder="1"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Number of identical assets to create
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                                    <select
                                        required
                                        value={formData.status}
                                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#76C043] focus:border-transparent"
                                    >
                                        <option value="available">Available</option>
                                        <option value="assigned">Assigned</option>
                                        <option value="under-repair">Under Repair</option>
                                        <option value="damaged">Damaged</option>
                                        <option value="retired">Retired</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Date</label>
                                    <input
                                        type="date"
                                        value={formData.purchaseDate}
                                        onChange={(e) => setFormData({...formData, purchaseDate: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#76C043] focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Cost</label>
                                    <input
                                        type="number"
                                        value={formData.purchaseCost}
                                        onChange={(e) => setFormData({...formData, purchaseCost: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#76C043] focus:border-transparent"
                                        placeholder="0.00"
                                        step="0.01"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                    <input
                                        type="text"
                                        value={formData.location}
                                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#76C043] focus:border-transparent"
                                        placeholder="e.g., Office-Floor-1"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Image</label>
                                    <input
                                        type="file"
                                        accept="image/*,.pdf"
                                        onChange={(e) => setInvoiceFile(e.target.files?.[0] || null)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#76C043] focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#76C043] file:text-white hover:file:bg-[#65a83a]"
                                    />
                                    {invoiceFile && (
                                        <p className="text-xs text-gray-600 mt-1">Selected: {invoiceFile.name}</p>
                                    )}
                                </div>
                            </div>

                            <div className="mt-6 flex gap-3 justify-end">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-4 py-2 bg-[#76C043] text-white rounded-lg hover:bg-[#65a83a] transition-colors disabled:opacity-50"
                                >
                                    {submitting ? "Creating..." : "Create Asset"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showDeleteModal && assetToDelete && (
                <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-900">Confirm Delete</h2>
                        </div>

                        <div className="p-6">
                            <p className="text-gray-700 mb-4">Are you sure you want to delete this asset?</p>
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <p className="text-sm"><span className="font-medium">Brand:</span> {assetToDelete.brand}</p>
                                <p className="text-sm"><span className="font-medium">Model:</span> {assetToDelete.model}</p>
                                <p className="text-sm"><span className="font-medium">Serial:</span> {assetToDelete.serialNumber}</p>
                            </div>
                            <p className="text-sm text-red-600 mt-4">⚠️ This action cannot be undone.</p>
                        </div>

                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3 justify-end">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setAssetToDelete(null);
                                }}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteAsset}
                                disabled={deleting}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                            >
                                {deleting ? "Deleting..." : "Delete Asset"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            )}
        </div>
    );
}
