import { useState, useEffect } from "react";
import adminService from "../../services/adminService";
import Modal from "../common/Modal";
import Toast from "../common/Toast";
import LoadingSpinner from "../common/LoadingSpinner";
import { formatDate } from "../../utils/helpers";

const EnrollmentManagement = () => {
    const [enrollments, setEnrollments] = useState([]);
    const [students, setStudents] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [toast, setToast] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [search, setSearch] = useState("");
    const [form, setForm] = useState({
        studentId: "",
        subjectId: "",
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [enrollRes, usersRes, subjectsRes] = await Promise.all([
                adminService.getAllEnrollments(),
                adminService.getAllUsers({ role: "student" }),
                adminService.getAllSubjects(),
            ]);
            setEnrollments(enrollRes.enrollments);
            setStudents(usersRes.users);
            setSubjects(subjectsRes.subjects);
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

    const handleEnroll = async () => {
        if (!form.studentId || !form.subjectId) {
            showToast("Please select student and subject.", "error");
            return;
        }

        try {
            await adminService.enrollStudent(form.studentId, form.subjectId);
            showToast("Student enrolled successfully.");
            setShowModal(false);
            setForm({ studentId: "", subjectId: "" });
            fetchData();
        } catch (error) {
            showToast(
                error.response?.data?.message || "Enrollment failed.",
                "error"
            );
        }
    };

    const handleRemove = async (id) => {
        try {
            await adminService.removeEnrollment(id);
            showToast("Enrollment removed successfully.");
            setDeleteConfirm(null);
            fetchData();
        } catch (error) {
            showToast("Remove failed.", "error");
        }
    };

    const filteredEnrollments = enrollments.filter((e) => {
        const studentName = e.student?.name?.toLowerCase() || "";
        const subjectName = e.subject?.subjectName?.toLowerCase() || "";
        const subjectCode = e.subject?.subjectCode?.toLowerCase() || "";
        const s = search.toLowerCase();
        return (
            studentName.includes(s) ||
            subjectName.includes(s) ||
            subjectCode.includes(s)
        );
    });

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
                    <h1 style={styles.pageTitle}>Enrollment Management</h1>
                    <p style={styles.pageSubtitle}>
                        Manage student enrollments in subjects
                    </p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    style={styles.createBtn}
                >
                    + Enroll Student
                </button>
            </div>

            {/* Stats Row */}
            <div style={styles.statsRow}>
                <div style={styles.statCard}>
                    <div style={styles.statIcon}>📋</div>
                    <div>
                        <p style={styles.statLabel}>Total Enrollments</p>
                        <h3 style={styles.statValue}>{enrollments.length}</h3>
                    </div>
                </div>
                <div style={styles.statCard}>
                    <div style={{ ...styles.statIcon, background: "#ecfdf5", color: "#16a34a" }}>👨‍🎓</div>
                    <div>
                        <p style={styles.statLabel}>Total Students</p>
                        <h3 style={styles.statValue}>{students.length}</h3>
                    </div>
                </div>
                <div style={styles.statCard}>
                    <div style={{ ...styles.statIcon, background: "#fffbeb", color: "#d97706" }}>📚</div>
                    <div>
                        <p style={styles.statLabel}>Total Subjects</p>
                        <h3 style={styles.statValue}>{subjects.length}</h3>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div style={styles.searchBox}>
                <span style={styles.searchIcon}>🔍</span>
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by student name, subject..."
                    style={styles.searchInput}
                />
            </div>

            {/* Enrollments Table */}
            <div style={styles.tableContainer}>
                <table style={styles.table}>
                    <thead>
                        <tr style={styles.tableHead}>
                            {[
                                "Student",
                                "Email",
                                "Subject Code",
                                "Subject Name",
                                "Credits",
                                "Enrolled On",
                                "Action",
                            ].map((h) => (
                                <th key={h} style={styles.th}>
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredEnrollments.length === 0 ? (
                            <tr>
                                <td colSpan={7} style={styles.emptyState}>
                                    No enrollments found.
                                </td>
                            </tr>
                        ) : (
                            filteredEnrollments.map((e) => (
                                <tr key={e._id} style={styles.tableRow}>
                                    <td style={styles.td}>
                                        <div style={styles.userCell}>
                                            <div style={styles.avatar}>
                                                {e.student?.name
                                                    ?.split(" ")
                                                    .map((n) => n[0])
                                                    .join("")
                                                    .slice(0, 2)}
                                            </div>
                                            <span style={styles.userName}>
                                                {e.student?.name}
                                            </span>
                                        </div>
                                    </td>
                                    <td style={styles.td}>{e.student?.email}</td>
                                    <td style={styles.td}>
                                        <span style={styles.codeTag}>
                                            {e.subject?.subjectCode}
                                        </span>
                                    </td>
                                    <td style={styles.td}>{e.subject?.subjectName}</td>
                                    <td style={styles.td}>
                                        {e.subject?.credits} cr
                                    </td>
                                    <td style={styles.td}>
                                        {formatDate(e.enrollmentDate)}
                                    </td>
                                    <td style={styles.td}>
                                        <button
                                            onClick={() => setDeleteConfirm(e)}
                                            style={styles.removeBtn}
                                        >
                                            Remove
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Enroll Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title="Enroll Student in Subject"
            >
                <div>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Select Student *</label>
                        <select
                            value={form.studentId}
                            onChange={(e) =>
                                setForm((p) => ({ ...p, studentId: e.target.value }))
                            }
                            style={styles.input}
                        >
                            <option value="">-- Select Student --</option>
                            {students.map((s) => (
                                <option key={s._id} value={s._id}>
                                    {s.name} — {s.email}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Select Subject *</label>
                        <select
                            value={form.subjectId}
                            onChange={(e) =>
                                setForm((p) => ({ ...p, subjectId: e.target.value }))
                            }
                            style={styles.input}
                        >
                            <option value="">-- Select Subject --</option>
                            {subjects.map((s) => (
                                <option key={s._id} value={s._id}>
                                    {s.subjectCode} — {s.subjectName}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div style={styles.modalActions}>
                        <button
                            onClick={() => setShowModal(false)}
                            style={styles.cancelBtn}
                        >
                            Cancel
                        </button>
                        <button onClick={handleEnroll} style={styles.submitBtn}>
                            Enroll Student
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Delete Confirm Modal */}
            <Modal
                isOpen={!!deleteConfirm}
                onClose={() => setDeleteConfirm(null)}
                title="Confirm Remove"
                size="sm"
            >
                <div>
                    <p style={styles.confirmText}>
                        Remove <strong>{deleteConfirm?.student?.name}</strong> from{" "}
                        <strong>{deleteConfirm?.subject?.subjectName}</strong>?
                    </p>
                    <div style={styles.modalActions}>
                        <button
                            onClick={() => setDeleteConfirm(null)}
                            style={styles.cancelBtn}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => handleRemove(deleteConfirm._id)}
                            style={styles.deleteBtnModal}
                        >
                            Remove
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
    statsRow: {
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
        background: "#eff6ff",
        color: "#2563eb",
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
    searchBox: {
        position: "relative",
        marginBottom: "1rem",
    },
    searchIcon: {
        position: "absolute",
        left: "10px",
        top: "50%",
        transform: "translateY(-50%)",
        fontSize: "14px",
    },
    searchInput: {
        width: "100%",
        padding: "9px 12px 9px 34px",
        border: "0.5px solid #e2e8f0",
        borderRadius: "8px",
        fontSize: "13px",
        outline: "none",
        boxSizing: "border-box",
        background: "#fff",
    },
    tableContainer: {
        background: "#fff",
        borderRadius: "12px",
        border: "0.5px solid #e2e8f0",
        overflow: "hidden",
    },
    table: {
        width: "100%",
        borderCollapse: "collapse",
    },
    tableHead: {
        background: "#f8fafc",
    },
    th: {
        padding: "10px 16px",
        textAlign: "left",
        fontSize: "11px",
        fontWeight: "600",
        color: "#64748b",
        textTransform: "uppercase",
        letterSpacing: "0.5px",
        borderBottom: "0.5px solid #e2e8f0",
    },
    tableRow: {
        borderBottom: "0.5px solid #f1f5f9",
    },
    td: {
        padding: "12px 16px",
        fontSize: "13px",
        color: "#374151",
    },
    userCell: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
    },
    avatar: {
        width: "32px",
        height: "32px",
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
    userName: {
        fontWeight: "500",
        color: "#1e293b",
    },
    codeTag: {
        background: "#dbeafe",
        color: "#1e40af",
        padding: "3px 8px",
        borderRadius: "6px",
        fontSize: "12px",
        fontWeight: "600",
    },
    removeBtn: {
        background: "#fee2e2",
        color: "#991b1b",
        border: "none",
        borderRadius: "6px",
        padding: "4px 10px",
        fontSize: "12px",
        cursor: "pointer",
    },
    emptyState: {
        textAlign: "center",
        padding: "2rem",
        color: "#64748b",
        fontSize: "13px",
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

export default EnrollmentManagement;