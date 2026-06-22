import { NavLink } from "react-router-dom";
import {
  FaWrench,
  FaHome,
  FaMapMarkerAlt,
  FaClipboardList,
  FaCreditCard,
  FaSignOutAlt,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: FaHome },
  { to: "/track-vehicle", label: "Track Vehicle", icon: FaMapMarkerAlt },
  { to: "/service-history", label: "Service History", icon: FaClipboardList },
  { to: "/bill-request", label: "Bill Request", icon: FaCreditCard },
];

export default function Sidebar() {
  const { user, logout } = useAuth();

  const initial = user?.fullName ? user.fullName.charAt(0).toUpperCase() : "?";

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">
          <FaWrench />
        </div>
        <div>
          <div className="brand-name">AutoTrack</div>
          <div className="brand-sub">Customer Portal</div>
        </div>
      </div>

      <div className="profile">
        <div className="avatar">{initial}</div>
        <div>
          <div className="profile-name">{user?.fullName || "Loading..."}</div>
          <div className="profile-role">{user?.email || ""}</div>
        </div>
      </div>

      <nav className="nav">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => (isActive ? "active" : "")}
            end={to === "/"}
          >
            <span className="ic">
              <Icon />
            </span>
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-foot">
        <button className="logout-btn" onClick={logout}>
          <FaSignOutAlt /> Logout
        </button>
      </div>
    </aside>
  );
}
