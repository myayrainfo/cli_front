import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../core/auth/AuthContext";

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
      <div className="login-panel">
        <div className="login-copy">
          <p className="eyebrow">ARYA Clinic ERP</p>
          <h1>Pharmacy-first clinic management platform</h1>
          <p>
            Unified dashboard for inventory, billing, clinic workflows, supplier dues,
            customer reminders, and operational reporting.
          </p>

          <div className="dev-creds">
            <strong>Development seeded login</strong>
            <span>Email: owner@arya-clinic.com</span>
            <span>Password: Owner@123</span>
          </div>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <label>
            Email
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              placeholder="owner@arya-clinic.com"
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
              placeholder="Enter your password"
            />
          </label>

          {error ? <div className="error-banner">{error}</div> : null}

          <button className="primary-button" type="submit" disabled={submitting}>
            {submitting ? "Signing in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
