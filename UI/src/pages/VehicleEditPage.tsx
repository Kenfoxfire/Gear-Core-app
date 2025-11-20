import React, { useMemo } from "react";
import { gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";
import { Alert, Box, CircularProgress, Typography } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { VehicleForm, VehicleFormValues } from "../components/VehicleForm";

interface VehicleDetailQuery {
    vehicle: {
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
    } | null;
}

const VEHICLE_QUERY = gql`
  query Vehicle($id: ID!) {
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
    }
  }
`;

const UPDATE_VEHICLE_MUTATION = gql`
  mutation UpdateVehicle($id: ID!, $input: VehicleUpdateInput!) {
    updateVehicle(id: $id, input: $input) {
      id
      name
      vin
    }
  }
`;

export const VehicleEditPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data, loading, error } = useQuery<VehicleDetailQuery>(VEHICLE_QUERY, { variables: { id }, skip: !id });
    const [updateVehicle, updateState] = useMutation(UPDATE_VEHICLE_MUTATION);

    const initialValues = useMemo<VehicleFormValues | null>(() => {
        if (!data?.vehicle) return null;
        const v = data.vehicle;
        return {
            vin: v.vin,
            name: v.name,
            modelCode: v.modelCode,
            tractionType: v.tractionType,
            releaseYear: v.releaseYear.toString(),
            batchNumber: v.batchNumber,
            color: v.color ?? "",
            mileage: v.mileage.toString(),
            status: v.status,
        };
    }, [data?.vehicle]);

    const handleSubmit = async (values: VehicleFormValues) => {
        if (!id) return;
        await updateVehicle({
            variables: {
                id,
                input: {
                    name: values.name,
                    modelCode: values.modelCode,
                    tractionType: values.tractionType,
                    releaseYear: Number(values.releaseYear),
                    batchNumber: values.batchNumber,
                    color: values.color || null,
                    mileage: Number(values.mileage),
                    status: values.status,
                },
            },
        });
        navigate(`/vehicles/${id}`);
    };

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
        return <Alert severity="error">Failed to load vehicle: {error.message}</Alert>;
    }

    if (!initialValues) {
        return <Typography>Vehicle not found.</Typography>;
    }

    return (
        <VehicleForm
            title="Edit Vehicle"
            initialValues={initialValues}
            isEdit
            onSubmit={handleSubmit}
            loading={updateState.loading}
            errorMessage={updateState.error?.message}
        />
    );
};
