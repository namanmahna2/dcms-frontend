import { Box, Grid } from "@mui/system";
import DashboardCard from "./helperComp/dashboardCard";
import { Typography, Button, CircularProgress } from "@mui/material";
import QRUploadAndVerify from "../../../utils/QRUploadAndVerify";

const UpperSection = ({
    students,
    selectedStudent,
    setOpenVerifyDialog,
    setVerifyResult,
    verifying,
    handleVerify,
    setSelectedStudent,
    stats
}) => {
    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                alignItems: "flex-start",
                width: "100%",
                flexWrap: "wrap",
                justifyContent: "space-around",
            }}
        >

            {/* CARDS */}
            <Box
                sx={{
                    width: "97%",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "stretch",
                    gap: 3,
                    flexWrap: "nowrap",
                }}
            >
                <Box sx={{ flex: 1 }}>
                    <DashboardCard
                        title="Total Students"
                        value={stats.students}
                        color="#112233aa"
                    />
                </Box>

                <Box sx={{ flex: 1 }}>
                    <DashboardCard
                        title="Degrees Issued"
                        value={stats.degrees}
                        color="#113355aa"
                    />
                </Box>

                <Box sx={{ flex: 1 }}>
                    <DashboardCard
                        title="Active Sessions"
                        value={stats.activesessions}
                        color="#114466aa"
                    />
                </Box>

                <Box sx={{ flex: 1 }}>
                    <DashboardCard
                        title="Detected Anomalies"
                        value={stats.anomalies}
                        color="#662244aa"
                    />
                </Box>
            </Box>


            {/*  VERIFY + QR PANEL */}
            <Box
                sx={{
                    display: "flex",
                    flexDirection: { xs: "column", md: "row" },
                    gap: 3,
                    minWidth: "97%",
                    mt: 3,
                    // mr: 9
                }}
            >
                {/* VERIFY DEGREE PANEL */}
                <Box
                    sx={{
                        flex: 1,
                        minWidth: "280px",
                        background: "linear-gradient(145deg, rgba(0,30,45,0.7), rgba(0,55,85,0.6))",
                        borderRadius: 4,
                        p: 3,
                        border: "1px solid rgba(0,255,255,0.2)",
                        backdropFilter: "blur(12px)",
                        boxShadow: "0 0 20px rgba(0,255,255,0.1)",
                    }}
                >
                    <Typography
                        sx={{
                            color: "#00eaff",
                            fontSize: "1.3rem",
                            fontWeight: 700,
                            mb: 2,
                            textShadow: "0 0 6px rgba(0,234,255,0.4)",
                        }}
                    >
                        Verify Degree
                    </Typography>

                    {/* Select Input */}
                    <Box
                        component="select"
                        value={selectedStudent}
                        onChange={(e) => setSelectedStudent(e.target.value)}
                        style={{
                            width: "100%",
                            padding: "14px",
                            backgroundColor: "rgba(255,255,255,0.06)",
                            color: "#fff",
                            borderRadius: "10px",
                            border: "1px solid rgba(0,234,255,0.3)",
                            fontSize: "1rem",
                            marginBottom: "20px",
                            outline: "none",
                        }}
                    >
                        <option value="">-- Select Student --</option>
                        {students?.map((s) => (
                            <option
                                key={s.id}
                                value={s.id}
                                style={{ backgroundColor: "#0b0f19" }}
                            >
                                {s.name}
                            </option>
                        ))}
                    </Box>

                    {/* Verify Button */}
                    <Button
                        variant="contained"
                        disabled={!selectedStudent || verifying}
                        onClick={handleVerify}
                        sx={{
                            bgcolor: "#00eaff",
                            color: "#000",
                            fontWeight: 700,
                            py: 1.4,
                            borderRadius: 3,
                            textTransform: "none",
                            width: "100%",
                            fontSize: "1.05rem",
                            boxShadow: "0 0 15px rgba(0,234,255,0.4)",
                            "&:hover": {
                                bgcolor: "#00cce0",
                                boxShadow: "0 0 25px rgba(0,234,255,0.65)",
                            },
                        }}
                    >
                        {verifying ? <CircularProgress size={25} sx={{ color: "#000" }} /> : "Verify Degree"}
                    </Button>

                </Box>

                {/* QR UPLOAD PANEL */}
                <Box
                    sx={{
                        flex: 1,
                        minWidth: "280px",
                        background: "linear-gradient(145deg, rgba(0,30,45,0.7), rgba(0,55,85,0.6))",
                        borderRadius: 4,
                        p: 3,
                        border: "1px solid rgba(0,255,255,0.2)",
                        backdropFilter: "blur(12px)",
                        boxShadow: "0 0 20px rgba(0,255,255,0.1)",
                    }}
                >
                    <Typography
                        sx={{
                            color: "#00eaff",
                            fontSize: "1.3rem",
                            fontWeight: 700,
                            mb: 2,
                            textShadow: "0 0 6px rgba(0,234,255,0.4)",
                        }}
                    >
                        Upload Degree & Scan QR
                    </Typography>
                    <QRUploadAndVerify
                        onResult={(res) => {
                            setVerifyResult(res);
                            setOpenVerifyDialog(true);
                        }}
                    />
                </Box>
            </Box>

        </Box>
    )
}


export default UpperSection