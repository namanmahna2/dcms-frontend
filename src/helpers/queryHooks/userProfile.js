import { useQuery } from "@tanstack/react-query"
import Server from "../../server"

export const UseUserProfile = (options = {}) => {
    return useQuery({
        queryKey: ["profile"],
        queryFn: async () => {
            console.log("PROFILE QUERY RUNNING");
            const res = await Server.userProfile();
            return res?.data || {};
        },
        enabled: options.enabled ?? true,
        staleTime: 5 * 60 * 1000,
        retry: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchOnMount: false
    })
}