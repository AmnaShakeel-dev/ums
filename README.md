
# 🎓 University Management System

### A Complete Full-Stack MERN Application for Managing University Operations

[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white)](https://jwt.io)
[![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)](https://vitejs.dev)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [User Roles](#user-roles)
- [Screenshots](#screenshots)
- [Deployment](#deployment)

---

## 🌟 Overview

University Management System is a production-ready full-stack web application built with the MERN stack. It provides a comprehensive platform for managing university operations including user management, subject enrollment, attendance tracking, lecture uploads, assignment management, grading, and announcements — all with role-based access control.

---

## ✨ Features

### 🔐 Authentication & Security
- JWT-based secure authentication
- Role-based access control (Admin, Teacher, Student)
- Password hashing with bcrypt (12 salt rounds)
- Rate limiting on authentication endpoints
- Only Admin can create user accounts — no public registration
- Protected routes on all sensitive endpoints

### 👨‍💼 Admin Features
- **User Management** — Create, edit, delete users (Teachers & Students)
- **Subject Management** — Create subjects, assign teachers
- **Enrollment Management** — Enroll students in subjects
- **Announcements** — System-wide announcements with priority levels
- **Analytics Dashboard** — Total students, teachers, subjects, enrollments

### 👨‍🏫 Teacher Features
- **Dashboard** — Overview of subjects, assignments, pending grades
- **Attendance Marking** — Mark present, absent, late per student per subject
- **Lecture Upload** — Upload PDF, PPT, DOC, Video lecture materials
- **Assignment Management** — Create assignments with due dates and max marks
- **Grading Panel** — Grade student submissions with marks and feedback
- **Announcements** — Create announcements for students

### 🎓 Student Features
- **Dashboard** — Welcome screen with attendance meter and pending tasks
- **My Profile** — View and edit profile, change password
- **My Subjects** — View enrolled subjects with teacher info
- **Lectures** — Access lecture materials for enrolled subjects only
- **Assignments** — Submit assignments, view grades and feedback
- **Attendance Tracker** — Per-subject attendance with percentage calculator
- **Attendance Calendar** — Monthly calendar view with color-coded status
- **Announcements** — View relevant announcements

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|-----------|---------|
| Node.js | Runtime environment |
| Express.js | Web framework |
| MongoDB | Database |
| Mongoose | ODM for MongoDB |
| JWT | Authentication tokens |
| bcryptjs | Password hashing |
| Multer | File uploads |
| Helmet | Security headers |
| Express Rate Limit | API rate limiting |
| Morgan | HTTP request logger |
| Express Validator | Input validation |

### Frontend
| Technology | Purpose |
|-----------|---------|
| React.js | UI library |
| Vite | Build tool |
| React Router DOM v6 | Client-side routing |
| Axios | HTTP client with interceptors |
| Context API | State management |
| date-fns | Date formatting |

---

## 📁 Project Structure

```
university-management-system/
│
├── university-backend/
│   ├── config/
│   │   └── db.js                  # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js      # Login, getMe, changePassword
│   │   ├── adminController.js     # User, Subject, Enrollment, Analytics
│   │   ├── teacherController.js   # Attendance, Lectures, Assignments, Grading
│   │   ├── studentController.js   # Profile, Subjects, Lectures, Submissions
│   │   └── announcementController.js
│   ├── middleware/
│   │   ├── auth.js                # JWT verification
│   │   ├── roleCheck.js           # Role-based access control
│   │   └── upload.js              # Multer file upload
│   ├── models/
│   │   ├── User.js
│   │   ├── Subject.js
│   │   ├── Enrollment.js
│   │   ├── Attendance.js
│   │   ├── Assignment.js
│   │   ├── Submission.js
│   │   ├── Lecture.js
│   │   └── Announcement.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── adminRoutes.js
│   │   ├── teacherRoutes.js
│   │   ├── studentRoutes.js
│   │   └── announcementRoutes.js
│   ├── uploads/                   # Uploaded files
│   ├── .env.example
│   ├── seedAdmin.js               # Admin seeder
│   └── server.js                  # Entry point
│
└── university-frontend/
    ├── src/
    │   ├── components/
    │   │   ├── common/
    │   │   │   ├── Navbar.jsx
    │   │   │   ├── Sidebar.jsx
    │   │   │   ├── Modal.jsx
    │   │   │   ├── Toast.jsx
    │   │   │   └── LoadingSpinner.jsx
    │   │   ├── admin/
    │   │   │   ├── AdminDashboard.jsx
    │   │   │   ├── UserManagement.jsx
    │   │   │   ├── SubjectManagement.jsx
    │   │   │   ├── EnrollmentManagement.jsx
    │   │   │   └── AdminAnnouncements.jsx
    │   │   ├── teacher/
    │   │   │   ├── TeacherDashboard.jsx
    │   │   │   ├── AttendanceMarking.jsx
    │   │   │   ├── LectureUpload.jsx
    │   │   │   ├── AssignmentManagement.jsx
    │   │   │   ├── GradingPanel.jsx
    │   │   │   └── TeacherAnnouncements.jsx
    │   │   └── student/
    │   │       ├── StudentDashboard.jsx
    │   │       ├── StudentProfile.jsx
    │   │       ├── MySubjects.jsx
    │   │       ├── SubjectLectures.jsx
    │   │       ├── SubmitAssignment.jsx
    │   │       ├── MyAttendance.jsx
    │   │       └── AttendanceCalendar.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── hooks/
    │   │   ├── useAuth.js
    │   │   └── useAlert.js
    │   ├── services/
    │   │   ├── api.js
    │   │   ├── authService.js
    │   │   ├── adminService.js
    │   │   ├── teacherService.js
    │   │   └── studentService.js
    │   ├── utils/
    │   │   └── helpers.js
    │   ├── pages/
    │   │   └── LoginPage.jsx
    │   ├── styles/
    │   │   ├── global.css
    │   │   └── variables.css
    │   ├── App.jsx
    │   └── main.jsx
    └── index.html
```

---

## 🚀Live Demo
https://amnashakeel-dev.github.io/ums/


## 🔐 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@uni.edu | admin123 |
| Teacher | sara@uni.edu | teacher123 |
| Student | ali@uni.edu | student123 |

> **Note:** Teacher and Student accounts must be created by Admin first.

---

## 📡 API Endpoints

### Auth Routes
```
POST   /api/auth/login              # Login user
GET    /api/auth/me                 # Get current user
PUT    /api/auth/change-password    # Change password
```

### Admin Routes
```
POST   /api/admin/users             # Create user
GET    /api/admin/users             # Get all users
PUT    /api/admin/users/:id         # Update user
DELETE /api/admin/users/:id         # Delete user
POST   /api/admin/subjects          # Create subject
GET    /api/admin/subjects          # Get all subjects
PUT    /api/admin/subjects/:id      # Update subject
DELETE /api/admin/subjects/:id      # Delete subject
POST   /api/admin/enrollments       # Enroll student
GET    /api/admin/enrollments       # Get all enrollments
DELETE /api/admin/enrollments/:id   # Remove enrollment
GET    /api/admin/analytics         # Get system analytics
```

### Teacher Routes
```
GET    /api/teacher/subjects                        # My subjects
GET    /api/teacher/subjects/:id/students           # Enrolled students
POST   /api/teacher/attendance                      # Mark attendance
GET    /api/teacher/attendance/:subjectId           # Attendance history
POST   /api/teacher/lectures                        # Upload lecture
GET    /api/teacher/lectures                        # My lectures
DELETE /api/teacher/lectures/:id                    # Delete lecture
POST   /api/teacher/assignments                     # Create assignment
GET    /api/teacher/assignments                     # My assignments
DELETE /api/teacher/assignments/:id                 # Delete assignment
GET    /api/teacher/assignments/:id/submissions     # View submissions
PUT    /api/teacher/submissions/:id/grade           # Grade submission
```

### Student Routes
```
GET    /api/student/profile                    # Get profile
PUT    /api/student/profile                    # Update profile
GET    /api/student/subjects                   # My subjects
GET    /api/student/lectures/:subjectId        # Subject lectures
PUT    /api/student/lectures/:id/download      # Download lecture
GET    /api/student/assignments                # My assignments
POST   /api/student/assignments/:id/submit     # Submit assignment
GET    /api/student/attendance                 # My attendance
GET    /api/student/announcements              # My announcements
PUT    /api/student/announcements/:id/read     # Mark as read
```

### Announcement Routes
```
POST   /api/announcements           # Create announcement
GET    /api/announcements           # Get all announcements
DELETE /api/announcements/:id       # Delete announcement
PUT    /api/announcements/:id/read  # Mark as read
```

---

## 👥 User Roles & Permissions

```
ADMIN
├── Create/Edit/Delete all users
├── Create/Edit/Delete subjects
├── Assign teachers to subjects
├── Enroll/Remove students from subjects
├── Create system-wide announcements
└── View analytics dashboard

TEACHER
├── View assigned subjects
├── Mark student attendance
├── Upload lecture materials
├── Create and manage assignments
├── Grade student submissions
└── Create class announcements

STUDENT
├── View enrolled subjects
├── Access lecture materials (enrolled only)
├── Submit assignments
├── View grades and feedback
├── Track attendance with calculator
├── View attendance calendar
└── View profile and change password
```

---



## 🔒 Security Features

- JWT tokens with 24h expiration
- bcrypt password hashing (12 salt rounds)
- Helmet.js security headers
- CORS configuration
- Rate limiting (100 requests / 15 minutes)
- Role-based route protection
- Input validation on all endpoints
- No public registration — admin only

---

## 📝 License

This project is licensed under the MIT Licence

**Built with ❤️ using MERN Stack**

⭐ Star this repo if you found it helpful!

``
