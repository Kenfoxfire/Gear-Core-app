import React, { createContext, useEffect, useState } from "react";
import { gql } from "@apollo/client";
import { useLazyQuery } from "@apollo/client/react";

export type RoleName = "Admin" | "Editor" | "Viewer";

export interface Role {
    name: RoleName;
}
export interface AuthUser {
    id: string;
    email: string;
    role: Role;
}

interface AuthContextValue {
    user: AuthUser | null;
    token: string | null;
    loading: boolean;
    login: (token: string, user: AuthUser) => void;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextValue>({
    user: null,
    token: null,
    loading: true,
    login: () => { },
    logout: () => { },
});

const AUTH_STORAGE_KEY = "auth";
const AUTH_TOKEN_KEY = "auth_token";

const ME_QUERY = gql`
  query Me {
    me {
      id
      email
      role {
        name
      }
    }
  }
`;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [fetchMe, { data: meData }] = useLazyQuery<{ me: AuthUser }>(ME_QUERY, {
        fetchPolicy: "network-only",
    });

    useEffect(() => {
        let active = true;
        const hydrate = async () => {
            const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
            const raw = localStorage.getItem(AUTH_STORAGE_KEY);

            if (raw) {
                try {
                    const parsed = JSON.parse(raw) as { token: string; user: AuthUser };
                    setToken(parsed.token);
                    setUser(parsed.user);
                    localStorage.setItem(AUTH_TOKEN_KEY, parsed.token);
                } catch {
                    // Ignore parse errors; keep whatever token we may have separately.
                }
            }

            if (!raw && storedToken) {
                setToken(storedToken);
                localStorage.setItem(AUTH_TOKEN_KEY, storedToken);
            }

            if (storedToken || raw) {
                try {
                    await fetchMe();
                } catch {
                    // preserve token; allow user to handle expired token manually
                }
            }

            if (active) setLoading(false);
        };
        hydrate();
        return () => { active = false; };
    }, [fetchMe]);

    useEffect(() => {
        if (meData?.me && token) {
            setUser(meData.me);
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token, user: meData.me }));
        }
    }, [meData, token]);

    const login = (t: string, u: AuthUser) => {
        setToken(t);
        setUser(u);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token: t, user: u }));
        localStorage.setItem(AUTH_TOKEN_KEY, t);
        fetchMe();
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem(AUTH_STORAGE_KEY);
        localStorage.removeItem(AUTH_TOKEN_KEY);
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
