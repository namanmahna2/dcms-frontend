import { Box, List } from "@mui/material";
import useTabStore from "../../helpers/infoStore/tabStore";
import { useNavigate, useLocation } from "react-router-dom";
import useUserStore from "../../helpers/infoStore/useUserStore";
import Server from "../../server";

import DashboardIcon from "@mui/icons-material/Dashboard";
import SettingsIcon from "@mui/icons-material/Settings";
import GroupIcon from "@mui/icons-material/Group";
import PersonIcon from "@mui/icons-material/Person";
import CustomListItem from "./CustomListItems";
import { useEffect } from "react";

const TabSection = () => {
  const { tabName: __tabName, setTabname } = useTabStore();
  const { user: _user, setUser } = useUserStore();
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const fetchUser = async () => {
      try {
        const res = await Server.isAdmin();

        if (!isMounted) return;

        setUser(
          res?.data?.isAdmin === true ? "admin" : "student"
        );
      } catch (error) {
        console.error("Admin verification failed:", error);

        if (isMounted) {
          setUser("student");
        }
      }
    };

    fetchUser();

    return () => {
      isMounted = false;
    };
  }, [setUser]);

  const iconMap = {
    dashboard: <DashboardIcon />,
    students: <GroupIcon />,
    certificates: <PersonIcon />,
    anomaly: <SettingsIcon />,
    chatbot: <SettingsIcon />,
  };

  const tabsForDisplay =
    _user === "admin"
      ? [
          "dashboard",
          "students",
          "certificates",
          "anomaly",
          "chatbot",
        ]
      : ["dashboard"];

  const onClickTab = (tabname) => {
    const normalized = tabname.toLowerCase().trim();

    navigate(
      normalized === "dashboard"
        ? "/"
        : `/${normalized}`
    );

    setTabname(tabname);
  };

  return (
    <Box
      sx={{
        height:"8%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        p: 2,
        background:
          "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
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