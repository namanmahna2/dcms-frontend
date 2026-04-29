import { Box, Typography } from "@mui/material";
import ProfileSection from "./profileSection";

const Header = ({ userProfile }) => {
  return (
    <Box
      component="header"
      sx={{
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
        height: "8%",
        px: 6,
        background: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)", // same as TabSection
        borderBottom: "1px solid #00e5ff", // neon cyan border to separate header from tabs
        boxShadow: "0 2px 8px rgba(0, 229, 255, 0.3)", // subtle glow
        flexShrink: 0,
        color: "#00e5ff", // neon cyan text color
        zIndex: 20,
        position: "sticky",
        top: 0,
      }}
    >
      {/* <Typography
        variant="h6"
        fontWeight="bold"
        sx={{
          textShadow:
            "0 0 6px #00e5ff, 0 0 12px #00b8f4, 0 0 18px #0088cc", // neon glow effect
          letterSpacing: 1.2,
        }}
      >
        LOGO
      </Typography> */}
      <ProfileSection userProfile={userProfile} />
    </Box>
  );
};

export default Header;
