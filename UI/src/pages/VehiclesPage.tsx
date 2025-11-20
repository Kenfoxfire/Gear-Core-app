import React from "react";
import { gql } from "@apollo/client";
import {
    Box,
    Button,
    CircularProgress,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@apollo/client/react";

export interface VehicleData {
    vehicles: Vehicle[]
}

export interface Vehicle {
    id: string
    vin: string
    name: string
    modelCode: string
    tractionType: string
    releaseYear: number
    status: string
}

const VEHICLES_QUERY = gql`
  query Vehicles($limit: Int, $offset: Int) {
    vehicles(limit: $limit, offset: $offset) {
      id
      vin
      name
      modelCode
      tractionType
      releaseYear
      status
    }
  }
`;

export const VehiclesPage: React.FC = () => {
    
    const { data, loading, error, refetch } = useQuery<VehicleData>(VEHICLES_QUERY, {
        variables: { limit: 20, offset: 0 },
    });
    const navigate = useNavigate();

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Typography color="error">
                Failed to load vehicles: {error.message}
            </Typography>
        );
    }

    const vehicles = data?.vehicles ?? [];

    return (
        <Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                <Typography variant="h5">Vehicles</Typography>
                <Button variant="contained" onClick={() => navigate("/vehicles/new")}>
                    New Vehicle
                </Button>
            </Box>
            <Paper>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>VIN</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Model</TableCell>
                            <TableCell>Traction</TableCell>
                            <TableCell>Year</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {vehicles.map((v: any) => (
                            <TableRow key={v.id} hover>
                                <TableCell>{v.vin}</TableCell>
                                <TableCell>{v.name}</TableCell>
                                <TableCell>{v.modelCode}</TableCell>
                                <TableCell>{v.tractionType}</TableCell>
                                <TableCell>{v.releaseYear}</TableCell>
                                <TableCell>{v.status}</TableCell>
                                <TableCell align="right">
                                    <Button size="small" onClick={() => navigate(`/vehicles/${v.id}`)}>
                                        Details
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {vehicles.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} align="center">
                                    No vehicles yet.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Paper>
            <Button sx={{ mt: 2 }} onClick={() => refetch()}>
                Refresh
            </Button>
        </Box>
    );
};
