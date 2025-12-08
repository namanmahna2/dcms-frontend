import { Box } from "@mui/material";
import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import Server from "../../../../../server";

const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || payload.length === 0) return null;

    const item = payload[0].payload;

    return (
        <Box
            sx={{
                p: 1.5,
                borderRadius: "8px",
                background: "#0e1b29",
                border: "1px solid rgba(255,255,255,0.2)",
                color: "white",
                fontSize: "0.9rem",
            }}
        >
            <div><strong>{item.name}</strong></div>
            <div>Total Events: {item.value}</div>
            <div>Last Updated: 2025-01-01</div>
            <div>Risk Level: High</div>
        </Box>
    );
};

export default function RiskPieChart() {
    const [data, setData] = useState([]);

    const fetchData = async () => {
        let apiResposne = await Server.getDashboardRisk();

        const __d = Array.isArray(apiResposne.data)
            ? apiResposne.data
            : [];

        setData(__d.map(d => ({ ...d, value: Number(d.value) })));
    };

    useEffect(() => {
        fetchData();
    }, []);

    const COLORS = ["#00C49F", "#FFBB28", "#FF4444"];

    return (
        <Box sx={{ width: "100%", height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        outerRadius="80%"
                        innerRadius="50%"
                        paddingAngle={4}
                        dataKey="value"
                        label={({ name }) => name}
                    >
                        {data.map((entry, idx) => (
                            <Cell key={idx} fill={COLORS[idx]} />
                        ))}
                    </Pie>

                    <Tooltip content={CustomTooltip} />
                    <Legend wrapperStyle={{ color: "white" }} />
                </PieChart>
            </ResponsiveContainer>
        </Box>
    );
}
