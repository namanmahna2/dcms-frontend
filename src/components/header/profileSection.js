import React, { useState, useRef } from "react";
import {
    Box,
    Avatar,
    Typography,
    Paper,
    ClickAwayListener,
    Grow,
    Popper,
    MenuList,
    MenuItem,
    capitalize,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Slide,
    Tabs,
    Tab,
    TextField,
    Switch,
    FormControlLabel,
    Snackbar,
    Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import ServerFunc from "../../server";
import Server from "../../server";
import Toast from "../../utils/toast";

import { UseUserProfile } from "../../helpers/queryHooks/userProfile";
import useAuthStore from "../../helpers/infoStore/auth";

// Optional animation for dialogs
const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const ProfileSection = ({ userProfile }) => {
    const { isAuthenticated, setAuthenticated } = useAuthStore();

    const [open, setOpen] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [tabIndex, setTabIndex] = useState(0);

    const {
        refetch: refetchProfile
    } = UseUserProfile({
        enabled: isAuthenticated
    });

    // State objects for each tab fields
    const [editProfileData, setEditProfileData] = useState({
        name: userProfile.name || "",
        email: userProfile.email || "",
        phone: userProfile.phone || "",
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [mfaData, setMfaData] = useState({
        mfaEnabled: userProfile.mfa_toggle || false,
        mfaPin: "",
    });

    const [toast, setToast] = useState({
        open: false,
        message: "",
        severity: "success",
    });

    const anchorRef = useRef(null);
    const navigate = useNavigate();

    // Dropdown toggle
    const handleToggle = () => {
        setOpen((prevOpen) => !prevOpen);
    };

    // Close dropdown
    const handleClose = (event) => {
        if (anchorRef.current && anchorRef.current.contains(event.target)) return;
        setOpen(false);
    };

    // Open Settings dialog
    const handleSettings = () => {
        setOpen(false);
        setDialogOpen(true);
    };

    const handleSignOut = async () => {
        try {
            await Server.signout();

            // CLEAR TOKEN EVERYWHERE
            Cookies.remove("x-access-token");
            localStorage.removeItem("login info");
            localStorage.removeItem("tabName");

            // IMPORTANT: Remove from Axios
            delete axios.defaults.headers.common["x-access-token"];

            // Also clear Zustand auth
            setAuthenticated(false);

            // navigate("/login");
        } catch (error) {
            Toast.error("Something went wrong!");
        }
    };

    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

    const handleSignOutClick = () => {
        setOpen(false);
        setConfirmDialogOpen(true);
    };

    const confirmSignOut = () => {
        setConfirmDialogOpen(false);
        handleSignOut();
    };

    // Close settings dialog
    const handleSettingsClose = () => {
        setDialogOpen(false);
    };

    // Save handlers for each tab
    const handleSaveProfile = async () => {
        try {
            console.log("data for update", editProfileData)
            await Server.updateUserProfile(editProfileData)

            refetchProfile()
            setToast({
                open: true,
                message: "Profile updated successfully!",
                severity: "success",
            });

            setDialogOpen(false);
        } catch (error) {
            setToast({
                open: true,
                message: "Something went wrong. Please try again.",
                severity: "error",
            });
        }
    };

    const handleSavePassword = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setToast({
                open: true,
                message: "New password and confirmation do not match",
                severity: "warning",
            });
            return;
        }
        console.log("Save Password Data:", passwordData);

        try {
            await ServerFunc.updateUserProfile(passwordData)

            setToast({
                open: true,
                message: "Document deleted successfully!",
                severity: "success",
            });

            setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });

            setDialogOpen(false);
        } catch (error) {
            setToast({
                open: true,
                message: error?.data?.data?.message ?? "Something went wrong. Please try again.",
                severity: "error",
            });
        }
    };

    const handleSaveMfa = async () => {
        console.log("Save MFA Data:", mfaData);

        try {
            await ServerFunc.updateUserProfile(mfaData)

            setToast({
                open: true,
                message: "MFA saved successfully!",
                severity: "success",
            });

            setDialogOpen(false);
        } catch (error) {
            setToast({
                open: true,
                message: error?.data?.data?.message ?? "Something went wrong. Please try again.",
                severity: "error",
            });
        }
    };

    return (
        <Box ref={anchorRef}>
            {/* Profile Display */}
            <Box
                display="flex"
                alignItems="center"
                gap={2}
                onClick={handleToggle}
                sx={{
                    padding: 1,
                    backgroundColor: "transparent",
                    borderRadius: 2,
                    maxWidth: 300,
                    backdropFilter: "blur(8px)",
                    cursor: "pointer",
                    userSelect: "none",
                }}
            >
                <Avatar
                    alt={userProfile.name}
                    src="https://i.pravatar.cc/100"
                    sx={{
                        width: 56,
                        height: 56,
                        border: "2px solid #00e5ff",
                        boxShadow: "0 0 10px #00e5ff",
                    }}
                />
                <Box>
                    <Typography
                        variant="subtitle1"
                        fontWeight="bold"
                        sx={{ color: "#00e5ff", textShadow: "0 0 6px #00e5ff" }}
                    >
                        {userProfile.name}
                    </Typography>
                    <Typography
                        variant="body2"
                        sx={{ color: "#7aefff", textShadow: "0 0 3px #7aefff" }}
                    >
                        {capitalize(
                            JSON.parse(localStorage.getItem("login info"))?.user_role || ""
                        )}
                    </Typography>
                </Box>
            </Box>

            {/* Dropdown panel */}
            <Popper
                open={open}
                anchorEl={anchorRef.current}
                role={undefined}
                placement="bottom-end"
                transition
                disablePortal
                sx={{ zIndex: 1300 }}
            >
                {({ TransitionProps }) => (
                    <Grow {...TransitionProps} style={{ transformOrigin: "right top" }}>
                        <Paper
                            sx={{
                                mt: 1,
                                borderRadius: 2,
                                background:
                                    "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
                                border: "1px solid #00e5ff",
                                boxShadow: "0 0 10px #00e5ff",
                                minWidth: 180,
                            }}
                        >
                            <ClickAwayListener onClickAway={handleClose}>
                                <MenuList autoFocusItem={open}>
                                    <MenuItem
                                        onClick={handleSettings}
                                        sx={{
                                            color: "#00e5ff",
                                            "&:hover": { backgroundColor: "#00e5ff22" },
                                        }}
                                    >
                                        Settings
                                    </MenuItem>
                                    <MenuItem
                                        onClick={handleSignOutClick}
                                        sx={{
                                            color: "#ff5252",
                                            "&:hover": { backgroundColor: "#ff174422" },
                                        }}
                                    >
                                        Sign Out
                                    </MenuItem>
                                </MenuList>
                            </ClickAwayListener>
                        </Paper>
                    </Grow>
                )}
            </Popper>

            {/* Settings Dialog */}
            <Dialog
                open={dialogOpen}
                onClose={handleSettingsClose}
                TransitionComponent={Transition}
                keepMounted
                sx={{
                    "& .MuiPaper-root": {
                        background:
                            "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
                        border: "1px solid #00e5ff",
                        borderRadius: "16px",
                        boxShadow: "0 0 15px #00e5ff",
                        color: "#fff",
                        textAlign: "center",
                        minWidth: "30vw",
                        minHeight: "30vh",
                        px: 3,
                        pt: 1,
                    },
                }}
            >
                <DialogTitle sx={{ color: "#00e5ff" }}>Settings</DialogTitle>
                <DialogContent>
                    <Tabs
                        value={tabIndex}
                        onChange={(_, newIndex) => setTabIndex(newIndex)}
                        centered
                        textColor="inherit"
                        indicatorColor="secondary"
                        sx={{ mb: 2 }}
                    >
                        <Tab label="Edit Profile" sx={{ color: "#7aefff" }} />
                        <Tab label="Change Password" sx={{ color: "#7aefff" }} />
                        <Tab label="MFA" sx={{ color: "#7aefff" }} />
                    </Tabs>

                    {tabIndex === 0 && (
                        <Box display="flex" flexDirection="column" gap={2}>
                            <TextField
                                label="Full Name"
                                fullWidth
                                variant="outlined"
                                value={editProfileData.name}
                                onChange={(e) =>
                                    setEditProfileData((prev) => ({
                                        ...prev,
                                        name: e.target.value,
                                    }))
                                }
                                InputLabelProps={{ style: { color: "#00e5ff" } }}
                                InputProps={{ style: { color: "#fff" } }}
                            />
                            <TextField
                                label="Email"
                                disabled={true}
                                fullWidth
                                variant="outlined"
                                value={editProfileData.email}
                                onChange={(e) =>
                                    setEditProfileData((prev) => ({
                                        ...prev,
                                        email: e.target.value,
                                    }))
                                }
                                InputLabelProps={{ style: { color: "#00e5ff" } }}
                                InputProps={{ style: { color: "#fff" } }}
                            />

                            <TextField
                                label="Phone"
                                fullWidth
                                variant="outlined"
                                value={editProfileData.phone}
                                onChange={(e) =>
                                    setEditProfileData((prev) => ({
                                        ...prev,
                                        phone: e.target.value,
                                    }))
                                }
                                InputLabelProps={{ style: { color: "#00e5ff" } }}
                                InputProps={{ style: { color: "#fff" } }}
                            />
                        </Box>
                    )}

                    {tabIndex === 1 && (
                        <Box display="flex" flexDirection="column" gap={2}>
                            <TextField
                                label="Current Password"
                                type="password"
                                fullWidth
                                variant="outlined"
                                value={passwordData.currentPassword}
                                onChange={(e) =>
                                    setPasswordData((prev) => ({
                                        ...prev,
                                        currentPassword: e.target.value,
                                    }))
                                }
                                InputLabelProps={{ style: { color: "#00e5ff" } }}
                                InputProps={{ style: { color: "#fff" } }}
                            />
                            <TextField
                                label="New Password"
                                type="password"
                                fullWidth
                                variant="outlined"
                                value={passwordData.newPassword}
                                onChange={(e) =>
                                    setPasswordData((prev) => ({
                                        ...prev,
                                        newPassword: e.target.value,
                                    }))
                                }
                                InputLabelProps={{ style: { color: "#00e5ff" } }}
                                InputProps={{ style: { color: "#fff" } }}
                            />
                            <TextField
                                label="Confirm New Password"
                                type="password"
                                fullWidth
                                variant="outlined"
                                value={passwordData.confirmPassword}
                                onChange={(e) =>
                                    setPasswordData((prev) => ({
                                        ...prev,
                                        confirmPassword: e.target.value,
                                    }))
                                }
                                InputLabelProps={{ style: { color: "#00e5ff" } }}
                                InputProps={{ style: { color: "#fff" } }}
                            />
                        </Box>
                    )}

                    {tabIndex === 2 && (
                        <Box>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={mfaData.mfaEnabled}
                                        onChange={(e) =>
                                            setMfaData((prev) => ({
                                                ...prev,
                                                mfaEnabled: e.target.checked,
                                                mfaPin: "", // Reset pin when toggled
                                            }))
                                        }
                                        color="primary"
                                    />
                                }
                                label="Enable Multi-Factor Authentication (MFA)"
                                sx={{ color: "#7aefff", mb: 3 }}
                            />

                            {mfaData.mfaEnabled && (
                                <TextField
                                    label="6-digit MFA PIN"
                                    variant="outlined"
                                    fullWidth
                                    margin="dense"
                                    value={mfaData.mfaPin || ""}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (/^\d{0,6}$/.test(value)) {
                                            setMfaData((prev) => ({ ...prev, mfaPin: value }));
                                        }
                                    }}
                                    sx={{
                                        input: { color: "#7aefff" },
                                        label: { color: "#7aefff" },
                                        "& .MuiOutlinedInput-root": {
                                            "& fieldset": { borderColor: "#00e5ff" },
                                            "&:hover fieldset": { borderColor: "#00e5ff" },
                                            "&.Mui-focused fieldset": { borderColor: "#00e5ff" },
                                        },
                                        mb: 3,
                                    }}
                                    inputProps={{
                                        maxLength: 6,
                                        inputMode: "numeric",
                                        pattern: "[0-9]*",
                                    }}
                                />
                            )}
                        </Box>

                    )}
                </DialogContent>

                <DialogActions sx={{ justifyContent: "space-between", mb: 2, px: 3 }}>
                    <Button
                        onClick={handleSettingsClose}
                        sx={{
                            color: "#00e5ff",
                            borderColor: "#00e5ff",
                            textShadow: "0 0 4px #00e5ff",
                            "&:hover": { backgroundColor: "#00e5ff22" },
                            minWidth: 120,
                        }}
                        variant="outlined"
                    >
                        Close
                    </Button>
                    <Button
                        onClick={() => {
                            if (tabIndex === 0) handleSaveProfile();
                            else if (tabIndex === 1) handleSavePassword();
                            else if (tabIndex === 2) handleSaveMfa();
                        }}
                        sx={{
                            color: "#00e5ff",
                            borderColor: "#00e5ff",
                            textShadow: "0 0 4px #00e5ff",
                            "&:hover": { backgroundColor: "#00e5ff22" },
                            minWidth: 120,
                        }}
                        variant="outlined"
                    >
                        Save
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Sign Out Confirmation Dialog */}
            <Dialog
                open={confirmDialogOpen}
                onClose={() => setConfirmDialogOpen(false)}
                TransitionComponent={Transition}
                keepMounted
                sx={{
                    "& .MuiPaper-root": {
                        background:
                            "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
                        border: "1px solid #00e5ff",
                        borderRadius: "16px",
                        boxShadow: "0 0 15px #00e5ff",
                        color: "#fff",
                        textAlign: "center",
                        minWidth: "30vw",
                        minHeight: "20vh",
                        px: 3,
                        pt: 1,
                    },
                }}
            >
                <DialogTitle sx={{ color: "#ff5252" }}>Confirm Sign Out</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to sign out?
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ justifyContent: "center", mb: 2 }}>
                    <Button
                        onClick={() => setConfirmDialogOpen(false)}
                        variant="outlined"
                        sx={{ color: "#00e5ff", borderColor: "#00e5ff" }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={confirmSignOut}
                        variant="outlined"
                        sx={{
                            color: "#ff5252",
                            borderColor: "#ff5252",
                            ml: 2,
                            "&:hover": { backgroundColor: "#ff525522" },
                        }}
                    >
                        Sign Out
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={toast.open}
                autoHideDuration={2000}
                onClose={() => setToast({ ...toast, open: false })}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            >
                <Alert
                    onClose={() => setToast({ ...toast, open: false })}
                    severity={toast.severity}
                    sx={{
                        background:
                            toast.severity === "success"
                                ? "linear-gradient(45deg, #00e676, #00c853)"
                                : "linear-gradient(45deg, #ff1744, #d50000)",
                        color: "#fff",
                        fontWeight: "bold",
                    }}
                >
                    {toast.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default ProfileSection;
