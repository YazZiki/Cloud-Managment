import { useState, createContext, useContext, useEffect } from "react";
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("jwttoken") || null);
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

  const loginUser = (newToken) => {
    setToken(newToken);
    localStorage.setItem("jwttoken", newToken);
    setIsAuthenticated(true);
  };
  const logout = () => {
    setToken(null);
    localStorage.removeItem("jwttoken");
    setIsAuthenticated(false);
  };
  return (
    <AuthContext.Provider value={{ token, isAuthenticated, loginUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
export const useAuth = () => useContext(AuthContext);
