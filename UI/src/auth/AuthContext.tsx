import React, { createContext, useEffect, useState } from "react";

export type Role = "Admin" | "Editor" | "Viewer";

export interface AuthUser {
    id: string;
    email: string;
    role: Role;
}

interface AuthContextValue {
    user: AuthUser | null;
    token: string | null;
    login: (token: string, user: AuthUser) => void;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextValue>({
    user: null,
    token: null,
    login: () => { },
    logout: () => { },
});

const AUTH_STORAGE_KEY = "auth";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const raw = localStorage.getItem(AUTH_STORAGE_KEY);
        if (!raw) return;
        try {
            const parsed = JSON.parse(raw) as { token: string; user: AuthUser };
            setToken(parsed.token);
            setUser(parsed.user);
            localStorage.setItem("auth_token", parsed.token);
        } catch {
            localStorage.removeItem(AUTH_STORAGE_KEY);
            localStorage.removeItem("auth_token");
        }
    }, []);

    const login = (t: string, u: AuthUser) => {
        setToken(t);
        setUser(u);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token: t, user: u }));
        localStorage.setItem("auth_token", t);
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem(AUTH_STORAGE_KEY);
        localStorage.removeItem("auth_token");
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
