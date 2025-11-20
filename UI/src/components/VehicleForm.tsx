import React, { useEffect, useState } from "react";
import { Box, Button, MenuItem, TextField, Typography } from "@mui/material";

export type VehicleFormValues = {
    vin: string;
    name: string;
    modelCode: string;
    tractionType: string;
    releaseYear: string;
    batchNumber: string;
    color: string;
    mileage: string;
    status: string;
};

interface VehicleFormProps {
    title: string;
    initialValues: VehicleFormValues;
    isEdit?: boolean;
    loading?: boolean;
    errorMessage?: string;
    onSubmit: (values: VehicleFormValues) => Promise<void> | void;
}

const tractionOptions = ["RWD", "FWD", "AWD", "FOUR_WD"];
const statusOptions = ["ACTIVE", "INACTIVE", "DISCONTINUED"];

export const VehicleForm: React.FC<VehicleFormProps> = ({
    title,
    initialValues,
    isEdit,
    loading,
    errorMessage,
    onSubmit,
}) => {
    const [values, setValues] = useState<VehicleFormValues>(initialValues);

    useEffect(() => {
        setValues(initialValues);
    }, [initialValues]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setValues((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(values);
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography variant="h6">{title}</Typography>
            <TextField
                label="VIN"
                name="vin"
                value={values.vin}
                onChange={handleChange}
                required
                disabled={isEdit}
            />
            <TextField label="Name" name="name" value={values.name} onChange={handleChange} required />
            <TextField label="Model Code" name="modelCode" value={values.modelCode} onChange={handleChange} required />
            <TextField select label="Traction Type" name="tractionType" value={values.tractionType} onChange={handleChange}>
                {tractionOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                        {option}
                    </MenuItem>
                ))}
            </TextField>
            <TextField
                label="Release Year"
                name="releaseYear"
                type="number"
                value={values.releaseYear}
                onChange={handleChange}
                required
            />
            <TextField label="Batch Number" name="batchNumber" value={values.batchNumber} onChange={handleChange} required />
            <TextField label="Color" name="color" value={values.color} onChange={handleChange} />
            <TextField
                label="Mileage"
                name="mileage"
                type="number"
                value={values.mileage}
                onChange={handleChange}
                required
            />
            <TextField select label="Status" name="status" value={values.status} onChange={handleChange}>
                {statusOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                        {option}
                    </MenuItem>
                ))}
            </TextField>
            {errorMessage && (
                <Typography color="error" variant="body2">
                    {errorMessage}
                </Typography>
            )}
            <Button type="submit" variant="contained" disabled={loading}>
                {loading ? "Saving..." : isEdit ? "Save Changes" : "Create Vehicle"}
            </Button>
        </Box>
    );
};
