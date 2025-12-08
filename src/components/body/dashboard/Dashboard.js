// Dashboard.jsx
import { Box } from "@mui/material";
import AdminDashboard from "./index";
import StudentDashboard from "./studentDashboard";

export default function Dashboard() {
    const userRole =
        JSON.parse(localStorage.getItem("login info"))?.user_role || "student";

    return (
        <Box sx={{ width: "100%", height: "100vh", overflow: "hidden" }}>
            {userRole === "student" ? <StudentDashboard /> : <AdminDashboard />}
        </Box>
    );
}
