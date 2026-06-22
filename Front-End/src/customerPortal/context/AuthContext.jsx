import { createContext, useContext, useEffect, useState } from "react";
import { getCurrentUser, logoutUser } from "../api/auth";

const AuthContext = createContext(null);

function loadCachedUser() {
  try {
    const raw = localStorage.getItem("autotrack_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadCachedUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("autotrack_token");
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    getCurrentUser()
      .then((freshUser) => {
        setUser(freshUser);
        localStorage.setItem("autotrack_user", JSON.stringify(freshUser));
      })
      .catch((err) => {
        if (err.response?.status === 401) {
          logoutUser();
          setUser(null);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const logout = () => {
    logoutUser();
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
