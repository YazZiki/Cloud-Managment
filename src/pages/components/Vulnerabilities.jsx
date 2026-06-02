import { useState, useEffect, useMemo } from "react";
import {
  getAllVulnerabilities,
  getMyVulnerabilities,
  createVulnerability,
  updateVulnerability,
  updateVulnerabilityStatus,
  deleteVulnerability,
} from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import "./Vulnerabilities.css";

/* ─── Enum maps ──────────────────────────────────────────────────────────── */
const SEVERITY_MAP = { 0: "low", 1: "medium", 2: "high", 3: "critical" };
const SEVERITY_TO_NUM = { low: 0, medium: 1, high: 2, critical: 3 };
const STATUS_MAP = { 0: "open", 1: "in-progress", 2: "resolved", 3: "closed" };
const STATUS_TO_NUM = { open: 0, "in-progress": 1, resolved: 2, closed: 3 };
const SEVERITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function normalize(v) {
  return {
    ...v,
    severity: SEVERITY_MAP[v.severity] ?? "low",
    status: STATUS_MAP[v.status] ?? "open",
  };
}

function blankVuln() {
  return { title: "", description: "", severity: "medium" };
}

/* ─── Icon component ─────────────────────────────────────────────────────── */
function Icon({ name }) {
  const icons = {
    search: (
      <svg viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
    plus: (
      <svg viewBox="0 0 24 24">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    ),
    eye: (
      <svg viewBox="0 0 24 24">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
    edit: (
      <svg viewBox="0 0 24 24">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    ),
    trash: (
      <svg viewBox="0 0 24 24">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
        <path d="M10 11v6" />
        <path d="M14 11v6" />
        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
      </svg>
    ),
    x: (
      <svg viewBox="0 0 24 24">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    ),
    shield: (
      <svg viewBox="0 0 24 24">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    save: (
      <svg viewBox="0 0 24 24">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
        <polyline points="17 21 17 13 7 13 7 21" />
        <polyline points="7 3 7 8 15 8" />
      </svg>
    ),
    alert: (
      <svg viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
  };
  return icons[name] ? (
    <svg
      viewBox="0 0 24 24"
      style={{
        width: "100%",
        height: "100%",
        stroke: "currentColor",
        fill: "none",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }}
    >
      {icons[name].props.children}
    </svg>
  ) : null;
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════════════ */
export default function Vulnerabilities() {
  const { role } = useAuth();
  const isAdmin = role === "PlatformAdmin";
  const isEntityAdmin = role === "EntityAdmin";

  const [vulns, setVulns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);

  /* ── Load — admin gets all, entity admin gets only theirs ── */
  useEffect(() => {
    loadVulns();
  }, []);

  const loadVulns = async () => {
    setLoading(true);
    setError("");
    try {
      const data = isEntityAdmin
        ? await getMyVulnerabilities()
        : await getAllVulnerabilities();
      setVulns((Array.isArray(data) ? data : []).map(normalize));
    } catch (err) {
      console.error(err);
      setError("Failed to load vulnerabilities. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ── Filtered list ── */
  const filtered = useMemo(() => {
    return vulns
      .filter((v) => {
        const q = search.toLowerCase();
        return (
          String(v.id).includes(q) ||
          (v.title || "").toLowerCase().includes(q) ||
          (v.governmentEntityName || "").toLowerCase().includes(q) ||
          (v.description || "").toLowerCase().includes(q)
        );
      })
      .filter((v) => filterSeverity === "all" || v.severity === filterSeverity)
      .filter((v) => filterStatus === "all" || v.status === filterStatus)
      .sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);
  }, [vulns, search, filterSeverity, filterStatus]);

  /* ── Stat counts ── */
  const counts = useMemo(
    () => ({
      critical: vulns.filter((v) => v.severity === "critical").length,
      high: vulns.filter((v) => v.severity === "high").length,
      medium: vulns.filter((v) => v.severity === "medium").length,
      low: vulns.filter((v) => v.severity === "low").length,
    }),
    [vulns],
  );

  /* ── Modal helpers ── */
  const openView = (v) =>
    setModal({ mode: "view", data: { ...v }, resolutionNotes: "" });
  const openEdit = (v) => setModal({ mode: "edit", data: { ...v } });
  const openCreate = () => setModal({ mode: "create", data: blankVuln() });
  const openDelete = (v) => setModal({ mode: "delete", data: { ...v } });
  const closeModal = () => setModal(null);
  const setField = (k, val) =>
    setModal((p) => ({ ...p, data: { ...p.data, [k]: val } }));

  /* ── Create ── */
  const handleCreate = async () => {
    const d = modal.data;
    if (!d.title) return;
    setSaving(true);
    try {
      const created = await createVulnerability({
        title: d.title,
        description: d.description || "",
        severity: SEVERITY_TO_NUM[d.severity] ?? 1,
      });
      setVulns((prev) => [normalize(created), ...prev]);
      closeModal();
    } catch (err) {
      console.error(err);
      alert("Failed to create vulnerability.");
    } finally {
      setSaving(false);
    }
  };

  /* ── Update (edit) ── */
  const handleUpdate = async () => {
    const d = modal.data;
    if (!d.title) return;
    setSaving(true);
    try {
      await updateVulnerability(d.id, {
        title: d.title,
        description: d.description || "",
        severity: SEVERITY_TO_NUM[d.severity] ?? 0,
      });
      setVulns((prev) => prev.map((v) => (v.id === d.id ? { ...v, ...d } : v)));
      closeModal();
    } catch (err) {
      console.error(err);
      alert("Failed to update vulnerability.");
    } finally {
      setSaving(false);
    }
  };

  /* ── Status change (admin only) ── */
  const handleStatusChange = async (newStatus) => {
    const d = modal.data;
    setSaving(true);
    try {
      await updateVulnerabilityStatus(d.id, {
        status: STATUS_TO_NUM[newStatus] ?? 0,
        resolutionNotes: modal.resolutionNotes || "",
      });
      const updated = { ...d, status: newStatus };
      setVulns((prev) => prev.map((v) => (v.id === d.id ? updated : v)));
      setModal((p) => ({ ...p, data: updated }));
    } catch (err) {
      console.error(err);
      alert("Failed to update status.");
    } finally {
      setSaving(false);
    }
  };

  /* ── Delete (admin only) ── */
  const handleDelete = async () => {
    setSaving(true);
    try {
      await deleteVulnerability(modal.data.id);
      setVulns((prev) => prev.filter((v) => v.id !== modal.data.id));
      closeModal();
    } catch (err) {
      console.error(err);
      alert("Failed to delete vulnerability.");
    } finally {
      setSaving(false);
    }
  };

  /* ── Loading / error states ── */
  if (loading) {
    return (
      <div
        className="vl-wrap"
        style={{ alignItems: "center", justifyContent: "center" }}
      >
        <div style={{ color: "rgba(53,88,114,0.5)", fontSize: "0.9rem" }}>
          Loading vulnerabilities…
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="vl-wrap"
        style={{ alignItems: "center", justifyContent: "center" }}
      >
        <div style={{ color: "#c0392b", fontSize: "0.9rem" }}>{error}</div>
        <button
          onClick={loadVulns}
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
    <div className="vl-wrap">
      {/* ── Toolbar ── */}
      <div className="vl-toolbar">
        <div className="vl-search">
          <div style={{ width: 15, height: 15, flexShrink: 0 }}>
            <Icon name="search" />
          </div>
          <input
            placeholder="Search by ID, title, entity…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="vl-filter-select"
          value={filterSeverity}
          onChange={(e) => setFilterSeverity(e.target.value)}
        >
          <option value="all">All Severities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <select
          className="vl-filter-select"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="open">Open</option>
          <option value="in-progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>

        {/* Only EntityAdmin can create vulnerabilities */}
        {isEntityAdmin && (
          <button className="vl-btn-primary" onClick={openCreate}>
            <div style={{ width: 15, height: 15 }}>
              <Icon name="plus" />
            </div>
            New Vulnerability
          </button>
        )}
      </div>

      {/* ── Stats ── */}
      <div className="vl-stats">
        {[
          { key: "critical", label: "Critical" },
          { key: "high", label: "High" },
          { key: "medium", label: "Medium" },
          { key: "low", label: "Low" },
        ].map(({ key, label }) => (
          <div className="vl-stat" key={key}>
            <div className={`vl-stat-icon ${key}`}>
              <div style={{ width: 18, height: 18 }}>
                <Icon name="shield" />
              </div>
            </div>
            <div>
              <div className="vl-stat-val">{counts[key]}</div>
              <div className="vl-stat-lbl">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Table ── */}
      <div className="vl-table-card">
        <div className="vl-table-scroll">
          <table className="vl-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Title</th>
                {isAdmin && <th>Entity</th>}
                <th>Severity</th>
                <th>Status</th>
                <th>Reported At</th>
                <th>Resolution Notes</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 8 : 7}>
                    <div className="vl-empty">No vulnerabilities found.</div>
                  </td>
                </tr>
              ) : (
                filtered.map((v) => (
                  <tr key={v.id} onClick={() => openView(v)}>
                    <td>
                      <span className="vl-vuln-id">#{v.id}</span>
                    </td>
                    <td>
                      <div className="vl-vuln-title">{v.title}</div>
                    </td>
                    {isAdmin && (
                      <td>
                        <span className="vl-vuln-sub">
                          {v.governmentEntityName || "—"}
                        </span>
                      </td>
                    )}
                    <td>
                      <span className={`vl-severity ${v.severity}`}>
                        {v.severity.charAt(0).toUpperCase() +
                          v.severity.slice(1)}
                      </span>
                    </td>
                    <td>
                      <span className={`vl-pill ${v.status}`}>
                        {v.status
                          .replace("-", " ")
                          .replace(/\b\w/g, (c) => c.toUpperCase())}
                      </span>
                    </td>
                    <td
                      style={{
                        fontSize: "0.8rem",
                        color: "rgba(53,88,114,0.6)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {formatDate(v.reportedAt)}
                    </td>
                    <td
                      style={{
                        fontSize: "0.8rem",
                        color: "rgba(53,88,114,0.6)",
                        maxWidth: 160,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {v.resolutionNotes || "—"}
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div className="vl-row-actions">
                        <button
                          className="vl-icon-btn view"
                          onClick={() => openView(v)}
                          title="View"
                        >
                          <div style={{ width: 13, height: 13 }}>
                            <Icon name="eye" />
                          </div>
                        </button>
                        <button
                          className="vl-icon-btn edit"
                          onClick={() => openEdit(v)}
                          title="Edit"
                        >
                          <div style={{ width: 13, height: 13 }}>
                            <Icon name="edit" />
                          </div>
                        </button>
                        {/* Only admin can delete */}
                        {isAdmin && (
                          <button
                            className="vl-icon-btn delete"
                            onClick={() => openDelete(v)}
                            title="Delete"
                          >
                            <div style={{ width: 13, height: 13 }}>
                              <Icon name="trash" />
                            </div>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ══ MODAL ══════════════════════════════════════════════════════════ */}
      {modal && (
        <div className="vl-overlay" onClick={closeModal}>
          <div className="vl-modal" onClick={(e) => e.stopPropagation()}>
            {/* ── Header ── */}
            <div className="vl-modal-header">
              <div className="vl-modal-header-left">
                {modal.mode !== "create" && (
                  <div
                    className={`vl-modal-severity-badge ${modal.data.severity}`}
                  >
                    <div style={{ width: 20, height: 20 }}>
                      <Icon name="shield" />
                    </div>
                  </div>
                )}
                <div>
                  <div className="vl-modal-title">
                    {modal.mode === "view" && modal.data.title}
                    {modal.mode === "edit" && "Edit Vulnerability"}
                    {modal.mode === "create" && "New Vulnerability"}
                    {modal.mode === "delete" && "Delete Vulnerability"}
                  </div>
                  {modal.mode === "view" && (
                    <div className="vl-modal-sub">
                      #{modal.data.id} ·{" "}
                      {modal.data.governmentEntityName || "—"}
                    </div>
                  )}
                </div>
              </div>
              <button className="vl-modal-close" onClick={closeModal}>
                <div style={{ width: 15, height: 15 }}>
                  <Icon name="x" />
                </div>
              </button>
            </div>

            {/* ── Body ── */}
            <div className="vl-modal-body">
              {/* VIEW MODE */}
              {modal.mode === "view" && (
                <>
                  {/* Status tabs — admin only */}
                  {isAdmin && (
                    <>
                      <div
                        style={{
                          marginBottom: 6,
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          letterSpacing: "0.07em",
                          textTransform: "uppercase",
                          color: "rgba(53,88,114,0.45)",
                        }}
                      >
                        Change Status
                      </div>
                      <div className="vl-status-tabs">
                        {["open", "in-progress", "resolved", "closed"].map(
                          (s) => (
                            <button
                              key={s}
                              className={`vl-status-tab${modal.data.status === s ? ` ${s}` : ""}`}
                              onClick={() => handleStatusChange(s)}
                              disabled={saving}
                            >
                              {s
                                .replace("-", " ")
                                .replace(/\b\w/g, (c) => c.toUpperCase())}
                            </button>
                          ),
                        )}
                      </div>

                      {/* Resolution notes — admin only */}
                      <div className="vl-field" style={{ marginBottom: 20 }}>
                        <label className="vl-label">
                          Resolution Notes{" "}
                          <span
                            style={{
                              fontWeight: 400,
                              textTransform: "none",
                              fontSize: "0.7rem",
                              color: "rgba(53,88,114,0.4)",
                            }}
                          >
                            (optional)
                          </span>
                        </label>
                        <textarea
                          className="vl-textarea"
                          placeholder="Add notes when changing status…"
                          value={modal.resolutionNotes || ""}
                          onChange={(e) =>
                            setModal((p) => ({
                              ...p,
                              resolutionNotes: e.target.value,
                            }))
                          }
                          rows={2}
                        />
                      </div>
                    </>
                  )}

                  {/* Details grid */}
                  <div className="vl-detail-grid">
                    <div>
                      <div className="vl-detail-label">ID</div>
                      <div className="vl-detail-value">#{modal.data.id}</div>
                    </div>
                    {isAdmin && (
                      <div>
                        <div className="vl-detail-label">Entity</div>
                        <div className="vl-detail-value">
                          {modal.data.governmentEntityName || "—"}
                        </div>
                      </div>
                    )}
                    <div>
                      <div className="vl-detail-label">Severity</div>
                      <div>
                        <span className={`vl-severity ${modal.data.severity}`}>
                          {modal.data.severity.charAt(0).toUpperCase() +
                            modal.data.severity.slice(1)}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="vl-detail-label">Status</div>
                      <div>
                        <span className={`vl-pill ${modal.data.status}`}>
                          {modal.data.status
                            .replace("-", " ")
                            .replace(/\b\w/g, (c) => c.toUpperCase())}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="vl-detail-label">Reported At</div>
                      <div className="vl-detail-value">
                        {formatDate(modal.data.reportedAt)}
                      </div>
                    </div>
                    <div>
                      <div className="vl-detail-label">Resolved At</div>
                      <div className="vl-detail-value">
                        {formatDate(modal.data.resolvedAt)}
                      </div>
                    </div>
                  </div>

                  <div className="vl-detail-divider" />

                  <div className="vl-detail-label">Description</div>
                  <div
                    style={{
                      fontSize: "0.87rem",
                      color: "#355872",
                      lineHeight: 1.6,
                      marginTop: 6,
                    }}
                  >
                    {modal.data.description || "—"}
                  </div>

                  {modal.data.resolutionNotes && (
                    <>
                      <div className="vl-detail-divider" />
                      <div className="vl-detail-label">Resolution Notes</div>
                      <div
                        style={{
                          fontSize: "0.87rem",
                          color: "#355872",
                          lineHeight: 1.6,
                          marginTop: 6,
                        }}
                      >
                        {modal.data.resolutionNotes}
                      </div>
                    </>
                  )}
                </>
              )}

              {/* CREATE MODE — EntityAdmin only */}
              {modal.mode === "create" && (
                <div className="vl-form-grid">
                  <div className="vl-field span2">
                    <label className="vl-label">Title</label>
                    <input
                      className="vl-input"
                      placeholder="Vulnerability title"
                      value={modal.data.title}
                      onChange={(e) => setField("title", e.target.value)}
                    />
                  </div>
                  <div className="vl-field span2">
                    <label className="vl-label">Severity</label>
                    <select
                      className="vl-select"
                      value={modal.data.severity}
                      onChange={(e) => setField("severity", e.target.value)}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                  <div className="vl-field span2">
                    <label className="vl-label">Description</label>
                    <textarea
                      className="vl-textarea"
                      placeholder="Describe the vulnerability…"
                      value={modal.data.description || ""}
                      onChange={(e) => setField("description", e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* EDIT MODE — both roles */}
              {modal.mode === "edit" && (
                <div className="vl-form-grid">
                  <div className="vl-field span2">
                    <label className="vl-label">Title</label>
                    <input
                      className="vl-input"
                      placeholder="Vulnerability title"
                      value={modal.data.title}
                      onChange={(e) => setField("title", e.target.value)}
                    />
                  </div>
                  <div className="vl-field span2">
                    <label className="vl-label">Severity</label>
                    <select
                      className="vl-select"
                      value={modal.data.severity}
                      onChange={(e) => setField("severity", e.target.value)}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                  <div className="vl-field span2">
                    <label className="vl-label">Description</label>
                    <textarea
                      className="vl-textarea"
                      placeholder="Describe the vulnerability…"
                      value={modal.data.description || ""}
                      onChange={(e) => setField("description", e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* DELETE MODE — admin only */}
              {modal.mode === "delete" && (
                <div className="vl-delete-confirm">
                  <div className="vl-delete-icon">
                    <div style={{ width: 24, height: 24 }}>
                      <Icon name="trash" />
                    </div>
                  </div>
                  <div className="vl-delete-title">
                    Delete Vulnerability #{modal.data.id}?
                  </div>
                  <div className="vl-delete-text">
                    This will permanently remove{" "}
                    <strong>{modal.data.title}</strong> from the system. This
                    action cannot be undone.
                  </div>
                </div>
              )}
            </div>

            {/* ── Footer ── */}
            <div className="vl-modal-footer">
              {modal.mode === "view" && (
                <>
                  <button
                    className="vl-btn vl-btn-edit"
                    onClick={() =>
                      setModal({ mode: "edit", data: { ...modal.data } })
                    }
                  >
                    <div style={{ width: 14, height: 14 }}>
                      <Icon name="edit" />
                    </div>{" "}
                    Edit
                  </button>
                  {isAdmin && (
                    <button
                      className="vl-btn vl-btn-delete"
                      onClick={() =>
                        setModal({ mode: "delete", data: { ...modal.data } })
                      }
                    >
                      <div style={{ width: 14, height: 14 }}>
                        <Icon name="trash" />
                      </div>{" "}
                      Delete
                    </button>
                  )}
                </>
              )}
              {modal.mode === "create" && (
                <>
                  <button className="vl-btn vl-btn-cancel" onClick={closeModal}>
                    Cancel
                  </button>
                  <button
                    className="vl-btn vl-btn-save"
                    onClick={handleCreate}
                    disabled={saving || !modal.data.title}
                  >
                    <div style={{ width: 14, height: 14 }}>
                      <Icon name="save" />
                    </div>
                    {saving ? "Creating…" : "Create"}
                  </button>
                </>
              )}
              {modal.mode === "edit" && (
                <>
                  <button className="vl-btn vl-btn-cancel" onClick={closeModal}>
                    Cancel
                  </button>
                  <button
                    className="vl-btn vl-btn-save"
                    onClick={handleUpdate}
                    disabled={saving || !modal.data.title}
                  >
                    <div style={{ width: 14, height: 14 }}>
                      <Icon name="save" />
                    </div>
                    {saving ? "Saving…" : "Save Changes"}
                  </button>
                </>
              )}
              {modal.mode === "delete" && (
                <>
                  <button className="vl-btn vl-btn-cancel" onClick={closeModal}>
                    Cancel
                  </button>
                  <button
                    className="vl-btn vl-btn-delete"
                    onClick={handleDelete}
                    disabled={saving}
                  >
                    <div style={{ width: 14, height: 14 }}>
                      <Icon name="trash" />
                    </div>
                    {saving ? "Deleting…" : "Delete"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
