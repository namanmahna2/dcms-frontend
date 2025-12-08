import { Typography, Box } from "@mui/material"
import useTabStore from "../../helpers/infoStore/tabStore"
import AppRoutes from "../routes"



const Body = () => {
    return (
        <Box
            sx={{
                flex: 1,
                width: "100%",
                maxWidth: "100vw",
                position: "relative",
                overflowY: "auto",
                overflowX: "hidden",
                display: "block",

                backgroundColor: "#0A0F1F",
            }}
        >
            <AppRoutes />
        </Box>
    );
};

export default Body