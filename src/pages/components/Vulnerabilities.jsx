import { useState, useMemo } from "react";
import "./Vulnerabilities.css";

/* ─── Mock data ──────────────────────────────────────────────────────────── */
const TEAM = [
  { id: 1, name: "Sara Al-Harbi", initials: "SA", color: "#7aaace" },
  { id: 2, name: "Khalid Nasser", initials: "KN", color: "#355872" },
  { id: 3, name: "Lina Mahmoud", initials: "LM", color: "#9cd5ff" },
  { id: 4, name: "Omar Saleh", initials: "OS", color: "#4a7496" },
];

const INITIAL_VULNS = [
  {
    id: "CVE-2024-1182",
    title: "Remote Code Execution",
    affectedSystem: "Node Cluster 3",
    severity: "critical",
    status: "open",
    cvss: 9.8,
    assigneeId: 1,
    description:
      "A critical RCE vulnerability in the runtime allows unauthenticated remote code execution via crafted HTTP requests.",
    discoveredDate: "2024-05-10",
    dueDate: "2024-05-17",
  },
  {
    id: "CVE-2024-0923",
    title: "SQL Injection",
    affectedSystem: "Auth Service",
    severity: "high",
    status: "in-progress",
    cvss: 8.1,
    assigneeId: 2,
    description:
      "Unsanitized input in the login endpoint allows attackers to manipulate SQL queries and extract sensitive data.",
    discoveredDate: "2024-04-28",
    dueDate: "2024-05-20",
  },
  {
    id: "CVE-2024-0741",
    title: "Cross-Site Scripting (XSS)",
    affectedSystem: "Portal UI",
    severity: "medium",
    status: "in-progress",
    cvss: 6.3,
    assigneeId: 3,
    description:
      "Reflected XSS in the search parameter allows attackers to inject arbitrary JavaScript into the victim's browser.",
    discoveredDate: "2024-04-15",
    dueDate: "2024-05-30",
  },
  {
    id: "CVE-2024-0512",
    title: "Insecure Direct Object Reference",
    affectedSystem: "Document API",
    severity: "medium",
    status: "open",
    cvss: 5.9,
    assigneeId: null,
    description:
      "The API exposes internal object references allowing unauthorized access to other users' documents.",
    discoveredDate: "2024-04-10",
    dueDate: "2024-06-01",
  },
  {
    id: "CVE-2024-0388",
    title: "Outdated TLS Configuration",
    affectedSystem: "Load Balancer",
    severity: "low",
    status: "resolved",
    cvss: 3.1,
    assigneeId: 4,
    description:
      "The load balancer still supports TLS 1.0 and 1.1 which are deprecated and vulnerable to known attacks.",
    discoveredDate: "2024-03-20",
    dueDate: "2024-04-30",
  },
  {
    id: "CVE-2024-0271",
    title: "Privilege Escalation",
    affectedSystem: "IAM Module",
    severity: "high",
    status: "accepted",
    cvss: 7.5,
    assigneeId: 2,
    description:
      "A misconfiguration in the IAM module allows low-privileged users to escalate their permissions to admin level.",
    discoveredDate: "2024-03-05",
    dueDate: "2024-04-15",
  },
];

const SEVERITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function initials(name) {
  return name
    ? name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";
}

function blankVuln() {
  return {
    id: "",
    title: "",
    affectedSystem: "",
    severity: "medium",
    status: "open",
    cvss: "",
    assigneeId: null,
    description: "",
    discoveredDate: "",
    dueDate: "",
  };
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
    assign: (
      <svg viewBox="0 0 24 24">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
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
    alert: (
      <svg viewBox="0 0 24 24">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
    save: (
      <svg viewBox="0 0 24 24">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
        <polyline points="17 21 17 13 7 13 7 21" />
        <polyline points="7 3 7 8 15 8" />
      </svg>
    ),
    user: (
      <svg viewBox="0 0 24 24">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
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

/* ─── Main component ─────────────────────────────────────────────────────── */
export default function Vulnerabilities() {
  const [vulns, setVulns] = useState(INITIAL_VULNS);
  const [search, setSearch] = useState("");
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [modal, setModal] = useState(null); // null | { mode, data }

  /* ── Filtered list ── */
  const filtered = useMemo(() => {
    return vulns
      .filter((v) => {
        const q = search.toLowerCase();
        return (
          v.id.toLowerCase().includes(q) ||
          v.title.toLowerCase().includes(q) ||
          v.affectedSystem.toLowerCase().includes(q)
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
  const openView = (v) => setModal({ mode: "view", data: { ...v } });
  const openEdit = (v) => setModal({ mode: "edit", data: { ...v } });
  const openCreate = () => setModal({ mode: "create", data: blankVuln() });
  const openAssign = (v) => setModal({ mode: "assign", data: { ...v } });
  const openDelete = (v) => setModal({ mode: "delete", data: { ...v } });
  const closeModal = () => setModal(null);

  /* ── CRUD operations ── */
  const handleSave = () => {
    const d = modal.data;
    if (!d.id || !d.title || !d.affectedSystem) return;
    if (modal.mode === "create") {
      setVulns((prev) => [d, ...prev]);
    } else {
      setVulns((prev) => prev.map((v) => (v.id === d.id ? d : v)));
    }
    closeModal();
  };

  const handleDelete = () => {
    setVulns((prev) => prev.filter((v) => v.id !== modal.data.id));
    closeModal();
  };

  const handleStatusChange = (status) => {
    const updated = { ...modal.data, status };
    setVulns((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
    setModal((prev) => ({ ...prev, data: updated }));
  };

  const handleAssignSave = () => {
    setVulns((prev) =>
      prev.map((v) => (v.id === modal.data.id ? modal.data : v)),
    );
    closeModal();
  };

  const setField = (key, val) =>
    setModal((prev) => ({ ...prev, data: { ...prev.data, [key]: val } }));

  /* ── Assignee lookup ── */
  const getAssignee = (id) => TEAM.find((t) => t.id === id) || null;

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
            placeholder="Search by CVE ID, title, system…"
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
          <option value="accepted">Accepted</option>
        </select>

        <button className="vl-btn-primary" onClick={openCreate}>
          <div style={{ width: 15, height: 15 }}>
            <Icon name="plus" />
          </div>
          New Vulnerability
        </button>
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
                <th>CVE ID</th>
                <th>Title</th>
                <th>Affected System</th>
                <th>Severity</th>
                <th>CVSS</th>
                <th>Status</th>
                <th>Assignee</th>
                <th>Due Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9}>
                    <div className="vl-empty">No vulnerabilities found.</div>
                  </td>
                </tr>
              ) : (
                filtered.map((v) => {
                  const assignee = getAssignee(v.assigneeId);
                  return (
                    <tr key={v.id} onClick={() => openView(v)}>
                      <td>
                        <span className="vl-vuln-id">{v.id}</span>
                      </td>
                      <td>
                        <div className="vl-vuln-title">{v.title}</div>
                      </td>
                      <td>
                        <span className="vl-vuln-sub">{v.affectedSystem}</span>
                      </td>
                      <td>
                        <span className={`vl-severity ${v.severity}`}>
                          {v.severity.charAt(0).toUpperCase() +
                            v.severity.slice(1)}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600 }}>{v.cvss}</td>
                      <td>
                        <span className={`vl-pill ${v.status}`}>
                          {v.status
                            .replace("-", " ")
                            .replace(/\b\w/g, (c) => c.toUpperCase())}
                        </span>
                      </td>
                      <td>
                        {assignee ? (
                          <div className="vl-assignee">
                            <div
                              className="vl-assignee-avatar"
                              style={{ background: assignee.color }}
                            >
                              {assignee.initials}
                            </div>
                            <span style={{ fontSize: "0.8rem" }}>
                              {assignee.name.split(" ")[0]}
                            </span>
                          </div>
                        ) : (
                          <span
                            style={{
                              fontSize: "0.78rem",
                              color: "rgba(53,88,114,0.4)",
                            }}
                          >
                            Unassigned
                          </span>
                        )}
                      </td>
                      <td
                        style={{
                          fontSize: "0.8rem",
                          color: "rgba(53,88,114,0.6)",
                        }}
                      >
                        {v.dueDate || "—"}
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
                          <button
                            className="vl-icon-btn assign"
                            onClick={() => openAssign(v)}
                            title="Assign"
                          >
                            <div style={{ width: 13, height: 13 }}>
                              <Icon name="assign" />
                            </div>
                          </button>
                          <button
                            className="vl-icon-btn delete"
                            onClick={() => openDelete(v)}
                            title="Delete"
                          >
                            <div style={{ width: 13, height: 13 }}>
                              <Icon name="trash" />
                            </div>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
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
                    {modal.mode === "assign" && "Assign Vulnerability"}
                    {modal.mode === "delete" && "Delete Vulnerability"}
                  </div>
                  {modal.mode === "view" && (
                    <div className="vl-modal-sub">
                      {modal.data.id} · {modal.data.affectedSystem}
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
                  {/* Status change */}
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
                    {["open", "in-progress", "resolved", "accepted"].map(
                      (s) => (
                        <button
                          key={s}
                          className={`vl-status-tab${modal.data.status === s ? ` ${s}` : ""}`}
                          onClick={() => handleStatusChange(s)}
                        >
                          {s
                            .replace("-", " ")
                            .replace(/\b\w/g, (c) => c.toUpperCase())}
                        </button>
                      ),
                    )}
                  </div>

                  {/* Details grid */}
                  <div className="vl-detail-grid">
                    <div>
                      <div className="vl-detail-label">CVE ID</div>
                      <div className="vl-detail-value">{modal.data.id}</div>
                    </div>
                    <div>
                      <div className="vl-detail-label">Affected System</div>
                      <div className="vl-detail-value">
                        {modal.data.affectedSystem}
                      </div>
                    </div>
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
                      <div className="vl-detail-label">Discovered</div>
                      <div className="vl-detail-value">
                        {modal.data.discoveredDate || "—"}
                      </div>
                    </div>
                    <div>
                      <div className="vl-detail-label">Due Date</div>
                      <div className="vl-detail-value">
                        {modal.data.dueDate || "—"}
                      </div>
                    </div>
                  </div>

                  {/* CVSS score */}
                  <div className="vl-detail-label">CVSS Score</div>
                  <div className="vl-cvss-bar-wrap">
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "0.82rem",
                        fontWeight: 600,
                        color: "#355872",
                        marginBottom: 2,
                      }}
                    >
                      <span>{modal.data.cvss}</span>
                      <span>/ 10</span>
                    </div>
                    <div className="vl-cvss-track">
                      <div
                        className={`vl-cvss-fill ${modal.data.severity}`}
                        style={{ width: `${(modal.data.cvss / 10) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="vl-detail-divider" />

                  {/* Description */}
                  <div className="vl-detail-label">Description</div>
                  <div
                    style={{
                      fontSize: "0.87rem",
                      color: "#355872",
                      lineHeight: 1.6,
                      marginTop: 6,
                    }}
                  >
                    {modal.data.description}
                  </div>

                  <div className="vl-detail-divider" />

                  {/* Assignee */}
                  <div className="vl-detail-label">Assigned To</div>
                  <div style={{ marginTop: 8 }}>
                    {getAssignee(modal.data.assigneeId) ? (
                      <div className="vl-assignee">
                        <div
                          className="vl-assignee-avatar"
                          style={{
                            background: getAssignee(modal.data.assigneeId)
                              .color,
                            width: 28,
                            height: 28,
                            fontSize: "0.7rem",
                          }}
                        >
                          {getAssignee(modal.data.assigneeId).initials}
                        </div>
                        <span
                          style={{
                            fontSize: "0.87rem",
                            fontWeight: 500,
                            color: "#355872",
                          }}
                        >
                          {getAssignee(modal.data.assigneeId).name}
                        </span>
                      </div>
                    ) : (
                      <span
                        style={{
                          fontSize: "0.85rem",
                          color: "rgba(53,88,114,0.4)",
                        }}
                      >
                        Unassigned
                      </span>
                    )}
                  </div>
                </>
              )}

              {/* CREATE / EDIT MODE */}
              {(modal.mode === "create" || modal.mode === "edit") && (
                <div className="vl-form-grid">
                  <div className="vl-field">
                    <label className="vl-label">CVE ID</label>
                    <input
                      className="vl-input"
                      placeholder="CVE-YYYY-XXXX"
                      value={modal.data.id}
                      onChange={(e) => setField("id", e.target.value)}
                      readOnly={modal.mode === "edit"}
                    />
                  </div>
                  <div className="vl-field">
                    <label className="vl-label">Affected System</label>
                    <input
                      className="vl-input"
                      placeholder="e.g. Auth Service"
                      value={modal.data.affectedSystem}
                      onChange={(e) =>
                        setField("affectedSystem", e.target.value)
                      }
                    />
                  </div>
                  <div className="vl-field span2">
                    <label className="vl-label">Title</label>
                    <input
                      className="vl-input"
                      placeholder="Vulnerability title"
                      value={modal.data.title}
                      onChange={(e) => setField("title", e.target.value)}
                    />
                  </div>
                  <div className="vl-field">
                    <label className="vl-label">Severity</label>
                    <select
                      className="vl-select"
                      value={modal.data.severity}
                      onChange={(e) => setField("severity", e.target.value)}
                    >
                      <option value="critical">Critical</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                  <div className="vl-field">
                    <label className="vl-label">CVSS Score</label>
                    <input
                      className="vl-input"
                      type="number"
                      min="0"
                      max="10"
                      step="0.1"
                      placeholder="0.0 – 10.0"
                      value={modal.data.cvss}
                      onChange={(e) => setField("cvss", e.target.value)}
                    />
                  </div>
                  <div className="vl-field">
                    <label className="vl-label">Status</label>
                    <select
                      className="vl-select"
                      value={modal.data.status}
                      onChange={(e) => setField("status", e.target.value)}
                    >
                      <option value="open">Open</option>
                      <option value="in-progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="accepted">Accepted</option>
                    </select>
                  </div>
                  <div className="vl-field">
                    <label className="vl-label">Discovered Date</label>
                    <input
                      className="vl-input"
                      type="date"
                      value={modal.data.discoveredDate}
                      onChange={(e) =>
                        setField("discoveredDate", e.target.value)
                      }
                    />
                  </div>
                  <div className="vl-field">
                    <label className="vl-label">Due Date</label>
                    <input
                      className="vl-input"
                      type="date"
                      value={modal.data.dueDate}
                      onChange={(e) => setField("dueDate", e.target.value)}
                    />
                  </div>
                  <div className="vl-field span2">
                    <label className="vl-label">Description</label>
                    <textarea
                      className="vl-textarea"
                      placeholder="Describe the vulnerability…"
                      value={modal.data.description}
                      onChange={(e) => setField("description", e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* ASSIGN MODE */}
              {modal.mode === "assign" && (
                <>
                  <div
                    style={{
                      fontSize: "0.87rem",
                      color: "rgba(53,88,114,0.6)",
                      marginBottom: 20,
                      lineHeight: 1.5,
                    }}
                  >
                    Select a team member to assign{" "}
                    <strong style={{ color: "#355872" }}>
                      {modal.data.title}
                    </strong>{" "}
                    to.
                  </div>
                  <div className="vl-assign-wrap">
                    <div className="vl-assign-label">Team Members</div>
                    <div className="vl-assign-list">
                      {TEAM.map((member) => (
                        <button
                          key={member.id}
                          className={`vl-assignee-chip${modal.data.assigneeId === member.id ? " selected" : ""}`}
                          onClick={() =>
                            setField(
                              "assigneeId",
                              modal.data.assigneeId === member.id
                                ? null
                                : member.id,
                            )
                          }
                        >
                          <div
                            className="vl-assignee-chip-avatar"
                            style={{ background: member.color }}
                          >
                            {member.initials}
                          </div>
                          {member.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* DELETE MODE */}
              {modal.mode === "delete" && (
                <div className="vl-delete-confirm">
                  <div className="vl-delete-icon">
                    <div style={{ width: 24, height: 24 }}>
                      <Icon name="trash" />
                    </div>
                  </div>
                  <div className="vl-delete-title">Delete {modal.data.id}?</div>
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
                  <button
                    className="vl-btn vl-btn-assign"
                    onClick={() =>
                      setModal({ mode: "assign", data: { ...modal.data } })
                    }
                  >
                    <div style={{ width: 14, height: 14 }}>
                      <Icon name="assign" />
                    </div>{" "}
                    Assign
                  </button>
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
                </>
              )}
              {(modal.mode === "create" || modal.mode === "edit") && (
                <>
                  <button className="vl-btn vl-btn-cancel" onClick={closeModal}>
                    Cancel
                  </button>
                  <button className="vl-btn vl-btn-save" onClick={handleSave}>
                    <div style={{ width: 14, height: 14 }}>
                      <Icon name="save" />
                    </div>
                    {modal.mode === "create" ? "Create" : "Save Changes"}
                  </button>
                </>
              )}
              {modal.mode === "assign" && (
                <>
                  <button className="vl-btn vl-btn-cancel" onClick={closeModal}>
                    Cancel
                  </button>
                  <button
                    className="vl-btn vl-btn-assign"
                    onClick={handleAssignSave}
                  >
                    <div style={{ width: 14, height: 14 }}>
                      <Icon name="assign" />
                    </div>{" "}
                    Save Assignment
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
                  >
                    <div style={{ width: 14, height: 14 }}>
                      <Icon name="trash" />
                    </div>{" "}
                    Delete
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
