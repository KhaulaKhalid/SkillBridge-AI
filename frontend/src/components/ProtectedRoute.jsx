import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, allowedRole }) {
  const { user, loading } = useAuth();

  if (loading) return null; // could render a spinner here
  if (!user) return <Navigate to="/login" replace/>;

  if (allowedRole && user.role !== allowedRole) {
    // Logged in, but not the right role for this route
    const fallback = user.role === "admin" ? "/admin/dashboard" : user.role === "recruiter" ? "/recruiter/dashboard" : "/student/dashboard";
    return <Navigate to={fallback} replace />;
  }

  return children;
}