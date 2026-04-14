import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Auth from "./components/auth/Auth";
import ProfileSetup from "./components/auth/ProfileSetup";
import Dashboard from "./components/dashboard/Dashboard";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Auth Page (Login + Signup combined) */}
        <Route path="/" element={<Auth />} />

        {/* Profile Setup (after auth, before dashboard) */}
        <Route path="/profile-setup" element={<ProfileSetup />} />

        {/* Dashboard Page */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Redirect unknown routes */}
        <Route path="*" element={<Navigate to="/" />} />

      </Routes>
    </BrowserRouter>
  );
}