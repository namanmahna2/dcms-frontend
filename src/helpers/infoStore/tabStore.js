import { create } from "zustand";

const DEFAULT_TAB = "dashboard";

const useTabStore = create((set) => {
    const savedTab = localStorage.getItem("tabName");

    return {
        tabName: savedTab || DEFAULT_TAB,

        setTabname: (value) => {
            if (!value) return; // Prevent saving undefined
            localStorage.setItem("tabName", value);
            set({ tabName: value });
        }
    };
});

export default useTabStore;
