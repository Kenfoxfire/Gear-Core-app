import React from "react";
import { AppBar, Avatar, Box, Button, IconButton, Toolbar, Tooltip, Typography, Stack, Divider, Chip } from "@mui/material";
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
            <AppBar position="static" color="default" elevation={1}>
                <Toolbar sx={{ display: "flex", gap: 2 }}>
                    <Typography
                        variant="h6"
                        sx={{ cursor: "pointer", fontWeight: 700, letterSpacing: 0.5 }}
                        onClick={() => navigate("/vehicles")}
                    >
                        Ford Vehicle Admin
                    </Typography>

                    {user && (
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ ml: "auto" }}>
                            <Tooltip title={`Switch to ${theme.palette.mode === "dark" ? "light" : "dark"} mode`}>
                                <IconButton color="primary" onClick={() => theme.toggleTheme && theme.toggleTheme()}>
                                    {theme.palette.mode === "dark" ? <Brightness7 /> : <Brightness4 />}
                                </IconButton>
                            </Tooltip>

                            <Divider flexItem orientation="vertical" sx={{ mx: 1 }} />

                            {user.role.name === "Admin" && (
                                <Button color="primary" variant="text" onClick={() => navigate("/users")}>Users</Button>
                            )}
                            <Button color="primary" variant="text" onClick={() => navigate("/vehicles")}>Vehicles</Button>

                            <Divider flexItem orientation="vertical" sx={{ mx: 1 }} />

                            <Chip
                                color="default"
                                variant="outlined"
                                avatar={<Avatar sx={{ width: 24, height: 24 }}>{user.email.slice(0, 1).toUpperCase()}</Avatar>}
                                label={
                                    <Box sx={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
                                        <Typography variant="body2" sx={{ lineHeight: 1.2 }}>
                                            {user.email}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {user.role.name}
                                        </Typography>
                                    </Box>
                                }
                                sx={{ pr: 1, borderColor: "divider" }}
                            />
                            <Button color="inherit" variant="outlined" onClick={handleLogout}>
                                Logout
                            </Button>
                        </Stack>
                    )}
                </Toolbar>
            </AppBar>
            <Box sx={{ p: 3 }}>{children}</Box>
        </Box>
    );
};
