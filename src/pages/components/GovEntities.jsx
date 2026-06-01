import { useState } from "react";
import "./GovEntities.css";

/* ─── Initial data ───────────────────────────────────────────────────────── */
const INITIAL_ENTITIES = [
  {
    id: 1,
    name: "Ministry of Finance",
    sector: "Finance",
    country: "Saudi Arabia",
    contact: "Ahmed Al-Rashid",
    email: "a.rashid@mof.gov",
    phone: "+966 11 405 0000",
    established: "1932",
    employees: "4,200",
    status: "approved",
    score: 91,
    notes: "Lead entity for national budget oversight.",
  },
  {
    id: 2,
    name: "National Health Authority",
    sector: "Health",
    country: "Saudi Arabia",
    contact: "Sara Al-Otaibi",
    email: "s.otaibi@nha.gov",
    phone: "+966 11 800 1234",
    established: "2016",
    employees: "12,500",
    status: "pending",
    score: 67,
    notes: "Regulates healthcare services nationwide.",
  },
  {
    id: 3,
    name: "Transport Directorate",
    sector: "Transport",
    country: "Saudi Arabia",
    contact: "Khalid Mansour",
    email: "k.mansour@transport.gov",
    phone: "+966 11 218 3300",
    established: "1965",
    employees: "3,800",
    status: "approved",
    score: 84,
    notes: "Oversees land, air, and sea transport.",
  },
  {
    id: 4,
    name: "Education Bureau",
    sector: "Education",
    country: "Saudi Arabia",
    contact: "Noura Al-Fahad",
    email: "n.fahad@moe.gov",
    phone: "+966 11 404 2888",
    established: "1954",
    employees: "95,000",
    status: "rejected",
    score: 42,
    notes: "Pending compliance audit for Q2 2026.",
  },
  {
    id: 5,
    name: "Telecom Regulator (CITC)",
    sector: "Telecom",
    country: "Saudi Arabia",
    contact: "Omar Bahamdan",
    email: "o.bahamdan@citc.gov",
    phone: "+966 11 461 0000",
    established: "2001",
    employees: "820",
    status: "suspended",
    score: 55,
    notes: "Under review following data breach report.",
  },
  {
    id: 6,
    name: "General Authority of Customs",
    sector: "Customs",
    country: "Saudi Arabia",
    contact: "Faisal Al-Ghamdi",
    email: "f.ghamdi@customs.gov",
    phone: "+966 12 222 0000",
    established: "1986",
    employees: "6,100",
    status: "approved",
    score: 78,
    notes: "",
  },
  {
    id: 7,
    name: "Saudi Space Commission",
    sector: "Technology",
    country: "Saudi Arabia",
    contact: "Reem Al-Harbi",
    email: "r.harbi@ssc.gov",
    phone: "+966 11 000 7700",
    established: "2018",
    employees: "310",
    status: "pending",
    score: 60,
    notes: "New entity; onboarding in progress.",
  },
];

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
const STATUSES = ["approved", "pending", "rejected", "suspended"];

let nextId = INITIAL_ENTITIES.length + 1;

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function scoreClass(s) {
  return s >= 75 ? "high" : s >= 55 ? "medium" : "low";
}

function IconSvg({ d, d2, circle, rect, poly, line, path2 }) {
  return null; // placeholder — see Icon component below
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

/* ─── Empty form template ─────────────────────────────────────────────────── */
const emptyForm = {
  name: "",
  sector: "Finance",
  country: "Saudi Arabia",
  contact: "",
  email: "",
  phone: "",
  established: "",
  employees: "",
  status: "pending",
  score: 50,
  notes: "",
};

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════════════ */
export default function GovEntities() {
  const [entities, setEntities] = useState(INITIAL_ENTITIES);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilter] = useState("all");
  const [modal, setModal] = useState(null); // null | { mode: 'view'|'edit'|'create'|'delete', entity }
  const [form, setForm] = useState(emptyForm);

  /* ── Derived list ── */
  const visible = entities.filter((e) => {
    const matchSearch =
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.sector.toLowerCase().includes(search.toLowerCase());
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
  const openView = (e) => {
    setModal({ mode: "view", entity: e });
  };
  const openEdit = (e) => {
    setForm({ ...e });
    setModal({ mode: "edit", entity: e });
  };
  const openCreate = () => {
    setForm({ ...emptyForm });
    setModal({ mode: "create", entity: null });
  };
  const openDelete = (e) => {
    setModal({ mode: "delete", entity: e });
  };
  const closeModal = () => setModal(null);

  const handleFormChange = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  /* ── CRUD actions ── */
  const handleCreate = () => {
    const newEntity = { ...form, id: nextId++, score: Number(form.score) };
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

  const handleStatusChange = (id, newStatus) => {
    setEntities((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: newStatus } : e)),
    );
    // if modal is open on this entity, update it
    if (modal?.entity?.id === id) {
      setModal((m) => ({ ...m, entity: { ...m.entity, status: newStatus } }));
      if (modal.mode === "edit") setForm((f) => ({ ...f, status: newStatus }));
    }
  };

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
          {STATUSES.map((s) => (
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
                <th>Entity</th>
                <th>Sector</th>
                <th>Country</th>
                <th>Status</th>
                <th>Compliance Score</th>
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
                      <div className="ge-entity-name">{e.name}</div>
                      <div className="ge-entity-sub">{e.contact}</div>
                    </td>
                    <td>{e.sector}</td>
                    <td>{e.country}</td>
                    <td>
                      <span className={`ge-pill ${e.status}`}>{e.status}</span>
                    </td>
                    <td>
                      <div className="ge-score-wrap">
                        <div className="ge-score-track">
                          <div
                            className={`ge-score-fill ${scoreClass(e.score)}`}
                            style={{ width: `${e.score}%` }}
                          />
                        </div>
                        <span className="ge-score-num">{e.score}%</span>
                      </div>
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
                    <div className="ge-modal-sub">
                      {modal.entity.sector} · {modal.entity.country}
                    </div>
                  </div>
                  <button className="ge-modal-close" onClick={closeModal}>
                    <Icon name="close" />
                  </button>
                </div>

                <div className="ge-modal-body">
                  {/* Status change tabs */}
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
                    {STATUSES.map((s) => (
                      <button
                        key={s}
                        className={`ge-status-tab${modal.entity.status === s ? " " + s : ""}`}
                        onClick={() => handleStatusChange(modal.entity.id, s)}
                      >
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </button>
                    ))}
                  </div>

                  {/* Details */}
                  <div className="ge-detail-grid">
                    <div className="ge-detail-item">
                      <div className="ge-detail-label">Contact Person</div>
                      <div className="ge-detail-value">
                        {modal.entity.contact}
                      </div>
                    </div>
                    <div className="ge-detail-item">
                      <div className="ge-detail-label">Email</div>
                      <div className="ge-detail-value">
                        {modal.entity.email}
                      </div>
                    </div>
                    <div className="ge-detail-item">
                      <div className="ge-detail-label">Phone</div>
                      <div className="ge-detail-value">
                        {modal.entity.phone}
                      </div>
                    </div>
                    <div className="ge-detail-item">
                      <div className="ge-detail-label">Established</div>
                      <div className="ge-detail-value">
                        {modal.entity.established}
                      </div>
                    </div>
                    <div className="ge-detail-item">
                      <div className="ge-detail-label">Employees</div>
                      <div className="ge-detail-value">
                        {modal.entity.employees}
                      </div>
                    </div>
                    <div className="ge-detail-item">
                      <div className="ge-detail-label">Compliance Score</div>
                      <div className="ge-detail-value">
                        <div
                          className="ge-score-wrap"
                          style={{ maxWidth: 160 }}
                        >
                          <div className="ge-score-track">
                            <div
                              className={`ge-score-fill ${scoreClass(modal.entity.score)}`}
                              style={{ width: `${modal.entity.score}%` }}
                            />
                          </div>
                          <span className="ge-score-num">
                            {modal.entity.score}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="ge-detail-item">
                      <div className="ge-detail-label">Current Status</div>
                      <div className="ge-detail-value">
                        <span className={`ge-pill ${modal.entity.status}`}>
                          {modal.entity.status}
                        </span>
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
                      {modal.mode === "create"
                        ? "Fill in the details below"
                        : `Editing: ${modal.entity.name}`}
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
                        value={form.name}
                        onChange={(e) =>
                          handleFormChange("name", e.target.value)
                        }
                      />
                    </div>

                    <div className="ge-field">
                      <label className="ge-label">Sector</label>
                      <select
                        className="ge-select"
                        value={form.sector}
                        onChange={(e) =>
                          handleFormChange("sector", e.target.value)
                        }
                      >
                        {SECTORS.map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                    </div>

                    <div className="ge-field">
                      <label className="ge-label">Country</label>
                      <input
                        className="ge-input"
                        placeholder="e.g. Saudi Arabia"
                        value={form.country}
                        onChange={(e) =>
                          handleFormChange("country", e.target.value)
                        }
                      />
                    </div>

                    <div className="ge-field">
                      <label className="ge-label">Contact Person</label>
                      <input
                        className="ge-input"
                        placeholder="Full name"
                        value={form.contact}
                        onChange={(e) =>
                          handleFormChange("contact", e.target.value)
                        }
                      />
                    </div>

                    <div className="ge-field">
                      <label className="ge-label">Email</label>
                      <input
                        className="ge-input"
                        type="email"
                        placeholder="contact@entity.gov"
                        value={form.email}
                        onChange={(e) =>
                          handleFormChange("email", e.target.value)
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

                    <div className="ge-field">
                      <label className="ge-label">Established</label>
                      <input
                        className="ge-input"
                        placeholder="Year"
                        value={form.established}
                        onChange={(e) =>
                          handleFormChange("established", e.target.value)
                        }
                      />
                    </div>

                    <div className="ge-field">
                      <label className="ge-label">Employees</label>
                      <input
                        className="ge-input"
                        placeholder="e.g. 1,200"
                        value={form.employees}
                        onChange={(e) =>
                          handleFormChange("employees", e.target.value)
                        }
                      />
                    </div>

                    <div className="ge-field">
                      <label className="ge-label">Status</label>
                      <select
                        className="ge-select"
                        value={form.status}
                        onChange={(e) =>
                          handleFormChange("status", e.target.value)
                        }
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="ge-field">
                      <label className="ge-label">
                        Compliance Score ({form.score}%)
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={form.score}
                        onChange={(e) =>
                          handleFormChange("score", e.target.value)
                        }
                        style={{
                          width: "100%",
                          accentColor: "#355872",
                          marginTop: 6,
                        }}
                      />
                    </div>

                    <div className="ge-field span2">
                      <label className="ge-label">Notes</label>
                      <textarea
                        className="ge-textarea"
                        placeholder="Optional notes…"
                        value={form.notes}
                        onChange={(e) =>
                          handleFormChange("notes", e.target.value)
                        }
                      />
                    </div>
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
                    disabled={!form.name.trim()}
                    style={{
                      opacity: form.name.trim() ? 1 : 0.5,
                      cursor: form.name.trim() ? "pointer" : "not-allowed",
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
