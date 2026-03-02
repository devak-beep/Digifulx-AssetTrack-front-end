import React from "react";
import Image from "next/image";

interface LogoProps {
    size?: "sm" | "md" | "lg";
    className?: string;
}

const sizes = {
    sm: { height: 28 },
    md: { height: 36 },
    lg: { height: 48 },
};

export default function Logo({ size = "md", className = "" }: LogoProps) {
    const s = sizes[size];

    return (
        <div className={`flex items-center ${className}`}>
            <Image
                src="/logo.png"
                alt="Digifulx Logo"
                width={s.height * 4}
                height={s.height}
                className="object-contain"
                priority
            />
        </div>
    );
}
