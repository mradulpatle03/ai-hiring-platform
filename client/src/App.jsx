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
import Interviews from "./pages/shared/Interviews";
import CandidateProfile from "./pages/candidate/Profile";
import SearchCandidates from "./pages/recruiter/SearchCandidates";

import ErrorBoundary from "./components/ErrorBoundary";
import RouteErrorBoundary from "./components/RouteErrorBoundary";
import NotFound from "./pages/NotFound";
import HomePage from "./pages/Homepage";

const R = ({ children, role }) => (
  <ProtectedRoute role={role}>
    <RouteErrorBoundary>{children}</RouteErrorBoundary>
  </ProtectedRoute>
);

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
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
            path="/recruiter/interviews"
            element={
              <R role="recruiter">
                <Interviews />
              </R>
            }
          />
          <Route
            path="/recruiter/search"
            element={
              <R role="recruiter">
                <SearchCandidates />
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
          <Route
            path="/candidate/interviews"
            element={
              <R role="candidate">
                <Interviews />
              </R>
            }
          />
          <Route
            path="/candidate/interviews/:interviewId"
            element={
              <R role="candidate">
                <Interviews />
              </R>
            }
          />
          <Route
            path="/candidate/profile"
            element={
              <R role="candidate">
                <CandidateProfile />
              </R>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
