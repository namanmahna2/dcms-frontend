import { Card, CardContent, Typography } from "@mui/material";

export default function DashboardCard({ title, value, color }) {
    return (
        <Card
            sx={{
                background: "linear-gradient(135deg, #0c182b, #112240)",
                borderRadius: "18px",
                color: "white",
                p: 2,
                boxShadow: "0px 0px 25px rgba(0, 240, 255, 0.1)",
                border: "1px solid rgba(0, 240, 255, 0.2)",
                transition: "all 0.3s ease",
                "&:hover": {
                    transform: "scale(1.05)",
                    boxShadow: "0px 0px 35px rgba(0, 240, 255, 0.35)",
                    borderColor: "rgba(0, 240, 255, 0.5)",
                },
            }}
        >
            <CardContent>
                <Typography
                    variant="subtitle2"
                    sx={{ opacity: 0.8, fontSize: "0.9rem" }}
                >
                    {title}
                </Typography>

                <Typography
                    variant="h4"
                    sx={{
                        mt: 1,
                        fontWeight: "bold",
                        background: "linear-gradient(90deg,#00eaff,#00bcd4)",
                        WebkitBackgroundClip: "text",
                        color: "transparent",
                    }}
                >
                    {value}
                </Typography>
            </CardContent>
        </Card>
    );
}
