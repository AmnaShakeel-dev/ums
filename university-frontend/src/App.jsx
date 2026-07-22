import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import useAuth from "./hooks/useAuth";

// Pages
import LoginPage from "./pages/LoginPage";

// Admin Components
import AdminDashboard from "./components/admin/AdminDashboard";
import UserManagement from "./components/admin/UserManagement";
import SubjectManagement from "./components/admin/SubjectManagement";
import EnrollmentManagement from "./components/admin/EnrollmentManagement";
import AdminAnnouncements from "./components/admin/AdminAnnouncements";

// Teacher Components
import TeacherDashboard from "./components/teacher/TeacherDashboard";
import AttendanceMarking from "./components/teacher/AttendanceMarking";
import LectureUpload from "./components/teacher/LectureUpload";
import AssignmentManagement from "./components/teacher/AssignmentManagement";
import GradingPanel from "./components/teacher/GradingPanel";
import TeacherAnnouncements from "./components/teacher/TeacherAnnouncements";
import TeacherGrades from "./components/teacher/TeacherGrades";
import StudentGrades from "./components/student/StudentGrades";
// Student Components
import StudentDashboard from "./components/student/StudentDashboard";
import MySubjects from "./components/student/MySubjects";
import SubjectLectures from "./components/student/SubjectLectures";
import SubmitAssignment from "./components/student/SubmitAssignment";
import MyAttendance from "./components/student/MyAttendance";
import StudentProfile from "./components/student/StudentProfile";

// Common Components
import Sidebar from "./components/common/Sidebar";
import Navbar from "./components/common/Navbar";

// =====================
// PROTECTED ROUTE
// =====================
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        fontSize: "16px",
        color: "#64748b",
      }}>
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// =====================
// LAYOUT WITH SIDEBAR
// =====================
const DashboardLayout = ({ children }) => {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar />
        <div className="page-content">
          {children}
        </div>
      </div>
    </div>
  );
};

// =====================
// MAIN APP ROUTES
// =====================
const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>

      {/* Public Route */}
      <Route path="/login" element={
        user ? <Navigate to={`/${user.role}/dashboard`} replace /> : <LoginPage />
      } />

      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={
        <ProtectedRoute allowedRoles={["admin"]}>
          <DashboardLayout>
            <AdminDashboard />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="/admin/users" element={
        <ProtectedRoute allowedRoles={["admin"]}>
          <DashboardLayout>
            <UserManagement />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="/admin/subjects" element={
        <ProtectedRoute allowedRoles={["admin"]}>
          <DashboardLayout>
            <SubjectManagement />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="/admin/enrollments" element={
        <ProtectedRoute allowedRoles={["admin"]}>
          <DashboardLayout>
            <EnrollmentManagement />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="/admin/announcements" element={
        <ProtectedRoute allowedRoles={["admin"]}>
          <DashboardLayout>
            <AdminAnnouncements />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      {/* Teacher Routes */}
      <Route path="/teacher/dashboard" element={
        <ProtectedRoute allowedRoles={["teacher"]}>
          <DashboardLayout>
            <TeacherDashboard />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="/teacher/attendance" element={
        <ProtectedRoute allowedRoles={["teacher"]}>
          <DashboardLayout>
            <AttendanceMarking />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="/teacher/lectures" element={
        <ProtectedRoute allowedRoles={["teacher"]}>
          <DashboardLayout>
            <LectureUpload />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="/teacher/assignments" element={
        <ProtectedRoute allowedRoles={["teacher"]}>
          <DashboardLayout>
            <AssignmentManagement />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="/teacher/grading" element={
        <ProtectedRoute allowedRoles={["teacher"]}>
          <DashboardLayout>
            <GradingPanel />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/teacher/announcements" element={
        <ProtectedRoute allowedRoles={["teacher"]}>
          <DashboardLayout>
            <TeacherAnnouncements />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/teacher/grades" element={
        <ProtectedRoute allowedRoles={["teacher"]}>
          <DashboardLayout><TeacherGrades /></DashboardLayout>
        </ProtectedRoute>
      } />

      {/* Student Routes */}
      <Route path="/student/dashboard" element={
        <ProtectedRoute allowedRoles={["student"]}>
          <DashboardLayout>
            <StudentDashboard />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="/student/subjects" element={
        <ProtectedRoute allowedRoles={["student"]}>
          <DashboardLayout>
            <MySubjects />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="/student/lectures/:subjectId" element={
        <ProtectedRoute allowedRoles={["student"]}>
          <DashboardLayout>
            <SubjectLectures />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="/student/assignments" element={
        <ProtectedRoute allowedRoles={["student"]}>
          <DashboardLayout>
            <SubmitAssignment />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="/student/attendance" element={
        <ProtectedRoute allowedRoles={["student"]}>
          <DashboardLayout>
            <MyAttendance />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="/student/profile" element={
        <ProtectedRoute allowedRoles={["student"]}>
          <DashboardLayout>
            <StudentProfile />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/student/grades" element={
        <ProtectedRoute allowedRoles={["student"]}>
          <DashboardLayout><StudentGrades /></DashboardLayout>
        </ProtectedRoute>
      } />

      {/* Default Redirect */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />

    </Routes>
  );
};

// =====================
// ROOT APP
// =====================
const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;