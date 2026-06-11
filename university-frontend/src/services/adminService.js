import api from "./api";

const adminService = {
    // Users
    createUser: async (userData) => {
        const response = await api.post("/admin/users", userData);
        return response.data;
    },

    getAllUsers: async (params) => {
        const response = await api.get("/admin/users", { params });
        return response.data;
    },

    getUser: async (id) => {
        const response = await api.get(`/admin/users/${id}`);
        return response.data;
    },

    updateUser: async (id, userData) => {
        const response = await api.put(`/admin/users/${id}`, userData);
        return response.data;
    },

    deleteUser: async (id) => {
        const response = await api.delete(`/admin/users/${id}`);
        return response.data;
    },

    // Subjects
    createSubject: async (subjectData) => {
        const response = await api.post("/admin/subjects", subjectData);
        return response.data;
    },

    getAllSubjects: async () => {
        const response = await api.get("/admin/subjects");
        return response.data;
    },

    updateSubject: async (id, subjectData) => {
        const response = await api.put(`/admin/subjects/${id}`, subjectData);
        return response.data;
    },

    deleteSubject: async (id) => {
        const response = await api.delete(`/admin/subjects/${id}`);
        return response.data;
    },

    // Enrollments
    enrollStudent: async (studentId, subjectId) => {
        const response = await api.post("/admin/enrollments", {
            studentId,
            subjectId,
        });
        return response.data;
    },

    getAllEnrollments: async () => {
        const response = await api.get("/admin/enrollments");
        return response.data;
    },

    removeEnrollment: async (id) => {
        const response = await api.delete(`/admin/enrollments/${id}`);
        return response.data;
    },

    // Analytics
    getAnalytics: async () => {
        const response = await api.get("/admin/analytics");
        return response.data;
    },
    // Announcements
    createAnnouncement: async (data) => {
        const response = await api.post("/announcements", data);
        return response.data;
    },

    getAllAnnouncements: async () => {
        const response = await api.get("/announcements");
        return response.data;
    },

    deleteAnnouncement: async (id) => {
        const response = await api.delete(`/announcements/${id}`);
        return response.data;
    },
};

export default adminService;