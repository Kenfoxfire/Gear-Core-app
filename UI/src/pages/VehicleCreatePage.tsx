import React from "react";
import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client/react";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { VehicleForm, VehicleFormValues } from "../components/VehicleForm";
import { useAuth } from "../auth/useAuth";

interface CreateVehiclePayload {
    createVehicle: {
        id: string;
        vin: string;
    };
}

const CREATE_VEHICLE_MUTATION = gql`
  mutation CreateVehicle($input: VehicleInput!) {
    createVehicle(input: $input) {
      id
      vin
    }
  }
`;

const defaultValues: VehicleFormValues = {
    vin: "",
    name: "",
    modelCode: "",
    tractionType: "RWD",
    releaseYear: new Date().getFullYear().toString(),
    batchNumber: "",
    color: "",
    mileage: "0",
    status: "ACTIVE",
};

export const VehicleCreatePage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [createVehicle, { loading, error }] = useMutation<CreateVehiclePayload>(CREATE_VEHICLE_MUTATION);

    if (!user || user.role.name === "Viewer") {
        return (
            <Box>
                <Typography variant="h6">You do not have permission to create vehicles.</Typography>
            </Box>
        );
    }

    const handleSubmit = async (values: VehicleFormValues) => {
        const res = await createVehicle({
            variables: {
                input: {
                    vin: values.vin,
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
        if (res.data?.createVehicle) {
            navigate(`/vehicles/${res.data.createVehicle.id}`);
        }
    };

    return (
        <Box>
            {loading && <CircularProgress size={24} sx={{ mb: 2 }} />}
            <VehicleForm
                title="Create Vehicle"
                initialValues={defaultValues}
                onSubmit={handleSubmit}
                loading={loading}
                errorMessage={error?.message}
            />
        </Box>
    );
};
