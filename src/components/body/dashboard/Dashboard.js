// Dashboard.jsx
import { Box } from "@mui/material";
import AdminDashboard from "./index";
import StudentDashboard from "./studentDashboard";
import useUserStore from "../../../helpers/infoStore/useUserStore";

export default function Dashboard() {
    const { user: userRole } = useUserStore()

    return (
        <Box sx={{ width: "100%", height: "100%", overflow: "hidden" }}>
            {userRole === "student" ? <StudentDashboard /> : <AdminDashboard />}
        </Box>
    );
}
