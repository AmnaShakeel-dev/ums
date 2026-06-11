import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import studentService from "../../services/studentService";
import LoadingSpinner from "../common/LoadingSpinner";

const MySubjects = () => {
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchSubjects();
    }, []);

    const fetchSubjects = async () => {
        try {
            const res = await studentService.getMySubjects();
            setSubjects(res.subjects);
        } catch (error) {
            console.error("Failed to fetch subjects:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div>

            {/* Page Header */}
            <div style={styles.pageHeader}>
                <div>
                    <h1 style={styles.pageTitle}>My Subjects</h1>
                    <p style={styles.pageSubtitle}>
                        Your enrolled courses this semester
                    </p>
                </div>
                <div style={styles.totalBadge}>
                    {subjects.length} Subject{subjects.length !== 1 ? "s" : ""}
                </div>
            </div>

            {/* Subjects Grid */}
            {subjects.length === 0 ? (
                <div style={styles.emptyState}>
                    <div style={styles.emptyIcon}>📚</div>
                    <p style={styles.emptyText}>
                        You are not enrolled in any subjects yet.
                    </p>
                    <p style={styles.emptySubtext}>
                        Contact admin to get enrolled in subjects.
                    </p>
                </div>
            ) : (
                <div style={styles.grid}>
                    {subjects.map((subject) => (
                        <div key={subject._id} style={styles.card}>

                            {/* Card Header */}
                            <div style={styles.cardHeader}>
                                <span style={styles.subjectCode}>
                                    {subject.subjectCode}
                                </span>
                                <span style={styles.credits}>
                                    {subject.credits} Credits
                                </span>
                            </div>

                            {/* Subject Name */}
                            <h3 style={styles.subjectName}>{subject.subjectName}</h3>

                            {/* Description */}
                            {subject.description && (
                                <p style={styles.description}>{subject.description}</p>
                            )}

                            {/* Divider */}
                            <div style={styles.divider} />

                            {/* Teacher Info */}
                            <div style={styles.teacherRow}>
                                <div style={styles.teacherAvatar}>
                                    {subject.teacher?.name
                                        ?.split(" ")
                                        .map((n) => n[0])
                                        .join("")
                                        .slice(0, 2) || "NA"}
                                </div>
                                <div>
                                    <div style={styles.teacherName}>
                                        {subject.teacher?.name || "No teacher assigned"}
                                    </div>
                                    <div style={styles.teacherEmail}>
                                        {subject.teacher?.email || ""}
                                    </div>
                                </div>
                            </div>

                            {/* View Lectures Button */}
                            <button
                                onClick={() =>
                                    navigate(`/student/lectures/${subject._id}`)
                                }
                                style={styles.lecturesBtn}
                            >
                                📁 View Lectures
                            </button>

                        </div>
                    ))}
                </div>
            )}

        </div>
    );
};

const styles = {
    pageHeader: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
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
    totalBadge: {
        background: "#dbeafe",
        color: "#1e40af",
        padding: "6px 14px",
        borderRadius: "99px",
        fontSize: "13px",
        fontWeight: "600",
    },
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: "16px",
    },
    card: {
        background: "#fff",
        borderRadius: "12px",
        border: "0.5px solid #e2e8f0",
        padding: "1.25rem",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
    },
    cardHeader: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
    },
    subjectCode: {
        background: "#dbeafe",
        color: "#1e40af",
        padding: "3px 10px",
        borderRadius: "6px",
        fontSize: "12px",
        fontWeight: "600",
    },
    credits: {
        fontSize: "12px",
        color: "#64748b",
        fontWeight: "500",
    },
    subjectName: {
        fontSize: "16px",
        fontWeight: "600",
        color: "#1e293b",
        margin: 0,
    },
    description: {
        fontSize: "12px",
        color: "#64748b",
        lineHeight: "1.5",
        margin: 0,
    },
    divider: {
        height: "0.5px",
        background: "#f1f5f9",
        margin: "4px 0",
    },
    teacherRow: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
    },
    teacherAvatar: {
        width: "34px",
        height: "34px",
        borderRadius: "50%",
        background: "#ecfdf5",
        color: "#15803d",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "11px",
        fontWeight: "600",
        flexShrink: 0,
    },
    teacherName: {
        fontSize: "13px",
        fontWeight: "500",
        color: "#1e293b",
    },
    teacherEmail: {
        fontSize: "11px",
        color: "#64748b",
    },
    lecturesBtn: {
        width: "100%",
        padding: "9px",
        background: "#eff6ff",
        color: "#2563eb",
        border: "0.5px solid #bfdbfe",
        borderRadius: "8px",
        fontSize: "13px",
        fontWeight: "500",
        cursor: "pointer",
        marginTop: "4px",
        transition: "all 0.2s ease",
    },
    emptyState: {
        textAlign: "center",
        padding: "4rem 2rem",
        background: "#fff",
        borderRadius: "12px",
        border: "0.5px solid #e2e8f0",
    },
    emptyIcon: {
        fontSize: "48px",
        marginBottom: "12px",
    },
    emptyText: {
        fontSize: "16px",
        fontWeight: "600",
        color: "#1e293b",
        marginBottom: "4px",
    },
    emptySubtext: {
        fontSize: "13px",
        color: "#64748b",
    },
};

export default MySubjects;