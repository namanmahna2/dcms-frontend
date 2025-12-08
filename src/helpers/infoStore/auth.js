import { create } from "zustand";
import Cookies from "js-cookie";

const useAuthStore = create((set) => ({
    isAuthenticated: !!Cookies.get("x-access-token"),
    setAuthenticated: (value) => set({ isAuthenticated: value }),
}));

export default useAuthStore;
