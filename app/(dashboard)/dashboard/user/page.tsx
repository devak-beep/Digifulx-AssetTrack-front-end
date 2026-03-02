"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";

export default function UserDashboard() {
    const { user } = useAuth();
    const [assignments, setAssignments] = useState([]);
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
            
            const [assignRes, complaintRes] = await Promise.all([
                fetch(`${baseUrl}/assignments?userId=${user?.id}`, {
                    headers: { Authorization: `Bearer ${user?.token}` }
                }),
                fetch(`${baseUrl}/complaints/my`, {
                    headers: { Authorization: `Bearer ${user?.token}` }
                })
            ]);

            const assignData = await assignRes.json();
            const complaintData = await complaintRes.json();

            if (assignData.success) setAssignments(assignData.data.filter((a: any) => a.assetId && a.status === 'active'));
            if (complaintData.success) setComplaints(complaintData.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#76C043]"></div></div>;

    const activeComplaints = complaints.filter((c: any) => c.status !== 'completed').length;
    const damagedAssets = assignments.filter((a: any) => a.assetId?.status === 'damage').length;

    return (
        <div className="p-6 space-y-6">
            {/* Welcome Header */}
            <div className="bg-gradient-to-r from-[#76C043] to-[#569130] rounded-2xl p-8 text-white shadow-lg">
                <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}!</h1>
                <p className="text-white/90">Here's an overview of your assigned assets</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                                <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/>
                            </svg>
                        </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">{assignments.length}</h3>
                    <p className="text-sm text-gray-600 mt-1">Total Assets</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                        </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">{assignments.length - damagedAssets}</h3>
                    <p className="text-sm text-gray-600 mt-1">Working Assets</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                            </svg>
                        </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">{damagedAssets}</h3>
                    <p className="text-sm text-gray-600 mt-1">Damaged Assets</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                            </svg>
                        </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">{activeComplaints}</h3>
                    <p className="text-sm text-gray-600 mt-1">Active Complaints</p>
                </div>
            </div>

            {/* My Assets Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                    <h2 className="text-lg font-bold text-gray-900">My Assigned Assets</h2>
                    <p className="text-sm text-gray-600 mt-1">Assets currently assigned to you</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Asset</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Category</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Serial Number</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Assigned Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {assignments.map((assignment: any) => (
                                <tr key={assignment._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-[#76C043] to-[#569130] rounded-lg flex items-center justify-center text-white font-bold">
                                                {assignment.assetId?.name?.charAt(0) || 'A'}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-gray-900">{assignment.assetId?.name}</div>
                                                <div className="text-xs text-gray-500">{assignment.assetId?.brand} {assignment.assetId?.model}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-gray-700">{assignment.assetId?.category}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-mono text-sm text-gray-600">{assignment.assetId?.serialNumber}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                                            assignment.assetId?.status === 'damage' 
                                                ? 'bg-red-100 text-red-700' 
                                                : 'bg-green-100 text-green-700'
                                        }`}>
                                            {assignment.assetId?.status === 'damage' ? 'Damaged' : 'Working'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-gray-600">{new Date(assignment.assignedDate).toLocaleDateString()}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Recent Complaints */}
            {complaints.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                        <h2 className="text-lg font-bold text-gray-900">Recent Complaints</h2>
                        <p className="text-sm text-gray-600 mt-1">Your recent asset complaints</p>
                    </div>
                    <div className="p-6">
                        <div className="space-y-3">
                            {complaints.slice(0, 5).map((complaint: any) => (
                                <div key={complaint._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-2 h-2 rounded-full ${
                                            complaint.status === 'completed' ? 'bg-green-500' :
                                            complaint.status === 'in-progress' ? 'bg-orange-500' :
                                            complaint.status === 'acknowledged' ? 'bg-yellow-500' :
                                            'bg-blue-500'
                                        }`}></div>
                                        <div>
                                            <div className="font-semibold text-gray-900">{complaint.title}</div>
                                            <div className="text-sm text-gray-600">{complaint.assetId?.name}</div>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                        complaint.status === 'completed' ? 'bg-green-100 text-green-700' :
                                        complaint.status === 'in-progress' ? 'bg-orange-100 text-orange-700' :
                                        complaint.status === 'acknowledged' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-blue-100 text-blue-700'
                                    }`}>
                                        {complaint.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
