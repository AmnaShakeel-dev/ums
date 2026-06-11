import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import teacherService from "../../services/teacherService";
import LoadingSpinner from "../common/LoadingSpinner";
import useAuth from "../../hooks/useAuth";
import { formatDate } from "../../utils/helpers";

const TeacherDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [subjects, setSubjects] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [subjectsRes, assignmentsRes] = await Promise.all([
                teacherService.getMySubjects(),
                teacherService.getMyAssignments(),
            ]);
            setSubjects(subjectsRes.subjects);
            setAssignments(assignmentsRes.assignments);
        } catch (error) {
            console.error("Dashboard error:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LoadingSpinner />;

    const pendingGrading = assignments.filter(
        (a) => a.status === "submitted"
    ).length;

    return (
        <div>

            {/* Welcome Header */}
            <div style={styles.welcomeCard}>
                <div>
                    <h1 style={styles.welcomeTitle}>
                        Welcome back, {user?.name}! 👋
                    </h1>
                    <p style={styles.welcomeSubtitle}>
                        {user?.department} — Here is your teaching overview
                    </p>
                </div>
                <div style={styles.dateBox}>
                    {new Date().toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                    })}
                </div>
            </div>

            {/* Stat Cards */}
            <div style={styles.statsGrid}>
                {[
                    {
                        label: "My Subjects",
                        value: subjects.length,
                        icon: "📚",
                        color: "#eff6ff",
                        iconColor: "#2563eb",
                    },
                    {
                        label: "Total Assignments",
                        value: assignments.length,
                        icon: "📝",
                        color: "#ecfdf5",
                        iconColor: "#16a34a",
                    },
                    {
                        label: "Pending Grading",
                        value: pendingGrading,
                        icon: "⭐",
                        color: "#fffbeb",
                        iconColor: "#d97706",
                    },
                    {
                        label: "Total Lectures",
                        value: 0,
                        icon: "📁",
                        color: "#f5f3ff",
                        iconColor: "#7c3aed",
                    },
                ].map((stat) => (
                    <div key={stat.label} style={styles.statCard}>
                        <div
                            style={{
                                ...styles.statIcon,
                                background: stat.color,
                                color: stat.iconColor,
                            }}
                        >
                            {stat.icon}
                        </div>
                        <div>
                            <p style={styles.statLabel}>{stat.label}</p>
                            <h3 style={styles.statValue}>{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Two Column Layout */}
            <div style={styles.twoCol}>

                {/* My Subjects */}
                <div style={styles.card}>
                    <div style={styles.cardHeader}>
                        <h2 style={styles.cardTitle}>My Subjects</h2>
                        <button
                            onClick={() => navigate("/teacher/attendance")}
                            style={styles.linkBtn}
                        >
                            Mark Attendance →
                        </button>
                    </div>
                    {subjects.length === 0 ? (
                        <p style={styles.emptyText}>
                            No subjects assigned yet.
                        </p>
                    ) : (
                        subjects.map((s) => (
                            <div key={s._id} style={styles.subjectRow}>
                                <div style={styles.subjectCode}>
                                    {s.subjectCode}
                                </div>
                                <div>
                                    <div style={styles.subjectName}>
                                        {s.subjectName}
                                    </div>
                                    <div style={styles.subjectMeta}>
                                        {s.credits} Credits
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Recent Assignments */}
                <div style={styles.card}>
                    <div style={styles.cardHeader}>
                        <h2 style={styles.cardTitle}>Recent Assignments</h2>
                        <button
                            onClick={() => navigate("/teacher/assignments")}
                            style={styles.linkBtn}
                        >
                            View All →
                        </button>
                    </div>
                    {assignments.length === 0 ? (
                        <p style={styles.emptyText}>
                            No assignments created yet.
                        </p>
                    ) : (
                        assignments.slice(0, 4).map((a) => (
                            <div key={a._id} style={styles.assignmentRow}>
                                <div style={styles.assignmentLeft}>
                                    <div style={styles.assignmentTitle}>
                                        {a.title}
                                    </div>
                                    <div style={styles.assignmentMeta}>
                                        {a.subject?.subjectCode} · Due:{" "}
                                        {formatDate(a.dueDate)}
                                    </div>
                                </div>
                                <span
                                    style={{
                                        ...styles.badge,
                                        background:
                                            new Date() > new Date(a.dueDate)
                                                ? "#fee2e2"
                                                : "#dcfce7",
                                        color:
                                            new Date() > new Date(a.dueDate)
                                                ? "#991b1b"
                                                : "#15803d",
                                    }}
                                >
                                    {new Date() > new Date(a.dueDate)
                                        ? "Expired"
                                        : "Active"}
                                </span>
                            </div>
                        ))
                    )}
                </div>

            </div>

            {/* Quick Actions */}
            <div style={styles.card}>
                <h2 style={styles.cardTitle}>Quick Actions</h2>
                <div style={styles.actionsGrid}>
                    {[
                        {
                            label: "Mark Attendance",
                            icon: "✅",
                            path: "/teacher/attendance",
                            color: "#ecfdf5",
                            textColor: "#15803d",
                        },
                        {
                            label: "Upload Lecture",
                            icon: "📁",
                            path: "/teacher/lectures",
                            color: "#eff6ff",
                            textColor: "#1e40af",
                        },
                        {
                            label: "Create Assignment",
                            icon: "📝",
                            path: "/teacher/assignments",
                            color: "#fffbeb",
                            textColor: "#92400e",
                        },
                        {
                            label: "Grade Submissions",
                            icon: "⭐",
                            path: "/teacher/grading",
                            color: "#f5f3ff",
                            textColor: "#5b21b6",
                        },
                    ].map((action) => (
                        <button
                            key={action.label}
                            onClick={() => navigate(action.path)}
                            style={{
                                ...styles.actionBtn,
                                background: action.color,
                                color: action.textColor,
                            }}
                        >
                            <span style={styles.actionIcon}>{action.icon}</span>
                            <span style={styles.actionLabel}>{action.label}</span>
                        </button>
                    ))}
                </div>
            </div>

        </div>
    );
};

const styles = {
    welcomeCard: {
        background: "#1e293b",
        borderRadius: "12px",
        padding: "1.5rem",
        marginBottom: "1.5rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "12px",
    },
    welcomeTitle: {
        fontSize: "20px",
        fontWeight: "600",
        color: "#f1f5f9",
        margin: 0,
    },
    welcomeSubtitle: {
        fontSize: "13px",
        color: "#94a3b8",
        marginTop: "4px",
    },
    dateBox: {
        fontSize: "12px",
        color: "#94a3b8",
        background: "rgba(255,255,255,0.05)",
        padding: "8px 14px",
        borderRadius: "8px",
        border: "0.5px solid rgba(255,255,255,0.1)",
    },
    statsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: "16px",
        marginBottom: "1.5rem",
    },
    statCard: {
        background: "#fff",
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
    twoCol: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "16px",
        marginBottom: "1.5rem",
    },
    card: {
        background: "#fff",
        borderRadius: "12px",
        border: "0.5px solid #e2e8f0",
        padding: "1.25rem",
        marginBottom: "1.5rem",
    },
    cardHeader: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "1rem",
    },
    cardTitle: {
        fontSize: "15px",
        fontWeight: "600",
        color: "#1e293b",
        margin: 0,
    },
    linkBtn: {
        background: "transparent",
        border: "none",
        color: "#2563eb",
        fontSize: "12px",
        cursor: "pointer",
        fontWeight: "500",
    },
    subjectRow: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "8px 0",
        borderBottom: "0.5px solid #f1f5f9",
    },
    subjectCode: {
        background: "#dbeafe",
        color: "#1e40af",
        padding: "4px 8px",
        borderRadius: "6px",
        fontSize: "11px",
        fontWeight: "600",
        flexShrink: 0,
    },
    subjectName: {
        fontSize: "13px",
        fontWeight: "500",
        color: "#1e293b",
    },
    subjectMeta: {
        fontSize: "11px",
        color: "#64748b",
        marginTop: "2px",
    },
    assignmentRow: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "8px 0",
        borderBottom: "0.5px solid #f1f5f9",
        gap: "8px",
    },
    assignmentLeft: {
        flex: 1,
    },
    assignmentTitle: {
        fontSize: "13px",
        fontWeight: "500",
        color: "#1e293b",
    },
    assignmentMeta: {
        fontSize: "11px",
        color: "#64748b",
        marginTop: "2px",
    },
    badge: {
        padding: "3px 8px",
        borderRadius: "99px",
        fontSize: "11px",
        fontWeight: "500",
        flexShrink: 0,
    },
    emptyText: {
        fontSize: "13px",
        color: "#94a3b8",
        textAlign: "center",
        padding: "1rem 0",
    },
    actionsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
        gap: "12px",
        marginTop: "1rem",
    },
    actionBtn: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "8px",
        padding: "1.25rem",
        border: "none",
        borderRadius: "10px",
        cursor: "pointer",
        transition: "all 0.2s ease",
    },
    actionIcon: {
        fontSize: "24px",
    },
    actionLabel: {
        fontSize: "12px",
        fontWeight: "600",
    },
};

export default TeacherDashboard;