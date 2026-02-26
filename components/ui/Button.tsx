"use client";

import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "outline";
    fullWidth?: boolean;
    loading?: boolean;
    children: React.ReactNode;
}

export default function Button({
    variant = "primary",
    fullWidth = false,
    loading = false,
    children,
    className = "",
    disabled,
    ...props
}: ButtonProps) {
    const base =
        "relative inline-flex items-center justify-center gap-2 font-semibold rounded-lg px-6 py-2.5 text-sm transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";

    const primaryStyle: React.CSSProperties = {
        backgroundColor: "var(--brand)",
        color: "#ffffff",
    };

    const variants = {
        primary: "",
        outline:
            "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 active:bg-gray-100",
    };

    return (
        <button
            className={`${base} ${variants[variant]} ${fullWidth ? "w-full" : ""} ${className}`}
            style={variant === "primary" ? primaryStyle : undefined}
            disabled={disabled || loading}
            onMouseEnter={(e) => {
                if (variant === "primary") e.currentTarget.style.backgroundColor = "var(--brand-hover)";
            }}
            onMouseLeave={(e) => {
                if (variant === "primary") e.currentTarget.style.backgroundColor = "var(--brand)";
            }}
            {...props}
        >
            {loading && (
                <svg
                    className="animate-spin h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    />
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                </svg>
            )}
            {children}
        </button>
    );
}
