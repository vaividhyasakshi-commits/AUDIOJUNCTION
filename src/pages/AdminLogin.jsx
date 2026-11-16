import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BrandLogo from "../components/BrandLogo";

import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

import {
  Mail, LockKeyhole, Eye, EyeOff,
  LogIn, Loader2, ShieldCheck,
} from "lucide-react";

import { auth, ADMIN_UID } from "../firebase";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      if (user?.uid === ADMIN_UID) {
        navigate("/admin/dashboard", { replace: true });
      }
    });
  }, [navigate]);

  async function handleLogin(e) {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError("");

    try {
      const result = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      if (result.user.uid !== ADMIN_UID) {
        await signOut(auth);
        setError("You are not authorized to access this dashboard.");
        return;
      }

      navigate("/admin/dashboard", { replace: true });

    } catch (err) {
      console.error(err);

      setError(
        err.code === "auth/too-many-requests"
          ? "Too many attempts. Please try again later."
          : "Invalid email or password."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="public-page audio-junction-page">
      <div className="public-container">

<div className="brand-block">
  <BrandLogo />
  <p>Enquiry Management System</p>
</div>

        <div className="public-card">

          <div className="form-heading">
            <h2>Admin Login</h2>
            <p>Sign in to manage customer enquiries.</p>
          </div>

          <form onSubmit={handleLogin} className="form-stack">

            <div className="form-group">
              <label htmlFor="email">Email Address</label>

              <div className="input-wrapper">
                <Mail size={19} />

                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>

              <div className="input-wrapper">
                <LockKeyhole size={19} />

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  className="icon-button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword
                    ? <EyeOff size={19} />
                    : <Eye size={19} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="error-message" role="alert">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="primary-button"
              disabled={loading}
            >
              {loading
                ? <Loader2 size={19} className="spinner" />
                : <LogIn size={19} />}

              {loading ? "Signing in..." : "Sign In"}
            </button>

          </form>

          <div className="secure-note">
            <ShieldCheck size={17} />
            Authorized personnel only
          </div>
        </div>

      </div>
    </main>
  );
}