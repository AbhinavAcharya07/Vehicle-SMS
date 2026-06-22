import { createContext, useContext, useEffect, useState } from "react";
import { getCurrentStaff, logoutStaff } from "../api/auth";

const AdminAuthContext = createContext(null);

function loadCachedUser() {
  try {
    const raw = localStorage.getItem("autotrack_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AdminAuthProvider({ children }) {
  const [user, setUser] = useState(loadCachedUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("autotrack_token");
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    getCurrentStaff()
      .then((freshUser) => {
        setUser(freshUser);
        localStorage.setItem("autotrack_user", JSON.stringify(freshUser));
      })
      .catch((err) => {
        if (err.response?.status === 401) {
          logoutStaff();
          setUser(null);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const logout = () => {
    logoutStaff();
    setUser(null);
    window.location.href = "/admin/login";
  };

  return (
    <AdminAuthContext.Provider value={{ user, setUser, loading, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export const useAdminAuth = () => useContext(AdminAuthContext);
