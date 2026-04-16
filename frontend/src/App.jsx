import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Auth from "./components/auth/Auth";
import ProfileSetup from "./components/auth/ProfileSetup";
import Dashboard from "./components/dashboard/Dashboard";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Auth Page */}
        <Route path="/login" element={<Auth />} />

        {/* Profile Setup (after auth, before dashboard) */}
        <Route path="/profile-setup" element={<ProfileSetup />} />

        {/* Dashboard Pages */}
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/daily-log" element={<Dashboard />} />
        <Route path="/risk-score" element={<Dashboard />} />
        <Route path="/ai-insights" element={<Dashboard />} />
        <Route path="/members" element={<Dashboard />} />
        <Route path="/reports" element={<Dashboard />} />
        <Route path="/settings" element={<Dashboard />} />

        {/* Redirect unknown routes */}
        <Route path="*" element={<Navigate to="/" />} />

      </Routes>
    </BrowserRouter>
  );
}