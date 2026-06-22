import { colors, radius } from "../theme";

export default function FormField({
  label,
  icon: Icon,
  hint,
  rightSlot,
  ...inputProps
}) {
  return (
    <div style={{ marginBottom: "20px" }}>
      <label
        style={{
          display: "block",
          fontSize: "12px",
          fontWeight: 600,
          letterSpacing: "0.05em",
          color: colors.textMuted,
          textTransform: "uppercase",
          marginBottom: "8px",
        }}
      >
        {label}
      </label>

      <div
        style={{ position: "relative", display: "flex", alignItems: "center" }}
      >
        {Icon && (
          <Icon
            size={16}
            color={colors.textFaint}
            style={{ position: "absolute", left: "14px" }}
          />
        )}
        <input
          {...inputProps}
          style={{
            width: "100%",
            background: colors.inputBg,
            border: `1px solid ${colors.inputBorder}`,
            borderRadius: radius.sm,
            padding: Icon ? "12px 40px" : "12px 14px",
            color: colors.text,
            fontSize: "14px",
            outline: "none",
            boxSizing: "border-box",
          }}
        />
        {rightSlot && (
          <div style={{ position: "absolute", right: "14px", display: "flex" }}>
            {rightSlot}
          </div>
        )}
      </div>

      {hint && (
        <p
          style={{
            fontSize: "12px",
            color: colors.textFaint,
            marginTop: "6px",
          }}
        >
          {hint}
        </p>
      )}
    </div>
  );
}
