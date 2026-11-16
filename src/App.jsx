import {
  HashRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import EnquiryForm from "./pages/EnquiryForm";
import AdminLogin from "./pages/AdminLogin";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <HashRouter>
      <Routes>

        <Route path="/" element={<EnquiryForm />} />

        <Route path="/enquiry" element={<EnquiryForm />} />

        <Route path="/admin/login" element={<AdminLogin />} />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={<Navigate to="/admin/dashboard" replace />}
        />

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>
    </HashRouter>
  );
}