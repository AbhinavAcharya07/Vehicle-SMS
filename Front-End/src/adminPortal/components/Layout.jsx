import { Outlet, NavLink } from "react-router-dom";
import {
  FiTool,
  FiHome,
  FiClipboard,
  FiPlusCircle,
  FiBarChart2,
  FiCreditCard,
  FiLogOut,
} from "react-icons/fi";
import { useAdminAuth } from "../context/AdminAuthContext";

const NAV_ITEMS = [
  { to: "/admin/dashboard", icon: FiHome, label: "Dashboard" },
  { to: "/admin/job-cards", icon: FiClipboard, label: "Job Cards" },
  { to: "/admin/new-job-card", icon: FiPlusCircle, label: "New Job Card" },
  { to: "/admin/work-progress", icon: FiBarChart2, label: "Work Progress" },
  { to: "/admin/billing", icon: FiCreditCard, label: "Billing" },
];

const A = {
  bg: "#0a0e1a",
  bgSoft: "#0d1220",
  card: "#121729",
  cardBorder: "#232b42",
  line: "#1c2336",
  text: "#f3f5fa",
  textDim: "#8d95ac",
  textFaint: "#5d6480",
  accent: "#ff7a3d",
  accentSoft: "rgba(255,122,61,0.14)",
  accentBorder: "rgba(255,122,61,0.35)",
  activeText: "#ffb38a",
};

export default function AdminLayout() {
  const { user, logout } = useAdminAuth();
  const initial =
    user?.fullName?.[0]?.toUpperCase() ||
    user?.staffGmail?.[0]?.toUpperCase() ||
    "?";

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "264px 1fr",
        minHeight: "100vh",
        background: A.bg,
        fontFamily: "'Inter', system-ui, sans-serif",
        boxSizing: "border-box",
      }}
    >
      {/* ── SIDEBAR ─────────────────────────────────────────────── */}
      <aside
        style={{
          background: A.bgSoft,
          borderRight: `1px solid ${A.line}`,
          padding: "24px 18px",
          display: "flex",
          flexDirection: "column",
          position: "sticky",
          top: 0,
          height: "100vh",
          overflowY: "auto",
          boxSizing: "border-box",
        }}
      >
        {/* Brand */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "6px 8px 22px",
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: `linear-gradient(135deg, ${A.accent}, #ff4d4d)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
            }}
          >
            <FiTool size={18} />
          </div>
          <div>
            <div style={{ color: A.text, fontWeight: 800, fontSize: 17 }}>
              AutoTrack
            </div>
            <div
              style={{
                color: A.textFaint,
                fontSize: 11,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.6px",
              }}
            >
              Admin Panel
            </div>
          </div>
        </div>

        {/* Profile */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "14px 10px",
            marginBottom: 18,
            borderBottom: `1px solid ${A.line}`,
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              background: `linear-gradient(135deg, #ff4d4d, ${A.accent})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: 14,
              color: "#fff",
              flexShrink: 0,
            }}
          >
            {initial}
          </div>
          <div style={{ overflow: "hidden" }}>
            <div
              style={{
                color: A.text,
                fontWeight: 700,
                fontSize: 14,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {user?.fullName || user?.staffGmail || "Loading..."}
            </div>
            <div style={{ color: A.textFaint, fontSize: 12 }}>
              Service Staff
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav
          style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}
        >
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => ({
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "11px 14px",
                borderRadius: 10,
                textDecoration: "none",
                fontSize: 14.5,
                fontWeight: 600,
                color: isActive ? A.activeText : A.textDim,
                background: isActive ? A.accentSoft : "transparent",
                border: `1px solid ${isActive ? A.accentBorder : "transparent"}`,
              })}
            >
              <span
                style={{
                  width: 18,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: 0.85,
                }}
              >
                <Icon size={16} />
              </span>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <button
          onClick={logout}
          style={{
            marginTop: 18,
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "11px 14px",
            borderRadius: 10,
            width: "100%",
            background: A.card,
            border: `1px solid ${A.cardBorder}`,
            color: "#ff8b8b",
            fontWeight: 700,
            fontSize: 13.5,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          <FiLogOut size={16} /> Logout
        </button>
      </aside>

      {/* ── MAIN CONTENT ────────────────────────────────────────── */}
      <main
        style={{
          padding: "30px 40px 50px",
          boxSizing: "border-box",
          color: A.text,
          minWidth: 0,
        }}
      >
        <Outlet />
      </main>
    </div>
  );
}
