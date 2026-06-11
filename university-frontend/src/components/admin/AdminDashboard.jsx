import { useState, useEffect } from "react";
import adminService from "../../services/adminService";
import LoadingSpinner from "../common/LoadingSpinner";
import { formatDate, getRoleBadgeClass } from "../../utils/helpers";

const AdminDashboard = () => {
    const [analytics, setAnalytics] = useState(null);
    const [recentUsers, setRecentUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [analyticsRes, usersRes] = await Promise.all([
                adminService.getAnalytics(),
                adminService.getAllUsers(),
            ]);
            setAnalytics(analyticsRes.analytics);
            setRecentUsers(usersRes.users.slice(0, 5));
        } catch (error) {
            console.error("Dashboard error:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div>

            {/* Page Header */}
            <div style={styles.pageHeader}>
                <h1 style={styles.pageTitle}>Admin Dashboard</h1>
                <p style={styles.pageSubtitle}>System overview and statistics</p>
            </div>

            {/* Stat Cards */}
            <div style={styles.statsGrid}>
                {[
                    {
                        label: "Total Students",
                        value: analytics?.totalStudents || 0,
                        icon: "👨‍🎓",
                        color: "#eff6ff",
                        iconColor: "#2563eb",
                    },
                    {
                        label: "Total Teachers",
                        value: analytics?.totalTeachers || 0,
                        icon: "👨‍🏫",
                        color: "#ecfdf5",
                        iconColor: "#16a34a",
                    },
                    {
                        label: "Total Subjects",
                        value: analytics?.totalSubjects || 0,
                        icon: "📚",
                        color: "#fffbeb",
                        iconColor: "#d97706",
                    },
                    {
                        label: "Total Enrollments",
                        value: analytics?.totalEnrollments || 0,
                        icon: "📋",
                        color: "#f5f3ff",
                        iconColor: "#7c3aed",
                    },
                ].map((stat) => (
                    <div key={stat.label} style={styles.statCard}>
                        <div style={{
                            ...styles.statIcon,
                            background: stat.color,
                            color: stat.iconColor,
                        }}>
                            {stat.icon}
                        </div>
                        <div>
                            <p style={styles.statLabel}>{stat.label}</p>
                            <h3 style={styles.statValue}>{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Users Table */}
            <div style={styles.card}>
                <div style={styles.cardHeader}>
                    <h2 style={styles.cardTitle}>Recent Users</h2>
                </div>
                <table style={styles.table}>
                    <thead>
                        <tr style={styles.tableHead}>
                            <th style={styles.th}>Name</th>
                            <th style={styles.th}>Email</th>
                            <th style={styles.th}>Role</th>
                            <th style={styles.th}>Department</th>
                            <th style={styles.th}>Joined</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recentUsers.map((user) => (
                            <tr key={user._id} style={styles.tableRow}>
                                <td style={styles.td}>
                                    <div style={styles.userCell}>
                                        <div style={styles.avatar}>
                                            {user.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                                        </div>
                                        <span style={styles.userName}>{user.name}</span>
                                    </div>
                                </td>
                                <td style={styles.td}>{user.email}</td>
                                <td style={styles.td}>
                                    <span style={{
                                        ...styles.badge,
                                        ...(user.role === "admin"
                                            ? styles.badgeAdmin
                                            : user.role === "teacher"
                                                ? styles.badgeTeacher
                                                : styles.badgeStudent),
                                    }}>
                                        {user.role}
                                    </span>
                                </td>
                                <td style={styles.td}>{user.department || "—"}</td>
                                <td style={styles.td}>{formatDate(user.createdAt)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

        </div>
    );
};

const styles = {
    pageHeader: {
        marginBottom: "1.5rem",
    },
    pageTitle: {
        fontSize: "22px",
        fontWeight: "600",
        color: "#1e293b",
        margin: 0,
    },
    pageSubtitle: {
        fontSize: "13px",
        color: "#64748b",
        marginTop: "4px",
    },
    statsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "16px",
        marginBottom: "1.5rem",
    },
    statCard: {
        background: "#ffffff",
        borderRadius: "12px",
        padding: "1.25rem",
        border: "0.5px solid #e2e8f0",
        display: "flex",
        alignItems: "center",
        gap: "16px",
    },
    statIcon: {
        width: "48px",
        height: "48px",
        borderRadius: "10px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "22px",
        flexShrink: 0,
    },
    statLabel: {
        fontSize: "12px",
        color: "#64748b",
        margin: 0,
        marginBottom: "2px",
    },
    statValue: {
        fontSize: "24px",
        fontWeight: "600",
        color: "#1e293b",
        margin: 0,
    },
    card: {
        background: "#ffffff",
        borderRadius: "12px",
        border: "0.5px solid #e2e8f0",
        overflow: "hidden",
    },
    cardHeader: {
        padding: "1rem 1.25rem",
        borderBottom: "0.5px solid #e2e8f0",
    },
    cardTitle: {
        fontSize: "15px",
        fontWeight: "600",
        color: "#1e293b",
        margin: 0,
    },
    table: {
        width: "100%",
        borderCollapse: "collapse",
    },
    tableHead: {
        background: "#f8fafc",
    },
    th: {
        padding: "10px 16px",
        textAlign: "left",
        fontSize: "11px",
        fontWeight: "600",
        color: "#64748b",
        textTransform: "uppercase",
        letterSpacing: "0.5px",
        borderBottom: "0.5px solid #e2e8f0",
    },
    tableRow: {
        borderBottom: "0.5px solid #f1f5f9",
    },
    td: {
        padding: "12px 16px",
        fontSize: "13px",
        color: "#374151",
    },
    userCell: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
    },
    avatar: {
        width: "32px",
        height: "32px",
        borderRadius: "50%",
        background: "#dbeafe",
        color: "#1e40af",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "11px",
        fontWeight: "600",
        flexShrink: 0,
    },
    userName: {
        fontWeight: "500",
        color: "#1e293b",
    },
    badge: {
        padding: "3px 10px",
        borderRadius: "99px",
        fontSize: "11px",
        fontWeight: "500",
    },
    badgeAdmin: {
        background: "#ede9fe",
        color: "#5b21b6",
    },
    badgeTeacher: {
        background: "#dcfce7",
        color: "#15803d",
    },
    badgeStudent: {
        background: "#dbeafe",
        color: "#1e40af",
    },
};

export default AdminDashboard;