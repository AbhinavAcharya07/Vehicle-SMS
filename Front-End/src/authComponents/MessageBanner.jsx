import { FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import { colors, radius } from "../theme";

export default function MessageBanner({ type = "error", message }) {
  if (!message) return null;

  const isError = type === "error";
  const color = isError ? colors.danger : colors.success;
  const Icon = isError ? FiAlertCircle : FiCheckCircle;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "10px",
        background: isError
          ? "rgba(248,113,113,0.08)"
          : "rgba(74,222,128,0.08)",
        border: `1px solid ${color}`,
        borderRadius: radius.sm,
        padding: "12px 14px",
        marginBottom: "18px",
        fontSize: "14px",
        color,
      }}
      role={isError ? "alert" : "status"}
    >
      <Icon size={18} style={{ flexShrink: 0, marginTop: "1px" }} />
      <span>{message}</span>
    </div>
  );
}
