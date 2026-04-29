import { Typography, Box } from "@mui/material"
import useTabStore from "../../helpers/infoStore/tabStore"
import AppRoutes from "../routes"



const Body = () => {
    return (
        <Box
            sx={{
                height: "84%",
                width: "100%",
                overflowY: "auto",
                overflowX: "hidden",
                backgroundColor: "#0A0F1F",
                overscrollBehavior: "contain",
            }}
        >
            <AppRoutes />
        </Box>
    );
};

export default Body