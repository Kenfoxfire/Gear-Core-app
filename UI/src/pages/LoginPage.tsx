import React, { useState } from "react";
import { gql } from "@apollo/client";
import { Box, Button, Paper, TextField, Typography, CircularProgress } from "@mui/material";
import { useAuth } from "../auth/useAuth";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@apollo/client/react";
import { AuthUser } from "../auth/AuthContext";

//  -- GraphQL Mutation --
const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        email
        role {
          name
        }
      }
    }
  }
`;

export const LoginPage: React.FC = () => {

    // -- Hooks --
    const { login, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: "main", password: "" });
    const [loginMutation, { loading, error }] = useMutation<{ login: { token: string, user: AuthUser } }>(LOGIN_MUTATION);
    const [formError, setFormError] = useState<string | null>(null);

    // -- Handlers --
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);
        try {
            const res = await loginMutation({ variables: form });
            if (!res.data) {
                setFormError("Invalid credentials");
                return;
            }

            const { token, user } = res.data.login;
            login(token, {
                id: user.id,
                email: user.email,
                role: user.role,
            });
            navigate("/vehicles");
        } catch (err) {
            const message = err instanceof Error ? err.message : "Login failed";
            setFormError(message);
        }
    };

    return (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
            <Paper sx={{ p: 4, width: 360 }}>
                <Typography variant="h5" gutterBottom>
                    Sign in
                </Typography>
                <form onSubmit={handleSubmit}>
                    <TextField
                        label="Email"
                        name="email"
                        fullWidth
                        margin="normal"
                        value={form.email}
                        onChange={handleChange}
                    />
                    <TextField
                        label="Password"
                        name="password"
                        type="password"
                        fullWidth
                        margin="normal"
                        value={form.password}
                        onChange={handleChange}
                    />
                    {(error || formError) && (
                        <Typography color="error" variant="body2">
                            {formError ?? error?.message}
                        </Typography>
                    )}
                    <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        sx={{ mt: 2, display: "flex", gap: 1, alignItems: "center", justifyContent: "center" }}
                        disabled={loading || authLoading}
                    >
                        {(loading || authLoading) && <CircularProgress size={16} color="inherit" />}
                        {(loading || authLoading) ? "Signing in..." : "Sign in"}
                    </Button>
                </form>
            </Paper>
        </Box>
    );
};
