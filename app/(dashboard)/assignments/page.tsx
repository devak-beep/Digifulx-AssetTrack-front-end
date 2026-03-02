"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";

interface Assignment {
    _id: string;
    assetId: {
        _id: string;
        name: string;
        brand: string;
        model: string;
        serialNumber: string;
    };
    userId: {
        _id: string;
        name: string;
        email: string;
    };
    status: string;
    notes?: string;
    assignedDate: string;
    returnedDate?: string;
}

interface Asset {
    _id: string;
    name: string;
    brand: string;
    model: string;
    serialNumber: string;
    status: string;
    category: string;
}

interface User {
    _id: string;
    name: string;
    email: string;
}

export default function AssignmentsPage() {
    const { token } = useAuth();
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [filteredAssignments, setFilteredAssignments] = useState<Assignment[]>([]);
    const [assets, setAssets] = useState<Asset[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [assignmentToEdit, setAssignmentToEdit] = useState<Assignment | null>(null);
    const [editFormData, setEditFormData] = useState({
        notes: "",
        status: "active"
    });
    const [editingAssignment, setEditingAssignment] = useState(false);
    
    // Filter state
    const [filters, setFilters] = useState({
        category: "",
        user: "",
        status: ""
    });
    const [categories, setCategories] = useState<string[]>([]);
    const [formData, setFormData] = useState({
        category: "",
        assetId: "",
        userId: "",
        notes: ""
    });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        fetchData();
    }, [token]);
    
    // Apply filters
    useEffect(() => {
        let filtered = assignments;
        
        if (filters.category) {
            filtered = filtered.filter(a => a.assetId?.category === filters.category);
        }
        if (filters.user) {
            filtered = filtered.filter(a => a.userId?._id === filters.user);
        }
        if (filters.status) {
            filtered = filtered.filter(a => a.status === filters.status);
        }
        
        setFilteredAssignments(filtered);
    }, [assignments, filters]);

    const fetchData = async () => {
        if (!token) return;
        
        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
            
            const [assignmentsRes, assetsRes, usersRes] = await Promise.all([
                fetch(`${baseUrl}/assignments`, {
                    headers: { "Authorization": `Bearer ${token}` }
                }),
                fetch(`${baseUrl}/assets?limit=1000`, {
                    headers: { "Authorization": `Bearer ${token}` }
                }),
                fetch(`${baseUrl}/users`, {
                    headers: { "Authorization": `Bearer ${token}` }
                })
            ]);

            const [assignmentsData, assetsData, usersData] = await Promise.all([
                assignmentsRes.json(),
                assetsRes.json(),
                usersRes.json()
            ]);

            if (assignmentsData.success) {
                console.log('Assignments data:', assignmentsData.data);
                const data = assignmentsData.data?.data || assignmentsData.data || [];
                setAssignments(Array.isArray(data) ? data : []);
            }
            if (assetsData.success) {
                const availableAssets = assetsData.data.assets?.filter((a: Asset) => a.status === 'available') || [];
                setAssets(availableAssets);
                
                // Extract unique categories
                const uniqueCategories = [...new Set(availableAssets.map((a: Asset) => a.category))];
                setCategories(uniqueCategories);
            }
            if (usersData.success) {
                const userData = usersData.data?.data || usersData.data || [];
                setUsers(Array.isArray(userData) ? userData : []);
            }
        } catch (err: any) {
            setError(err.message || "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    const handleAssign = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
            const response = await fetch(`${baseUrl}/assignments/assign`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                setShowModal(false);
                setFormData({ category: "", assetId: "", userId: "", notes: "" });
                fetchData();
            } else {
                alert(data.message || "Failed to assign asset");
            }
        } catch (err: any) {
            alert(err.message || "An error occurred");
        } finally {
            setSubmitting(false);
        }
    };

    const handleEditAssignment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!assignmentToEdit) return;

        setEditingAssignment(true);
        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
            const response = await fetch(`${baseUrl}/assignments/${assignmentToEdit._id}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(editFormData)
            });

            const data = await response.json();

            if (data.success) {
                setShowEditModal(false);
                setAssignmentToEdit(null);
                setEditFormData({ notes: "", status: "active" });
                fetchData();
            } else {
                alert(data.message || "Failed to update assignment");
            }
        } catch (err: any) {
            alert(err.message || "An error occurred");
        } finally {
            setEditingAssignment(false);
        }
    };

    
    const totalPages = Math.ceil(filteredAssignments.length / 10);
    const startIndex = (currentPage - 1) * 10;
    const endIndex = startIndex + 10;
    const currentAssignments = filteredAssignments.slice(startIndex, endIndex);

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Asset Assignments</h1>
                <p className="text-gray-600 mt-2">Track which assets are assigned to whom</p>
            </div>

            {loading ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
                    <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#76C043]"></div>
                        <p className="ml-3 text-gray-600">Loading assignments...</p>
                    </div>
                </div>
            ) : error ? (
                <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6">
                    <p className="text-red-600">{error}</p>
                </div>
            ) : assignments.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <h3 className="mt-4 text-lg font-medium text-gray-900">No assignments found</h3>
                    <p className="mt-2 text-base text-gray-500">No assets have been assigned yet.</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <p className="text-base text-gray-600">
                                Showing <span className="font-medium text-gray-900">{filteredAssignments.length}</span> of {assignments.length} assignments
                            </p>
                            <button 
                                onClick={() => setShowModal(true)}
                                className="px-4 py-2 bg-[#76C043] text-white text-sm font-medium rounded-lg hover:bg-[#65a83a] transition-colors"
                            >
                                + Assign Asset
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
                                    {[...new Set(assignments.map(a => a.assetId?.category).filter(Boolean))].map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">User</label>
                                <select
                                    value={filters.user}
                                    onChange={(e) => setFilters({...filters, user: e.target.value})}
                                    className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#76C043] focus:border-transparent"
                                >
                                    <option value="">All Users</option>
                                    {users.map(user => (
                                        <option key={user._id} value={user._id}>{user.name}</option>
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
                                    <option value="active">Active</option>
                                    <option value="returned">Returned</option>
                                </select>
                            </div>
                            <div className="flex items-end">
                                <button
                                    onClick={() => setFilters({ category: "", user: "", status: "" })}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Asset</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Assigned To</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Assignment Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Asset Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Assigned Date</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Returned Date</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Notes</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {currentAssignments.map((assignment) => (
                                    <tr key={assignment._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="text-base font-semibold text-gray-900 capitalize">{assignment.assetId?.name || '-'}</div>
                                            <div className="text-xs text-gray-500 capitalize">{assignment.assetId?.brand} {assignment.assetId?.model}</div>
                                            <div className="text-xs text-gray-400 font-mono">{assignment.assetId?.serialNumber}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-base text-gray-700 capitalize">{assignment.assetId?.category || '-'}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-base font-medium text-gray-900 capitalize">{assignment.userId?.name || '-'}</div>
                                            <div className="text-xs text-gray-500">{assignment.userId?.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                                                assignment.status === 'active' ? 'bg-green-100 text-green-700' :
                                                assignment.status === 'returned' ? 'bg-gray-100 text-gray-700' :
                                                'bg-blue-100 text-blue-700'
                                            }`}>
                                                {assignment.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                                                assignment.assetId?.status === 'damage' ? 'bg-red-100 text-red-700' :
                                                assignment.assetId?.status === 'available' ? 'bg-blue-100 text-blue-700' :
                                                assignment.assetId?.status === 'assigned' ? 'bg-green-100 text-green-700' :
                                                'bg-gray-100 text-gray-700'
                                            }`}>
                                                {assignment.assetId?.status || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-base text-gray-600">
                                                {new Date(assignment.assignedDate).toLocaleDateString('en-GB')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-base text-gray-600">
                                                {assignment.returnedDate ? new Date(assignment.returnedDate).toLocaleDateString('en-GB') : '-'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-base text-gray-600 max-w-xs truncate">
                                                {assignment.notes || '-'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() => {
                                                    setAssignmentToEdit(assignment);
                                                    setEditFormData({
                                                        notes: assignment.notes || "",
                                                        status: assignment.status || "active"
                                                    });
                                                    setShowEditModal(true);
                                                }}
                                                className="px-3 py-1.5 text-xs font-medium rounded bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                                            >
                                                ✏️ Edit
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    
                    {/* Pagination */}
                    <div className="mt-6 flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200">
                        <div className="text-sm text-gray-700">
                            Showing <span className="font-semibold">{startIndex + 1}</span> to <span className="font-semibold">{Math.min(endIndex, filteredAssignments.length)}</span> of <span className="font-semibold">{filteredAssignments.length}</span> assignments
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
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">Assign Asset</h2>
                            <button 
                                onClick={() => setShowModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleAssign} className="p-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                                    <select
                                        required
                                        value={formData.category}
                                        onChange={(e) => setFormData({...formData, category: e.target.value, assetId: ""})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#76C043] focus:border-transparent"
                                    >
                                        <option value="">Select a category</option>
                                        {categories.map((cat) => (
                                            <option key={cat} value={cat}>
                                                {cat}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Asset *</label>
                                    <select
                                        required
                                        value={formData.assetId}
                                        onChange={(e) => setFormData({...formData, assetId: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#76C043] focus:border-transparent"
                                        disabled={!formData.category}
                                    >
                                        <option value="">Select an asset</option>
                                        {assets.filter(a => a.category === formData.category).map((asset) => (
                                            <option key={asset._id} value={asset._id}>
                                                {asset.name} - {asset.brand} {asset.model} ({asset.serialNumber})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Assign To *</label>
                                    <select
                                        required
                                        value={formData.userId}
                                        onChange={(e) => setFormData({...formData, userId: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#76C043] focus:border-transparent"
                                    >
                                        <option value="">Select a user</option>
                                        {users.map((user) => (
                                            <option key={user._id} value={user._id}>
                                                {user.name} ({user.email})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                                    <textarea
                                        value={formData.notes}
                                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#76C043] focus:border-transparent"
                                        rows={3}
                                        placeholder="Optional notes..."
                                    />
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
                                    {submitting ? "Assigning..." : "Assign"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showEditModal && assignmentToEdit && (
                <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">Edit Assignment</h2>
                            <button 
                                onClick={() => {
                                    setShowEditModal(false);
                                    setAssignmentToEdit(null);
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleEditAssignment} className="p-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select
                                        value={editFormData.status}
                                        onChange={(e) => setEditFormData({...editFormData, status: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#76C043] focus:border-transparent"
                                    >
                                        <option value="active">Active</option>
                                        <option value="returned">Returned</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                                    <textarea
                                        value={editFormData.notes}
                                        onChange={(e) => setEditFormData({...editFormData, notes: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#76C043] focus:border-transparent"
                                        rows={3}
                                        placeholder="Optional notes..."
                                    />
                                </div>
                            </div>

                            <div className="mt-6 flex gap-3 justify-end">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowEditModal(false);
                                        setAssignmentToEdit(null);
                                    }}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={editingAssignment}
                                    className="px-4 py-2 bg-[#76C043] text-white rounded-lg hover:bg-[#65a83a] transition-colors disabled:opacity-50"
                                >
                                    {editingAssignment ? "Updating..." : "Update"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
