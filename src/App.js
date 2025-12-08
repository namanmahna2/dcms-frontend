import { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";

import pic from "./utils/assests/dcms-bg.jpg";
import SignIn from "./components/signin";
import Header from "./components/header";
import TabSection from "./components/tabs";
import Body from "./components/body";

import useAuthStore from "./helpers/infoStore/auth";
import useTabStore from "./helpers/infoStore/tabStore";
import { UseUserProfile } from "./helpers/queryHooks/userProfile";
import useWalletStore from "./helpers/infoStore/useWalletStore";
import useSocket from "./utils/sockets";
import Server from "./server";
import AccessDenied from "./components/helpers/accessDenied";

function App() {
  const { connectWallet } = useWalletStore();
  const { socket, messages } = useSocket("http://localhost:3011");
  const navigate = useNavigate();
  const { tabName, setTabname } = useTabStore();

  // Zustand: Auth state
  const { isAuthenticated, setAuthenticated } = useAuthStore();

  // Local states
  const [authChecked, setAuthChecked] = useState(false);

  // 🔥 Forbidden / IP-block state
  const [isForbidden, setIsForbidden] = useState(false);
  const [forbiddenMessage, setForbiddenMessage] = useState("");

  // Fetch user profile only when authenticated
  const {
    data: userProfileData = {},
    isFetching: isProfileLoading,
    error: profileError,
    refetch: refetchProfile,
  } = UseUserProfile({
    enabled: isAuthenticated,
  });

  const tabCheckHandler = (tabName) => {
    let _tabName = localStorage.getItem("tabName");
    if (!_tabName) localStorage.setItem("tabName", tabName);
  };

  const navigateHandler = () => {
    const currentTab = localStorage.getItem("tabName") || "dashboard";

    switch (currentTab) {
      case "students":
        navigate("/students");
        break;
      case "certificates":
        navigate("/certificates");
        break;
      case "anomaly":
        navigate("/anomaly");
        break;
      default:
        navigate("/");
    }
  };

  // 🔹 Register 403 / forbidden callback once
  useEffect(() => {
    Server.setForbiddenCallback((response) => {
      const msg =
        response?.data?.message ||
        "Access denied. Your IP or account has been blocked by the security system.";
      setForbiddenMessage(msg);
      setIsForbidden(true);
    });
  }, []);

  // 🔹 Initial auth check from cookie
  useEffect(() => {
    const token = Cookies.get("x-access-token");

    if (token) {
      setAuthenticated(true);
    } else {
      setAuthenticated(false);
    }

    setAuthChecked(true);
  }, [setAuthenticated]);

  // 🚨 Handle profile fetch errors
  useEffect(() => {
    if (profileError) {
      toast.error("Failed to load profile. Please try again.");
    }
  }, [profileError]);

  // 🔹 On auth change: connect wallet & navigate
  useEffect(() => {
    if (isAuthenticated) {
      connectWallet(true);
      navigateHandler();
    }
  }, [isAuthenticated, connectWallet]); // navigateHandler is stable enough via localStorage

  // 🔥 If forbidden, render access-denied page instead of the app
  if (isForbidden) {
    return (
      <>
        <AccessDenied message={forbiddenMessage} />
        <ToastContainer position="top-right" autoClose={2000} />
      </>
    );
  }

  // Loading state
  if (!authChecked || (isAuthenticated && isProfileLoading)) {
    return <Typography sx={{ p: 2 }}>Loading...</Typography>;
  }

  // Not authenticated → show SignIn
  if (!isAuthenticated) {
    return (
      <>
        <Box
          sx={{
            position: "relative",
            width: "100vw",
            height: "100vh",
            overflow: "auto",
          }}
        >
          {/* Background Image */}
          <Box
            component="img"
            src={pic}
            alt="background"
            sx={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              objectFit: "cover",
              zIndex: -1,
            }}
          />

          {/* Centered Sign-in Form */}
          <SignIn
            onLogin={() => {
              setAuthenticated(true);
              refetchProfile();
              tabCheckHandler(tabName);
              navigateHandler();
              toast.success("Signed in successfully!", {
                autoClose: 2000,
              });
            }}
          />
        </Box>
        <ToastContainer position="top-right" autoClose={2000} />
      </>
    );
  }

  // Authenticated → main app layout
  return (
    <Box
      sx={{
        height: "100vh",
        width: "100vw",
        maxWidth: "100vw",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      <Header userProfile={userProfileData} />
      <TabSection selectedTabName={tabName} />
      <Body />
      <ToastContainer position="top-right" autoClose={2000} />
    </Box>
  );
}

export default App;
