import { useQueryClient } from "@tanstack/react-query";

const useLiveLogInsert = () => {
    const queryClient = useQueryClient();

    const insert = (newLog) => {
        queryClient.setQueryData(["logs"], (old = []) => {
            // prevent duplicates
            const exists = old.some((l) => l.id === newLog.id);
            if (exists) return old;

            // prepend newest logs
            return [{ ...newLog }, ...old];
        });
    };

    return insert;
};

export default useLiveLogInsert;
