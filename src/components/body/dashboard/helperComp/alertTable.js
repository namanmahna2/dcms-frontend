import { DataGrid } from "@mui/x-data-grid";
import Server from "../../../../server";
import { useEffect, useState } from "react";

const columns = [
    { field: "id", headerName: "ID", width: 90 },
    { field: "name", headerName: "Student Name", width: 180 },
    { field: "wallet", headerName: "Wallet Address", width: 340 },
    { field: "revoke_reason", headerName: "Revoke Reason", width: 240 },
    { field: "timestamp", headerName: "Time", width: 200 },
];

export default function AlertsTable() {
    const [rows, setRows] = useState([])
    const fetchData = async () => {
        const apiResposne = await Server.dashboardRevokeStudents()
        console.log("apiResposne", apiResposne)


        let list = Array.isArray(apiResposne.data) ? apiResposne.data : [];

        list = list.map((row, index) => ({
            ...row,
            name: row.name
                ? row.name.charAt(0).toUpperCase() + row.name.slice(1)
                : row.name,
            id: `CU-${index + 1}`
        }));

        setRows(list);
    }

    useEffect(() => {
        fetchData()
    }, [])
    return (
        <div style={{ height: 350, width: "100%" }}>
            <DataGrid
                rows={rows}
                columns={columns}
                disableRowSelectionOnClick
                pageSize={3}
                sx={{
                    bgcolor: "#0e1b29",
                    color: "white",
                    borderColor: "#1f2b38",
                    borderRadius: 2,
                    "& .MuiDataGrid-columnHeaders": {
                        backgroundColor: "#102a43",
                        color: "#fff",
                        fontWeight: "bold",
                        fontSize: "14px",
                    },
                    "& .MuiDataGrid-cell": {
                        color: "#e6e6e6",
                        fontSize: "13px",
                    },
                    "& .MuiDataGrid-footerContainer": {
                        backgroundColor: "#102a43",
                        color: "#fff",
                    },
                }}
            />

        </div>
    );
}
