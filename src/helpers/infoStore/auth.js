import { create } from "zustand";
import Cookies from "js-cookie";

const useAuthStore = create((set) => ({
    token: Cookies.get("x-access-token") || null,
    isAuthenticated: !!Cookies.get("x-access-token"),
    setAuthenticated: (value) => set({ isAuthenticated: value }),
    setToken: (token)=> set({
        token,
        isAuthenticated: !!token
    })
}));

export default useAuthStore;
