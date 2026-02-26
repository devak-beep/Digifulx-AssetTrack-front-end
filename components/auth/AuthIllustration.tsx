import React from "react";
import Logo from "@/components/Logo";

export default function AuthIllustration() {
    return (
        <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden px-10">
            {/* Subtle background pattern */}
            <div
                className="absolute inset-0 opacity-[0.4]"
                style={{
                    backgroundImage:
                        "radial-gradient(circle at 1px 1px, var(--brand) 1px, transparent 0)",
                    backgroundSize: "40px 40px",
                }}
            />

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center text-center">
                <Logo size="lg" className="mb-8" />

                <h2 className="text-2xl font-bold text-gray-900 mb-3 max-w-xs leading-tight">
                    Manage Your{" "}
                    <span style={{ color: "var(--brand)" }}>Digital Assets</span>{" "}
                    with Confidence
                </h2>

                <p className="text-gray-500 text-sm max-w-xs leading-relaxed">
                    Track, organize, and optimize all your digital assets in one unified
                    platform.
                </p>

                {/* Feature pills */}
                <div className="mt-10 flex gap-3">
                    <div className="bg-white border border-gray-200 rounded-full px-4 py-2 flex items-center gap-2 shadow-sm">
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: "var(--brand)" }} />
                        <span className="text-xs text-gray-600 font-medium">Real-time Tracking</span>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-full px-4 py-2 flex items-center gap-2 shadow-sm">
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: "var(--brand-active)" }} />
                        <span className="text-xs text-gray-600 font-medium">Secure & Private</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
