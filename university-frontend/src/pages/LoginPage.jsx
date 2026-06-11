import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import authService from "../services/authService";
import "../styles/global.css";

const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        if (!email || !password) {
            setError("Please enter email and password.");
            return;
        }

        setLoading(true);

        try {
            const data = await authService.login(email, password);
            login(data.user, data.token);

            // Role ke hisaab se redirect karo
            if (data.user.role === "admin") {
                navigate("/admin/dashboard");
            } else if (data.user.role === "teacher") {
                navigate("/teacher/dashboard");
            } else {
                navigate("/student/dashboard");
            }

        } catch (err) {
            setError(
                err.response?.data?.message || "Login failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>

                {/* Logo */}
                <div style={styles.logoSection}>
                    <div style={styles.logoIcon}>🎓</div>
                    <h1 style={styles.title}>University Portal</h1>
                    <p style={styles.subtitle}>Sign in to your account</p>
                </div>

                {/* Form */}
                <form onSubmit={handleLogin}>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your@email.edu"
                            style={styles.input}
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            style={styles.input}
                        />
                    </div>

                    {error && (
                        <div style={styles.errorBox}>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            ...styles.loginBtn,
                            background: loading ? "#94a3b8" : "#2563eb",
                            cursor: loading ? "not-allowed" : "pointer",
                        }}
                    >
                        {loading ? "Signing in..." : "Sign In"}
                    </button>

                </form>

                {/* Demo credentials */}
                <div style={styles.demoBox}>
                    <p style={styles.demoTitle}>Demo Credentials:</p>
                    {[
                        { role: "Admin", email: "admin@uni.edu", pass: "admin123" },
                        { role: "Teacher", email: "sara@uni.edu", pass: "teacher123" },
                        { role: "Student", email: "ali@uni.edu", pass: "student123" },
                    ].map((c) => (
                        <div
                            key={c.role}
                            onClick={() => {
                                setEmail(c.email);
                                setPassword(c.pass);
                            }}
                            style={styles.demoItem}
                        >
                            <strong>{c.role}:</strong> {c.email} / {c.pass}
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
};

const styles = {
    container: {
        minHeight: "100vh",
        background: "linear-gradient(135deg, #1e293b 0%, #334155 50%, #1e293b 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
    },
    card: {
        background: "#ffffff",
        borderRadius: "16px",
        padding: "2rem",
        width: "100%",
        maxWidth: "420px",
        boxShadow: "0 25px 50px rgba(0,0,0,0.25)",
    },
    logoSection: {
        textAlign: "center",
        marginBottom: "2rem",
    },
    logoIcon: {
        fontSize: "48px",
        marginBottom: "8px",
    },
    title: {
        fontSize: "22px",
        fontWeight: "600",
        color: "#1e293b",
        margin: "0",
    },
    subtitle: {
        fontSize: "13px",
        color: "#64748b",
        marginTop: "4px",
    },
    formGroup: {
        marginBottom: "1rem",
    },
    label: {
        display: "block",
        fontSize: "12px",
        fontWeight: "600",
        color: "#475569",
        marginBottom: "6px",
        textTransform: "uppercase",
        letterSpacing: "0.5px",
    },
    input: {
        width: "100%",
        padding: "10px 12px",
        border: "1px solid #e2e8f0",
        borderRadius: "8px",
        fontSize: "14px",
        outline: "none",
        boxSizing: "border-box",
        color: "#1e293b",
    },
    errorBox: {
        background: "#fee2e2",
        color: "#991b1b",
        padding: "10px 12px",
        borderRadius: "8px",
        fontSize: "13px",
        marginBottom: "1rem",
        border: "1px solid #fca5a5",
    },
    loginBtn: {
        width: "100%",
        padding: "11px",
        color: "#ffffff",
        border: "none",
        borderRadius: "8px",
        fontSize: "14px",
        fontWeight: "600",
        transition: "all 0.2s ease",
    },
    demoBox: {
        marginTop: "1.5rem",
        padding: "1rem",
        background: "#f8fafc",
        borderRadius: "8px",
        border: "1px solid #e2e8f0",
    },
    demoTitle: {
        fontSize: "11px",
        fontWeight: "600",
        color: "#64748b",
        marginBottom: "8px",
        textTransform: "uppercase",
    },
    demoItem: {
        fontSize: "12px",
        color: "#2563eb",
        cursor: "pointer",
        padding: "3px 0",
        marginBottom: "2px",
    },
};

export default LoginPage;