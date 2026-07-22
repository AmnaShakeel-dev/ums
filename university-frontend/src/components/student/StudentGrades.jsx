import { useState, useEffect } from "react";
import gradeService from "../../services/gradeService";
import LoadingSpinner from "../common/LoadingSpinner";
import {
    RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    PieChart, Pie, Cell, ResponsiveContainer,
} from "recharts";

const COMPONENTS = [
    { key: "assignment", label: "Assignment", color: "#2563eb" },
    { key: "quiz", label: "Quiz", color: "#7c3aed" },
    { key: "mid", label: "Mid", color: "#d97706" },
    { key: "final", label: "Final", color: "#dc2626" },
];

const COLORS = ["#2563eb", "#7c3aed", "#d97706", "#dc2626", "#16a34a", "#0891b2"];

const GradeBadge = ({ grade, large }) => {
    const color =
        grade === "A+" || grade === "A" || grade === "A-" ? "#15803d" :
            grade === "B+" || grade === "B" || grade === "B-" ? "#1e40af" :
                grade === "C+" || grade === "C" || grade === "C-" ? "#92400e" :
                    grade === "D" ? "#c2410c" : grade === "F" ? "#991b1b" : "#475569";
    const bg =
        grade === "A+" || grade === "A" || grade === "A-" ? "#dcfce7" :
            grade === "B+" || grade === "B" || grade === "B-" ? "#dbeafe" :
                grade === "C+" || grade === "C" || grade === "C-" ? "#fef3c7" :
                    grade === "D" ? "#ffedd5" : grade === "F" ? "#fee2e2" : "#f1f5f9";
    return (
        <span style={{
            background: bg, color, padding: large ? "4px 16px" : "2px 10px",
            borderRadius: 99, fontSize: large ? 16 : 12, fontWeight: 700,
        }}>
            {grade}
        </span>
    );
};

const StudentGrades = () => {
    const [gradesData, setGradesData] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("grades");

    useEffect(() => { fetchAll(); }, []);

    const fetchAll = async () => {
        try {
            const [gradesRes, analyticsRes] = await Promise.all([
                gradeService.getMyGrades(),
                gradeService.getStudentAnalytics(),
            ]);
            setGradesData(gradesRes.gradesData || []);
            setAnalytics(analyticsRes.analytics || null);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LoadingSpinner />;

    // Chart data
    const barData = gradesData
        .filter((d) => d.grade?.totalMarks > 0)
        .map((d) => ({
            subject: d.subject.subjectCode,
            Assignment: d.grade?.assignment?.percentage || 0,
            Quiz: d.grade?.quiz?.percentage || 0,
            Mid: d.grade?.mid?.percentage || 0,
            Final: d.grade?.final?.percentage || 0,
            Overall: d.grade?.overallPercentage || 0,
        }));

    const pieData = analytics
        ? [
            { name: "Pass", value: analytics.passCount },
            { name: "Fail", value: analytics.failCount },
        ]
        : [];

    const radarData = barData.map((d) => ({
        subject: d.subject,
        Assignment: d.Assignment,
        Quiz: d.Quiz,
        Mid: d.Mid,
        Final: d.Final,
    }));

    return (
        <div>
            {/* Page Header */}
            <div style={styles.pageHeader}>
                <div>
                    <h1 style={styles.pageTitle}>My Grades</h1>
                    <p style={styles.pageSubtitle}>View your academic performance across all subjects</p>
                </div>
            </div>

            {/* Tabs */}
            <div style={styles.tabBar}>
                {[{ key: "grades", label: "Grade Sheet" }, { key: "analytics", label: "Analytics" }]
                    .map((tab) => (
                        <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
                            ...styles.tabBtn,
                            background: activeTab === tab.key ? "#2563eb" : "#fff",
                            color: activeTab === tab.key ? "#fff" : "#64748b",
                            border: activeTab === tab.key ? "0.5px solid #2563eb" : "0.5px solid #e2e8f0",
                        }}>
                            {tab.label}
                        </button>
                    ))}
            </div>

            {/* ─── GRADE SHEET ─── */}
            {activeTab === "grades" && (
                <>
                    {/* Overall Summary Card */}
                    {analytics && analytics.gradedSubjects > 0 && (
                        <div style={styles.summaryCard}>
                            <div style={styles.summaryLeft}>
                                <div style={{ fontSize: 13, color: "#64748b", marginBottom: 4 }}>Overall Performance</div>
                                <div style={{ fontSize: 36, fontWeight: 800, color: "#1e293b" }}>
                                    {analytics.overallPercentage}%
                                </div>
                                <GradeBadge grade={analytics.overallGrade} large />
                            </div>
                            <div style={styles.summaryStats}>
                                <div style={styles.sumStat}>
                                    <span style={styles.sumStatVal}>{analytics.gradedSubjects}</span>
                                    <span style={styles.sumStatLabel}>Graded Subjects</span>
                                </div>
                                <div style={styles.sumStat}>
                                    <span style={{ ...styles.sumStatVal, color: "#15803d" }}>{analytics.passCount}</span>
                                    <span style={styles.sumStatLabel}>Passed</span>
                                </div>
                                <div style={styles.sumStat}>
                                    <span style={{ ...styles.sumStatVal, color: "#dc2626" }}>{analytics.failCount}</span>
                                    <span style={styles.sumStatLabel}>Failed</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Per-Subject Grade Cards */}
                    {gradesData.length === 0 ? (
                        <div style={styles.emptyState}>
                            <div style={{ fontSize: 40 }}>📊</div>
                            <p>No grades available yet. Your teacher will enter grades soon.</p>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            {gradesData.map((d) => (
                                <div key={d.subject._id} style={styles.subjectGradeCard}>
                                    {/* Subject header */}
                                    <div style={styles.subjectGradeHeader}>
                                        <span style={styles.subjectCode}>{d.subject.subjectCode}</span>
                                        <span style={{ fontWeight: 600, fontSize: 15, flex: 1 }}>
                                            {d.subject.subjectName}
                                        </span>
                                        {d.grade?.isLocked && (
                                            <span style={styles.lockedBadge}>🔒 Finalized</span>
                                        )}
                                        {d.grade?.totalMarks > 0 ? (
                                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                <GradeBadge grade={d.grade.overallGrade} />
                                                <span style={{ fontWeight: 700, fontSize: 15, color: "#1e293b" }}>
                                                    {d.grade.overallPercentage}%
                                                </span>
                                                <span style={{
                                                    fontWeight: 600, fontSize: 13,
                                                    color: d.grade.passFail === "Pass" ? "#15803d" : "#dc2626",
                                                    background: d.grade.passFail === "Pass" ? "#dcfce7" : "#fee2e2",
                                                    padding: "3px 10px", borderRadius: 99,
                                                }}>
                                                    {d.grade.passFail}
                                                </span>
                                            </div>
                                        ) : (
                                            <span style={{ fontSize: 12, color: "#94a3b8" }}>Pending</span>
                                        )}
                                    </div>

                                    {/* Component breakdown */}
                                    {d.grade ? (
                                        <div style={styles.gradeComponentGrid}>
                                            {COMPONENTS.map((c) => {
                                                const comp = d.grade[c.key];
                                                return (
                                                    <div key={c.key} style={styles.gradeCompBox}>
                                                        <div style={{
                                                            fontSize: 11, color: "#94a3b8", marginBottom: 4, fontWeight: 600
                                                        }}>
                                                            {c.label}
                                                        </div>
                                                        {comp?.isEntered ? (
                                                            <>
                                                                <div style={{ fontSize: 15, fontWeight: 700, color: "#1e293b" }}>
                                                                    {comp.obtainedMarks}
                                                                    <span style={{ fontSize: 11, color: "#94a3b8" }}>
                                                                        /{comp.totalMarks}
                                                                    </span>
                                                                </div>
                                                                {/* Mini progress bar */}
                                                                <div style={styles.miniBarBg}>
                                                                    <div style={{
                                                                        ...styles.miniBarFill,
                                                                        width: `${comp.percentage}%`,
                                                                        background: c.color,
                                                                    }} />
                                                                </div>
                                                                <div style={{ fontSize: 11, color: "#64748b" }}>
                                                                    {comp.percentage}% · {comp.grade}
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <div style={{ fontSize: 12, color: "#cbd5e1" }}>Not entered</div>
                                                        )}
                                                    </div>
                                                );
                                            })}

                                            {/* Total column */}
                                            {d.grade.totalMarks > 0 && (
                                                <div style={{
                                                    ...styles.gradeCompBox, background: "#f0f9ff",
                                                    border: "0.5px solid #bae6fd"
                                                }}>
                                                    <div style={{ fontSize: 11, color: "#0369a1", fontWeight: 600, marginBottom: 4 }}>
                                                        TOTAL
                                                    </div>
                                                    <div style={{ fontSize: 15, fontWeight: 700, color: "#1e293b" }}>
                                                        {d.grade.obtainedMarks}
                                                        <span style={{ fontSize: 11, color: "#94a3b8" }}>
                                                            /{d.grade.totalMarks}
                                                        </span>
                                                    </div>
                                                    <div style={styles.miniBarBg}>
                                                        <div style={{
                                                            ...styles.miniBarFill,
                                                            width: `${d.grade.overallPercentage}%`,
                                                            background: d.grade.overallPercentage >= 75 ? "#16a34a" :
                                                                d.grade.overallPercentage >= 50 ? "#d97706" : "#dc2626",
                                                        }} />
                                                    </div>
                                                    <div style={{ fontSize: 11, fontWeight: 600, color: "#1e293b" }}>
                                                        {d.grade.overallPercentage}%
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <p style={{ fontSize: 13, color: "#94a3b8", padding: "6px 0" }}>
                                            Grades not entered yet.
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* ─── ANALYTICS ─── */}
            {activeTab === "analytics" && (
                analytics && analytics.gradedSubjects > 0 ? (
                    <div>
                        {/* Overview cards */}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px,1fr))", gap: 12, marginBottom: 20 }}>
                            {[
                                { label: "Overall %", value: `${analytics.overallPercentage}%`, color: "#2563eb" },
                                { label: "Overall Grade", value: analytics.overallGrade, color: "#7c3aed" },
                                { label: "Subjects Passed", value: analytics.passCount, color: "#15803d" },
                                { label: "Subjects Failed", value: analytics.failCount, color: "#dc2626" },
                            ].map((s) => (
                                <div key={s.label} style={{
                                    background: "#fff", border: "0.5px solid #e2e8f0",
                                    borderRadius: 12, padding: "1rem", textAlign: "center"
                                }}>
                                    <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</div>
                                    <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>{s.label}</div>
                                </div>
                            ))}
                        </div>

                        {/* Chart 1: Subject-wise Overall Performance (Bar) */}
                        <div style={styles.chartCard}>
                            <div style={styles.chartTitle}>Subject-wise Overall Performance (%)</div>
                            <ResponsiveContainer width="100%" height={240}>
                                <BarChart data={barData} margin={{ left: 0, right: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="subject" tick={{ fontSize: 12 }} />
                                    <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                                    <Tooltip />
                                    <Bar dataKey="Overall" fill="#2563eb" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Chart 2: Assignment vs Quiz vs Mid vs Final (Grouped Bar) */}
                        <div style={styles.chartCard}>
                            <div style={styles.chartTitle}>Assessment Breakdown by Subject (%)</div>
                            <ResponsiveContainer width="100%" height={260}>
                                <BarChart data={barData} margin={{ left: 0, right: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="subject" tick={{ fontSize: 12 }} />
                                    <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                                    <Tooltip />
                                    <Legend />
                                    {COMPONENTS.map((c) => (
                                        <Bar key={c.key} dataKey={c.label} fill={c.color} radius={[3, 3, 0, 0]} />
                                    ))}
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Chart 3: Radar (subject performance shape) */}
                        {radarData.length >= 3 && (
                            <div style={styles.chartCard}>
                                <div style={styles.chartTitle}>Performance Radar</div>
                                <ResponsiveContainer width="100%" height={300}>
                                    <RadarChart data={radarData}>
                                        <PolarGrid />
                                        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
                                        <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                                        {COMPONENTS.map((c) => (
                                            <Radar key={c.key} name={c.label} dataKey={c.label}
                                                stroke={c.color} fill={c.color} fillOpacity={0.2} />
                                        ))}
                                        <Legend />
                                        <Tooltip />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                        )}

                        {/* Chart 4: Pass/Fail Pie */}
                        <div style={styles.chartCard}>
                            <div style={styles.chartTitle}>Pass / Fail Summary</div>
                            <ResponsiveContainer width="100%" height={220}>
                                <PieChart>
                                    <Pie data={pieData} dataKey="value" nameKey="name"
                                        cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}`}>
                                        {pieData.map((_, i) => (
                                            <Cell key={i} fill={i === 0 ? "#16a34a" : "#dc2626"} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Subject performance table */}
                        <div style={styles.chartCard}>
                            <div style={styles.chartTitle}>Detailed Subject Performance</div>
                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                                <thead>
                                    <tr style={{ background: "#f8fafc" }}>
                                        {["Subject", "Assignment%", "Quiz%", "Mid%", "Final%", "Overall%", "Grade", "Status"]
                                            .map((h) => (
                                                <th key={h} style={{
                                                    padding: "8px 12px", textAlign: "left",
                                                    borderBottom: "0.5px solid #e2e8f0", color: "#64748b",
                                                    fontWeight: 600, fontSize: 12
                                                }}>
                                                    {h}
                                                </th>
                                            ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {analytics.subjectPerformance.map((s, i) => (
                                        <tr key={i} style={{ borderBottom: "0.5px solid #f1f5f9" }}>
                                            <td style={{ padding: "8px 12px", fontWeight: 500 }}>
                                                <div>{s.subject}</div>
                                                <div style={{ fontSize: 11, color: "#94a3b8" }}>{s.code}</div>
                                            </td>
                                            <td style={{ padding: "8px 12px" }}>{s.assignment}%</td>
                                            <td style={{ padding: "8px 12px" }}>{s.quiz}%</td>
                                            <td style={{ padding: "8px 12px" }}>{s.mid}%</td>
                                            <td style={{ padding: "8px 12px" }}>{s.final}%</td>
                                            <td style={{ padding: "8px 12px", fontWeight: 700 }}>{s.percentage}%</td>
                                            <td style={{ padding: "8px 12px" }}><GradeBadge grade={s.grade} /></td>
                                            <td style={{
                                                padding: "8px 12px", fontWeight: 600,
                                                color: s.passFail === "Pass" ? "#15803d" : "#dc2626"
                                            }}>
                                                {s.passFail}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div style={styles.emptyState}>
                        <div style={{ fontSize: 40 }}>📈</div>
                        <p>Analytics will appear once your teacher enters grades.</p>
                    </div>
                )
            )}
        </div>
    );
};

const styles = {
    pageHeader: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "1.5rem"
    },
    pageTitle: {
        fontSize: 22,
        fontWeight: 600,
        color: "#1e293b",
        margin: 0
    },
    pageSubtitle: {
        fontSize: 13,
        color: "#64748b",
        marginTop: 4
    },
    tabBar: {
        display: "flex",
        gap: 8,
        marginBottom: 16
    },
    tabBtn: {
        padding: "7px 16px",
        borderRadius: 8,
        fontSize: 13,
        fontWeight: 500,
        cursor: "pointer"
    },
    summaryCard: {
        display: "flex", alignItems: "center", gap: 24,
        background: "#1e293b", borderRadius: 12, padding: "1.5rem",
        marginBottom: 20, flexWrap: "wrap"
    },
    summaryLeft: { display: "flex", flexDirection: "column", gap: 6 },
    summaryStats: { display: "flex", gap: 24, flexWrap: "wrap" },
    sumStat: { display: "flex", flexDirection: "column", alignItems: "center" },
    sumStatVal: { fontSize: 28, fontWeight: 800, color: "#f1f5f9" },
    sumStatLabel: { fontSize: 12, color: "#94a3b8" },
    subjectGradeCard: {
        background: "#fff", border: "0.5px solid #e2e8f0",
        borderRadius: 12, padding: "1rem 1.25rem"
    },
    subjectGradeHeader: {
        display: "flex", alignItems: "center", gap: 10,
        marginBottom: 10, flexWrap: "wrap"
    },
    subjectCode: {
        background: "#dbeafe", color: "#1e40af", padding: "2px 8px",
        borderRadius: 6, fontSize: 12, fontWeight: 700, flexShrink: 0
    },
    lockedBadge: {
        fontSize: 11, background: "#fee2e2", color: "#991b1b",
        padding: "2px 8px", borderRadius: 99, fontWeight: 600
    },
    gradeComponentGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10
    },
    gradeCompBox: {
        background: "#f8fafc", borderRadius: 8, padding: "10px 12px",
        border: "0.5px solid #e2e8f0"
    },
    miniBarBg: {
        width: "100%", height: 4, background: "#e2e8f0",
        borderRadius: 99, margin: "4px 0", overflow: "hidden"
    },
    miniBarFill: { height: "100%", borderRadius: 99 },
    chartCard: {
        background: "#fff", border: "0.5px solid #e2e8f0",
        borderRadius: 12, padding: "1.25rem", marginBottom: 16
    },
    chartTitle: { fontSize: 14, fontWeight: 600, color: "#1e293b", marginBottom: 14 },
    emptyState: {
        textAlign: "center", padding: "3rem",
        background: "#fff", borderRadius: 12,
        border: "0.5px solid #e2e8f0", color: "#94a3b8"
    },
};

export default StudentGrades;