import { useState, useMemo } from "react";
import "./Reports.css";

/* ─── Constants ──────────────────────────────────────────────────────────── */
const REPORT_TYPES = [
  {
    key: "risk",
    label: "Risk Report",
    desc: "Threat & risk assessment",
    icon: "alert",
  },
  {
    key: "incident",
    label: "Incident Report",
    desc: "Security incident summary",
    icon: "zap",
  },
  {
    key: "readiness",
    label: "Readiness Report",
    desc: "Operational readiness score",
    icon: "activity",
  },
  {
    key: "maturity",
    label: "Maturity Report",
    desc: "Capability maturity model",
    icon: "bar-chart",
  },
];

const ENTITIES = [
  { id: 1, name: "Ministry of Finance" },
  { id: 2, name: "National Health Authority" },
  { id: 3, name: "Transport Directorate" },
  { id: 4, name: "Education Bureau" },
  { id: 5, name: "Telecom Regulator" },
];

const USERS = [
  { id: "u1", name: "Admin User", initials: "AD", color: "#355872" },
  { id: "u2", name: "Sara Al-Harbi", initials: "SA", color: "#7aaace" },
  { id: "u3", name: "Khalid Nasser", initials: "KN", color: "#4a7496" },
];

const INITIAL_REPORTS = [
  {
    id: 1,
    title: "Q1 2026 Risk Assessment",
    type: "risk",
    governmentEntityId: 1,
    fileUrl: "/reports/q1-2026-risk.pdf",
    generatedByUserId: "u1",
    generatedAt: "2026-03-31T10:22:00",
  },
  {
    id: 2,
    title: "March Incident Summary",
    type: "incident",
    governmentEntityId: 2,
    fileUrl: "/reports/march-incident.pdf",
    generatedByUserId: "u2",
    generatedAt: "2026-04-02T08:15:00",
  },
  {
    id: 3,
    title: "H1 Readiness Evaluation",
    type: "readiness",
    governmentEntityId: 3,
    fileUrl: "/reports/h1-readiness.pdf",
    generatedByUserId: "u1",
    generatedAt: "2026-04-10T14:05:00",
  },
  {
    id: 4,
    title: "2026 Maturity Baseline",
    type: "maturity",
    governmentEntityId: 4,
    fileUrl: "/reports/2026-maturity.pdf",
    generatedByUserId: "u3",
    generatedAt: "2026-04-18T09:40:00",
  },
  {
    id: 5,
    title: "Telecom Risk Exposure Report",
    type: "risk",
    governmentEntityId: 5,
    fileUrl: "/reports/telecom-risk.pdf",
    generatedByUserId: "u2",
    generatedAt: "2026-05-01T11:30:00",
  },
];

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return (
    d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }) +
    " " +
    d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
  );
}

function fileName(url) {
  return url ? url.split("/").pop() : "—";
}

function nextId(list) {
  return list.length ? Math.max(...list.map((r) => r.id)) + 1 : 1;
}

/* ─── Icon component ─────────────────────────────────────────────────────── */
const PATHS = {
  search: (
    <>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </>
  ),
  plus: (
    <>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </>
  ),
  eye: (
    <>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  download: (
    <>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </>
  ),
  trash: (
    <>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </>
  ),
  x: (
    <>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </>
  ),
  alert: (
    <>
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </>
  ),
  zap: (
    <>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </>
  ),
  activity: (
    <>
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </>
  ),
  "bar-chart": (
    <>
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </>
  ),
  file: (
    <>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </>
  ),
  "file-text": (
    <>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </>
  ),
};

function Icon({ name, className }) {
  const path = PATHS[name];
  if (!path) return null;
  return (
    <svg
      className={`rp-icon${className ? ` ${className}` : ""}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {path}
    </svg>
  );
}

/* ─── blank generate form ────────────────────────────────────────────────── */
function blankForm() {
  return {
    title: "",
    type: "risk",
    governmentEntityId: 1,
    fileUrl: "",
    generatedByUserId: "u1",
  };
}

/* ─── Main component ─────────────────────────────────────────────────────── */
export default function Reports() {
  const [reports, setReports] = useState(INITIAL_REPORTS);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [modal, setModal] = useState(null);
  // modal: null | { mode: "view"|"generate"|"delete", data, generating? }

  /* ── Filtered list ── */
  const filtered = useMemo(() => {
    return reports
      .filter((r) => {
        const q = search.toLowerCase();
        return (
          r.title.toLowerCase().includes(q) ||
          String(r.id).includes(q) ||
          r.type.includes(q)
        );
      })
      .filter((r) => filterType === "all" || r.type === filterType)
      .sort((a, b) => new Date(b.generatedAt) - new Date(a.generatedAt));
  }, [reports, search, filterType]);

  /* ── Type counts ── */
  const counts = useMemo(() => {
    const c = { risk: 0, incident: 0, readiness: 0, maturity: 0 };
    reports.forEach((r) => {
      if (c[r.type] !== undefined) c[r.type]++;
    });
    return c;
  }, [reports]);

  /* ── Lookup helpers ── */
  const getEntity = (id) =>
    ENTITIES.find((e) => e.id === id) || { name: "Unknown" };
  const getUser = (id) =>
    USERS.find((u) => u.id === id) || {
      name: "Unknown",
      initials: "?",
      color: "#7aaace",
    };

  /* ── Modal helpers ── */
  const openView = (r) => setModal({ mode: "view", data: { ...r } });
  const openGenerate = () =>
    setModal({ mode: "generate", data: blankForm(), generating: false });
  const openDelete = (r) => setModal({ mode: "delete", data: { ...r } });
  const closeModal = () => setModal(null);

  const setField = (key, val) =>
    setModal((prev) => ({ ...prev, data: { ...prev.data, [key]: val } }));

  /* ── Generate report ── */
  const handleGenerate = async () => {
    const d = modal.data;
    if (!d.title || !d.type) return;

    setModal((prev) => ({ ...prev, generating: true }));
    await new Promise((r) => setTimeout(r, 1800)); // simulate generation

    const newReport = {
      id: nextId(reports),
      title: d.title,
      type: d.type,
      governmentEntityId: Number(d.governmentEntityId),
      fileUrl: d.fileUrl || `/reports/${d.type}-${Date.now()}.pdf`,
      generatedByUserId: d.generatedByUserId,
      generatedAt: new Date().toISOString(),
    };

    setReports((prev) => [newReport, ...prev]);
    closeModal();
  };

  /* ── Delete report ── */
  const handleDelete = () => {
    setReports((prev) => prev.filter((r) => r.id !== modal.data.id));
    closeModal();
  };

  /* ─────────────────────────────────────────────────────────────────────── */
  return (
    <div className="rp-wrap">
      {/* ── Toolbar ── */}
      <div className="rp-toolbar">
        <div className="rp-search">
          <Icon name="search" />
          <input
            placeholder="Search by title, ID, type…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="rp-filter-select"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="all">All Types</option>
          {REPORT_TYPES.map((t) => (
            <option key={t.key} value={t.key}>
              {t.label}
            </option>
          ))}
        </select>

        <button className="rp-btn-primary" onClick={openGenerate}>
          <Icon name="plus" />
          Generate Report
        </button>
      </div>

      {/* ── Type cards ── */}
      <div className="rp-type-grid">
        {REPORT_TYPES.map((t) => (
          <div
            key={t.key}
            className={`rp-type-card ${t.key}${filterType === t.key ? " active" : ""}`}
            onClick={() =>
              setFilterType((prev) => (prev === t.key ? "all" : t.key))
            }
          >
            <div className={`rp-type-icon ${t.key}`}>
              <Icon name={t.icon} />
            </div>
            <div className="rp-type-count">{counts[t.key]}</div>
            <div className="rp-type-label">{t.label}</div>
          </div>
        ))}
      </div>

      {/* ── Table ── */}
      <div className="rp-table-card">
        <div className="rp-table-scroll">
          <table className="rp-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Title</th>
                <th>Type</th>
                <th>Entity</th>
                <th>Generated By</th>
                <th>Generated At</th>
                <th>File</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <div className="rp-empty">No reports found.</div>
                  </td>
                </tr>
              ) : (
                filtered.map((r) => {
                  const entity = getEntity(r.governmentEntityId);
                  const user = getUser(r.generatedByUserId);
                  const rtype = REPORT_TYPES.find((t) => t.key === r.type);
                  return (
                    <tr key={r.id} onClick={() => openView(r)}>
                      <td>
                        <span className="rp-report-id">#{r.id}</span>
                      </td>
                      <td>
                        <span className="rp-report-title">{r.title}</span>
                      </td>
                      <td>
                        <span className={`rp-type-pill ${r.type}`}>
                          {rtype?.label || r.type}
                        </span>
                      </td>
                      <td style={{ fontSize: "0.82rem" }}>{entity.name}</td>
                      <td>
                        <div className="rp-user">
                          <div
                            className="rp-user-avatar"
                            style={{ background: user.color }}
                          >
                            {user.initials}
                          </div>
                          <span style={{ fontSize: "0.82rem" }}>
                            {user.name.split(" ")[0]}
                          </span>
                        </div>
                      </td>
                      <td
                        style={{
                          fontSize: "0.8rem",
                          color: "rgba(53,88,114,0.6)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {formatDate(r.generatedAt)}
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <a
                          href={r.fileUrl}
                          className="rp-file-link"
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Icon name="file-text" />
                          {fileName(r.fileUrl)}
                        </a>
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <div className="rp-row-actions">
                          <button
                            className="rp-icon-btn view"
                            onClick={() => openView(r)}
                            title="View"
                          >
                            <Icon name="eye" />
                          </button>
                          <button
                            className="rp-icon-btn download"
                            title="Download"
                          >
                            <Icon name="download" />
                          </button>
                          <button
                            className="rp-icon-btn delete"
                            onClick={() => openDelete(r)}
                            title="Delete"
                          >
                            <Icon name="trash" />
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
        <div className="rp-overlay" onClick={closeModal}>
          <div className="rp-modal" onClick={(e) => e.stopPropagation()}>
            {/* ── Header ── */}
            <div className="rp-modal-header">
              <div className="rp-modal-header-left">
                {modal.mode === "view" && (
                  <div className={`rp-modal-type-badge ${modal.data.type}`}>
                    <Icon
                      name={
                        REPORT_TYPES.find((t) => t.key === modal.data.type)
                          ?.icon || "file"
                      }
                    />
                  </div>
                )}
                <div>
                  <div className="rp-modal-title">
                    {modal.mode === "view" && modal.data.title}
                    {modal.mode === "generate" && "Generate Report"}
                    {modal.mode === "delete" && "Delete Report"}
                  </div>
                  {modal.mode === "view" && (
                    <div className="rp-modal-sub">
                      Report #{modal.data.id} ·{" "}
                      {formatDate(modal.data.generatedAt)}
                    </div>
                  )}
                </div>
              </div>
              <button className="rp-modal-close" onClick={closeModal}>
                <Icon name="x" />
              </button>
            </div>

            {/* ── Body ── */}
            <div className="rp-modal-body">
              {/* VIEW MODE */}
              {modal.mode === "view" && (
                <>
                  <div className="rp-detail-grid">
                    <div>
                      <div className="rp-detail-label">Report ID</div>
                      <div className="rp-detail-value">#{modal.data.id}</div>
                    </div>
                    <div>
                      <div className="rp-detail-label">Type</div>
                      <div>
                        <span className={`rp-type-pill ${modal.data.type}`}>
                          {
                            REPORT_TYPES.find((t) => t.key === modal.data.type)
                              ?.label
                          }
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="rp-detail-label">Government Entity</div>
                      <div className="rp-detail-value">
                        {getEntity(modal.data.governmentEntityId).name}
                      </div>
                    </div>
                    <div>
                      <div className="rp-detail-label">Generated At</div>
                      <div className="rp-detail-value">
                        {formatDate(modal.data.generatedAt)}
                      </div>
                    </div>
                    <div style={{ gridColumn: "span 2" }}>
                      <div className="rp-detail-label">Generated By</div>
                      <div style={{ marginTop: 6 }}>
                        {(() => {
                          const u = getUser(modal.data.generatedByUserId);
                          return (
                            <div className="rp-user">
                              <div
                                className="rp-user-avatar"
                                style={{
                                  background: u.color,
                                  width: 28,
                                  height: 28,
                                  fontSize: "0.7rem",
                                }}
                              >
                                {u.initials}
                              </div>
                              <span
                                style={{
                                  fontSize: "0.87rem",
                                  fontWeight: 500,
                                  color: "#355872",
                                }}
                              >
                                {u.name}
                              </span>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>

                  <div className="rp-detail-divider" />

                  <div className="rp-detail-label">Report File</div>
                  <div className="rp-file-preview">
                    <div className="rp-file-preview-icon">
                      <Icon name="file-text" />
                    </div>
                    <span className="rp-file-preview-name">
                      {fileName(modal.data.fileUrl)}
                    </span>
                    <a
                      href={modal.data.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rp-file-preview-download"
                    >
                      <Icon name="download" /> Download
                    </a>
                  </div>
                </>
              )}

              {/* GENERATE MODE */}
              {modal.mode === "generate" && (
                <>
                  {modal.generating ? (
                    <div className="rp-generating">
                      <div className="rp-spinner" />
                      <div className="rp-generating-text">
                        Generating report…
                      </div>
                      <div className="rp-generating-sub">
                        This may take a moment
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Type selector */}
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
                        Report Type
                      </div>
                      <div className="rp-gen-types">
                        {REPORT_TYPES.map((t) => (
                          <button
                            key={t.key}
                            className={`rp-gen-type-btn ${t.key}${modal.data.type === t.key ? " selected" : ""}`}
                            onClick={() => setField("type", t.key)}
                          >
                            <div className={`rp-gen-type-icon ${t.key}`}>
                              <Icon name={t.icon} />
                            </div>
                            <div>
                              <div className="rp-gen-type-name">{t.label}</div>
                              <div className="rp-gen-type-desc">{t.desc}</div>
                            </div>
                          </button>
                        ))}
                      </div>

                      {/* Form fields */}
                      <div className="rp-form-grid" style={{ marginTop: 8 }}>
                        <div className="rp-field span2">
                          <label className="rp-label">Report Title</label>
                          <input
                            className="rp-input"
                            placeholder="e.g. Q2 2026 Risk Assessment"
                            value={modal.data.title}
                            onChange={(e) => setField("title", e.target.value)}
                          />
                        </div>
                        <div className="rp-field">
                          <label className="rp-label">Government Entity</label>
                          <select
                            className="rp-select"
                            value={modal.data.governmentEntityId}
                            onChange={(e) =>
                              setField(
                                "governmentEntityId",
                                Number(e.target.value),
                              )
                            }
                          >
                            {ENTITIES.map((en) => (
                              <option key={en.id} value={en.id}>
                                {en.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="rp-field">
                          <label className="rp-label">Generated By</label>
                          <select
                            className="rp-select"
                            value={modal.data.generatedByUserId}
                            onChange={(e) =>
                              setField("generatedByUserId", e.target.value)
                            }
                          >
                            {USERS.map((u) => (
                              <option key={u.id} value={u.id}>
                                {u.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="rp-field span2">
                          <label className="rp-label">
                            File URL{" "}
                            <span
                              style={{
                                fontWeight: 400,
                                textTransform: "none",
                                letterSpacing: 0,
                                color: "rgba(53,88,114,0.45)",
                                fontSize: "0.7rem",
                              }}
                            >
                              (optional — auto-generated if empty)
                            </span>
                          </label>
                          <input
                            className="rp-input"
                            placeholder="/reports/my-report.pdf"
                            value={modal.data.fileUrl}
                            onChange={(e) =>
                              setField("fileUrl", e.target.value)
                            }
                          />
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}

              {/* DELETE MODE */}
              {modal.mode === "delete" && (
                <div className="rp-delete-confirm">
                  <div className="rp-delete-icon">
                    <Icon name="trash" />
                  </div>
                  <div className="rp-delete-title">
                    Delete Report #{modal.data.id}?
                  </div>
                  <div className="rp-delete-text">
                    This will permanently remove{" "}
                    <strong>{modal.data.title}</strong> from the system. This
                    action cannot be undone.
                  </div>
                </div>
              )}
            </div>

            {/* ── Footer ── */}
            <div className="rp-modal-footer">
              {modal.mode === "view" && (
                <>
                  <a
                    href={modal.data.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rp-btn rp-btn-download"
                    style={{ textDecoration: "none" }}
                  >
                    <Icon name="download" /> Download
                  </a>
                  <button
                    className="rp-btn rp-btn-delete"
                    onClick={() =>
                      setModal({ mode: "delete", data: { ...modal.data } })
                    }
                  >
                    <Icon name="trash" /> Delete
                  </button>
                </>
              )}
              {modal.mode === "generate" && !modal.generating && (
                <>
                  <button className="rp-btn rp-btn-cancel" onClick={closeModal}>
                    Cancel
                  </button>
                  <button
                    className="rp-btn rp-btn-generate"
                    onClick={handleGenerate}
                  >
                    <Icon name="plus" />
                    Generate
                  </button>
                </>
              )}
              {modal.mode === "delete" && (
                <>
                  <button className="rp-btn rp-btn-cancel" onClick={closeModal}>
                    Cancel
                  </button>
                  <button
                    className="rp-btn rp-btn-delete"
                    onClick={handleDelete}
                  >
                    <Icon name="trash" /> Delete
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
