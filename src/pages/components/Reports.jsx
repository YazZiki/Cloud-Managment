import { useState, useEffect } from "react";
import {
  getPlatformSummary,
  getEntityReport,
  getReadinessReport,
  getMaturityReport,
  getVulnerabilitiesReport,
  getAllGovEntities,
} from "../../services/api.js";
import "./Reports.css";

/* ─── Enum maps ──────────────────────────────────────────────────────────── */
const LEVEL_MAP = {
  0: "Very Low",
  1: "Low",
  2: "Medium",
  3: "Good",
  4: "Excellent",
};
const ENT_STATUS = {
  0: "Pending",
  1: "Approved",
  2: "Rejected",
  3: "Suspended",
};

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function ScoreBar({ value, max = 5, color = "#7aaace" }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
      <div
        style={{
          flex: 1,
          height: 6,
          background: "rgba(53,88,114,0.08)",
          borderRadius: 99,
          overflow: "hidden",
          minWidth: 60,
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            borderRadius: 99,
            background: color,
            transition: "width 0.6s cubic-bezier(0.22,1,0.36,1)",
          }}
        />
      </div>
      <span
        style={{
          fontSize: "0.8rem",
          fontWeight: 600,
          color: "#355872",
          minWidth: 32,
        }}
      >
        {Number(value).toFixed(2)}
      </span>
    </div>
  );
}

/* ─── Icons ──────────────────────────────────────────────────────────────── */
function Icon({ name }) {
  const icons = {
    chart: (
      <svg viewBox="0 0 24 24">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
    shield: (
      <svg viewBox="0 0 24 24">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    building: (
      <svg viewBox="0 0 24 24">
        <path d="M3 21h18M3 7l9-4 9 4M4 7v14M20 7v14M8 21v-4a2 2 0 0 1 4 0v4" />
      </svg>
    ),
    activity: (
      <svg viewBox="0 0 24 24">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    check: (
      <svg viewBox="0 0 24 24">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
    x: (
      <svg viewBox="0 0 24 24">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    ),
    eye: (
      <svg viewBox="0 0 24 24">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
    refresh: (
      <svg viewBox="0 0 24 24">
        <polyline points="23 4 23 10 17 10" />
        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
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

/* ─── Tab definitions ────────────────────────────────────────────────────── */
const TABS = [
  { key: "summary", label: "Platform Summary", icon: "chart" },
  { key: "entity", label: "Entity Reports", icon: "building" },
  { key: "readiness", label: "Readiness Report", icon: "activity" },
  { key: "maturity", label: "Maturity Report", icon: "chart" },
  { key: "vulnerabilities", label: "Vulnerability Report", icon: "shield" },
];

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════════════ */
export default function Reports() {
  const [activeTab, setActiveTab] = useState("summary");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ── Data states ── */
  const [summary, setSummary] = useState(null);
  const [entities, setEntities] = useState([]);
  const [selectedEntityId, setSelectedEntityId] = useState("");
  const [entityReport, setEntityReport] = useState(null);
  const [readiness, setReadiness] = useState([]);
  const [maturity, setMaturity] = useState([]);
  const [vulnReport, setVulnReport] = useState(null);

  /* ── Load on tab change ── */
  useEffect(() => {
    loadTab(activeTab);
  }, [activeTab]);

  const loadTab = async (tab) => {
    setLoading(true);
    setError("");
    try {
      if (tab === "summary") {
        const data = await getPlatformSummary();
        setSummary(data);
      } else if (tab === "entity") {
        const data = await getAllGovEntities();
        setEntities(Array.isArray(data) ? data : []);
      } else if (tab === "readiness") {
        const data = await getReadinessReport();
        setReadiness(Array.isArray(data) ? data : []);
      } else if (tab === "maturity") {
        const data = await getMaturityReport();
        setMaturity(Array.isArray(data) ? data : []);
      } else if (tab === "vulnerabilities") {
        const data = await getVulnerabilitiesReport();
        setVulnReport(data);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load report data.");
    } finally {
      setLoading(false);
    }
  };

  const loadEntityReport = async (id) => {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const data = await getEntityReport(id);
      setEntityReport(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load entity report.");
    } finally {
      setLoading(false);
    }
  };

  /* ─────────────────────────────────────────────────────────────────────── */
  return (
    <div className="rpt-wrap">
      {/* ── Tab bar ── */}
      <div className="rpt-tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`rpt-tab${activeTab === t.key ? " active" : ""}`}
            onClick={() => setActiveTab(t.key)}
          >
            <div style={{ width: 15, height: 15 }}>
              <Icon name={t.icon} />
            </div>
            {t.label}
          </button>
        ))}
        <button
          className="rpt-refresh-btn"
          onClick={() => loadTab(activeTab)}
          title="Refresh"
        >
          <div style={{ width: 15, height: 15 }}>
            <Icon name="refresh" />
          </div>
        </button>
      </div>

      {/* ── Content ── */}
      <div className="rpt-content">
        {loading && <div className="rpt-loading">Loading report data…</div>}
        {error && !loading && (
          <div className="rpt-error">
            {error} <button onClick={() => loadTab(activeTab)}>Retry</button>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* ══════════════════════════════════════════════════════════
                PLATFORM SUMMARY
            ══════════════════════════════════════════════════════════ */}
            {activeTab === "summary" && summary && (
              <div className="rpt-section-grid">
                {/* Entity stats */}
                <div className="rpt-card">
                  <div className="rpt-card-title">
                    <div style={{ width: 16, height: 16 }}>
                      <Icon name="building" />
                    </div>
                    Government Entities
                  </div>
                  <div className="rpt-stat-row">
                    <div className="rpt-stat-item">
                      <span className="rpt-stat-val">
                        {summary.totalEntities}
                      </span>
                      <span className="rpt-stat-lbl">Total</span>
                    </div>
                    <div className="rpt-stat-item">
                      <span className="rpt-stat-val green">
                        {summary.approvedEntities}
                      </span>
                      <span className="rpt-stat-lbl">Approved</span>
                    </div>
                    <div className="rpt-stat-item">
                      <span className="rpt-stat-val amber">
                        {summary.pendingEntities}
                      </span>
                      <span className="rpt-stat-lbl">Pending</span>
                    </div>
                    <div className="rpt-stat-item">
                      <span className="rpt-stat-val red">
                        {summary.rejectedEntities + summary.suspendedEntities}
                      </span>
                      <span className="rpt-stat-lbl">Rejected/Suspended</span>
                    </div>
                  </div>
                </div>

                {/* Scores */}
                <div className="rpt-card">
                  <div className="rpt-card-title">
                    <div style={{ width: 16, height: 16 }}>
                      <Icon name="chart" />
                    </div>
                    Average Assessment Scores
                  </div>
                  <div className="rpt-score-list">
                    <div className="rpt-score-row">
                      <span className="rpt-score-label">Readiness</span>
                      <ScoreBar
                        value={summary.averageReadinessScore}
                        color="#7aaace"
                      />
                    </div>
                    <div className="rpt-score-row">
                      <span className="rpt-score-label">Maturity</span>
                      <ScoreBar
                        value={summary.averageMaturityScore}
                        color="#48c78e"
                      />
                    </div>
                    <div className="rpt-score-row">
                      <span className="rpt-score-label">Compliance</span>
                      <ScoreBar
                        value={summary.averageComplianceScore}
                        color="#355872"
                      />
                    </div>
                  </div>
                </div>

                {/* Vulnerabilities */}
                <div className="rpt-card">
                  <div className="rpt-card-title">
                    <div style={{ width: 16, height: 16 }}>
                      <Icon name="shield" />
                    </div>
                    Vulnerabilities
                  </div>
                  <div className="rpt-stat-row">
                    <div className="rpt-stat-item">
                      <span className="rpt-stat-val">
                        {summary.totalVulnerabilities}
                      </span>
                      <span className="rpt-stat-lbl">Total</span>
                    </div>
                    <div className="rpt-stat-item">
                      <span className="rpt-stat-val amber">
                        {summary.openVulnerabilities}
                      </span>
                      <span className="rpt-stat-lbl">Open</span>
                    </div>
                    <div className="rpt-stat-item">
                      <span className="rpt-stat-val red">
                        {summary.criticalVulnerabilities}
                      </span>
                      <span className="rpt-stat-lbl">Critical</span>
                    </div>
                    <div className="rpt-stat-item">
                      <span className="rpt-stat-val green">
                        {summary.resolvedVulnerabilities}
                      </span>
                      <span className="rpt-stat-lbl">Resolved</span>
                    </div>
                  </div>
                </div>

                {/* Support Requests */}
                <div className="rpt-card">
                  <div className="rpt-card-title">
                    <div style={{ width: 16, height: 16 }}>
                      <Icon name="activity" />
                    </div>
                    Support Requests
                  </div>
                  <div className="rpt-stat-row">
                    <div className="rpt-stat-item">
                      <span className="rpt-stat-val">
                        {summary.totalSupportRequests}
                      </span>
                      <span className="rpt-stat-lbl">Total</span>
                    </div>
                    <div className="rpt-stat-item">
                      <span className="rpt-stat-val amber">
                        {summary.openSupportRequests}
                      </span>
                      <span className="rpt-stat-lbl">Open</span>
                    </div>
                    <div className="rpt-stat-item">
                      <span className="rpt-stat-val blue">
                        {summary.inProgressSupportRequests}
                      </span>
                      <span className="rpt-stat-lbl">In Progress</span>
                    </div>
                    <div className="rpt-stat-item">
                      <span className="rpt-stat-val green">
                        {summary.closedSupportRequests}
                      </span>
                      <span className="rpt-stat-lbl">Closed</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════
                ENTITY REPORT
            ══════════════════════════════════════════════════════════ */}
            {activeTab === "entity" && (
              <div>
                <div className="rpt-entity-selector">
                  <label className="rpt-selector-label">
                    Select Government Entity
                  </label>
                  <div style={{ display: "flex", gap: 10 }}>
                    <select
                      className="rpt-select"
                      value={selectedEntityId}
                      onChange={(e) => setSelectedEntityId(e.target.value)}
                    >
                      <option value="">— Choose an entity —</option>
                      {entities.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.name || e.entityName}
                        </option>
                      ))}
                    </select>
                    <button
                      className="rpt-btn-view"
                      onClick={() => loadEntityReport(selectedEntityId)}
                      disabled={!selectedEntityId}
                    >
                      <div style={{ width: 15, height: 15 }}>
                        <Icon name="eye" />
                      </div>
                      View Report
                    </button>
                  </div>
                </div>

                {entityReport && (
                  <div className="rpt-section-grid">
                    {/* Entity info */}
                    <div className="rpt-card rpt-card-full">
                      <div className="rpt-card-title">
                        <div style={{ width: 16, height: 16 }}>
                          <Icon name="building" />
                        </div>
                        {entityReport.governmentEntityName}
                      </div>
                      <div className="rpt-detail-grid">
                        <div>
                          <div className="rpt-dl">Email</div>
                          <div className="rpt-dv">
                            {entityReport.email || "—"}
                          </div>
                        </div>
                        <div>
                          <div className="rpt-dl">Phone</div>
                          <div className="rpt-dv">
                            {entityReport.phone || "—"}
                          </div>
                        </div>
                        <div>
                          <div className="rpt-dl">Address</div>
                          <div className="rpt-dv">
                            {entityReport.address || "—"}
                          </div>
                        </div>
                        <div>
                          <div className="rpt-dl">Status</div>
                          <div className="rpt-dv">
                            <span
                              className={`rpt-pill s${entityReport.status}`}
                            >
                              {ENT_STATUS[entityReport.status] || "—"}
                            </span>
                          </div>
                        </div>
                        <div>
                          <div className="rpt-dl">Created At</div>
                          <div className="rpt-dv">
                            {formatDate(entityReport.createdAt)}
                          </div>
                        </div>
                        <div>
                          <div className="rpt-dl">Approved At</div>
                          <div className="rpt-dv">
                            {formatDate(entityReport.approvedAt)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Scores */}
                    <div className="rpt-card">
                      <div className="rpt-card-title">
                        <div style={{ width: 16, height: 16 }}>
                          <Icon name="chart" />
                        </div>
                        Assessment Scores
                      </div>
                      <div className="rpt-score-list">
                        <div className="rpt-score-row">
                          <span className="rpt-score-label">Readiness</span>
                          <ScoreBar
                            value={entityReport.readinessScore}
                            color="#7aaace"
                          />
                        </div>
                        <div className="rpt-score-row">
                          <span className="rpt-score-label">Maturity</span>
                          <ScoreBar
                            value={entityReport.maturityScore}
                            color="#48c78e"
                          />
                        </div>
                        <div className="rpt-score-row">
                          <span className="rpt-score-label">Compliance</span>
                          <ScoreBar
                            value={entityReport.complianceScore}
                            color="#355872"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Vulnerabilities */}
                    <div className="rpt-card">
                      <div className="rpt-card-title">
                        <div style={{ width: 16, height: 16 }}>
                          <Icon name="shield" />
                        </div>
                        Vulnerabilities
                      </div>
                      <div className="rpt-stat-row">
                        <div className="rpt-stat-item">
                          <span className="rpt-stat-val">
                            {entityReport.totalVulnerabilities}
                          </span>
                          <span className="rpt-stat-lbl">Total</span>
                        </div>
                        <div className="rpt-stat-item">
                          <span className="rpt-stat-val amber">
                            {entityReport.openVulnerabilities}
                          </span>
                          <span className="rpt-stat-lbl">Open</span>
                        </div>
                        <div className="rpt-stat-item">
                          <span className="rpt-stat-val red">
                            {entityReport.criticalVulnerabilities}
                          </span>
                          <span className="rpt-stat-lbl">Critical</span>
                        </div>
                        <div className="rpt-stat-item">
                          <span className="rpt-stat-val green">
                            {entityReport.resolvedVulnerabilities}
                          </span>
                          <span className="rpt-stat-lbl">Resolved</span>
                        </div>
                      </div>
                    </div>

                    {/* Support Requests */}
                    <div className="rpt-card">
                      <div className="rpt-card-title">
                        <div style={{ width: 16, height: 16 }}>
                          <Icon name="activity" />
                        </div>
                        Support Requests
                      </div>
                      <div className="rpt-stat-row">
                        <div className="rpt-stat-item">
                          <span className="rpt-stat-val">
                            {entityReport.totalSupportRequests}
                          </span>
                          <span className="rpt-stat-lbl">Total</span>
                        </div>
                        <div className="rpt-stat-item">
                          <span className="rpt-stat-val amber">
                            {entityReport.openSupportRequests}
                          </span>
                          <span className="rpt-stat-lbl">Open</span>
                        </div>
                        <div className="rpt-stat-item">
                          <span className="rpt-stat-val green">
                            {entityReport.closedSupportRequests}
                          </span>
                          <span className="rpt-stat-lbl">Closed</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════
                READINESS REPORT
            ══════════════════════════════════════════════════════════ */}
            {activeTab === "readiness" && (
              <div className="rpt-table-card">
                <div className="rpt-table-scroll">
                  <table className="rpt-table">
                    <thead>
                      <tr>
                        <th>Entity</th>
                        <th>Final Score</th>
                        <th>Percentage</th>
                        <th>Result Level</th>
                        <th>Submitted At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {readiness.length === 0 ? (
                        <tr>
                          <td colSpan={5}>
                            <div className="rpt-empty">
                              No readiness data available.
                            </div>
                          </td>
                        </tr>
                      ) : (
                        readiness.map((r) => (
                          <tr key={r.submissionId}>
                            <td style={{ fontWeight: 600 }}>
                              {r.governmentEntityName}
                            </td>
                            <td>
                              <ScoreBar value={r.finalScore} />
                            </td>
                            <td>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 8,
                                }}
                              >
                                <div
                                  style={{
                                    flex: 1,
                                    height: 6,
                                    background: "rgba(53,88,114,0.08)",
                                    borderRadius: 99,
                                    overflow: "hidden",
                                  }}
                                >
                                  <div
                                    style={{
                                      height: "100%",
                                      width: `${r.percentage}%`,
                                      background:
                                        "linear-gradient(90deg,#7aaace,#9cd5ff)",
                                      borderRadius: 99,
                                    }}
                                  />
                                </div>
                                <span
                                  style={{
                                    fontSize: "0.8rem",
                                    fontWeight: 600,
                                    color: "#355872",
                                    minWidth: 36,
                                  }}
                                >
                                  {r.percentage}%
                                </span>
                              </div>
                            </td>
                            <td>
                              <span
                                className={`rpt-level-pill l${r.resultLevel}`}
                              >
                                {LEVEL_MAP[r.resultLevel] || "—"}
                              </span>
                            </td>
                            <td
                              style={{
                                fontSize: "0.8rem",
                                color: "rgba(53,88,114,0.6)",
                              }}
                            >
                              {formatDate(r.submittedAt)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════
                MATURITY REPORT
            ══════════════════════════════════════════════════════════ */}
            {activeTab === "maturity" && (
              <div className="rpt-table-card">
                <div className="rpt-table-scroll">
                  <table className="rpt-table">
                    <thead>
                      <tr>
                        <th>Entity</th>
                        <th>Final Score</th>
                        <th>Percentage</th>
                        <th>Result Level</th>
                        <th>Submitted At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {maturity.length === 0 ? (
                        <tr>
                          <td colSpan={5}>
                            <div className="rpt-empty">
                              No maturity data available.
                            </div>
                          </td>
                        </tr>
                      ) : (
                        maturity.map((r) => (
                          <tr key={r.submissionId}>
                            <td style={{ fontWeight: 600 }}>
                              {r.governmentEntityName}
                            </td>
                            <td>
                              <ScoreBar value={r.finalScore} color="#48c78e" />
                            </td>
                            <td>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 8,
                                }}
                              >
                                <div
                                  style={{
                                    flex: 1,
                                    height: 6,
                                    background: "rgba(53,88,114,0.08)",
                                    borderRadius: 99,
                                    overflow: "hidden",
                                  }}
                                >
                                  <div
                                    style={{
                                      height: "100%",
                                      width: `${r.percentage}%`,
                                      background:
                                        "linear-gradient(90deg,#48c78e,#6ee7b7)",
                                      borderRadius: 99,
                                    }}
                                  />
                                </div>
                                <span
                                  style={{
                                    fontSize: "0.8rem",
                                    fontWeight: 600,
                                    color: "#355872",
                                    minWidth: 36,
                                  }}
                                >
                                  {r.percentage}%
                                </span>
                              </div>
                            </td>
                            <td>
                              <span
                                className={`rpt-level-pill l${r.resultLevel}`}
                              >
                                {LEVEL_MAP[r.resultLevel] || "—"}
                              </span>
                            </td>
                            <td
                              style={{
                                fontSize: "0.8rem",
                                color: "rgba(53,88,114,0.6)",
                              }}
                            >
                              {formatDate(r.submittedAt)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════
                VULNERABILITIES REPORT
            ══════════════════════════════════════════════════════════ */}
            {activeTab === "vulnerabilities" && vulnReport && (
              <div>
                {/* Summary cards */}
                <div className="rpt-vuln-summary">
                  {[
                    {
                      label: "Total",
                      val: vulnReport.totalVulnerabilities,
                      color: "#355872",
                    },
                    {
                      label: "Open",
                      val: vulnReport.openVulnerabilities,
                      color: "#c47d00",
                    },
                    {
                      label: "In Progress",
                      val: vulnReport.inProgressVulnerabilities,
                      color: "#7aaace",
                    },
                    {
                      label: "Resolved",
                      val: vulnReport.resolvedVulnerabilities,
                      color: "#2eaa6e",
                    },
                    {
                      label: "Closed",
                      val: vulnReport.closedVulnerabilities,
                      color: "#4a7496",
                    },
                    {
                      label: "Critical",
                      val: vulnReport.criticalVulnerabilities,
                      color: "#c0392b",
                    },
                    {
                      label: "High",
                      val: vulnReport.highVulnerabilities,
                      color: "#f5a623",
                    },
                    {
                      label: "Medium",
                      val: vulnReport.mediumVulnerabilities,
                      color: "#7aaace",
                    },
                    {
                      label: "Low",
                      val: vulnReport.lowVulnerabilities,
                      color: "#4a7496",
                    },
                  ].map((s) => (
                    <div className="rpt-vuln-stat" key={s.label}>
                      <span className="rpt-vuln-val" style={{ color: s.color }}>
                        {s.val}
                      </span>
                      <span className="rpt-vuln-lbl">{s.label}</span>
                    </div>
                  ))}
                </div>

                {/* By entity table */}
                {(vulnReport.byEntity || []).length > 0 && (
                  <div className="rpt-table-card" style={{ marginTop: 20 }}>
                    <div className="rpt-table-scroll">
                      <table className="rpt-table">
                        <thead>
                          <tr>
                            <th>Entity</th>
                            <th>Total</th>
                            <th>Open</th>
                            <th>In Progress</th>
                            <th>Resolved</th>
                            <th>Closed</th>
                            <th>Critical</th>
                            <th>High</th>
                          </tr>
                        </thead>
                        <tbody>
                          {vulnReport.byEntity.map((e) => (
                            <tr key={e.governmentEntityId}>
                              <td style={{ fontWeight: 600 }}>
                                {e.governmentEntityName}
                              </td>
                              <td>{e.total}</td>
                              <td>
                                <span
                                  style={{ color: "#c47d00", fontWeight: 600 }}
                                >
                                  {e.open}
                                </span>
                              </td>
                              <td>
                                <span
                                  style={{ color: "#7aaace", fontWeight: 600 }}
                                >
                                  {e.inProgress}
                                </span>
                              </td>
                              <td>
                                <span
                                  style={{ color: "#2eaa6e", fontWeight: 600 }}
                                >
                                  {e.resolved}
                                </span>
                              </td>
                              <td>
                                <span
                                  style={{ color: "#4a7496", fontWeight: 600 }}
                                >
                                  {e.closed}
                                </span>
                              </td>
                              <td>
                                <span
                                  style={{ color: "#c0392b", fontWeight: 600 }}
                                >
                                  {e.critical}
                                </span>
                              </td>
                              <td>
                                <span
                                  style={{ color: "#f5a623", fontWeight: 600 }}
                                >
                                  {e.high}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
