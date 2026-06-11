import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import api from "../../services/api";

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await api.get("/announcements");
            const announcements = res.data.announcements || [];
            setNotifications(announcements.slice(0, 5));
            const unread = announcements.filter(
                (a) => !a.readBy?.some((r) => r.userId === user?.id)
            ).length;
            setUnreadCount(unread);
        } catch (error) {
            console.error("Notifications error:", error);
        }
    };

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const getPageTitle = () => {
        const path = window.location.pathname;
        const titles = {
            "/admin/dashboard": "Dashboard",
            "/admin/users": "User Management",
            "/admin/subjects": "Subject Management",
            "/admin/enrollments": "Enrollment Management",
            "/admin/announcements": "Announcements",
            "/teacher/dashboard": "Dashboard",
            "/teacher/attendance": "Mark Attendance",
            "/teacher/lectures": "Lectures",
            "/teacher/assignments": "Assignments",
            "/teacher/grading": "Grading Panel",
            "/teacher/announcements": "Announcements",
            "/student/dashboard": "Dashboard",
            "/student/profile": "My Profile",
            "/student/subjects": "My Subjects",
            "/student/assignments": "Assignments",
            "/student/attendance": "My Attendance",
        };
        return titles[path] || "University Portal";
    };

    const getRoleBadgeStyle = () => {
        if (user?.role === "admin") return { background: "#ede9fe", color: "#5b21b6" };
        if (user?.role === "teacher") return { background: "#dcfce7", color: "#15803d" };
        return { background: "#dbeafe", color: "#1e40af" };
    };

    const getPriorityColor = (priority) => {
        if (priority === "high") return "#dc2626";
        if (priority === "medium") return "#d97706";
        return "#16a34a";
    };

    return (
        <div style={styles.navbar}>

            {/* Left */}
            <div style={styles.left}>
                <h2 style={styles.pageTitle}>{getPageTitle()}</h2>
            </div>

            {/* Right */}
            <div style={styles.right}>

                <div style={styles.department}>
                    {user?.department || "University"}
                </div>

                <span style={{ ...styles.roleBadge, ...getRoleBadgeStyle() }}>
                    {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                </span>

                {/* Notification Bell */}
                <div style={styles.bellWrapper}>
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        style={styles.bellBtn}
                    >
                        🔔
                        {unreadCount > 0 && (
                            <span style={styles.badge}>{unreadCount}</span>
                        )}
                    </button>

                    {showNotifications && (
                        <div style={styles.dropdown}>
                            <div style={styles.dropdownHeader}>
                                <span style={styles.dropdownTitle}>Notifications</span>
                                <button
                                    onClick={() => setShowNotifications(false)}
                                    style={styles.closeBtn}
                                >
                                    ✕
                                </button>
                            </div>
                            {notifications.length === 0 ? (
                                <div style={styles.noNotif}>No notifications</div>
                            ) : (
                                notifications.map((n) => (
                                    <div key={n._id} style={styles.notifItem}>
                                        <div style={styles.notifTop}>
                                            <span style={styles.notifTitle}>{n.title}</span>
                                            <span
                                                style={{
                                                    ...styles.priorityDot,
                                                    background: getPriorityColor(n.priority),
                                                }}
                                            />
                                        </div>
                                        <div style={styles.notifContent}>
                                            {n.content.slice(0, 60)}
                                            {n.content.length > 60 ? "..." : ""}
                                        </div>
                                        <div style={styles.notifBy}>
                                            By {n.createdBy?.name}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>

                {/* User Info */}
                <div style={styles.userSection}>
                    <div style={styles.userInfo}>
                        <div style={styles.userName}>{user?.name}</div>
                        <div style={styles.userEmail}>{user?.email}</div>
                    </div>
                    <div style={styles.avatar}>
                        {user?.name?.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </div>
                </div>

                <button onClick={handleLogout} style={styles.logoutBtn}>
                    Logout
                </button>

            </div>
        </div>
    );
};

const styles = {
    navbar: { height: "60px", background: "#ffffff", borderBottom: "0.5px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 1.5rem", position: "fixed", top: 0, left: "240px", right: 0, zIndex: 99, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" },
    left: { display: "flex", alignItems: "center", gap: "12px" },
    pageTitle: { fontSize: "16px", fontWeight: "600", color: "#1e293b", margin: 0 },
    right: { display: "flex", alignItems: "center", gap: "12px" },
    department: { fontSize: "12px", color: "#64748b" },
    roleBadge: { padding: "3px 10px", borderRadius: "99px", fontSize: "11px", fontWeight: "600" },
    bellWrapper: { position: "relative" },
    bellBtn: { background: "#f1f5f9", border: "0.5px solid #e2e8f0", borderRadius: "8px", padding: "6px 10px", cursor: "pointer", fontSize: "16px", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" },
    badge: { position: "absolute", top: "-4px", right: "-4px", background: "#dc2626", color: "#fff", borderRadius: "99px", fontSize: "9px", fontWeight: "700", padding: "1px 5px", minWidth: "16px", textAlign: "center" },
    dropdown: { position: "absolute", top: "44px", right: 0, width: "300px", background: "#fff", borderRadius: "12px", border: "0.5px solid #e2e8f0", boxShadow: "0 8px 24px rgba(0,0,0,0.12)", zIndex: 999 },
    dropdownHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: "0.5px solid #e2e8f0" },
    dropdownTitle: { fontSize: "14px", fontWeight: "600", color: "#1e293b" },
    closeBtn: { background: "transparent", border: "none", cursor: "pointer", fontSize: "12px", color: "#64748b" },
    noNotif: { padding: "1.5rem", textAlign: "center", fontSize: "13px", color: "#94a3b8" },
    notifItem: { padding: "10px 16px", borderBottom: "0.5px solid #f1f5f9", cursor: "pointer" },
    notifTop: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "3px" },
    notifTitle: { fontSize: "13px", fontWeight: "500", color: "#1e293b" },
    priorityDot: { width: "8px", height: "8px", borderRadius: "50%", flexShrink: 0 },
    notifContent: { fontSize: "12px", color: "#64748b", marginBottom: "3px", lineHeight: "1.4" },
    notifBy: { fontSize: "11px", color: "#94a3b8" },
    userSection: { display: "flex", alignItems: "center", gap: "8px" },
    userInfo: { textAlign: "right" },
    userName: { fontSize: "13px", fontWeight: "600", color: "#1e293b" },
    userEmail: { fontSize: "11px", color: "#64748b" },
    avatar: { width: "34px", height: "34px", borderRadius: "50%", background: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "600", color: "#fff", flexShrink: 0 },
    logoutBtn: { padding: "6px 12px", background: "transparent", border: "0.5px solid #e2e8f0", borderRadius: "8px", fontSize: "12px", color: "#64748b", cursor: "pointer" },
};

export default Navbar;