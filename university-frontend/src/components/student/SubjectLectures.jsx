import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import studentService from "../../services/studentService";
import LoadingSpinner from "../common/LoadingSpinner";
import { formatDate, getFileIcon } from "../../utils/helpers";

const SubjectLectures = () => {
    const { subjectId } = useParams();
    const navigate = useNavigate();
    const [lectures, setLectures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchLectures();
    }, [subjectId]);

    const fetchLectures = async () => {
        try {
            const res = await studentService.getSubjectLectures(subjectId);
            setLectures(res.lectures);
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Failed to fetch lectures."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (lecture) => {
        try {
            await studentService.downloadLecture(lecture._id);
            window.open(
                `http://localhost:5000/${lecture.fileUrl}`,
                "_blank"
            );
        } catch (error) {
            console.error("Download failed:", error);
        }
    };

    const getFileTypeStyle = (fileType) => {
        const map = {
            pdf: { background: "#fee2e2", color: "#991b1b" },
            ppt: { background: "#fff7ed", color: "#c2410c" },
            pptx: { background: "#fff7ed", color: "#c2410c" },
            doc: { background: "#dbeafe", color: "#1e40af" },
            docx: { background: "#dbeafe", color: "#1e40af" },
            mp4: { background: "#dcfce7", color: "#15803d" },
            mkv: { background: "#dcfce7", color: "#15803d" },
        };
        return (
            map[fileType] || { background: "#f1f5f9", color: "#475569" }
        );
    };

    if (loading) return <LoadingSpinner />;

    if (error) {
        return (
            <div style={styles.errorState}>
                <div style={styles.errorIcon}>🚫</div>
                <p style={styles.errorText}>{error}</p>
                <button
                    onClick={() => navigate("/student/subjects")}
                    style={styles.backBtn}
                >
                    ← Back to Subjects
                </button>
            </div>
        );
    }

    return (
        <div>

            {/* Page Header */}
            <div style={styles.pageHeader}>
                <div style={styles.headerLeft}>
                    <button
                        onClick={() => navigate("/student/subjects")}
                        style={styles.backLink}
                    >
                        ← Back
                    </button>
                    <div>
                        <h1 style={styles.pageTitle}>Lecture Materials</h1>
                        <p style={styles.pageSubtitle}>
                            {lectures.length} lecture
                            {lectures.length !== 1 ? "s" : ""} available
                        </p>
                    </div>
                </div>
            </div>

            {/* Lectures List */}
            {lectures.length === 0 ? (
                <div style={styles.emptyState}>
                    <div style={styles.emptyIcon}>📁</div>
                    <p style={styles.emptyText}>
                        No lectures uploaded yet for this subject.
                    </p>
                    <p style={styles.emptySubtext}>
                        Check back later for new materials.
                    </p>
                </div>
            ) : (
                <div style={styles.lecturesList}>
                    {lectures.map((lecture, index) => (
                        <div key={lecture._id} style={styles.lectureCard}>

                            {/* Number */}
                            <div style={styles.lectureNumber}>{index + 1}</div>

                            {/* File Icon */}
                            <div
                                style={{
                                    ...styles.fileIcon,
                                    ...getFileTypeStyle(lecture.fileType),
                                }}
                            >
                                {getFileIcon(lecture.fileType)}
                            </div>

                            {/* Lecture Info */}
                            <div style={styles.lectureInfo}>
                                <div style={styles.lectureTitle}>
                                    {lecture.title}
                                </div>
                                {lecture.description && (
                                    <div style={styles.lectureDesc}>
                                        {lecture.description}
                                    </div>
                                )}
                                <div style={styles.lectureMeta}>
                                    <span
                                        style={{
                                            ...styles.fileTypeBadge,
                                            ...getFileTypeStyle(lecture.fileType),
                                        }}
                                    >
                                        {lecture.fileType?.toUpperCase()}
                                    </span>
                                    <span>
                                        Uploaded by {lecture.teacher?.name}
                                    </span>
                                    <span>{formatDate(lecture.createdAt)}</span>
                                    <span>
                                        ⬇ {lecture.downloadCount || 0} downloads
                                    </span>
                                </div>
                            </div>

                            {/* Download Button */}
                            <button
                                onClick={() => handleDownload(lecture)}
                                style={styles.downloadBtn}
                            >
                                ⬇ Download
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
        marginBottom: "1.5rem",
    },
    headerLeft: {
        display: "flex",
        alignItems: "center",
        gap: "16px",
    },
    backLink: {
        background: "#f1f5f9",
        border: "0.5px solid #e2e8f0",
        borderRadius: "8px",
        padding: "8px 14px",
        fontSize: "13px",
        color: "#475569",
        cursor: "pointer",
        fontWeight: "500",
        flexShrink: 0,
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
    lecturesList: {
        display: "flex",
        flexDirection: "column",
        gap: "10px",
    },
    lectureCard: {
        background: "#fff",
        borderRadius: "12px",
        border: "0.5px solid #e2e8f0",
        padding: "1.25rem",
        display: "flex",
        alignItems: "center",
        gap: "16px",
    },
    lectureNumber: {
        width: "28px",
        height: "28px",
        borderRadius: "50%",
        background: "#f1f5f9",
        color: "#64748b",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "12px",
        fontWeight: "600",
        flexShrink: 0,
    },
    fileIcon: {
        width: "46px",
        height: "46px",
        borderRadius: "10px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "20px",
        flexShrink: 0,
    },
    lectureInfo: {
        flex: 1,
    },
    lectureTitle: {
        fontSize: "14px",
        fontWeight: "600",
        color: "#1e293b",
        marginBottom: "3px",
    },
    lectureDesc: {
        fontSize: "12px",
        color: "#64748b",
        marginBottom: "6px",
        lineHeight: "1.4",
    },
    lectureMeta: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        flexWrap: "wrap",
        fontSize: "11px",
        color: "#94a3b8",
    },
    fileTypeBadge: {
        padding: "2px 6px",
        borderRadius: "4px",
        fontSize: "10px",
        fontWeight: "600",
    },
    downloadBtn: {
        background: "#eff6ff",
        color: "#2563eb",
        border: "0.5px solid #bfdbfe",
        borderRadius: "8px",
        padding: "8px 14px",
        fontSize: "12px",
        fontWeight: "500",
        cursor: "pointer",
        flexShrink: 0,
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
    errorState: {
        textAlign: "center",
        padding: "4rem 2rem",
        background: "#fff",
        borderRadius: "12px",
        border: "0.5px solid #e2e8f0",
    },
    errorIcon: {
        fontSize: "48px",
        marginBottom: "12px",
    },
    errorText: {
        fontSize: "15px",
        color: "#dc2626",
        marginBottom: "1rem",
    },
    backBtn: {
        background: "#2563eb",
        color: "#fff",
        border: "none",
        borderRadius: "8px",
        padding: "9px 16px",
        fontSize: "13px",
        cursor: "pointer",
        fontWeight: "500",
    },
};

export default SubjectLectures;