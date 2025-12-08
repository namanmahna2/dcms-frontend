import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    MenuItem,
    TextField,
    Typography,
    Stack,
    CircularProgress,
} from "@mui/material";
import { useEffect, useState } from "react";
import useWalletStore from "../../../../helpers/infoStore/useWalletStore";
import { UseAllStudentsData } from "../../../../helpers/queryHooks/allStudents";
import Server from "../../../../server";
import Toast from "../../../../utils/toast";
// import Server from "../../../server"; // same server file used in Students.jsx

const IssueCertificateDialog = ({ open, setOpenIssue, refetch: refetch_cert }) => {
    const { contract } = useWalletStore();
    const {
        data: students = [],
        isFetching,
        refetch: refetchStudentData,
    } = UseAllStudentsData(
        {
            unissued: true
        },
        {
            enabled: true
        });

    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({
        student_id: "",
        wallet_address: "",
        degree_name: "",
        issuer: "Coventry University",
    });

    const selectedStudent = students.find((s) => s.id === form.student_id);

    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });


    useEffect(() => {
        if (!isFetching) {
            setLoading(false);
        }
    }, [isFetching]);

    const handleIssue = async () => {
        if (!contract) {
            alert("Please connect your wallet before issuing.");
            return;
        }

        const walletToUse =
            selectedStudent?.wallet_address || form.wallet_address?.trim();
        if (!walletToUse) {
            alert("Wallet address required.");
            return;
        }

        try {
            const issueDegree = await Server.issueDegree(form.student_id)
            setOpenIssue(false)
            refetch_cert()
            refetchStudentData()
            Toast.success("degree issued successfully")
            // const degreeData = `${form.degree_name} - ${form.issuer}`;
            // const tx = await contract.safeMint(walletToUse, degreeData);

            // console.log("Mint Tx:", tx.hash);
            // await tx.wait();

            // alert("Degree certificate issued successfully!");
            // setOpenIssue(false);
        } catch (err) {
            console.error(err);
            Toast.error("Failed to load student details");
        }
    };

    return (
        <Dialog
            open={open}
            onClose={() => setOpenIssue(false)}
            fullWidth
            maxWidth="sm"
            PaperProps={{
                sx: {
                    bgcolor: "#0b0f19",
                    color: "#fff",
                    border: "1px solid rgba(0,234,255,0.3)",
                    borderRadius: 3,
                    boxShadow: "0 0 30px rgba(0,234,255,0.2)",
                    backdropFilter: "blur(15px)",
                },
            }}
        >
            <DialogTitle
                sx={{
                    fontWeight: 700,
                    color: "#00eaff",
                    borderBottom: "1px solid rgba(255,255,255,0.1)",
                    letterSpacing: 0.5,
                }}
            >
            Issue New Certificate
            </DialogTitle>

            <DialogContent sx={{ mt: 2 }}>
                {loading ? (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
                        <CircularProgress color="info" />
                    </Box>
                ) : (
                    <Stack spacing={2}>
                        {/* Student Selector */}
                        <TextField
                            select
                            label="Select Student"
                            name="student_id"
                            value={form.student_id}
                            onChange={handleChange}
                            fullWidth
                            InputLabelProps={{ style: { color: "#ccc" } }}
                            InputProps={{ style: { color: "#fff" } }}
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                    "& fieldset": { borderColor: "#00eaff" },
                                    "&:hover fieldset": { borderColor: "#00bcd4" },
                                    "&.Mui-focused fieldset": { borderColor: "#00eaff" },
                                },
                            }}
                        >
                            <MenuItem value="">Select Student</MenuItem>
                            {students.map((s) => (
                                <MenuItem key={s.id} value={s.id}>
                                    {s.first_name
                                        ? `${s.name} (${s.email})`
                                        : `${s.name} (${s.email})`}
                                </MenuItem>
                            ))}
                        </TextField>

                        {/* Wallet Address (only if missing) */}
                        {form.student_id && !selectedStudent?.wallet_address && (
                            <TextField
                                label="Wallet Address"
                                name="wallet_address"
                                value={form.wallet_address}
                                onChange={handleChange}
                                fullWidth
                                InputLabelProps={{ style: { color: "#ccc" } }}
                                InputProps={{ style: { color: "#fff" } }}
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        "& fieldset": { borderColor: "#00eaff" },
                                        "&:hover fieldset": { borderColor: "#00bcd4" },
                                        "&.Mui-focused fieldset": { borderColor: "#00eaff" },
                                    },
                                }}
                            />
                        )}

                        {/* Issuer */}
                        <TextField
                            label="Issuer (University)"
                            name="issuer"
                            value={form.issuer}
                            onChange={handleChange}
                            fullWidth
                            InputLabelProps={{ style: { color: "#ccc" } }}
                            InputProps={{ style: { color: "#fff" } }}
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                    "& fieldset": { borderColor: "#00eaff" },
                                    "&:hover fieldset": { borderColor: "#00bcd4" },
                                    "&.Mui-focused fieldset": { borderColor: "#00eaff" },
                                },
                            }}
                        />

                        {/* Contract status */}
                        <Typography
                            variant="body2"
                            sx={{
                                mt: 1,
                                color: contract ? "#00eaff" : "gray",
                                textAlign: "center",
                            }}
                        >
                            {contract
                                ? "✅ Wallet Connected — Ready to Mint"
                                : "⏳ Connecting to Wallet..."}
                        </Typography>
                    </Stack>
                )}
            </DialogContent>

            <DialogActions
                sx={{
                    borderTop: "1px solid rgba(255,255,255,0.1)",
                    p: 2.5,
                    display: "flex",
                    justifyContent: "flex-end",
                }}
            >
                <Button
                    onClick={() => setOpenIssue(false)}
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
                    onClick={handleIssue}
                    sx={{
                        bgcolor: "#00eaff",
                        color: "#000",
                        fontWeight: 600,
                        px: 3,
                        borderRadius: 2,
                        "&:hover": { bgcolor: "#00bcd4" },
                    }}
                >
                    Issue Degree
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default IssueCertificateDialog;
