import { useState, createContext, useContext, useEffect } from "react";
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("jwttoken") || null);
  const [role, setRole] = useState(localStorage.getItem("userrole") || null);
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("jwttoken"),
  );

  useEffect(() => {
    const handleStorageChange = () => {
      const stored = localStorage.getItem("jwttoken");
      setToken(stored || null);
      setIsAuthenticated(!!stored);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const loginUser = (newToken, role) => {
    setToken(newToken);
    setRole(role);
    localStorage.setItem("jwttoken", newToken);
    localStorage.setItem("userrole", role);
    setIsAuthenticated(true);
  };
  const logout = () => {
    setToken(null);
    setRole(null);
    localStorage.removeItem("jwttoken");
    localStorage.removeItem("userrole");
    setIsAuthenticated(false);
  };
  return (
    <AuthContext.Provider
      value={{ token, isAuthenticated, role, loginUser, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
export const useAuth = () => useContext(AuthContext);
