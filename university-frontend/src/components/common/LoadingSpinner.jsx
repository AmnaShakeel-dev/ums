const LoadingSpinner = ({ message = "Loading..." }) => {
    return (
        <div style={styles.container}>
            <div style={styles.spinner} />
            <p style={styles.message}>{message}</p>
        </div>
    );
};

const styles = {
    container: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "200px",
        gap: "12px",
    },
    spinner: {
        width: "36px",
        height: "36px",
        border: "3px solid #e2e8f0",
        borderTop: "3px solid #3b82f6",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
    },
    message: {
        fontSize: "13px",
        color: "#64748b",
    },
};

export default LoadingSpinner;