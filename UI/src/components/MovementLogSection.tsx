import React, { useMemo, useState } from "react";
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    MenuItem,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from "@mui/material";

export interface MovementLogItem {
    id: string;
    type: string;
    description?: string | null;
    occurredAt: string;
    createdAt: string;
    createdBy: string;
}

interface MovementLogSectionProps {
    movements: MovementLogItem[];
    canCreate: boolean;
    loading?: boolean;
    onCreate: (input: MovementFormValues) => Promise<void>;
}

export type MovementFormValues = {
    type: string;
    description: string;
    occurredAt: string;
};

const movementTypes = ["SALE", "DEFECT", "DISCONTINUED", "TRANSFER", "RETURN"];

const defaultMovementForm: MovementFormValues = {
    type: "SALE",
    description: "",
    occurredAt: new Date().toISOString().slice(0, 16),
};

export const MovementLogSection: React.FC<MovementLogSectionProps> = ({
    movements,
    canCreate,
    loading,
    onCreate,
}) => {
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState<MovementFormValues>(defaultMovementForm);
    const [formError, setFormError] = useState<string | null>(null);

    const rows = useMemo(() => movements ?? [], [movements]);

    const handleOpen = () => {
        setForm({ ...defaultMovementForm, occurredAt: new Date().toISOString().slice(0, 16) });
        setFormError(null);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setFormError(null);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await onCreate(form);
            handleClose();
        } catch (err) {
            setFormError(err instanceof Error ? err.message : "Failed to create movement");
        }
    };

    return (
        <Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="h6">Movements</Typography>
                {canCreate && (
                    <Button variant="contained" onClick={handleOpen}>
                        Add Movement
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
                    {rows.map((movement) => (
                        <TableRow key={movement.id}>
                            <TableCell>{movement.type}</TableCell>
                            <TableCell>{movement.description ?? "-"}</TableCell>
                            <TableCell>{new Date(movement.occurredAt).toLocaleString()}</TableCell>
                            <TableCell>{new Date(movement.createdAt).toLocaleString()}</TableCell>
                            <TableCell>{movement.createdBy}</TableCell>
                        </TableRow>
                    ))}
                    {rows.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={5} align="center">
                                No movements recorded.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
                <form onSubmit={handleSubmit}>
                    <DialogTitle>Add Movement</DialogTitle>
                    <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
                        <TextField select label="Type" name="type" value={form.type} onChange={handleChange}>
                            {movementTypes.map((type) => (
                                <MenuItem key={type} value={type}>
                                    {type}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            label="Occurred At"
                            name="occurredAt"
                            type="datetime-local"
                            value={form.occurredAt}
                            onChange={handleChange}
                            required
                        />
                        <TextField
                            label="Description"
                            name="description"
                            multiline
                            minRows={3}
                            value={form.description}
                            onChange={handleChange}
                        />
                        {formError && (
                            <Typography color="error" variant="body2">
                                {formError}
                            </Typography>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose}>Cancel</Button>
                        <Button type="submit" variant="contained" disabled={loading}>
                            {loading ? "Saving..." : "Save"}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Box>
    );
};
