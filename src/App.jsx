import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import LoginPage from "./pages/loginPage.jsx";
import DashboardPage from "./pages/Dashboard.jsx";
import GovEntities from "./pages/components/GovEntities.jsx";
import Users from "./pages/components/Users.jsx";
import Policies from "./pages/components/Policies.jsx";
import Vulnerabilities from "./pages/components/Vulnerabilities.jsx";
import Reports from "./pages/components/Reports.jsx";
import Notifications from "./pages/components/Notification.jsx";
import Maturity from "./pages/components/Maturity.jsx";
import "./App.css";

/* ── Smart index redirect based on role ── */
function DashboardIndex() {
  const { role } = useAuth();
  if (!role) return null; // wait for role to load
  if (role === "EntityAdmin") return <Navigate to="vulnerabilities" replace />;
  return <Navigate to="entities" replace />;
}

/* ── Blocks unauthenticated users, optionally checks role ── */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, role } = useAuth();
  if (!isAuthenticated) return <Navigate replace to="/login" />;
  if (allowedRoles && !allowedRoles.includes(role))
    return <Navigate replace to="/dashboard" />;
  return children;
};

/* ── Blocks already logged-in users from seeing login page ── */
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? children : <Navigate replace to="/dashboard" />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />

          {/* Protected dashboard shell */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          >
            {/* Smart default redirect */}
            <Route index element={<DashboardIndex />} />

            {/* PlatformAdmin only */}
            <Route
              path="entities"
              element={
                <ProtectedRoute allowedRoles={["PlatformAdmin"]}>
                  <GovEntities />
                </ProtectedRoute>
              }
            />
            <Route
              path="users"
              element={
                <ProtectedRoute allowedRoles={["PlatformAdmin"]}>
                  <Users />
                </ProtectedRoute>
              }
            />

            {/* Both roles */}
            <Route
              path="vulnerabilities"
              element={
                <ProtectedRoute allowedRoles={["PlatformAdmin", "EntityAdmin"]}>
                  <Vulnerabilities />
                </ProtectedRoute>
              }
            />
            <Route
              path="policies"
              element={
                <ProtectedRoute allowedRoles={["PlatformAdmin", "EntityAdmin"]}>
                  <Policies />
                </ProtectedRoute>
              }
            />
            <Route
              path="reports"
              element={
                <ProtectedRoute allowedRoles={["PlatformAdmin", "EntityAdmin"]}>
                  <Reports />
                </ProtectedRoute>
              }
            />
            <Route
              path="notifications"
              element={
                <ProtectedRoute allowedRoles={["PlatformAdmin", "EntityAdmin"]}>
                  <Notifications />
                </ProtectedRoute>
              }
            />
            <Route
              path="maturity"
              element={
                <ProtectedRoute allowedRoles={["PlatformAdmin", "EntityAdmin"]}>
                  <Maturity />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
