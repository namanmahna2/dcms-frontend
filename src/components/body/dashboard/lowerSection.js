import { Box, Typography } from "@mui/material"
import AlertsTable from "./helperComp/alertTable"

const LowerSection = () => {
    return (
        <Box
            sx={{
                flex: 1,
                width:"95%",
                mt: 4,
                backgroundColor: "rgba(8, 20, 33, 0.6)",
                backdropFilter: "blur(10px)",
                padding: 3,
                borderRadius: 4,
                border: "1px solid rgba(0, 255, 255, 0.15)",
                boxShadow: "0 0 25px rgba(0,255,255,0.08)",
            }}
        >
            <Typography variant="h6" sx={{ mb: 2, color: "#00eaff" }}>
                Recent Revoked Degrees
            </Typography>

            <AlertsTable />
        </Box>
    )
}

export default LowerSection

