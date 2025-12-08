import { useQuery } from "@tanstack/react-query"

import Server from "../../server"

export const UseUserProfile = (options = {}) => {
    return useQuery({
        queryKey: ["profile"],
        queryFn: async () => {
            const res = await Server.userProfile()
            return Object.keys(res.data).length > 0 ? res.data : {}
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