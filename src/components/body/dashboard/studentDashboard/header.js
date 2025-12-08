import { Box, Chip, Typography } from "@mui/material"

const StuHeader = ({ }) => {
    return (
        <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
            <Box>
                <Typography variant="h4" sx={{ mb: 0.5, color: "#00eaff", fontWeight: 700 }}>
                    Student Dashboard
                </Typography>
                <Typography sx={{ color: "#9cc8e2" }}>
                    Welcome back, {dummyStudent.name}. Here you can review your academic credentials and activity.
                </Typography>
            </Box>
            <Chip
                label="Verified Student Account"
                variant="outlined"
                sx={{
                    borderColor: "#00eaff",
                    color: "#00eaff",
                    fontWeight: 600,
                }}
            />
        </Box>
    )
}

export default StuHeader