import { useState, useEffect } from "react";
import studentService from "../../services/studentService";
import LoadingSpinner from "../common/LoadingSpinner";
import { formatDate, getAttendanceColor, getAttendanceLabel } from "../../utils/helpers";
import AttendanceCalendar from "./AttendanceCalendar";
const MyAttendance = () => {
    const [attendanceData, setAttendanceData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedSubject, setSelectedSubject] = useState(null);

    useEffect(() => {
        fetchAttendance();
    }, []);

    const fetchAttendance = async () => {
        try {
            const res = await studentService.getMyAttendance();
            setAttendanceData(res);
            if (res.attendanceData?.length > 0) {
                setSelectedSubject(res.attendanceData[0]);
            }
        } catch (error) {
            console.error("Failed to fetch attendance:", error);
        } finally {
            setLoading(false);
        }
    };

    const getColorStyle = (percentage) => {
        if (percentage >= 75)
            return { color: "#15803d", bg: "#dcfce7", border: "#86efac" };
        if (percentage >= 60)
            return { color: "#92400e", bg: "#fef9c3", border: "#fde68a" };
        return { color: "#991b1b", bg: "#fee2e2", border: "#fca5a5" };
    };

    if (loading) return <LoadingSpinner />;

    const overall = attendanceData?.overallPercentage || 0;
    const overallStyle = getColorStyle(overall);

    return (
        <div>

            {/* Page Header */}
            <div style={styles.pageHeader}>
                <h1 style={styles.pageTitle}>My Attendance</h1>
                <p style={styles.pageSubtitle}>
                    Track your attendance across all subjects
                </p>
            </div>

            {/* Overall Attendance Card */}
            <div
                style={{
                    ...styles.overallCard,
                    background: overallStyle.bg,
                    border: `0.5px solid ${overallStyle.border}`,
                }}
            >
                <div style={styles.overallLeft}>

                    {/* Circular Percentage */}
                    <div
                        style={{
                            ...styles.circle,
                            background: overallStyle.color,
                        }}
                    >
                        <span style={styles.circleValue}>{overall}%</span>
                    </div>

                    <div>
                        <div
                            style={{
                                ...styles.overallTitle,
                                color: overallStyle.color,
                            }}
                        >
                            Overall Attendance —{" "}
                            {getAttendanceLabel(overall)}
                        </div>
                        <div style={styles.overallSubtitle}>
                            Present {attendanceData?.overallPresent || 0} out
                            of {attendanceData?.overallTotal || 0} total
                            classes
                        </div>
                        {overall < 75 && (
                            <div style={styles.warningText}>
                                ⚠️ Minimum 75% attendance required to appear
                                in exams
                            </div>
                        )}
                    </div>
                </div>

                {/* Overall Progress Bar */}
                <div style={styles.overallBarContainer}>
                    <div style={styles.overallBarBg}>
                        <div
                            style={{
                                ...styles.overallBarFill,
                                width: `${overall}%`,
                                background: overallStyle.color,
                            }}
                        />
                    </div>
                    <div style={styles.barLabels}>
                        <span>0%</span>
                        <span
                            style={{
                                color: "#d97706",
                                fontSize: "10px",
                            }}
                        >
                            60% ▲
                        </span>
                        <span
                            style={{
                                color: "#16a34a",
                                fontSize: "10px",
                            }}
                        >
                            75% ▲
                        </span>
                        <span>100%</span>
                    </div>
                </div>
            </div>

            {/* Two Column Layout */}
            <div style={styles.twoCol}>

                {/* Left — Subject List */}
                <div style={styles.subjectsList}>
                    <div style={styles.listHeader}>
                        <h2 style={styles.listTitle}>Subject Wise</h2>
                    </div>
                    {attendanceData?.attendanceData?.map((item) => {
                        const pct = item.percentage;
                        const s = getColorStyle(pct);
                        return (
                            <div
                                key={item.subject._id}
                                onClick={() => setSelectedSubject(item)}
                                style={{
                                    ...styles.subjectItem,
                                    background:
                                        selectedSubject?.subject._id ===
                                            item.subject._id
                                            ? "#eff6ff"
                                            : "#fff",
                                    borderLeft:
                                        selectedSubject?.subject._id ===
                                            item.subject._id
                                            ? "3px solid #2563eb"
                                            : "3px solid transparent",
                                }}
                            >
                                <div style={styles.subjectItemTop}>
                                    <span style={styles.subjectCode}>
                                        {item.subject.subjectCode}
                                    </span>
                                    <span
                                        style={{
                                            ...styles.pctBadge,
                                            background: s.bg,
                                            color: s.color,
                                        }}
                                    >
                                        {pct}%
                                    </span>
                                </div>
                                <div style={styles.subjectItemName}>
                                    {item.subject.subjectName}
                                </div>

                                {/* Mini Progress Bar */}
                                <div style={styles.miniBarBg}>
                                    <div
                                        style={{
                                            ...styles.miniBarFill,
                                            width: `${pct}%`,
                                            background: s.color,
                                        }}
                                    />
                                </div>

                                <div style={styles.subjectCounts}>
                                    <span style={styles.presentCount}>
                                        ✓ {item.present}
                                    </span>
                                    <span style={styles.absentCount}>
                                        ✗ {item.absent}
                                    </span>
                                    <span style={styles.lateCount}>
                                        ⏰ {item.late}
                                    </span>
                                    <span style={styles.totalCount}>
                                        / {item.total}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Right — Detail View */}
                <div style={styles.detailPanel}>
                    {selectedSubject ? (
                        <>
                            <div style={styles.detailHeader}>
                                <div>
                                    <span style={styles.detailCode}>
                                        {selectedSubject.subject.subjectCode}
                                    </span>
                                    <h2 style={styles.detailTitle}>
                                        {selectedSubject.subject.subjectName}
                                    </h2>
                                </div>
                                <div
                                    style={{
                                        ...styles.detailPct,
                                        ...getColorStyle(
                                            selectedSubject.percentage
                                        ),
                                        background: getColorStyle(
                                            selectedSubject.percentage
                                        ).bg,
                                        color: getColorStyle(
                                            selectedSubject.percentage
                                        ).color,
                                    }}
                                >
                                    {selectedSubject.percentage}%
                                </div>
                            </div>

                            {/* Stats Row */}
                            <div style={styles.statsRow}>
                                {[
                                    {
                                        label: "Present",
                                        value: selectedSubject.present,
                                        bg: "#dcfce7",
                                        color: "#15803d",
                                    },
                                    {
                                        label: "Absent",
                                        value: selectedSubject.absent,
                                        bg: "#fee2e2",
                                        color: "#991b1b",
                                    },
                                    {
                                        label: "Late",
                                        value: selectedSubject.late,
                                        bg: "#fef9c3",
                                        color: "#854d0e",
                                    },
                                    {
                                        label: "Total",
                                        value: selectedSubject.total,
                                        bg: "#f1f5f9",
                                        color: "#475569",
                                    },
                                ].map((stat) => (
                                    <div
                                        key={stat.label}
                                        style={{
                                            ...styles.statBox,
                                            background: stat.bg,
                                        }}
                                    >
                                        <div
                                            style={{
                                                ...styles.statValue,
                                                color: stat.color,
                                            }}
                                        >
                                            {stat.value}
                                        </div>
                                        <div
                                            style={{
                                                ...styles.statLabel,
                                                color: stat.color,
                                            }}
                                        >
                                            {stat.label}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Attendance Calculator */}
                            <div style={styles.calculatorBox}>
                                <div style={styles.calcTitle}>
                                    📊 Attendance Calculator
                                </div>
                                <div style={styles.calcFormula}>
                                    Formula: (Present ÷ Total) × 100
                                </div>
                                <div style={styles.calcResult}>
                                    ({selectedSubject.present} ÷{" "}
                                    {selectedSubject.total}) × 100 ={" "}
                                    <strong
                                        style={{
                                            color: getColorStyle(
                                                selectedSubject.percentage
                                            ).color,
                                        }}
                                    >
                                        {selectedSubject.percentage}%
                                    </strong>
                                </div>
                                <div
                                    style={{
                                        ...styles.calcStatus,
                                        background: getColorStyle(
                                            selectedSubject.percentage
                                        ).bg,
                                        color: getColorStyle(
                                            selectedSubject.percentage
                                        ).color,
                                    }}
                                >
                                    Status:{" "}
                                    {getAttendanceLabel(
                                        selectedSubject.percentage
                                    )}{" "}
                                    {selectedSubject.percentage >= 75
                                        ? "✅"
                                        : selectedSubject.percentage >= 60
                                            ? "⚠️"
                                            : "❌"}
                                </div>
                            </div>

                            {/* Attendance Records */}
                            {selectedSubject.records?.length > 0 && (
                                <div style={styles.recordsSection}>
                                    <div style={styles.recordsTitle}>
                                        Recent Records
                                    </div>
                                    <div style={styles.recordsList}>
                                        {selectedSubject.records
                                            .slice(0, 8)
                                            .map((record) => (
                                                <div
                                                    key={record._id}
                                                    style={styles.recordItem}
                                                >
                                                    <span style={styles.recordDate}>
                                                        {formatDate(record.date)}
                                                    </span>
                                                    <span
                                                        style={{
                                                            ...styles.recordStatus,
                                                            background:
                                                                record.status === "present"
                                                                    ? "#dcfce7"
                                                                    : record.status === "absent"
                                                                        ? "#fee2e2"
                                                                        : "#fef9c3",
                                                            color:
                                                                record.status === "present"
                                                                    ? "#15803d"
                                                                    : record.status === "absent"
                                                                        ? "#991b1b"
                                                                        : "#854d0e",
                                                        }}
                                                    >
                                                        {record.status}
                                                    </span>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            )}
                            {/* Calendar View */}
                            {selectedSubject && (
                                <div style={{ marginTop: "1rem" }}>
                                    <AttendanceCalendar
                                        records={selectedSubject.records}
                                        subjectName={selectedSubject.subject.subjectName}
                                    />
                                </div>
                            )}
                        </>
                    ) : (
                        <div style={styles.noSelection}>
                            <p>Select a subject to view details.</p>
                        </div>
                    )}
                </div>

            </div>
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
    overallCard: {
        borderRadius: "12px",
        padding: "1.5rem",
        marginBottom: "1.5rem",
    },
    overallLeft: {
        display: "flex",
        alignItems: "center",
        gap: "20px",
        marginBottom: "1rem",
        flexWrap: "wrap",
    },
    circle: {
        width: "72px",
        height: "72px",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
    },
    circleValue: {
        fontSize: "18px",
        fontWeight: "700",
        color: "#fff",
    },
    overallTitle: {
        fontSize: "16px",
        fontWeight: "600",
        marginBottom: "4px",
    },
    overallSubtitle: {
        fontSize: "13px",
        color: "#475569",
        marginBottom: "4px",
    },
    warningText: {
        fontSize: "12px",
        color: "#dc2626",
        fontWeight: "500",
    },
    overallBarContainer: {
        marginTop: "8px",
    },
    overallBarBg: {
        width: "100%",
        height: "8px",
        background: "rgba(255,255,255,0.6)",
        borderRadius: "99px",
        overflow: "hidden",
        marginBottom: "4px",
    },
    overallBarFill: {
        height: "100%",
        borderRadius: "99px",
        transition: "width 0.6s ease",
    },
    barLabels: {
        display: "flex",
        justifyContent: "space-between",
        fontSize: "10px",
        color: "#94a3b8",
    },
    twoCol: {
        display: "grid",
        gridTemplateColumns: "280px 1fr",
        gap: "16px",
        alignItems: "start",
    },
    subjectsList: {
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
    subjectItem: {
        padding: "0.875rem 1.25rem",
        borderBottom: "0.5px solid #f1f5f9",
        cursor: "pointer",
        transition: "all 0.15s ease",
    },
    subjectItemTop: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "4px",
    },
    subjectCode: {
        background: "#dbeafe",
        color: "#1e40af",
        padding: "2px 6px",
        borderRadius: "4px",
        fontSize: "11px",
        fontWeight: "600",
    },
    pctBadge: {
        padding: "2px 8px",
        borderRadius: "99px",
        fontSize: "11px",
        fontWeight: "600",
    },
    subjectItemName: {
        fontSize: "12px",
        fontWeight: "500",
        color: "#1e293b",
        marginBottom: "6px",
    },
    miniBarBg: {
        width: "100%",
        height: "4px",
        background: "#f1f5f9",
        borderRadius: "99px",
        overflow: "hidden",
        marginBottom: "6px",
    },
    miniBarFill: {
        height: "100%",
        borderRadius: "99px",
        transition: "width 0.4s ease",
    },
    subjectCounts: {
        display: "flex",
        gap: "8px",
        fontSize: "11px",
    },
    presentCount: {
        color: "#15803d",
        fontWeight: "500",
    },
    absentCount: {
        color: "#991b1b",
        fontWeight: "500",
    },
    lateCount: {
        color: "#854d0e",
        fontWeight: "500",
    },
    totalCount: {
        color: "#94a3b8",
    },
    detailPanel: {
        background: "#fff",
        borderRadius: "12px",
        border: "0.5px solid #e2e8f0",
        padding: "1.25rem",
    },
    detailHeader: {
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        marginBottom: "1rem",
        gap: "12px",
    },
    detailCode: {
        background: "#dbeafe",
        color: "#1e40af",
        padding: "3px 8px",
        borderRadius: "6px",
        fontSize: "11px",
        fontWeight: "600",
        display: "inline-block",
        marginBottom: "6px",
    },
    detailTitle: {
        fontSize: "16px",
        fontWeight: "600",
        color: "#1e293b",
        margin: 0,
    },
    detailPct: {
        fontSize: "22px",
        fontWeight: "700",
        padding: "8px 16px",
        borderRadius: "10px",
        flexShrink: 0,
    },
    statsRow: {
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "8px",
        marginBottom: "1rem",
    },
    statBox: {
        borderRadius: "8px",
        padding: "10px",
        textAlign: "center",
    },
    statValue: {
        fontSize: "20px",
        fontWeight: "700",
        marginBottom: "2px",
    },
    statLabel: {
        fontSize: "11px",
        fontWeight: "500",
    },
    calculatorBox: {
        background: "#f8fafc",
        borderRadius: "10px",
        padding: "1rem",
        marginBottom: "1rem",
        border: "0.5px solid #e2e8f0",
    },
    calcTitle: {
        fontSize: "13px",
        fontWeight: "600",
        color: "#1e293b",
        marginBottom: "6px",
    },
    calcFormula: {
        fontSize: "12px",
        color: "#64748b",
        marginBottom: "4px",
        fontFamily: "monospace",
    },
    calcResult: {
        fontSize: "13px",
        color: "#374151",
        marginBottom: "8px",
        fontFamily: "monospace",
    },
    calcStatus: {
        padding: "6px 12px",
        borderRadius: "8px",
        fontSize: "13px",
        fontWeight: "600",
        display: "inline-block",
    },
    recordsSection: {
        marginTop: "1rem",
    },
    recordsTitle: {
        fontSize: "13px",
        fontWeight: "600",
        color: "#1e293b",
        marginBottom: "8px",
    },
    recordsList: {
        display: "flex",
        flexDirection: "column",
        gap: "6px",
    },
    recordItem: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "6px 10px",
        background: "#f8fafc",
        borderRadius: "6px",
        border: "0.5px solid #e2e8f0",
    },
    recordDate: {
        fontSize: "12px",
        color: "#475569",
    },
    recordStatus: {
        padding: "2px 8px",
        borderRadius: "99px",
        fontSize: "11px",
        fontWeight: "500",
        textTransform: "capitalize",
    },
    noSelection: {
        textAlign: "center",
        padding: "3rem",
        color: "#94a3b8",
        fontSize: "13px",
    },
};

export default MyAttendance;