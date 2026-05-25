import { motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  PillBottle,
  Plus,
  Receipt,
  ShieldCheck,
  Stethoscope,
  Syringe,
} from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../core/auth/AuthContext";

const featureCards = [
  {
    title: "Smart Pharmacy Inventory",
    description: "Track stock in real time, manage expiries, and never run out of essentials.",
    icon: PillBottle,
  },
  {
    title: "Fast Billing & Invoices",
    description: "Create invoices in seconds, accept payments, and streamline collections.",
    icon: Receipt,
  },
  {
    title: "Patient & Supplier Tracking",
    description: "Keep patient records and supplier details organized and always up to date.",
    icon: Stethoscope,
  },
];

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [form, setForm] = useState({
    email: "owner@arya-clinic.com",
    password: "Owner@123",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await login(form);
      navigate(location.state?.from?.pathname || "/", { replace: true });
    } catch (submitError) {
      setError(submitError.response?.data?.message || "Unable to login.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-shell">
      <div className="login-backdrop-orb login-backdrop-orb-a" aria-hidden="true" />
      <div className="login-backdrop-orb login-backdrop-orb-b" aria-hidden="true" />
      <div className="login-backdrop-orb login-backdrop-orb-c" aria-hidden="true" />
      <div className="login-grid">
        <motion.section
          className="login-showcase"
          initial={{ opacity: 0, x: -32 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="login-copy">
            <div className="login-badge">
              <span className="login-badge-icon" aria-hidden="true">
                <Plus size={14} strokeWidth={2.8} />
              </span>
              <span>AYRA CLINIC ERP</span>
            </div>

            <div className="login-copy-stack">
              <h1>Pharmacy-first clinic management platform</h1>
              <p>
                Manage medicines, billing, patients, suppliers, reminders, and clinic
                operations from one connected workspace.
              </p>
            </div>

            <div className="login-feature-grid">
              {featureCards.map(({ title, description, icon: Icon }, index) => (
                <motion.article
                  key={title}
                  className="login-feature-card"
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.18 + index * 0.1, ease: "easeOut" }}
                >
                  <span className="login-feature-icon" aria-hidden="true">
                    <Icon size={26} />
                  </span>
                  <strong>{title}</strong>
                  <p>{description}</p>
                </motion.article>
              ))}
            </div>

            <div className="login-trust-banner">
              <span className="login-trust-icon" aria-hidden="true">
                <ShieldCheck size={18} />
              </span>
              <p>Built for clinics, pharmacies, and healthcare teams.</p>
            </div>
          </div>

          <div className="login-scene" aria-hidden="true">
            <div className="login-scene-plus login-scene-plus-a">
              <Plus size={28} strokeWidth={2.2} />
            </div>
            <div className="login-scene-plus login-scene-plus-b">
              <Plus size={24} strokeWidth={2.2} />
            </div>
            <div className="login-scene-plus login-scene-plus-c">
              <Plus size={22} strokeWidth={2.2} />
            </div>
            <div className="login-dots" />
            <div className="login-medicine-visual">
              <div className="login-basket">
                <div className="login-basket-grid" />
              </div>
              <div className="login-bottle login-bottle-large" />
              <div className="login-bottle login-bottle-medium" />
              <div className="login-bottle login-bottle-small" />
              <div className="login-pill-strip">
                <span />
                <span />
                <span />
                <span />
              </div>
              <div className="login-capsule login-capsule-a" />
              <div className="login-capsule login-capsule-b" />
              <div className="login-leaf-cluster">
                <span />
                <span />
                <span />
              </div>
              <div className="login-visual-icon login-visual-icon-a">
                <PillBottle size={30} />
              </div>
              <div className="login-visual-icon login-visual-icon-b">
                <Syringe size={24} />
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section
          className="login-panel"
          initial={{ opacity: 0, x: 32 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.08 }}
        >
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="login-form-header">
              <h2>Welcome back</h2>
              <p>Login to continue to your clinic workspace</p>
            </div>

            <label className="login-field">
              <span>Email</span>
              <div className="login-input-shell">
                <Mail size={18} aria-hidden="true" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, email: event.target.value }))
                  }
                  placeholder="owner@arya-clinic.com"
                />
              </div>
            </label>

            <label className="login-field">
              <span>Password</span>
              <div className="login-input-shell">
                <LockKeyhole size={18} aria-hidden="true" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, password: event.target.value }))
                  }
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="login-input-toggle"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>

            <div className="login-meta-row">
              <label className="login-check">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                />
                <span>Remember me</span>
              </label>

              <button type="button" className="login-link-button">
                Forgot password?
              </button>
            </div>

            {error ? (
              <div className="error-banner login-error-banner">
                <strong>Unable to sign in</strong>
                <span>{error}</span>
              </div>
            ) : null}

            <button
              className="primary-button login-submit-button"
              type="submit"
              disabled={submitting}
            >
              {submitting ? "Signing in..." : "Login"}
            </button>

            <div className="login-divider" aria-hidden="true">
              <span />
              <em>or</em>
              <span />
            </div>

            <div className="dev-creds login-dev-card">
              <div className="login-dev-icon" aria-hidden="true">
                <Mail size={18} />
              </div>
              <div className="login-dev-copy">
                <strong>Development seeded login</strong>
                <span>Email: owner@arya-clinic.com</span>
                <span>Password: Owner@123</span>
              </div>
            </div>

            <p className="login-footer-note">
              <ShieldCheck size={14} aria-hidden="true" />
              <span>Secure</span>
              <span className="login-footer-dot">&bull;</span>
              <span>Private</span>
              <span className="login-footer-dot">&bull;</span>
              <span>Trusted</span>
            </p>
          </form>
        </motion.section>
      </div>
    </div>
  );
};

export default LoginPage;
