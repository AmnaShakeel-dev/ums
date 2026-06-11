import { useState, useEffect } from "react";
import adminService from "../../services/adminService";
import Modal from "../common/Modal";
import Toast from "../common/Toast";
import LoadingSpinner from "../common/LoadingSpinner";

const SubjectManagement = () => {
    const [subjects, setSubjects] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editSubject, setEditSubject] = useState(null);
    const [toast, setToast] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [form, setForm] = useState({
        subjectCode: "",
        subjectName: "",
        credits: 3,
        description: "",
        teacher: "",
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [subjectsRes, usersRes] = await Promise.all([
                adminService.getAllSubjects(),
                adminService.getAllUsers({ role: "teacher" }),
            ]);
            setSubjects(subjectsRes.subjects);
            setTeachers(usersRes.users);
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

    const handleOpenCreate = () => {
        setEditSubject(null);
        setForm({
            subjectCode: "",
            subjectName: "",
            credits: 3,
            description: "",
            teacher: "",
        });
        setShowModal(true);
    };

    const handleOpenEdit = (subject) => {
        setEditSubject(subject);
        setForm({
            subjectCode: subject.subjectCode,
            subjectName: subject.subjectName,
            credits: subject.credits,
            description: subject.description || "",
            teacher: subject.teacher?._id || "",
        });
        setShowModal(true);
    };

    const handleSubmit = async () => {
        if (!form.subjectCode || !form.subjectName || !form.credits) {
            showToast("Please fill all required fields.", "error");
            return;
        }

        try {
            if (editSubject) {
                await adminService.updateSubject(editSubject._id, form);
                showToast("Subject updated successfully.");
            } else {
                await adminService.createSubject(form);
                showToast("Subject created successfully.");
            }
            setShowModal(false);
            fetchData();
        } catch (error) {
            showToast(
                error.response?.data?.message || "Operation failed.",
                "error"
            );
        }
    };

    const handleDelete = async (id) => {
        try {
            await adminService.deleteSubject(id);
            showToast("Subject deleted successfully.");
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
                    <h1 style={styles.pageTitle}>Subject Management</h1>
                    <p style={styles.pageSubtitle}>
                        Manage university subjects and assign teachers
                    </p>
                </div>
                <button onClick={handleOpenCreate} style={styles.createBtn}>
                    + Add Subject
                </button>
            </div>

            {/* Subjects Grid */}
            <div style={styles.grid}>
                {subjects.length === 0 ? (
                    <div style={styles.emptyState}>
                        <p>No subjects found. Create one!</p>
                    </div>
                ) : (
                    subjects.map((subject) => (
                        <div key={subject._id} style={styles.card}>

                            {/* Card Top */}
                            <div style={styles.cardTop}>
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

                            {/* Teacher */}
                            <div style={styles.teacherRow}>
                                <span style={styles.teacherIcon}>👨‍🏫</span>
                                <span style={styles.teacherName}>
                                    {subject.teacher?.name || "No teacher assigned"}
                                </span>
                            </div>

                            {/* Actions */}
                            <div style={styles.cardActions}>
                                <button
                                    onClick={() => handleOpenEdit(subject)}
                                    style={styles.editBtn}
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => setDeleteConfirm(subject)}
                                    style={styles.deleteBtn}
                                >
                                    Delete
                                </button>
                            </div>

                        </div>
                    ))
                )}
            </div>

            {/* Create / Edit Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editSubject ? "Edit Subject" : "Add New Subject"}
            >
                <div>
                    {/* Subject Code */}
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Subject Code *</label>
                        <input
                            placeholder="CS101"
                            value={form.subjectCode}
                            onChange={(e) =>
                                setForm((p) => ({
                                    ...p,
                                    subjectCode: e.target.value.toUpperCase(),
                                }))
                            }
                            style={styles.input}
                        />
                    </div>

                    {/* Subject Name */}
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Subject Name *</label>
                        <input
                            placeholder="Data Structures"
                            value={form.subjectName}
                            onChange={(e) =>
                                setForm((p) => ({ ...p, subjectName: e.target.value }))
                            }
                            style={styles.input}
                        />
                    </div>

                    {/* Credits */}
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Credits *</label>
                        <select
                            value={form.credits}
                            onChange={(e) =>
                                setForm((p) => ({ ...p, credits: Number(e.target.value) }))
                            }
                            style={styles.input}
                        >
                            {[1, 2, 3, 4, 5, 6].map((c) => (
                                <option key={c} value={c}>
                                    {c} Credit{c > 1 ? "s" : ""}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Assign Teacher */}
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Assign Teacher</label>
                        <select
                            value={form.teacher}
                            onChange={(e) =>
                                setForm((p) => ({ ...p, teacher: e.target.value }))
                            }
                            style={styles.input}
                        >
                            <option value="">-- Select Teacher --</option>
                            {teachers.map((t) => (
                                <option key={t._id} value={t._id}>
                                    {t.name} — {t.department || "No dept"}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Description */}
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Description</label>
                        <textarea
                            placeholder="Brief subject description..."
                            value={form.description}
                            onChange={(e) =>
                                setForm((p) => ({ ...p, description: e.target.value }))
                            }
                            rows={3}
                            style={{ ...styles.input, resize: "none" }}
                        />
                    </div>

                    <div style={styles.modalActions}>
                        <button
                            onClick={() => setShowModal(false)}
                            style={styles.cancelBtn}
                        >
                            Cancel
                        </button>
                        <button onClick={handleSubmit} style={styles.submitBtn}>
                            {editSubject ? "Update Subject" : "Add Subject"}
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
                        <strong>{deleteConfirm?.subjectName}</strong>?
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
    },
    cardTop: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "10px",
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
    },
    subjectName: {
        fontSize: "15px",
        fontWeight: "600",
        color: "#1e293b",
        margin: "0 0 6px 0",
    },
    description: {
        fontSize: "12px",
        color: "#64748b",
        marginBottom: "10px",
        lineHeight: "1.5",
    },
    teacherRow: {
        display: "flex",
        alignItems: "center",
        gap: "6px",
        marginBottom: "12px",
    },
    teacherIcon: {
        fontSize: "14px",
    },
    teacherName: {
        fontSize: "12px",
        color: "#475569",
    },
    cardActions: {
        display: "flex",
        gap: "8px",
        borderTop: "0.5px solid #f1f5f9",
        paddingTop: "12px",
    },
    editBtn: {
        flex: 1,
        background: "#dbeafe",
        color: "#1e40af",
        border: "none",
        borderRadius: "6px",
        padding: "6px",
        fontSize: "12px",
        cursor: "pointer",
        fontWeight: "500",
    },
    deleteBtn: {
        flex: 1,
        background: "#fee2e2",
        color: "#991b1b",
        border: "none",
        borderRadius: "6px",
        padding: "6px",
        fontSize: "12px",
        cursor: "pointer",
        fontWeight: "500",
    },
    emptyState: {
        textAlign: "center",
        padding: "3rem",
        color: "#64748b",
        fontSize: "14px",
        gridColumn: "1 / -1",
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
        background: "#2563eb",
        color: "#fff",
        border: "none",
        borderRadius: "8px",
        fontSize: "13px",
        cursor: "pointer",
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

export default SubjectManagement;