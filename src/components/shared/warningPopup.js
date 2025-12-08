// src/components/common/WarningPopup.js
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Fade,
    Stack,
} from "@mui/material";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

const WarningPopup = ({
    open,
    action = "delete",
    renderData = {},
    onConfirm,
    onCancel,
}) => {
    console.log("render data ", renderData)
    const isDelete = action === "delete";
    const iconColor = isDelete ? "#ff4d4d" : "#00eaff";
    const actionLabel = isDelete ? "Delete" : "Update";

    return (
        <Dialog
            open={open}
            onClose={onCancel}
            fullWidth
            maxWidth="xs"
            TransitionComponent={Fade}
            PaperProps={{
                sx: {
                    bgcolor: "#0b0f19",
                    color: "#fff",
                    border: `1px solid ${isDelete ? "rgba(255,77,77,0.3)" : "rgba(0,234,255,0.3)"}`,
                    borderRadius: 3,
                    boxShadow: `0 0 25px ${isDelete ? "rgba(255,77,77,0.25)" : "rgba(0,234,255,0.25)"}`,
                },
            }}
        >
            <DialogTitle
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    color: iconColor,
                    fontWeight: 700,
                    borderBottom: "1px solid rgba(255,255,255,0.1)",
                }}
            >
                {isDelete ? (
                    <WarningAmberRoundedIcon color="error" />
                ) : (
                    <CheckCircleOutlineIcon sx={{ color: "#00eaff" }} />
                )}
                {isDelete ? "Confirm Deletion" : "Confirm Update"}
            </DialogTitle>

            <DialogContent sx={{ mt: 2 }}>
                <Stack spacing={1}>
                    <Typography variant="body2" sx={{ color: "#ccc" }}>
                        {isDelete
                            ? `Are you sure you want to delete "${renderData?.name || "this record"}"? This action cannot be undone.`
                            : `Do you want to apply these changes to "${renderData?.name || "this record"}"?`}
                    </Typography>

                    {renderData && (
                        <>
                            <Typography
                                variant="caption"
                                sx={{
                                    color: "rgba(255,255,255,0.5)",
                                    fontStyle: "italic",
                                }}
                            >
                                Name: {renderData?.name || "—"}
                            </Typography>
                            <Typography
                                variant="caption"
                                sx={{
                                    color: "rgba(255,255,255,0.5)",
                                    fontStyle: "italic",
                                }}
                            >
                                Email: {renderData?.email || "—"}
                            </Typography>
                        </>
                    )}
                </Stack>
            </DialogContent>

            <DialogActions
                sx={{
                    borderTop: "1px solid rgba(255,255,255,0.1)",
                    p: 2,
                    display: "flex",
                    justifyContent: "flex-end",
                }}
            >
                <Button
                    onClick={onCancel}
                    sx={{
                        color: "#00eaff",
                        border: "1px solid rgba(0,234,255,0.5)",
                        borderRadius: 2,
                        px: 2.5,
                        "&:hover": {
                            bgcolor: "rgba(0,234,255,0.08)",
                            borderColor: "#00bcd4",
                        },
                    }}
                >
                    Cancel
                </Button>

                <Button
                    variant="contained"
                    onClick={() => onConfirm(renderData.id)}
                    sx={{
                        bgcolor: iconColor,
                        color: isDelete ? "#fff" : "#000",
                        fontWeight: 600,
                        px: 3,
                        borderRadius: 2,
                        "&:hover": {
                            bgcolor: isDelete ? "#ff6666" : "#00bcd4",
                        },
                    }}
                >
                    {actionLabel}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default WarningPopup;
