import React, { useEffect, useState } from "react";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import {
    Box,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Typography,
    Alert,
} from "@mui/material";

const MOVEMENT_REPORT = gql`
  query MovementReport($from: Time!, $to: Time!) {
    movementReport(from: $from, to: $to) {
      type
      count
    }
  }
`;

interface MovementReportRow {
    type: string;
    count: number;
}

interface MovementReportData {
    movementReport: MovementReportRow[];
}

export const ReportPage: React.FC = () => {
    const [range, setRange] = useState(() => {
        const to = new Date();
        const from = new Date();
        from.setDate(to.getDate() - 30);
        const fmt = (d: Date) => d.toISOString().slice(0, 16);
        return { from: fmt(from), to: fmt(to) };
    });

    const { data, loading, error, refetch } = useQuery<MovementReportData>(MOVEMENT_REPORT, {
        variables: { from: new Date(range.from).toISOString(), to: new Date(range.to).toISOString() },
    });

    useEffect(() => {
        refetch({ from: new Date(range.from).toISOString(), to: new Date(range.to).toISOString() });
    }, [range.from, range.to, refetch]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setRange((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const rows = data?.movementReport ?? [];

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Typography variant="h4">Movement Report</Typography>

            <Paper sx={{ p: 2, display: "flex", gap: 2, flexWrap: "wrap", alignItems: "flex-end" }}>
                <TextField
                    label="From"
                    name="from"
                    type="datetime-local"
                    value={range.from}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                    sx={{ minWidth: 240 }}
                />
                <TextField
                    label="To"
                    name="to"
                    type="datetime-local"
                    value={range.to}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                    sx={{ minWidth: 240 }}
                />
                <Button variant="contained" onClick={() => refetch({ from: new Date(range.from).toISOString(), to: new Date(range.to).toISOString() })} disabled={loading}>
                    {loading ? "Loading..." : "Refresh"}
                </Button>
            </Paper>

            <Paper>
                <Box sx={{ p: 2 }}>
                    <Typography variant="h6">Results</Typography>
                    {error && (
                        <Alert severity="error" sx={{ mt: 1 }}>
                            {error.message}
                        </Alert>
                    )}
                </Box>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Type</TableCell>
                            <TableCell>Count</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map((row) => (
                            <TableRow key={row.type}>
                                <TableCell>{row.type}</TableCell>
                                <TableCell>{row.count}</TableCell>
                            </TableRow>
                        ))}
                        {rows.length === 0 && !loading && (
                            <TableRow>
                                <TableCell colSpan={2} align="center">
                                    No data for the selected range.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Paper>
        </Box>
    );
};
