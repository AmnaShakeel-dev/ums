import { useState, useEffect } from "react";
import gradeService from "../../services/gradeService";
import Toast from "../common/Toast";
import LoadingSpinner from "../common/LoadingSpinner";
import Modal from "../common/Modal";

const COMPONENTS = [
    { key: "assignment", label: "Assignment" },
    { key: "quiz", label: "Quiz" },
    { key: "mid", label: "Mid Exam" },
    { key: "final", label: "Final Exam" },
];

const GradeBadge = ({ grade }) => {
    const color =
        grade === "A+" || grade === "A" || grade === "A-" ? "#15803d" :
            grade === "B+" || grade === "B" || grade === "B-" ? "#1e40af" :
                grade === "C+" || grade === "C" || grade === "C-" ? "#92400e" :
                    grade === "D" ? "#c2410c" :
                        grade === "F" ? "#991b1b" : "#475569";
    const bg =
        grade === "A+" || grade === "A" || grade === "A-" ? "#dcfce7" :
            grade === "B+" || grade === "B" || grade === "B-" ? "#dbeafe" :
                grade === "C+" || grade === "C" || grade === "C-" ? "#fef3c7" :
                    grade === "D" ? "#ffedd5" :
                        grade === "F" ? "#fee2e2" : "#f1f5f9";
    return (
        <span style={{ background: bg, color, padding: "2px 10px", borderRadius: 99, fontSize: 12, fontWeight: 600 }}>
            {grade}
        </span>
    );
};

const TeacherGrades = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [gradeData, setGradeData] = useState(null);
    const [gradeLoading, setGradeLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const [saving, setSaving] = useState(false);
    const [search, setSearch] = useState("");
    const [showDetail, setShowDetail] = useState(false);
    const [detailData, setDetailData] = useState(null);
    const [analyticsData, setAnalyticsData] = useState(null);
    const [showAnalytics, setShowAnalytics] = useState(false);
    const [activeTab, setActiveTab] = useState("grades"); // grades | search | analytics

    const [form, setForm] = useState({
        assignment: { totalMarks: "", obtainedMarks: "" },
        quiz: { totalMarks: "", obtainedMarks: "" },
        mid: { totalMarks: "", obtainedMarks: "" },
        final: { totalMarks: "", obtainedMarks: "" },
    });

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const res = await gradeService.getSubjectsWithStudents();
            setData(res.data || []);
        } catch { showToast("Failed to fetch data.", "error"); }
        finally { setLoading(false); }
    };

    const showToast = (message, type = "success") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3500);
    };

    const fetchStudentGrade = async (student, subject) => {
        setSelectedStudent(student);
        setSelectedSubject(subject);
        setGradeLoading(true);
        setGradeData(null);
        try {
            const res = await gradeService.getStudentGradeForTeacher(student._id, subject._id);
            setGradeData(res);
            // Pre-fill form if grade exists
            const g = res.grade;
            if (g) {
                setForm({
                    assignment: { totalMarks: g.assignment?.totalMarks || "", obtainedMarks: g.assignment?.obtainedMarks || "" },
                    quiz: { totalMarks: g.quiz?.totalMarks || "", obtainedMarks: g.quiz?.obtainedMarks || "" },
                    mid: { totalMarks: g.mid?.totalMarks || "", obtainedMarks: g.mid?.obtainedMarks || "" },
                    final: { totalMarks: g.final?.totalMarks || "", obtainedMarks: g.final?.obtainedMarks || "" },
                });
            } else {
                setForm({
                    assignment: { totalMarks: "", obtainedMarks: "" },
                    quiz: { totalMarks: "", obtainedMarks: "" },
                    mid: { totalMarks: "", obtainedMarks: "" },
                    final: { totalMarks: "", obtainedMarks: "" },
                });
            }
        } catch { showToast("Failed to fetch grades.", "error"); }
        finally { setGradeLoading(false); }
    };

    const handleSaveComponent = async (component) => {
        const { totalMarks, obtainedMarks } = form[component];
        if (totalMarks === "" || obtainedMarks === "") {
            return showToast("Please enter both total and obtained marks.", "error");
        }
        if (Number(obtainedMarks) > Number(totalMarks)) {
            return showToast("Obtained marks cannot exceed total marks.", "error");
        }
        if (Number(obtainedMarks) < 0 || Number(totalMarks) < 0) {
            return showToast("Marks cannot be negative.", "error");
        }
        setSaving(true);
        try {
            const res = await gradeService.enterGrade({
                studentId: selectedStudent._id,
                subjectId: selectedSubject._id,
                component,
                totalMarks: Number(totalMarks),
                obtainedMarks: Number(obtainedMarks),
            });
            showToast(res.message || "Saved!");
            fetchStudentGrade(selectedStudent, selectedSubject);
        } catch (e) {
            showToast(e.response?.data?.message || "Save failed.", "error");
        } finally { setSaving(false); }
    };

    const handleLock = async () => {
        if (!selectedSubject) return;
        if (!window.confirm("Lock all grades for this subject? This cannot be undone by you.")) return;
        try {
            const res = await gradeService.lockGrades(selectedSubject._id);
            showToast(res.message);
            fetchStudentGrade(selectedStudent, selectedSubject);
        } catch (e) {
            showToast(e.response?.data?.message || "Lock failed.", "error");
        }
    };

    const handleOpenDetail = async (studentId) => {
        try {
            const res = await gradeService.getStudentDetail(studentId);
            setDetailData(res);
            setShowDetail(true);
        } catch (e) {
            showToast("Failed to load student detail.", "error");
        }
    };

    const handleLoadAnalytics = async () => {
        if (!selectedSubject) return;
        try {
            const res = await gradeService.getTeacherSubjectAnalytics(selectedSubject._id);
            setAnalyticsData(res.analytics);
            setShowAnalytics(true);
        } catch { showToast("Failed to load analytics.", "error"); }
    };

    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const handleSearch = async (q) => {
        setSearchQuery(q);
        if (q.length < 2) { setSearchResults([]); return; }
        try {
            const res = await gradeService.searchStudents(q);
            setSearchResults(res.students || []);
        } catch { setSearchResults([]); }
    };

    const filteredStudents = (students) =>
        students.filter((s) => {
            const q = search.toLowerCase();
            return (
                s.name?.toLowerCase().includes(q) ||
                s.email?.toLowerCase().includes(q) ||
                s.rollNumber?.toLowerCase().includes(q) ||
                s.registrationNumber?.toLowerCase().includes(q)
            );
        });

    if (loading) return <LoadingSpinner />;

    const isLocked = gradeData?.grade?.isLocked;

    return (
        <div>
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* Page Header */}
            <div style={styles.pageHeader}>
                <div>
                    <h1 style={styles.pageTitle}>Grades Management</h1>
                    <p style={styles.pageSubtitle}>Enter and manage student grades by subject</p>
                </div>
            </div>

            {/* Tab Bar */}
            <div style={styles.tabBar}>
                {[
                    { key: "grades", label: "Enter Grades" },
                    { key: "search", label: "Search Students" },
                ].map((tab) => (
                    <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                        style={{
                            ...styles.tabBtn,
                            background: activeTab === tab.key ? "#2563eb" : "#fff",
                            color: activeTab === tab.key ? "#fff" : "#64748b",
                            border: activeTab === tab.key ? "0.5px solid #2563eb" : "0.5px solid #e2e8f0",
                        }}>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ─── TAB: ENTER GRADES ─── */}
            {activeTab === "grades" && (
                <div style={styles.twoCol}>

                    {/* Left: Subject + Student list */}
                    <div style={styles.leftPanel}>
                        {data.map((item) => (
                            <div key={item.subject._id} style={styles.subjectBlock}>
                                {/* Subject header */}
                                <div style={styles.subjectHeader}
                                    onClick={() => setSelectedSubject(
                                        selectedSubject?._id === item.subject._id ? null : item.subject
                                    )}>
                                    <span style={styles.subjectCode}>{item.subject.subjectCode}</span>
                                    <span style={styles.subjectName}>{item.subject.subjectName}</span>
                                    <span style={styles.chevron}>
                                        {selectedSubject?._id === item.subject._id ? "▲" : "▼"}
                                    </span>
                                </div>

                                {selectedSubject?._id === item.subject._id && (
                                    <div>
                                        {/* Search within subject */}
                                        <input
                                            placeholder="Search student..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            style={styles.searchInput}
                                        />
                                        {item.students.length === 0 ? (
                                            <p style={styles.emptyText}>No enrolled students.</p>
                                        ) : (
                                            filteredStudents(item.students).map((s) => (
                                                <div
                                                    key={s._id}
                                                    onClick={() => fetchStudentGrade(s, item.subject)}
                                                    style={{
                                                        ...styles.studentRow,
                                                        background: selectedStudent?._id === s._id ? "#eff6ff" : "#fff",
                                                        borderLeft: selectedStudent?._id === s._id
                                                            ? "3px solid #2563eb" : "3px solid transparent",
                                                    }}>
                                                    <div style={styles.avatar}>
                                                        {s.name?.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                                                    </div>
                                                    <div>
                                                        <div style={styles.studentName}>{s.name}</div>
                                                        <div style={styles.studentEmail}>{s.email}</div>
                                                    </div>
                                                </div>
                                            ))
                                        )}

                                        {/* Lock + Analytics buttons */}
                                        <div style={{ display: "flex", gap: 8, padding: "8px 12px" }}>
                                            <button onClick={handleLock} style={styles.lockBtn}>
                                                🔒 Lock All Grades
                                            </button>
                                            <button onClick={handleLoadAnalytics} style={styles.analyticsBtn}>
                                                📊 Analytics
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Right: Grade Entry Panel */}
                    <div style={styles.rightPanel}>
                        {!selectedStudent ? (
                            <div style={styles.emptyRight}>
                                <div style={{ fontSize: 40, marginBottom: 12 }}>📝</div>
                                <p style={{ fontSize: 14, color: "#64748b" }}>
                                    Select a subject and student to enter grades.
                                </p>
                            </div>
                        ) : gradeLoading ? (
                            <LoadingSpinner message="Loading grades..." />
                        ) : (
                            <div>
                                {/* Student info */}
                                <div style={styles.studentInfoBar}>
                                    <div style={styles.bigAvatar}>
                                        {selectedStudent.name?.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: 15, fontWeight: 600 }}>{selectedStudent.name}</div>
                                        <div style={{ fontSize: 12, color: "#64748b" }}>{selectedStudent.email}</div>
                                        <div style={{ fontSize: 12, color: "#64748b" }}>{selectedStudent.department}</div>
                                    </div>
                                    <button onClick={() => handleOpenDetail(selectedStudent._id)}
                                        style={styles.detailBtn}>
                                        View Full Profile →
                                    </button>
                                    {isLocked && (
                                        <span style={styles.lockedBadge}>🔒 Locked</span>
                                    )}
                                </div>

                                {/* Attendance mini-summary */}
                                {gradeData?.attendance && (
                                    <div style={styles.attBar}>
                                        <span>📅 Attendance:</span>
                                        <span style={{
                                            color: gradeData.attendance.percentage >= 75 ? "#15803d" :
                                                gradeData.attendance.percentage >= 60 ? "#92400e" : "#991b1b",
                                            fontWeight: 600,
                                        }}>
                                            {gradeData.attendance.percentage}%
                                        </span>
                                        <span style={{ color: "#64748b", fontSize: 12 }}>
                                            ({gradeData.attendance.present}/{gradeData.attendance.total} classes)
                                        </span>
                                    </div>
                                )}

                                {/* Grade components */}
                                {COMPONENTS.map((comp) => {
                                    const existing = gradeData?.grade?.[comp.key];
                                    return (
                                        <div key={comp.key} style={styles.compCard}>
                                            <div style={styles.compHeader}>
                                                <span style={styles.compLabel}>{comp.label}</span>
                                                {existing?.isEntered && (
                                                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                                        <GradeBadge grade={existing.grade} />
                                                        <span style={{
                                                            fontSize: 12,
                                                            color: existing.percentage >= 50 ? "#15803d" : "#991b1b",
                                                            fontWeight: 500,
                                                        }}>
                                                            {existing.percentage}%
                                                        </span>
                                                        <span style={{
                                                            fontSize: 11,
                                                            background: existing.percentage >= 50 ? "#dcfce7" : "#fee2e2",
                                                            color: existing.percentage >= 50 ? "#15803d" : "#991b1b",
                                                            padding: "2px 8px", borderRadius: 99,
                                                        }}>
                                                            {existing.percentage >= 50 ? "Pass" : "Fail"}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {!isLocked ? (
                                                <div style={styles.compInputRow}>
                                                    <div style={styles.inputGroup}>
                                                        <label style={styles.inputLabel}>Total Marks</label>
                                                        <input
                                                            type="number" min="0"
                                                            placeholder="e.g. 50"
                                                            value={form[comp.key].totalMarks}
                                                            onChange={(e) =>
                                                                setForm((p) => ({
                                                                    ...p,
                                                                    [comp.key]: { ...p[comp.key], totalMarks: e.target.value },
                                                                }))
                                                            }
                                                            style={styles.markInput}
                                                        />
                                                    </div>
                                                    <div style={styles.inputGroup}>
                                                        <label style={styles.inputLabel}>Obtained Marks</label>
                                                        <input
                                                            type="number" min="0"
                                                            placeholder="e.g. 42"
                                                            value={form[comp.key].obtainedMarks}
                                                            onChange={(e) =>
                                                                setForm((p) => ({
                                                                    ...p,
                                                                    [comp.key]: { ...p[comp.key], obtainedMarks: e.target.value },
                                                                }))
                                                            }
                                                            style={styles.markInput}
                                                        />
                                                    </div>
                                                    <button
                                                        onClick={() => handleSaveComponent(comp.key)}
                                                        disabled={saving}
                                                        style={{
                                                            ...styles.saveCompBtn,
                                                            background: saving ? "#94a3b8" : "#2563eb",
                                                        }}>
                                                        {saving ? "..." : "Save"}
                                                    </button>
                                                </div>
                                            ) : (
                                                <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 6 }}>
                                                    {existing?.isEntered
                                                        ? `${existing.obtainedMarks} / ${existing.totalMarks}`
                                                        : "Not entered"}
                                                    {" "}<span style={{ color: "#dc2626" }}>🔒 Locked</span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}

                                {/* Overall summary */}
                                {gradeData?.grade?.totalMarks > 0 && (
                                    <div style={styles.overallCard}>
                                        <div style={styles.overallTitle}>Overall Result</div>
                                        <div style={styles.overallGrid}>
                                            <div style={styles.overallItem}>
                                                <span style={styles.overallLabel}>Total Marks</span>
                                                <span style={styles.overallValue}>{gradeData.grade.totalMarks}</span>
                                            </div>
                                            <div style={styles.overallItem}>
                                                <span style={styles.overallLabel}>Obtained</span>
                                                <span style={styles.overallValue}>{gradeData.grade.obtainedMarks}</span>
                                            </div>
                                            <div style={styles.overallItem}>
                                                <span style={styles.overallLabel}>Percentage</span>
                                                <span style={styles.overallValue}>{gradeData.grade.overallPercentage}%</span>
                                            </div>
                                            <div style={styles.overallItem}>
                                                <span style={styles.overallLabel}>Grade</span>
                                                <GradeBadge grade={gradeData.grade.overallGrade} />
                                            </div>
                                            <div style={styles.overallItem}>
                                                <span style={styles.overallLabel}>Status</span>
                                                <span style={{
                                                    fontWeight: 600, fontSize: 14,
                                                    color: gradeData.grade.passFail === "Pass" ? "#15803d" :
                                                        gradeData.grade.passFail === "Fail" ? "#dc2626" : "#92400e",
                                                }}>
                                                    {gradeData.grade.passFail}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ─── TAB: SEARCH STUDENTS ─── */}
            {activeTab === "search" && (
                <div>
                    <input
                        placeholder="Search by name, email, roll number, registration number..."
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        style={{ ...styles.searchInput, width: "100%", boxSizing: "border-box", marginBottom: 16 }}
                    />
                    {searchResults.length === 0 && searchQuery.length >= 2 && (
                        <p style={styles.emptyText}>No students found.</p>
                    )}
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {searchResults.map((item) => (
                            <div key={item.student._id} style={styles.searchResultCard}>
                                <div style={styles.bigAvatar}>
                                    {item.student.name?.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600, fontSize: 14 }}>{item.student.name}</div>
                                    <div style={{ fontSize: 12, color: "#64748b" }}>{item.student.email}</div>
                                    <div style={{ fontSize: 12, color: "#64748b" }}>{item.student.department}</div>
                                </div>
                                <button
                                    onClick={() => handleOpenDetail(item.student._id)}
                                    style={styles.detailBtn}>
                                    View Profile →
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ─── STUDENT DETAIL MODAL ─── */}
            <Modal
                isOpen={showDetail}
                onClose={() => setShowDetail(false)}
                title="Student Profile"
                size="xl">
                {detailData && (
                    <div>
                        {/* Student info */}
                        <div style={styles.detailStudentCard}>
                            <div style={styles.bigAvatar}>
                                {detailData.student?.name?.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                            </div>
                            <div>
                                <div style={{ fontSize: 16, fontWeight: 700 }}>{detailData.student?.name}</div>
                                <div style={{ fontSize: 13, color: "#64748b" }}>{detailData.student?.email}</div>
                                <div style={{ fontSize: 13, color: "#64748b" }}>{detailData.student?.department}</div>
                                {detailData.student?.rollNumber && (
                                    <div style={{ fontSize: 12, color: "#94a3b8" }}>
                                        Roll: {detailData.student.rollNumber}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Per-subject grades + attendance */}
                        {detailData.gradesData?.map((item) => (
                            <div key={item.subject._id} style={styles.detailSubjectCard}>
                                <div style={styles.detailSubjectHeader}>
                                    <span style={styles.subjectCode}>{item.subject.subjectCode}</span>
                                    <span style={{ fontWeight: 600 }}>{item.subject.subjectName}</span>
                                    {/* Attendance */}
                                    <span style={{
                                        marginLeft: "auto", fontSize: 12,
                                        color: item.attendance?.percentage >= 75 ? "#15803d" :
                                            item.attendance?.percentage >= 60 ? "#92400e" : "#991b1b",
                                        fontWeight: 600,
                                    }}>
                                        Att: {item.attendance?.percentage}%
                                        ({item.attendance?.present}/{item.attendance?.total})
                                    </span>
                                </div>

                                {item.grade ? (
                                    <div style={styles.detailGradeGrid}>
                                        {COMPONENTS.map((c) => (
                                            <div key={c.key} style={styles.detailGradeBox}>
                                                <div style={{ fontSize: 11, color: "#94a3b8" }}>{c.label}</div>
                                                {item.grade[c.key]?.isEntered ? (
                                                    <>
                                                        <div style={{ fontSize: 14, fontWeight: 600 }}>
                                                            {item.grade[c.key].obtainedMarks}/{item.grade[c.key].totalMarks}
                                                        </div>
                                                        <div style={{ fontSize: 11, color: "#64748b" }}>
                                                            {item.grade[c.key].percentage}%
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div style={{ fontSize: 12, color: "#94a3b8" }}>N/A</div>
                                                )}
                                            </div>
                                        ))}
                                        <div style={styles.detailGradeBox}>
                                            <div style={{ fontSize: 11, color: "#94a3b8" }}>Overall</div>
                                            <GradeBadge grade={item.grade.overallGrade} />
                                            <div style={{
                                                fontSize: 12, fontWeight: 600,
                                                color: item.grade.passFail === "Pass" ? "#15803d" : "#dc2626"
                                            }}>
                                                {item.grade.overallPercentage}% · {item.grade.passFail}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <p style={{ fontSize: 12, color: "#94a3b8", padding: "6px 0" }}>
                                        No grades entered yet.
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </Modal>

            {/* ─── ANALYTICS MODAL ─── */}
            <Modal
                isOpen={showAnalytics}
                onClose={() => setShowAnalytics(false)}
                title={`Analytics — ${selectedSubject?.subjectName}`}
                size="xl">
                {analyticsData ? (
                    <div>
                        {/* Summary cards */}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 16 }}>
                            {[
                                { label: "Class Average", value: `${analyticsData.classAverage}%` },
                                { label: "Highest Score", value: `${analyticsData.highestMarks}%` },
                                { label: "Lowest Score", value: `${analyticsData.lowestMarks}%` },
                                { label: "Pass Rate", value: `${analyticsData.passPercentage}%` },
                            ].map((s) => (
                                <div key={s.label} style={styles.analyticsMini}>
                                    <div style={{ fontSize: 20, fontWeight: 700 }}>{s.value}</div>
                                    <div style={{ fontSize: 12, color: "#64748b" }}>{s.label}</div>
                                </div>
                            ))}
                        </div>

                        {/* Grade Distribution */}
                        <div style={styles.detailSubjectCard}>
                            <div style={{ fontWeight: 600, marginBottom: 10 }}>Grade Distribution</div>
                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                {Object.entries(analyticsData.gradeDistribution).map(([g, count]) => (
                                    <div key={g} style={{ background: "#f1f5f9", borderRadius: 8, padding: "6px 14px", textAlign: "center" }}>
                                        <div style={{ fontWeight: 700, fontSize: 16 }}>{g}</div>
                                        <div style={{ fontSize: 12, color: "#64748b" }}>{count} student{count > 1 ? "s" : ""}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* At-Risk students */}
                        {analyticsData.studentsAtRisk?.length > 0 && (
                            <div style={{ ...styles.detailSubjectCard, borderColor: "#fca5a5" }}>
                                <div style={{ fontWeight: 600, color: "#dc2626", marginBottom: 8 }}>
                                    ⚠️ Students At Risk ({analyticsData.studentsAtRisk.length})
                                </div>
                                {analyticsData.studentsAtRisk.map((s, i) => (
                                    <div key={i} style={{
                                        display: "flex", justifyContent: "space-between",
                                        padding: "4px 0", borderBottom: "0.5px solid #f1f5f9", fontSize: 13
                                    }}>
                                        <span>{s.name}</span>
                                        <span style={{ color: "#dc2626", fontWeight: 600 }}>{s.percentage}%</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Per-student table */}
                        <div style={styles.detailSubjectCard}>
                            <div style={{ fontWeight: 600, marginBottom: 10 }}>Student Performance</div>
                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                                <thead>
                                    <tr style={{ background: "#f8fafc" }}>
                                        {["Student", "Assign%", "Quiz%", "Mid%", "Final%", "Overall%", "Grade", "Status"]
                                            .map((h) => (
                                                <th key={h} style={{
                                                    padding: "6px 10px", textAlign: "left",
                                                    borderBottom: "0.5px solid #e2e8f0", color: "#64748b", fontWeight: 600, fontSize: 11
                                                }}>
                                                    {h}
                                                </th>
                                            ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {analyticsData.studentPerformance.map((s, i) => (
                                        <tr key={i} style={{ borderBottom: "0.5px solid #f1f5f9" }}>
                                            <td style={{ padding: "6px 10px", fontWeight: 500 }}>{s.name}</td>
                                            <td style={{ padding: "6px 10px" }}>{s.assignment}%</td>
                                            <td style={{ padding: "6px 10px" }}>{s.quiz}%</td>
                                            <td style={{ padding: "6px 10px" }}>{s.mid}%</td>
                                            <td style={{ padding: "6px 10px" }}>{s.final}%</td>
                                            <td style={{ padding: "6px 10px", fontWeight: 600 }}>{s.percentage}%</td>
                                            <td style={{ padding: "6px 10px" }}><GradeBadge grade={s.grade} /></td>
                                            <td style={{
                                                padding: "6px 10px",
                                                color: s.passFail === "Pass" ? "#15803d" : "#dc2626",
                                                fontWeight: 600
                                            }}>{s.passFail}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <LoadingSpinner message="Loading analytics..." />
                )}
            </Modal>
        </div>
    );
};

const styles = {
    pageHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" },
    pageTitle: { fontSize: 22, fontWeight: 600, color: "#1e293b", margin: 0 },
    pageSubtitle: { fontSize: 13, color: "#64748b", marginTop: 4 },
    tabBar: { display: "flex", gap: 8, marginBottom: 16 },
    tabBtn: { padding: "7px 16px", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer" },
    twoCol: { display: "grid", gridTemplateColumns: "300px 1fr", gap: 16, alignItems: "start" },
    leftPanel: { background: "#fff", borderRadius: 12, border: "0.5px solid #e2e8f0", overflow: "hidden" },
    rightPanel: { background: "#fff", borderRadius: 12, border: "0.5px solid #e2e8f0", padding: "1.25rem", minHeight: 300 },
    subjectBlock: { borderBottom: "0.5px solid #f1f5f9" },
    subjectHeader: {
        display: "flex", alignItems: "center", gap: 8, padding: "10px 14px",
        cursor: "pointer", background: "#f8fafc"
    },
    subjectCode: {
        background: "#dbeafe", color: "#1e40af", padding: "2px 8px", borderRadius: 6,
        fontSize: 11, fontWeight: 700
    },
    subjectName: { fontSize: 13, fontWeight: 500, flex: 1, color: "#1e293b" },
    chevron: { fontSize: 11, color: "#94a3b8" },
    searchInput: {
        width: "calc(100% - 24px)", margin: "8px 12px", padding: "7px 10px",
        border: "0.5px solid #e2e8f0", borderRadius: 8, fontSize: 13, outline: "none"
    },
    studentRow: {
        display: "flex", alignItems: "center", gap: 10, padding: "8px 14px",
        cursor: "pointer", transition: "all 0.15s"
    },
    avatar: {
        width: 30, height: 30, borderRadius: "50%", background: "#dbeafe",
        color: "#1e40af", display: "flex", alignItems: "center",
        justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0
    },
    bigAvatar: {
        width: 44, height: 44, borderRadius: "50%", background: "#2563eb",
        color: "#fff", display: "flex", alignItems: "center",
        justifyContent: "center", fontSize: 15, fontWeight: 700, flexShrink: 0
    },
    studentName: { fontSize: 13, fontWeight: 500, color: "#1e293b" },
    studentEmail: { fontSize: 11, color: "#64748b" },
    lockBtn: {
        flex: 1, background: "#fee2e2", color: "#991b1b", border: "none",
        borderRadius: 8, padding: "6px 10px", fontSize: 12, cursor: "pointer"
    },
    analyticsBtn: {
        flex: 1, background: "#dbeafe", color: "#1e40af", border: "none",
        borderRadius: 8, padding: "6px 10px", fontSize: 12, cursor: "pointer"
    },
    emptyRight: { textAlign: "center", padding: "3rem", color: "#94a3b8" },
    emptyText: { fontSize: 13, color: "#94a3b8", padding: "8px 14px" },
    studentInfoBar: {
        display: "flex", alignItems: "center", gap: 12, padding: "10px 0",
        marginBottom: 12, borderBottom: "0.5px solid #f1f5f9"
    },
    attBar: {
        display: "flex", alignItems: "center", gap: 8, padding: "6px 10px",
        background: "#f8fafc", borderRadius: 8, fontSize: 13,
        marginBottom: 14, color: "#374151"
    },
    compCard: {
        border: "0.5px solid #e2e8f0", borderRadius: 10, padding: "12px 14px",
        marginBottom: 10
    },
    compHeader: {
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: 8
    },
    compLabel: { fontSize: 13, fontWeight: 600, color: "#1e293b" },
    compInputRow: { display: "flex", gap: 8, alignItems: "flex-end" },
    inputGroup: { flex: 1 },
    inputLabel: { display: "block", fontSize: 11, color: "#64748b", marginBottom: 4 },
    markInput: {
        width: "100%", padding: "7px 10px", border: "0.5px solid #e2e8f0",
        borderRadius: 7, fontSize: 13, outline: "none", boxSizing: "border-box"
    },
    saveCompBtn: {
        padding: "7px 16px", color: "#fff", border: "none",
        borderRadius: 7, fontSize: 13, cursor: "pointer", fontWeight: 500,
        whiteSpace: "nowrap"
    },
    overallCard: {
        background: "#f0f9ff", border: "0.5px solid #bae6fd",
        borderRadius: 10, padding: "14px"
    },
    overallTitle: { fontWeight: 700, fontSize: 14, marginBottom: 12, color: "#0369a1" },
    overallGrid: { display: "flex", gap: 16, flexWrap: "wrap" },
    overallItem: { display: "flex", flexDirection: "column", gap: 2 },
    overallLabel: { fontSize: 11, color: "#64748b" },
    overallValue: { fontSize: 16, fontWeight: 700, color: "#1e293b" },
    detailBtn: {
        padding: "6px 12px", background: "#eff6ff", color: "#2563eb",
        border: "0.5px solid #bfdbfe", borderRadius: 7, fontSize: 12,
        cursor: "pointer", whiteSpace: "nowrap"
    },
    lockedBadge: {
        fontSize: 12, background: "#fee2e2", color: "#991b1b",
        padding: "4px 10px", borderRadius: 99, fontWeight: 600
    },
    detailStudentCard: {
        display: "flex", alignItems: "center", gap: 14,
        padding: "12px 0", marginBottom: 16, borderBottom: "0.5px solid #e2e8f0"
    },
    detailSubjectCard: {
        border: "0.5px solid #e2e8f0", borderRadius: 10,
        padding: "12px 14px", marginBottom: 12
    },
    detailSubjectHeader: { display: "flex", alignItems: "center", gap: 8, marginBottom: 8 },
    detailGradeGrid: { display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 },
    detailGradeBox: {
        background: "#f8fafc", borderRadius: 8, padding: "8px 10px",
        display: "flex", flexDirection: "column", gap: 3
    },
    searchResultCard: {
        display: "flex", alignItems: "center", gap: 14,
        background: "#fff", border: "0.5px solid #e2e8f0",
        borderRadius: 12, padding: "12px 14px"
    },
    analyticsMini: {
        background: "#f8fafc", border: "0.5px solid #e2e8f0",
        borderRadius: 10, padding: "12px", textAlign: "center"
    },
};

export default TeacherGrades;