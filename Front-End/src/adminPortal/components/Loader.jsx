export function Loader({ label = "Loading..." }) {
  return (
    <div
      style={{
        padding: "60px 0",
        textAlign: "center",
        color: "var(--text-faint)",
      }}
    >
      {label}
    </div>
  );
}

export function EmptyState({ icon, title, message }) {
  return (
    <div
      style={{
        padding: "50px 20px",
        textAlign: "center",
        color: "var(--text-faint)",
      }}
    >
      {icon && <div style={{ fontSize: 26, marginBottom: 10 }}>{icon}</div>}
      <div
        style={{ color: "var(--text-dim)", fontWeight: 700, marginBottom: 6 }}
      >
        {title}
      </div>
      {message && <div style={{ fontSize: 13 }}>{message}</div>}
    </div>
  );
}

export function ErrorState({ message }) {
  return (
    <div
      style={{ padding: "50px 20px", textAlign: "center", color: "#f87171" }}
    >
      {message || "Something went wrong."}
    </div>
  );
}
