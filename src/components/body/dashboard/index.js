import { Grid, Typography, Box, Card, Button, DialogTitle, Dialog, DialogContent, DialogActions } from "@mui/material";
import DashboardCard from "./helperComp/dashboardCard";
import DegreeTrendChart from "./helperComp/charts/degreeTrenCharts";
import RiskPieChart from "./helperComp/charts/riskPieChart";
import AlertsTable from "./helperComp/alertTable";
import Server from "../../../server";
import { useEffect, useState } from "react";
import Toast from "../../../utils/toast";
import UpperSection from "./upperSection";
import LowerSection from "./lowerSection";

export default function AdminDashboard() {
    const dummyStats = {
        students: 120,
        degrees: 85,
        activeSessions: 42,
        anomalies: 5,
    };

    const [selectedStudent, setSelectedStudent] = useState("");
    const [verifying, setVerifying] = useState(false);
    const [verifyResult, setVerifyResult] = useState("");
    const [students, setStudents] = useState([]);
    const [openVerifyDialog, setOpenVerifyDialog] = useState(false);


    const [stats, setStats] = useState([])

    useEffect(() => {
        let isMounted = true;

        const loadDashboard = async () => {
            try {
                const [cardsRes, studentsRes] = await Promise.all([
                    Server.getDashboardCardsData(),
                    Server.getAllStudents(),
                ]);

                if (!isMounted) return;

                const cardsData = Array.isArray(cardsRes?.data)
                    ? cardsRes.data[0]
                    : {
                        students: "N/A",
                        degrees: "N/A",
                        activeSessions: "N/A",
                        anomalies: "N/A",
                    };

                const studentData = Array.isArray(studentsRes?.data)
                    ? studentsRes.data
                        .filter(obj => obj.tx_hash)
                        .map(obj => ({
                            ...obj,
                            name: obj.name
                                .trim()
                                .split(/\s+/)
                                .map(word =>
                                    word.charAt(0).toUpperCase() + word.slice(1)
                                )
                                .join(" ")
                        }))
                    : [];

                setStats(cardsData);
                setStudents(studentData);

            } catch (error) {
                console.error("Dashboard load failed:", error);
                Toast.error("Dashboard data unavailable");
            }
        };

        loadDashboard();

        return () => {
            isMounted = false;
        };
    }, []);

    const handleVerify = async () => {
        if (!selectedStudent) return;

        setVerifying(true);
        setVerifyResult(null);

        try {
            const response = await Server.verifyDegree(selectedStudent);

            // Backend success=false => generic API failure
            if (!response.success) {
                Toast.error(response.message || "Verification failed");
                setVerifying(false);
                return;
            }

            // DEGREE REVOKED CASE
            if (response.revoked === true) {
                const result = {
                    valid: false,
                    revoked: true,
                    message: response.message,
                    student: response.student,
                    course: response.course,
                    issuer: response.issuer,
                    tokenId: response.tokenId,
                    owner: response.on_chain_owner,
                    metadataCID: response.metadataCID,
                    imageTampered: false,
                };

                setVerifyResult(result);
                setOpenVerifyDialog(true);

                Toast.error("⛔ Degree has been revoked");
                setVerifying(false);
                return;
            }

            // NORMAL VALID / INVALID CASES
            const result = {
                valid: response.valid,
                revoked: false,
                student: response.student,
                course: response.course,
                issuer: response.issuer,
                tokenId: response.tokenId,
                owner: response.on_chain_owner,
                metadataCID: response.metadataCID,
                imageTampered: response.imageTampered,
                message: response.message
            };

            setVerifyResult(result);
            setOpenVerifyDialog(true);

            if (response.valid && !response.imageTampered) {
                Toast.success("Degree is valid & untampered 🎉");
            } else if (response.imageTampered) {
                Toast.error("⚠ Certificate tampering detected!");
            } else {
                Toast.error("Degree invalid");
            }

        } catch (err) {
            console.error(err);
            Toast.error("Something went wrong while verifying.");
        }

        setVerifying(false);
    };


    return (
        <Box
            sx={{
                width: "100%",
                padding: 2,
                background: "linear-gradient(135deg, #081421, #0a1d2e 60%, #092538)",
                minHeight: "100%",
                color: "white",
                gap: 4,
                display: "flex",
                flexDirection: "column",

                minHeight: "100%",
                // maxHeight: "100vh",
                overflowY: "auto",
                overflowX: "hidden",

                scrollbarWidth: "thin",
                "&::-webkit-scrollbar": {
                    width: "6px",
                },
                "&::-webkit-scrollbar-thumb": {
                    background: "#00eaff",
                    borderRadius: "3px",
                },
            }}
        >


            <Box sx={{ flex: 1, width: "100%" }}>
                <UpperSection
                    students={students}
                    selectedStudent={selectedStudent}
                    setOpenVerifyDialog={setOpenVerifyDialog}
                    setVerifyResult={setVerifyResult}
                    verifying={verifying}
                    handleVerify={handleVerify}
                    setSelectedStudent={setSelectedStudent}
                    stats={stats}
                />
            </Box>



            {/* Charts Section */}

            <Box sx={{ width: "100%", mt: 4, flex: 1 }}>
                <Grid container spacing={3}>
                    {/* Left chart - 50% on md+ */}
                    <Grid item xs={12} md={6} width="48%">
                        <Card
                            sx={{
                                backgroundColor: "rgba(8, 20, 33, 0.6)",
                                backdropFilter: "blur(8px)",
                                borderRadius: 4,
                                p: 3,
                                height: "100%",
                                border: "1px solid rgba(0, 255, 255, 0.15)",
                                boxShadow: "0 0 20px rgba(0,255,255,0.08)",
                            }}
                        >
                            <Typography variant="h6" sx={{ mb: 2, color: "#00eaff" }}>
                                Degree Issuance Trend
                            </Typography>
                            <DegreeTrendChart />
                        </Card>
                    </Grid>

                    {/* Right chart - 50% on md+ */}
                    <Grid item xs={12} md={6} width="48%">
                        <Card
                            sx={{
                                backgroundColor: "rgba(8, 20, 33, 0.6)",
                                backdropFilter: "blur(8px)",
                                borderRadius: 4,
                                p: 3,
                                height: "100%",
                                border: "1px solid rgba(0, 255, 255, 0.15)",
                                boxShadow: "0 0 20px rgba(0,255,255,0.08)",
                            }}
                        >
                            <Typography variant="h6" sx={{ mb: 2, color: "#00eaff" }}>
                                Risk Levels
                            </Typography>

                            <Box sx={{ height: 320 }}>
                                <RiskPieChart />
                            </Box>
                        </Card>
                    </Grid>
                </Grid>
            </Box>



            {/* Alerts Table */}
            <LowerSection />


            {verifyResult && (
                <Dialog
                    open={openVerifyDialog}
                    onClose={() => setOpenVerifyDialog(false)}
                    maxWidth="sm"
                    fullWidth
                    PaperProps={{
                        sx: {
                            bgcolor: "#0b0f19",
                            color: "#fff",
                            borderRadius: 3,
                            border: "1px solid rgba(0,234,255,0.3)",
                        },
                    }}
                >
                    <DialogTitle
                        sx={{
                            fontWeight: 700,
                            fontSize: "1.4rem",
                            color:
                                verifyResult.forced || verifyResult.message?.includes("Fake")
                                    ? "#ff3333"
                                    : verifyResult.revoked
                                        ? "#ff4444"
                                        : verifyResult.valid
                                            ? "#00ff99"
                                            : "#ff6666"
                        }}
                    >
                        {verifyResult.forced || verifyResult.message?.includes("Fake")
                            ? "⛔ Forgery Detected"
                            : verifyResult.revoked
                                ? "⛔ Degree Revoked"
                                : verifyResult.valid
                                    ? "✔ Degree Verified"
                                    : "✖ Degree Invalid"}
                    </DialogTitle>

                    <DialogContent dividers>
                        <Typography sx={{ color: "#9cc8e2" }}>
                            <b>Message:</b> {verifyResult.message}
                        </Typography>

                        {verifyResult.student && (
                            <>
                                <Typography sx={{ color: "#9cc8e2", mt: 2 }}>
                                    <b>Student:</b> {verifyResult.student}
                                </Typography>

                                <Typography sx={{ color: "#9cc8e2", mt: 1 }}>
                                    <b>Course:</b> {verifyResult.course}
                                </Typography>

                                <Typography sx={{ color: "#9cc8e2", mt: 1 }}>
                                    <b>Issuer:</b> {verifyResult.issuer}
                                </Typography>

                                <Typography sx={{ color: "#9cc8e2", mt: 1 }}>
                                    <b>Token ID:</b> {verifyResult.tokenId}
                                </Typography>

                                <Typography sx={{ color: "#9cc8e2", mt: 1 }}>
                                    <b>Owner:</b> {verifyResult.owner}
                                </Typography>

                                <Typography sx={{ color: "#9cc8e2", mt: 1, wordBreak: "break-word" }}>
                                    <b>Metadata CID:</b> {verifyResult.metadataCID}
                                </Typography>
                            </>
                        )}
                    </DialogContent>

                    <DialogActions>
                        <Button
                            onClick={() => setOpenVerifyDialog(false)}
                            sx={{
                                color: "#00eaff",
                                textTransform: "none",
                                border: "1px solid rgba(0,234,255,0.4)"
                            }}
                        >
                            Close
                        </Button>
                    </DialogActions>
                </Dialog>
            )}


        </Box>
    );
}
