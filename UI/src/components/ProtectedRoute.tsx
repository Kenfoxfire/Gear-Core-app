import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

interface Props {
    children: JSX.Element;
    allowedRoles?: string[];
}

export const ProtectedRoute: React.FC<Props> = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return null;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role.name)) {
        return <div>Access denied.</div>;
    }

    return children;
};
