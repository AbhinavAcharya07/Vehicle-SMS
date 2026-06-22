import { useState } from "react";
import { FiMail, FiLock, FiX, FiShield } from "react-icons/fi";
import { radius } from "../theme";
import FormField from "./FormField";
import MessageBanner from "./MessageBanner";
import {
  forgotPassword,
  verifyOtp as verifyOtpApi,
  resetPassword,
} from "../api";

const STAGE = { EMAIL: "email", OTP: "otp", RESET: "reset" };

export default function ForgotPasswordModal({ palette, role, onClose }) {
  const [stage, setStage] = useState(STAGE.EMAIL);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    setIsSubmitting(true);
    try {
      await forgotPassword({ role, email });
      setFormSuccess(
        "If an account exists for this email, an OTP has been sent.",
      );
      setStage(STAGE.OTP);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    setIsSubmitting(true);
    try {
      await verifyOtpApi({ role, email, otp });
      setStage(STAGE.RESET);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    if (newPassword !== confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }
    setIsSubmitting(true);
    try {
      await resetPassword({ role, email, newPassword });
      setFormSuccess("Password updated. You can sign in now.");
      // Close the modal after 2 seconds so the user can read the message
      setTimeout(onClose, 2000);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "92vw",
          maxWidth: "420px",
          background: palette.panel,
          border: `1px solid ${palette.panelBorder}`,
          borderRadius: radius.lg,
          padding: "32px 28px",
          position: "relative",
          boxSizing: "border-box",
        }}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            background: "none",
            border: "none",
            color: palette.textFaint,
            cursor: "pointer",
          }}
        >
          <FiX size={18} />
        </button>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: radius.sm,
              background: palette.accent,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 12px",
            }}
          >
            {stage === STAGE.RESET ? (
              <FiLock size={20} color="#fff" />
            ) : (
              <FiShield size={20} color="#fff" />
            )}
          </div>
          <h2 style={{ color: palette.text, fontSize: "18px", margin: 0 }}>
            {stage === STAGE.EMAIL && "Reset your password"}
            {stage === STAGE.OTP && "Enter verification code"}
            {stage === STAGE.RESET && "Create a new password"}
          </h2>
          <p
            style={{
              color: palette.textMuted,
              fontSize: "13px",
              marginTop: "6px",
            }}
          >
            {stage === STAGE.EMAIL &&
              "We'll send a one-time code to your Gmail."}
            {stage === STAGE.OTP && `Code sent to ${email || "your email"}.`}
            {stage === STAGE.RESET &&
              "Your code is verified. Choose a new password."}
          </p>
        </div>

        <MessageBanner type="error" message={formError} />
        <MessageBanner type="success" message={formSuccess} />

        {/* Stage 1: EMAIL */}
        {stage === STAGE.EMAIL && (
          <form onSubmit={handleSendOtp}>
            <FormField
              label="Gmail Address"
              icon={FiMail}
              type="email"
              placeholder="you@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <StageButton
              palette={palette}
              loading={isSubmitting}
              label="Send OTP"
            />
          </form>
        )}

        {/* Stage 2: OTP */}
        {stage === STAGE.OTP && (
          <form onSubmit={handleVerifyOtp}>
            <FormField
              label="6-Digit OTP"
              icon={FiShield}
              placeholder="e.g. 482913"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              required
            />
            <StageButton
              palette={palette}
              loading={isSubmitting}
              label="Verify OTP"
            />
            <ResendLink
              palette={palette}
              onClick={() => handleSendOtp({ preventDefault: () => {} })}
            />
          </form>
        )}

        {/* Stage 3: RESET */}
        {stage === STAGE.RESET && (
          <form onSubmit={handleResetPassword}>
            <FormField
              label="New Password"
              icon={FiLock}
              type="password"
              placeholder="Enter a new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <FormField
              label="Confirm New Password"
              icon={FiLock}
              type="password"
              placeholder="Re-enter the new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <StageButton
              palette={palette}
              loading={isSubmitting}
              label="Update Password"
            />
          </form>
        )}
      </div>
    </div>
  );
}

function StageButton({ palette, loading, label }) {
  return (
    <button
      type="submit"
      disabled={loading}
      style={{
        width: "100%",
        background: loading ? palette.accentHover : palette.accent,
        border: "none",
        borderRadius: radius.sm,
        padding: "13px 0",
        color: "#fff",
        fontSize: "15px",
        fontWeight: 600,
        cursor: loading ? "not-allowed" : "pointer",
        opacity: loading ? 0.8 : 1,
        marginTop: "4px",
      }}
    >
      {loading ? "Please wait..." : label}
    </button>
  );
}

function ResendLink({ palette, onClick }) {
  return (
    <p
      style={{
        textAlign: "center",
        color: palette.textMuted,
        fontSize: "13px",
        marginTop: "16px",
      }}
    >
      Didn&apos;t get a code?{" "}
      <button
        type="button"
        onClick={onClick}
        style={{
          background: "none",
          border: "none",
          color: palette.accent,
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        Resend OTP
      </button>
    </p>
  );
}
