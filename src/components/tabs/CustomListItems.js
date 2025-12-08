import {
    capitalize,
    ListItemButton,
    ListItemIcon,
    ListItemText,
} from "@mui/material";

const CustomListItem = ({ icon, onClick, name, selected }) => {
    return (
        <ListItemButton
            onClick={onClick}
            selected={selected}
            sx={{
                textTransform: "capitalize",
                borderRadius: "12px",
                paddingX: 3,
                paddingY: 1.2,
                marginX: 1,
                backdropFilter: "blur(6px)",
                background: selected
                    ? "linear-gradient(145deg, #00c6ff, #021429ff)"
                    : "rgba(255, 255, 255, 0.05)",
                boxShadow: selected
                    ? "0 4px 10px rgba(0, 255, 255, 0.5)"
                    : "0 2px 4px rgba(0,0,0,0.1)",
                color: selected ? "#fff" : "#ccc",
                border: selected ? "1px solid #00e5ff" : "1px solid transparent",
                "&:hover": {
                    background: "rgba(0, 217, 255, 0.15)",
                    color: "#00e5ff",
                    boxShadow: "0 0 10px rgba(0, 229, 255, 0.4)",
                },
                transition: "all 0.3s ease-in-out",
            }}
        >
            {icon && (
                <ListItemIcon
                    sx={{
                        color: selected ? "#fff" : "#aaa",
                        minWidth: 32,
                    }}
                >
                    {icon}
                </ListItemIcon>
            )}
            <ListItemText
                primary={capitalize(name)}
                primaryTypographyProps={{
                    fontWeight: selected ? "bold" : "normal",
                    color: "inherit",
                }}
            />
        </ListItemButton>
    );
};

export default CustomListItem;
