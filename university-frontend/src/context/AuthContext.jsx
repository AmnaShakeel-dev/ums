import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    // Page reload pe localStorage se user lo
    useEffect(() => {
        const savedToken = localStorage.getItem("token");
        const savedUser = localStorage.getItem("user");

        if (savedToken && savedUser) {
            setToken(savedToken);
            setUser(JSON.parse(savedUser));
        }

        setLoading(false);
    }, []);

    // Login function
    const login = (userData, userToken) => {
        setUser(userData);
        setToken(userToken);
        localStorage.setItem("token", userToken);
        localStorage.setItem("user", JSON.stringify(userData));
    };

    // Logout function
    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
    };

    // User update karo (profile update ke baad)
    const updateUser = (updatedUser) => {
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
    };

    const value = {
        user,
        token,
        loading,
        login,
        logout,
        updateUser,
        isAdmin: user?.role === "admin",
        isTeacher: user?.role === "teacher",
        isStudent: user?.role === "student",
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};