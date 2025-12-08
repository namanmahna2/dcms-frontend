import { useQuery } from "@tanstack/react-query"

import Server from "../../server"

export const UseDepAndCourses = (options = {}) => {
    return useQuery({
        queryKey: ["dc"],
        queryFn: async () => {
            const res = await Server.getAllDepAndCourses()

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