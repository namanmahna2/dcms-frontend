import { Box, Typography } from "@mui/material";
import Students from "../students";

const Acadamics = () => {
    return (
        <Box
            sx={{
                height: "100%",
                width: "100%",
                overflowY: "auto",
                overflowX: "hidden",
                p: 3,
                bgcolor: "background.default",
            }}
        >
            {/* <Students flex={1} /> */}

        </Box>
    );
};

export default Acadamics;
