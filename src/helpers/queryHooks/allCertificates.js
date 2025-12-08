import { useQuery } from "@tanstack/react-query";

import Server from "../../server";

export const UseAllCertificate = (options = {}) => {
    return useQuery({
        queryKey: ["certificates"],
        queryFn: async () => {
            const res = await Server.getAllCertData()
            return Array.isArray(res.data) ? res.data : []
        },
        enabled: false,
        staleTime: Infinity,
        cacheTime: Infinity,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchOnMount: false,
        ...options
    })
}