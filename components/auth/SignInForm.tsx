"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { ROLE_ROUTES } from "@/lib/auth";

export default function SignInForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [remember, setRemember] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const { signIn, user } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const result = await signIn(email, password);

        if (!result.success) {
            setError(result.message || "Invalid email or password. Please try again.");
            setLoading(false);
        }
        // If success, the useEffect below will handle redirect
    };

    // Redirect when user is authenticated
    useEffect(() => {
        if (user) {
            router.push(ROLE_ROUTES[user.role]);
        }
    }, [user, router]);

    return (
        <div className="w-full max-w-sm bg-white rounded-xl shadow-md border border-gray-100 px-8 py-8">
            {/* Header */}
            <div className="text-center mb-6">
                <div
                    className="mx-auto mb-3 w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "var(--brand-light)" }}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" />
                        <polyline points="10 17 15 12 10 7" />
                        <line x1="15" y1="12" x2="3" y2="12" />
                    </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900">Welcome!</h2>
                <p className="text-sm text-gray-500 mt-1">Sign in to your account</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <Input
                    id="signin-email"
                    label="Email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <Input
                    id="signin-password"
                    label="Password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                {/* Error message */}
                {error && (
                    <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                        {error}
                    </p>
                )}

                {/* Remember me & Forgot password */}
                <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            checked={remember}
                            onChange={(e) => setRemember(e.target.checked)}
                            className="h-3.5 w-3.5 rounded border-gray-300"
                            style={{ accentColor: "var(--brand)" }}
                        />
                        <span className="text-gray-500">remember me?</span>
                    </label>
                    <Link
                        href="#"
                        className="font-medium transition-colors"
                        style={{ color: "var(--brand)" }}
                    >
                        forgot password?
                    </Link>
                </div>

                <Button type="submit" loading={loading} className="mt-1 w-auto self-start">
                    Login →
                </Button>
            </form>
        </div>
    );
}
