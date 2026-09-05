import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api/axios.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Restore session on refresh — the httpOnly cookie is sent automatically,
  // so we just ask the server who it belongs to.
  useEffect(() => {
    api
      .get("/auth/me")
      .then((res) => setUser(res.data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const register = async (formData) => {
    const res = await api.post("/auth/register", formData);
    setUser(res.data.user);
    toast.success(res.data.message || "Account created successfully");
    goToDashboard(res.data.user.role);
    return res.data.user;
  };

  const login = async (formData) => {
    const res = await api.post("/auth/login", formData);
    setUser(res.data.user);
    toast.success(res.data.message || "Logged in successfully");
    goToDashboard(res.data.user.role);
    return res.data.user;
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // even if the request fails, clear local state so the UI doesn't get stuck
    }
    setUser(null);
    toast.info("You've been logged out");
    navigate("/login");
  };

  const goToDashboard = (role) => {
    navigate(role === "admin" ? "/admin/dashboard" : role === "recruiter" ? "/recruiter/dashboard" : "/student/dashboard");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
