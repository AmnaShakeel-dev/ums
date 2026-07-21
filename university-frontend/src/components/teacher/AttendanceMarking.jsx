import { useState, useEffect } from "react";
import teacherService from "../../services/teacherService";
import Toast from "../common/Toast";
import LoadingSpinner from "../common/LoadingSpinner";

const AttendanceMarking = () => {
    const [subjects, setSubjects] = useState([]);
    const [students, setStudents] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState("");
    const todayDisplay = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });
    const [attendance, setAttendance] = useState({});
    const [loading, setLoading] = useState(true);
    const [studentsLoading, setStudentsLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        fetchSubjects();
    }, []);

    useEffect(() => {
        if (selectedSubject) {
            fetchStudents(selectedSubject);
        }
    }, [selectedSubject]);

    const fetchSubjects = async () => {
        try {
            const res = await teacherService.getMySubjects();
            setSubjects(res.subjects);
            if (res.subjects.length > 0) {
                setSelectedSubject(res.subjects[0]._id);
            }
        } catch (error) {
            showToast("Failed to fetch subjects.", "error");
        } finally {
            setLoading(false);
        }
    };

    const fetchStudents = async (subjectId) => {
        setStudentsLoading(true);
        try {
            const res = await teacherService.getEnrolledStudents(subjectId);
            setStudents(res.students);
            // Default sab present mark karo
            const defaultAttendance = {};
            res.students.forEach((s) => {
                defaultAttendance[s._id] = "present";
            });
            setAttendance(defaultAttendance);
        } catch (error) {
            showToast("Failed to fetch students.", "error");
        } finally {
            setStudentsLoading(false);
        }
    };

    const showToast = (message, type = "success") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleStatusChange = (studentId, status) => {
        setAttendance((prev) => ({ ...prev, [studentId]: status }));
    };

    const handleMarkAll = (status) => {
        const updated = {};
        students.forEach((s) => {
            updated[s._id] = status;
        });
        setAttendance(updated);
    };

    const handleSave = async () => {
        if (!selectedSubject || students.length === 0) {
            showToast("Please select a subject with enrolled students.", "error");
            return;
        }

        setSaving(true);
        try {
            const attendanceData = students.map((s) => ({
                studentId: s._id,
                status: attendance[s._id] || "present",
            }));

            await teacherService.markAttendance(
                selectedSubject,
                null,
                attendanceData
            );
            showToast("Attendance saved successfully!");
        } catch (error) {
            showToast(
                error.response?.data?.message || "Failed to save attendance.",
                "error"
            );
        } finally {
            setSaving(false);
        }
    };

    const getCounts = () => {
        const present = Object.values(attendance).filter(
            (s) => s === "present"
        ).length;
        const absent = Object.values(attendance).filter(
            (s) => s === "absent"
        ).length;
        const late = Object.values(attendance).filter(
            (s) => s === "late"
        ).length;
        return { present, absent, late };
    };

    const counts = getCounts();

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
                    <h1 style={styles.pageTitle}>Mark Attendance</h1>
                    <p style={styles.pageSubtitle}>
                        Record daily attendance for your students
                    </p>
                </div>
            </div>

            {/* Filters Row */}
            <div style={styles.filtersRow}>
                <div style={styles.filterGroup}>
                    <label style={styles.label}>Select Subject</label>
                    <select
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        style={styles.select}
                    >
                        {subjects.map((s) => (
                            <option key={s._id} value={s._id}>
                                {s.subjectCode} — {s.subjectName}
                            </option>
                        ))}
                    </select>
                </div>

                <div style={{ flex: 1 }}>
                    <label style={styles.label}>Date (Today Only)</label>
                    <div style={{
                        ...styles.select,
                        background: "#f1f5f9",
                        color: "#1e293b",
                        fontWeight: "500",
                        display: "flex",
                        alignItems: "center",
                        padding: "0.5rem 0.75rem",
                        borderRadius: "8px",
                        border: "0.5px solid #e2e8f0",
                    }}>
                        &#x1F4C5; {todayDisplay}
                    </div>
                    {students.length > 0 && (
                        <div style={{
                            background: "#fef3c7",
                            border: "0.5px solid #fcd34d",
                            borderRadius: "8px",
                            padding: "10px 14px",
                            fontSize: "12px",
                            color: "#92400e",
                            marginBottom: "1rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                        }}>
                            &#x26A0;&#xFE0F;
                            <strong>Warning:</strong> Once you save today's attendance, it cannot be edited or changed.
                            Please review carefully before saving.
                        </div>
                    )}
                </div>
            </div>

            {/* Counts Row */}
            <div style={styles.countsRow}>
                <div style={styles.countCard}>
                    <span style={styles.countDot} />
                    <span style={styles.countLabel}>Total:</span>
                    <span style={styles.countValue}>{students.length}</span>
                </div>
                <div style={{ ...styles.countCard, background: "#dcfce7" }}>
                    <span
                        style={{ ...styles.countDot, background: "#16a34a" }}
                    />
                    <span style={{ ...styles.countLabel, color: "#15803d" }}>
                        Present:
                    </span>
                    <span style={{ ...styles.countValue, color: "#15803d" }}>
                        {counts.present}
                    </span>
                </div>
                <div style={{ ...styles.countCard, background: "#fee2e2" }}>
                    <span
                        style={{ ...styles.countDot, background: "#dc2626" }}
                    />
                    <span style={{ ...styles.countLabel, color: "#991b1b" }}>
                        Absent:
                    </span>
                    <span style={{ ...styles.countValue, color: "#991b1b" }}>
                        {counts.absent}
                    </span>
                </div>
                <div style={{ ...styles.countCard, background: "#fef9c3" }}>
                    <span
                        style={{ ...styles.countDot, background: "#ca8a04" }}
                    />
                    <span style={{ ...styles.countLabel, color: "#854d0e" }}>
                        Late:
                    </span>
                    <span style={{ ...styles.countValue, color: "#854d0e" }}>
                        {counts.late}
                    </span>
                </div>
            </div>

            {/* Mark All Buttons */}
            <div style={styles.markAllRow}>
                <span style={styles.markAllLabel}>Mark All:</span>
                {["present", "absent", "late"].map((status) => (
                    <button
                        key={status}
                        onClick={() => handleMarkAll(status)}
                        style={{
                            ...styles.markAllBtn,
                            background:
                                status === "present"
                                    ? "#dcfce7"
                                    : status === "absent"
                                        ? "#fee2e2"
                                        : "#fef9c3",
                            color:
                                status === "present"
                                    ? "#15803d"
                                    : status === "absent"
                                        ? "#991b1b"
                                        : "#854d0e",
                        }}
                    >
                        All {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                ))}
            </div>

            {/* Students Table */}
            {studentsLoading ? (
                <LoadingSpinner message="Loading students..." />
            ) : students.length === 0 ? (
                <div style={styles.emptyState}>
                    <p>No students enrolled in this subject.</p>
                </div>
            ) : (
                <div style={styles.tableContainer}>
                    <table style={styles.table}>
                        <thead>
                            <tr style={styles.tableHead}>
                                {["#", "Student Name", "Email", "Department", "Status"].map(
                                    (h) => (
                                        <th key={h} style={styles.th}>
                                            {h}
                                        </th>
                                    )
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((student, index) => (
                                <tr key={student._id} style={styles.tableRow}>
                                    <td style={styles.td}>{index + 1}</td>
                                    <td style={styles.td}>
                                        <div style={styles.studentCell}>
                                            <div style={styles.avatar}>
                                                {student.name
                                                    .split(" ")
                                                    .map((n) => n[0])
                                                    .join("")
                                                    .slice(0, 2)}
                                            </div>
                                            <span style={styles.studentName}>
                                                {student.name}
                                            </span>
                                        </div>
                                    </td>
                                    <td style={styles.td}>{student.email}</td>
                                    <td style={styles.td}>
                                        {student.department || "—"}
                                    </td>
                                    <td style={styles.td}>
                                        <div style={styles.statusBtns}>
                                            {["present", "absent", "late"].map((status) => (
                                                <button
                                                    key={status}
                                                    onClick={() =>
                                                        handleStatusChange(student._id, status)
                                                    }
                                                    style={{
                                                        ...styles.statusBtn,
                                                        background:
                                                            attendance[student._id] === status
                                                                ? status === "present"
                                                                    ? "#16a34a"
                                                                    : status === "absent"
                                                                        ? "#dc2626"
                                                                        : "#ca8a04"
                                                                : "#f1f5f9",
                                                        color:
                                                            attendance[student._id] === status
                                                                ? "#fff"
                                                                : "#64748b",
                                                        fontWeight:
                                                            attendance[student._id] === status
                                                                ? "600"
                                                                : "400",
                                                    }}
                                                >

                                                    {status.charAt(0).toUpperCase() +
                                                        status.slice(1)}
                                                </button>

                                            ))}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Save Button */}
            {students.length > 0 && (
                <div style={styles.saveRow}>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        style={{
                            ...styles.saveBtn,
                            background: saving ? "#94a3b8" : "#16a34a",
                            cursor: saving ? "not-allowed" : "pointer",
                        }}
                    >
                        {saving ? "Saving..." : "Save Attendance"}
                    </button>
                </div>
            )}

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
    filtersRow: {
        display: "flex",
        gap: "16px",
        marginBottom: "1rem",
        flexWrap: "wrap",
    },
    filterGroup: {
        display: "flex",
        flexDirection: "column",
        gap: "5px",
        flex: 1,
        minWidth: "200px",
    },
    label: {
        fontSize: "12px",
        fontWeight: "600",
        color: "#475569",
        textTransform: "uppercase",
        letterSpacing: "0.5px",
    },
    select: {
        padding: "9px 12px",
        border: "0.5px solid #e2e8f0",
        borderRadius: "8px",
        fontSize: "13px",
        outline: "none",
        background: "#fff",
        color: "#1e293b",
    },
    countsRow: {
        display: "flex",
        gap: "10px",
        marginBottom: "1rem",
        flexWrap: "wrap",
    },
    countCard: {
        display: "flex",
        alignItems: "center",
        gap: "6px",
        padding: "8px 14px",
        borderRadius: "8px",
        background: "#f1f5f9",
    },
    countDot: {
        width: "8px",
        height: "8px",
        borderRadius: "50%",
        background: "#64748b",
        flexShrink: 0,
    },
    countLabel: {
        fontSize: "12px",
        color: "#475569",
        fontWeight: "500",
    },
    countValue: {
        fontSize: "14px",
        fontWeight: "600",
        color: "#1e293b",
    },
    markAllRow: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        marginBottom: "1rem",
    },
    markAllLabel: {
        fontSize: "12px",
        fontWeight: "600",
        color: "#475569",
    },
    markAllBtn: {
        padding: "5px 12px",
        border: "none",
        borderRadius: "6px",
        fontSize: "12px",
        cursor: "pointer",
        fontWeight: "500",
    },
    tableContainer: {
        background: "#fff",
        borderRadius: "12px",
        border: "0.5px solid #e2e8f0",
        overflow: "hidden",
        marginBottom: "1rem",
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
    studentCell: {
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
    studentName: {
        fontWeight: "500",
        color: "#1e293b",
    },
    statusBtns: {
        display: "flex",
        gap: "4px",
    },
    statusBtn: {
        padding: "4px 10px",
        border: "none",
        borderRadius: "6px",
        fontSize: "11px",
        cursor: "pointer",
        transition: "all 0.15s ease",
    },
    saveRow: {
        display: "flex",
        justifyContent: "flex-end",
    },
    saveBtn: {
        color: "#fff",
        border: "none",
        borderRadius: "8px",
        padding: "10px 24px",
        fontSize: "14px",
        fontWeight: "600",
    },
    emptyState: {
        textAlign: "center",
        padding: "3rem",
        background: "#fff",
        borderRadius: "12px",
        border: "0.5px solid #e2e8f0",
        color: "#64748b",
        fontSize: "14px",
    },
};

export default AttendanceMarking;