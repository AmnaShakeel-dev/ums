import api from "./api";

const studentService = {
    // Profile
    getProfile: async () => {
        const response = await api.get("/student/profile");
        return response.data;
    },

    updateProfile: async (formData) => {
        const response = await api.put("/student/profile", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    },

    // Subjects
    getMySubjects: async () => {
        const response = await api.get("/student/subjects");
        return response.data;
    },

    // Lectures
    getSubjectLectures: async (subjectId) => {
        const response = await api.get(`/student/lectures/${subjectId}`);
        return response.data;
    },

    downloadLecture: async (lectureId) => {
        const response = await api.put(`/student/lectures/${lectureId}/download`);
        return response.data;
    },

    // Assignments
    getMyAssignments: async () => {
        const response = await api.get("/student/assignments");
        return response.data;
    },

    submitAssignment: async (assignmentId, formData) => {
        const response = await api.post(
            `/student/assignments/${assignmentId}/submit`,
            formData,
            { headers: { "Content-Type": "multipart/form-data" } }
        );
        return response.data;
    },

    // Attendance
    getMyAttendance: async () => {
        const response = await api.get("/student/attendance");
        return response.data;
    },

    // Announcements
    getMyAnnouncements: async () => {
        const response = await api.get("/student/announcements");
        return response.data;
    },

    markAnnouncementRead: async (id) => {
        const response = await api.put(`/student/announcements/${id}/read`);
        return response.data;
    },
};

export default studentService;