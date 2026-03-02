"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "./Sidebar";

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const { user } = useAuth();

    if (!user) return null;

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
            <Sidebar />
            <main className="flex-1 overflow-auto">
                {children}
            </main>
        </div>
    );
}
