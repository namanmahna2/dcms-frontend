import { useMutation, useQueryClient } from "@tanstack/react-query";

const useLiveAnomalyLog = (onHighlight, filterValue) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (newLog) => newLog,

        onMutate: async (newLog) => {
            await queryClient.cancelQueries(["logs", filterValue]);

            const prevLogs = queryClient.getQueryData(["logs", filterValue]) || [];

            const updated = [newLog, ...prevLogs.filter((l) => l.id !== newLog.id)];

            queryClient.setQueryData(["logs", filterValue], updated);

            return { prevLogs };
        },

        onError: (err, newLog, context) => {
            queryClient.setQueryData(["logs", filterValue], context.prevLogs);
        },

        onSuccess: (fullLog) => {
            onHighlight?.(fullLog.id);
        }
    });
};

export default useLiveAnomalyLog;
