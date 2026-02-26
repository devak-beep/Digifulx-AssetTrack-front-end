"use client";

import React, { useState } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    icon?: React.ReactNode;
    error?: string;
}

export default function Input({
    label,
    icon,
    error,
    id,
    type: initialType,
    className = "",
    ...props
}: InputProps) {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = initialType === "password";
    const type = isPassword && showPassword ? "text" : initialType;

    return (
        <div className={`relative ${className}`}>
            <label
                htmlFor={id}
                className={`block text-sm font-medium mb-1 ${error ? "text-red-600" : "text-gray-700"
                    }`}
            >
                {label}
            </label>
            <div className="relative">
                {icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {icon}
                    </div>
                )}
                <input
                    id={id}
                    type={type}
                    className={`w-full rounded-lg px-3 py-2 text-sm bg-white text-gray-900 
            border placeholder-gray-400 transition-all duration-200
            focus:outline-none focus:border-[var(--brand)]
            ${icon ? "pl-10" : ""} 
            ${isPassword ? "pr-10" : ""}
            ${error ? "border-red-400 focus:border-red-500" : "border-gray-300"}`}
                    style={{ boxShadow: "none" }}
                    onFocus={(e) => {
                        e.currentTarget.style.boxShadow = `0 0 0 3px var(--brand-ring)`;
                    }}
                    onBlur={(e) => {
                        e.currentTarget.style.boxShadow = "none";
                    }}
                    {...props}
                />
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                        tabIndex={-1}
                    >
                        {showPassword ? (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                                <line x1="1" y1="1" x2="23" y2="23" />
                            </svg>
                        ) : (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                            </svg>
                        )}
                    </button>
                )}
            </div>
            {error && (
                <p className="text-red-500 text-xs mt-1">{error}</p>
            )}
        </div>
    );
}
