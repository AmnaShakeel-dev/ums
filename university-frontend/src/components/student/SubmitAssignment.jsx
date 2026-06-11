import { useState, useEffect } from "react";
import studentService from "../../services/studentService";
import Toast from "../common/Toast";
import LoadingSpinner from "../common/LoadingSpinner";
import Modal from "../common/Modal";
import { formatDate, isOverdue } from "../../utils/helpers";

const SubmitAssignment = () => {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitModal, setSubmitModal] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [file, setFile] = useState(null);
    const [toast, setToast] = useState(null);
    const [filter, setFilter] = useState("all");

    useEffect(() => {
        fetchAssignments();
    }, []);

    const fetchAssignments = async () => {
        try {
            const res = await studentService.getMyAssignments();
            setAssignments(res.assignments);
        } catch (error) {
            showToast("Failed to fetch assignments.", "error");
        } finally {
            setLoading(false);
        }
    };

    const showToast = (message, type = "success") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleSubmit = async () => {
        if (!file) {
            showToast("Please select a file to submit.", "error");
            return;
        }

        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append("file", file);

            await studentService.submitAssignment(
                submitModal._id,
                formData
            );
            showToast("Assignment submitted successfully!");
            setSubmitModal(null);
            setFile(null);
            fetchAssignments();
        } catch (error) {
            showToast(
                error.response?.data?.message || "Submission failed.",
                "error"
            );
        } finally {
            setSubmitting(false);
        }
    };

    const getFilteredAssignments = () => {
        if (filter === "pending") {
            return assignments.filter(
                (a) => !a.submission && !isOverdue(a.dueDate)
            );
        }
        if (filter === "submitted") {
            return assignments.filter(
                (a) => a.submission?.status === "submitted"
            );
        }
        if (filter === "graded") {
            return assignments.filter(
                (a) => a.submission?.status === "graded"
            );
        }
        return assignments;
    };

    const getStatusInfo = (assignment) => {
        if (!assignment.submission) {
            if (isOverdue(assignment.dueDate)) {
                return {
                    label: "Missed",
                    bg: "#f1f5f9",
                    color: "#475569",
                };
            }
            return {
                label: "Pending",
                bg: "#fef9c3",
                color: "#854d0e",
            };
        }
        if (assignment.submission.status === "graded") {
            return {
                label: "Graded",
                bg: "#dcfce7",
                color: "#15803d",
            };
        }
        return {
            label: "Submitted",
            bg: "#dbeafe",
            color: "#1e40af",
        };
    };

    const counts = {
        all: assignments.length,
        pending: assignments.filter(
            (a) => !a.submission && !isOverdue(a.dueDate)
        ).length,
        submitted: assignments.filter(
            (a) => a.submission?.status === "submitted"
        ).length,
        graded: assignments.filter(
            (a) => a.submission?.status === "graded"
        ).length,
    };

    if (loading) return <LoadingSpinner />;

    const filtered = getFilteredAssignments();

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
                    <h1 style={styles.pageTitle}>Assignments</h1>
                    <p style={styles.pageSubtitle}>
                        View and submit your assignments
                    </p>
                </div>
            </div>

            {/* Filter Tabs */}
            <div style={styles.filterTabs}>
                {[
                    { key: "all", label: "All" },
                    { key: "pending", label: "Pending" },
                    { key: "submitted", label: "Submitted" },
                    { key: "graded", label: "Graded" },
                ].map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setFilter(tab.key)}
                        style={{
                            ...styles.filterTab,
                            background:
                                filter === tab.key ? "#2563eb" : "#fff",
                            color:
                                filter === tab.key ? "#fff" : "#64748b",
                            border:
                                filter === tab.key
                                    ? "0.5px solid #2563eb"
                                    : "0.5px solid #e2e8f0",
                        }}
                    >
                        {tab.label}
                        <span
                            style={{
                                ...styles.tabCount,
                                background:
                                    filter === tab.key
                                        ? "rgba(255,255,255,0.2)"
                                        : "#f1f5f9",
                                color:
                                    filter === tab.key ? "#fff" : "#64748b",
                            }}
                        >
                            {counts[tab.key]}
                        </span>
                    </button>
                ))}
            </div>

            {/* Assignments List */}
            {filtered.length === 0 ? (
                <div style={styles.emptyState}>
                    <div style={styles.emptyIcon}>📝</div>
                    <p style={styles.emptyText}>
                        No assignments in this category.
                    </p>
                </div>
            ) : (
                <div style={styles.assignmentsList}>
                    {filtered.map((a) => {
                        const statusInfo = getStatusInfo(a);
                        const overdue = isOverdue(a.dueDate);
                        return (
                            <div key={a._id} style={styles.assignmentCard}>

                                {/* Top Row */}
                                <div style={styles.cardTop}>
                                    <div style={styles.cardLeft}>
                                        <div style={styles.titleRow}>
                                            <h3 style={styles.assignTitle}>
                                                {a.title}
                                            </h3>
                                            <span
                                                style={{
                                                    ...styles.statusBadge,
                                                    background: statusInfo.bg,
                                                    color: statusInfo.color,
                                                }}
                                            >
                                                {statusInfo.label}
                                            </span>
                                        </div>
                                        <p style={styles.assignDesc}>
                                            {a.description}
                                        </p>
                                    </div>

                                    {/* Submit Button */}
                                    {!a.submission && !overdue && (
                                        <button
                                            onClick={() => {
                                                setSubmitModal(a);
                                                setFile(null);
                                            }}
                                            style={styles.submitBtn}
                                        >
                                            📤 Submit
                                        </button>
                                    )}
                                </div>

                                {/* Meta Row */}
                                <div style={styles.metaRow}>
                                    <span style={styles.metaItem}>
                                        📚 {a.subject?.subjectCode} —{" "}
                                        {a.subject?.subjectName}
                                    </span>
                                    <span style={styles.metaItem}>
                                        👨‍🏫 {a.teacher?.name}
                                    </span>
                                    <span
                                        style={{
                                            ...styles.metaItem,
                                            color: overdue ? "#dc2626" : "#374151",
                                            fontWeight: overdue ? "600" : "400",
                                        }}
                                    >
                                        📅 Due: {formatDate(a.dueDate)}
                                    </span>
                                    <span style={styles.metaItem}>
                                        ⭐ Max: {a.maxMarks}
                                    </span>
                                </div>

                                {/* Graded Result */}
                                {a.submission?.status === "graded" && (
                                    <div style={styles.gradeResult}>
                                        <div style={styles.gradeRow}>
                                            <span style={styles.gradeLabel}>
                                                Your Marks:
                                            </span>
                                            <span style={styles.gradeValue}>
                                                {a.submission.marks}/{a.maxMarks}
                                            </span>
                                            <span
                                                style={{
                                                    ...styles.gradePercent,
                                                    color:
                                                        (a.submission.marks / a.maxMarks) *
                                                            100 >=
                                                            60
                                                            ? "#15803d"
                                                            : "#dc2626",
                                                }}
                                            >
                                                (
                                                {Math.round(
                                                    (a.submission.marks / a.maxMarks) *
                                                    100
                                                )}
                                                %)
                                            </span>
                                        </div>
                                        {a.submission.feedback && (
                                            <div style={styles.feedback}>
                                                💬 {a.submission.feedback}
                                            </div>
                                        )}
                                    </div>
                                )}

                            </div>
                        );
                    })}
                </div>
            )}

            {/* Submit Modal */}
            <Modal
                isOpen={!!submitModal}
                onClose={() => {
                    setSubmitModal(null);
                    setFile(null);
                }}
                title={`Submit — ${submitModal?.title}`}
            >
                <div>
                    <div style={styles.modalInfo}>
                        <div style={styles.infoRow}>
                            <span>Subject:</span>
                            <strong>
                                {submitModal?.subject?.subjectName}
                            </strong>
                        </div>
                        <div style={styles.infoRow}>
                            <span>Due Date:</span>
                            <strong>{formatDate(submitModal?.dueDate)}</strong>
                        </div>
                        <div style={styles.infoRow}>
                            <span>Max Marks:</span>
                            <strong>{submitModal?.maxMarks}</strong>
                        </div>
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>
                            Upload Your Submission *
                        </label>
                        <div
                            style={styles.fileDropZone}
                            onClick={() =>
                                document
                                    .getElementById("submissionFile")
                                    .click()
                            }
                        >
                            {file ? (
                                <div style={styles.fileSelected}>
                                    <span>✅</span>
                                    <span style={styles.fileName}>{file.name}</span>
                                    <span style={styles.fileSize}>
                                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                    </span>
                                </div>
                            ) : (
                                <div style={styles.filePlaceholder}>
                                    <span style={styles.uploadIcon}>📎</span>
                                    <span>Click to select your file</span>
                                    <span style={styles.fileHint}>
                                        PDF, DOC, DOCX accepted (max 10MB)
                                    </span>
                                </div>
                            )}
                        </div>
                        <input
                            id="submissionFile"
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={(e) => setFile(e.target.files[0])}
                            style={{ display: "none" }}
                        />
                    </div>

                    <div style={styles.modalActions}>
                        <button
                            onClick={() => {
                                setSubmitModal(null);
                                setFile(null);
                            }}
                            style={styles.cancelBtn}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            style={{
                                ...styles.confirmSubmitBtn,
                                background: submitting ? "#94a3b8" : "#2563eb",
                                cursor: submitting
                                    ? "not-allowed"
                                    : "pointer",
                            }}
                        >
                            {submitting
                                ? "Submitting..."
                                : "Submit Assignment"}
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
    filterTabs: {
        display: "flex",
        gap: "8px",
        marginBottom: "1.25rem",
        flexWrap: "wrap",
    },
    filterTab: {
        display: "flex",
        alignItems: "center",
        gap: "6px",
        padding: "7px 14px",
        borderRadius: "8px",
        fontSize: "13px",
        fontWeight: "500",
        cursor: "pointer",
        transition: "all 0.15s ease",
    },
    tabCount: {
        padding: "1px 6px",
        borderRadius: "99px",
        fontSize: "11px",
        fontWeight: "600",
    },
    assignmentsList: {
        display: "flex",
        flexDirection: "column",
        gap: "12px",
    },
    assignmentCard: {
        background: "#fff",
        borderRadius: "12px",
        border: "0.5px solid #e2e8f0",
        padding: "1.25rem",
    },
    cardTop: {
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: "12px",
        marginBottom: "12px",
    },
    cardLeft: {
        flex: 1,
    },
    titleRow: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        marginBottom: "6px",
        flexWrap: "wrap",
    },
    assignTitle: {
        fontSize: "15px",
        fontWeight: "600",
        color: "#1e293b",
        margin: 0,
    },
    statusBadge: {
        padding: "2px 8px",
        borderRadius: "99px",
        fontSize: "11px",
        fontWeight: "500",
    },
    assignDesc: {
        fontSize: "13px",
        color: "#64748b",
        lineHeight: "1.5",
        margin: 0,
    },
    submitBtn: {
        background: "#2563eb",
        color: "#fff",
        border: "none",
        borderRadius: "8px",
        padding: "8px 14px",
        fontSize: "13px",
        fontWeight: "500",
        cursor: "pointer",
        flexShrink: 0,
    },
    metaRow: {
        display: "flex",
        alignItems: "center",
        gap: "16px",
        flexWrap: "wrap",
        paddingTop: "10px",
        borderTop: "0.5px solid #f1f5f9",
    },
    metaItem: {
        fontSize: "12px",
        color: "#374151",
    },
    gradeResult: {
        marginTop: "10px",
        padding: "10px 14px",
        background: "#f0fdf4",
        borderRadius: "8px",
        border: "0.5px solid #86efac",
    },
    gradeRow: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        marginBottom: "4px",
    },
    gradeLabel: {
        fontSize: "13px",
        color: "#374151",
    },
    gradeValue: {
        fontSize: "15px",
        fontWeight: "700",
        color: "#15803d",
    },
    gradePercent: {
        fontSize: "13px",
        fontWeight: "600",
    },
    feedback: {
        fontSize: "12px",
        color: "#475569",
        lineHeight: "1.5",
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
        fontSize: "15px",
        color: "#64748b",
    },
    modalInfo: {
        background: "#f8fafc",
        borderRadius: "8px",
        padding: "12px",
        marginBottom: "1rem",
    },
    infoRow: {
        display: "flex",
        justifyContent: "space-between",
        fontSize: "13px",
        color: "#475569",
        padding: "4px 0",
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
    fileDropZone: {
        border: "1.5px dashed #cbd5e1",
        borderRadius: "8px",
        padding: "1.5rem",
        textAlign: "center",
        cursor: "pointer",
        background: "#f8fafc",
    },
    filePlaceholder: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "6px",
        color: "#64748b",
        fontSize: "13px",
    },
    uploadIcon: {
        fontSize: "28px",
        marginBottom: "4px",
    },
    fileHint: {
        fontSize: "11px",
        color: "#94a3b8",
    },
    fileSelected: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        flexWrap: "wrap",
    },
    fileName: {
        fontSize: "13px",
        fontWeight: "500",
        color: "#1e293b",
    },
    fileSize: {
        fontSize: "11px",
        color: "#64748b",
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
    confirmSubmitBtn: {
        padding: "8px 16px",
        color: "#fff",
        border: "none",
        borderRadius: "8px",
        fontSize: "13px",
        fontWeight: "500",
    },
};

export default SubmitAssignment;