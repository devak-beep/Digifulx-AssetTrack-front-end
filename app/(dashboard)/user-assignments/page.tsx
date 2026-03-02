"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function UserAssignmentsPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.role !== "User") {
            router.push("/assignments");
            return;
        }
        fetchMyAssignments();
    }, [user]);

    const fetchMyAssignments = async () => {
        if (!user?.id) return;
        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
            const res = await fetch(`${baseUrl}/assignments?userId=${user.id}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            const data = await res.json();
            if (data.success) setAssignments(data.data.data || data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-6">Loading...</div>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">My Assignments</h1>

            <div className="bg-white rounded-lg shadow">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Asset Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Serial Number</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assignment Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Asset Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Return Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {assignments.filter((a: any) => a.assetId).map((assignment: any) => (
                                <tr key={assignment._id}>
                                    <td className="px-6 py-4">{assignment.assetId?.name}</td>
                                    <td className="px-6 py-4">{assignment.assetId?.serialNumber}</td>
                                    <td className="px-6 py-4">{assignment.assetId?.category}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs capitalize ${
                                            assignment.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                        }`}>
                                            {assignment.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs ${
                                            assignment.assetId?.status === 'damage' ? 'bg-red-100 text-red-800' :
                                            assignment.assetId?.status === 'available' ? 'bg-blue-100 text-blue-800' :
                                            assignment.assetId?.status === 'assigned' ? 'bg-green-100 text-green-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                            {assignment.assetId?.status || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">{new Date(assignment.assignedDate).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">{assignment.returnDate ? new Date(assignment.returnDate).toLocaleDateString() : '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
