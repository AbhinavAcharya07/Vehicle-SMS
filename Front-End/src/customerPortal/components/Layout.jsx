import { Outlet, NavLink } from "react-router-dom";
import {
  FiTool,
  FiHome,
  FiMapPin,
  FiClipboard,
  FiCreditCard,
  FiLogOut,
} from "react-icons/fi";
import { colors, radius } from "../../theme";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = [
  { to: "/dashboard", icon: FiHome, label: "Dashboard" },
  { to: "/track-vehicle", icon: FiMapPin, label: "Track Vehicle" },
  { to: "/service-history", icon: FiClipboard, label: "Service History" },
  { to: "/bill-request", icon: FiCreditCard, label: "Bill Request" },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const initial = user?.fullName?.[0]?.toUpperCase() || "?";

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: colors.bg }}>
      <aside
        style={{
          width: "260px",
          flexShrink: 0,
          background: colors.panel,
          borderRight: `1px solid ${colors.panelBorder}`,
          display: "flex",
          flexDirection: "column",
          padding: "24px 16px",
          boxSizing: "border-box",
        }}
      >
        {/* Brand */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "0 8px 20px",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: radius.sm,
              background: colors.accent,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <FiTool size={18} color="#fff" />
          </div>
          <div>
            <div
              style={{ color: colors.text, fontWeight: 700, fontSize: "15px" }}
            >
              AutoTrack
            </div>
            <div
              style={{
                color: colors.textFaint,
                fontSize: "10px",
                letterSpacing: "0.05em",
              }}
            >
              CUSTOMER PORTAL
            </div>
          </div>
        </div>

        {/* User */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "12px 8px",
            borderBottom: `1px solid ${colors.panelBorder}`,
            marginBottom: "16px",
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: colors.accent,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 700,
              fontSize: "14px",
              flexShrink: 0,
            }}
          >
            {initial}
          </div>
          <div style={{ overflow: "hidden" }}>
            <div
              style={{
                color: colors.text,
                fontWeight: 600,
                fontSize: "14px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {user?.fullName || "Loading..."}
            </div>
            <div style={{ color: colors.textFaint, fontSize: "12px" }}>
              Customer
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            flex: 1,
          }}
        >
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => ({
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "11px 12px",
                borderRadius: radius.sm,
                textDecoration: "none",
                fontSize: "14px",
                fontWeight: 600,
                color: isActive ? colors.accent : colors.textMuted,
                background: isActive ? colors.accentSoftBg : "transparent",
                border: isActive
                  ? `1px solid ${colors.accent}`
                  : "1px solid transparent",
              })}
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <button
          onClick={logout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "11px 12px",
            borderRadius: radius.sm,
            background: "transparent",
            border: `1px solid ${colors.panelBorder}`,
            color: "#f87171",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
            marginTop: "12px",
          }}
        >
          <FiLogOut size={16} />
          Logout
        </button>
      </aside>

      <main style={{ flex: 1, padding: "32px 40px", boxSizing: "border-box" }}>
        <Outlet />
      </main>
    </div>
  );
}
