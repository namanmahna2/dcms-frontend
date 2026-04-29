import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import useUserStore from "../../helpers/infoStore/useUserStore";

const useSocket = (url) => {
  const { user } = useUserStore(); // ✅ top level hook

  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);

  const isAdmin = user === "admin";

  useEffect(() => {
    if (!user || !url) return;

    console.log("Socket initialized for:", user);

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

    newSocket.on("new anomaly", (data) => {
      if (!isAdmin) {
        console.log(
          "Ignoring anomaly event — user is NOT admin."
        );
        return;
      }

      console.log("🚨 New anomaly received:", data);

      setMessages((prev) => [...prev, ...data]);
    });

    newSocket.on("disconnect", () => {
      console.log("Disconnected from server");
    });

    return () => {
      console.log("Socket cleanup");
      newSocket.disconnect();
    };
  }, [url, user, isAdmin]);

  return { socket, messages, isAdmin };
};

export default useSocket;