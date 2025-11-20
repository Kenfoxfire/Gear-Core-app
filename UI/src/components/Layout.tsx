import React from "react";
import { AppBar, Box, Button, Toolbar, Typography } from "@mui/material";
import { useAuth } from "../auth/useAuth";
import { useNavigate } from "react-router-dom";

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" sx={{ flexGrow: 1, cursor: "pointer" }} onClick={() => navigate("/vehicles")}>
                        Ford Vehicle Admin
                    </Typography>
                    {user && (
                        <>
                            <Typography variant="body2" sx={{ mr: 2 }}>
                                {user.email} ({user.role.name})
                            </Typography>
                            <Button color="inherit" onClick={handleLogout}>
                                Logout
                            </Button>
                        </>
                    )}
                </Toolbar>
            </AppBar>
            <Box sx={{ p: 3 }}>{children}</Box>
        </Box>
    );
};
