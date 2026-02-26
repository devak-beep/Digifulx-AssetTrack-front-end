"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User, normalizeRole } from "@/lib/auth";

interface AuthContextType {
    user: User | null;
    token: string | null;
    signIn: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
    signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY_USER = "digiflux_user";
const STORAGE_KEY_TOKEN = "digiflux_token";

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);

    // Rehydrate from localStorage on first load
    useEffect(() => {
        try {
            const storedUser = localStorage.getItem(STORAGE_KEY_USER);
            const storedToken = localStorage.getItem(STORAGE_KEY_TOKEN);
            if (storedUser) setUser(JSON.parse(storedUser));
            if (storedToken) setToken(storedToken);
        } catch {
            // ignore corrupt data
        }
    }, []);

    const signIn = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
            const response = await fetch(`${baseUrl}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (data.success) {
                const apiUser = data.data.user;
                const apiToken = data.data.token;

                const normalizedUser: User = {
                    id: apiUser.id,
                    name: apiUser.name,
                    email: apiUser.email,
                    role: normalizeRole(apiUser.role),
                    token: apiToken
                };

                setUser(normalizedUser);
                setToken(apiToken);
                localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(normalizedUser));
                localStorage.setItem(STORAGE_KEY_TOKEN, apiToken);

                return { success: true };
            } else {
                return { success: false, message: data.message || "Invalid credentials" };
            }
        } catch (error: any) {
            return { success: false, message: error.message || "Something went wrong" };
        }
    };

    const signOut = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem(STORAGE_KEY_USER);
        localStorage.removeItem(STORAGE_KEY_TOKEN);
    };

    return (
        <AuthContext.Provider value={{ user, token, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextType {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
    return ctx;
}
