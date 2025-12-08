import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Stack,
    MenuItem,
    Fade,
    CircularProgress,
} from "@mui/material";
import { useEffect, useState, useMemo } from "react";
import Server from "../../../server";
import { UseDepAndCourses } from "../../../helpers/queryHooks/depAndCourses";
import helperFunctionsString from "../../../helpers/functions/string";
import Toast from "../../../utils/toast";

// simple capitalize utility
const capitalize = (s) =>
    typeof s === "string"
        ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
        : "";

const AddOrEditStudentDialog = ({
    open,
    onClose,
    onAdded,
    editData = null,
    forEdit = false,
}) => {
    const { data: depData, isLoading } = UseDepAndCourses({ enabled: open });

    const [form, setForm] = useState({
        first_name: "",
        last_name: "",
        email: "",
        department: "",
        course: "",
        wallet_type: "",
        phone: "",
    });

    const [loadingStudent, setLoadingStudent] = useState(false);

    // Fetch student details if in edit mode
    useEffect(() => {
        const fetchStudent = async () => {
            if (forEdit && editData?.id && open) {
                try {
                    setLoadingStudent(true);
                    const res = await Server.getStudentById(editData.id);
                    const student = res?.data[0] || {};

                    setForm({
                        first_name: student.first_name,
                        last_name: student.last_name,
                        email: student.email || "",
                        department: student.department_id?.toString() || "",
                        course: student.course_code || "",
                        wallet_type: student.wallet_type || "",
                        phone: student.phone || "",
                    });
                } catch (err) {
                    console.error("Error fetching student:", err);
                    Toast.error("Failed to load student details");
                } finally {
                    setLoadingStudent(false);
                }
            }
        };

        if (open) {
            if (!forEdit) {
                // reset when adding
                setForm({
                    first_name: "",
                    last_name: "",
                    email: "",
                    department: "",
                    course: "",
                    wallet_type: "",
                    phone: "",
                });
            } else {
                fetchStudent();
            }
        }
    }, [forEdit, editData, open]);

    // clear course when department changes
    useEffect(() => {
        setForm((prev) => ({ ...prev, course: "" }));
    }, [form.department]);

    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async () => {
        try {
            const promise = forEdit
                ? Server.updateStudentById(editData.id, form)
                : Server.insertStudent(form);

            await Toast.promise(promise, {
                loading: forEdit ? "Updating student..." : "Adding student...",
                success: forEdit
                    ? "Student updated successfully"
                    : "Student added successfully",
                error: "Failed to save student",
            });

            onAdded?.();
            onClose();
        } catch (error) {
            console.error("Error saving student:", error);
            Toast.error("Unexpected error occurred");
        }
    };

    const selectedDept = useMemo(() => {
        return depData?.find((d) => d.id === Number(form.department));
    }, [depData, form.department]);

    const courseOptions = selectedDept?.courses || [];

    return (
        <Dialog
            open={open}
            onClose={onClose}
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
            TransitionComponent={Fade}
            transitionDuration={400}
        >
            <DialogTitle
                sx={{
                    fontWeight: 700,
                    color: "#00eaff",
                    borderBottom: "1px solid rgba(255,255,255,0.1)",
                    letterSpacing: 0.5,
                }}
            >
                {forEdit ? "Edit Student" : "Add New Student"}
            </DialogTitle>

            <DialogContent sx={{ mt: 1.5 }}>
                {loadingStudent ? (
                    <Stack alignItems="center" sx={{ py: 6 }}>
                        <CircularProgress color="info" />
                    </Stack>
                ) : (
                    <Stack spacing={2}>
                        <TextField
                            label="First Name"
                            name="first_name"
                            variant="outlined"
                            value={form.first_name}
                            onChange={handleChange}
                            fullWidth
                            InputLabelProps={{ style: { color: "#ccc" } }}
                            InputProps={{ style: { color: "#fff" } }}
                        />

                        <TextField
                            label="Last Name"
                            name="last_name"
                            variant="outlined"
                            value={form.last_name}
                            onChange={handleChange}
                            fullWidth
                            InputLabelProps={{ style: { color: "#ccc" } }}
                            InputProps={{ style: { color: "#fff" } }}
                        />

                        <TextField
                            label="Email"
                            name="email"
                            variant="outlined"
                            value={form.email}
                            onChange={handleChange}
                            fullWidth
                            InputLabelProps={{ style: { color: "#ccc" } }}
                            InputProps={{ style: { color: "#fff" } }}
                        />

                        <TextField
                            label="Phone"
                            name="phone"
                            variant="outlined"
                            value={form.phone}
                            onChange={handleChange}
                            fullWidth
                            InputLabelProps={{ style: { color: "#ccc" } }}
                            InputProps={{ style: { color: "#fff" } }}
                        />

                        <TextField
                            select
                            label="Department"
                            name="department"
                            variant="outlined"
                            value={form.department}
                            onChange={handleChange}
                            fullWidth
                            disabled={isLoading}
                            InputLabelProps={{ style: { color: "#ccc" } }}
                            InputProps={{ style: { color: "#fff" } }}
                        >
                            <MenuItem value="">Select Department</MenuItem>
                            {depData?.map((dep) => (
                                <MenuItem key={dep.id} value={dep.id}>
                                    {dep.name}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            select
                            label="Course"
                            name="course"
                            variant="outlined"
                            value={form.course}
                            onChange={handleChange}
                            fullWidth
                            disabled={!form.department}
                            InputLabelProps={{ style: { color: "#ccc" } }}
                            InputProps={{ style: { color: "#fff" } }}
                        >
                            <MenuItem value="">Select Course</MenuItem>
                            {courseOptions.map((course) => (
                                <MenuItem key={course.course_code} value={course.course_code}>
                                    {course.course_name} ({course.course_code})
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            select
                            label="Wallet Type"
                            name="wallet_type"
                            variant="outlined"
                            value={form.wallet_type}
                            onChange={handleChange}
                            fullWidth
                            InputLabelProps={{ style: { color: "#ccc" } }}
                            InputProps={{ style: { color: "#fff" } }}
                        >
                            <MenuItem value="">Select Wallet Type</MenuItem>
                            <MenuItem value="custodial">Custodial Wallet</MenuItem>
                            <MenuItem value="byo">BYO (Bring Your Own)</MenuItem>
                        </TextField>
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
                    onClick={onClose}
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
                    onClick={handleSubmit}
                    disabled={loadingStudent}
                    sx={{
                        bgcolor: "#00eaff",
                        color: "#000",
                        fontWeight: 600,
                        px: 3,
                        borderRadius: 2,
                        "&:hover": { bgcolor: "#00bcd4" },
                    }}
                >
                    {forEdit ? "Update" : "Save"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddOrEditStudentDialog;
