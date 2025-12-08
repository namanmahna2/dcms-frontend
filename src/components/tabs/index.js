import { Box, List } from "@mui/material";
import useTabStore from "../../helpers/infoStore/tabStore";
import { useNavigate } from "react-router-dom";


import DashboardIcon from "@mui/icons-material/Dashboard";
import SettingsIcon from "@mui/icons-material/Settings";
import GroupIcon from "@mui/icons-material/Group";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import CustomListItem from "./CustomListItems";


const TabSection = () => {
    const { tabName: __tabName, setTabname } = useTabStore()
    console.log("__tabName", __tabName)
    const navigate = useNavigate();

    const iconMap = {
        dashboard: <DashboardIcon />,
        projectLead: <GroupIcon />,
        developers: <PersonIcon />,
        settings: <SettingsIcon />,
    };

    const userRole = JSON.parse(localStorage.getItem("login info"))?.user_role || "student";
    const tabsForDisplay =
        userRole === "admin"
            ? ["dashboard", "students", "certificates", "anomaly"]
            : ["dashboard"];

    const handleLogoutClick = () => {
        // Add logout logic if needed
    };

    const onClickTab = (tabname) => {
        const normalized = tabname.toLowerCase().trim();
        // console.log("ONCLICK TABNAME", tabname)
        navigate(normalized === "dashboard" ? "/" : `/${normalized}`);
        setTabname(tabname)
    };

    return (
        <Box
            sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                py: 2,
                px: 6,
                background: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
                boxShadow: "0px 8px 20px rgba(0,0,0,0.3)",
                zIndex: 10,
                position: "sticky",
                top: 0,
            }}
        >
            <List
                sx={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    padding: 0,
                    gap: 2,
                }}
            >
                {tabsForDisplay.map((tabname) => (
                    <CustomListItem
                        key={tabname}
                        name={tabname}
                        icon={iconMap[tabname]}
                        selected={__tabName === tabname}
                        onClick={() => onClickTab(tabname)}
                    />
                ))}
            </List>
        </Box>
    );
};

export default TabSection;
