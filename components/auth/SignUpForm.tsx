"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";

export default function SignUpForm() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("");
    const [roles, setRoles] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const { signIn } = useAuth();

    useEffect(() => {
        // Backend roles: superadmin, admin, hr, manager, user
        const availableRoles = ["Superadmin", "Admin", "HR", "Manager", "User"];
        setRoles(availableRoles);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
            const response = await fetch(`${baseUrl}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    email,
                    password,
                    role: role.toLowerCase()
                }),
            });

            const data = await response.json();

            if (data.success) {
                // Use the returned token and user data to sign in
                await signIn(email, password);
            } else {
                setError(data.message || "Registration failed. Please try again.");
                setLoading(false);
            }
        } catch (err: any) {
            setError(err.message || "An error occurred during registration.");
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-sm bg-white rounded-xl shadow-md border border-gray-100 px-8 py-8">
            {/* Header */}
            <div className="text-center mb-6">
                <div
                    className="mx-auto mb-3 w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "var(--brand-light)" }}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                    </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900">Create account!</h2>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <Input
                    id="signup-name"
                    label="Name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />

                <Input
                    id="signup-email"
                    label="Email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <Input
                    id="signup-password"
                    label="Password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                <div>
                    <label
                        htmlFor="signup-role"
                        className="block text-sm font-medium mb-1 text-gray-700"
                    >
                        Role
                    </label>
                    <select
                        id="signup-role"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        required
                        className="w-full rounded-lg px-3 py-2 text-sm bg-white text-gray-900 
                            border border-gray-300 transition-all duration-200
                            focus:outline-none focus:border-[var(--brand)]
                            cursor-pointer"
                        style={{ boxShadow: "none" }}
                        onFocus={(e) => {
                            e.currentTarget.style.boxShadow = `0 0 0 3px var(--brand-ring)`;
                        }}
                        onBlur={(e) => {
                            e.currentTarget.style.boxShadow = "none";
                        }}
                    >
                        <option value="" disabled>Select your role</option>
                        {roles.map(r => (
                            <option key={r} value={r}>{r}</option>
                        ))}
                    </select>
                </div>

                {/* Error message */}
                {error && (
                    <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                        {error}
                    </p>
                )}

                <Button type="submit" fullWidth loading={loading} className="mt-1">
                    Create →
                </Button>
            </form>

            {/* Sign in link */}
            <p className="mt-5 text-center text-sm text-gray-500">
                Already have an account?{" "}
                <Link
                    href="/sign-in"
                    className="font-medium transition-colors"
                    style={{ color: "var(--brand)" }}
                >
                    Sign in
                </Link>
            </p>
        </div>
    );
}
