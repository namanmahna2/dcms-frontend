import { useEffect, useState } from "react";
import {
    Box,
    Typography,
    Paper,
    TextField,
    Button,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    TableContainer,
    IconButton,
    Tooltip,
    Stack,
    CircularProgress,
    Chip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";

import IssueCertificateDialog from "./issueCertificate";
import ViewDegree from "./viewDegree";
import moment from "moment/moment";

import { UseAllCertificate } from "../../../helpers/queryHooks/allCertificates";
import useTabStore from "../../../helpers/infoStore/tabStore";

const Certificates = () => {
    const [search, setSearch] = useState("");
    const [openIssue, setOpenIssue] = useState(false);
    const [openDetails, setOpenDetails] = useState(false);
    const [selectedCert, setSelectedCert] = useState(null);

    const { tabName } = useTabStore();

    // React Query fetch
    const {
        data: certs = [],
        isFetching: isLoading,
        refetch: refetchCertData
    } = UseAllCertificate({ enabled: true });

    // 👇 Re-fetch certificates whenever tab changes
    useEffect(() => {
        if (tabName === "certificates") {
            refetchCertData();
        }
    }, [tabName]);


    const filtered = certs.filter(
        (c) =>
            c?.student?.toLowerCase().includes(search.toLowerCase()) ||
            c?.degree?.toLowerCase().includes(search.toLowerCase())
    );

    if (isLoading) {
        return (
            <Stack alignItems="center" sx={{ py: 6 }}>
                <CircularProgress color="info" />
            </Stack>
        );
    }

    return (
        <Box
            sx={{
                minHeight: "100%",
                display: "flex",
                flexDirection: "column",
                color: "#fff",
                p: 3,
                bgcolor: "#0b0f19",
            }}
        >
            {/* Header */}
            <Typography
                variant="h5"
                sx={{
                    mb: 3,
                    fontWeight: 700,
                    color: "#00eaff",
                    letterSpacing: 0.5,
                }}
            >
                📜 Certificates
            </Typography>

            <Paper
                sx={{
                    p: 3,
                    flex: 1,
                    bgcolor: "rgba(255,255,255,0.05)",
                    borderRadius: 3,
                    border: "1px solid rgba(255,255,255,0.08)",
                    backdropFilter: "blur(12px)",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                {/* Controls */}
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 2,
                    }}
                >
                    <TextField
                        variant="outlined"
                        size="small"
                        placeholder="Search certificates..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        sx={{
                            width: 280,
                            input: { color: "#fff" },
                            "& .MuiOutlinedInput-root": {
                                "& fieldset": { borderColor: "#00eaff" },
                                "&:hover fieldset": { borderColor: "#00eaff" },
                            },
                        }}
                    />

                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setOpenIssue(true)}
                        sx={{
                            bgcolor: "#00eaff",
                            color: "#000",
                            px: 3,
                            fontWeight: 600,
                            "&:hover": { bgcolor: "#00bcd4" },
                        }}
                    >
                        Issue Certificate
                    </Button>
                </Box>

                {/* Table */}
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ bgcolor: "rgba(255,255,255,0.08)" }}>
                                <TableCell sx={{ color: "#00eaff" }}>Student</TableCell>
                                <TableCell sx={{ color: "#00eaff" }}>Degree</TableCell>
                                <TableCell sx={{ color: "#00eaff" }}>Issued Date</TableCell>
                                <TableCell sx={{ color: "#00eaff" }}>Blockchain Tx</TableCell>
                                <TableCell sx={{ color: "#00eaff" }} align="center">
                                    Actions
                                </TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {filtered.map((c) => (
                                <TableRow
                                    key={c.id}
                                    sx={{
                                        "&:hover": {
                                            backgroundColor: "rgba(0,234,255,0.08)",
                                            transition: "0.3s",
                                        },
                                    }}
                                >
                                    <TableCell sx={{ color: "#fff" }}>{c.student}</TableCell>
                                    <TableCell sx={{ color: "#fff" }}>{c.degree}</TableCell>
                                    <TableCell sx={{ color: "#aaa" }}>
                                        {c.issued_at
                                            ? moment(c.issued_at).format("YYYY-MM-DD")
                                            : "N/A"}
                                    </TableCell>
                                    <TableCell sx={{ color: "#00eaff", fontFamily: "monospace" }}>
                                        <Stack direction="row" spacing={1} alignItems="center">

                                            {/* Show tx hash always */}
                                            <span>{c.tx_hash || "N/A"}</span>

                                            {/* Only show this chip if revoked */}
                                            {c.is_revoked && (
                                                <Tooltip title={c.revocation_reason || "Degree Revoked"}>
                                                    <Chip
                                                        label="Revoked"
                                                        size="small"
                                                        color="error"
                                                        sx={{
                                                            height: 22,
                                                            fontSize: "0.7rem",
                                                            fontWeight: 700,
                                                            borderRadius: "6px",
                                                            ml: 1
                                                        }}
                                                    />
                                                </Tooltip>
                                            )}

                                        </Stack>
                                    </TableCell>


                                    <TableCell align="center">
                                        <Tooltip title="View Details">
                                            <IconButton
                                                onClick={() => {
                                                    setSelectedCert(c);
                                                    setOpenDetails(true);
                                                }}
                                            >
                                                <VisibilityIcon sx={{ color: "#00eaff" }} />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* Issue Modal */}
            <IssueCertificateDialog
                open={openIssue}
                setOpenIssue={setOpenIssue}
                refetch={refetchCertData}
            />

            {/* Details Modal */}
            <ViewDegree
                open={openDetails}
                setOpenDetails={setOpenDetails}
                selectedCert={selectedCert}
            />
        </Box>
    );
};

export default Certificates;
