import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import Server from "../../../../../server";
import { useEffect, useState } from "react";

export default function DegreeTrendChart() {
    const [data, setData] = useState([])
    const fetchData = async () => {
        let apiResposne = await Server.getDegreeTrend()
        console.log("apiResponse", apiResposne)
        const __d = Array.isArray(apiResposne.data)
            ? apiResposne.data
            : []

        setData(__d)
    }

    useEffect(() => {
        fetchData()
    }, [])
    
    return (
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a3a4b" />
                <XAxis dataKey="month" stroke="#bbb" />
                <YAxis stroke="#bbb" />
                <Tooltip />
                <Line type="monotone" dataKey="degrees" stroke="#00bcd4" strokeWidth={3} />
            </LineChart>
        </ResponsiveContainer>
    );
}
