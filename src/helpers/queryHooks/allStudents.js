import { useQuery } from "@tanstack/react-query";

import Server from "../../server";

export const UseAllStudentsData = (params = {}, options = {}) => {
    return useQuery({
        queryKey: ["students", params],
        queryFn: async () => {
            const res = await Server.getAllStudents(params)
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