import { useState, useEffect } from "react";
import studentService from "../../services/studentService";
import authService from "../../services/authService";
import Toast from "../common/Toast";
import LoadingSpinner from "../common/LoadingSpinner";
import Modal from "../common/Modal";
import useAuth from "../../hooks/useAuth";
import { formatDate } from "../../utils/helpers";

const StudentProfile = () => {
    const { user, updateUser } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [editModal, setEditModal] = useState(false);
    const [passwordModal, setPasswordModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editForm, setEditForm] = useState({ name: "", phone: "" });
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await studentService.getProfile();
            setProfile(res.user);
            setEditForm({ name: res.user.name, phone: res.user.phone || "" });
        } catch (error) {
            showToast("Failed to fetch profile.", "error");
        } finally {
            setLoading(false);
        }
    };

    const showToast = (message, type = "success") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleUpdateProfile = async () => {
        if (!editForm.name) {
            showToast("Name is required.", "error");
            return;
        }
        setSaving(true);
        try {
            const formData = new FormData();
            formData.append("name", editForm.name);
            formData.append("phone", editForm.phone);
            const res = await studentService.updateProfile(formData);
            setProfile(res.user);
            updateUser(res.user);
            showToast("Profile updated successfully.");
            setEditModal(false);
        } catch (error) {
            showToast("Update failed.", "error");
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async () => {
        if (!passwordForm.currentPassword || !passwordForm.newPassword) {
            showToast("Please fill all fields.", "error");
            return;
        }
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            showToast("New passwords do not match.", "error");
            return;
        }
        if (passwordForm.newPassword.length < 6) {
            showToast("Password must be at least 6 characters.", "error");
            return;
        }
        setSaving(true);
        try {
            await authService.changePassword(
                passwordForm.currentPassword,
                passwordForm.newPassword
            );
            showToast("Password changed successfully.");
            setPasswordModal(false);
            setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        } catch (error) {
            showToast(error.response?.data?.message || "Password change failed.", "error");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <LoadingSpinner />;

    const initials = profile?.name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

    return (
        <div>
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <div style={styles.pageHeader}>
                <h1 style={styles.pageTitle}>My Profile</h1>
                <p style={styles.pageSubtitle}>View and manage your personal information</p>
            </div>

            <div style={styles.profileGrid}>

                {/* Left — Avatar Card */}
                <div style={styles.avatarCard}>
                    <div style={styles.avatarCircle}>{initials}</div>
                    <h2 style={styles.profileName}>{profile?.name}</h2>
                    <span style={styles.roleBadge}>Student</span>
                    <p style={styles.profileDept}>{profile?.department || "No department"}</p>
                    <div style={styles.avatarActions}>
                        <button onClick={() => setEditModal(true)} style={styles.editBtn}>
                            ✏️ Edit Profile
                        </button>
                        <button onClick={() => setPasswordModal(true)} style={styles.passwordBtn}>
                            🔒 Change Password
                        </button>
                    </div>
                </div>

                {/* Right — Info Card */}
                <div style={styles.infoCard}>
                    <div style={styles.infoHeader}>
                        <h2 style={styles.infoTitle}>Personal Information</h2>
                    </div>
                    <div style={styles.infoGrid}>
                        {[
                            { label: "Full Name", value: profile?.name, icon: "👤" },
                            { label: "Email Address", value: profile?.email, icon: "📧" },
                            { label: "Phone Number", value: profile?.phone || "Not provided", icon: "📱" },
                            { label: "Department", value: profile?.department || "Not assigned", icon: "🏛️" },
                            { label: "Role", value: "Student", icon: "🎓" },
                            { label: "Member Since", value: formatDate(profile?.createdAt), icon: "📅" },
                        ].map((item) => (
                            <div key={item.label} style={styles.infoItem}>
                                <div style={styles.infoLabel}>
                                    <span>{item.icon}</span>
                                    <span>{item.label}</span>
                                </div>
                                <div style={styles.infoValue}>{item.value}</div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            {/* Edit Profile Modal */}
            <Modal isOpen={editModal} onClose={() => setEditModal(false)} title="Edit Profile">
                <div>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Full Name *</label>
                        <input
                            value={editForm.name}
                            onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                            placeholder="Your full name"
                            style={styles.input}
                        />
                    </div>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Phone Number</label>
                        <input
                            value={editForm.phone}
                            onChange={(e) => setEditForm((p) => ({ ...p, phone: e.target.value }))}
                            placeholder="0300-0000000"
                            style={styles.input}
                        />
                    </div>
                    <div style={styles.modalActions}>
                        <button onClick={() => setEditModal(false)} style={styles.cancelBtn}>Cancel</button>
                        <button
                            onClick={handleUpdateProfile}
                            disabled={saving}
                            style={{ ...styles.submitBtn, background: saving ? "#94a3b8" : "#2563eb", cursor: saving ? "not-allowed" : "pointer" }}
                        >
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Change Password Modal */}
            <Modal isOpen={passwordModal} onClose={() => setPasswordModal(false)} title="Change Password">
                <div>
                    {[
                        { label: "Current Password", key: "currentPassword", placeholder: "Enter current password" },
                        { label: "New Password", key: "newPassword", placeholder: "Enter new password" },
                        { label: "Confirm New Password", key: "confirmPassword", placeholder: "Confirm new password" },
                    ].map((f) => (
                        <div key={f.key} style={styles.formGroup}>
                            <label style={styles.label}>{f.label}</label>
                            <input
                                type="password"
                                placeholder={f.placeholder}
                                value={passwordForm[f.key]}
                                onChange={(e) => setPasswordForm((p) => ({ ...p, [f.key]: e.target.value }))}
                                style={styles.input}
                            />
                        </div>
                    ))}
                    <div style={styles.passwordHint}>
                        Password must be at least 6 characters long.
                    </div>
                    <div style={styles.modalActions}>
                        <button onClick={() => setPasswordModal(false)} style={styles.cancelBtn}>Cancel</button>
                        <button
                            onClick={handleChangePassword}
                            disabled={saving}
                            style={{ ...styles.submitBtn, background: saving ? "#94a3b8" : "#16a34a", cursor: saving ? "not-allowed" : "pointer" }}
                        >
                            {saving ? "Changing..." : "Change Password"}
                        </button>
                    </div>
                </div>
            </Modal>

        </div>
    );
};

const styles = {
    pageHeader: { marginBottom: "1.5rem" },
    pageTitle: { fontSize: "22px", fontWeight: "600", color: "#1e293b", margin: 0 },
    pageSubtitle: { fontSize: "13px", color: "#64748b", marginTop: "4px" },
    profileGrid: { display: "grid", gridTemplateColumns: "280px 1fr", gap: "16px", alignItems: "start" },
    avatarCard: { background: "#fff", borderRadius: "12px", border: "0.5px solid #e2e8f0", padding: "2rem 1.5rem", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" },
    avatarCircle: { width: "80px", height: "80px", borderRadius: "50%", background: "#2563eb", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", fontWeight: "700", marginBottom: "8px" },
    profileName: { fontSize: "18px", fontWeight: "600", color: "#1e293b", margin: 0 },
    roleBadge: { background: "#dbeafe", color: "#1e40af", padding: "4px 14px", borderRadius: "99px", fontSize: "12px", fontWeight: "600" },
    profileDept: { fontSize: "13px", color: "#64748b", margin: 0 },
    avatarActions: { display: "flex", flexDirection: "column", gap: "8px", width: "100%", marginTop: "8px" },
    editBtn: { width: "100%", padding: "9px", background: "#eff6ff", color: "#2563eb", border: "0.5px solid #bfdbfe", borderRadius: "8px", fontSize: "13px", fontWeight: "500", cursor: "pointer" },
    passwordBtn: { width: "100%", padding: "9px", background: "#f0fdf4", color: "#15803d", border: "0.5px solid #86efac", borderRadius: "8px", fontSize: "13px", fontWeight: "500", cursor: "pointer" },
    infoCard: { background: "#fff", borderRadius: "12px", border: "0.5px solid #e2e8f0", overflow: "hidden" },
    infoHeader: { padding: "1rem 1.5rem", borderBottom: "0.5px solid #e2e8f0", background: "#f8fafc" },
    infoTitle: { fontSize: "15px", fontWeight: "600", color: "#1e293b", margin: 0 },
    infoGrid: { padding: "1rem 1.5rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0" },
    infoItem: { padding: "1rem 0", borderBottom: "0.5px solid #f1f5f9" },
    infoLabel: { display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", fontWeight: "600", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" },
    infoValue: { fontSize: "14px", fontWeight: "500", color: "#1e293b" },
    formGroup: { marginBottom: "1rem" },
    label: { display: "block", fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.5px" },
    input: { width: "100%", padding: "9px 12px", border: "0.5px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", outline: "none", boxSizing: "border-box", background: "#fff", color: "#1e293b" },
    passwordHint: { fontSize: "12px", color: "#94a3b8", marginBottom: "1rem" },
    modalActions: { display: "flex", gap: "8px", justifyContent: "flex-end", marginTop: "1.25rem" },
    cancelBtn: { padding: "8px 16px", background: "transparent", border: "0.5px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", cursor: "pointer", color: "#374151" },
    submitBtn: { padding: "8px 16px", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "500" },
};

export default StudentProfile;