import { useState, useEffect } from "react";
import teacherService from "../../services/teacherService";
import Modal from "../common/Modal";
import Toast from "../common/Toast";
import LoadingSpinner from "../common/LoadingSpinner";
import { timeAgo } from "../../utils/helpers";

const TeacherAnnouncements = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [toast, setToast] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [form, setForm] = useState({
        title: "",
        content: "",
        priority: "medium",
    });

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        try {
            const res = await teacherService.getMyAnnouncements();
            setAnnouncements(res.announcements);
        } catch (error) {
            showToast("Failed to fetch announcements.", "error");
        } finally {
            setLoading(false);
        }
    };

    const showToast = (message, type = "success") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleSubmit = async () => {
        if (!form.title || !form.content) {
            showToast("Please fill title and content.", "error");
            return;
        }
        try {
            await teacherService.createAnnouncement(form);
            showToast("Announcement created successfully.");
            setShowModal(false);
            setForm({ title: "", content: "", priority: "medium" });
            fetchAnnouncements();
        } catch (error) {
            showToast("Failed to create announcement.", "error");
        }
    };

    const handleDelete = async (id) => {
        try {
            await teacherService.deleteAnnouncement(id);
            showToast("Announcement deleted.");
            setDeleteConfirm(null);
            fetchAnnouncements();
        } catch (error) {
            showToast("Delete failed.", "error");
        }
    };

    const getPriorityStyle = (priority) => {
        if (priority === "high")
            return { background: "#fee2e2", color: "#991b1b" };
        if (priority === "medium")
            return { background: "#fef9c3", color: "#854d0e" };
        return { background: "#dcfce7", color: "#15803d" };
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

            <div style={styles.pageHeader}>
                <div>
                    <h1 style={styles.pageTitle}>Announcements</h1>
                    <p style={styles.pageSubtitle}>
                        Create announcements for your students
                    </p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    style={styles.createBtn}
                >
                    + New Announcement
                </button>
            </div>

            {announcements.length === 0 ? (
                <div style={styles.emptyState}>
                    <div style={styles.emptyIcon}>📢</div>
                    <p style={styles.emptyText}>No announcements yet.</p>
                    <p style={styles.emptySubtext}>
                        Create your first announcement!
                    </p>
                </div>
            ) : (
                <div style={styles.list}>
                    {announcements.map((a) => (
                        <div key={a._id} style={styles.card}>
                            <div style={styles.cardTop}>
                                <div style={styles.cardLeft}>
                                    <div style={styles.titleRow}>
                                        <h3 style={styles.annoTitle}>{a.title}</h3>
                                        <span
                                            style={{
                                                ...styles.priorityBadge,
                                                ...getPriorityStyle(a.priority),
                                            }}
                                        >
                                            {a.priority}
                                        </span>
                                    </div>
                                    <p style={styles.content}>{a.content}</p>
                                    <div style={styles.meta}>
                                        <span>By {a.createdBy?.name}</span>
                                        <span>•</span>
                                        <span>{timeAgo(a.createdAt)}</span>
                                        <span>•</span>
                                        <span>{a.readBy?.length || 0} read</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setDeleteConfirm(a)}
                                    style={styles.deleteBtn}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title="Create Announcement"
            >
                <div>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Title *</label>
                        <input
                            placeholder="Announcement title"
                            value={form.title}
                            onChange={(e) =>
                                setForm((p) => ({ ...p, title: e.target.value }))
                            }
                            style={styles.input}
                        />
                    </div>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Content *</label>
                        <textarea
                            placeholder="Write your announcement..."
                            value={form.content}
                            onChange={(e) =>
                                setForm((p) => ({ ...p, content: e.target.value }))
                            }
                            rows={4}
                            style={{ ...styles.input, resize: "none" }}
                        />
                    </div>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Priority</label>
                        <select
                            value={form.priority}
                            onChange={(e) =>
                                setForm((p) => ({ ...p, priority: e.target.value }))
                            }
                            style={styles.input}
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                    </div>
                    <div style={styles.modalActions}>
                        <button
                            onClick={() => setShowModal(false)}
                            style={styles.cancelBtn}
                        >
                            Cancel
                        </button>
                        <button onClick={handleSubmit} style={styles.submitBtn}>
                            Publish
                        </button>
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={!!deleteConfirm}
                onClose={() => setDeleteConfirm(null)}
                title="Confirm Delete"
                size="sm"
            >
                <div>
                    <p style={styles.confirmText}>
                        Delete <strong>{deleteConfirm?.title}</strong>?
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
    pageHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" },
    pageTitle: { fontSize: "22px", fontWeight: "600", color: "#1e293b", margin: 0 },
    pageSubtitle: { fontSize: "13px", color: "#64748b", marginTop: "4px" },
    createBtn: { background: "#2563eb", color: "#fff", border: "none", borderRadius: "8px", padding: "9px 16px", fontSize: "13px", fontWeight: "500", cursor: "pointer" },
    list: { display: "flex", flexDirection: "column", gap: "12px" },
    card: { background: "#fff", borderRadius: "12px", border: "0.5px solid #e2e8f0", padding: "1.25rem" },
    cardTop: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" },
    cardLeft: { flex: 1 },
    titleRow: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", flexWrap: "wrap" },
    annoTitle: { fontSize: "15px", fontWeight: "600", color: "#1e293b", margin: 0 },
    priorityBadge: { padding: "2px 8px", borderRadius: "99px", fontSize: "11px", fontWeight: "500", textTransform: "capitalize" },
    content: { fontSize: "13px", color: "#475569", lineHeight: "1.6", marginBottom: "10px" },
    meta: { display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "#94a3b8" },
    deleteBtn: { background: "#fee2e2", color: "#991b1b", border: "none", borderRadius: "6px", padding: "5px 12px", fontSize: "12px", cursor: "pointer", flexShrink: 0 },
    emptyState: { textAlign: "center", padding: "4rem 2rem", background: "#fff", borderRadius: "12px", border: "0.5px solid #e2e8f0" },
    emptyIcon: { fontSize: "48px", marginBottom: "12px" },
    emptyText: { fontSize: "16px", fontWeight: "600", color: "#1e293b", marginBottom: "4px" },
    emptySubtext: { fontSize: "13px", color: "#64748b" },
    formGroup: { marginBottom: "1rem" },
    label: { display: "block", fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.5px" },
    input: { width: "100%", padding: "9px 12px", border: "0.5px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", outline: "none", boxSizing: "border-box", background: "#fff", color: "#1e293b" },
    modalActions: { display: "flex", gap: "8px", justifyContent: "flex-end", marginTop: "1.25rem" },
    cancelBtn: { padding: "8px 16px", background: "transparent", border: "0.5px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", cursor: "pointer", color: "#374151" },
    submitBtn: { padding: "8px 16px", background: "#2563eb", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", cursor: "pointer", fontWeight: "500" },
    deleteBtnModal: { padding: "8px 16px", background: "#dc2626", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", cursor: "pointer", fontWeight: "500" },
    confirmText: { fontSize: "14px", color: "#374151", marginBottom: "1rem", lineHeight: "1.6" },
};

export default TeacherAnnouncements;