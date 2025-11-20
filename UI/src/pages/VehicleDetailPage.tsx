import React, { useEffect, useMemo, useState } from "react";
import { gql } from "@apollo/client";
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    MenuItem,
    Paper,
    TextField,
    Typography,
} from "@mui/material";
import { useMutation, useQuery } from "@apollo/client/react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { MovementLogSection, MovementFormValues, MovementLogItem } from "../components/MovementLogSection";

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

const CREATE_MOVEMENT_MUTATION = gql`
  mutation CreateMovement($input: MovementInput!) {
    createMovement(input: $input) {
      id
      type
      description
      occurredAt
      createdAt
      createdBy
    }
  }
`;

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
    movements: MovementLogItem[];
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
    const [createMovement, movementState] = useMutation(CREATE_MOVEMENT_MUTATION);
    const [confirmOpen, setConfirmOpen] = useState(false);

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
        const res = await deleteVehicle({ variables: { id } });
        if (res.data) {
            navigate("/vehicles");
        }
    };

    const handleCreateMovement = async (values: MovementFormValues) => {
        if (!id || !canEdit) return;
        await createMovement({
            variables: {
                input: {
                    vehicleId: id,
                    type: values.type,
                    description: values.description || null,
                    occurredAt: new Date(values.occurredAt).toISOString(),
                },
            },
        });
        await refetch();
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

            <Paper sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2 }}>
                <MovementLogSection
                    movements={movementRows}
                    canCreate={canEdit}
                    loading={movementState.loading}
                    onCreate={handleCreateMovement}
                />
                {deleteState.error && <Typography color="error">{deleteState.error.message}</Typography>}
                {canDelete && (
                    <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                        <Button
                            color="error"
                            variant="contained"
                            onClick={() => setConfirmOpen(true)}
                            disabled={deleteState.loading}
                        >
                            Delete Vehicle
                        </Button>
                    </Box>
                )}
            </Paper>

            <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
                <DialogTitle>Delete vehicle</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this vehicle? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
                    <Button color="error" onClick={async () => { await handleDelete(); setConfirmOpen(false); }} disabled={deleteState.loading}>
                        {deleteState.loading ? "Deleting..." : "Delete"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};
