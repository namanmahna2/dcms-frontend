import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import Server from "../../server";  // <-- assuming this contains isAdmin()

const useSocket = (url) => {
    const [socket, setSocket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);

    // 🔹 Check admin status on mount
    useEffect(() => {
        const checkAdmin = async () => {
            try {
                const res = await Server.isAdmin(); 
                setIsAdmin(res?.data?.isAdmin === true);
            } catch (err) {
                console.error("Failed to verify admin:", err);
                setIsAdmin(false);
            }
        };

        checkAdmin();
    }, []);

    useEffect(() => {
        const newSocket = io(url, {
            transports: ["websocket"],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        setSocket(newSocket);

        newSocket.on("connect", () => {
            console.log("Connected to server:", newSocket.id);
        });

        // 🔥 Only append messages if user is admin
        newSocket.on("new anomaly", async (data) => {
            if (!isAdmin) {
                console.log("Ignoring anomaly event — user is NOT admin.");
                return;
            }

            console.log("🚨 New anomaly received:", data);
            setMessages((prev) => [...prev, ...data]);
        });

        newSocket.on("disconnect", () => {
            console.log("Disconnected from server");
        });

        return () => {
            newSocket.disconnect();
        };
    }, [url, isAdmin]); // depends on admin state

    return { socket, messages, isAdmin };
};

export default useSocket;
