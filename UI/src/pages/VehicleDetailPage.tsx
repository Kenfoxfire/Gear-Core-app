import React, { useEffect, useMemo, useState } from "react";
import { gql } from "@apollo/client";
import {
    Alert,
    Box,
    Button,
    CircularProgress,
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
import { useMutation, useQuery } from "@apollo/client/react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

const VEHICLE_QUERY = gql`
  query Vehicle($id: ID!, $movementsLimit: Int, $movementsOffset: Int) {
    vehicle(id: $id) {
      id
      vin
      name
      modelCode
      tractionType
      releaseYear
      batchNumber
      color
      mileage
      status
      createdAt
      updatedAt
      movements(limit: $movementsLimit, offset: $movementsOffset) {
        id
        type
        description
        occurredAt
        createdAt
        createdBy
      }
    }
  }
`;

const UPDATE_VEHICLE_MUTATION = gql`
  mutation UpdateVehicle($id: ID!, $input: VehicleUpdateInput!) {
    updateVehicle(id: $id, input: $input) {
      id
      vin
      name
      modelCode
      tractionType
      releaseYear
      batchNumber
      color
      mileage
      status
      createdAt
      updatedAt
    }
  }
`;

const DELETE_VEHICLE_MUTATION = gql`
  mutation DeleteVehicle($id: ID!) {
    deleteVehicle(id: $id)
  }
`;

type Movement = {
    id: string;
    type: string;
    description?: string | null;
    occurredAt: string;
    createdAt: string;
    createdBy: string;
};

type VehicleDetail = {
    id: string;
    vin: string;
    name: string;
    modelCode: string;
    tractionType: string;
    releaseYear: number;
    batchNumber: string;
    color?: string | null;
    mileage: number;
    status: string;
    movements: Movement[];
};

interface VehicleQueryResult {
    vehicle: VehicleDetail | null;
}

const statusOptions = ["ACTIVE", "INACTIVE", "DISCONTINUED"];

export const VehicleDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [quickForm, setQuickForm] = useState({
        color: "",
        mileage: "",
        status: "ACTIVE",
    });

    const { data, loading, error, refetch } = useQuery<VehicleQueryResult>(VEHICLE_QUERY, {
        variables: { id, movementsLimit: 20, movementsOffset: 0 },
        skip: !id,
        fetchPolicy: "network-only",
    });

    const [updateVehicle, updateState] = useMutation(UPDATE_VEHICLE_MUTATION);
    const [deleteVehicle, deleteState] = useMutation<boolean>(DELETE_VEHICLE_MUTATION);

    const vehicle = data?.vehicle ?? null;

    useEffect(() => {
        if (!vehicle) return;
        setQuickForm({
            color: vehicle.color ?? "",
            mileage: vehicle.mileage.toString(),
            status: vehicle.status,
        });
    }, [vehicle?.id]);

    const canEdit = user?.role.name !== "Viewer";
    const canDelete = user?.role.name === "Admin";

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuickForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id || !canEdit) return;
        await updateVehicle({
            variables: {
                id,
                input: {
                    color: quickForm.color || null,
                    mileage: Number(quickForm.mileage),
                    status: quickForm.status,
                },
            },
        });
        await refetch();
    };

    const handleDelete = async () => {
        if (!id || !canDelete) return;
        const confirmDelete = window.confirm("Are you sure you want to delete this vehicle?");
        if (!confirmDelete) {
            return;
        }
        const res = await deleteVehicle({ variables: { id } });
        if (res.data) {
            navigate("/vehicles");
        }
    };

    const movementRows = useMemo(() => vehicle?.movements ?? [], [vehicle?.movements]);

    if (!id) {
        return <Typography>Missing vehicle id.</Typography>;
    }

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error">Failed to load vehicle: {error.message}</Alert>
        );
    }

    if (!vehicle) {
        return <Typography>Vehicle not found.</Typography>;
    }

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2 }}>
                <Typography variant="h4">{vehicle.name}</Typography>
                <Box sx={{ display: "flex", gap: 1 }}>
                    {canEdit && (
                        <Button variant="contained" onClick={() => navigate(`/vehicles/${vehicle.id}/edit`)}>
                            Edit
                        </Button>
                    )}
                    <Button variant="outlined" onClick={() => navigate(-1)}>
                        Back
                    </Button>
                </Box>
            </Box>

            <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Vehicle Details
                </Typography>
                <Box
                    sx={{
                        display: "grid",
                        gap: 2,
                        gridTemplateColumns: {
                            xs: "repeat(1, minmax(0, 1fr))",
                            sm: "repeat(2, minmax(0, 1fr))",
                            md: "repeat(3, minmax(0, 1fr))",
                        },
                    }}
                >
                    <Box>
                        <Typography variant="body2" color="text.secondary">
                            VIN
                        </Typography>
                        <Typography>{vehicle.vin}</Typography>
                    </Box>
                    <Box>
                        <Typography variant="body2" color="text.secondary">
                            Model Code
                        </Typography>
                        <Typography>{vehicle.modelCode}</Typography>
                    </Box>
                    <Box>
                        <Typography variant="body2" color="text.secondary">
                            Traction
                        </Typography>
                        <Typography>{vehicle.tractionType}</Typography>
                    </Box>
                    <Box>
                        <Typography variant="body2" color="text.secondary">
                            Release Year
                        </Typography>
                        <Typography>{vehicle.releaseYear}</Typography>
                    </Box>
                    <Box>
                        <Typography variant="body2" color="text.secondary">
                            Batch Number
                        </Typography>
                        <Typography>{vehicle.batchNumber}</Typography>
                    </Box>
                    <Box>
                        <Typography variant="body2" color="text.secondary">
                            Color
                        </Typography>
                        <Typography>{vehicle.color ?? "N/A"}</Typography>
                    </Box>
                    <Box>
                        <Typography variant="body2" color="text.secondary">
                            Mileage
                        </Typography>
                        <Typography>{vehicle.mileage}</Typography>
                    </Box>
                    <Box>
                        <Typography variant="body2" color="text.secondary">
                            Status
                        </Typography>
                        <Typography>{vehicle.status}</Typography>
                    </Box>
                </Box>
            </Paper>

            {canEdit && (
                <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Quick Edit
                    </Typography>
                    <Box
                        component="form"
                        onSubmit={handleUpdate}
                        sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}
                    >
                        <TextField
                            label="Color"
                            name="color"
                            value={quickForm.color}
                            onChange={handleChange}
                            sx={{ flex: "1 1 220px" }}
                        />
                        <TextField
                            label="Mileage"
                            name="mileage"
                            type="number"
                            value={quickForm.mileage}
                            onChange={handleChange}
                            required
                            sx={{ flex: "1 1 220px" }}
                        />
                        <TextField
                            select
                            label="Status"
                            name="status"
                            value={quickForm.status}
                            onChange={handleChange}
                            sx={{ flex: "1 1 220px" }}
                        >
                            {statusOptions.map((option) => (
                                <MenuItem key={option} value={option}>
                                    {option}
                                </MenuItem>
                            ))}
                        </TextField>
                        <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexBasis: "100%" }}>
                            <Button type="submit" variant="contained" disabled={updateState.loading}>
                                {updateState.loading ? "Saving..." : "Save Changes"}
                            </Button>
                            {updateState.error && (
                                <Typography color="error">{updateState.error.message}</Typography>
                            )}
                        </Box>
                    </Box>
                </Paper>
            )}

            <Paper sx={{ p: 3 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Typography variant="h6">Movements</Typography>
                    {canDelete && (
                        <Button color="error" onClick={handleDelete} disabled={deleteState.loading}>
                            {deleteState.loading ? "Deleting..." : "Delete Vehicle"}
                        </Button>
                    )}
                </Box>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Type</TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell>Occurred At</TableCell>
                            <TableCell>Created At</TableCell>
                            <TableCell>Created By</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {movementRows.map((movement) => (
                            <TableRow key={movement.id}>
                                <TableCell>{movement.type}</TableCell>
                                <TableCell>{movement.description ?? "-"}</TableCell>
                                <TableCell>{new Date(movement.occurredAt).toLocaleString()}</TableCell>
                                <TableCell>{new Date(movement.createdAt).toLocaleString()}</TableCell>
                                <TableCell>{movement.createdBy}</TableCell>
                            </TableRow>
                        ))}
                        {movementRows.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} align="center">
                                    No movements recorded.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
                {deleteState.error && <Typography color="error" sx={{ mt: 2 }}>{deleteState.error.message}</Typography>}
            </Paper>
        </Box>
    );
};
