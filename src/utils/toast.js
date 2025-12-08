import toast from "react-hot-toast";

const Toast = {
    success: (msg = "Success!") => toast.success(msg),
    error: (msg = "Something went wrong!") => toast.error(msg),
    info: (msg) => toast(msg, { icon: "ℹ️" }),
    promise: (promise, messages) =>
        toast.promise(promise, {
            loading: messages.loading || "Processing...",
            success: messages.success || "Done!",
            error: messages.error || "Failed!",
        }),
};

export default Toast;
