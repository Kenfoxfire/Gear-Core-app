import React from "react";
import { AppBar, Box, Button, IconButton, Toolbar, Tooltip, Typography } from "@mui/material";
import { Brightness4, Brightness7 } from "@mui/icons-material";
import { useAuth } from "../auth/useAuth";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const theme = useTheme() as { palette: { mode: "light" | "dark" }, toggleTheme?: () => void };

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
                            <Tooltip title="Toggle theme">
                                <IconButton color="inherit" onClick={() => theme.toggleTheme && theme.toggleTheme()} sx={{ mr: 2 }}>
                                    {theme.palette.mode === "dark" ? <Brightness7 /> : <Brightness4 />}
                                </IconButton>
                            </Tooltip>
                            {user.role.name === "Admin" && (
                                <Button color="inherit" onClick={() => navigate("/users")} sx={{ mr: 2 }}>
                                    Users
                                </Button>
                            )}
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
