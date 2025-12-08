import { Route, Routes } from "react-router-dom"
import Acadamics from "../body/acadamics"
import Dashboard from "../body/dashboard/Dashboard"
import Students from "../body/students"
import Certificates from "../body/certificates"
import Anomaly from "../body/anomaly"
import { Box } from "@mui/system"

const AppRoutes = () => {
    return (
        <Box
            sx={{
                width: "100%",
                // maxWidth: "100vw",
                overflow: "visible",
                height: "auto",
                minHeight: "100%",
                // p:6

            }}
        >
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/acadamics" element={<Acadamics />} />
                <Route path="/students" element={<Students />} />
                <Route path="/certificates" element={<Certificates />} />
                <Route path="/anomaly" element={<Anomaly />} />
            </Routes>
        </Box>
    );
};





export default AppRoutes