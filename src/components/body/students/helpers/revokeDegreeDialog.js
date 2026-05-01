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
import { useState, useEffect } from "react";

const RevokeDegreeDialog = ({ open, onClose, onConfirm, student }) => {
    const [reason, setReason] = useState("");

    useEffect(() => {
        if (open) {
            setReason("");
        }
    }, [open]);

    const handleClose = () => {
        setReason("");
        onClose();
    };

    const handleConfirm = () => {
        if (!reason.trim()) return;

        onConfirm(() => student, reason.trim());
        handleClose();
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
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
                    {student?.name || "Unknown Student"}
                </Typography>

                <TextField
                    multiline
                    fullWidth
                    minRows={4}
                    placeholder="Enter revoke reason..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    autoFocus
                    sx={{
                        "& .MuiOutlinedInput-root": {
                            color: "#fff",
                        },
                        "& textarea": { color: "#fff" },
                    }}
                />
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
                <Button
                    onClick={handleClose}
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
                    disabled={!reason.trim()}
                    variant="contained"
                    sx={{
                        bgcolor: "#00eaff",
                        color: "#000",
                        fontWeight: 600,
                        borderRadius: 2,
                        px: 2,
                        "&:disabled": {
                            bgcolor: "rgba(0,234,255,0.3)",
                            color: "#000",
                        },
                    }}
                >
                    Confirm Revoke
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default RevokeDegreeDialog;