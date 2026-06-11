import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import studentService from "../../services/studentService";
import LoadingSpinner from "../common/LoadingSpinner";
import useAuth from "../../hooks/useAuth";
import { formatDate, isOverdue } from "../../utils/helpers";

const StudentDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [subjects, setSubjects] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [attendance, setAttendance] = useState(null);
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [subjectsRes, assignmentsRes, attendanceRes, announcementsRes] =
                await Promise.all([
                    studentService.getMySubjects(),
                    studentService.getMyAssignments(),
                    studentService.getMyAttendance(),
                    studentService.getMyAnnouncements(),
                ]);
            setSubjects(subjectsRes.subjects);
            setAssignments(assignmentsRes.assignments);
            setAttendance(attendanceRes);
            setAnnouncements(announcementsRes.announcements);
        } catch (error) {
            console.error("Dashboard error:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LoadingSpinner />;

    const pendingAssignments = assignments.filter(
        (a) => !a.submission && !isOverdue(a.dueDate)
    );

    const overallPct = attendance?.overallPercentage || 0;
    const attendanceColor =
        overallPct >= 75
            ? "#16a34a"
            : overallPct >= 60
                ? "#d97706"
                : "#dc2626";
    const attendanceBg =
        overallPct >= 75
            ? "#dcfce7"
            : overallPct >= 60
                ? "#fef9c3"
                : "#fee2e2";

    return (
        <div>

            {/* Welcome Card */}
            <div style={styles.welcomeCard}>
                <div>
                    <h1 style={styles.welcomeTitle}>
                        Welcome back, {user?.name}! 👋
                    </h1>
                    <p style={styles.welcomeSubtitle}>
                        {user?.department} · {user?.email}
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
                <div style={styles.statCard}>
                    <div
                        style={{
                            ...styles.statIcon,
                            background: "#eff6ff",
                            color: "#2563eb",
                        }}
                    >
                        📚
                    </div>
                    <div>
                        <p style={styles.statLabel}>Enrolled Subjects</p>
                        <h3 style={styles.statValue}>{subjects.length}</h3>
                    </div>
                </div>

                {/* Attendance Card with Meter */}
                <div
                    style={{
                        ...styles.statCard,
                        background: attendanceBg,
                        border: `0.5px solid ${attendanceColor}30`,
                    }}
                >
                    <div
                        style={{
                            ...styles.statIcon,
                            background: "rgba(255,255,255,0.6)",
                            color: attendanceColor,
                        }}
                    >
                        📊
                    </div>
                    <div style={{ flex: 1 }}>
                        <p
                            style={{
                                ...styles.statLabel,
                                color: attendanceColor,
                            }}
                        >
                            Overall Attendance
                        </p>
                        <h3
                            style={{
                                ...styles.statValue,
                                color: attendanceColor,
                            }}
                        >
                            {overallPct}%
                        </h3>
                        <div style={styles.attendanceMeter}>
                            <div
                                style={{
                                    ...styles.attendanceFill,
                                    width: `${overallPct}%`,
                                    background: attendanceColor,
                                }}
                            />
                        </div>
                    </div>
                </div>

                <div style={styles.statCard}>
                    <div
                        style={{
                            ...styles.statIcon,
                            background: "#fffbeb",
                            color: "#d97706",
                        }}
                    >
                        📝
                    </div>
                    <div>
                        <p style={styles.statLabel}>Pending Assignments</p>
                        <h3 style={styles.statValue}>{pendingAssignments.length}</h3>
                    </div>
                </div>

                <div style={styles.statCard}>
                    <div
                        style={{
                            ...styles.statIcon,
                            background: "#f5f3ff",
                            color: "#7c3aed",
                        }}
                    >
                        📢
                    </div>
                    <div>
                        <p style={styles.statLabel}>Announcements</p>
                        <h3 style={styles.statValue}>{announcements.length}</h3>
                    </div>
                </div>
            </div>

            {/* Two Column */}
            <div style={styles.twoCol}>

                {/* Pending Assignments */}
                <div style={styles.card}>
                    <div style={styles.cardHeader}>
                        <h2 style={styles.cardTitle}>Pending Assignments</h2>
                        <button
                            onClick={() => navigate("/student/assignments")}
                            style={styles.linkBtn}
                        >
                            View All →
                        </button>
                    </div>
                    {pendingAssignments.length === 0 ? (
                        <p style={styles.emptyText}>
                            No pending assignments. 🎉
                        </p>
                    ) : (
                        pendingAssignments.slice(0, 4).map((a) => (
                            <div key={a._id} style={styles.assignRow}>
                                <div style={styles.assignLeft}>
                                    <div style={styles.assignTitle}>{a.title}</div>
                                    <div style={styles.assignMeta}>
                                        {a.subject?.subjectCode} · Due:{" "}
                                        {formatDate(a.dueDate)}
                                    </div>
                                </div>
                                <span style={styles.maxMarks}>/{a.maxMarks}</span>
                            </div>
                        ))
                    )}
                </div>

                {/* Recent Announcements */}
                <div style={styles.card}>
                    <div style={styles.cardHeader}>
                        <h2 style={styles.cardTitle}>Recent Announcements</h2>
                    </div>
                    {announcements.length === 0 ? (
                        <p style={styles.emptyText}>No announcements.</p>
                    ) : (
                        announcements.slice(0, 4).map((a) => (
                            <div key={a._id} style={styles.annoRow}>
                                <div style={styles.annoLeft}>
                                    <span
                                        style={{
                                            ...styles.priorityDot,
                                            background:
                                                a.priority === "high"
                                                    ? "#dc2626"
                                                    : a.priority === "medium"
                                                        ? "#d97706"
                                                        : "#16a34a",
                                        }}
                                    />
                                    <div>
                                        <div style={styles.annoTitle}>{a.title}</div>
                                        <div style={styles.annoMeta}>
                                            By {a.createdBy?.name} ·{" "}
                                            {formatDate(a.createdAt)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

            </div>

            {/* My Subjects Quick View */}
            <div style={styles.card}>
                <div style={styles.cardHeader}>
                    <h2 style={styles.cardTitle}>My Subjects</h2>
                    <button
                        onClick={() => navigate("/student/subjects")}
                        style={styles.linkBtn}
                    >
                        View All →
                    </button>
                </div>
                <div style={styles.subjectsGrid}>
                    {subjects.slice(0, 3).map((s) => (
                        <div key={s._id} style={styles.subjectCard}>
                            <div style={styles.subjectCode}>{s.subjectCode}</div>
                            <div style={styles.subjectName}>{s.subjectName}</div>
                            <div style={styles.subjectMeta}>
                                {s.credits} Credits · {s.teacher?.name || "No teacher"}
                            </div>
                        </div>
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
    attendanceMeter: {
        width: "100%",
        height: "4px",
        background: "rgba(255,255,255,0.5)",
        borderRadius: "99px",
        marginTop: "6px",
        overflow: "hidden",
    },
    attendanceFill: {
        height: "100%",
        borderRadius: "99px",
        transition: "width 0.6s ease",
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
    assignRow: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "8px 0",
        borderBottom: "0.5px solid #f1f5f9",
    },
    assignLeft: {
        flex: 1,
    },
    assignTitle: {
        fontSize: "13px",
        fontWeight: "500",
        color: "#1e293b",
    },
    assignMeta: {
        fontSize: "11px",
        color: "#64748b",
        marginTop: "2px",
    },
    maxMarks: {
        fontSize: "12px",
        color: "#94a3b8",
    },
    annoRow: {
        padding: "8px 0",
        borderBottom: "0.5px solid #f1f5f9",
    },
    annoLeft: {
        display: "flex",
        alignItems: "flex-start",
        gap: "10px",
    },
    priorityDot: {
        width: "8px",
        height: "8px",
        borderRadius: "50%",
        flexShrink: 0,
        marginTop: "4px",
    },
    annoTitle: {
        fontSize: "13px",
        fontWeight: "500",
        color: "#1e293b",
    },
    annoMeta: {
        fontSize: "11px",
        color: "#64748b",
        marginTop: "2px",
    },
    emptyText: {
        fontSize: "13px",
        color: "#94a3b8",
        textAlign: "center",
        padding: "1rem 0",
    },
    subjectsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
        gap: "12px",
    },
    subjectCard: {
        background: "#f8fafc",
        borderRadius: "10px",
        padding: "1rem",
        border: "0.5px solid #e2e8f0",
    },
    subjectCode: {
        background: "#dbeafe",
        color: "#1e40af",
        padding: "3px 8px",
        borderRadius: "6px",
        fontSize: "11px",
        fontWeight: "600",
        display: "inline-block",
        marginBottom: "6px",
    },
    subjectName: {
        fontSize: "13px",
        fontWeight: "600",
        color: "#1e293b",
        marginBottom: "4px",
    },
    subjectMeta: {
        fontSize: "11px",
        color: "#64748b",
    },
};

export default StudentDashboard;