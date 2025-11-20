import React, { useState } from "react";
import { gql } from "@apollo/client";
import { Box, Button, Paper, TextField, Typography } from "@mui/material";
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
    const { login } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: "main", password: "" });
    const [loginMutation, { loading, error }] = useMutation<{ login: { token: string, user: AuthUser } }>(LOGIN_MUTATION);

    // -- Handlers --
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await loginMutation({ variables: form });
        if (!res.data) return;
        console.log(res.data);

        const { token, user } = res.data.login;
        login(token, {
            id: user.id,
            email: user.email,
            role:  user.role, 
        });
        navigate("/vehicles");
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
                    {error && (
                        <Typography color="error" variant="body2">
                            {error.message}
                        </Typography>
                    )}
                    <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        sx={{ mt: 2 }}
                        disabled={loading}
                    >
                        {loading ? "Signing in..." : "Sign in"}
                    </Button>
                </form>
            </Paper>
        </Box>
    );
};
