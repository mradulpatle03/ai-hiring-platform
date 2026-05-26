import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Unauthorized from "./pages/Unauthorized";

import RecruiterDashboard from "./pages/recruiter/Dashboard";
import MyJobs from "./pages/recruiter/MyJobs";
import PostJob from "./pages/recruiter/PostJob";
import Applicants from "./pages/recruiter/Applicants";

import CandidateDashboard from "./pages/candidate/Dashboard";
import BrowseJobs from "./pages/candidate/BrowseJobs";
import JobDetail from "./pages/candidate/JobDetail";
import MyApplications from "./pages/candidate/MyApplications";
import Messages from "./pages/shared/Messages";
import Analytics from "./pages/recruiter/Analytics";

const R = ({ children, role }) => (
  <ProtectedRoute role={role}>{children}</ProtectedRoute>
);

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          <Route
            path="/recruiter"
            element={
              <R role="recruiter">
                <RecruiterDashboard />
              </R>
            }
          />
          <Route
            path="/recruiter/jobs"
            element={
              <R role="recruiter">
                <MyJobs />
              </R>
            }
          />
          <Route
            path="/recruiter/jobs/new"
            element={
              <R role="recruiter">
                <PostJob />
              </R>
            }
          />
          <Route
            path="/recruiter/jobs/:jobId/applicants"
            element={
              <R role="recruiter">
                <Applicants />
              </R>
            }
          />
          <Route
            path="/recruiter/messages"
            element={
              <R role="recruiter">
                <Messages />
              </R>
            }
          />
          <Route
            path="/recruiter/analytics"
            element={
              <R role="recruiter">
                <Analytics />
              </R>
            }
          />

          <Route
            path="/candidate"
            element={
              <R role="candidate">
                <CandidateDashboard />
              </R>
            }
          />
          <Route
            path="/candidate/jobs"
            element={
              <R role="candidate">
                <BrowseJobs />
              </R>
            }
          />
          <Route
            path="/candidate/jobs/:id"
            element={
              <R role="candidate">
                <JobDetail />
              </R>
            }
          />
          <Route
            path="/candidate/applied"
            element={
              <R role="candidate">
                <MyApplications />
              </R>
            }
          />
          <Route
            path="/candidate/messages"
            element={
              <R role="candidate">
                <Messages />
              </R>
            }
          />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
