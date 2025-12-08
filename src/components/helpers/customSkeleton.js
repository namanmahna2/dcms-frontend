import { Box, Divider, Skeleton } from "@mui/material"

const CustomSkeleton = () => {
    return (
        <Box
            sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                height: "100%",
                p: 2,
                gap: 2,
                mt: 2,
                backgroundColor: "#fff"
            }}
        >
            <Box>
                <Skeleton variant="text" width={200} height={32} />
                <Skeleton variant="text" width={300} height={20} />
            </Box>
            <Divider />
            <Box sx={{ mt: 2 }}>
                {[...Array(5)].map((_, i) => (
                    <Box key={i} sx={{ mb: 1 }}>
                        <Skeleton variant="text" width="40%" height={20} />
                        <Skeleton variant="text" width="70%" height={20} />
                    </Box>
                ))}
            </Box>
        </Box>
    )
}

export default CustomSkeleton