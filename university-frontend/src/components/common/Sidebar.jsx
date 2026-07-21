import { NavLink, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

const adminLinks = [
    { path: "/admin/dashboard", label: "Dashboard", icon: "🏠" },
    { path: "/admin/users", label: "User Management", icon: "👥" },
    { path: "/admin/subjects", label: "Subjects", icon: "📚" },
    { path: "/admin/enrollments", label: "Enrollments", icon: "📋" },
    { path: "/admin/announcements", label: "Announcements", icon: "📢" },
];

const teacherLinks = [
    { path: "/teacher/dashboard", label: "Dashboard", icon: "🏠" },
    { path: "/teacher/attendance", label: "Mark Attendance", icon: "✅" },
    { path: "/teacher/lectures", label: "Lectures", icon: "📁" },
    { path: "/teacher/assignments", label: "Assignments", icon: "📝" },
    { path: "/teacher/grading", label: "Grading", icon: "⭐" },
    { path: "/teacher/announcements", label: "Announcements", icon: "📢" },
];

const studentLinks = [
    { path: "/student/dashboard", label: "Dashboard", icon: "🏠" },
    { path: "/student/profile", label: "My Profile", icon: "👤" },
    { path: "/student/subjects", label: "My Subjects", icon: "📚" },
    { path: "/student/assignments", label: "Assignments", icon: "📝" },
    { path: "/student/attendance", label: "My Attendance", icon: "📊" },
];

const Sidebar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const getLinks = () => {
        if (user?.role === "admin") return adminLinks;
        if (user?.role === "teacher") return teacherLinks;
        return studentLinks;
    };

    const getRoleColor = () => {
        if (user?.role === "admin") return "#a78bfa";
        if (user?.role === "teacher") return "#34d399";
        return "#60a5fa";
    };

    return (
        <div style={styles.sidebar}>

            {/* Logo */}
            <div style={styles.logoSection}>
                <div style={styles.logoIcon}>🎓</div>
                <div>
                    <div style={styles.logoText}>UniSystem</div>
                    <div style={styles.logoSubtext}>University Portal</div>
                </div>
            </div>

            {/* User Info */}
            <div style={styles.userSection}>
                <div style={styles.userAvatar}>
                    {user?.name?.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
                <div style={styles.userInfo}>
                    <div style={styles.userName}>{user?.name}</div>
                    <div style={{
                        ...styles.userRole,
                        color: getRoleColor(),
                    }}>
                        {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                    </div>
                </div>
            </div>


            {/* Navigation Links */}
            <nav style={styles.nav}>
                <div style={styles.navLabel}>MENU</div>
                {getLinks().map((link) => (
                    <NavLink
                        key={link.path}
                        to={link.path}
                        style={({ isActive }) => ({
                            ...styles.navLink,
                            background: isActive ? "rgba(59,130,246,0.15)" : "transparent",
                            color: isActive ? "#93c5fd" : "#94a3b8",
                            fontWeight: isActive ? "600" : "400",
                            borderLeft: isActive
                                ? "3px solid #3b83f64a"
                                : "3px solid transparent",
                        })}
                    >
                        <span style={styles.navIcon}>{link.icon}</span>
                        {link.label}
                    </NavLink>
                ))}
            </nav>

            {/* Logout Button */}
            <div style={styles.logoutSection}>
                <button onClick={handleLogout} style={styles.logoutBtn}>
                    <span>🚪</span>
                    Logout
                </button>
            </div>

        </div>
    );
};

const styles = {
    sidebar: {
        width: "240px",
        minHeight: "100vh",
        background: "#1e293b",
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
        display: "flex",
        flexDirection: "column",
        zIndex: 100,
    },
    logoSection: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "1.5rem 1.25rem",
        borderBottom: "0.5px solid rgba(255,255,255,0.1)",
    },
    logoIcon: {
        fontSize: "28px",
    },
    logoText: {
        fontSize: "16px",
        fontWeight: "600",
        color: "#f1f5f9",
    },
    logoSubtext: {
        fontSize: "11px",
        color: "#94a3b8",
    },
    userSection: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "1rem 1.25rem",
        borderBottom: "0.5px solid rgba(255,255,255,0.1)",
        marginBottom: "0.5rem",
    },
    userAvatar: {
        width: "36px",
        height: "36px",
        borderRadius: "50%",
        background: "#3b82f6",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "13px",
        fontWeight: "600",
        color: "#fff",
        flexShrink: 0,
    },
    userInfo: {
        flex: 1,
        overflow: "hidden",
    },
    userName: {
        fontSize: "13px",
        fontWeight: "500",
        color: "#f1f5f9",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
    },
    userRole: {
        fontSize: "11px",
        marginTop: "1px",
    },
    nav: {
        flex: 1,
        padding: "0.5rem 0.75rem",
        overflowY: "auto",
    },
    navLabel: {
        fontSize: "10px",
        fontWeight: "600",
        color: "#475569",
        padding: "0.5rem 0.5rem 0.25rem",
        letterSpacing: "1px",
    },
    navLink: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "0.6rem 0.75rem",
        borderRadius: "8px",
        fontSize: "13px",
        textDecoration: "none",
        marginBottom: "2px",
        transition: "all 0.2s ease",
    },
    navIcon: {
        fontSize: "15px",
        flexShrink: 0,
    },
    logoutSection: {
        padding: "1rem 0.75rem",
        borderTop: "0.5px solid rgba(255,255,255,0.1)",
    },
    logoutBtn: {
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "0.6rem 0.75rem",
        background: "rgba(239,68,68,0.1)",
        color: "#f87171",
        border: "0.5px solid rgba(239,68,68,0.2)",
        borderRadius: "8px",
        fontSize: "13px",
        cursor: "pointer",
        transition: "all 0.2s ease",
    },
};

export default Sidebar;