// src/components/AccessDenied.jsx
import { Box, Typography, Button } from "@mui/material";

const AccessDenied = ({ message = "Your access has been blocked by the security system." }) => {
    return (
        <Box
            sx={{
                height: "100vh",
                width: "100vw",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "#050b14",
                color: "white",
                textAlign: "center",
                p: 3,
            }}
        >
            <Typography variant="h3" sx={{ mb: 2, color: "#ff5555", fontWeight: 700 }}>
                403 – Access Denied
            </Typography>
            <Typography sx={{ maxWidth: 500, mb: 3, color: "#cfd8e3" }}>
                {message}
            </Typography>
            <Typography sx={{ maxWidth: 500, mb: 4, color: "#9cc8e2", fontSize: 14 }}>
                If you believe this is a mistake, please contact your university administrator or support team
                and provide your IP address and the time of this request.
            </Typography>

            <Button
                variant="outlined"
                onClick={() => window.location.href = "/"}
                sx={{
                    borderColor: "#00eaff",
                    color: "#00eaff",
                    px: 3,
                    "&:hover": { bgcolor: "rgba(0,234,255,0.1)" },
                }}
            >
                Go back to home
            </Button>
        </Box>
    );
};

export default AccessDenied;
