import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    TextField,
    Box,
} from "@mui/material";
import { useState } from "react";

const RevokeDegreeDialog = ({ open, onClose, onConfirm, student }) => {
    const [reason, setReason] = useState("");

    const handleConfirm = () => {
        if (!reason.trim()) return;
        onConfirm(student, reason);
        setReason("");
        onClose()
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="sm"
            PaperProps={{
                sx: {
                    bgcolor: "#0b0f19",
                    color: "#fff",
                    border: "1px solid rgba(0,234,255,0.3)",
                    borderRadius: 3,
                    boxShadow: "0 0 25px rgba(0,234,255,0.25)",
                },
            }}
        >
            <DialogTitle sx={{ color: "#00eaff", fontWeight: 700 }}>
                ⚠ Revoke Degree
            </DialogTitle>

            <DialogContent>
                <Typography sx={{ mb: 1, color: "#9cc8e2" }}>
                    Please enter a reason for revoking the degree of:
                </Typography>
                <Typography sx={{ fontWeight: 600, mb: 2 }}>
                    {student?.name}
                </Typography>

                <TextField
                    multiline
                    fullWidth
                    minRows={4}
                    placeholder="Enter revoke reason..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    sx={{
                        "& .MuiOutlinedInput-root": {
                            color: "#fff",
                            borderColor: "#00eaff",
                        },
                        "& textarea": { color: "#fff" },
                    }}
                />
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
                <Button
                    onClick={onClose}
                    sx={{
                        color: "#00eaff",
                        border: "1px solid rgba(0,234,255,0.5)",
                        borderRadius: 2,
                        px: 2,
                    }}
                >
                    Cancel
                </Button>

                <Button
                    onClick={handleConfirm}
                    variant="contained"
                    sx={{
                        bgcolor: "#00eaff",
                        color: "#000",
                        fontWeight: 600,
                        borderRadius: 2,
                    }}
                >
                    Confirm Revoke
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default RevokeDegreeDialog;
