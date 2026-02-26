import React from "react";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen w-full bg-white flex flex-col items-center">
            {/* Brand name at top center */}
            <div className="pt-8 pb-2">
                <h1 className="text-2xl font-bold tracking-tight text-center">
                    <span style={{ color: "var(--brand)" }}>Digifulx</span> AssetTrack
                </h1>
            </div>

            {/* Centered form */}
            <div className="flex-1 flex items-start justify-center w-full px-4 pt-4 pb-12">
                {children}
            </div>
        </div>
    );
}
