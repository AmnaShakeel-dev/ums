import { useState, useEffect } from "react";
import teacherService from "../../services/teacherService";
import Toast from "../common/Toast";
import LoadingSpinner from "../common/LoadingSpinner";
import Modal from "../common/Modal";
import { formatDate, isOverdue } from "../../utils/helpers";

const AssignmentManagement = () => {
    const [assignments, setAssignments] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [toast, setToast] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [form, setForm] = useState({
        title: "",
        description: "",
        subjectId: "",
        dueDate: "",
        maxMarks: 100,
    });
    const [guidelinesFile, setGuidelinesFile] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [assignmentsRes, subjectsRes] = await Promise.all([
                teacherService.getMyAssignments(),
                teacherService.getMySubjects(),
            ]);
            setAssignments(assignmentsRes.assignments);
            setSubjects(subjectsRes.subjects);
            if (subjectsRes.subjects.length > 0) {
                setForm((p) => ({
                    ...p,
                    subjectId: subjectsRes.subjects[0]._id,
                }));
            }
        } catch (error) {
            showToast("Failed to fetch data.", "error");
        } finally {
            setLoading(false);
        }
    };

    const showToast = (message, type = "success") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleSubmit = async () => {
        if (
            !form.title ||
            !form.description ||
            !form.subjectId ||
            !form.dueDate ||
            !form.maxMarks
        ) {
            showToast("Please fill all required fields.", "error");
            return;
        }

        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append("title", form.title);
            formData.append("description", form.description);
            formData.append("subjectId", form.subjectId);
            formData.append("dueDate", form.dueDate);
            formData.append("maxMarks", form.maxMarks);
            if (guidelinesFile) {
                formData.append("file", guidelinesFile);
            }

            await teacherService.createAssignment(formData);
            showToast("Assignment created successfully!");
            setShowModal(false);
            setForm({
                title: "",
                description: "",
                subjectId: subjects[0]?._id || "",
                dueDate: "",
                maxMarks: 100,
            });
            setGuidelinesFile(null);
            fetchData();
        } catch (error) {
            showToast(
                error.response?.data?.message || "Failed to create assignment.",
                "error"
            );
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await teacherService.deleteAssignment(id);
            showToast("Assignment deleted.");
            setDeleteConfirm(null);
            fetchData();
        } catch (error) {
            showToast("Delete failed.", "error");
        }
    };

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
                    <h1 style={styles.pageTitle}>Assignments</h1>
                    <p style={styles.pageSubtitle}>
                        Create and manage assignments for your students
                    </p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    style={styles.createBtn}
                >
                    + Create Assignment
                </button>
            </div>

            {/* Assignments List */}
            {assignments.length === 0 ? (
                <div style={styles.emptyState}>
                    <div style={styles.emptyIcon}>📝</div>
                    <p style={styles.emptyText}>No assignments created yet.</p>
                    <p style={styles.emptySubtext}>
                        Create your first assignment!
                    </p>
                </div>
            ) : (
                <div style={styles.assignmentsList}>
                    {assignments.map((a) => {
                        const overdue = isOverdue(a.dueDate);
                        return (
                            <div key={a._id} style={styles.assignmentCard}>

                                {/* Top Row */}
                                <div style={styles.cardTop}>
                                    <div style={styles.cardLeft}>
                                        <div style={styles.titleRow}>
                                            <h3 style={styles.assignTitle}>{a.title}</h3>
                                            <span
                                                style={{
                                                    ...styles.statusBadge,
                                                    background: overdue ? "#fee2e2" : "#dcfce7",
                                                    color: overdue ? "#991b1b" : "#15803d",
                                                }}
                                            >
                                                {overdue ? "Expired" : "Active"}
                                            </span>
                                        </div>
                                        <p style={styles.assignDesc}>{a.description}</p>
                                    </div>
                                    <button
                                        onClick={() => setDeleteConfirm(a)}
                                        style={styles.deleteBtn}
                                    >
                                        Delete
                                    </button>
                                </div>

                                {/* Meta Row */}
                                <div style={styles.metaRow}>
                                    <div style={styles.metaItem}>
                                        <span style={styles.metaIcon}>📚</span>
                                        <span>
                                            {a.subject?.subjectCode} —{" "}
                                            {a.subject?.subjectName}
                                        </span>
                                    </div>
                                    <div style={styles.metaItem}>
                                        <span style={styles.metaIcon}>📅</span>
                                        <span
                                            style={{
                                                color: overdue ? "#dc2626" : "#374151",
                                                fontWeight: overdue ? "600" : "400",
                                            }}
                                        >
                                            Due: {formatDate(a.dueDate)}
                                        </span>
                                    </div>
                                    <div style={styles.metaItem}>
                                        <span style={styles.metaIcon}>⭐</span>
                                        <span>Max Marks: {a.maxMarks}</span>
                                    </div>
                                    <div style={styles.metaItem}>
                                        <span style={styles.metaIcon}>📅</span>
                                        <span>
                                            Created: {formatDate(a.createdAt)}
                                        </span>
                                    </div>
                                </div>

                            </div>
                        );
                    })}
                </div>
            )}

            {/* Create Assignment Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title="Create Assignment"
                size="lg"
            >
                <div>

                    {/* Title */}
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Title *</label>
                        <input
                            placeholder="Assignment title"
                            value={form.title}
                            onChange={(e) =>
                                setForm((p) => ({ ...p, title: e.target.value }))
                            }
                            style={styles.input}
                        />
                    </div>

                    {/* Description */}
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Description *</label>
                        <textarea
                            placeholder="Assignment instructions and details..."
                            value={form.description}
                            onChange={(e) =>
                                setForm((p) => ({
                                    ...p,
                                    description: e.target.value,
                                }))
                            }
                            rows={4}
                            style={{ ...styles.input, resize: "none" }}
                        />
                    </div>

                    {/* Subject + Max Marks Row */}
                    <div style={styles.twoCol}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Subject *</label>
                            <select
                                value={form.subjectId}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        subjectId: e.target.value,
                                    }))
                                }
                                style={styles.input}
                            >
                                {subjects.map((s) => (
                                    <option key={s._id} value={s._id}>
                                        {s.subjectCode} — {s.subjectName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Max Marks *</label>
                            <input
                                type="number"
                                placeholder="100"
                                value={form.maxMarks}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        maxMarks: Number(e.target.value),
                                    }))
                                }
                                style={styles.input}
                                min="1"
                            />
                        </div>
                    </div>

                    {/* Due Date */}
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Due Date *</label>
                        <input
                            type="date"
                            value={form.dueDate}
                            onChange={(e) =>
                                setForm((p) => ({ ...p, dueDate: e.target.value }))
                            }
                            style={styles.input}
                            min={new Date().toISOString().split("T")[0]}
                        />
                    </div>

                    {/* Guidelines File */}
                    <div style={styles.formGroup}>
                        <label style={styles.label}>
                            Guidelines File (Optional)
                        </label>
                        <div
                            style={styles.fileDropZone}
                            onClick={() =>
                                document.getElementById("guidelinesFile").click()
                            }
                        >
                            {guidelinesFile ? (
                                <div style={styles.fileSelected}>
                                    <span>✅</span>
                                    <span style={styles.fileName}>
                                        {guidelinesFile.name}
                                    </span>
                                </div>
                            ) : (
                                <div style={styles.filePlaceholder}>
                                    <span>📎</span>
                                    <span>Click to attach guidelines (PDF, DOC)</span>
                                </div>
                            )}
                        </div>
                        <input
                            id="guidelinesFile"
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={(e) => setGuidelinesFile(e.target.files[0])}
                            style={{ display: "none" }}
                        />
                    </div>

                    <div style={styles.modalActions}>
                        <button
                            onClick={() => {
                                setShowModal(false);
                                setGuidelinesFile(null);
                            }}
                            style={styles.cancelBtn}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            style={{
                                ...styles.submitBtn,
                                background: submitting ? "#94a3b8" : "#2563eb",
                                cursor: submitting ? "not-allowed" : "pointer",
                            }}
                        >
                            {submitting ? "Creating..." : "Create Assignment"}
                        </button>
                    </div>

                </div>
            </Modal>

            {/* Delete Confirm Modal */}
            <Modal
                isOpen={!!deleteConfirm}
                onClose={() => setDeleteConfirm(null)}
                title="Confirm Delete"
                size="sm"
            >
                <div>
                    <p style={styles.confirmText}>
                        Are you sure you want to delete{" "}
                        <strong>{deleteConfirm?.title}</strong>?
                    </p>
                    <div style={styles.modalActions}>
                        <button
                            onClick={() => setDeleteConfirm(null)}
                            style={styles.cancelBtn}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => handleDelete(deleteConfirm._id)}
                            style={styles.deleteBtnModal}
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </Modal>

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
    createBtn: {
        background: "#2563eb",
        color: "#fff",
        border: "none",
        borderRadius: "8px",
        padding: "9px 16px",
        fontSize: "13px",
        fontWeight: "500",
        cursor: "pointer",
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
    deleteBtn: {
        background: "#fee2e2",
        color: "#991b1b",
        border: "none",
        borderRadius: "6px",
        padding: "5px 12px",
        fontSize: "12px",
        cursor: "pointer",
        flexShrink: 0,
    },
    metaRow: {
        display: "flex",
        alignItems: "center",
        gap: "16px",
        flexWrap: "wrap",
        paddingTop: "12px",
        borderTop: "0.5px solid #f1f5f9",
    },
    metaItem: {
        display: "flex",
        alignItems: "center",
        gap: "4px",
        fontSize: "12px",
        color: "#374151",
    },
    metaIcon: {
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
    twoCol: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "12px",
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
    fileDropZone: {
        border: "1.5px dashed #cbd5e1",
        borderRadius: "8px",
        padding: "1.25rem",
        textAlign: "center",
        cursor: "pointer",
        background: "#f8fafc",
    },
    filePlaceholder: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        color: "#64748b",
        fontSize: "13px",
    },
    fileSelected: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
    },
    fileName: {
        fontSize: "13px",
        fontWeight: "500",
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
    deleteBtnModal: {
        padding: "8px 16px",
        background: "#dc2626",
        color: "#fff",
        border: "none",
        borderRadius: "8px",
        fontSize: "13px",
        cursor: "pointer",
        fontWeight: "500",
    },
    confirmText: {
        fontSize: "14px",
        color: "#374151",
        marginBottom: "1rem",
        lineHeight: "1.6",
    },
};

export default AssignmentManagement;