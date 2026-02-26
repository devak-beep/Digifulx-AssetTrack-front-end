"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ROLE_PERMISSIONS } from "@/lib/rolePermissions";

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
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
            {/* Logo */}
            <div className="px-6 py-4 border-b border-gray-200">
                <span className="text-lg font-bold">
                    <span className="text-[#76C043]">Digifulx</span> AssetTrack
                </span>
                <span className="block text-xs font-semibold px-2 py-1 rounded-full bg-[#eef8e6] text-[#569130] mt-2 w-fit">
                    {user.role}
                </span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 overflow-y-auto">
                {ROLE_PERMISSIONS[user.role].map((item) => {
                    const isActive = pathname === item.path;
                    return (
                        <button
                            key={item.path}
                            onClick={() => router.push(item.path)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mb-1 ${
                                isActive
                                    ? "bg-[#76C043] text-white"
                                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                            }`}
                        >
                            {item.icon}
                            <span>{item.label}</span>
                        </button>
                    );
                })}
            </nav>

            {/* Sign Out */}
            <div className="px-3 py-4 border-t border-gray-200">
                <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Sign Out
                </button>
            </div>
        </aside>
    );
}
