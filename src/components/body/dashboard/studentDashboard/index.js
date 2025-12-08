import { useEffect, useState } from "react";
import {
    Box,
    Typography,
    Card,
    Stack,
    Button,
    Chip,
    Skeleton,
    Tabs,
    Tab,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Avatar,
} from "@mui/material";

import StudentViewDegree from "./studentViewDegree";
import { UseUserProfile } from "../../../../helpers/queryHooks/userProfile";
import moment from "moment";
import Toast from "../../../../utils/toast";
import Server from "../../../../server";

export default function StudentDashboard() {
    const [openDegreeDialog, setOpenDegreeDialog] = useState(false);
    const [selectedCert, setSelectedCert] = useState(null);
    const [degrees, setDegrees] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [loadingDegrees, setLoadingDegrees] = useState(false);
    const [loadingAlerts, setLoadingAlerts] = useState(false);
    const [tab, setTab] = useState(0);

    // Profile Fetch
    const {
        data: profile = {},
        isFetching: loadingProfile,
    } = UseUserProfile({ enabled: true });

    // Fetch Degrees
    const fetchDegrees = async () => {
        try {
            setLoadingDegrees(true);
            const res = await Server.myDegrees();
            setDegrees(res.data || []);
        } catch (err) {
            Toast.error("Unable to load degrees.");
        } finally {
            setLoadingDegrees(false);
        }
    };

    // Fetch Alerts
    const fetchAlerts = async () => {
        try {
            setLoadingAlerts(true);
            const res = await Server.studentAlerts();
            setAlerts(res.data || []);
        } catch (err) {
            Toast.error("Unable to load alerts.");
        } finally {
            setLoadingAlerts(false);
        }
    };

    useEffect(() => {
        fetchDegrees();
        fetchAlerts();
    }, []);

    const fullName = profile?.name || "Student";
    const initials =
        fullName
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase() || "👤";

    const getStatusChip = () => {
        let color = "warning";
        if (profile.status === "Active") color = "success";
        if (profile.status === "Graduated") color = "primary";

        return (
            <Chip
                label={profile.status}
                color={color}
                size="small"
                sx={{ fontWeight: 600 }}
            />
        );
    };

    const handleViewDegree = (degree) => {
        setSelectedCert(degree);
        setOpenDegreeDialog(true);
    };

    return (
        <>
            <Box
                sx={{
                    width: "100%",
                    height: "100vh",
                    overflow: "hidden",
                    // background: "yellow",
                    pr: 2,
                    background:
                        "radial-gradient(circle at top, #113344, #081421, #050816 70%)",
                    color: "white",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        flex: 1,
                        width: "97%",
                        px: { xs: 2, md: 4, lg: 6 },
                        pt: 3,
                        pb: 4,
                        overflowY: "auto",
                    }}
                >
                    {/* HEADER */}
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            flexWrap: "wrap",
                            gap: 2,
                            mb: 4,
                        }}
                    >
                        <Box>
                            <Typography
                                variant="h4"
                                sx={{ fontWeight: 700, color: "#E0F7FF" }}
                            >
                                {loadingProfile ? (
                                    <Skeleton width={200} />
                                ) : (
                                    `Welcome, ${fullName}`
                                )}
                            </Typography>
                            <Typography sx={{ color: "#9cc8e2", mt: 0.5 }}>
                                Your academic overview & blockchain credentials.
                            </Typography>
                        </Box>

                        {/* <Stack direction="row" spacing={2} alignItems="center">
                            <Avatar
                                sx={{
                                    bgcolor: "#00eaff",
                                    color: "#002",
                                    width: 56,
                                    height: 56,
                                    fontWeight: 700,
                                    boxShadow: "0 0 18px rgba(0,234,255,0.35)",
                                }}
                            >
                                {initials}
                            </Avatar>

                            <Box sx={{ textAlign: "right" }}>
                                <Typography sx={{ fontSize: 14, color: "#C0E8FF" }}>
                                    {profile?.email || "—"}
                                </Typography>
                                <Typography
                                    sx={{
                                        fontSize: 12,
                                        color: "#7fb4d3",
                                        fontFamily: "monospace",
                                    }}
                                >
                                    ID: {profile?.studentId || "—"}
                                </Typography>
                            </Box>
                        </Stack> */}
                    </Box>

                    {/* STATS ROW (no Grid, just flex) */}
                    <Box
                        sx={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 3,
                            mb: 3,
                        }}
                    >
                        {/* Total Degrees */}
                        <Card
                            sx={{
                                flex: "1 1 220px",
                                p: 3,
                                borderRadius: 3,
                                background: "rgba(8,20,33,0.9)",
                                border: "1px solid rgba(0,234,255,0.25)",
                                minWidth: 220,
                            }}
                        >
                            <Typography sx={{ color: "#9cc8e2", mb: 1 }}>
                                Total Degrees
                            </Typography>
                            <Typography sx={{ fontSize: 32, fontWeight: 700 }}>
                                {loadingDegrees ? <Skeleton width={40} /> : degrees.length}
                            </Typography>
                        </Card>

                        {/* Valid Degrees */}
                        <Card
                            sx={{
                                flex: "1 1 220px",
                                p: 3,
                                borderRadius: 3,
                                background: "rgba(8,20,33,0.9)",
                                border: "1px solid rgba(0,234,255,0.25)",
                                minWidth: 220,
                            }}
                        >
                            <Typography sx={{ color: "#9cc8e2", mb: 1 }}>
                                Valid Degrees
                            </Typography>
                            <Typography sx={{ fontSize: 32, fontWeight: 700 }}>
                                {loadingDegrees ? (
                                    <Skeleton width={40} />
                                ) : (
                                    degrees.filter((d) => !d.is_revoked).length
                                )}
                            </Typography>
                        </Card>

                        {/* Security Alerts */}
                        <Card
                            sx={{
                                flex: "1 1 220px",
                                p: 3,
                                borderRadius: 3,
                                background: "rgba(8,20,33,0.9)",
                                border: "1px solid rgba(0,234,255,0.25)",
                                minWidth: 220,
                            }}
                        >
                            <Typography sx={{ color: "#9cc8e2", mb: 1 }}>
                                Security Alerts
                            </Typography>
                            <Typography sx={{ fontSize: 32, fontWeight: 700 }}>
                                {loadingAlerts ? <Skeleton width={40} /> : alerts.length}
                            </Typography>
                        </Card>
                    </Box>

                    {/* MAIN CONTENT: PROFILE + TABS (flex, no Grid) */}
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: { xs: "column", md: "row" },
                            gap: 3,
                            width: "100%",
                        }}
                    >
                        {/* LEFT PROFILE CARD */}
                        <Card
                            sx={{
                                flex: { xs: "0 0 auto", md: "0 0 320px" },
                                width: { xs: "100%", md: 320 },
                                p: 3,
                                borderRadius: 3,
                                background: "rgba(6,18,32,0.95)",
                                border: "1px solid rgba(0,234,255,0.25)",
                            }}
                        >
                            <Typography variant="h6" sx={{ mb: 2, color: "#00eaff" }}>
                                Student Profile
                            </Typography>

                            <Stack spacing={1.6}>
                                <Box>
                                    <Typography sx={{ color: "#9cc8e2", fontSize: 13 }}>
                                        Name
                                    </Typography>
                                    <Typography sx={{ fontWeight: 600 }}>
                                        {loadingProfile ? <Skeleton width={160} /> : fullName}
                                    </Typography>
                                </Box>

                                <Box>
                                    <Typography sx={{ color: "#9cc8e2", fontSize: 13 }}>
                                        Student ID
                                    </Typography>
                                    <Typography sx={{ fontFamily: "monospace" }}>
                                        {profile?.student_id || "—"}
                                    </Typography>
                                </Box>

                                <Box>
                                    <Typography sx={{ color: "#9cc8e2", fontSize: 13 }}>
                                        Program
                                    </Typography>
                                    <Typography>{profile?.program || "—"}</Typography>
                                </Box>

                                <Box>
                                    <Typography sx={{ color: "#9cc8e2", fontSize: 13 }}>
                                        Department
                                    </Typography>
                                    <Typography>{profile?.department || "—"}</Typography>
                                </Box>

                                <Box>
                                    <Typography sx={{ color: "#9cc8e2", fontSize: 13 }}>
                                        Enrollment Year
                                    </Typography>
                                    <Typography>
                                        {profile?.enrollmentYear &&
                                            moment(profile.enrollmentYear).format("YYYY")}
                                    </Typography>
                                </Box>

                                <Box>
                                    <Typography sx={{ color: "#9cc8e2", fontSize: 13 }}>
                                        Status
                                    </Typography>
                                    {loadingProfile ? <Skeleton width={80} /> : getStatusChip()}
                                </Box>
                            </Stack>
                        </Card>

                        {/* RIGHT: TABS AREA */}
                        <Card
                            sx={{
                                flex: "1 1 auto",
                                width: "100%",
                                borderRadius: 3,
                                background: "rgba(6,18,32,0.96)",
                                border: "1px solid rgba(0,234,255,0.25)",
                                display: "flex",
                                flexDirection: "column",
                            }}
                        >
                            <Tabs
                                value={tab}
                                onChange={(e, v) => setTab(v)}
                                sx={{
                                    borderBottom: "1px solid rgba(255,255,255,0.1)",
                                    "& .MuiTab-root": { color: "#9cc8e2", fontWeight: 600 },
                                    "& .Mui-selected": { color: "#00eaff !important" },
                                }}
                            >
                                <Tab label="Degrees" />
                                <Tab label="Alerts" />
                            </Tabs>

                            {/* TAB CONTENT — no own scroll, it just grows inside the scrollable page area */}
                            <Box sx={{ flexGrow: 1, p: 3 }}>
                                {/* ---------------- DEGREES TAB ---------------- */}
                                {tab === 0 && (
                                    <>
                                        <Typography
                                            variant="h6"
                                            sx={{ color: "#00eaff", mb: 2 }}
                                        >
                                            My Degrees
                                        </Typography>

                                        {loadingDegrees ? (
                                            <Stack spacing={1.5}>
                                                <Skeleton height={50} />
                                                <Skeleton height={50} />
                                            </Stack>
                                        ) : degrees.length === 0 ? (
                                            <Typography sx={{ color: "#9cc8e2" }}>
                                                No degrees issued yet.
                                            </Typography>
                                        ) : (
                                            <Table size="small">
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell sx={{ color: "#9cc8e2" }}>
                                                            Degree
                                                        </TableCell>
                                                        <TableCell sx={{ color: "#9cc8e2" }}>
                                                            Issued On
                                                        </TableCell>
                                                        <TableCell sx={{ color: "#9cc8e2" }}>
                                                            Status
                                                        </TableCell>
                                                        <TableCell sx={{ color: "#9cc8e2" }}>
                                                            Token ID
                                                        </TableCell>
                                                        <TableCell sx={{ color: "#9cc8e2" }}>
                                                            Action
                                                        </TableCell>
                                                    </TableRow>
                                                </TableHead>

                                                <TableBody>
                                                    {degrees.map((d) => (
                                                        <TableRow key={d.id}>
                                                            <TableCell>{d.degree}</TableCell>
                                                            <TableCell>
                                                                {d.issued_at ? moment(d.issued_at).format(
                                                                    "YYYY-MM-DD"
                                                                ) : "N/A"}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Chip
                                                                    label={
                                                                        !d.is_revoked && !d.tx_hash
                                                                            ? "Active"
                                                                            : d.is_revoked
                                                                                ? "Revoked"
                                                                                : "Valid"
                                                                    }
                                                                    size="small"
                                                                    sx={{
                                                                        bgcolor: d.is_revoked
                                                                            ? "rgba(255,68,68,0.15)"
                                                                            : "rgba(0,234,255,0.15)",
                                                                        color: d.is_revoked
                                                                            ? "#ff4444"
                                                                            : "#00eaff",
                                                                    }}
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                {d.degree_token_id ? `#${d.degree_token_id}` : "N/A"}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Button
                                                                    size="small"
                                                                    variant="contained"
                                                                    disabled={d.is_revoked}
                                                                    sx={{
                                                                        bgcolor: "#00eaff",
                                                                        color: "#000",
                                                                        textTransform: "none",
                                                                    }}
                                                                    onClick={() =>
                                                                        handleViewDegree(d)
                                                                    }
                                                                >
                                                                    View
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        )}
                                    </>
                                )}

                                {/* ---------------- ALERTS TAB ---------------- */}
                                {tab === 1 && (
                                    <>
                                        <Typography
                                            variant="h6"
                                            sx={{ color: "#00eaff", mb: 2 }}
                                        >
                                            Security Alerts
                                        </Typography>

                                        {loadingAlerts ? (
                                            <Stack spacing={1.5}>
                                                <Skeleton height={50} />
                                                <Skeleton height={50} />
                                            </Stack>
                                        ) : alerts.length === 0 ? (
                                            <Typography sx={{ color: "#9cc8e2" }}>
                                                No alerts at the moment.
                                            </Typography>
                                        ) : (
                                            alerts.map((a) => (
                                                <Card
                                                    key={a.id}
                                                    sx={{
                                                        p: 2,
                                                        mb: 2,
                                                        background:
                                                            "rgba(255,255,255,0.03)",
                                                        border:
                                                            "1px solid rgba(255,255,255,0.06)",
                                                    }}
                                                >
                                                    <Stack
                                                        direction="row"
                                                        justifyContent="space-between"
                                                    >
                                                        <Chip
                                                            label={a.type}
                                                            size="small"
                                                            sx={{
                                                                bgcolor:
                                                                    a.type === "Security"
                                                                        ? "rgba(255,68,68,0.15)"
                                                                        : "rgba(0,234,255,0.15)",
                                                                color:
                                                                    a.type === "Security"
                                                                        ? "#ff7777"
                                                                        : "#00eaff",
                                                            }}
                                                        />

                                                        <Typography
                                                            sx={{
                                                                color: "#9cc8e2",
                                                                fontSize: 12,
                                                            }}
                                                        >
                                                            {moment(a.created_at).format(
                                                                "YYYY-MM-DD"
                                                            )}
                                                        </Typography>
                                                    </Stack>

                                                    <Typography
                                                        sx={{
                                                            mt: 1,
                                                            color: "white",
                                                        }}
                                                    >
                                                        {a.message}
                                                    </Typography>
                                                </Card>
                                            ))
                                        )}
                                    </>
                                )}
                            </Box>
                        </Card>
                    </Box>
                </Box>
            </Box>

            {selectedCert && (
                <StudentViewDegree
                    open={openDegreeDialog}
                    setOpenDetails={setOpenDegreeDialog}
                    selectedCert={selectedCert}
                />
            )}
        </>
    );
}
