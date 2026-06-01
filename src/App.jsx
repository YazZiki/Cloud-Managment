import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import LoginPage from "./pages/loginPage.jsx";
import DashboardPage from "./pages/Dashboard.jsx";
import GovEntities from "./pages/components/GovEntities.jsx";
import Users from "./pages/components/Users.jsx";
import Policies from "./pages/components/Policies.jsx";
import Vulnerabilities from "./pages/components/Vulnerabilities.jsx";
import Reports from "./pages/components/Reports.jsx";

import "./App.css";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate replace to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? children : <Navigate replace to="/dashboard" />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          >
            <Route path="entities" element={<GovEntities />} />
            <Route index element={<Navigate to="entities" replace />} />
            <Route path="users" element={<Users />} />
            <Route path="policies" element={<Policies />} />
            <Route path="vulnerabilities" element={<Vulnerabilities />} />
            <Route path="reports" element={<Reports />} />
          </Route>
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
