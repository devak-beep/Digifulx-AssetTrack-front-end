"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ROLE_PERMISSIONS } from "@/lib/rolePermissions";
import Logo from "@/components/Logo";

export default function Sidebar() {
    const { user, signOut } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    if (!user) return null;

    const handleSignOut = () => {
        signOut();
        router.push("/sign-in");
    };

    return (
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0 shadow-sm">
            {/* Logo */}
            <div className="px-6 py-5 border-b border-gray-200">
                <Logo size="md" className="mb-4" />
                <div className="px-3 py-2.5 rounded-lg bg-gradient-to-r from-[#76C043]/10 to-[#569130]/10 border border-[#76C043]/20">
                    <div className="flex items-center gap-2 mb-1">
                        <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                        </svg>
                        <div className="text-xs font-semibold text-gray-600">Logged in as</div>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                        <svg className="w-4 h-4 text-[#76C043]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        <div className="text-sm font-bold text-gray-900 truncate">{user.name}</div>
                    </div>
                    <div className="flex items-center gap-2">
                        <svg className="w-3.5 h-3.5 text-[#76C043]" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                        </svg>
                        <div className="text-xs text-[#76C043] font-medium capitalize">{user.role}</div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 overflow-y-auto">
                {ROLE_PERMISSIONS[user.role].map((item) => {
                    const isActive = pathname === item.path;
                    return (
                        <button
                            key={item.path}
                            onClick={() => router.push(item.path)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all mb-1 ${
                                isActive
                                    ? "bg-gradient-to-r from-[#76C043] to-[#569130] text-white shadow-md"
                                    : "text-gray-700 hover:bg-gray-100"
                            }`}
                        >
                            <span className={isActive ? "scale-110" : ""}>{item.icon}</span>
                            <span>{item.label}</span>
                        </button>
                    );
                })}
            </nav>

            {/* User Info & Sign Out */}
            <div className="px-3 py-4 border-t border-gray-200">
                <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    <span>Sign Out</span>
                </button>
            </div>
        </aside>
    );
}
