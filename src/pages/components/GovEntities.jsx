import { useState, useEffect } from "react";
import {
  getAllGovEntities,
  approveGovEntity,
  rejectGovEntity,
  suspendGovEntity,
} from "../../services/api.js";
import "./GovEntities.css";

const SECTORS = [
  "Finance",
  "Health",
  "Transport",
  "Education",
  "Telecom",
  "Customs",
  "Technology",
  "Energy",
  "Defense",
  "Justice",
  "Interior",
  "Environment",
];
const STATUS_MAP = {
  0: "pending",
  1: "approved",
  2: "rejected",
  3: "suspended",
};

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function scoreClass(s) {
  return s >= 75 ? "high" : s >= 55 ? "medium" : "low";
}

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
    building: (
      <svg viewBox="0 0 24 24" {...s}>
        <path d="M3 21h18M3 7l9-4 9 4M4 7v14M20 7v14M8 21v-4a2 2 0 0 1 4 0v4M9 11h.01M15 11h.01M9 7h.01M15 7h.01" />
      </svg>
    ),
    check: (
      <svg viewBox="0 0 24 24" {...s}>
        <polyline points="20 6 9 17 4 12" />
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

/* ─── Empty form template ────────────────────────────────────────────────── */
const emptyForm = {
  entityName: "",
  entityEmail: "",
  phone: "",
  address: "",
  adminFullName: "",
  adminEmail: "",
  password: "",
};

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════════════ */
export default function GovEntities() {
  const [entities, setEntities] = useState([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilter] = useState("all");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ── Load from API on mount ── */
  useEffect(() => {
    loadEntities();
  }, []);

  const loadEntities = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAllGovEntities();
      const normalized = (Array.isArray(data) ? data : []).map((e) => ({
        ...e,
        status: STATUS_MAP[e.status] ?? "pending",
      }));
      setEntities(normalized);
    } catch (err) {
      console.error("Failed to load entities:", err);
      setError("Failed to load entities. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ── Derived list ── */
  const visible = entities.filter((e) => {
    const matchSearch =
      (e.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (e.adminFullName || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || e.status === filterStatus;
    return matchSearch && matchStatus;
  });

  /* ── Stats ── */
  const total = entities.length;
  const approved = entities.filter((e) => e.status === "approved").length;
  const pending = entities.filter((e) => e.status === "pending").length;
  const critical = entities.filter(
    (e) => e.status === "rejected" || e.status === "suspended",
  ).length;

  /* ── Modal helpers ── */
  const openView = (e) => setModal({ mode: "view", entity: e });
  const openEdit = (e) => {
    setForm({ ...e });
    setModal({ mode: "edit", entity: e });
  };
  const openCreate = () => {
    setForm({ ...emptyForm });
    setModal({ mode: "create", entity: null });
  };
  const openDelete = (e) => setModal({ mode: "delete", entity: e });
  const closeModal = () => setModal(null);

  const handleFormChange = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  /* ── Local CRUD (optimistic — swap for real API calls as needed) ── */
  const handleCreate = () => {
    const newEntity = { ...form, id: Date.now(), score: Number(form.score) };
    setEntities((prev) => [newEntity, ...prev]);
    closeModal();
  };

  const handleUpdate = () => {
    setEntities((prev) =>
      prev.map((e) =>
        e.id === form.id ? { ...form, score: Number(form.score) } : e,
      ),
    );
    closeModal();
  };

  const handleDelete = (id) => {
    setEntities((prev) => prev.filter((e) => e.id !== id));
    closeModal();
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      if (newStatus === "approved") await approveGovEntity(id);
      if (newStatus === "rejected") await rejectGovEntity(id);
      if (newStatus === "suspended") await suspendGovEntity(id);

      setEntities((prev) =>
        prev.map((e) => (e.id === id ? { ...e, status: newStatus } : e)),
      );

      if (modal?.entity?.id === id) {
        setModal((m) => ({ ...m, entity: { ...m.entity, status: newStatus } }));
      }
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Failed to update status. Please try again.");
    }
  };

  /* ── Loading / error states ── */
  if (loading) {
    return (
      <div
        className="ge-wrap"
        style={{ alignItems: "center", justifyContent: "center" }}
      >
        <div style={{ color: "rgba(53,88,114,0.5)", fontSize: "0.9rem" }}>
          Loading entities…
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="ge-wrap"
        style={{ alignItems: "center", justifyContent: "center" }}
      >
        <div style={{ color: "#c0392b", fontSize: "0.9rem" }}>{error}</div>
        <button
          onClick={loadEntities}
          style={{
            marginTop: 12,
            padding: "8px 18px",
            background: "#355872",
            color: "#f7f8f0",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            fontFamily: "Syne, sans-serif",
            fontWeight: 700,
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  /* ─────────────────────────────────────────────────────────────────────── */
  return (
    <div className="ge-wrap">
      {/* ── Toolbar ── */}
      <div className="ge-toolbar">
        <div className="ge-search">
          <Icon name="search" />
          <input
            placeholder="Search entities…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="ge-filter-select"
          value={filterStatus}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All Statuses</option>
          {Object.values(STATUS_MAP).map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>

        <button className="ge-btn-primary" onClick={openCreate}>
          <Icon name="plus" />
          Add Entity
        </button>
      </div>

      {/* ── Stats row ── */}
      <div className="ge-stats">
        <div className="ge-stat">
          <div className="ge-stat-icon all">
            <Icon name="building" />
          </div>
          <div>
            <div className="ge-stat-val">{total}</div>
            <div className="ge-stat-lbl">Total Entities</div>
          </div>
        </div>
        <div className="ge-stat">
          <div className="ge-stat-icon approved">
            <Icon name="check" />
          </div>
          <div>
            <div className="ge-stat-val">{approved}</div>
            <div className="ge-stat-lbl">Approved</div>
          </div>
        </div>
        <div className="ge-stat">
          <div className="ge-stat-icon pending">
            <Icon name="eye" />
          </div>
          <div>
            <div className="ge-stat-val">{pending}</div>
            <div className="ge-stat-lbl">Pending</div>
          </div>
        </div>
        <div className="ge-stat">
          <div className="ge-stat-icon critical">
            <Icon name="alert" />
          </div>
          <div>
            <div className="ge-stat-val">{critical}</div>
            <div className="ge-stat-lbl">Rejected / Suspended</div>
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="ge-table-card">
        <div className="ge-table-scroll">
          <table className="ge-table">
            <thead>
              <tr>
                <th>Entity Name</th>
                <th>Entity Email</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="ge-empty">
                      No entities match your search.
                    </div>
                  </td>
                </tr>
              ) : (
                visible.map((e) => (
                  <tr key={e.id} onClick={() => openView(e)}>
                    <td>
                      <div className="ge-entity-name">{e.name || "—"}</div>
                    </td>
                    <td>{e.email || "—"}</td>
                    <td>{e.phone || "—"}</td>
                    <td>{e.address || "—"}</td>
                    <td>
                      <span className={`ge-pill ${e.status}`}>
                        {e.status
                          ? e.status.charAt(0).toUpperCase() + e.status.slice(1)
                          : "—"}
                      </span>
                    </td>
                    <td>
                      <div
                        className="ge-row-actions"
                        onClick={(ev) => ev.stopPropagation()}
                      >
                        <button
                          className="ge-icon-btn view"
                          onClick={() => openView(e)}
                          title="View"
                        >
                          <Icon name="eye" />
                        </button>
                        <button
                          className="ge-icon-btn edit"
                          onClick={() => openEdit(e)}
                          title="Edit"
                        >
                          <Icon name="edit" />
                        </button>
                        <button
                          className="ge-icon-btn delete"
                          onClick={() => openDelete(e)}
                          title="Delete"
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

      {/* ══════════════════════════════════════════════════════════════════
          MODALS
      ══════════════════════════════════════════════════════════════════ */}
      {modal && (
        <div className="ge-overlay" onClick={closeModal}>
          <div className="ge-modal" onClick={(e) => e.stopPropagation()}>
            {/* ── VIEW modal ── */}
            {modal.mode === "view" && (
              <>
                <div className="ge-modal-header">
                  <div>
                    <div className="ge-modal-title">{modal.entity.name}</div>
                  </div>
                  <button className="ge-modal-close" onClick={closeModal}>
                    <Icon name="close" />
                  </button>
                </div>

                <div className="ge-modal-body">
                  <div
                    style={{
                      marginBottom: 6,
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      letterSpacing: "0.07em",
                      textTransform: "uppercase",
                      color: "rgba(53,88,114,0.45)",
                    }}
                  >
                    Update Status
                  </div>
                  <div className="ge-status-tabs">
                    {Object.values(STATUS_MAP).map((s) => (
                      <button
                        key={s}
                        className={`ge-status-tab${modal.entity.status === s ? " " + s : ""}`}
                        onClick={() => handleStatusChange(modal.entity.id, s)}
                      >
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </button>
                    ))}
                  </div>

                  <div className="ge-detail-grid">
                    <div className="ge-detail-item">
                      <div className="ge-detail-label">Entity Name</div>
                      <div className="ge-detail-value">
                        {modal.entity.name || "—"}
                      </div>
                    </div>
                    <div className="ge-detail-item">
                      <div className="ge-detail-label">Entity Email</div>
                      <div className="ge-detail-value">
                        {modal.entity.email || "—"}
                      </div>
                    </div>
                    <div className="ge-detail-item">
                      <div className="ge-detail-label">Phone</div>
                      <div className="ge-detail-value">
                        {modal.entity.phone || "—"}
                      </div>
                    </div>
                    <div className="ge-detail-item">
                      <div className="ge-detail-label">Address</div>
                      <div className="ge-detail-value">
                        {modal.entity.address || "—"}
                      </div>
                    </div>
                  </div>

                  {modal.entity.notes && (
                    <>
                      <div className="ge-detail-divider" />
                      <div className="ge-detail-item">
                        <div className="ge-detail-label">Notes</div>
                        <div
                          className="ge-detail-value"
                          style={{ marginTop: 4, lineHeight: 1.6 }}
                        >
                          {modal.entity.notes}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="ge-modal-footer">
                  <button
                    className="ge-btn ge-btn-edit"
                    onClick={() => openEdit(modal.entity)}
                  >
                    <Icon name="edit" /> Edit Entity
                  </button>
                  <button
                    className="ge-btn ge-btn-delete"
                    onClick={() => openDelete(modal.entity)}
                  >
                    <Icon name="trash" /> Delete
                  </button>
                </div>
              </>
            )}

            {/* ── CREATE / EDIT modal ── */}
            {(modal.mode === "create" || modal.mode === "edit") && (
              <>
                <div className="ge-modal-header">
                  <div>
                    <div className="ge-modal-title">
                      {modal.mode === "create"
                        ? "Add New Entity"
                        : "Edit Entity"}
                    </div>
                    <div className="ge-modal-sub">
                      {modal.entity.entityEmail}
                    </div>
                  </div>
                  <button className="ge-modal-close" onClick={closeModal}>
                    <Icon name="close" />
                  </button>
                </div>

                <div className="ge-modal-body">
                  <div className="ge-form-grid">
                    <div className="ge-field span2">
                      <label className="ge-label">Entity Name</label>
                      <input
                        className="ge-input"
                        placeholder="e.g. Ministry of Finance"
                        value={form.entityName}
                        onChange={(e) =>
                          handleFormChange("entityName", e.target.value)
                        }
                      />
                    </div>
                    <div className="ge-field">
                      <label className="ge-label">Entity Email</label>
                      <input
                        className="ge-input"
                        type="email"
                        placeholder="entity@gov.sa"
                        value={form.entityEmail}
                        onChange={(e) =>
                          handleFormChange("entityEmail", e.target.value)
                        }
                      />
                    </div>
                    <div className="ge-field">
                      <label className="ge-label">Phone</label>
                      <input
                        className="ge-input"
                        placeholder="+966 11 000 0000"
                        value={form.phone}
                        onChange={(e) =>
                          handleFormChange("phone", e.target.value)
                        }
                      />
                    </div>
                    <div className="ge-field span2">
                      <label className="ge-label">Address</label>
                      <input
                        className="ge-input"
                        placeholder="City, Country"
                        value={form.address}
                        onChange={(e) =>
                          handleFormChange("address", e.target.value)
                        }
                      />
                    </div>
                    <div className="ge-field">
                      <label className="ge-label">Admin Full Name</label>
                      <input
                        className="ge-input"
                        placeholder="Full name"
                        value={form.adminFullName}
                        onChange={(e) =>
                          handleFormChange("adminFullName", e.target.value)
                        }
                      />
                    </div>
                    <div className="ge-field">
                      <label className="ge-label">Admin Email</label>
                      <input
                        className="ge-input"
                        type="email"
                        placeholder="admin@entity.gov"
                        value={form.adminEmail}
                        onChange={(e) =>
                          handleFormChange("adminEmail", e.target.value)
                        }
                      />
                    </div>
                    {modal.mode === "create" && (
                      <div className="ge-field span2">
                        <label className="ge-label">Password</label>
                        <input
                          className="ge-input"
                          type="password"
                          placeholder="Set initial password"
                          value={form.password}
                          onChange={(e) =>
                            handleFormChange("password", e.target.value)
                          }
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="ge-modal-footer">
                  <button className="ge-btn ge-btn-cancel" onClick={closeModal}>
                    Cancel
                  </button>
                  <button
                    className="ge-btn ge-btn-save"
                    onClick={
                      modal.mode === "create" ? handleCreate : handleUpdate
                    }
                    disabled={!form.entityName.trim()}
                    style={{
                      opacity: form.entityName.trim() ? 1 : 0.5,
                      cursor: form.entityName.trim()
                        ? "pointer"
                        : "not-allowed",
                    }}
                  >
                    <Icon name="save" />
                    {modal.mode === "create" ? "Create Entity" : "Save Changes"}
                  </button>
                </div>
              </>
            )}

            {/* ── DELETE confirm modal ── */}
            {modal.mode === "delete" && (
              <>
                <div className="ge-modal-header">
                  <div>
                    <div className="ge-modal-title">Confirm Deletion</div>
                    <div className="ge-modal-sub">
                      This action cannot be undone
                    </div>
                  </div>
                  <button className="ge-modal-close" onClick={closeModal}>
                    <Icon name="close" />
                  </button>
                </div>

                <div className="ge-modal-body">
                  <div className="ge-delete-confirm">
                    <div className="ge-delete-icon">
                      <Icon name="trash" />
                    </div>
                    <div className="ge-delete-title">
                      Delete "{modal.entity.name}"?
                    </div>
                    <p className="ge-delete-text">
                      You are about to permanently remove this entity and all
                      its associated data from the platform. This cannot be
                      reversed.
                    </p>
                  </div>
                </div>

                <div className="ge-modal-footer">
                  <button className="ge-btn ge-btn-cancel" onClick={closeModal}>
                    Cancel
                  </button>
                  <button
                    className="ge-btn ge-btn-delete"
                    style={{ marginLeft: "auto" }}
                    onClick={() => handleDelete(modal.entity.id)}
                  >
                    <Icon name="trash" /> Yes, Delete
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
