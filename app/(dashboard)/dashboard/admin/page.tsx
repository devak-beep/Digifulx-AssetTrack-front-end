"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

export default function AdminDashboard() {
    const { user } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState({
        totalAssets: 0,
        totalUsers: 0,
        activeAssignments: 0,
        pendingComplaints: 0,
        availableAssets: 0,
        damagedAssets: 0
    });
    const [categoryData, setCategoryData] = useState<any[]>([]);
    const [assignmentData, setAssignmentData] = useState<any[]>([]);
    const [maintenanceData, setMaintenanceData] = useState<any[]>([]);
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
            
            const [assetsRes, usersRes, assignmentsRes, complaintsRes, maintenanceRes] = await Promise.all([
                fetch(`${baseUrl}/assets`, { headers: { Authorization: `Bearer ${user?.token}` } }),
                fetch(`${baseUrl}/users`, { headers: { Authorization: `Bearer ${user?.token}` } }),
                fetch(`${baseUrl}/assignments`, { headers: { Authorization: `Bearer ${user?.token}` } }),
                fetch(`${baseUrl}/complaints`, { headers: { Authorization: `Bearer ${user?.token}` } }),
                fetch(`${baseUrl}/maintenance`, { headers: { Authorization: `Bearer ${user?.token}` } })
            ]);

            const assets = await assetsRes.json();
            const users = await usersRes.json();
            const assignments = await assignmentsRes.json();
            const complaints = await complaintsRes.json();
            const maintenance = await maintenanceRes.json();

            if (assets.success && users.success && assignments.success && complaints.success) {
                const assetsList = assets.data.assets || [];
                const assignmentsList = Array.isArray(assignments.data) ? assignments.data : (assignments.data?.data || []);
                const complaintsList = Array.isArray(complaints.data) ? complaints.data : (complaints.data?.data || []);
                const usersList = Array.isArray(users.data) ? users.data : (users.data?.data || []);
                const maintenanceList = Array.isArray(maintenance.data) ? maintenance.data : (maintenance.data?.data || []);
                
                setStats({
                    totalAssets: assetsList.length,
                    totalUsers: usersList.length,
                    activeAssignments: assignmentsList.filter((a: any) => a.status === 'active').length,
                    pendingComplaints: complaintsList.filter((c: any) => c.status !== 'completed').length,
                    availableAssets: assetsList.filter((a: any) => a.status === 'available').length,
                    damagedAssets: assetsList.filter((a: any) => a.status === 'damage').length
                });

                // Product distribution data (by product name)
                const productCount: any = {};
                assetsList.forEach((asset: any) => {
                    const product = (asset.name || `${asset.brand} ${asset.model}`).trim();
                    productCount[product] = (productCount[product] || 0) + 1;
                });
                console.log('Product Count:', productCount);
                console.log('Total Assets:', assetsList.length);
                console.log('Sample Assets:', assetsList.slice(0, 5).map((a: any) => ({ name: a.name, brand: a.brand, model: a.model })));
                const productChartData = Object.entries(productCount)
                    .map(([name, count]) => ({ name, count }))
                    .sort((a: any, b: any) => b.count - a.count)
                    .slice(0, 8); // Show top 8 products
                setCategoryData(productChartData);

                // Assignment data for pie chart
                const assigned = assignmentsList.filter((a: any) => a.status === 'active').length;
                const available = assetsList.filter((a: any) => a.status === 'available').length;
                setAssignmentData([
                    { name: 'Assigned', value: assigned },
                    { name: 'Available', value: available }
                ]);

                // Maintenance cost data (last 12 months)
                const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                const costByMonth: any = {};
                maintenanceList.forEach((m: any) => {
                    if (m.cost && m.lastMaintenanceDate) {
                        const month = new Date(m.lastMaintenanceDate).getMonth();
                        const monthName = monthNames[month];
                        costByMonth[monthName] = (costByMonth[monthName] || 0) + (m.cost || 0);
                    }
                });
                setMaintenanceData(monthNames.map(month => ({ month, cost: costByMonth[month] || 0 })));

                // Recent activity
                const recent = [
                    ...complaintsList.slice(0, 3).map((c: any) => ({
                        type: 'complaint',
                        title: `New complaint: ${c.title}`,
                        time: c.createdAt,
                        user: c.userId?.name
                    })),
                    ...assignmentsList.slice(0, 2).map((a: any) => ({
                        type: 'assignment',
                        title: `Asset assigned: ${a.assetId?.name}`,
                        time: a.assignedDate,
                        user: a.userId?.name
                    }))
                ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5);

                setRecentActivity(recent);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#76C043]"></div></div>;

    return (
        <div className="p-6 space-y-6">
            {/* Welcome Header */}
            <div className="bg-gradient-to-r from-[#76C043] to-[#569130] rounded-2xl p-8 text-white shadow-lg">
                <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
                <p className="text-white/90">Welcome back, {user?.name}! Here's your system overview</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/assets')}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                                <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/>
                            </svg>
                        </div>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900">{stats.totalAssets}</h3>
                    <p className="text-sm text-gray-600 mt-1">Total Assets</p>
                    <div className="mt-3 flex items-center text-xs text-green-600">
                        <span>{stats.availableAssets} available</span>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/users')}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                            </svg>
                        </div>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900">{stats.totalUsers}</h3>
                    <p className="text-sm text-gray-600 mt-1">Total Users</p>
                    <div className="mt-3 flex items-center text-xs text-gray-500">
                        <span>Manage user accounts</span>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/assignments')}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
                            </svg>
                        </div>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900">{stats.activeAssignments}</h3>
                    <p className="text-sm text-gray-600 mt-1">Active Assignments</p>
                    <div className="mt-3 flex items-center text-xs text-green-600">
                        <span>Currently assigned</span>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/complaints')}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                            </svg>
                        </div>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900">{stats.pendingComplaints}</h3>
                    <p className="text-sm text-gray-600 mt-1">Pending Complaints</p>
                    <div className="mt-3 flex items-center text-xs text-orange-600">
                        <span>Requires attention</span>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                        </div>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900">{stats.damagedAssets}</h3>
                    <p className="text-sm text-gray-600 mt-1">Damaged Assets</p>
                    <div className="mt-3 flex items-center text-xs text-red-600">
                        <span>Needs repair</span>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-[#76C043] to-[#569130] rounded-xl p-6 shadow-lg text-white">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                            </svg>
                        </div>
                    </div>
                    <h3 className="text-3xl font-bold">{((stats.activeAssignments / stats.totalAssets) * 100 || 0).toFixed(0)}%</h3>
                    <p className="text-sm text-white/90 mt-1">Asset Utilization</p>
                    <div className="mt-3 flex items-center text-xs text-white/80">
                        <span>Assets in use</span>
                    </div>
                </div>
            </div>

            {/* Asset Insights - Charts Section */}
            <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900">Asset Insights</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Product Distribution */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">Product Distribution</h3>
                        <p className="text-sm text-gray-600 mb-4">Top products in inventory</p>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={categoryData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={100} />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip />
                                <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Assigned vs Available Assets */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">Assigned vs. Available Assets</h3>
                        <p className="text-sm text-gray-600 mb-4">Current status of asset assignment</p>
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={assignmentData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    <Cell fill="#3b82f6" />
                                    <Cell fill="#6b7280" />
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Monthly Maintenance Cost */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">Monthly Maintenance Cost</h3>
                        <p className="text-sm text-gray-600 mb-4">Total cost of maintenance activities over time</p>
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={maintenanceData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip />
                                <Line type="monotone" dataKey="cost" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                    <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
                    <p className="text-sm text-gray-600 mt-1">Latest system activities</p>
                </div>
                <div className="p-6">
                    <div className="space-y-4">
                        {recentActivity.map((activity: any, index) => (
                            <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                    activity.type === 'complaint' ? 'bg-orange-100' : 'bg-green-100'
                                }`}>
                                    {activity.type === 'complaint' ? (
                                        <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                        </svg>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="font-semibold text-gray-900">{activity.title}</div>
                                    <div className="text-sm text-gray-600 mt-1">By {activity.user}</div>
                                </div>
                                <div className="text-xs text-gray-500">
                                    {new Date(activity.time).toLocaleDateString()}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <button onClick={() => router.push('/assets')} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all text-left group">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
                        </svg>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-1">Add New Asset</h3>
                    <p className="text-sm text-gray-600">Register a new asset in the system</p>
                </button>

                <button onClick={() => router.push('/users')} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all text-left group">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
                        </svg>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-1">Add New User</h3>
                    <p className="text-sm text-gray-600">Create a new user account</p>
                </button>

                <button onClick={() => router.push('/assignments')} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all text-left group">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                        </svg>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-1">Assign Asset</h3>
                    <p className="text-sm text-gray-600">Assign an asset to a user</p>
                </button>
            </div>
        </div>
    );
}
