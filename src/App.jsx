import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/loginPage.jsx";
import DashboardPage from "./pages/Dashboard.jsx";
import GovEntities from "./pages/components/GovEntities.jsx";
import Users from "./pages/components/Users.jsx";
import Policies from "./pages/components/Policies.jsx";
import Vulnerabilities from "./pages/components/Vulnerabilities.jsx";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/dashboard" element={<DashboardPage />}>
          <Route path="entities" element={<GovEntities />} />
          <Route index element={<Navigate to="entities" replace />} />
          <Route path="users" element={<Users />} />
          <Route path="policies" element={<Policies />} />
          <Route path="vulnerabilities" element={<Vulnerabilities />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
