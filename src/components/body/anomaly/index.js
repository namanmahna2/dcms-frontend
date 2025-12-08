import { useEffect, useMemo, useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import CustomSkeleton from "../../helpers/customSkeleton";
import { useLogs } from "../../../helpers/queryHooks/blockchain_logs";
import useSocket from "../../../utils/sockets";
import Server from "../../../server";
import moment from "moment";
import Toast from "../../../utils/toast";
import { useQueryClient } from "@tanstack/react-query";

const keyMap = {
    created_at: "Created At",
    type: "Type",
    issuer_id: "Issuer Id",
    student_id: "Student Id",
    client_ip: "IP",
    wallet_address: "Wallet Address",
    tx_hash: "Tx Hash",
    anomaly_score: "Anomaly Score",
    details: "Details",
    handled: "Handled",
};

const ANOMALY_LABELS = {
    unusual_gas_usage: "Unusual Gas Usage",
    rapid_minting: "Rapid Minting",
    wallet_impersonation: "Wallet Impersonation",
    ipfs_abuse: "IPFS Abuse",
    metadata_tampering: "Metadata Tampering",
    suspicious_wallet_pattern: "Suspicious Wallet Pattern",
    replay_attack: "Replay Attack",
};

const formatRow = (item, index = {}) => ({
    // ensure id exists (DataGrid requires id)
    id: index + 1,
    actual_id: item.id,
    created_at: item.created_at ? moment(item.created_at).format("YYYY-MM-DD HH:mm:ss") : "N/A",
    type: ANOMALY_LABELS[item.type] || item.type || "N/A",
    issuer_id: item.issuer_id ?? "N/A",
    student_id: item.student_id ?? "N/A",
    client_ip: item.client_ip || "N/A",
    wallet_address: item.wallet_address || "N/A",
    tx_hash: item.tx_hash || "N/A",
    anomaly_score: item.anomaly_score ?? "",
    details: item.details ?? "",
    handled: typeof item.handled === "boolean" ? (item.handled ? "Yes" : "No") : "No",
    is_ip_blocked: item.is_ip_blocked
});

const Anomaly = () => {
    const queryClient = useQueryClient();
    const [localRows, setLocalRows] = useState([]);
    const [highlighted, setHighlighted] = useState([]);
    const {
        data: rows = {},
        isLoading,
        isError,
        refetch: refetchLogs
    } = useLogs();
    const { messages = [] } = useSocket("http://localhost:3011");

    // populate localRows from the API response safely
    useEffect(() => {
        const incoming = Array.isArray(rows?.data) ? rows.data : [];
        const mapped = incoming.map(formatRow);
        setLocalRows(mapped);
    }, [rows?.data]);

    const highlight = (id) => {
        if (!id) return;
        setHighlighted((prev) => [...prev, id]);
        setTimeout(() => {
            setHighlighted((prev) => prev.filter((x) => x !== id));
        }, 3000);
    };

    const handleBlockIP = async (ip) => {
        try {
            if (!ip || ip === "N/A") {
                alert("No IP available for this row.");
                return;
            }
            console.log("Block IP:", ip);
            const apiResponse = await Server.blockIP(ip)

            Toast.success(apiResponse.message)
            refetchLogs()
            // queryClient.invalidateQueries('logs')
        } catch (error) {
            Toast.error("Something went wrong")
            console.error(error)
        }
    };

    const handleMarkHandled = (rowId) => {
        setLocalRows((prev) =>
            prev.map((row) =>
                row.id === rowId ? { ...row, handled: "Yes" } : row
            )
        );
        console.log("Marked handled:", rowId);

        // TODO: API call if needed
    };


    // LIVE UPDATE LOGIC (messages could be empty)
    useEffect(() => {
        if (!Array.isArray(messages) || messages.length === 0) return;

        const latest = messages[messages.length - 1];
        if (!latest?.id) return;

        // fetch only the new log entry
        Server.getLogs(latest.id)
            .then((res) => {
                const newLog = Array.isArray(res?.data) ? res.data[0] : res?.data;
                if (!newLog || typeof newLog !== "object") return;

                setLocalRows((prev) => {
                    // prevent duplicates (by id)
                    if (prev.some((r) => r.id === newLog.id)) return prev;

                    return [formatRow(newLog), ...prev];
                });

                highlight(newLog.id);
            })
            .catch((err) => {
                console.error("Failed fetching new log:", err);
            });
    }, [messages]);

    const columns = useMemo(() => {
        return [
            { field: "id", headerName: "ID", width: 80 },

            { field: "type", headerName: "Type", minWidth: 180, flex: 1 },
            { field: "client_ip", headerName: "IP", width: 150 },
            { field: "wallet_address", headerName: "Wallet Address", minWidth: 220, flex: 1 },
            { field: "tx_hash", headerName: "Tx Hash", minWidth: 220, flex: 1 },

            { field: "created_at", headerName: "Created At", minWidth: 180 },
            { field: "issuer_id", headerName: "Issuer Id", width: 140 },
            { field: "student_id", headerName: "Student Id", width: 140 },

            { field: "anomaly_score", headerName: "Score", width: 120 },
            { field: "handled", headerName: "Handled", width: 120 },

            {
                field: "actions",
                headerName: "Actions",
                width: 200,
                sortable: false,
                renderCell: (params) => {
                    const row = params.row;
                    return (
                        <Box
                            sx={{
                                display: "flex",
                                gap: 1,
                                justifyContent: "center",
                            }}
                        >
                            <Button
                                variant="contained"
                                color="error"
                                size="small"
                                disabled={row.is_ip_blocked}
                                onClick={() => handleBlockIP(row.actual_id)}
                                sx={{ textTransform: "none" }}
                            >
                                Block IP
                            </Button>
                        </Box>
                    );
                }

            }
        ];
    }, []);



    if (isLoading && !rows?.data?.length) {
        return <CustomSkeleton />;
    }
    if (isError) return <Typography color="error">Error loading logs</Typography>;

    return (
        <Box sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            color: "#fff",
            p: 3,
            bgcolor: "#0b0f19",
        }}>
            <Box sx={{ p: 3, borderRadius: "20px", background: "#0f2027" }}>
                <Box sx={{ height: "72vh" }}>
                    <DataGrid
                        rows={localRows}
                        columns={columns}
                        pageSizeOptions={[20, 50, 100]}
                        initialState={{
                            pagination: { paginationModel: { pageSize: 20, page: 0 } },
                        }}
                        disableRowSelectionOnClick
                        sx={{
                            color: "white",
                            border: "none",
                            fontSize: "14px",

                            "& .MuiDataGrid-columnHeaders": {
                                background: "#162c35",
                                color: "#00e5ff",
                                fontWeight: "bold",
                                fontSize: "15px",
                                borderRadius: "10px 10px 0 0",
                            },

                            "& .MuiDataGrid-row": {
                                background: "#0f2027",
                            },

                            "& .MuiDataGrid-cell": {
                                borderColor: "#1b3a49",
                            },

                            "& .highlight-row": {
                                animation: "flash 0.6s ease-in-out alternate",
                                backgroundColor: "rgba(0,229,255,0.3) !important",
                            },

                            "@keyframes flash": {
                                from: { backgroundColor: "rgba(0,229,255,0.1)" },
                                to: { backgroundColor: "rgba(0,229,255,0.4)" },
                            }
                        }}
                    />

                </Box>
            </Box>
        </Box>
    );
};

export default Anomaly;
