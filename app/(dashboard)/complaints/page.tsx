"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState, useCallback } from "react";

interface Asset {
    _id: string;
    name: string;
    serialNumber: string;
    status?: string;
}

interface Assignment {
    _id: string;
    assetId: Asset | null;
    status: string;
}

interface Complaint {
    _id: string;
    ticketId: string;
    title: string;
    description: string;
    priority: "low" | "medium" | "high" | "critical";
    status: "new" | "acknowledged" | "in-progress" | "completed";
    assetId: {
        _id: string;
        name: string;
        serialNumber: string;
        status?: string;
    } | null;
    userId: {
        _id: string;
        name: string;
    } | null;
    createdAt: string;
    updatedAt: string;
}

export default function ComplaintsPage() {
    const { user } = useAuth();
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [filters, setFilters] = useState({
        priority: "",
        status: ""
    });
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [selectedComplaint, setSelectedComplaint] = useState<string | null>(null);
    const [selectedStatus, setSelectedStatus] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [complaintToEdit, setComplaintToEdit] = useState<any | null>(null);
    const [complaintToView, setComplaintToView] = useState<any | null>(null);
    const [editFormData, setEditFormData] = useState({
        title: "",
        description: "",
        priority: "medium"
    });
    const [editingComplaint, setEditingComplaint] = useState(false);
    const [formData, setFormData] = useState({
        assetId: "",
        title: "",
        description: "",
        priority: "medium"
    });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const isAdmin = user?.role === "Admin" || user?.role === "Superadmin";

    const fetchComplaints = useCallback(async () => {
        if (!user?.token) return;
        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
            const endpoint = (user?.role === "Admin" || user?.role === "Superadmin") ? "/complaints?limit=1000" : "/complaints/my?limit=1000";
            const res = await fetch(`${baseUrl}${endpoint}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            if (data.success) {
                const complaintData = data.data?.data || data.data || [];
                setComplaints(Array.isArray(complaintData) ? complaintData : []);
            }
        } catch (error) {
            console.error("Fetch complaints error:", error);
            setComplaints([]);
        } finally {
            setLoading(false);
        }
    }, [user?.token, user?.role]);

    const fetchMyAssignments = useCallback(async () => {
        if (!user?.id) return;
        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
            const res = await fetch(`${baseUrl}/assignments?userId=${user.id}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            if (data.success) {
                const assignmentsData = data.data.data || data.data || [];
                const activeComplaints = complaints.filter((c: any) => c.status !== 'completed').map((c: any) => c.assetId?._id || c.assetId);
                setAssignments(assignmentsData.filter((a: any) => 
                    a.status === 'active' && 
                    a.assetId?.status !== 'damage' &&
                    !activeComplaints.includes(a.assetId?._id)
                ));
            }
        } catch (error) {
            console.error("Fetch assignments error:", error);
        }
    }, [user?.id, user?.token, complaints]);

    useEffect(() => {
        if (user?.token) fetchComplaints();
    }, [user?.token, fetchComplaints]);

    useEffect(() => {
        if (!isAdmin && complaints.length >= 0 && user?.id) fetchMyAssignments();
    }, [complaints, user?.id, isAdmin, fetchMyAssignments]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
            
            const res = await fetch(`${baseUrl}/complaints`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${user?.token}`
                },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            
            if (data.success) {
                setShowModal(false);
                setFormData({ assetId: "", title: "", description: "", priority: "medium" });
                fetchComplaints();
                fetchMyAssignments();
            } else {
                alert(data.message || 'Failed to create complaint');
            }
        } catch (error) {
            console.error(error);
            alert('Error creating complaint');
        }
    };

    const updateStatus = async (id: string, status: string) => {
        setSelectedComplaint(id);
        setSelectedStatus(status);
        setShowConfirmModal(true);
    };

    const confirmStatusChange = async () => {
        if (!selectedComplaint || !selectedStatus) return;

        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
            const res = await fetch(`${baseUrl}/complaints/${selectedComplaint}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${user?.token}`
                },
                body: JSON.stringify({ status: selectedStatus })
            });
            const data = await res.json();
            
            if (data.success) {
                fetchComplaints();
                setShowConfirmModal(false);
                setSelectedComplaint(null);
                setSelectedStatus("");
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleEditComplaint = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!complaintToEdit) return;

        setEditingComplaint(true);
        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
            const res = await fetch(`${baseUrl}/complaints/${complaintToEdit._id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${user?.token}`
                },
                body: JSON.stringify(editFormData)
            });
            const data = await res.json();
            
            if (data.success) {
                setShowEditModal(false);
                setComplaintToEdit(null);
                setEditFormData({ title: "", description: "", priority: "medium" });
                fetchComplaints();
            } else {
                alert(data.message || 'Failed to update complaint');
            }
        } catch (error) {
            console.error(error);
            alert('Error updating complaint');
        } finally {
            setEditingComplaint(false);
        }
    };

    const getStatusColor = (status: string) => {
        const colors: any = {
            new: "bg-blue-100 text-blue-800",
            acknowledged: "bg-yellow-100 text-yellow-800",
            "in-progress": "bg-orange-100 text-orange-800",
            completed: "bg-green-100 text-green-800"
        };
        return colors[status] || "bg-gray-100 text-gray-800";
    };

    const getStatusLabel = (status: string) => {
        const labels: any = {
            acknowledged: "Acknowledge",
            "in-progress": "Start Progress",
            completed: "Complete"
        };
        return labels[status] || status;
    };

    const getPriorityColor = (priority: string) => {
        const colors: any = {
            low: "bg-gray-100 text-gray-800",
            medium: "bg-blue-100 text-blue-800",
            high: "bg-orange-100 text-orange-800",
            critical: "bg-red-100 text-red-800"
        };
        return colors[priority] || "bg-gray-100 text-gray-800";
    };

    const filteredComplaints = complaints.filter(c => {
        const matchesSearch = c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.assetId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.userId?.name?.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesPriority = !filters.priority || c.priority === filters.priority;
        const matchesStatus = !filters.status || c.status === filters.status;
        
        return matchesSearch && matchesPriority && matchesStatus;
    });
    const totalPages = filteredComplaints.length > 0 ? Math.ceil(filteredComplaints.length / itemsPerPage) : 1;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentComplaints = filteredComplaints.slice(startIndex, endIndex);

    if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#76C043]"></div></div>;

    return (
        <div className="min-h-screen">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-5 sticky top-0 z-10 shadow-sm">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#76C043] to-[#569130] flex items-center justify-center text-white shadow-lg">
                            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21.73 18l-8-14a2 2 0 00-3.48 0l-8 14A2 2 0 004 21h16a2 2 0 001.73-3z"/>
                                <line x1="12" y1="9" x2="12" y2="13"/>
                                <line x1="12" y1="17" x2="12.01" y2="17"/>
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Complaints</h1>
                            <p className="text-sm text-gray-600 mt-0.5">{isAdmin ? "Manage all asset complaints" : "Report and track asset issues"}</p>
                        </div>
                    </div>
                    {!isAdmin && (
                        <button
                            onClick={() => setShowModal(true)}
                            className="px-5 py-2.5 bg-gradient-to-r from-[#76C043] to-[#569130] text-white rounded-lg hover:shadow-lg transition-all font-medium flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
                            </svg>
                            New Complaint
                        </button>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                        <div className="mb-4">
                            <input
                                type="text"
                                placeholder="Search by title, description, asset, or user name..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#76C043] focus:border-transparent"
                            />
                        </div>
                        <div className="flex gap-3">
                            <select
                                value={filters.priority}
                                onChange={(e) => {
                                    setFilters({...filters, priority: e.target.value});
                                    setCurrentPage(1);
                                }}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#76C043] focus:border-transparent text-sm"
                            >
                                <option value="">All Priorities</option>
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                            <select
                                value={filters.status}
                                onChange={(e) => {
                                    setFilters({...filters, status: e.target.value});
                                    setCurrentPage(1);
                                }}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#76C043] focus:border-transparent text-sm"
                            >
                                <option value="">All Status</option>
                                <option value="new">New</option>
                                <option value="acknowledged">Acknowledged</option>
                                <option value="in-progress">In Progress</option>
                                <option value="completed">Completed</option>
                            </select>
                            {(filters.priority || filters.status) && (
                                <button
                                    onClick={() => {
                                        setFilters({priority: "", status: ""});
                                        setCurrentPage(1);
                                    }}
                                    className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 font-medium"
                                >
                                    Clear Filters
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Ticket ID</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Asset</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Title</th>
                                    {isAdmin && <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">User</th>}
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Priority</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Created</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                    <tbody className="divide-y divide-gray-100">
                        {currentComplaints.filter((c: any) => c.assetId && c.userId).map((complaint: any) => (
                            <tr key={complaint._id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <span className="font-mono text-sm font-semibold text-[#76C043]">{complaint.ticketId}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-sm font-medium text-gray-900 capitalize">{complaint.assetId?.name || 'N/A'}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-sm text-gray-700 capitalize">{complaint.title}</span>
                                </td>
                                {isAdmin && (
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-gray-700 capitalize">{complaint.userId?.name || 'N/A'}</span>
                                    </td>
                                )}
                                <td className="px-6 py-4">
                                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold capitalize ${getPriorityColor(complaint.priority)}`}>
                                        {complaint.priority}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(complaint.status)}`}>
                                        {complaint.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-sm text-gray-600">{new Date(complaint.createdAt).toLocaleDateString()}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => {
                                                setComplaintToView(complaint);
                                                setShowViewModal(true);
                                            }}
                                            className="text-sm font-medium text-green-600 hover:text-green-800 hover:underline"
                                        >
                                            View
                                        </button>
                                        {!isAdmin && complaint.status === 'new' && (
                                            <button
                                                onClick={() => {
                                                    setComplaintToEdit(complaint);
                                                    setEditFormData({
                                                        title: complaint.title,
                                                        description: complaint.description,
                                                        priority: complaint.priority
                                                    });
                                                    setShowEditModal(true);
                                                }}
                                                className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
                                            >
                                                Edit
                                            </button>
                                        )}
                                        {isAdmin && (
                                            <>
                                        {complaint.status === 'new' && (
                                            <button
                                                onClick={() => updateStatus(complaint._id, 'acknowledged')}
                                                className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
                                            >
                                                Acknowledge
                                            </button>
                                        )}
                                        {complaint.status === 'acknowledged' && (
                                            <button
                                                onClick={() => updateStatus(complaint._id, 'in-progress')}
                                                className="text-sm font-medium text-orange-600 hover:text-orange-800 hover:underline"
                                            >
                                                Start Progress
                                            </button>
                                        )}
                                        {complaint.status === 'in-progress' && (
                                            <button
                                                onClick={() => updateStatus(complaint._id, 'completed')}
                                                className="text-sm font-medium text-green-600 hover:text-green-800 hover:underline"
                                            >
                                                Complete
                                            </button>
                                        )}
                                        {complaint.status === 'completed' && (
                                            <span className="text-sm text-gray-400 italic">Completed</span>
                                        )}
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                        </table>
                    
                        {/* Pagination */}
                        <div className="mt-6 flex items-center justify-between px-6 py-4 bg-gray-50 border-t">
                            <div className="text-sm text-gray-700">
                                Showing <span className="font-semibold">{startIndex + 1}</span> to <span className="font-semibold">{Math.min(endIndex, filteredComplaints.length)}</span> of <span className="font-semibold">{filteredComplaints.length}</span> items
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Previous
                                </button>
                                <span className="text-sm">Page {currentPage} of {totalPages}</span>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
</div>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
                        <div className="bg-gradient-to-r from-[#76C043] to-[#569130] px-6 py-4 rounded-t-2xl">
                            <h2 className="text-xl font-bold text-white">New Complaint</h2>
                            <p className="text-white/80 text-sm mt-1">Report an issue with your assigned asset</p>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="mb-5">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Asset *</label>
                                <select
                                    value={formData.assetId}
                                    onChange={(e) => setFormData({ ...formData, assetId: e.target.value })}
                                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 focus:border-[#76C043] focus:ring-2 focus:ring-[#76C043]/20 outline-none transition-all"
                                    required
                                >
                                    <option value="">Select Asset</option>
                                    {assignments.filter((a: Assignment) => a.assetId).map((a: Assignment) => (
                                        <option key={a._id} value={a.assetId?._id}>
                                            {a.assetId?.name || 'Unknown'} - {a.assetId?.serialNumber || 'N/A'}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-5">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Title *</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 focus:border-[#76C043] focus:ring-2 focus:ring-[#76C043]/20 outline-none transition-all"
                                    placeholder="Brief description of the issue"
                                    required
                                />
                            </div>
                            <div className="mb-5">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 focus:border-[#76C043] focus:ring-2 focus:ring-[#76C043]/20 outline-none transition-all resize-none"
                                    rows={4}
                                    placeholder="Provide detailed information about the issue"
                                    required
                                />
                            </div>
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Priority</label>
                                <select
                                    value={formData.priority}
                                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 focus:border-[#76C043] focus:ring-2 focus:ring-[#76C043]/20 outline-none transition-all"
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                    <option value="critical">Critical</option>
                                </select>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    className="flex-1 bg-gradient-to-r from-[#76C043] to-[#569130] text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
                                >
                                    Submit Complaint
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showConfirmModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
                        <div className="p-6">
                            <div className="flex items-center gap-4 mb-4">
                                <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg ${
                                    selectedStatus === 'completed' ? 'bg-gradient-to-br from-green-400 to-green-600' :
                                    selectedStatus === 'in-progress' ? 'bg-gradient-to-br from-orange-400 to-orange-600' :
                                    selectedStatus === 'acknowledged' ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                                    'bg-gradient-to-br from-blue-400 to-blue-600'
                                }`}>
                                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Confirm Status Change</h2>
                                    <p className="text-base text-gray-500 mt-0.5">Update complaint status</p>
                                </div>
                            </div>
                            <p className="text-gray-600 mb-6 leading-relaxed">
                                Are you sure you want to change the status to <span className="font-semibold capitalize">{getStatusLabel(selectedStatus)}</span>?
                                {selectedStatus === 'completed' && ' The asset status will be restored and this action cannot be undone.'}
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={confirmStatusChange}
                                    className={`flex-1 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all ${
                                        selectedStatus === 'completed' ? 'bg-gradient-to-r from-green-500 to-green-600' :
                                        selectedStatus === 'in-progress' ? 'bg-gradient-to-r from-orange-500 to-orange-600' :
                                        selectedStatus === 'acknowledged' ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                                        'bg-gradient-to-r from-blue-500 to-blue-600'
                                    }`}
                                >
                                    Confirm
                                </button>
                                <button
                                    onClick={() => {
                                        setShowConfirmModal(false);
                                        setSelectedComplaint(null);
                                        setSelectedStatus("");
                                    }}
                                    className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showEditModal && complaintToEdit && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">Edit Complaint</h2>
                            <button 
                                onClick={() => {
                                    setShowEditModal(false);
                                    setComplaintToEdit(null);
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleEditComplaint} className="p-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                                    <input
                                        type="text"
                                        required
                                        value={editFormData.title}
                                        onChange={(e) => setEditFormData({...editFormData, title: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#76C043] focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                                    <textarea
                                        required
                                        value={editFormData.description}
                                        onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#76C043] focus:border-transparent"
                                        rows={4}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority *</label>
                                    <select
                                        required
                                        value={editFormData.priority}
                                        onChange={(e) => setEditFormData({...editFormData, priority: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#76C043] focus:border-transparent"
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="critical">Critical</option>
                                    </select>
                                </div>
                            </div>

                            <div className="mt-6 flex gap-3 justify-end">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowEditModal(false);
                                        setComplaintToEdit(null);
                                    }}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={editingComplaint}
                                    className="px-4 py-2 bg-[#76C043] text-white rounded-lg hover:bg-[#65a83a] transition-colors disabled:opacity-50"
                                >
                                    {editingComplaint ? "Updating..." : "Update"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showViewModal && complaintToView ? (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">Complaint Details</h2>
                            <button
                                onClick={() => setShowViewModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ticket ID</label>
                                <p className="text-base text-gray-900 font-mono">{complaintToView.ticketId}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <p className="text-base text-gray-900">{complaintToView.title}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <p className="text-base text-gray-700 whitespace-pre-wrap">{complaintToView.description}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                                        complaintToView.priority === 'high' ? 'bg-red-100 text-red-700' :
                                        complaintToView.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-green-100 text-green-700'
                                    }`}>
                                        {complaintToView.priority}
                                    </span>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold capitalize bg-blue-100 text-blue-700">
                                        {complaintToView.status}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Asset</label>
                                <p className="text-base text-gray-900">{complaintToView.assetId?.name || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Created Date</label>
                                <p className="text-base text-gray-900">{new Date(complaintToView.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
                            <button
                                onClick={() => setShowViewModal(false)}
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
