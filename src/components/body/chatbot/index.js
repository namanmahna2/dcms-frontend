import { Box } from "@mui/system"
import useAuthStore from "../../../helpers/infoStore/auth"

const Chatbot = () => {
    const { token } = useAuthStore();
    return <Box sx={{
        height:"100%",
        display: "flex",
        flexDirection: "column",
        color: "#fff",
        p: 2,
        bgcolor: "#0b0f19",
    }}>
        <iframe
            src={`http://localhost:7860?token=${token}`}
            style={{
                width: "100%",
                height: "1100px",
                border: "none"
            }}
        />
    </Box>
}


export default Chatbot