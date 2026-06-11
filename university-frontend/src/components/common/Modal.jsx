const Modal = ({ isOpen, onClose, title, children, size = "md" }) => {
    if (!isOpen) return null;

    const getWidth = () => {
        if (size === "sm") return "380px";
        if (size === "lg") return "600px";
        if (size === "xl") return "800px";
        return "480px";
    };

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div
                style={{ ...styles.modal, width: getWidth() }}
                onClick={(e) => e.stopPropagation()}
            >

                {/* Modal Header */}
                <div style={styles.header}>
                    <h3 style={styles.title}>{title}</h3>
                    <button onClick={onClose} style={styles.closeBtn}>
                        ✕
                    </button>
                </div>

                {/* Modal Body */}
                <div style={styles.body}>
                    {children}
                </div>

            </div>
        </div>
    );
};

export default Modal;

const styles = {
    overlay: {
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "1rem",
    },
    modal: {
        background: "#ffffff",
        borderRadius: "16px",
        boxShadow: "0 25px 50px rgba(0,0,0,0.25)",
        maxHeight: "90vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
    },
    header: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "1.25rem 1.5rem",
        borderBottom: "0.5px solid #e2e8f0",
    },
    title: {
        fontSize: "16px",
        fontWeight: "600",
        color: "#1e293b",
        margin: 0,
    },
    closeBtn: {
        background: "transparent",
        border: "none",
        fontSize: "16px",
        color: "#64748b",
        cursor: "pointer",
        padding: "4px 8px",
        borderRadius: "6px",
        lineHeight: 1,
    },
    body: {
        padding: "1.5rem",
        overflowY: "auto",
    },
};