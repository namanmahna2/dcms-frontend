import { useEffect, useMemo, useState } from "react";
import {
    Box, Typography, Button, Paper,
    CircularProgress, TextField
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";


import StudentTable from "./StudentTable";
import AddOrEditStudentDialog from "./AddStudentDialog";
import IssueDegreeDialog from "./IssueDegreeDialog";


import { UseAllStudentsData } from "../../../helpers/queryHooks/allStudents";

const Students = () => {
    const {
        data: students = [],
        isFetching,
        error,
        refetch
    } = UseAllStudentsData({}, { enabled: true });

    const [search, setSearch] = useState("");
    const [openAdd, setOpenAdd] = useState(false);
    const [openIssue, setOpenIssue] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);

    const filtered = useMemo(() => {
        const lower = search.toLowerCase();
        return students.filter(
            (s) =>
                s.name.toLowerCase().includes(lower) ||
                s.email.toLowerCase().includes(lower)
        );
    }, [search, students]);

    const refetchFunc = () => {
        refetch()
    }

    return (
        <Box sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            color: "#fff",
            p: 3,
            bgcolor: "#0b0f19"
        }}>
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
                    flexDirection: "column"
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 2
                    }}
                >
                    <TextField
                        variant="outlined"
                        size="small"
                        placeholder="Search student..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        sx={{
                            width: 250,
                            input: { color: "#fff" },
                            "& .MuiOutlinedInput-root": {
                                "& fieldset": { borderColor: "#00eaff" },
                                "&:hover fieldset": { borderColor: "#00eaff" }
                            }
                        }}
                    />

                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setOpenAdd(true)}
                        sx={{
                            bgcolor: "#00eaff",
                            color: "#000",
                            px: 3,
                            "&:hover": { bgcolor: "#00bcd4" },
                            fontWeight: 600
                        }}
                    >
                        Add Student
                    </Button>
                </Box>

                {isFetching ? (
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            flex: 1
                        }}
                    >
                        <CircularProgress color="info" />
                    </Box>
                ) : (
                    <StudentTable
                        students={filtered}
                        onAdded={refetch}
                        onIssue={(student) => {
                            setSelectedStudent(student);
                            setOpenIssue(true);
                        }}
                        onEdit={(student) => {
                            setSelectedStudent(student);
                            setOpenAdd(true);
                        }}
                    />
                )}
            </Paper>

            {/* Dialogs */}
            <AddOrEditStudentDialog
                open={openAdd}
                onClose={() => {
                    setOpenAdd(false);
                    setSelectedStudent(null);
                }}
                onAdded={refetchFunc}
                editData={selectedStudent}
            />

            <IssueDegreeDialog
                open={openIssue}
                student={selectedStudent}
                onClose={() => setOpenIssue(false)}
            />
        </Box>
    );
};

export default Students;
