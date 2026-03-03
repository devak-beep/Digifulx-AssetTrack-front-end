"use client";

import { useAuth } from "@/context/AuthContext";
import { useState } from "react";

export default function SettingsPage() {
    const { user, signOut } = useAuth();
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [emailForm, setEmailForm] = useState({
        newEmail: "",
        password: ""
    });

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!passwordForm.currentPassword) {
            setMessage("Current password is required");
            return;
        }

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setMessage("New passwords do not match");
            return;
        }

        if (passwordForm.newPassword.length < 8) {
            setMessage("Password must be at least 8 characters");
            return;
        }

        if (!/[A-Z]/.test(passwordForm.newPassword)) {
            setMessage("Password must contain at least one uppercase letter");
            return;
        }

        if (!/[0-9]/.test(passwordForm.newPassword)) {
            setMessage("Password must contain at least one number");
            return;
        }

        if (!/[!@#$%^&*(),.?":{}|<>]/.test(passwordForm.newPassword)) {
            setMessage("Password must contain at least one special character");
            return;
        }

        setLoading(true);
        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
            const res = await fetch(`${baseUrl}/auth/change-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${user?.token}`
                },
                body: JSON.stringify({
                    currentPassword: passwordForm.currentPassword,
                    newPassword: passwordForm.newPassword
                })
            });

            const data = await res.json();
            if (data.success) {
                setMessage("Password changed successfully!");
                setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
                setTimeout(() => {
                    setShowPasswordModal(false);
                    setMessage("");
                }, 2000);
            } else {
                setMessage(data.message || "Failed to change password");
            }
        } catch (error: any) {
            setMessage(error.message || "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    const handleChangeEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!emailForm.newEmail.includes("@")) {
            setMessage("Invalid email address");
            return;
        }

        setLoading(true);
        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
            const res = await fetch(`${baseUrl}/auth/change-email`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${user?.token}`
                },
                body: JSON.stringify({
                    newEmail: emailForm.newEmail,
                    password: emailForm.password
                })
            });

            const data = await res.json();
            if (data.success) {
                setMessage("Email changed successfully!");
                setEmailForm({ newEmail: "", password: "" });
                setTimeout(() => {
                    setShowEmailModal(false);
                    setMessage("");
                }, 2000);
            } else {
                setMessage(data.message || "Failed to change email");
            }
        } catch (error: any) {
            setMessage(error.message || "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                <p className="text-gray-600 mt-2">Manage your account and security settings</p>
            </div>

            {/* Profile Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Profile Information</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input
                            type="text"
                            value={user?.name || ""}
                            disabled
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <div className="flex gap-2">
                            <input
                                type="email"
                                value={user?.email || ""}
                                disabled
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                            />
                            <button
                                onClick={() => setShowEmailModal(true)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Change
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                        <input
                            type="text"
                            value={user?.role || ""}
                            disabled
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 capitalize"
                        />
                    </div>
                </div>
            </div>

            {/* Security Settings */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Security</h2>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                            <h3 className="font-medium text-gray-900">Password</h3>
                            <p className="text-sm text-gray-600">Change your password regularly to keep your account secure</p>
                        </div>
                        <button
                            onClick={() => setShowPasswordModal(true)}
                            className="px-4 py-2 bg-[#76C043] text-white rounded-lg hover:bg-[#65a83a] transition-colors"
                        >
                            Change Password
                        </button>
                    </div>
                </div>
            </div>

            {/* Change Password Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">Change Password</h2>
                            <button
                                onClick={() => {
                                    setShowPasswordModal(false);
                                    setMessage("");
                                    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleChangePassword} className="p-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Password *</label>
                                    <input
                                        type="password"
                                        required
                                        value={passwordForm.currentPassword}
                                        onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#76C043] focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password *</label>
                                    <input
                                        type="password"
                                        required
                                        value={passwordForm.newPassword}
                                        onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#76C043] focus:border-transparent"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                        Must be at least 8 characters with one uppercase letter, one number, and one special character
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password *</label>
                                    <input
                                        type="password"
                                        required
                                        value={passwordForm.confirmPassword}
                                        onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#76C043] focus:border-transparent"
                                    />
                                </div>
                                {message && (
                                    <div className={`p-3 rounded-lg text-sm ${message.includes("successfully") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                                        {message}
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 flex gap-3 justify-end">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowPasswordModal(false);
                                        setMessage("");
                                        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
                                    }}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-4 py-2 bg-[#76C043] text-white rounded-lg hover:bg-[#65a83a] transition-colors disabled:opacity-50"
                                >
                                    {loading ? "Updating..." : "Update Password"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Change Email Modal */}
            {showEmailModal && (
                <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">Change Email</h2>
                            <button
                                onClick={() => {
                                    setShowEmailModal(false);
                                    setMessage("");
                                    setEmailForm({ newEmail: "", password: "" });
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleChangeEmail} className="p-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">New Email *</label>
                                    <input
                                        type="email"
                                        required
                                        value={emailForm.newEmail}
                                        onChange={(e) => setEmailForm({...emailForm, newEmail: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Password (for verification) *</label>
                                    <input
                                        type="password"
                                        required
                                        value={emailForm.password}
                                        onChange={(e) => setEmailForm({...emailForm, password: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                                    />
                                </div>
                                {message && (
                                    <div className={`p-3 rounded-lg text-sm ${message.includes("successfully") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                                        {message}
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 flex gap-3 justify-end">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowEmailModal(false);
                                        setMessage("");
                                        setEmailForm({ newEmail: "", password: "" });
                                    }}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                >
                                    {loading ? "Updating..." : "Update Email"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
