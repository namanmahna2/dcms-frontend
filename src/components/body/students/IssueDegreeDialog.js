import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Typography,
} from "@mui/material";
import { useState } from "react";
// import api from "../../../api/axiosInstance";

const IssueDegreeDialog = ({ open, onClose, student }) => {
  const [degree, setDegree] = useState("");

  const handleSubmit = async () => {
    // await api.post("/credential/issue", {
    //   studentId: student.id,
    //   degree,
    // });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Issue Degree</DialogTitle>
      <DialogContent>
        <Typography sx={{ mb: 2 }}>
          Issuing for: <strong>{student?.name}</strong>
        </Typography>
        <Stack spacing={2}>
          <TextField
            label="Degree Name"
            value={degree}
            onChange={(e) => setDegree(e.target.value)}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>
          Issue
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default IssueDegreeDialog;
