import { useEffect, useState, useCallback } from "react";
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
import Server from "./server";
import AccessDenied from "./components/helpers/accessDenied";

function App() {
  const { connectWallet } = useWalletStore();
  const navigate = useNavigate();
  const { tabName } = useTabStore();

  const {
    isAuthenticated,
    setAuthenticated,
    setToken,
  } = useAuthStore();

  const [authChecked, setAuthChecked] = useState(false);
  const [isForbidden, setIsForbidden] = useState(false);
  const [forbiddenMessage, setForbiddenMessage] =
    useState("");

  // =========================
  // Profile Query
  // =========================
  const {
    data: userProfileData = {},
    isFetching: isProfileLoading,
    error: profileError,
  } = UseUserProfile({
    enabled: authChecked && isAuthenticated,
  });

  // =========================
  // Helpers
  // =========================
  const tabCheckHandler = useCallback((tab) => {
    const savedTab = localStorage.getItem("tabName");

    if (!savedTab) {
      localStorage.setItem("tabName", tab);
    }
  }, []);

  const navigateHandler = useCallback(() => {
    const currentTab =
      localStorage.getItem("tabName") || "dashboard";

    const routes = {
      dashboard: "/",
      students: "/students",
      certificates: "/certificates",
      anomaly: "/anomaly",
      chatbot: "/chatbot",
    };

    navigate(routes[currentTab] || "/", {
      replace: true,
    });
  }, [navigate]);

  // =========================
  // Forbidden Callback
  // =========================
  useEffect(() => {
    Server.setForbiddenCallback((response) => {
      const msg =
        response?.data?.message ||
        "Access denied. Your IP or account has been blocked by the security system.";

      setForbiddenMessage(msg);
      setIsForbidden(true);
    });
  }, []);

  // =========================
  // Initial Auth Check
  // =========================
  useEffect(() => {
    const token = Cookies.get("x-access-token");

    setAuthenticated(!!token);
    setAuthChecked(true);
  }, [setAuthenticated]);

  // =========================
  // Profile Error Toast
  // =========================
  useEffect(() => {
    if (
      profileError &&
      !toast.isActive("profile-error")
    ) {
      toast.error(
        "Failed to load profile. Please try again.",
        {
          toastId: "profile-error",
        }
      );
    }
  }, [profileError]);

  // =========================
  // Auth Navigation
  // =========================
  useEffect(() => {
    if (!authChecked || !isAuthenticated) return;

    connectWallet(true);

    const hasNavigated =
      sessionStorage.getItem("hasNavigated");

    if (!hasNavigated) {
      navigateHandler();
      sessionStorage.setItem(
        "hasNavigated",
        "true"
      );
    }
  }, [
    authChecked,
    isAuthenticated,
    connectWallet,
    navigateHandler,
  ]);

  // =========================
  // Forbidden Screen
  // =========================
  if (isForbidden) {
    return (
      <>
        <AccessDenied
          message={forbiddenMessage}
        />
        <ToastContainer
          position="top-right"
          autoClose={2000}
        />
      </>
    );
  }

  // Loading
  if (
    !authChecked ||
    (isAuthenticated &&
      isProfileLoading)
  ) {
    return (
      <Typography sx={{ p: 2 }}>
        Loading...
      </Typography>
    );
  }

  // Login Screen
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
          {/* Background */}
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

          {/* Sign In */}
          <SignIn
            onLogin={(tokenFromAPI) => {
              Cookies.set(
                "x-access-token",
                tokenFromAPI
              );

              setToken(tokenFromAPI);
              setAuthenticated(true);

              sessionStorage.removeItem(
                "hasNavigated"
              );

              tabCheckHandler(tabName);

              toast.success(
                "Signed in successfully!",
                {
                  autoClose: 2000,
                }
              );
            }}
          />
        </Box>

        <ToastContainer
          position="top-right"
          autoClose={2000}
        />
      </>
    );
  }

  // Main App
  return (
    <Box
      sx={{
        height: "100dvh",
        width: "100dvw",
        maxWidth: "100vw",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      <Header
        userProfile={userProfileData}
      />
      <TabSection />
      <Body />

      <ToastContainer
        position="top-right"
        autoClose={2000}
      />
    </Box>
  );
}

export default App;