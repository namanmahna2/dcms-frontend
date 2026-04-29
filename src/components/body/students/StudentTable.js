import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
} from "@mui/material";
import StudentActions from "./helpers/studentActions";
import SingleDetailDialog from "./helpers/viewSingleStudentDetails";
import { useState } from "react";
import AddOrEditStudentDialog from "./AddStudentDialog";
import Server from "../../../server";
import WarningPopup from "../../shared/warningPopup";
import { toast } from "react-toastify";
import RevokeDegreeDialog from "./helpers/revokeDegreeDialog";
import Toast from "../../../utils/toast";

const StudentTable = ({ students, onIssue, onAdded }) => {
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [openAdd, setOpenAdd] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
    const [deleteData, setDeleteData] = useState({})
    const [revokeDialog, setRevokeDialog] = useState(false)


    const handleViewDetails = (id) => {
        const student = students.find((obj) => obj.id === id);
        if (student) {
            setSelectedStudent(student);
            setDetailDialogOpen(true);
        }
    };

    const handleUpdate = (data) => {
        const student = students.find((obj) => obj.id === data);
        if (student) {
            setSelectedStudent(student);
            setOpenAdd(true)
        }
    }

    const studentDeleteHandler = async (id) => {
        try {
            const student = students.find((obj) => obj.id === id);
            setOpenDeleteDialog(true)
            setDeleteData(student)
        } catch (error) {
            console.error(error)
        }
    }

    const studentFinalDeleteHandler = async (id) => {

        try {
            const apiResponse = await Server.deleteStudentById(id)
            setOpenDeleteDialog(false)
            onAdded()
            toast.success("Deleted Successfully")

        } catch (error) {
            console.error(error)
        }
    }

    const handleCloseDetails = () => {
        setDetailDialogOpen(false);
        setSelectedStudent(null);
    };

    const revokeDegreeHandler = async (student, reason = "") => {
        try {
            console.log("Call backend you moron!!", student, reason)

            const revokeDegree = await Server.revokeDegree(selectedStudent.id)
            Toast.success(revokeDegree.message)

        } catch (error) {
            console.error(error)
            Toast.error("Something went while revoking degree for student ", selectedStudent.id)
        }
    }

    const revokeDegreeClickHandler = (student_id) => {
        try {
            setRevokeDialog(true)
            const student = students.find((obj) => obj.id === student_id)
            setSelectedStudent(student)
        } catch (error) {
            console.error(error)
            Toast.error("Something went while revoking degree for student ", student_id)
        }
    }

    return (
        <TableContainer sx={{ mt: 1 }}>
            <Table sx={{ minWidth: 650 }} size="small">
                <TableHead>
                    <TableRow sx={{ bgcolor: "rgba(255,255,255,0.08)" }}>
                        <TableCell sx={{ color: "#00eaff" }}>Name</TableCell>
                        <TableCell sx={{ color: "#00eaff" }}>Email</TableCell>
                        <TableCell sx={{ color: "#00eaff" }}>Wallet</TableCell>
                        <TableCell sx={{ color: "#00eaff" }}>Role</TableCell>
                        <TableCell sx={{ color: "#00eaff" }} align="center">
                            Actions
                        </TableCell>
                    </TableRow>
                </TableHead>

                <TableBody>
                    {students.map((s) => (
                        <TableRow
                            key={s.id}
                            sx={{
                                "&:hover": {
                                    backgroundColor: "rgba(0,234,255,0.08)",
                                    transition: "0.3s",
                                },
                            }}
                        >
                            <TableCell sx={{ color: "#fff" }}>{s.name}</TableCell>
                            <TableCell sx={{ color: "#fff" }}>{s.email}</TableCell>
                            <TableCell sx={{ color: "#00eaff" }}>
                                {s.wallet_address || "Not Assigned"}
                            </TableCell>
                            <TableCell sx={{ color: "#fff" }}>{s.role}</TableCell>

                            <TableCell align="center">
                                <StudentActions
                                    studentDetails={s}
                                    id={s.id}
                                    onView={handleViewDetails}
                                    onEdit={handleUpdate}
                                    onDelete={studentDeleteHandler}
                                    onAssign={() => console.log("Assign", s.id)}
                                    onUpload={() => console.log("Upload", s.id)}
                                    onRevoke={() => revokeDegreeClickHandler(s.id)}
                                />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {/* View Dialog */}
            <SingleDetailDialog
                open={detailDialogOpen}
                onClose={handleCloseDetails}
                data={selectedStudent}
            />

            <AddOrEditStudentDialog
                open={openAdd}
                onClose={() => {
                    setOpenAdd(false);
                    setSelectedStudent(null);
                }}
                forEdit={true}
                editData={selectedStudent}
                onAdded={onAdded}
            />

            <WarningPopup
                open={openDeleteDialog}
                action="delete"
                renderData={deleteData}
                onConfirm={studentFinalDeleteHandler}
            />

            <RevokeDegreeDialog
                open={revokeDialog}
                onClose={() => setRevokeDialog(false)}
                onConfirm={revokeDegreeHandler}
                student={selectedStudent}
            />
        </TableContainer>
    );
};

export default StudentTable;
