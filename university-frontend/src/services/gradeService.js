import api from "./api";

const gradeService = {
    // Teacher
    getSubjectsWithStudents: async () => {
        const res = await api.get("/grades/teacher/subjects-students");
        return res.data;
    },
    enterGrade: async (data) => {
        const res = await api.post("/grades/teacher/enter", data);
        return res.data;
    },
    getStudentGradeForTeacher: async (studentId, subjectId) => {
        const res = await api.get(`/grades/teacher/student/${studentId}/subject/${subjectId}`);
        return res.data;
    },
    lockGrades: async (subjectId) => {
        const res = await api.put("/grades/teacher/lock", { subjectId });
        return res.data;
    },
    searchStudents: async (q) => {
        const res = await api.get(`/grades/teacher/search-students?q=${q}`);
        return res.data;
    },
    getStudentDetail: async (studentId) => {
        const res = await api.get(`/grades/teacher/student-detail/${studentId}`);
        return res.data;
    },
    getTeacherSubjectAnalytics: async (subjectId) => {
        const res = await api.get(`/grades/teacher/analytics/${subjectId}`);
        return res.data;
    },

    // Admin
    adminUnlockGrades: async (subjectId, studentId) => {
        const res = await api.put("/grades/admin/unlock", { subjectId, studentId });
        return res.data;
    },
    adminEnterGrade: async (data) => {
        const res = await api.put("/grades/admin/enter", data);
        return res.data;
    },
    adminGetAllGrades: async (params) => {
        const res = await api.get("/grades/admin/all-grades", { params });
        return res.data;
    },

    // Student
    getMyGrades: async () => {
        const res = await api.get("/grades/student/my-grades");
        return res.data;
    },
    getStudentAnalytics: async () => {
        const res = await api.get("/grades/student/analytics");
        return res.data;
    },
};

export default gradeService;