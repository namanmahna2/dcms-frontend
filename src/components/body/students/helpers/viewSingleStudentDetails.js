import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Typography,
  Box,
  Stack,
  Button,
  Fade,
  Chip,
  IconButton,
  Avatar,
  Tooltip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EmailIcon from "@mui/icons-material/Email";
import SchoolIcon from "@mui/icons-material/School";
import ApartmentIcon from "@mui/icons-material/Apartment";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import Server from "../../../../server";
import Toast from "../../../../utils/toast";
import { useEffect, useState } from "react";

const getInitials = (name = "") => {
  if (!name.trim()) return "👤";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || "👤";
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

const InfoRow = ({ label, value, icon }) => (
  <Stack
    direction="row"
    spacing={1.5}
    alignItems="flex-start"
    sx={{ mb: 0.5 }}
  >
    {icon && <Box sx={{ mt: "2px" }}>{icon}</Box>}
    <Box>
      <Typography
        variant="caption"
        sx={{ color: "rgba(255,255,255,0.6)", textTransform: "uppercase" }}
      >
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 500 }}>
        {value || "—"}
      </Typography>
    </Box>
  </Stack>
);

const SingleDetailDialog = ({
  open,
  onClose,
  data = {},
  onMint,
  loadingMint = false,
}) => {
  const {
    name = "—",
    email = "—",
    department = "—",
    course = "—",
    wallet_address = "—",
    id,
    status,
  } = data || {};

  const [studentData, setStudentData] = useState([])
  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiResponse = await Server.getStudentById(id);
        setStudentData(apiResponse.data[0])
      } catch (error) {
        console.error(error);
        Toast.error("Something went wrong!");
      }
    };

    if (open && id) {
      fetchData();
    }
  }, [open, id]);

  const statusColor =
    status?.toLowerCase() === "verified"
      ? "success"
      : status?.toLowerCase() === "rejected"
        ? "error"
        : "warning";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      aria-labelledby="student-detail-dialog-title"
      PaperProps={{
        sx: {
          bgcolor: "#020617",
          color: "#fff",
          border: "1px solid rgba(0,234,255,0.25)",
          borderRadius: 3,
          boxShadow: "0 0 40px rgba(0,234,255,0.25)",
          backdropFilter: "blur(18px)",
          overflow: "hidden",
          maxHeight: "90vh",
        },
      }}
      TransitionComponent={Fade}
      transitionDuration={400}
    >
      {/* HEADER */}
      <DialogTitle
        id="student-detail-dialog-title"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          py: 1.5,
          pl: 3,
          pr: 1.5,
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          bgcolor: "rgba(15,23,42,0.9)",
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar
            sx={{
              width: 40,
              height: 40,
              bgcolor: "rgba(0,234,255,0.15)",
              border: "1px solid rgba(0,234,255,0.7)",
              fontWeight: 700,
            }}
          >
            {getInitials(name)}
          </Avatar>
          <Box>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                color: "#e2f3ff",
                letterSpacing: 0.4,
              }}
            >
              {name !== "—" ? name : "Student"} — Degree Details
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              {id && (
                <Typography
                  variant="caption"
                  sx={{ color: "rgba(255,255,255,0.6)" }}
                >
                  ID: <strong>{id}</strong>
                </Typography>
              )}
              {status && (
                <Chip
                  size="small"
                  label={status}
                  color={statusColor}
                  sx={{
                    height: 20,
                    fontSize: 11,
                    textTransform: "uppercase",
                    letterSpacing: 0.6,
                  }}
                />
              )}
            </Stack>
          </Box>
        </Stack>

        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: "rgba(255,255,255,0.7)",
            "&:hover": { color: "#fff", bgcolor: "rgba(148,163,184,0.15)" },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      {/* BODY */}
      <DialogContent
        sx={{
          p: 3,
          pt: 2,
          overflowY: "auto",
          bgcolor:
            "radial-gradient(circle at top, #020617 0, #020617 40%, #000 100%)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            gap: 3,
          }}
        >
          <Box
            sx={{
              p: 2.5,
              borderRadius: 2,
              border: "1px solid rgba(148,163,184,0.35)",
              bgcolor: "rgba(15,23,42,0.9)",
              flex: 1,
            }}
          >
            <Typography
              variant="overline"
              sx={{
                color: "#00eaff",
                letterSpacing: 1.2,
                mb: 1.5,
                display: "block",
              }}
            >
              Student Information
            </Typography>

            <Stack spacing={1}>
              <InfoRow
                label="Name"
                value={name}
                icon={<SchoolIcon fontSize="small" />}
              />
              <InfoRow
                label="Email"
                value={email}
                icon={<EmailIcon fontSize="small" />}
              />
              <InfoRow
                label="Department"
                value={studentData.department_name}
                icon={<ApartmentIcon fontSize="small" />}
              />
              <InfoRow
                label="Course"
                value={studentData.course_name}
                icon={<SchoolIcon fontSize="small" />}
              />
              <InfoRow
                label="Wallet Address"
                value={
                  wallet_address && wallet_address !== "—"
                    ? `${wallet_address.slice(0, 8)}...${wallet_address.slice(
                      -6
                    )}`
                    : "—"
                }
                icon={<AccountBalanceWalletIcon fontSize="small" />}
              />

              {wallet_address && wallet_address !== "—" && (
                <Tooltip title="Copy full wallet address">
                  <Button
                    size="small"
                    variant="text"
                    sx={{
                      alignSelf: "flex-start",
                      mt: 0.5,
                      px: 0,
                      minWidth: 0,
                      fontSize: 11,
                      color: "rgba(148,163,184,0.9)",
                      "&:hover": {
                        color: "#e5f0ff",
                        bgcolor: "transparent",
                      },
                    }}
                    onClick={() => {
                      navigator.clipboard
                        ?.writeText(wallet_address)
                        .catch(() => { });
                    }}
                  >
                    Copy address
                  </Button>
                </Tooltip>
              )}
            </Stack>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          py: 1.5,
          borderTop: "1px solid rgba(15,23,42,0.9)",
          bgcolor: "rgba(15,23,42,0.96)",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Typography variant="caption" sx={{ color: "rgba(148,163,184,0.8)" }}>
          Secure academic identity — powered by on-chain credentials.
        </Typography>
        <Button
          size="small"
          onClick={onClose}
          sx={{
            textTransform: "none",
            color: "rgba(148,163,184,0.9)",
            "&:hover": {
              color: "#e5f0ff",
              bgcolor: "rgba(15,23,42,0.9)",
            },
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SingleDetailDialog;
