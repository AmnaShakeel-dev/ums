import { useState, useEffect } from "react";
import teacherService from "../../services/teacherService";
import Toast from "../common/Toast";
import LoadingSpinner from "../common/LoadingSpinner";
import Modal from "../common/Modal";
import { formatDate, getFileIcon } from "../../utils/helpers";

const LectureUpload = () => {
    const [lectures, setLectures] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [toast, setToast] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [form, setForm] = useState({
        title: "",
        description: "",
        subjectId: "",
    });
    const [file, setFile] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [lecturesRes, subjectsRes] = await Promise.all([
                teacherService.getMyLectures(),
                teacherService.getMySubjects(),
            ]);
            setLectures(lecturesRes.lectures);
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

    const handleUpload = async () => {
        if (!form.title || !form.subjectId || !file) {
            showToast("Please fill title, subject and select a file.", "error");
            return;
        }

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("title", form.title);
            formData.append("description", form.description);
            formData.append("subjectId", form.subjectId);
            formData.append("file", file);

            await teacherService.uploadLecture(formData);
            showToast("Lecture uploaded successfully!");
            setShowModal(false);
            setForm({ title: "", description: "", subjectId: subjects[0]?._id || "" });
            setFile(null);
            fetchData();
        } catch (error) {
            showToast(
                error.response?.data?.message || "Upload failed.",
                "error"
            );
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await teacherService.deleteLecture(id);
            showToast("Lecture deleted.");
            setDeleteConfirm(null);
            fetchData();
        } catch (error) {
            showToast("Delete failed.", "error");
        }
    };

    const getFileTypeStyle = (fileType) => {
        const styles = {
            pdf: { background: "#fee2e2", color: "#991b1b" },
            ppt: { background: "#fff7ed", color: "#c2410c" },
            pptx: { background: "#fff7ed", color: "#c2410c" },
            doc: { background: "#dbeafe", color: "#1e40af" },
            docx: { background: "#dbeafe", color: "#1e40af" },
            mp4: { background: "#f0fdf4", color: "#15803d" },
            mkv: { background: "#f0fdf4", color: "#15803d" },
        };
        return styles[fileType] || { background: "#f1f5f9", color: "#475569" };
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
                    <h1 style={styles.pageTitle}>Lectures</h1>
                    <p style={styles.pageSubtitle}>
                        Upload and manage your lecture materials
                    </p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    style={styles.uploadBtn}
                >
                    + Upload Lecture
                </button>
            </div>

            {/* Lectures List */}
            {lectures.length === 0 ? (
                <div style={styles.emptyState}>
                    <div style={styles.emptyIcon}>📁</div>
                    <p style={styles.emptyText}>No lectures uploaded yet.</p>
                    <p style={styles.emptySubtext}>
                        Upload your first lecture material!
                    </p>
                </div>
            ) : (
                <div style={styles.lecturesList}>
                    {lectures.map((lecture) => (
                        <div key={lecture._id} style={styles.lectureCard}>

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
                                <div style={styles.lectureTitle}>{lecture.title}</div>
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
                                        {lecture.subject?.subjectCode} —{" "}
                                        {lecture.subject?.subjectName}
                                    </span>
                                    <span>Uploaded: {formatDate(lecture.createdAt)}</span>
                                    <span>⬇ {lecture.downloadCount || 0} downloads</span>
                                </div>
                            </div>

                            {/* Delete Button */}
                            <button
                                onClick={() => setDeleteConfirm(lecture)}
                                style={styles.deleteBtn}
                            >
                                Delete
                            </button>

                        </div>
                    ))}
                </div>
            )}

            {/* Upload Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title="Upload Lecture"
            >
                <div>

                    {/* Title */}
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Title *</label>
                        <input
                            placeholder="Lecture title"
                            value={form.title}
                            onChange={(e) =>
                                setForm((p) => ({ ...p, title: e.target.value }))
                            }
                            style={styles.input}
                        />
                    </div>

                    {/* Description */}
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Description</label>
                        <textarea
                            placeholder="Brief description of the lecture..."
                            value={form.description}
                            onChange={(e) =>
                                setForm((p) => ({ ...p, description: e.target.value }))
                            }
                            rows={3}
                            style={{ ...styles.input, resize: "none" }}
                        />
                    </div>

                    {/* Subject */}
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Subject *</label>
                        <select
                            value={form.subjectId}
                            onChange={(e) =>
                                setForm((p) => ({ ...p, subjectId: e.target.value }))
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

                    {/* File Upload */}
                    <div style={styles.formGroup}>
                        <label style={styles.label}>File *</label>
                        <div
                            style={styles.fileDropZone}
                            onClick={() =>
                                document.getElementById("lectureFile").click()
                            }
                        >
                            {file ? (
                                <div style={styles.fileSelected}>
                                    <span style={styles.fileSelectedIcon}>✅</span>
                                    <span style={styles.fileSelectedName}>
                                        {file.name}
                                    </span>
                                    <span style={styles.fileSelectedSize}>
                                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                    </span>
                                </div>
                            ) : (
                                <div style={styles.filePlaceholder}>
                                    <span style={styles.fileUploadIcon}>📎</span>
                                    <span>Click to select file</span>
                                    <span style={styles.fileHint}>
                                        PDF, PPT, PPTX, DOC, DOCX, MP4, MKV (max 10MB)
                                    </span>
                                </div>
                            )}
                        </div>
                        <input
                            id="lectureFile"
                            type="file"
                            accept=".pdf,.ppt,.pptx,.doc,.docx,.mp4,.mkv"
                            onChange={(e) => setFile(e.target.files[0])}
                            style={{ display: "none" }}
                        />
                    </div>

                    <div style={styles.modalActions}>
                        <button
                            onClick={() => {
                                setShowModal(false);
                                setFile(null);
                            }}
                            style={styles.cancelBtn}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleUpload}
                            disabled={uploading}
                            style={{
                                ...styles.submitBtn,
                                background: uploading ? "#94a3b8" : "#2563eb",
                                cursor: uploading ? "not-allowed" : "pointer",
                            }}
                        >
                            {uploading ? "Uploading..." : "Upload Lecture"}
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
    uploadBtn: {
        background: "#2563eb",
        color: "#fff",
        border: "none",
        borderRadius: "8px",
        padding: "9px 16px",
        fontSize: "13px",
        fontWeight: "500",
        cursor: "pointer",
    },
    lecturesList: {
        display: "flex",
        flexDirection: "column",
        gap: "12px",
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
    fileIcon: {
        width: "48px",
        height: "48px",
        borderRadius: "10px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "22px",
        flexShrink: 0,
    },
    lectureInfo: {
        flex: 1,
    },
    lectureTitle: {
        fontSize: "14px",
        fontWeight: "600",
        color: "#1e293b",
        marginBottom: "4px",
    },
    lectureDesc: {
        fontSize: "12px",
        color: "#64748b",
        marginBottom: "6px",
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
        padding: "1.5rem",
        textAlign: "center",
        cursor: "pointer",
        background: "#f8fafc",
        transition: "all 0.2s ease",
    },
    filePlaceholder: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "6px",
        color: "#64748b",
        fontSize: "13px",
    },
    fileUploadIcon: {
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
    fileSelectedIcon: {
        fontSize: "18px",
    },
    fileSelectedName: {
        fontSize: "13px",
        fontWeight: "500",
        color: "#1e293b",
    },
    fileSelectedSize: {
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

export default LectureUpload;