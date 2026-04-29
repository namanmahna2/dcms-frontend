import { Route, Routes } from "react-router-dom"
import Acadamics from "../body/acadamics"
import Dashboard from "../body/dashboard/Dashboard"
import Students from "../body/students"
import Certificates from "../body/certificates"
import Anomaly from "../body/anomaly"
import Chatbot from "../body/chatbot"
import { Box } from "@mui/system"

const AppRoutes = () => {
    return (
        <Box
            sx={{
                width: "100%",
                minHeight: "100%",
                backgroundColor: "inherit"
            }}
        >
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/acadamics" element={<Acadamics />} />
                <Route path="/students" element={<Students />} />
                <Route path="/certificates" element={<Certificates />} />
                <Route path="/anomaly" element={<Anomaly />} />
                <Route path="/chatbot" element={<Chatbot />} />
            </Routes>
        </Box>
    );
};





export default AppRoutes