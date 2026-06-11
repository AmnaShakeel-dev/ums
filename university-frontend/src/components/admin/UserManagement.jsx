import { useState, useEffect } from "react";
import adminService from "../../services/adminService";
import Modal from "../common/Modal";
import Toast from "../common/Toast";
import LoadingSpinner from "../common/LoadingSpinner";
import { formatDate } from "../../utils/helpers";

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editUser, setEditUser] = useState(null);
    const [toast, setToast] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        role: "student",
        department: "",
        phone: "",
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await adminService.getAllUsers();
            setUsers(res.users);
        } catch (error) {
            showToast("Failed to fetch users.", "error");
        } finally {
            setLoading(false);
        }
    };

    const showToast = (message, type = "success") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleOpenCreate = () => {
        setEditUser(null);
        setForm({
            name: "",
            email: "",
            password: "",
            role: "student",
            department: "",
            phone: "",
        });
        setShowModal(true);
    };

    const handleOpenEdit = (user) => {
        setEditUser(user);
        setForm({
            name: user.name,
            email: user.email,
            password: "",
            role: user.role,
            department: user.department || "",
            phone: user.phone || "",
        });
        setShowModal(true);
    };

    const handleSubmit = async () => {
        if (!form.name || !form.email || (!editUser && !form.password)) {
            showToast("Please fill all required fields.", "error");
            return;
        }

        try {
            if (editUser) {
                await adminService.updateUser(editUser._id, form);
                showToast("User updated successfully.");
            } else {
                await adminService.createUser(form);
                showToast("User created successfully.");
            }
            setShowModal(false);
            fetchUsers();
        } catch (error) {
            showToast(
                error.response?.data?.message || "Operation failed.",
                "error"
            );
        }
    };

    const handleDelete = async (id) => {
        try {
            await adminService.deleteUser(id);
            showToast("User deleted successfully.");
            setDeleteConfirm(null);
            fetchUsers();
        } catch (error) {
            showToast(
                error.response?.data?.message || "Delete failed.",
                "error"
            );
        }
    };

    const filteredUsers = users.filter((u) => {
        const matchSearch =
            u.name.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase()) ||
            (u.department || "").toLowerCase().includes(search.toLowerCase());
        const matchRole = roleFilter ? u.role === roleFilter : true;
        return matchSearch && matchRole;
    });

    if (loading) return <LoadingSpinner />;

    return (
        <div>
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            {/* Page Header */}
            <div style={styles.pageHeader}>
                <div>
                    <h1 style={styles.pageTitle}>User Management</h1>
                    <p style={styles.pageSubtitle}>
                        Create and manage user accounts
                    </p>
                </div>
                <button onClick={handleOpenCreate} style={styles.createBtn}>
                    + Create User
                </button>
            </div>

            {/* Filters */}
            <div style={styles.filters}>
                <div style={styles.searchBox}>
                    <span style={styles.searchIcon}>🔍</span>
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name, email, department..."
                        style={styles.searchInput}
                    />
                </div>
                <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    style={styles.filterSelect}
                >
                    <option value="">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="teacher">Teacher</option>
                    <option value="student">Student</option>
                </select>
            </div>

            {/* Users Table */}
            <div style={styles.tableContainer}>
                <table style={styles.table}>
                    <thead>
                        <tr style={styles.tableHead}>
                            {["Name", "Email", "Role", "Department", "Phone", "Joined", "Actions"].map((h) => (
                                <th key={h} style={styles.th}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan={7} style={styles.emptyState}>
                                    No users found.
                                </td>
                            </tr>
                        ) : (
                            filteredUsers.map((user) => (
                                <tr key={user._id} style={styles.tableRow}>
                                    <td style={styles.td}>
                                        <div style={styles.userCell}>
                                            <div style={styles.avatar}>
                                                {user.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                                            </div>
                                            <span style={styles.userName}>{user.name}</span>
                                        </div>
                                    </td>
                                    <td style={styles.td}>{user.email}</td>
                                    <td style={styles.td}>
                                        <span style={{
                                            ...styles.badge,
                                            ...(user.role === "admin"
                                                ? styles.badgeAdmin
                                                : user.role === "teacher"
                                                    ? styles.badgeTeacher
                                                    : styles.badgeStudent),
                                        }}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td style={styles.td}>{user.department || "—"}</td>
                                    <td style={styles.td}>{user.phone || "—"}</td>
                                    <td style={styles.td}>{formatDate(user.createdAt)}</td>
                                    <td style={styles.td}>
                                        <div style={styles.actions}>
                                            <button
                                                onClick={() => handleOpenEdit(user)}
                                                style={styles.editBtn}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => setDeleteConfirm(user)}
                                                style={styles.deleteBtn}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create / Edit Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editUser ? "Edit User" : "Create New User"}
            >
                <div>
                    {[
                        { label: "Full Name *", key: "name", type: "text", placeholder: "Dr. John Doe" },
                        { label: "Email *", key: "email", type: "email", placeholder: "john@uni.edu" },
                        { label: editUser ? "New Password (optional)" : "Password *", key: "password", type: "password", placeholder: "••••••••" },
                        { label: "Department", key: "department", type: "text", placeholder: "Computer Science" },
                        { label: "Phone", key: "phone", type: "text", placeholder: "0300-0000000" },
                    ].map((f) => (
                        <div key={f.key} style={styles.formGroup}>
                            <label style={styles.label}>{f.label}</label>
                            <input
                                type={f.type}
                                placeholder={f.placeholder}
                                value={form[f.key]}
                                onChange={(e) =>
                                    setForm((p) => ({ ...p, [f.key]: e.target.value }))
                                }
                                style={styles.input}
                            />
                        </div>
                    ))}

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Role *</label>
                        <select
                            value={form.role}
                            onChange={(e) =>
                                setForm((p) => ({ ...p, role: e.target.value }))
                            }
                            style={styles.input}
                        >
                            <option value="student">Student</option>
                            <option value="teacher">Teacher</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>

                    <div style={styles.modalActions}>
                        <button
                            onClick={() => setShowModal(false)}
                            style={styles.cancelBtn}
                        >
                            Cancel
                        </button>
                        <button onClick={handleSubmit} style={styles.submitBtn}>
                            {editUser ? "Update User" : "Create User"}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Delete Confirm Modal */}
            <Modal
                isOpen={!!deleteConfirm}
                onClose={() => setDeleteConfirm(null)}
                title="Confirm Delete"
                size="sm"
            >
                <div>
                    <p style={styles.confirmText}>
                        Are you sure you want to delete{" "}
                        <strong>{deleteConfirm?.name}</strong>? This action cannot be
                        undone.
                    </p>
                    <div style={styles.modalActions}>
                        <button
                            onClick={() => setDeleteConfirm(null)}
                            style={styles.cancelBtn}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => handleDelete(deleteConfirm._id)}
                            style={styles.deleteBtnModal}
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </Modal>

        </div>
    );
};

const styles = {
    pageHeader: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
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
    createBtn: {
        background: "#2563eb",
        color: "#fff",
        border: "none",
        borderRadius: "8px",
        padding: "9px 16px",
        fontSize: "13px",
        fontWeight: "500",
        cursor: "pointer",
    },
    filters: {
        display: "flex",
        gap: "12px",
        marginBottom: "1rem",
    },
    searchBox: {
        flex: 1,
        position: "relative",
    },
    searchIcon: {
        position: "absolute",
        left: "10px",
        top: "50%",
        transform: "translateY(-50%)",
        fontSize: "14px",
    },
    searchInput: {
        width: "100%",
        padding: "9px 12px 9px 34px",
        border: "0.5px solid #e2e8f0",
        borderRadius: "8px",
        fontSize: "13px",
        outline: "none",
        boxSizing: "border-box",
        background: "#fff",
    },
    filterSelect: {
        padding: "9px 12px",
        border: "0.5px solid #e2e8f0",
        borderRadius: "8px",
        fontSize: "13px",
        outline: "none",
        background: "#fff",
        cursor: "pointer",
    },
    tableContainer: {
        background: "#ffffff30",
        borderRadius: "12px",
        border: "0.5px solid #e2e8f0",
        overflow: "hidden",
    },
    table: {
        width: "100%",
        borderCollapse: "collapse",
    },
    tableHead: {
        background: "#f8fafc",
    },
    th: {
        padding: "10px 16px",
        textAlign: "left",
        fontSize: "11px",
        fontWeight: "600",
        color: "#64748b",
        textTransform: "uppercase",
        letterSpacing: "0.5px",
        borderBottom: "0.5px solid #e2e8f0",
    },
    tableRow: {
        borderBottom: "0.5px solid #f1f5f9",
    },
    td: {
        padding: "12px 16px",
        fontSize: "13px",
        color: "#374151",
    },
    userCell: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
    },
    avatar: {
        width: "32px",
        height: "32px",
        borderRadius: "50%",
        background: "#dbeafe",
        color: "#1e40af",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "11px",
        fontWeight: "600",
        flexShrink: 0,
    },
    userName: {
        fontWeight: "500",
        color: "#1e293b",
    },
    badge: {
        padding: "3px 10px",
        borderRadius: "99px",
        fontSize: "11px",
        fontWeight: "500",
    },
    badgeAdmin: {
        background: "#ede9fe",
        color: "#5b21b6",
    },
    badgeTeacher: {
        background: "#dcfce7",
        color: "#15803d",
    },
    badgeStudent: {
        background: "#dbeafe",
        color: "#1e40af",
    },
    actions: {
        display: "flex",
        gap: "6px",
    },
    editBtn: {
        background: "#dbeafe",
        color: "#1e40af",
        border: "none",
        borderRadius: "6px",
        padding: "4px 10px",
        fontSize: "12px",
        cursor: "pointer",
    },
    deleteBtn: {
        background: "#fee2e2",
        color: "#991b1b",
        border: "none",
        borderRadius: "6px",
        padding: "4px 10px",
        fontSize: "12px",
        cursor: "pointer",
    },
    emptyState: {
        textAlign: "center",
        padding: "2rem",
        color: "#64748b",
        fontSize: "13px",
    },
    formGroup: {
        marginBottom: "1rem",
    },
    label: {
        display: "block",
        fontSize: "12px",
        fontWeight: "600",
        color: "#475569",
        marginBottom: "5px",
        textTransform: "uppercase",
        letterSpacing: "0.5px",
    },
    input: {
        width: "100%",
        padding: "9px 12px",
        border: "0.5px solid #e2e8f0",
        borderRadius: "8px",
        fontSize: "13px",
        outline: "none",
        boxSizing: "border-box",
        background: "#fff",
        color: "#1e293b",
    },
    modalActions: {
        display: "flex",
        gap: "8px",
        justifyContent: "flex-end",
        marginTop: "1.25rem",
    },
    cancelBtn: {
        padding: "8px 16px",
        background: "transparent",
        border: "0.5px solid #e2e8f0",
        borderRadius: "8px",
        fontSize: "13px",
        cursor: "pointer",
        color: "#374151",
    },
    submitBtn: {
        padding: "8px 16px",
        background: "#2563eb",
        color: "#fff",
        border: "none",
        borderRadius: "8px",
        fontSize: "13px",
        cursor: "pointer",
        fontWeight: "500",
    },
    deleteBtnModal: {
        padding: "8px 16px",
        background: "#dc2626",
        color: "#fff",
        border: "none",
        borderRadius: "8px",
        fontSize: "13px",
        cursor: "pointer",
        fontWeight: "500",
    },
    confirmText: {
        fontSize: "14px",
        color: "#374151",
        marginBottom: "1rem",
        lineHeight: "1.6",
    },
};

export default UserManagement;