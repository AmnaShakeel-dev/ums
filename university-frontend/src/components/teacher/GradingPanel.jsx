import { useState, useEffect } from "react";
import teacherService from "../../services/teacherService";
import Toast from "../common/Toast";
import LoadingSpinner from "../common/LoadingSpinner";
import Modal from "../common/Modal";
import { formatDate, timeAgo } from "../../utils/helpers";

const GradingPanel = () => {
    const [assignments, setAssignments] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submissionsLoading, setSubmissionsLoading] = useState(false);
    const [gradeModal, setGradeModal] = useState(null);
    const [gradeForm, setGradeForm] = useState({
        marks: "",
        feedback: "",
    });
    const [grading, setGrading] = useState(false);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        fetchAssignments();
    }, []);

    useEffect(() => {
        if (selectedAssignment) {
            fetchSubmissions(selectedAssignment._id);
        }
    }, [selectedAssignment]);

    const fetchAssignments = async () => {
        try {
            const res = await teacherService.getMyAssignments();
            setAssignments(res.assignments);
            if (res.assignments.length > 0) {
                setSelectedAssignment(res.assignments[0]);
            }
        } catch (error) {
            showToast("Failed to fetch assignments.", "error");
        } finally {
            setLoading(false);
        }
    };

    const fetchSubmissions = async (assignmentId) => {
        setSubmissionsLoading(true);
        try {
            const res = await teacherService.getSubmissions(assignmentId);
            setSubmissions(res.submissions);
        } catch (error) {
            showToast("Failed to fetch submissions.", "error");
        } finally {
            setSubmissionsLoading(false);
        }
    };

    const showToast = (message, type = "success") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleOpenGrade = (submission) => {
        setGradeModal(submission);
        setGradeForm({
            marks: submission.marks || "",
            feedback: submission.feedback || "",
        });
    };

    const handleGrade = async () => {
        if (gradeForm.marks === "" || gradeForm.marks === null) {
            showToast("Please enter marks.", "error");
            return;
        }

        if (
            Number(gradeForm.marks) < 0 ||
            Number(gradeForm.marks) > selectedAssignment.maxMarks
        ) {
            showToast(
                `Marks must be between 0 and ${selectedAssignment.maxMarks}.`,
                "error"
            );
            return;
        }

        setGrading(true);
        try {
            await teacherService.gradeSubmission(
                gradeModal._id,
                Number(gradeForm.marks),
                gradeForm.feedback
            );
            showToast("Submission graded successfully!");
            setGradeModal(null);
            fetchSubmissions(selectedAssignment._id);
        } catch (error) {
            showToast(
                error.response?.data?.message || "Grading failed.",
                "error"
            );
        } finally {
            setGrading(false);
        }
    };

    const getSubmissionCounts = () => {
        const total = submissions.length;
        const graded = submissions.filter(
            (s) => s.status === "graded"
        ).length;
        const pending = submissions.filter(
            (s) => s.status === "submitted"
        ).length;
        return { total, graded, pending };
    };

    const counts = getSubmissionCounts();

    if (loading) return <LoadingSpinner />;

    return (
        <div>
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            {/* Page Header */}
            <div style={styles.pageHeader}>
                <div>
                    <h1 style={styles.pageTitle}>Grading Panel</h1>
                    <p style={styles.pageSubtitle}>
                        Review and grade student submissions
                    </p>
                </div>
            </div>

            {assignments.length === 0 ? (
                <div style={styles.emptyState}>
                    <div style={styles.emptyIcon}>⭐</div>
                    <p style={styles.emptyText}>No assignments found.</p>
                    <p style={styles.emptySubtext}>
                        Create assignments first to grade submissions.
                    </p>
                </div>
            ) : (
                <div style={styles.twoCol}>

                    {/* Left — Assignments List */}
                    <div style={styles.assignmentsList}>
                        <div style={styles.listHeader}>
                            <h2 style={styles.listTitle}>Assignments</h2>
                        </div>
                        {assignments.map((a) => (
                            <div
                                key={a._id}
                                onClick={() => setSelectedAssignment(a)}
                                style={{
                                    ...styles.assignmentItem,
                                    background:
                                        selectedAssignment?._id === a._id
                                            ? "#eff6ff"
                                            : "#fff",
                                    borderLeft:
                                        selectedAssignment?._id === a._id
                                            ? "3px solid #2563eb"
                                            : "3px solid transparent",
                                }}
                            >
                                <div style={styles.assignItemTitle}>{a.title}</div>
                                <div style={styles.assignItemMeta}>
                                    {a.subject?.subjectCode} · Due:{" "}
                                    {formatDate(a.dueDate)} · Max: {a.maxMarks}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Right — Submissions */}
                    <div style={styles.submissionsPanel}>

                        {/* Assignment Info */}
                        {selectedAssignment && (
                            <div style={styles.assignmentInfo}>
                                <h2 style={styles.assignmentInfoTitle}>
                                    {selectedAssignment.title}
                                </h2>
                                <div style={styles.countsRow}>
                                    <div style={styles.countBadge}>
                                        Total: {counts.total}
                                    </div>
                                    <div
                                        style={{
                                            ...styles.countBadge,
                                            background: "#dcfce7",
                                            color: "#15803d",
                                        }}
                                    >
                                        Graded: {counts.graded}
                                    </div>
                                    <div
                                        style={{
                                            ...styles.countBadge,
                                            background: "#fef9c3",
                                            color: "#854d0e",
                                        }}
                                    >
                                        Pending: {counts.pending}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Submissions */}
                        {submissionsLoading ? (
                            <LoadingSpinner message="Loading submissions..." />
                        ) : submissions.length === 0 ? (
                            <div style={styles.noSubmissions}>
                                <p>No submissions yet for this assignment.</p>
                            </div>
                        ) : (
                            <div style={styles.submissionsList}>
                                {submissions.map((sub) => (
                                    <div key={sub._id} style={styles.submissionCard}>

                                        {/* Student Info */}
                                        <div style={styles.submissionTop}>
                                            <div style={styles.studentInfo}>
                                                <div style={styles.avatar}>
                                                    {sub.student?.name
                                                        ?.split(" ")
                                                        .map((n) => n[0])
                                                        .join("")
                                                        .slice(0, 2)}
                                                </div>
                                                <div>
                                                    <div style={styles.studentName}>
                                                        {sub.student?.name}
                                                    </div>
                                                    <div style={styles.studentEmail}>
                                                        {sub.student?.email}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Status + Grade Button */}
                                            <div style={styles.submissionRight}>
                                                <span
                                                    style={{
                                                        ...styles.statusBadge,
                                                        background:
                                                            sub.status === "graded"
                                                                ? "#dcfce7"
                                                                : "#fef9c3",
                                                        color:
                                                            sub.status === "graded"
                                                                ? "#15803d"
                                                                : "#854d0e",
                                                    }}
                                                >
                                                    {sub.status}
                                                </span>
                                                {sub.status === "submitted" && (
                                                    <button
                                                        onClick={() => handleOpenGrade(sub)}
                                                        style={styles.gradeBtn}
                                                    >
                                                        Grade
                                                    </button>
                                                )}
                                                {sub.status === "graded" && (
                                                    <button
                                                        onClick={() => handleOpenGrade(sub)}
                                                        style={styles.editGradeBtn}
                                                    >
                                                        Edit Grade
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Submission Details */}
                                        <div style={styles.submissionDetails}>
                                            <span style={styles.detailItem}>
                                                📅 Submitted: {timeAgo(sub.submittedAt)}
                                            </span>
                                            {sub.status === "graded" && (
                                                <>
                                                    <span style={styles.detailItem}>
                                                        ⭐ Marks:{" "}
                                                        <strong>
                                                            {sub.marks}/
                                                            {selectedAssignment?.maxMarks}
                                                        </strong>
                                                    </span>
                                                    {sub.feedback && (
                                                        <span style={styles.detailItem}>
                                                            💬 {sub.feedback}
                                                        </span>
                                                    )}
                                                </>
                                            )}
                                        </div>

                                    </div>
                                ))}
                            </div>
                        )}

                    </div>
                </div>
            )}

            {/* Grade Modal */}
            <Modal
                isOpen={!!gradeModal}
                onClose={() => setGradeModal(null)}
                title={`Grade — ${gradeModal?.student?.name}`}
            >
                <div>
                    <div style={styles.gradeInfo}>
                        <span>Max Marks:</span>
                        <strong>{selectedAssignment?.maxMarks}</strong>
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Marks *</label>
                        <input
                            type="number"
                            placeholder={`0 to ${selectedAssignment?.maxMarks}`}
                            value={gradeForm.marks}
                            onChange={(e) =>
                                setGradeForm((p) => ({
                                    ...p,
                                    marks: e.target.value,
                                }))
                            }
                            min="0"
                            max={selectedAssignment?.maxMarks}
                            style={styles.input}
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Feedback (Optional)</label>
                        <textarea
                            placeholder="Write feedback for the student..."
                            value={gradeForm.feedback}
                            onChange={(e) =>
                                setGradeForm((p) => ({
                                    ...p,
                                    feedback: e.target.value,
                                }))
                            }
                            rows={4}
                            style={{ ...styles.input, resize: "none" }}
                        />
                    </div>

                    <div style={styles.modalActions}>
                        <button
                            onClick={() => setGradeModal(null)}
                            style={styles.cancelBtn}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleGrade}
                            disabled={grading}
                            style={{
                                ...styles.submitBtn,
                                background: grading ? "#94a3b8" : "#16a34a",
                                cursor: grading ? "not-allowed" : "pointer",
                            }}
                        >
                            {grading ? "Saving..." : "Submit Grade"}
                        </button>
                    </div>
                </div>
            </Modal>

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
    twoCol: {
        display: "grid",
        gridTemplateColumns: "280px 1fr",
        gap: "16px",
        alignItems: "start",
    },
    assignmentsList: {
        background: "#fff",
        borderRadius: "12px",
        border: "0.5px solid #e2e8f0",
        overflow: "hidden",
    },
    listHeader: {
        padding: "1rem 1.25rem",
        borderBottom: "0.5px solid #e2e8f0",
        background: "#f8fafc",
    },
    listTitle: {
        fontSize: "14px",
        fontWeight: "600",
        color: "#1e293b",
        margin: 0,
    },
    assignmentItem: {
        padding: "0.875rem 1.25rem",
        cursor: "pointer",
        borderBottom: "0.5px solid #f1f5f9",
        transition: "all 0.15s ease",
    },
    assignItemTitle: {
        fontSize: "13px",
        fontWeight: "500",
        color: "#1e293b",
        marginBottom: "3px",
    },
    assignItemMeta: {
        fontSize: "11px",
        color: "#94a3b8",
    },
    submissionsPanel: {
        background: "#fff",
        borderRadius: "12px",
        border: "0.5px solid #e2e8f0",
        overflow: "hidden",
    },
    assignmentInfo: {
        padding: "1rem 1.25rem",
        borderBottom: "0.5px solid #e2e8f0",
        background: "#f8fafc",
    },
    assignmentInfoTitle: {
        fontSize: "15px",
        fontWeight: "600",
        color: "#1e293b",
        margin: "0 0 8px 0",
    },
    countsRow: {
        display: "flex",
        gap: "8px",
    },
    countBadge: {
        padding: "3px 10px",
        borderRadius: "99px",
        fontSize: "11px",
        fontWeight: "500",
        background: "#f1f5f9",
        color: "#475569",
    },
    submissionsList: {
        display: "flex",
        flexDirection: "column",
    },
    submissionCard: {
        padding: "1rem 1.25rem",
        borderBottom: "0.5px solid #f1f5f9",
    },
    submissionTop: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "8px",
    },
    studentInfo: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
    },
    avatar: {
        width: "34px",
        height: "34px",
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
    studentName: {
        fontSize: "13px",
        fontWeight: "500",
        color: "#1e293b",
    },
    studentEmail: {
        fontSize: "11px",
        color: "#64748b",
    },
    submissionRight: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
    },
    statusBadge: {
        padding: "3px 10px",
        borderRadius: "99px",
        fontSize: "11px",
        fontWeight: "500",
    },
    gradeBtn: {
        background: "#2563eb",
        color: "#fff",
        border: "none",
        borderRadius: "6px",
        padding: "5px 12px",
        fontSize: "12px",
        cursor: "pointer",
        fontWeight: "500",
    },
    editGradeBtn: {
        background: "#f1f5f9",
        color: "#475569",
        border: "none",
        borderRadius: "6px",
        padding: "5px 12px",
        fontSize: "12px",
        cursor: "pointer",
    },
    submissionDetails: {
        display: "flex",
        gap: "16px",
        flexWrap: "wrap",
    },
    detailItem: {
        fontSize: "12px",
        color: "#64748b",
    },
    noSubmissions: {
        textAlign: "center",
        padding: "3rem",
        color: "#94a3b8",
        fontSize: "13px",
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
    gradeInfo: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "10px 12px",
        background: "#f8fafc",
        borderRadius: "8px",
        marginBottom: "1rem",
        fontSize: "13px",
        color: "#475569",
    },
    formGroup: {
        marginBottom: "1rem",
    },
    label: {
        display: "block",
        fontSize: "12px",
        fontWeight: "600",
        color: "#475569",
        marginBottom: "5px",
        textTransform: "uppercase",
        letterSpacing: "0.5px",
    },
    input: {
        width: "100%",
        padding: "9px 12px",
        border: "0.5px solid #e2e8f0",
        borderRadius: "8px",
        fontSize: "13px",
        outline: "none",
        boxSizing: "border-box",
        background: "#fff",
        color: "#1e293b",
    },
    modalActions: {
        display: "flex",
        gap: "8px",
        justifyContent: "flex-end",
        marginTop: "1.25rem",
    },
    cancelBtn: {
        padding: "8px 16px",
        background: "transparent",
        border: "0.5px solid #e2e8f0",
        borderRadius: "8px",
        fontSize: "13px",
        cursor: "pointer",
        color: "#374151",
    },
    submitBtn: {
        padding: "8px 16px",
        color: "#fff",
        border: "none",
        borderRadius: "8px",
        fontSize: "13px",
        fontWeight: "500",
    },
};

export default GradingPanel;