import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FiTool,
  FiShield,
  FiUsers,
  FiBarChart2,
  FiSettings,
  FiLock,
  FiEye,
  FiEyeOff,
  FiUser,
  FiMail,
  FiHash,
} from "react-icons/fi";
import { adminColors as colors, radius } from "../theme";
import FormField from "./FormField";
import MessageBanner from "./MessageBanner";
import ForgotPasswordModal from "./ForgotPasswordModal";
import { loginStaff, registerStaff, saveSession } from "../api";
import { useAdminAuth } from "../adminPortal/context/AdminAuthContext";

const ADMIN_FEATURES = [
  { icon: FiUsers, label: "Manage customers & technicians" },
  { icon: FiBarChart2, label: "Service analytics & reports" },
  { icon: FiSettings, label: "Workshop & job scheduling" },
];

export default function AdminPortal() {
  const navigate = useNavigate();
  const { setUser } = useAdminAuth();

  const [activeTab, setActiveTab] = useState("signin");
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const [loginEmail, setLoginEmail] = useState("");
  const [staffId, setStaffId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [adminGmail, setAdminGmail] = useState("");
  const [staffGmail, setStaffGmail] = useState("");
  const [regStaffId, setRegStaffId] = useState("");
  const [regPassword, setRegPassword] = useState("");

  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    setIsSubmitting(true);
    try {
      const data = await loginStaff({
        staffGmail: loginEmail,
        staffId,
        password,
      });
      saveSession(data.token, data.user);
      setUser(data.user);
      setFormSuccess("Signed in successfully. Redirecting...");
      navigate("/admin/dashboard");
    } catch (err) {
      setFormError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    setIsSubmitting(true);
    try {
      const data = await registerStaff({
        adminGmail,
        staffGmail,
        staffId: regStaffId,
        password: regPassword,
      });
      saveSession(data.token, data.user);
      setFormSuccess("Account created successfully. You can now sign in.");
    } catch (err) {
      setFormError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* ── Portal switcher ── */}
      <div
        style={{
          position: "fixed",
          top: 20,
          right: 24,
          zIndex: 10,
          display: "flex",
          gap: 6,
          background: colors.panel,
          border: `1px solid ${colors.panelBorder}`,
          borderRadius: 999,
          padding: 4,
          boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
        }}
      >
        {/* Inactive — Customer */}
        <Link
          to="/login"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "transparent",
            borderRadius: 999,
            padding: "8px 14px",
            color: colors.textMuted,
            fontSize: 13,
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          <FiUser size={14} /> Customer
        </Link>
        {/* Active — Admin */}
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: colors.accent,
            borderRadius: 999,
            padding: "8px 14px",
            color: "#fff",
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          <FiShield size={14} /> Admin
        </span>
      </div>

      <div className="autotrack-admin-grid">
        <style>{`
          .autotrack-admin-grid {
            width: 100vw;
            min-height: 100vh;
            margin: 0;
            background: ${colors.bg};
            box-sizing: border-box;
            font-family: 'Inter', system-ui, sans-serif;
            display: grid;
            grid-template-columns: 1fr min(440px, 92vw) 1fr;
            align-items: center;
            gap: 32px;
            padding: 96px 24px 40px;
          }
          @media (max-width: 860px) {
            .autotrack-admin-grid {
              grid-template-columns: 1fr;
              padding: 96px 20px 40px;
            }
            .autotrack-admin-grid > .autotrack-left-panel {
              justify-self: center !important;
              margin: 0 auto 24px;
            }
          }
        `}</style>

        {/* LEFT panel */}
        <div
          className="autotrack-left-panel"
          style={{ justifySelf: "end", width: "100%", maxWidth: "320px" }}
        >
          <div style={{ marginBottom: "24px" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: radius.sm,
                background: colors.accent,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "14px",
              }}
            >
              <FiTool size={22} color="#fff" />
            </div>
            <h1 style={{ color: colors.text, fontSize: "24px", margin: 0 }}>
              AutoTrack
            </h1>
            <p
              style={{
                color: colors.textMuted,
                fontSize: "14px",
                marginTop: "8px",
                lineHeight: 1.5,
              }}
            >
              Workshop console for managing staff, customers, and service jobs.
            </p>
          </div>
          <div style={{ display: "grid", gap: "10px" }}>
            {ADMIN_FEATURES.map(({ icon: Icon, label }) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  background: colors.panel,
                  border: `1px solid ${colors.panelBorder}`,
                  borderRadius: radius.sm,
                  padding: "14px 16px",
                  fontSize: "14px",
                  color: colors.textMuted,
                }}
              >
                <Icon size={16} color={colors.accent} />
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* CENTER card */}
        <div
          style={{
            width: "100%",
            background: colors.panel,
            border: `1px solid ${colors.panelBorder}`,
            borderRadius: radius.lg,
            padding: "36px 32px",
            boxSizing: "border-box",
          }}
        >
          {/* Brand header */}
          <div style={{ textAlign: "center", marginBottom: "28px" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: radius.sm,
                background: colors.accent,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 14px",
              }}
            >
              <FiTool size={22} color="#fff" />
            </div>
            <h1 style={{ color: colors.text, fontSize: "22px", margin: 0 }}>
              AutoTrack
            </h1>
            <p
              style={{
                color: colors.textMuted,
                fontSize: "13px",
                marginTop: "6px",
              }}
            >
              Workshop Admin Console
            </p>
          </div>

          {/* Tabs */}
          <div
            style={{
              display: "flex",
              borderBottom: `1px solid ${colors.panelBorder}`,
              marginBottom: "22px",
            }}
          >
            {["signin", "register"].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setFormError(null);
                  setFormSuccess(null);
                }}
                style={{
                  flex: 1,
                  background: "none",
                  border: "none",
                  padding: "10px 0 14px",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                  color: activeTab === tab ? colors.accent : colors.textMuted,
                  borderBottom:
                    activeTab === tab
                      ? `2px solid ${colors.accent}`
                      : "2px solid transparent",
                }}
              >
                {tab === "signin" ? "Sign In" : "Register Staff"}
              </button>
            ))}
          </div>

          {/* Portal pill */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              background: colors.accentSoftBg,
              border: `1px solid ${colors.accent}`,
              color: colors.accent,
              borderRadius: "999px",
              padding: "6px 14px",
              fontSize: "13px",
              fontWeight: 600,
              marginBottom: "22px",
            }}
          >
            <FiShield size={14} /> Admin Portal
          </div>

          <MessageBanner type="error" message={formError} />
          <MessageBanner type="success" message={formSuccess} />

          {activeTab === "signin" ? (
            <form onSubmit={handleSignIn}>
              <FormField
                label="Gmail Address"
                icon={FiMail}
                type="email"
                placeholder="you@gmail.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
              />
              <FormField
                label="Staff ID"
                icon={FiUser}
                placeholder="e.g. AT-EMP-0231"
                hint="Issued when you registered"
                value={staffId}
                onChange={(e) => setStaffId(e.target.value)}
                required
              />
              <FormField
                label="Password"
                icon={FiLock}
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                rightSlot={
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: colors.textFaint,
                    }}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <FiEyeOff size={16} />
                    ) : (
                      <FiEye size={16} />
                    )}
                  </button>
                }
              />
              <div style={{ textAlign: "right", marginBottom: "20px" }}>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    color: colors.accent,
                    fontSize: "13px",
                    cursor: "pointer",
                  }}
                >
                  Forgot password?
                </button>
              </div>
              <SubmitButton
                label="Sign In to Admin Console"
                loading={isSubmitting}
              />
              <p
                style={{
                  textAlign: "center",
                  color: colors.textMuted,
                  fontSize: "13px",
                  marginTop: "18px",
                }}
              >
                New staff member?{" "}
                <button
                  type="button"
                  onClick={() => setActiveTab("register")}
                  style={{
                    background: "none",
                    border: "none",
                    color: colors.accent,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Register here
                </button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleRegister}>
              <FormField
                label="Admin Gmail"
                icon={FiMail}
                type="email"
                placeholder="admin@gmail.com"
                hint="The organization / admin you're joining"
                value={adminGmail}
                onChange={(e) => setAdminGmail(e.target.value)}
                required
              />
              <FormField
                label="Your Staff Gmail"
                icon={FiMail}
                type="email"
                placeholder="you@gmail.com"
                hint="This is the email you'll sign in with"
                value={staffGmail}
                onChange={(e) => setStaffGmail(e.target.value)}
                required
              />
              <FormField
                label="Staff ID"
                icon={FiHash}
                placeholder="e.g. AT-EMP-0231"
                hint="Pick a unique ID — this can't be reused by anyone else"
                value={regStaffId}
                onChange={(e) => setRegStaffId(e.target.value)}
                required
              />
              <FormField
                label="Create Password"
                icon={FiLock}
                type="password"
                placeholder="Create a password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                required
              />
              <SubmitButton
                label="Create Staff Account"
                loading={isSubmitting}
              />
              <p
                style={{
                  textAlign: "center",
                  color: colors.textMuted,
                  fontSize: "13px",
                  marginTop: "18px",
                }}
              >
                Already registered?{" "}
                <button
                  type="button"
                  onClick={() => setActiveTab("signin")}
                  style={{
                    background: "none",
                    border: "none",
                    color: colors.accent,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Sign in
                </button>
              </p>
            </form>
          )}
        </div>

        {showForgotPassword && (
          <ForgotPasswordModal
            palette={colors}
            role="staff"
            onClose={() => setShowForgotPassword(false)}
          />
        )}
      </div>
    </>
  );
}

function SubmitButton({ label, loading }) {
  return (
    <button
      type="submit"
      disabled={loading}
      style={{
        width: "100%",
        background: loading ? colors.accentHover : colors.accent,
        border: "none",
        borderRadius: radius.sm,
        padding: "13px 0",
        color: "#fff",
        fontSize: "15px",
        fontWeight: 600,
        cursor: loading ? "not-allowed" : "pointer",
        opacity: loading ? 0.8 : 1,
      }}
    >
      {loading ? "Please wait..." : label}
    </button>
  );
}
