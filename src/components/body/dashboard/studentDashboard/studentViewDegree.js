import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Typography,
    CircularProgress,
    Stack,
    IconButton,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/Download";
import PrintIcon from "@mui/icons-material/Print";
import LaunchIcon from "@mui/icons-material/Launch";
import BlockIcon from "@mui/icons-material/Block";

import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import moment from "moment";

import useWalletStore from "../../../../helpers/infoStore/useWalletStore";
import Toast from "../../../../utils/toast";

// ------------------ UTIL: Convert IPFS → HTTPS ------------------ //
const ipfsToHttp = (uri) => {
    if (!uri) return "";
    return uri.startsWith("ipfs://")
        ? `https://gateway.pinata.cloud/ipfs/${uri.replace("ipfs://", "")}`
        : uri;
};

/**
 * Student-focused ViewDegree dialog.
 * Props:
 *  - open: boolean
 *  - setOpenDetails: (boolean) => void
 *  - selectedCert: {
 *      id,
 *      student,
 *      degree,
 *      issued_at,
 *      is_revoked,
 *      revocation_reason?,
 *      degree_token_id,
 *      tx_hash?
 *    }
 */
const StudentViewDegree = ({ open, setOpenDetails, selectedCert }) => {
    const [loading, setLoading] = useState(false);
    const [metadata, setMetadata] = useState(null);
    const [degreeImage, setDegreeImage] = useState("");
    const [imageLoaded, setImageLoaded] = useState(false);

    const hasLoaded = !!degreeImage;

    const { contract, connectWallet, error: walletError, connecting } = useWalletStore();

    // Reset state when dialog closes or certificate changes
    useEffect(() => {
        if (!open) {
            setDegreeImage("");
            setMetadata(null);
            setImageLoaded(false);
            setLoading(false);
        }
    }, [open, selectedCert]);

    // Auto-connect in read-only student mode when dialog opens
    useEffect(() => {
        if (!open) return;
        if (contract) return;    // already connected
        if (connecting) return;  // avoid spamming

        // We know this component is only used in student dashboard,
        // so force student role → read-only mode.
        connectWallet({
            role: "student",
            auto: true,
        });
    }, [open, contract, connecting, connectWallet]);

    // Show wallet errors (e.g. Ganache not running)
    useEffect(() => {
        if (walletError) {
            Toast.error(walletError);
        }
    }, [walletError]);

    // LOAD CERTIFICATE IMAGE / METADATA
    const handleLoad = async () => {
        if (!contract || !selectedCert) {
            Toast.error("Unable to load certificate. Contract not available.");
            return;
        }

        if (selectedCert.is_revoked) {
            Toast.error("This degree has been revoked. Certificate cannot be loaded.");
            return;
        }

        setLoading(true);
        setImageLoaded(false);

        try {
            const tokenURI = await contract.tokenURI(selectedCert.degree_token_id);
            const metaURL = ipfsToHttp(tokenURI);

            const res = await fetch(metaURL);
            const json = await res.json();

            setMetadata(json);

            const cid =
                json?.credentialSubject?.imageCID ||
                json?.image ||
                "";

            setDegreeImage(ipfsToHttp(cid));
        } catch (err) {
            console.error("Metadata load failed:", err);
            const reason = err?.reason || err?.message || "Unable to load certificate";

            if (reason.toLowerCase().includes("revoked")) {
                Toast.error("Degree revoked for this student.");
            } else {
                Toast.error(reason);
            }
        } finally {
            setLoading(false);
        }
    };

    // DOWNLOAD
    const handleDownload = () => {
        if (!degreeImage || !selectedCert) return;
        window.open(degreeImage, "_blank");
    };

    // PRINT
    const handlePrint = () => {
        if (!degreeImage || !selectedCert) return;

        const w = window.open("");
        w.document.write(`<img src="${degreeImage}" style="width:100%;" />`);
        w.print();
    };

    const dialogCloseHandler = () => {
        setOpenDetails(false);
    };

    return (
        <Dialog
            open={open}
            onClose={dialogCloseHandler}
            fullWidth
            maxWidth="lg"
            PaperProps={{
                sx: {
                    bgcolor: "#0b0f19",
                    color: "#fff",
                    border: "1px solid rgba(0,234,255,0.3)",
                    borderRadius: 3,
                    boxShadow: "0 0 25px rgba(0,234,255,0.25)",
                    backdropFilter: "blur(12px)",
                },
            }}
        >
            <DialogTitle
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    color: "#00eaff",
                    fontWeight: 700,
                    borderBottom: "1px solid rgba(255,255,255,0.1)",
                }}
            >
                My Degree Certificate
                <IconButton onClick={dialogCloseHandler}>
                    <CloseIcon sx={{ color: "#00eaff" }} />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ mt: 2, overflow: "visible" }}>
                <Stack spacing={3}>
                    {/* REVOKED BANNER */}
                    {selectedCert?.is_revoked && (
                        <Box
                            sx={{
                                p: 2,
                                borderRadius: 2,
                                background: "rgba(255,0,0,0.1)",
                                border: "1px solid rgba(255,0,0,0.3)",
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                            }}
                        >
                            <BlockIcon sx={{ color: "#ff4444", fontSize: 30 }} />
                            <Box>
                                <Typography sx={{ fontWeight: 700, color: "#ff4444" }}>
                                    Degree Revoked
                                </Typography>
                                {selectedCert.revocation_reason && (
                                    <Typography sx={{ color: "#ffaaaa" }}>
                                        Reason: {selectedCert.revocation_reason}
                                    </Typography>
                                )}
                                <Typography sx={{ color: "#ffaaaa", mt: 0.5, fontSize: 13 }}>
                                    For clarification, please contact the university registrar.
                                </Typography>
                            </Box>
                        </Box>
                    )}

                    {/* BASIC INFO */}
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            flexWrap: "wrap",
                            gap: 3,
                        }}
                    >
                        <Box>
                            <Typography sx={{ color: "#9cc8e2" }}>Student</Typography>
                            <Typography sx={{ fontSize: "1.2rem", fontWeight: 600 }}>
                                {selectedCert?.student || "N/A"}
                            </Typography>

                            <Typography sx={{ color: "#9cc8e2", mt: 2 }}>Degree</Typography>
                            <Typography>
                                {selectedCert?.degree || "N/A"}
                            </Typography>
                        </Box>

                        <Box>
                            <Typography sx={{ color: "#9cc8e2" }}>Issued Date</Typography>
                            <Typography>
                                {selectedCert?.issued_at
                                    ? moment(selectedCert.issued_at).format("YYYY-MM-DD")
                                    : "N/A"}
                            </Typography>

                            <Typography sx={{ color: "#9cc8e2", mt: 2 }}>Blockchain Tx</Typography>
                            <Typography
                                sx={{
                                    fontFamily: "monospace",
                                    wordBreak: "break-all",
                                    color: "#00eaff",
                                }}
                            >
                                {selectedCert?.tx_hash || "N/A"}
                            </Typography>
                        </Box>
                    </Box>

                    {/* CERTIFICATE PREVIEW */}
                    <Box sx={{ position: "relative", minHeight: 380 }}>
                        {!hasLoaded && !loading && !selectedCert?.is_revoked && (
                            <Box
                                sx={{
                                    height: 380,
                                    background:
                                        "linear-gradient(120deg, #0e1623 0%, #11293f 50%, #0e1623 100%)",
                                    backgroundSize: "250% 250%",
                                    animation: "pulseBG 3s ease infinite",
                                    borderRadius: 3,
                                    border: "1px solid rgba(0,234,255,0.2)",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    color: "#00eaff",
                                    textAlign: "center",
                                }}
                            >
                                Certificate preview will appear here once loaded.
                            </Box>
                        )}

                        {loading && (
                            <Box
                                sx={{
                                    height: 380,
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    backdropFilter: "blur(5px)",
                                }}
                            >
                                <CircularProgress size={60} sx={{ color: "#00eaff" }} />
                            </Box>
                        )}

                        {hasLoaded && (
                            <Box
                                sx={{
                                    mt: 2,
                                    position: "relative",
                                    borderRadius: 3,
                                    overflow: "hidden",
                                    boxShadow: "0 0 24px rgba(0,234,255,0.25)",
                                    border: "1px solid rgba(0,234,255,0.4)",
                                }}
                            >
                                {!imageLoaded && (
                                    <Box
                                        sx={{
                                            position: "absolute",
                                            inset: 0,
                                            background: "rgba(0,0,0,0.6)",
                                            backdropFilter: "blur(6px)",
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            zIndex: 2,
                                        }}
                                    >
                                        <CircularProgress sx={{ color: "#00eaff" }} />
                                    </Box>
                                )}

                                <img
                                    src={degreeImage}
                                    alt="Certificate"
                                    onLoad={() => setImageLoaded(true)}
                                    style={{
                                        width: "100%",
                                        opacity: imageLoaded ? 1 : 0,
                                        transition: "opacity 0.5s ease-in-out",
                                    }}
                                />
                            </Box>
                        )}

                        {/* LOAD BUTTON */}
                        {!hasLoaded && !loading && !selectedCert?.is_revoked && (
                            <Button
                                variant="contained"
                                onClick={handleLoad}
                                disabled={!selectedCert?.tx_hash}
                                sx={{
                                    bgcolor: "#00eaff",
                                    color: "#000",
                                    fontWeight: 700,
                                    px: 4,
                                    mt: 2,
                                    borderRadius: 2,
                                }}
                            >
                                Load Certificate
                            </Button>
                        )}
                    </Box>

                    {/* ACTION BUTTONS */}
                    {imageLoaded && !selectedCert?.is_revoked && (
                        <Stack direction="row" spacing={2} sx={{ mt: 3, flexWrap: "wrap" }}>
                            <Button
                                variant="contained"
                                startIcon={<DownloadIcon />}
                                onClick={handleDownload}
                                sx={{ bgcolor: "#00eaff", color: "#000" }}
                            >
                                Download
                            </Button>

                            <Button
                                variant="outlined"
                                startIcon={<PrintIcon />}
                                onClick={handlePrint}
                                sx={{ color: "#00eaff", borderColor: "#00eaff" }}
                            >
                                Print
                            </Button>

                            {selectedCert?.tx_hash && (
                                <Button
                                    variant="outlined"
                                    startIcon={<LaunchIcon />}
                                    onClick={() =>
                                        window.open(
                                            // For Ganache there is no real explorer;
                                            // keep this URL for when you move to a public testnet.
                                            `https://sepolia.etherscan.io/tx/${selectedCert.tx_hash}`,
                                            "_blank"
                                        )
                                    }
                                    sx={{ color: "#00eaff", borderColor: "#00eaff" }}
                                >
                                    View on Explorer
                                </Button>
                            )}
                        </Stack>
                    )}

                    {/* QR CODE */}
                    {imageLoaded && metadata?.verifyUrl && (
                        <Box sx={{ mt: 3, textAlign: "center" }}>
                            <Typography sx={{ color: "#00eaff", fontWeight: 600 }}>
                                Verification QR
                            </Typography>
                            <QRCode value={metadata.verifyUrl} size={170} />
                            <Typography sx={{ mt: 1, color: "#9cc8e2" }}>
                                Scan to verify this degree on-chain
                            </Typography>
                        </Box>
                    )}
                </Stack>
            </DialogContent>

            <DialogActions>
                <Button
                    onClick={dialogCloseHandler}
                    sx={{
                        color: "#00eaff",
                        border: "1px solid rgba(0,234,255,0.5)",
                        px: 2.5,
                        "&:hover": { bgcolor: "rgba(0,234,255,0.08)" },
                    }}
                >
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default StudentViewDegree;
