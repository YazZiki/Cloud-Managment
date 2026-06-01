import { useState } from "react";
import "./Users.css";

/* ──────────────────────────────────────────────────────────────
   INITIAL USERS DATA
────────────────────────────────────────────────────────────── */
const INITIAL_USERS = [
  {
    id: 1,
    fullName: "John Smith",
    email: "john.smith@platform.com",
    phone: "+1 555 100 200",
    department: "IT",
    role: "Administrator",
    status: "active",
    lastLogin: "2026-05-15 10:22",
    notes: "Main platform administrator.",
  },
  {
    id: 2,
    fullName: "Sarah Johnson",
    email: "sarah.johnson@platform.com",
    phone: "+1 555 100 201",
    department: "Operations",
    role: "Manager",
    status: "active",
    lastLogin: "2026-05-14 08:45",
    notes: "",
  },
  {
    id: 3,
    fullName: "Michael Brown",
    email: "michael.brown@platform.com",
    phone: "+1 555 100 202",
    department: "Compliance",
    role: "Reviewer",
    status: "inactive",
    lastLogin: "2026-04-28 17:13",
    notes: "Limited review permissions.",
  },
  {
    id: 4,
    fullName: "Emily Davis",
    email: "emily.davis@platform.com",
    phone: "+1 555 100 203",
    department: "Finance",
    role: "Viewer",
    status: "suspended",
    lastLogin: "2026-03-21 12:01",
    notes: "Account suspended pending review.",
  },
  {
    id: 5,
    fullName: "Ahmed Hassan",
    email: "ahmed.hassan@platform.com",
    phone: "+966 50 123 4567",
    department: "Government Relations",
    role: "Operator",
    status: "active",
    lastLogin: "2026-05-17 09:33",
    notes: "",
  },
  {
    id: 6,
    fullName: "Fatima Al-Qahtani",
    email: "fatima.q@platform.com",
    phone: "+966 55 888 7777",
    department: "Audit",
    role: "Auditor",
    status: "active",
    lastLogin: "2026-05-16 14:10",
    notes: "External auditor account.",
  },
];

const ROLES = [
  "Administrator",
  "Manager",
  "Reviewer",
  "Auditor",
  "Operator",
  "Viewer",
];

const STATUSES = ["active", "inactive", "suspended"];

let nextId = INITIAL_USERS.length + 1;

/* ──────────────────────────────────────────────────────────────
   HELPERS
────────────────────────────────────────────────────────────── */

function roleClass(role) {
  return role.toLowerCase().replace(/\s+/g, "-");
}

/* ──────────────────────────────────────────────────────────────
   ICONS
────────────────────────────────────────────────────────────── */

function Icon({ name }) {
  const s = {
    width: 15,
    height: 15,
    stroke: "currentColor",
    fill: "none",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  const icons = {
    search: (
      <svg viewBox="0 0 24 24" {...s}>
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),

    plus: (
      <svg viewBox="0 0 24 24" {...s}>
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    ),

    close: (
      <svg viewBox="0 0 24 24" {...s}>
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    ),

    edit: (
      <svg viewBox="0 0 24 24" {...s}>
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    ),

    trash: (
      <svg viewBox="0 0 24 24" {...s}>
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
        <path d="M10 11v6M14 11v6" />
        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
      </svg>
    ),

    eye: (
      <svg viewBox="0 0 24 24" {...s}>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),

    save: (
      <svg viewBox="0 0 24 24" {...s}>
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
        <polyline points="17 21 17 13 7 13 7 21" />
        <polyline points="7 3 7 8 15 8" />
      </svg>
    ),

    users: (
      <svg viewBox="0 0 24 24" {...s}>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),

    shield: (
      <svg viewBox="0 0 24 24" {...s}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),

    alert: (
      <svg viewBox="0 0 24 24" {...s}>
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  };

  return icons[name] || null;
}

/* ──────────────────────────────────────────────────────────────
   EMPTY FORM
────────────────────────────────────────────────────────────── */

const emptyForm = {
  fullName: "",
  email: "",
  phone: "",
  department: "",
  role: "Viewer",
  status: "active",
  lastLogin: "-",
  notes: "",
};

/* ════════════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════════════ */

export default function Users() {
  const [users, setUsers] = useState(INITIAL_USERS);

  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("all");

  const [modal, setModal] = useState(null);

  const [form, setForm] = useState(emptyForm);

  /* ─────────────────────────────
     FILTERED USERS
  ───────────────────────────── */

  const visible = users.filter((u) => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.department.toLowerCase().includes(search.toLowerCase());

    const matchesRole = filterRole === "all" || u.role === filterRole;

    return matchesSearch && matchesRole;
  });

  /* ─────────────────────────────
     STATISTICS
  ───────────────────────────── */

  const totalUsers = users.length;

  const admins = users.filter((u) => u.role === "Administrator").length;

  const activeUsers = users.filter((u) => u.status === "active").length;

  const suspendedUsers = users.filter((u) => u.status === "suspended").length;

  /* ─────────────────────────────
     MODAL HELPERS
  ───────────────────────────── */

  const openView = (user) => {
    setModal({
      mode: "view",
      user,
    });
  };

  const openEdit = (user) => {
    setForm({ ...user });

    setModal({
      mode: "edit",
      user,
    });
  };

  const openCreate = () => {
    setForm({ ...emptyForm });

    setModal({
      mode: "create",
      user: null,
    });
  };

  const openDelete = (user) => {
    setModal({
      mode: "delete",
      user,
    });
  };

  const closeModal = () => {
    setModal(null);
  };

  const handleFormChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  /* ─────────────────────────────
     CRUD ACTIONS
  ───────────────────────────── */

  const handleCreate = () => {
    const newUser = {
      ...form,
      id: nextId++,
      lastLogin: "-",
    };

    setUsers((prev) => [newUser, ...prev]);

    closeModal();
  };

  const handleUpdate = () => {
    setUsers((prev) => prev.map((u) => (u.id === form.id ? form : u)));

    closeModal();
  };

  const handleDelete = (id) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));

    closeModal();
  };

  const handleRoleChange = (id, role) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));

    if (modal?.user?.id === id) {
      setModal((m) => ({
        ...m,
        user: {
          ...m.user,
          role,
        },
      }));

      if (modal.mode === "edit") {
        setForm((f) => ({
          ...f,
          role,
        }));
      }
    }
  };

  const handleStatusChange = (id, status) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status } : u)));

    if (modal?.user?.id === id) {
      setModal((m) => ({
        ...m,
        user: {
          ...m.user,
          status,
        },
      }));

      if (modal.mode === "edit") {
        setForm((f) => ({
          ...f,
          status,
        }));
      }
    }
  };

  /* ============================================================
     SECTION 2 STARTS HERE
     (Toolbar + Stats + Table + View Modal)
  ============================================================ */
  /* ============================================================
   SECTION 2
   Toolbar + Statistics + Users Table + View Modal
============================================================ */

  return (
    <div className="us-wrap">
      {/* ── Toolbar ───────────────────────────────────── */}
      <div className="us-toolbar">
        <div className="us-search">
          <Icon name="search" />

          <input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="us-filter-select"
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
        >
          <option value="all">All Roles</option>

          {ROLES.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>

        <button className="us-btn-primary" onClick={openCreate}>
          <Icon name="plus" />
          Add User
        </button>
      </div>

      {/* ── Statistics ────────────────────────────────── */}
      <div className="us-stats">
        <div className="us-stat">
          <div className="us-stat-icon all">
            <Icon name="users" />
          </div>

          <div>
            <div className="us-stat-val">{totalUsers}</div>

            <div className="us-stat-lbl">Total Users</div>
          </div>
        </div>

        <div className="us-stat">
          <div className="us-stat-icon admin">
            <Icon name="shield" />
          </div>

          <div>
            <div className="us-stat-val">{admins}</div>

            <div className="us-stat-lbl">Administrators</div>
          </div>
        </div>

        <div className="us-stat">
          <div className="us-stat-icon active">
            <Icon name="eye" />
          </div>

          <div>
            <div className="us-stat-val">{activeUsers}</div>

            <div className="us-stat-lbl">Active Users</div>
          </div>
        </div>

        <div className="us-stat">
          <div className="us-stat-icon suspended">
            <Icon name="alert" />
          </div>

          <div>
            <div className="us-stat-val">{suspendedUsers}</div>

            <div className="us-stat-lbl">Suspended Users</div>
          </div>
        </div>
      </div>

      {/* ── Table ─────────────────────────────────────── */}
      <div className="us-table-card">
        <div className="us-table-scroll">
          <table className="us-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Department</th>
                <th>Role</th>
                <th>Status</th>
                <th>Last Login</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {visible.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="us-empty">No users found.</div>
                  </td>
                </tr>
              ) : (
                visible.map((user) => (
                  <tr key={user.id} onClick={() => openView(user)}>
                    <td>
                      <div className="us-user-name">{user.fullName}</div>

                      <div className="us-user-sub">{user.email}</div>
                    </td>

                    <td>{user.department}</td>

                    <td>
                      <span className={`us-role ${roleClass(user.role)}`}>
                        {user.role}
                      </span>
                    </td>

                    <td>
                      <span className={`us-pill ${user.status}`}>
                        {user.status}
                      </span>
                    </td>

                    <td>{user.lastLogin}</td>

                    <td>
                      <div
                        className="us-row-actions"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          className="us-icon-btn view"
                          onClick={() => openView(user)}
                        >
                          <Icon name="eye" />
                        </button>

                        <button
                          className="us-icon-btn edit"
                          onClick={() => openEdit(user)}
                        >
                          <Icon name="edit" />
                        </button>

                        <button
                          className="us-icon-btn delete"
                          onClick={() => openDelete(user)}
                        >
                          <Icon name="trash" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modals ───────────────────────────────────── */}
      {modal && (
        <div className="us-overlay" onClick={closeModal}>
          <div className="us-modal" onClick={(e) => e.stopPropagation()}>
            {/* ===========================================
              VIEW USER MODAL
          =========================================== */}

            {modal.mode === "view" && (
              <>
                <div className="us-modal-header">
                  <div>
                    <div className="us-modal-title">{modal.user.fullName}</div>

                    <div className="us-modal-sub">{modal.user.email}</div>
                  </div>

                  <button className="us-modal-close" onClick={closeModal}>
                    <Icon name="close" />
                  </button>
                </div>

                <div className="us-modal-body">
                  {/* Role Change */}

                  <div className="us-section-label">User Role</div>

                  <div className="us-role-tabs">
                    {ROLES.map((role) => (
                      <button
                        key={role}
                        className={`us-role-tab ${
                          modal.user.role === role ? "active" : ""
                        }`}
                        onClick={() => handleRoleChange(modal.user.id, role)}
                      >
                        {role}
                      </button>
                    ))}
                  </div>

                  {/* Status Change */}

                  <div className="us-section-label">Account Status</div>

                  <div className="us-status-tabs">
                    {STATUSES.map((status) => (
                      <button
                        key={status}
                        className={`us-status-tab ${
                          modal.user.status === status ? status : ""
                        }`}
                        onClick={() =>
                          handleStatusChange(modal.user.id, status)
                        }
                      >
                        {status}
                      </button>
                    ))}
                  </div>

                  <div className="us-detail-grid">
                    <div className="us-detail-item">
                      <div className="us-detail-label">Full Name</div>

                      <div className="us-detail-value">
                        {modal.user.fullName}
                      </div>
                    </div>

                    <div className="us-detail-item">
                      <div className="us-detail-label">Email</div>

                      <div className="us-detail-value">{modal.user.email}</div>
                    </div>

                    <div className="us-detail-item">
                      <div className="us-detail-label">Phone</div>

                      <div className="us-detail-value">{modal.user.phone}</div>
                    </div>

                    <div className="us-detail-item">
                      <div className="us-detail-label">Department</div>

                      <div className="us-detail-value">
                        {modal.user.department}
                      </div>
                    </div>

                    <div className="us-detail-item">
                      <div className="us-detail-label">Role</div>

                      <div className="us-detail-value">{modal.user.role}</div>
                    </div>

                    <div className="us-detail-item">
                      <div className="us-detail-label">Last Login</div>

                      <div className="us-detail-value">
                        {modal.user.lastLogin}
                      </div>
                    </div>

                    <div className="us-detail-item">
                      <div className="us-detail-label">Status</div>

                      <div className="us-detail-value">
                        <span className={`us-pill ${modal.user.status}`}>
                          {modal.user.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {modal.user.notes && (
                    <>
                      <div className="us-detail-divider" />

                      <div className="us-detail-item">
                        <div className="us-detail-label">Notes</div>

                        <div
                          className="us-detail-value"
                          style={{
                            marginTop: 6,
                            lineHeight: 1.6,
                          }}
                        >
                          {modal.user.notes}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="us-modal-footer">
                  <button
                    className="us-btn us-btn-edit"
                    onClick={() => openEdit(modal.user)}
                  >
                    <Icon name="edit" />
                    Edit User
                  </button>

                  <button
                    className="us-btn us-btn-delete"
                    onClick={() => openDelete(modal.user)}
                  >
                    <Icon name="trash" />
                    Delete User
                  </button>
                </div>
              </>
            )}

            {/* ===========================================
    CREATE / EDIT USER MODAL
=========================================== */}

            {(modal.mode === "create" || modal.mode === "edit") && (
              <>
                <div className="us-modal-header">
                  <div>
                    <div className="us-modal-title">
                      {modal.mode === "create" ? "Create User" : "Edit User"}
                    </div>

                    <div className="us-modal-sub">
                      {modal.mode === "create"
                        ? "Fill in the user information"
                        : `Editing ${modal.user.fullName}`}
                    </div>
                  </div>

                  <button className="us-modal-close" onClick={closeModal}>
                    <Icon name="close" />
                  </button>
                </div>

                <div className="us-modal-body">
                  <div className="us-form-grid">
                    <div className="us-field span2">
                      <label className="us-label">Full Name</label>

                      <input
                        className="us-input"
                        value={form.fullName}
                        placeholder="John Smith"
                        onChange={(e) =>
                          handleFormChange("fullName", e.target.value)
                        }
                      />
                    </div>

                    <div className="us-field">
                      <label className="us-label">Email</label>

                      <input
                        className="us-input"
                        type="email"
                        value={form.email}
                        placeholder="john@example.com"
                        onChange={(e) =>
                          handleFormChange("email", e.target.value)
                        }
                      />
                    </div>

                    <div className="us-field">
                      <label className="us-label">Phone</label>

                      <input
                        className="us-input"
                        value={form.phone}
                        placeholder="+1 555 000 000"
                        onChange={(e) =>
                          handleFormChange("phone", e.target.value)
                        }
                      />
                    </div>

                    <div className="us-field">
                      <label className="us-label">Department</label>

                      <input
                        className="us-input"
                        value={form.department}
                        placeholder="Department"
                        onChange={(e) =>
                          handleFormChange("department", e.target.value)
                        }
                      />
                    </div>

                    <div className="us-field">
                      <label className="us-label">Role</label>

                      <select
                        className="us-select"
                        value={form.role}
                        onChange={(e) =>
                          handleFormChange("role", e.target.value)
                        }
                      >
                        {ROLES.map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="us-field span2">
                      <label className="us-label">Status</label>

                      <select
                        className="us-select"
                        value={form.status}
                        onChange={(e) =>
                          handleFormChange("status", e.target.value)
                        }
                      >
                        {STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="us-field span2">
                      <label className="us-label">Notes</label>

                      <textarea
                        className="us-textarea"
                        value={form.notes}
                        placeholder="Optional notes..."
                        onChange={(e) =>
                          handleFormChange("notes", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="us-modal-footer">
                  <button className="us-btn us-btn-cancel" onClick={closeModal}>
                    Cancel
                  </button>

                  <button
                    className="us-btn us-btn-save"
                    disabled={!form.fullName.trim()}
                    onClick={
                      modal.mode === "create" ? handleCreate : handleUpdate
                    }
                    style={{
                      opacity: form.fullName.trim() ? 1 : 0.5,
                      cursor: form.fullName.trim() ? "pointer" : "not-allowed",
                    }}
                  >
                    <Icon name="save" />

                    {modal.mode === "create" ? "Create User" : "Save Changes"}
                  </button>
                </div>
              </>
            )}

            {/* ===========================================
    DELETE USER MODAL
=========================================== */}

            {modal.mode === "delete" && (
              <>
                <div className="us-modal-header">
                  <div>
                    <div className="us-modal-title">Confirm Deletion</div>

                    <div className="us-modal-sub">
                      This action cannot be undone
                    </div>
                  </div>

                  <button className="us-modal-close" onClick={closeModal}>
                    <Icon name="close" />
                  </button>
                </div>

                <div className="us-modal-body">
                  <div className="us-delete-confirm">
                    <div className="us-delete-icon">
                      <Icon name="trash" />
                    </div>

                    <div className="us-delete-title">
                      Delete "{modal.user.fullName}" ?
                    </div>

                    <p className="us-delete-text">
                      You are about to permanently remove this user account from
                      the platform.
                    </p>
                  </div>
                </div>

                <div className="us-modal-footer">
                  <button className="us-btn us-btn-cancel" onClick={closeModal}>
                    Cancel
                  </button>

                  <button
                    className="us-btn us-btn-delete"
                    onClick={() => handleDelete(modal.user.id)}
                  >
                    <Icon name="trash" />
                    Delete User
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
