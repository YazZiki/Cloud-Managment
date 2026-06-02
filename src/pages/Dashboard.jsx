import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import "./Dashboard.css";

/* ─── Nav items ──────────────────────────────────────────────────────────── */
const NAV_ITEMS = [
  {
    section: "Management",
    items: [
      {
        id: "entities",
        label: "Government Entities",
        icon: "building",
        roles: ["PlatformAdmin"],
      },
      {
        id: "users",
        label: "Users",
        icon: "users",
        roles: ["PlatformAdmin"],
        badge: "3",
      },
      {
        id: "vulnerabilities",
        label: "Vulnerabilities",
        icon: "shield-alert",
        roles: ["PlatformAdmin", "EntityAdmin"],
        badge: "12",
      },
      {
        id: "policies",
        label: "Policies",
        icon: "file-text",
        roles: ["PlatformAdmin", "EntityAdmin"],
      },
    ],
  },
  {
    section: "Assessment",
    items: [
      {
        id: "readiness",
        label: "Readiness",
        icon: "activity",
        roles: ["PlatformAdmin", "EntityAdmin"],
      },
      {
        id: "maturity",
        label: "Maturity",
        icon: "bar-chart",
        roles: ["PlatformAdmin", "EntityAdmin"],
      },
      {
        id: "compliance",
        label: "Compliance",
        icon: "check-circle",
        roles: ["PlatformAdmin", "EntityAdmin"],
      },
    ],
  },
  {
    section: "Operations",
    items: [
      {
        id: "notifications",
        label: "Notifications",
        icon: "bell",
        roles: ["PlatformAdmin", "EntityAdmin"],
        badge: "5",
      },
      {
        id: "support",
        label: "Support Requests",
        icon: "headphones",
        roles: ["PlatformAdmin", "EntityAdmin"],
      },
      {
        id: "reports",
        label: "Reports",
        icon: "clipboard",
        roles: ["PlatformAdmin", "EntityAdmin"],
      },
    ],
  },
];

/* ─── SVG icon map ───────────────────────────────────────────────────────── */
function Icon({ name, ...props }) {
  const icons = {
    logout: (
      <svg viewBox="0 0 24 24" {...props}>
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
    ),
    building: (
      <svg viewBox="0 0 24 24" {...props}>
        <path d="M3 21h18M3 7l9-4 9 4M4 7v14M20 7v14M8 21v-4a2 2 0 0 1 4 0v4M9 11h.01M15 11h.01M9 7h.01M15 7h.01" />
      </svg>
    ),
    users: (
      <svg viewBox="0 0 24 24" {...props}>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    "shield-alert": (
      <svg viewBox="0 0 24 24" {...props}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
    "file-text": (
      <svg viewBox="0 0 24 24" {...props}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
    activity: (
      <svg viewBox="0 0 24 24" {...props}>
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    "bar-chart": (
      <svg viewBox="0 0 24 24" {...props}>
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
    "check-circle": (
      <svg viewBox="0 0 24 24" {...props}>
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    bell: (
      <svg viewBox="0 0 24 24" {...props}>
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
    headphones: (
      <svg viewBox="0 0 24 24" {...props}>
        <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
        <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
      </svg>
    ),
    clipboard: (
      <svg viewBox="0 0 24 24" {...props}>
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
      </svg>
    ),
    cloud: (
      <svg viewBox="0 0 24 24" {...props}>
        <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
      </svg>
    ),
    search: (
      <svg viewBox="0 0 24 24" {...props}>
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
    settings: (
      <svg viewBox="0 0 24 24" {...props}>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
    "alert-triangle": (
      <svg viewBox="0 0 24 24" {...props}>
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
    info: (
      <svg viewBox="0 0 24 24" {...props}>
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    ),
  };
  return icons[name] || null;
}

/* ─── Component ──────────────────────────────────────────────────────────── */
export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const { logout, role } = useAuth();
  // console.log("Current role:", role);
  const PAGE_TITLES = {
    "/dashboard/entities": "Government Entities",
    "/dashboard/users": "Users",
    "/dashboard/vulnerabilities": "Vulnerabilities",
    "/dashboard/policies": "Policies",
    "/dashboard/readiness": "Readiness",
    "/dashboard/maturity": "Maturity",
    "/dashboard/compliance": "Compliance",
    "/dashboard/notifications": "Notifications",
    "/dashboard/support": "Support Requests",
    "/dashboard/reports": "Reports",
  };

  return (
    <div className="dashboard-page">
      {/* ══ SIDEBAR ══════════════════════════════════════════════════════ */}
      <aside className={`db-sidebar${sidebarOpen ? "" : " collapsed"}`}>
        {/* Logo */}
        <div className="db-logo">
          <div className="db-logo-icon">
            <Icon name="cloud" />
          </div>
          <span className="db-logo-name">Gov Cloud</span>
        </div>

        {/* Nav */}
        <nav className="db-nav">
          {NAV_ITEMS.map((group) => (
            <div className="db-nav-section" key={group.section}>
              <div className="db-nav-label">{group.section}</div>
              {group.items
                .filter((item) => role && item.roles.includes(role))
                .map((item) => (
                  <NavLink
                    key={item.id}
                    to={`/dashboard/${item.id}`}
                    className={({ isActive }) =>
                      `db-nav-item${isActive ? " active" : ""}`
                    }
                  >
                    <Icon name={item.icon} />
                    {item.label}
                    {item.badge && (
                      <span className="db-nav-badge">{item.badge}</span>
                    )}
                  </NavLink>
                ))}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="db-sidebar-footer">
          <div className="db-avatar">AD</div>
          <div style={{ flex: 1, overflow: "hidden" }}>
            <div className="db-user-name">Admin User</div>
            <div className="db-user-role">Super Admin</div>
          </div>
          <button
            onClick={logout}
            title="Logout"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "rgba(247,248,240,0.5)",
              display: "grid",
              placeItems: "center",
              padding: 4,
              borderRadius: 6,
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#f08080")}
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "rgba(247,248,240,0.5)")
            }
          >
            <Icon
              name="logout"
              style={{
                width: 15,
                height: 15,
                stroke: "currentColor",
                fill: "none",
                strokeWidth: 1.8,
                strokeLinecap: "round",
                strokeLinejoin: "round",
              }}
            />
          </button>
        </div>
      </aside>

      {/* ══ MAIN ═════════════════════════════════════════════════════════ */}
      <div className="db-main">
        {/* Topbar */}
        <header className="db-topbar">
          <button
            className={`db-hamburger${sidebarOpen ? " open" : ""}`}
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label="Toggle sidebar"
          >
            <span className="db-hamburger-bar" />
            <span className="db-hamburger-bar" />
            <span className="db-hamburger-bar" />
          </button>

          <span className="db-topbar-title">
            {PAGE_TITLES[location.pathname] ?? "Dashboard"}
          </span>

          <div className="db-topbar-search">
            <Icon name="search" />
            <input placeholder="Search…" />
          </div>

          <button className="db-topbar-btn" aria-label="Notifications">
            <Icon name="bell" />
            <span className="db-notif-dot" />
          </button>

          <button className="db-topbar-btn" aria-label="Settings">
            <Icon name="settings" />
          </button>
        </header>
        <div className="db-content">
          <Outlet />
        </div>
        {/* Scrollable content */}
      </div>
      {/* end db-main */}
    </div>
  );
}
