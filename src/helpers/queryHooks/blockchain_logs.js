import { useQuery } from "@tanstack/react-query";
import Server from "../../server";
import { toast } from "react-toastify";

export const useLogs = (id) => {
    return useQuery({
        queryKey: ["logs", id],
        queryFn: async () => {
            try {
                const apiResponse = await Server.getLogs(id);
                
                const data = Array.isArray(apiResponse.data) ? apiResponse.data : [];
                const finalData = data.map((item, index) => ({ id: item.id || index, ...item }));
                return { data: finalData, columns: apiResponse.columns };
            } catch (error) {
                console.error("Error fetching logs:", error);
                toast.error(error?.message || "Something went wrong");
                return [];
            }
        },
        refetchOnWindowFocus: false,
    });
};
