import React, { useState } from 'react';
import {
    Box,
    Button,
    TextField,
    Typography,
    Snackbar,
    Alert,
    Radio,
    RadioGroup,
    FormControlLabel,
    FormControl,
    FormLabel,
    Chip,
} from '@mui/material';
// import image from "../../../assests/images/login_screen.webp";
// import Colors from '../../../assests/theme/colors';
import forge from "node-forge";
import { JSEncrypt } from "jsencrypt"
import { LoadPublicKey } from "../../helpers/loadPublicKey";
import ServerFunc from '../../server';

const SignIn = ({ onLogin }) => {
    const [userCred, setUserCred] = useState({ email: "", password: "" });
    console.log("user_cred", userCred)
    const [token, setToken] = useState(null);
    const [toast, setToast] = useState({ open: false, message: "", severity: "info" });
    const [userInfo, setUserInfo] = useState(null);

    // MFA state
    const [mfaStep, setMfaStep] = useState("initial");
    const [gaEnabled, setGaEnabled] = useState(false);
    const [pinEnabled, setPinEnabled] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState("");
    const [mfaCode, setMfaCode] = useState("");

    const showToast = (message, severity = "info") => {
        setToast({ open: true, message, severity });
    };
    const handleToastClose = () => setToast({ ...toast, open: false });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserCred((prev) => ({ ...prev, [name]: value }));
    };


    const encryptPassword = async (password) => {
        const pubPem = await LoadPublicKey();
        const pubKey = forge.pki.publicKeyFromPem(pubPem);

        const encryptedBytes = pubKey.encrypt(password, "RSA-OAEP", {
            md: forge.md.sha256.create(),  // SHA-256 hash
            mgf1: forge.mgf.mgf1.create(forge.md.sha256.create()),
        });

        return forge.util.encode64(encryptedBytes);
    };

    const returnSignin = () => {
        setMfaStep("initial")
    }

    const handleLogin = async () => {
        if (!userCred.email.trim() || !userCred.password.trim()) {
            showToast("Email and password are required", "warning");
            return;
        }

        try {
            const encryptedPassword = await encryptPassword(userCred.password);
            const response = await ServerFunc.signin(userCred.email, encryptedPassword);
            const { accessToken, ga_enabled, pin_enabled, user_role, user_id, user_name } = response.data;

            setToken(accessToken);
            setUserInfo({ user_role, user_id, user_name: user_name?.trim() });
            setGaEnabled(ga_enabled);
            setPinEnabled(pin_enabled);

            // Decide MFA flow:
            if (ga_enabled && pin_enabled) {
                // Both enabled => ask user to choose
                setMfaStep("chooseMethod");
            } else if (ga_enabled) {
                setSelectedMethod("ga");
                setMfaStep("enterCode");
                showToast("Enter your Google Authenticator code", "info");
            } else if (pin_enabled) {
                setSelectedMethod("pin");
                setMfaStep("enterCode");
                showToast("Enter your 6-digit PIN", "info");
            } else {
                // No MFA => complete login
                localStorage.setItem("accessToken", accessToken);
                localStorage.setItem("login info", JSON.stringify({ user_role, user_id, user_name: user_name?.trim() }));
                showToast("Login successful!", "success");
                onLogin(accessToken);
            }
        } catch (error) {
            console.error("Login error", error);
            showToast("Invalid credentials or server error", "error");
        }
    };

    const handleSignup = async () => {
        setMfaStep("signup")
    }

    const handleMfaCodeChange = (e) => {
        const val = e.target.value;
        if (selectedMethod === "pin") {
            // Only digits, max length 6 for PIN
            if (/^\d*$/.test(val) && val.length <= 6) setMfaCode(val);
        } else if (selectedMethod === "ga") {
            // For GA codes, generally 6 digits but can be alphanumeric (usually digits)
            if (/^\d*$/.test(val) && val.length <= 6) setMfaCode(val);
        }
    };

    const handleMfaSubmit = async () => {
        if (mfaCode.length !== 6) {
            console.log(mfaCode, "mfacode", selectedMethod)
            showToast(selectedMethod === "pin" ? "PIN must be 6 digits" : "Code must be 6 digits", "warning");
            return;
        }

        try {
            // const encryptedCode = await encryptData(mfaCode);

            let verifyResult;
            if (selectedMethod === "pin") {
                verifyResult = await ServerFunc.authenticatePin(token, mfaCode, "pin");
            } else if (selectedMethod === "ga") {
                verifyResult = await ServerFunc.authenticatePin(token, mfaCode, "ga");
            }

            if (verifyResult.success) {
                localStorage.setItem("accessToken", token);
                localStorage.setItem("login info", JSON.stringify(userInfo));
                showToast("Verification successful! Logging you in...", "success");
                onLogin();
            } else {
                showToast("Invalid code. Please try again.", "error");
            }
        } catch (error) {
            console.error("MFA verification error", error);
            console.error("MFA verification error", error.response.data.message);
            const errMessage = error.response.data.message || "Server error during verification"
            showToast(errMessage, "error");
        }
    };

    const handleMethodChange = (e) => setSelectedMethod(e.target.value);

    const renderInitialLogin = () => (
        <>
            <Typography sx={{ fontWeight: "bold", fontSize: "30px" }}>DCMS</Typography>
            <TextField
                name="email"
                color='black'
                label="Username"
                variant="outlined"
                fullWidth
                size="small"
                value={userCred.email}
                onChange={handleChange}
                InputProps={{ sx: { color: "black" } }}
            />
            <TextField
                name="password"
                label="Password"
                type="password"
                variant="outlined"
                fullWidth
                size="small"
                value={userCred.password}
                onChange={handleChange}
                InputProps={{ sx: { color: "black", mt: 2 } }}
            />
            <Button
                onClick={handleLogin}
                fullWidth
                sx={{
                    mt: 5,
                    py: 1.2,
                    backgroundColor: "#2A3B57",
                    color: "#fff",
                    fontWeight: 600,
                    fontSize: "1rem",
                    borderRadius: "8px",
                    textTransform: "none",
                    boxShadow: 2,
                    "&:hover": { backgroundColor: "#1f2d43" },
                }}
            >
                Login
            </Button>
        </>
    );

    const renderMethodSelection = () => (
        <>
            <FormControl component="fieldset">
                <FormLabel component="legend" sx={{ mb: 2, fontWeight: 'bold' }}>
                    Select MFA Method
                </FormLabel>
                <RadioGroup
                    value={selectedMethod}
                    onChange={handleMethodChange}
                >
                    {pinEnabled && <FormControlLabel value="pin" control={<Radio />} label="PIN" />}
                    {gaEnabled && <FormControlLabel value="ga" control={<Radio />} label="Google Authenticator" />}
                </RadioGroup>
            </FormControl>
            <Button
                disabled={!selectedMethod}
                onClick={() => {
                    if (selectedMethod) {
                        setMfaStep("enterCode");
                        showToast(`Enter your ${selectedMethod === "pin" ? "6-digit PIN" : "Google Authenticator code"}`, "info");
                    }
                }}
                fullWidth
                sx={{
                    mt: 3,
                    py: 1.2,
                    backgroundColor: "#2A3B57",
                    color: "#fff",
                    fontWeight: 600,
                    fontSize: "1rem",
                    borderRadius: "8px",
                    textTransform: "none",
                    boxShadow: 2,
                    "&:hover": { backgroundColor: "#1f2d43" },
                }}
            >
                Continue
            </Button>
        </>
    );

    const renderMfaInput = () => (
        <>
            <Typography variant="h6" mb={2}>
                Enter your {selectedMethod === "pin" ? "6-digit PIN" : "Google Authenticator code"}
            </Typography>
            <TextField
                label={selectedMethod === "pin" ? "PIN" : "Authenticator Code"}
                variant="outlined"
                fullWidth
                size="small"
                value={mfaCode}
                onChange={handleMfaCodeChange}
                inputProps={{ maxLength: 6, inputMode: 'numeric', pattern: '[0-9]*' }}
            />
            <Button
                onClick={handleMfaSubmit}
                fullWidth
                sx={{
                    mt: 3,
                    py: 1.2,
                    backgroundColor: "#2A3B57",
                    color: "#fff",
                    fontWeight: 600,
                    fontSize: "1rem",
                    borderRadius: "8px",
                    textTransform: "none",
                    boxShadow: 2,
                    "&:hover": { backgroundColor: "#1f2d43" },
                }}
            >
                Verify
            </Button>
        </>
    );

    return (
        <Box
            sx={{
                // backgroundImage: `url(${image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                height: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <Box
                sx={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    padding: 6,
                    borderRadius: "1rem",
                    boxShadow: 4,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    minWidth: "30vw",
                    maxWidth: "60vw",
                    minHeight: "25vh",
                    gap: 2,
                }}
            >
                {mfaStep === "initial" && renderInitialLogin()}
                {mfaStep === "chooseMethod" && renderMethodSelection()}
                {mfaStep === "enterCode" && renderMfaInput()}
            </Box>

            {/* Toast Notification */}
            <Snackbar
                open={toast.open}
                autoHideDuration={4000}
                onClose={handleToastClose}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
                <Alert
                    onClose={handleToastClose}
                    severity={toast.severity}
                    variant="filled"
                    sx={{ width: "100%" }}
                >
                    {toast.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default SignIn;
