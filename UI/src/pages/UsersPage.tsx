import React, { useState } from "react";
import { gql } from "@apollo/client";
import {
    Box,
    Button,
    MenuItem,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from "@mui/material";
import { useQuery, useMutation } from "@apollo/client/react";
import { useAuth } from "../auth/useAuth";

const USERS_QUERY = gql`
  query Users($limit: Int, $offset: Int) {
    users(limit: $limit, offset: $offset) {
      id
      email
      role {
        name
      }
    }
  }
`;

const CHANGE_ROLE_MUTATION = gql`
  mutation ChangeUserRole($userId: ID!, $newRole: String!) {
    changeUserRole(userId: $userId, newRole: $newRole)
  }
`;

const SIGNUP_MUTATION = gql`
  mutation Signup($email: String!, $password: String!) {
    signup(email: $email, password: $password) {
      user {
        id
        email
        role { name }
      }
    }
  }
`;

const roleOptions = ["Admin", "Editor", "Viewer"];

export const UsersPage: React.FC = () => {
    const { user } = useAuth();
    const { data, loading, error, refetch } = useQuery(USERS_QUERY, { variables: { limit: 50, offset: 0 } });
    const [changeRole] = useMutation(CHANGE_ROLE_MUTATION);
    const [signup, signupState] = useMutation(SIGNUP_MUTATION);
    const [newUser, setNewUser] = useState({ email: "", password: "" });
    const [inlineError, setInlineError] = useState<string | null>(null);

    if (!user || user.role.name !== "Admin") {
        return <Typography>You do not have permission to view this page.</Typography>;
    }

    const users = data?.users ?? [];

    const handleRoleChange = async (userId: string, newRole: string) => {
        setInlineError(null);
        try {
            await changeRole({ variables: { userId, newRole } });
            await refetch();
        } catch (err) {
            setInlineError(err instanceof Error ? err.message : "Failed to change role");
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setInlineError(null);
        try {
            await signup({ variables: newUser });
            await refetch();
            setNewUser({ email: "", password: "" });
        } catch (err) {
            setInlineError(err instanceof Error ? err.message : "Failed to create user");
        }
    };

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Typography variant="h4">User Management</Typography>

            <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Create Viewer</Typography>
                <Box component="form" onSubmit={handleCreateUser} sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                    <TextField
                        label="Email"
                        name="email"
                        value={newUser.email}
                        onChange={(e) => setNewUser((prev) => ({ ...prev, email: e.target.value }))}
                        required
                        sx={{ flex: "1 1 220px" }}
                    />
                    <TextField
                        label="Password"
                        name="password"
                        type="password"
                        value={newUser.password}
                        onChange={(e) => setNewUser((prev) => ({ ...prev, password: e.target.value }))}
                        required
                        sx={{ flex: "1 1 220px" }}
                    />
                    <Button type="submit" variant="contained" disabled={signupState.loading}>
                        {signupState.loading ? "Creating..." : "Create"}
                    </Button>
                </Box>
            </Paper>

            <Paper>
                <Box sx={{ p: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="h6">Users</Typography>
                    {loading && <Typography variant="body2">Loading...</Typography>}
                </Box>
                {error && (
                    <Typography color="error" sx={{ px: 2, pb: 1 }}>
                        Failed to load users: {error.message}
                    </Typography>
                )}
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Email</TableCell>
                            <TableCell>Role</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map((u: any) => (
                            <TableRow key={u.id}>
                                <TableCell>{u.email}</TableCell>
                                <TableCell>{u.role?.name}</TableCell>
                                <TableCell align="right">
                                    <TextField
                                        select
                                        size="small"
                                        value={u.role?.name}
                                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                        sx={{ minWidth: 140 }}
                                    >
                                        {roleOptions.map((role) => (
                                            <MenuItem key={role} value={role}>
                                                {role}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </TableCell>
                            </TableRow>
                        ))}
                        {users.length === 0 && !loading && (
                            <TableRow>
                                <TableCell colSpan={3} align="center">
                                    No users yet.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
                {inlineError && (
                    <Typography color="error" sx={{ p: 2 }}>
                        {inlineError}
                    </Typography>
                )}
            </Paper>
        </Box>
    );
};
