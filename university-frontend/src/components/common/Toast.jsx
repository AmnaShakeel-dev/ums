const Toast = ({ message, type = "success", onClose }) => {
    const getStyles = () => {
        if (type === "success") {
            return {
                background: "#dcfce7",
                color: "#15803d",
                border: "0.5px solid #86efac",
                icon: "✓",
            };
        }
        if (type === "error") {
            return {
                background: "#fee2e2",
                color: "#991b1b",
                border: "0.5px solid #fca5a5",
                icon: "✕",
            };
        }
        return {
            background: "#dbeafe",
            color: "#1e40af",
            border: "0.5px solid #93c5fd",
            icon: "ℹ",
        };
    };

    const s = getStyles();

    return (
        <div style={{
            position: "fixed",
            top: "80px",
            right: "20px",
            background: s.background,
            color: s.color,
            border: s.border,
            padding: "12px 16px",
            borderRadius: "10px",
            fontSize: "13px",
            fontWeight: "500",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            gap: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            maxWidth: "320px",
        }}>
            <span>{s.icon}</span>
            <span style={{ flex: 1 }}>{message}</span>
            <button
                onClick={onClose}
                style={{
                    background: "transparent",
                    border: "none",
                    color: s.color,
                    cursor: "pointer",
                    fontSize: "14px",
                    padding: "0 4px",
                }}
            >
                ✕
            </button>
        </div>
    );
};

export default Toast;