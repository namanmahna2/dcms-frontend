import { create } from "zustand";

const useAnomalyFilterStore = create((set) => ({
    filterValue: null,
    setFilterValue: (value) => set({ filterValue: value }),
}));

export default useAnomalyFilterStore;
