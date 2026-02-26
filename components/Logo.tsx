import React from "react";

interface LogoProps {
    size?: "sm" | "md" | "lg";
    className?: string;
}

const sizes = {
    sm: { icon: 28, text: "text-lg" },
    md: { icon: 36, text: "text-xl" },
    lg: { icon: 48, text: "text-3xl" },
};

export default function Logo({ size = "md", className = "" }: LogoProps) {
    const s = sizes[size];

    return (
        <div className={`flex items-center gap-2.5 ${className}`}>
            <svg
                width={s.icon}
                height={s.icon}
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <defs>
                    <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#76C043" />
                        <stop offset="100%" stopColor="#65a83a" />
                    </linearGradient>
                </defs>
                <rect
                    x="4"
                    y="4"
                    width="40"
                    height="40"
                    rx="12"
                    stroke="url(#logoGrad)"
                    strokeWidth="2.5"
                    fill="none"
                />
                <path
                    d="M16 16h6v6h-6zM26 16h6v6h-6zM16 26h6v6h-6zM26 26h6v6h-6z"
                    fill="url(#logoGrad)"
                    opacity="0.85"
                />
                <path d="M22 22h4v4h-4z" fill="url(#logoGrad)" />
            </svg>

            <span className={`${s.text} font-bold tracking-tight`}>
                <span style={{ color: "var(--brand)" }}>Digi</span>
                <span className="text-gray-900">Flux</span>
                <span className="text-gray-400 font-normal ml-1.5">Assets</span>
            </span>
        </div>
    );
}
