import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { Loader2 } from "lucide-react";
import { auth, ADMIN_UID } from "../firebase";

export default function ProtectedRoute({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="loading-screen">
        <Loader2 size={35} className="spinner" />
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (!user || user.uid !== ADMIN_UID) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}