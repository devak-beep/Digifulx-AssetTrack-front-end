"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";

interface Maintenance {
    _id: string;
    assetId: {
        _id: string;
        name: string;
        brand: string;
        model: string;
        serialNumber: string;
    } | null;
    type: string;
    frequency: string;
    serviceDate: string;
    nextDate: string;
    status: string;
    description?: string;
    cost: number;
}

interface Asset {
    _id: string;
    name: string;
    brand: string;
    model: string;
    serialNumber: string;
}

export default function MaintenancePage() {
    const { token } = useAuth();
    const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
    const [assets, setAssets] = useState<Asset[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [showCompleteModal, setShowCompleteModal] = useState(false);
    const [selectedMaintenance, setSelectedMaintenance] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        assetId: "",
        type: "preventive",
        frequency: "monthly",
        serviceDate: "",
        description: "",
        cost: ""
    });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const calculateNextServiceDate = (lastDate: string, frequency: string): string => {
        if (!lastDate) return "";
        
        const date = new Date(lastDate);
        
        switch (frequency) {
            case 'weekly':
                date.setDate(date.getDate() + 7);
                break;
            case 'monthly':
                date.setMonth(date.getMonth() + 1);
                break;
            case 'quarterly':
                date.setMonth(date.getMonth() + 3);
                break;
            case 'yearly':
                date.setFullYear(date.getFullYear() + 1);
                break;
            case 'one-time':
                return "";
        }
        
        return date.toISOString().split('T')[0];
    };

    useEffect(() => {
        fetchData();
    }, [token]);

    const fetchData = async () => {
        if (!token) return;
        
        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
            
            const [maintenanceRes, assetsRes] = await Promise.all([
                fetch(`${baseUrl}/maintenance?t=${Date.now()}`, {
                    headers: { 
                        "Authorization": `Bearer ${token}`,
                        "Cache-Control": "no-cache, no-store, must-revalidate"
                    },
                    cache: 'no-store'
                }),
                fetch(`${baseUrl}/assets?limit=1000&t=${Date.now()}`, {
                    headers: { 
                        "Authorization": `Bearer ${token}`,
                        "Cache-Control": "no-cache, no-store, must-revalidate"
                    },
                    cache: 'no-store'
                })
            ]);

            const [maintenanceData, assetsData] = await Promise.all([
                maintenanceRes.json(),
                assetsRes.json()
            ]);

            if (maintenanceData.success) {
                console.log('Maintenance data:', maintenanceData.data);
                const maintenanceArray = maintenanceData.data.data || maintenanceData.data || [];
                console.log('First record assetId:', maintenanceArray[0]?.assetId);
                setMaintenances(maintenanceArray);
            }
            if (assetsData.success) {
                console.log('Assets loaded:', assetsData.data.assets);
                const assetData = assetsData.data?.assets || assetsData.data || [];
                setAssets(Array.isArray(assetData) ? assetData : []);
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
            
            const response = await fetch(`${baseUrl}/maintenance`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    ...formData,
                    cost: parseFloat(formData.cost) || 0
                })
            });

            const data = await response.json();

            if (data.success) {
                setShowModal(false);
                setFormData({
                    assetId: "",
                    type: "preventive",
                    frequency: "monthly",
                    serviceDate: "",
                    description: "",
                    cost: ""
                });
                fetchData();
            } else {
                alert(data.message || "Failed to create maintenance");
            }
        } catch (err: any) {
            alert(err.message || "An error occurred");
        } finally {
            setSubmitting(false);
        }
    };

    const markAsCompleted = async () => {
        if (!selectedMaintenance) return;

        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
            const response = await fetch(`${baseUrl}/maintenance/${selectedMaintenance}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ status: "completed" })
            });

            const data = await response.json();

            if (data.success) {
                setShowCompleteModal(false);
                setSelectedMaintenance(null);
                fetchData();
            } else {
                alert(data.message || "Failed to update maintenance");
            }
        } catch (err: any) {
            alert(err.message || "An error occurred");
        }
    };

    const handleCompleteClick = (id: string) => {
        console.log('Mark Complete clicked for:', id);
        setSelectedMaintenance(id);
        setShowCompleteModal(true);
        console.log('Modal should show now');
    };

    
    const totalPages = maintenances.length > 0 ? Math.ceil(maintenances.length / itemsPerPage) : 1;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentMaintenance = maintenances.slice(startIndex, endIndex);

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Maintenance</h1>
                <p className="text-gray-600 mt-2">Schedule and track asset maintenance</p>
            </div>

            {loading ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
                    <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#76C043]"></div>
                        <p className="ml-3 text-gray-600">Loading maintenance records...</p>
                    </div>
                </div>
            ) : maintenances.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <h3 className="mt-4 text-lg font-medium text-gray-900">No maintenance records</h3>
                    <p className="mt-2 text-base text-gray-500">Schedule maintenance for your assets.</p>
                    <button 
                        onClick={() => setShowModal(true)}
                        className="mt-4 px-4 py-2 bg-[#76C043] text-white text-sm font-medium rounded-lg hover:bg-[#65a83a] transition-colors"
                    >
                        + Schedule Maintenance
                    </button>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <p className="text-base text-gray-600">
                                Total <span className="font-medium text-gray-900">{maintenances.length}</span> maintenance records
                            </p>
                            <button 
                                onClick={() => setShowModal(true)}
                                className="px-4 py-2 bg-[#76C043] text-white text-sm font-medium rounded-lg hover:bg-[#65a83a] transition-colors"
                            >
                                + Schedule Maintenance
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Asset</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Frequency</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Last Date</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Next Date</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Cost</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {maintenances.map((maintenance) => (
                                    <tr key={maintenance._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="text-base font-semibold text-gray-900">{maintenance.assetId?.name || '-'}</div>
                                            <div className="text-xs text-gray-500">{maintenance.assetId?.brand} {maintenance.assetId?.model}</div>
                                            <div className="text-xs text-gray-400 font-mono">{maintenance.assetId?.serialNumber}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-base text-gray-700 capitalize">{maintenance.type}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-base text-gray-700 capitalize">{maintenance.frequency}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-base text-gray-600">
                                                {maintenance.serviceDate ? new Date(maintenance.serviceDate).toLocaleDateString('en-GB') : '-'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-base text-gray-600">
                                                {maintenance.nextDate ? new Date(maintenance.nextDate).toLocaleDateString('en-GB') : '-'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                                                maintenance.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                maintenance.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                maintenance.status === 'overdue' ? 'bg-red-100 text-red-700' :
                                                'bg-gray-100 text-gray-700'
                                            }`}>
                                                {maintenance.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-base font-medium text-gray-900">₹{maintenance.cost?.toLocaleString('en-IN') || '0'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {maintenance.status === 'pending' && (
                                                <button
                                                    onClick={() => handleCompleteClick(maintenance._id)}
                                                    className="px-3 py-1 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 transition-colors"
                                                >
                                                    Mark Complete
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    
                        {/* Pagination */}
                        <div className="mt-6 flex items-center justify-between px-6 py-4 bg-gray-50 border-t">
                            <div className="text-sm text-gray-700">
                                Showing <span className="font-semibold">{startIndex + 1}</span> to <span className="font-semibold">{Math.min(endIndex, maintenances.length)}</span> of <span className="font-semibold">{maintenances.length}</span> items
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
            )}

            {showModal && (
                <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">Schedule Maintenance</h2>
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
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Asset *</label>
                                    <select
                                        required
                                        value={formData.assetId}
                                        onChange={(e) => setFormData({...formData, assetId: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#76C043] focus:border-transparent"
                                    >
                                        <option value="">Select an asset</option>
                                        {assets.map((asset) => (
                                            <option key={asset._id} value={asset._id}>
                                                {asset.name} - {asset.brand} {asset.model}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                                    <select
                                        required
                                        value={formData.type}
                                        onChange={(e) => setFormData({...formData, type: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#76C043] focus:border-transparent"
                                    >
                                        <option value="preventive">Preventive</option>
                                        <option value="corrective">Corrective</option>
                                        <option value="inspection">Inspection</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Frequency *</label>
                                    <select
                                        required
                                        value={formData.frequency}
                                        onChange={(e) => setFormData({...formData, frequency: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#76C043] focus:border-transparent"
                                    >
                                        <option value="weekly">Weekly</option>
                                        <option value="monthly">Monthly</option>
                                        <option value="quarterly">Quarterly</option>
                                        <option value="yearly">Yearly</option>
                                        <option value="one-time">One-time</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Service Date *</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.serviceDate}
                                        onChange={(e) => setFormData({...formData, serviceDate: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#76C043] focus:border-transparent"
                                    />
                                </div>

                                {formData.serviceDate && formData.frequency !== 'one-time' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Next Service Date</label>
                                        <input
                                            type="date"
                                            value={calculateNextServiceDate(formData.serviceDate, formData.frequency)}
                                            disabled
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                                        />
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Cost</label>
                                    <input
                                        type="number"
                                        value={formData.cost}
                                        onChange={(e) => setFormData({...formData, cost: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#76C043] focus:border-transparent"
                                        placeholder="0.00"
                                        step="0.01"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#76C043] focus:border-transparent"
                                        rows={3}
                                        placeholder="Optional description..."
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
                                    {submitting ? "Scheduling..." : "Schedule"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showCompleteModal && (
                <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-900">Mark as Complete</h2>
                        </div>

                        <div className="p-6">
                            <p className="text-gray-700">Are you sure you want to mark this maintenance as completed?</p>
                        </div>

                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3 justify-end">
                            <button
                                onClick={() => {
                                    setShowCompleteModal(false);
                                    setSelectedMaintenance(null);
                                }}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={markAsCompleted}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                                Mark Complete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
