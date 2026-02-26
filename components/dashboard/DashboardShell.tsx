"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Role } from "@/lib/auth";

const ROLE_COLORS: Record<Role, { bg: string; text: string; badge: string }> = {
    Superadmin: { bg: "from-[#76C043] to-[#65a83a]", text: "text-[#569130]", badge: "bg-[#eef8e6] text-[#569130]" },
    Admin: { bg: "from-[#85d152] to-[#76C043]", text: "text-[#569130]", badge: "bg-[#f5fbf0] text-[#76C043]" },
    Manager: { bg: "from-[#76C043] to-[#569130]", text: "text-[#569130]", badge: "bg-[#eef8e6] text-[#569130]" },
    HR: { bg: "from-[#76C043] via-[#85d152] to-[#76C043]", text: "text-[#569130]", badge: "bg-[#eef8e6] text-[#569130]" },
    Staff: { bg: "from-[#65a83a] to-[#76C043]", text: "text-[#569130]", badge: "bg-[#f1f9ea] text-[#569130]" },
};

const ROLE_ICONS: Record<Role, React.ReactNode> = {
    Superadmin: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
        </svg>
    ),
    Admin: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
    ),
    Manager: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
        </svg>
    ),
    HR: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
        </svg>
    ),
    Staff: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
        </svg>
    ),
};

interface DashboardShellProps {
    expectedRole: Role;
}

export default function DashboardShell({ expectedRole }: DashboardShellProps) {
    const { user } = useAuth();
    const router = useRouter();

    if (!user) {
        router.replace("/sign-in");
        return null;
    }

    const colors = ROLE_COLORS[user.role];

    return (
        <div className="p-6">
            {/* Hero Banner */}
            <div className={`bg-gradient-to-r ${colors.bg} text-white px-6 py-8 rounded-lg mb-6`}>
                <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                        {ROLE_ICONS[user.role]}
                    </div>
                    <div>
                        <p className="text-white/75 text-sm font-medium uppercase tracking-wider mb-1">
                            {user.role} Dashboard
                        </p>
                        <h1 className="text-2xl sm:text-3xl font-bold">
                            Welcome back, {user.name}!
                        </h1>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    { label: "Email", value: user.email },
                    { label: "Role", value: user.role },
                    { label: "Status", value: "Active" },
                ].map((card) => (
                    <div
                        key={card.label}
                        className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm"
                    >
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1">
                            {card.label}
                        </p>
                        <p className={`text-sm font-semibold ${colors.text} break-all`}>
                            {card.value}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
