import api from "./api";

const teacherService = {
    // Subjects
    getMySubjects: async () => {
        const response = await api.get("/teacher/subjects");
        return response.data;
    },

    getEnrolledStudents: async (subjectId) => {
        const response = await api.get(`/teacher/subjects/${subjectId}/students`);
        return response.data;
    },

    // Attendance
    markAttendance: async (subjectId, date, attendanceData) => {
        const response = await api.post("/teacher/attendance", {
            subjectId,
            date,
            attendanceData,
        });
        return response.data;
    },

    getAttendanceHistory: async (subjectId) => {
        const response = await api.get(`/teacher/attendance/${subjectId}`);
        return response.data;
    },

    // Lectures
    uploadLecture: async (formData) => {
        const response = await api.post("/teacher/lectures", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    },

    getMyLectures: async () => {
        const response = await api.get("/teacher/lectures");
        return response.data;
    },

    deleteLecture: async (id) => {
        const response = await api.delete(`/teacher/lectures/${id}`);
        return response.data;
    },

    // Assignments
    createAssignment: async (formData) => {
        const response = await api.post("/teacher/assignments", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    },

    getMyAssignments: async () => {
        const response = await api.get("/teacher/assignments");
        return response.data;
    },

    deleteAssignment: async (id) => {
        const response = await api.delete(`/teacher/assignments/${id}`);
        return response.data;
    },

    // Grading
    getSubmissions: async (assignmentId) => {
        const response = await api.get(`/teacher/assignments/${assignmentId}/submissions`);
        return response.data;
    },

    gradeSubmission: async (submissionId, marks, feedback) => {
        const response = await api.put(`/teacher/submissions/${submissionId}/grade`, {
            marks,
            feedback,
        });
        return response.data;
    },
    // Announcements
    createAnnouncement: async (data) => {
        const response = await api.post("/announcements", data);
        return response.data;
    },

    getMyAnnouncements: async () => {
        const response = await api.get("/announcements");
        return response.data;
    },

    deleteAnnouncement: async (id) => {
        const response = await api.delete(`/announcements/${id}`);
        return response.data;
    },

};

export default teacherService;