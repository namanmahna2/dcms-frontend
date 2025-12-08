import { useState } from "react";
import {
    Box,
    Button,
    Typography,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from "@mui/material";
import jsQR from "jsqr";
import Toast from "../utils/toast";
import Server from "../server";

export default function QRUploadAndVerify({ onResult }) {
    const [qrPreview, setQrPreview] = useState(null);
    const [qrData, setQrData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [openZoom, setOpenZoom] = useState(false);

    const handleQrUpload = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const imgSrc = e.target.result;
            setQrPreview(imgSrc);

            // Show dialog when preview is ready
            setOpenDialog(true);

            const img = new Image();
            img.src = imgSrc;
            img.onload = () => processQrImage(img);
        };
        reader.readAsDataURL(file);
    };

    // PROCESS QR IMAGE USING jsQR
    const processQrImage = (img) => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const qr = jsQR(imageData.data, canvas.width, canvas.height);

        if (qr?.data) {
            setQrData(qr.data);
            Toast.success("QR code detected!");
        } else {
            Toast.error("No QR code found.");
        }
    };

    const verifyFromQr = async () => {
        if (!qrData) {
            Toast.error("Upload a QR-enabled degree first.");
            return;
        }

        setLoading(true);

        try {
            const parsed = JSON.parse(qrData);
            const tokenId = parsed.tokenId;

            if (!tokenId) {
                Toast.error("Invalid QR format: tokenId missing");
                return;
            }

            const response = await Server.verifyDegreeToken(tokenId, qrData);
            onResult?.(response);
            setOpenDialog(false);
        } catch (error) {
            console.error(error.response);
            Toast.error(error.response.data.message || "QR data invalid or verification failed.");
        }

        setLoading(false);
    };

    return (
        <>
            <Box
                sx={{
                    border: "2px dashed rgba(0,234,255,0.3)",
                    padding: "30px",
                    textAlign: "center",
                    borderRadius: "12px",
                    cursor: "pointer",
                    background: "rgba(255, 255, 255, 0.04)",
                    "&:hover": { background: "rgba(255,255,255,0.07)" },
                }}
                onClick={() => document.getElementById("qrUploadInput").click()}
            >
                <Typography sx={{ mb: 1 }}>Click or drag a degree certificate</Typography>
                <Typography sx={{ color: "#00eaff", fontWeight: 700 }}>
                    Upload & Scan QR
                </Typography>

                <input
                    type="file"
                    accept="image/*"
                    id="qrUploadInput"
                    hidden
                    onChange={handleQrUpload}
                />
            </Box>

            {/* QR Preview Dialog */}
            <Dialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                maxWidth="lg"
                fullWidth
                PaperProps={{
                    sx: {
                        background: "#0b0f19",
                        color: "#fff",
                        borderRadius: 3,
                        border: "1px solid rgba(0,234,255,0.3)",
                    },
                }}
            >
                <DialogTitle sx={{ fontWeight: 700, color: "#00eaff" }}>
                    QR Code Preview
                </DialogTitle>

                <DialogContent sx={{ textAlign: "center" }}>
                    {qrPreview && (
                        <img
                            src={qrPreview}
                            alt="Uploaded"
                            onClick={() => setOpenZoom(true)}
                            style={{
                                width: "500px",
                                borderRadius: 10,
                                marginTop: 10,
                                border: "1px solid rgba(0,234,255,0.4)",
                                boxShadow: "0 0 12px rgba(0,234,255,0.2)",
                                cursor: "zoom-in",
                            }}
                        />
                    )}

                </DialogContent>

                <DialogActions sx={{ p: 2 }}>
                    <Button
                        onClick={() => setOpenDialog(false)}
                        sx={{
                            color: "#00eaff",
                            border: "1px solid rgba(0,234,255,0.4)",
                            borderRadius: 2,
                            textTransform: "none",
                        }}
                    >
                        Cancel
                    </Button>

                    <Button
                        variant="contained"
                        disabled={loading || !qrData}
                        onClick={verifyFromQr}
                        sx={{
                            bgcolor: "#00eaff",
                            color: "#000",
                            fontWeight: 700,
                            px: 3,
                            borderRadius: 2,
                            textTransform: "none",
                            "&:hover": { bgcolor: "#00cce0" },
                        }}
                    >
                        {loading ? (
                            <CircularProgress size={22} sx={{ color: "#000" }} />
                        ) : (
                            "Verify"
                        )}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
