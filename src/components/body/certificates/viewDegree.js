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
    Divider,
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

import useWalletStore from "../../../helpers/infoStore/useWalletStore";
import { logTransaction } from "../../../utils/logTransactions";
import Server from "../../../server";
import Toast from "../../../utils/toast";

// ------------------ UTIL: Convert IPFS → HTTPS ------------------ //
const ipfsToHttp = (uri) => {
    if (!uri) return "";
    return uri.startsWith("ipfs://")
        ? `https://gateway.pinata.cloud/ipfs/${uri.replace("ipfs://", "")}`
        : uri;
};

const ViewDegree = ({ open, setOpenDetails, selectedCert }) => {
    const { contract } = useWalletStore();

    const [loading, setLoading] = useState(false);
    const [metadata, setMetadata] = useState(null);
    const [degreeImage, setDegreeImage] = useState("");
    const [imageLoaded, setImageLoaded] = useState(false);

    const [logs, setLogs] = useState([]);
    const [logsLoading, setLogsLoading] = useState(false);

    const hasLoaded = !!degreeImage;

    // Fetch Activity Logs when dialog opens
    useEffect(() => {
        if (open && selectedCert?.id) {
            fetchLogs();
        }
    }, [open, selectedCert]);

    const fetchLogs = async () => {
        try {
            if (!selectedCert?.id) return;
            setLogsLoading(true);
            const res = await Server.getLogsbyStudentID(selectedCert?.id);
            
            setLogs(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Failed to fetch logs:", err);
        } finally {
            setLogsLoading(false);
        }
    };

    const handleLoad = async () => {
        if (!contract || !selectedCert) return;

        // Optional: prevent load if revoked
        if (selectedCert.is_revoked) {
            Toast.error("Degree has been revoked. Certificate cannot be loaded.");
            return;
        }

        setLoading(true);
        setImageLoaded(false);

        try {
            const tokenURI = await contract.tokenURI(selectedCert.degree_token_id);
            const metaURL = ipfsToHttp(tokenURI);

            const res = await fetch(metaURL);
            const json = await res.json();

            console.log("Metadata JSON =>", json);

            setMetadata(json);

            // support both old `image` and new `credentialSubject.imageCID`
            const cid =
                json.credentialSubject?.imageCID ||
                json.image ||
                "";

            setDegreeImage(ipfsToHttp(cid));

            // Optional: log load
            const extractedCID = cid.replace("ipfs://", "");
            await logTransaction({
                degree_token_id: selectedCert.degree_token_id,
                functionName: "LOAD_TOKEN_URI",
                contract,
                metadataCid: extractedCID,
            });
        } catch (err) {
            console.error("Metadata load failed:", err);
            const reason = err?.reason || err?.message || "Unable to load certificate";
            if (reason.toLowerCase().includes("revoked")) {
                Toast.error("Degree revoked for this student!");
            } else {
                Toast.error(reason);
            }
        } finally {
            setLoading(false);
        }
    };

    // DOWNLOAD
    const handleDownload = async () => {
        if (!degreeImage || !selectedCert) return;

        const cid = (degreeImage.split("/ipfs/")[1] || "").trim();

        await logTransaction({
            degree_token_id: selectedCert.degree_token_id,
            functionName: "DOWNLOAD_CERT",
            contract,
            metadataCid: cid,
        });

        window.open(degreeImage, "_blank");
    };


    // PRINT
    const handlePrint = async () => {
        if (!degreeImage || !selectedCert) return;

        const cid = (degreeImage.split("/ipfs/")[1] || "").trim();

        await logTransaction({
            degree_token_id: selectedCert.degree_token_id,
            functionName: "PRINT_CERT",
            contract,
            metadataCid: cid,
        });

        const w = window.open("");
        w.document.write(`<img src="${degreeImage}" style="width:100%;" />`);
        w.print();
    };

    const dialogCloseHandler = async () => {
        setOpenDetails(false)
        setDegreeImage("")
    }

    return (
        <Dialog
            open={open}
            onClose={() => setOpenDetails(false)}
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
                Certificate Details
                <IconButton onClick={dialogCloseHandler}>
                    <CloseIcon sx={{ color: "#00eaff" }} />
                </IconButton>
            </DialogTitle>

            {/* MAIN CONTENT - NO SCROLL */}
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
                            </Box>
                        </Box>
                    )}

                    {/* BASIC INFO */}
                    <Box sx={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 3 }}>
                        <Box>
                            <Typography sx={{ color: "#9cc8e2" }}>Student</Typography>
                            <Typography sx={{ fontSize: "1.2rem", fontWeight: 600 }}>
                                {selectedCert?.student}
                            </Typography>

                            <Typography sx={{ color: "#9cc8e2", mt: 2 }}>Degree</Typography>
                            <Typography>{selectedCert?.degree}</Typography>
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

                    <Divider sx={{ borderColor: "rgba(255,255,255,0.1)" }} />

                    {/* CERTIFICATE PREVIEW */}
                    <Box sx={{ position: "relative", minHeight: 380 }}>

                        {!hasLoaded && !loading && (
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
                                Certificate preview will appear here.
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

                        {!hasLoaded && !loading && (
                            <Button
                                variant="contained"
                                onClick={handleLoad}
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
                    {imageLoaded && (
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

                            {selectedCert.tx_hash && (
                                <Button
                                    variant="outlined"
                                    startIcon={<LaunchIcon />}
                                    onClick={() =>
                                        window.open(
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

                    {/* LOGS WITH SCROLL */}
                    <Box
                        sx={{
                            p: 2,
                            borderRadius: 2,
                            border: "1px solid rgba(0,234,255,0.3)",
                            background: "rgba(0,234,255,0.05)",
                            maxHeight: 250,
                            overflowY: "auto",
                        }}
                    >
                        <Typography
                            sx={{
                                color: "#00eaff",
                                fontSize: "1.1rem",
                                fontWeight: 600,
                                mb: 1,
                            }}
                        >
                            📜 Activity Logs
                        </Typography>

                        {logsLoading ? (
                            <Typography sx={{ color: "#9cc8e2" }}>Loading logs...</Typography>
                        ) : logs.length === 0 ? (
                            <Typography sx={{ color: "#9cc8e2" }}>No logs found.</Typography>
                        ) : (
                            logs.map((log, i) => (
                                <Box
                                    key={i}
                                    sx={{
                                        p: 1.5,
                                        mb: 1,
                                        borderRadius: 1,
                                        border: "1px solid rgba(255,255,255,0.15)",
                                        background: "rgba(255,255,255,0.05)",
                                    }}
                                >
                                    <Typography sx={{ color: "#fff", fontSize: "0.9rem" }}>
                                        <b style={{ color: "#00eaff" }}>
                                            {log.function?.toUpperCase()}
                                        </b>{" "}
                                        —{" "}
                                        {moment(Number(log.timestamp)).format(
                                            "YYYY-MM-DD HH:mm:ss"
                                        )}
                                    </Typography>

                                    <Typography
                                        sx={{
                                            fontFamily: "monospace",
                                            fontSize: "0.75rem",
                                            color: "#9cc8e2",
                                        }}
                                    >
                                        Wallet: {log.wallet}
                                    </Typography>

                                    {log.metadata_cid && (
                                        <Typography
                                            sx={{
                                                fontFamily: "monospace",
                                                fontSize: "0.75rem",
                                                color: "#9cc8e2",
                                            }}
                                        >
                                            CID: {log.metadata_cid}
                                        </Typography>
                                    )}
                                </Box>
                            ))
                        )}
                    </Box>

                    {/* QR CODE */}
                    {imageLoaded && metadata?.verifyUrl && (
                        <Box sx={{ mt: 2, textAlign: "center" }}>
                            <Typography sx={{ color: "#00eaff", fontWeight: 600 }}>
                                Verification QR
                            </Typography>
                            <QRCode value={metadata.verifyUrl} size={170} />
                            <Typography sx={{ mt: 1, color: "#9cc8e2" }}>
                                Scan to verify degree
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

export default ViewDegree;
