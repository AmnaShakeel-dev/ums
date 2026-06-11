import { format, formatDistanceToNow } from "date-fns";

// Date format karo
export const formatDate = (date) => {
    if (!date) return "N/A";
    return format(new Date(date), "dd MMM yyyy");
};

// Date aur time format karo
export const formatDateTime = (date) => {
    if (!date) return "N/A";
    return format(new Date(date), "dd MMM yyyy, hh:mm a");
};

// Relative time — jaise "2 hours ago"
export const timeAgo = (date) => {
    if (!date) return "N/A";
    return formatDistanceToNow(new Date(date), { addSuffix: true });
};

// Attendance percentage ka color
export const getAttendanceColor = (percentage) => {
    if (percentage >= 75) return "success";
    if (percentage >= 60) return "warning";
    return "danger";
};

// Attendance percentage ka label
export const getAttendanceLabel = (percentage) => {
    if (percentage >= 75) return "Good";
    if (percentage >= 60) return "Warning";
    return "Critical";
};

// File size format karo
export const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// File type icon
export const getFileIcon = (fileType) => {
    const icons = {
        pdf: "📄",
        ppt: "📊",
        pptx: "📊",
        doc: "📝",
        docx: "📝",
        mp4: "🎬",
        mkv: "🎬",
    };
    return icons[fileType] || "📁";
};

// Priority badge class
export const getPriorityClass = (priority) => {
    const classes = {
        high: "badge-danger",
        medium: "badge-warning",
        low: "badge-success",
    };
    return classes[priority] || "badge-info";
};

// Role badge class
export const getRoleBadgeClass = (role) => {
    const classes = {
        admin: "badge-admin",
        teacher: "badge-teacher",
        student: "badge-student",
    };
    return classes[role] || "badge-info";
};

// First letter uppercase
export const capitalize = (str) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
};

// Name ke initials nikalo
export const getInitials = (name) => {
    if (!name) return "??";
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
};

// Due date check karo
export const isOverdue = (dueDate) => {
    return new Date() > new Date(dueDate);
};

// Due date ka color
export const getDueDateColor = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diff = due - now;
    const hours = diff / (1000 * 60 * 60);

    if (hours < 0) return "danger";
    if (hours < 24) return "warning";
    return "success";
};