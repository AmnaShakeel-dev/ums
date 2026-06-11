import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameMonth, isToday } from "date-fns";

const AttendanceCalendar = ({ records, subjectName }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    const startDay = getDay(monthStart);

    const getStatusForDate = (date) => {
        const dateStr = format(date, "yyyy-MM-dd");
        const record = records?.find(
            (r) => format(new Date(r.date), "yyyy-MM-dd") === dateStr
        );
        return record?.status || null;
    };

    const getDayStyle = (status, isCurrentMonth, isTodayDate) => {
        let bg = "transparent";
        let color = "#374151";
        let border = "transparent";

        if (status === "present") { bg = "#dcfce7"; color = "#15803d"; border = "#86efac"; }
        else if (status === "absent") { bg = "#fee2e2"; color = "#991b1b"; border = "#fca5a5"; }
        else if (status === "late") { bg = "#fef9c3"; color = "#854d0e"; border = "#fde68a"; }

        if (!isCurrentMonth) color = "#d1d5db";
        if (isTodayDate && !status) { border = "#2563eb"; }

        return { bg, color, border };
    };

    const prevMonth = () => {
        setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    };

    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return (
        <div style={styles.calendarContainer}>
            <div style={styles.calendarHeader}>
                <button onClick={prevMonth} style={styles.navBtn}>←</button>
                <h3 style={styles.monthTitle}>
                    {format(currentMonth, "MMMM yyyy")}
                </h3>
                <button onClick={nextMonth} style={styles.navBtn}>→</button>
            </div>

            {subjectName && (
                <div style={styles.subjectLabel}>{subjectName}</div>
            )}

            <div style={styles.weekDaysRow}>
                {weekDays.map((day) => (
                    <div key={day} style={styles.weekDay}>{day}</div>
                ))}
            </div>

            <div style={styles.daysGrid}>
                {Array.from({ length: startDay }).map((_, i) => (
                    <div key={`empty-${i}`} style={styles.emptyDay} />
                ))}
                {days.map((day) => {
                    const status = getStatusForDate(day);
                    const isCurrentMonth = isSameMonth(day, currentMonth);
                    const isTodayDate = isToday(day);
                    const { bg, color, border } = getDayStyle(status, isCurrentMonth, isTodayDate);

                    return (
                        <div
                            key={day.toString()}
                            style={{
                                ...styles.dayCell,
                                background: bg,
                                color: color,
                                border: `0.5px solid ${border}`,
                                fontWeight: isTodayDate ? "700" : "400",
                            }}
                        >
                            {format(day, "d")}
                            {status && (
                                <div style={styles.statusDot}>
                                    {status === "present" ? "✓" : status === "absent" ? "✗" : "⏰"}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div style={styles.legend}>
                {[
                    { color: "#dcfce7", text: "#15803d", border: "#86efac", label: "Present" },
                    { color: "#fee2e2", text: "#991b1b", border: "#fca5a5", label: "Absent" },
                    { color: "#fef9c3", text: "#854d0e", border: "#fde68a", label: "Late" },
                ].map((item) => (
                    <div key={item.label} style={styles.legendItem}>
                        <div style={{ ...styles.legendDot, background: item.color, border: `0.5px solid ${item.border}`, color: item.text }}>
                            {item.label === "Present" ? "✓" : item.label === "Absent" ? "✗" : "⏰"}
                        </div>
                        <span style={styles.legendLabel}>{item.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const styles = {
    calendarContainer: { background: "#fff", borderRadius: "12px", border: "0.5px solid #e2e8f0", padding: "1.25rem" },
    calendarHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" },
    navBtn: { background: "#f1f5f9", border: "0.5px solid #e2e8f0", borderRadius: "6px", padding: "4px 10px", cursor: "pointer", fontSize: "14px", color: "#475569" },
    monthTitle: { fontSize: "15px", fontWeight: "600", color: "#1e293b", margin: 0 },
    subjectLabel: { fontSize: "12px", color: "#64748b", marginBottom: "12px", textAlign: "center" },
    weekDaysRow: { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px", marginBottom: "4px" },
    weekDay: { textAlign: "center", fontSize: "11px", fontWeight: "600", color: "#94a3b8", padding: "4px 0" },
    daysGrid: { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px" },
    emptyDay: { height: "36px" },
    dayCell: { height: "36px", borderRadius: "6px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontSize: "12px", cursor: "default", position: "relative" },
    statusDot: { fontSize: "8px", lineHeight: 1 },
    legend: { display: "flex", gap: "12px", justifyContent: "center", marginTop: "12px", paddingTop: "12px", borderTop: "0.5px solid #f1f5f9" },
    legendItem: { display: "flex", alignItems: "center", gap: "4px" },
    legendDot: { width: "18px", height: "18px", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px", fontWeight: "600" },
    legendLabel: { fontSize: "11px", color: "#64748b" },
};

export default AttendanceCalendar;