import { Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Home from "./Home.jsx"
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import StudentDashboard from "./pages/StudentDashboard.jsx";
import RecruiterDashboard from "./pages/RecruiterDashboard.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import StudentProfile from "./pages/StudentProfile.jsx";
import CareerMatch from "./pages/CareerMatch.jsx";
import JobReadiness from "./pages/Jobreadiness.jsx";
import SkillVerification from "./pages/SkillVerification.jsx";
import SkillQuiz from "./pages/SkillQuiz.jsx";
import CodingChallenge from "./pages/CodingChallenge.jsx";
import JobMatches from "./pages/JobMatches.jsx";
import RecruiterJobs from "./pages/RecruiterJobs.jsx";
import RecruiterCandidates from "./pages/RecruiterCandidates.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import AdminUsers from "./pages/AdminUsers.jsx";
import AdminJobs from "./pages/AdminJobs.jsx";

 function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute allowedRole="student">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/student/profile"
          element={
            <ProtectedRoute allowedRole="student">
              <StudentProfile />
            </ProtectedRoute>
          }
        />

        <Route path="/student/career-match" element={<ProtectedRoute allowedRole="student"><CareerMatch /></ProtectedRoute>} />

        <Route path="/student/job-matches" element={<ProtectedRoute allowedRole="student"><JobMatches /></ProtectedRoute>} />

        <Route path="/student/job-readiness" element={<JobReadiness />} />

        <Route path="/student/skill-verification" element={<SkillVerification />} />
        <Route path="/student/skill-quiz/:category" element={<SkillQuiz />} />
        <Route path="/student/coding-challenge/:category" element={<CodingChallenge />} />



        <Route
          path="/recruiter/dashboard"
          element={
            <ProtectedRoute allowedRole="recruiter">
              <RecruiterDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="/recruiter/jobs" element={<ProtectedRoute allowedRole="recruiter"><RecruiterJobs /></ProtectedRoute>} />
        <Route path="/admin/dashboard" element={<ProtectedRoute allowedRole="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute allowedRole="admin"><AdminUsers /></ProtectedRoute>} />
        <Route path="/admin/jobs" element={<ProtectedRoute allowedRole="admin"><AdminJobs /></ProtectedRoute>} />

        <Route path="/recruiter/candidates" element={<ProtectedRoute allowedRole="recruiter"><RecruiterCandidates /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>

      <ToastContainer position="top-right" autoClose={3500} hideProgressBar closeOnClick theme="light" />
    </>
  );
}

export default App;