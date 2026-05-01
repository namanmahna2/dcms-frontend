import React from "react";
import {
    IconButton,
    Tooltip,
    Stack
} from "@mui/material";
import {
    Visibility,
    Edit,
    Delete,
    AssignmentInd,
    UploadFile,
    Email,
} from "@mui/icons-material";
import BlockIcon from "@mui/icons-material/Block";
import ReportIcon from "@mui/icons-material/Report";
import { motion } from "framer-motion"


export default function StudentActions({ studentDetails, id, onView, onEdit, onDelete, onAssign, onUpload, onRevoke }) {
    console.log("student deyails have alokk!!!", studentDetails)
    return (
        <Stack direction="row" spacing={1} justifyContent="center">
            <Tooltip
                title="View Details"
                slotProps={{
                    tooltip: {
                        sx: {
                            fontSize: "1rem",
                            padding: "8px 12px",
                        }
                    }
                }}
            >
                <IconButton color="primary" onClick={() => onView(id)}>
                    <Visibility />
                </IconButton>
            </Tooltip>

            {/* <Tooltip
                title={
                    studentDetails.is_revoked && studentDetails.revocation_reason
                        ? `Revoked: ${studentDetails.revocation_reason}`
                        : studentDetails.tx_hash ? "Revoke Degree" : "Degree Not Issued"
                }
                placement="right"
            >
                <span>
                    <IconButton
                        color="warning"
                    // onClick={onRevoke}
                    // disabled={studentDetails.is_revoked}
                    >
                        <ReportIcon />
                    </IconButton>
                </span>
            </Tooltip> */}



            <Tooltip
                title="Delete"
                slotProps={{
                    tooltip: {
                        sx: {
                            fontSize: "1rem",
                            padding: "8px 12px",
                        }
                    }
                }}
            >
                <IconButton color="error" onClick={() => onDelete(id)}>
                    <Delete />
                </IconButton>
            </Tooltip>

            {/* <Tooltip title="Assign Project">
                <IconButton color="info" onClick={onAssign}>
                    <AssignmentInd />
                </IconButton>
            </Tooltip> */}

            {/* <Tooltip
                title="Upload Documents"
                slotProps={{
                    tooltip: {
                        sx: {
                            fontSize: "1rem",
                            padding: "8px 12px",
                        }
                    }
                }}
            >
                <IconButton color="success" onClick={onUpload} disabled={true}>
                    <UploadFile />
                </IconButton>
            </Tooltip> */}

            <Tooltip
                title={`${studentDetails?.is_revoked && studentDetails.revocation_reason ? studentDetails.revocation_reason : !studentDetails?.tx_hash ? "Degree Not Issued" : "Revoke Degree"}`}
                placement="right"
                slotProps={{
                    tooltip: {
                        sx: {
                            fontSize: "1rem",
                            padding: "8px 12px",
                        }
                    }
                }}
            >
                <IconButton color="warning" onClick={onRevoke} disabled={studentDetails.is_revoked || !studentDetails.tx_hash}>
                    <BlockIcon />
                </IconButton>
            </Tooltip>
        </Stack>
    );
}
