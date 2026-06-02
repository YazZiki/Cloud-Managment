import { useState, useEffect, useMemo } from "react";
import { getReadinessResults } from "../../services/api.js";
import "./ReadinessPage.css";

/* ─── Enum maps ──────────────────────────────────────────────────────────── */
const LEVEL_MAP = {
  0: "verylow",
  1: "low",
  2: "medium",
  3: "good",
  4: "excellent",
};
const LEVEL_LABELS = {
  verylow: "Very Low",
  low: "Low",
  medium: "Medium",
  good: "Good",
  excellent: "Excellent",
};

/* ─── Axis definitions (matches registration form question keys) ─────────── */
const AXES = [
  { key: "strategic", label: "Strategic & Organizational" },
  { key: "legal", label: "Legal & Regulatory" },
  { key: "technical", label: "Technical & Infrastructure" },
  { key: "security", label: "Security" },
  { key: "data", label: "Data & Applications" },
  { key: "operational", label: "Operational" },
  { key: "financial", label: "Financial & Economic" },
  { key: "human", label: "Human & Change Management" },
];

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function normalize(r) {
  return { ...r, levelKey: LEVEL_MAP[r.resultLevel] ?? "low" };
}

/* Calculate per-axis average from answers array */
function calcAxisScores(answers) {
  const axisMap = {};
  AXES.forEach((a) => {
    axisMap[a.key] = { sum: 0, count: 0 };
  });

  (answers || []).forEach((ans) => {
    const axisKey = ans.questionKey.split("_")[0];
    if (axisMap[axisKey]) {
      axisMap[axisKey].sum += ans.score;
      axisMap[axisKey].count += 1;
    }
  });

  return AXES.map((a) => ({
    ...a,
    avg:
      axisMap[a.key].count > 0 ? axisMap[a.key].sum / axisMap[a.key].count : 0,
  }));
}

/* ─── Icons ──────────────────────────────────────────────────────────────── */
function Icon({ name }) {
  const icons = {
    search: (
      <svg viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
    eye: (
      <svg viewBox="0 0 24 24">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
    x: (
      <svg viewBox="0 0 24 24">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    ),
    chart: (
      <svg viewBox="0 0 24 24">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
    check: (
      <svg viewBox="0 0 24 24">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
    activity: (
      <svg viewBox="0 0 24 24">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
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
   MAIN COMPONENT — PlatformAdmin only
═══════════════════════════════════════════════════════════════════════════ */
export default function Readiness() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterLevel, setFilterLevel] = useState("all");
  const [modal, setModal] = useState(null);

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getReadinessResults();
      setResults((Array.isArray(data) ? data : []).map(normalize));
    } catch (err) {
      console.error(err);
      setError("Failed to load readiness results.");
    } finally {
      setLoading(false);
    }
  };

  /* ── Filtered list ── */
  const filtered = useMemo(() => {
    return results
      .filter((r) => {
        const q = search.toLowerCase();
        return (r.governmentEntityName || "").toLowerCase().includes(q);
      })
      .filter((r) => filterLevel === "all" || r.levelKey === filterLevel)
      .sort((a, b) => b.finalScore - a.finalScore);
  }, [results, search, filterLevel]);

  /* ── Stats ── */
  const stats = useMemo(() => {
    const s = {
      total: results.length,
      excellent: 0,
      good: 0,
      medium: 0,
      low: 0,
    };
    results.forEach((r) => {
      if (r.levelKey === "excellent") s.excellent++;
      else if (r.levelKey === "good") s.good++;
      else if (r.levelKey === "medium") s.medium++;
      else s.low++;
    });
    return s;
  }, [results]);

  /* ── Modal ── */
  const openView = (r) =>
    setModal({ data: r, axisScores: calcAxisScores(r.answers) });
  const closeModal = () => setModal(null);

  /* ── Loading / error ── */
  if (loading) {
    return (
      <div
        className="rd-wrap"
        style={{ alignItems: "center", justifyContent: "center" }}
      >
        <div style={{ color: "rgba(53,88,114,0.5)", fontSize: "0.9rem" }}>
          Loading readiness results…
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="rd-wrap"
        style={{ alignItems: "center", justifyContent: "center" }}
      >
        <div style={{ color: "#c0392b", fontSize: "0.9rem" }}>{error}</div>
        <button
          onClick={loadResults}
          style={{
            marginTop: 12,
            padding: "8px 18px",
            background: "#355872",
            color: "#f7f8f0",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            fontFamily: "Syne,sans-serif",
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
    <div className="rd-wrap">
      {/* ── Toolbar ── */}
      <div className="rd-toolbar">
        <div className="rd-search">
          <div style={{ width: 15, height: 15, flexShrink: 0 }}>
            <Icon name="search" />
          </div>
          <input
            placeholder="Search by entity name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="rd-filter-select"
          value={filterLevel}
          onChange={(e) => setFilterLevel(e.target.value)}
        >
          <option value="all">All Levels</option>
          <option value="excellent">Excellent</option>
          <option value="good">Good</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
          <option value="verylow">Very Low</option>
        </select>
      </div>

      {/* ── Stats ── */}
      <div className="rd-stats">
        <div className="rd-stat">
          <div className="rd-stat-icon total">
            <div style={{ width: 16, height: 16 }}>
              <Icon name="chart" />
            </div>
          </div>
          <div>
            <div className="rd-stat-val">{stats.total}</div>
            <div className="rd-stat-lbl">Total Submissions</div>
          </div>
        </div>
        <div className="rd-stat">
          <div className="rd-stat-icon excellent">
            <div style={{ width: 16, height: 16 }}>
              <Icon name="check" />
            </div>
          </div>
          <div>
            <div className="rd-stat-val">{stats.excellent}</div>
            <div className="rd-stat-lbl">Excellent</div>
          </div>
        </div>
        <div className="rd-stat">
          <div className="rd-stat-icon good">
            <div style={{ width: 16, height: 16 }}>
              <Icon name="check" />
            </div>
          </div>
          <div>
            <div className="rd-stat-val">{stats.good}</div>
            <div className="rd-stat-lbl">Good</div>
          </div>
        </div>
        <div className="rd-stat">
          <div className="rd-stat-icon medium">
            <div style={{ width: 16, height: 16 }}>
              <Icon name="activity" />
            </div>
          </div>
          <div>
            <div className="rd-stat-val">{stats.medium}</div>
            <div className="rd-stat-lbl">Medium</div>
          </div>
        </div>
        <div className="rd-stat">
          <div className="rd-stat-icon low">
            <div style={{ width: 16, height: 16 }}>
              <Icon name="activity" />
            </div>
          </div>
          <div>
            <div className="rd-stat-val">{stats.low}</div>
            <div className="rd-stat-lbl">Low / Very Low</div>
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="rd-table-card">
        <div className="rd-table-scroll">
          <table className="rd-table">
            <thead>
              <tr>
                <th>Entity</th>
                <th>Final Score</th>
                <th>Result Level</th>
                <th>Answers</th>
                <th>Submitted At</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="rd-empty">No readiness results found.</div>
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.submissionId} onClick={() => openView(r)}>
                    <td style={{ fontWeight: 600 }}>
                      {r.governmentEntityName || "—"}
                    </td>
                    <td>
                      <div className="rd-score-wrap">
                        <div className="rd-score-track">
                          <div
                            className={`rd-score-fill ${r.levelKey}`}
                            style={{ width: `${(r.finalScore / 5) * 100}%` }}
                          />
                        </div>
                        <span className="rd-score-num">
                          {Number(r.finalScore).toFixed(2)}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={`rd-level ${r.levelKey}`}>
                        {LEVEL_LABELS[r.levelKey]}
                      </span>
                    </td>
                    <td
                      style={{
                        fontSize: "0.82rem",
                        color: "rgba(53,88,114,0.6)",
                      }}
                    >
                      {(r.answers || []).length} questions
                    </td>
                    <td
                      style={{
                        fontSize: "0.8rem",
                        color: "rgba(53,88,114,0.6)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {formatDate(r.submittedAt)}
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div className="rd-row-actions">
                        <button
                          className="rd-icon-btn view"
                          onClick={() => openView(r)}
                          title="View Details"
                        >
                          <div style={{ width: 13, height: 13 }}>
                            <Icon name="eye" />
                          </div>
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

      {/* ══ MODAL ════════════════════════════════════════════════════════ */}
      {modal && (
        <div className="rd-overlay" onClick={closeModal}>
          <div className="rd-modal" onClick={(e) => e.stopPropagation()}>
            <div className="rd-modal-header">
              <div>
                <div className="rd-modal-title">
                  {modal.data.governmentEntityName}
                </div>
                <div className="rd-modal-sub">
                  Readiness Assessment · Submitted{" "}
                  {formatDate(modal.data.submittedAt)}
                </div>
              </div>
              <button className="rd-modal-close" onClick={closeModal}>
                <div style={{ width: 15, height: 15 }}>
                  <Icon name="x" />
                </div>
              </button>
            </div>

            <div className="rd-modal-body">
              {/* Summary */}
              <div className="rd-detail-grid">
                <div>
                  <div className="rd-detail-label">Final Score</div>
                  <div className="rd-detail-value">
                    {Number(modal.data.finalScore).toFixed(3)} / 5
                  </div>
                </div>
                <div>
                  <div className="rd-detail-label">Result Level</div>
                  <div>
                    <span className={`rd-level ${modal.data.levelKey}`}>
                      {LEVEL_LABELS[modal.data.levelKey]}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="rd-detail-label">Total Questions</div>
                  <div className="rd-detail-value">
                    {(modal.data.answers || []).length}
                  </div>
                </div>
                <div>
                  <div className="rd-detail-label">Submitted At</div>
                  <div className="rd-detail-value">
                    {formatDate(modal.data.submittedAt)}
                  </div>
                </div>
              </div>

              <div className="rd-detail-divider" />

              {/* Axis breakdown */}
              <div className="rd-detail-label" style={{ marginBottom: 14 }}>
                Score by Axis
              </div>
              <div className="rd-axis-grid">
                {modal.axisScores.map((a) => (
                  <div className="rd-axis-row" key={a.key}>
                    <div className="rd-axis-info">
                      <span className="rd-axis-name">{a.label}</span>
                      <span className="rd-axis-score">
                        {a.avg > 0 ? a.avg.toFixed(2) : "—"} / 5
                      </span>
                    </div>
                    <div className="rd-axis-track">
                      <div
                        className="rd-axis-fill"
                        style={{ width: `${(a.avg / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="rd-detail-divider" />

              {/* All answers */}
              <div className="rd-detail-label" style={{ marginBottom: 10 }}>
                All Answers
              </div>
              <table className="rd-table" style={{ fontSize: "0.8rem" }}>
                <thead>
                  <tr>
                    <th>Question Key</th>
                    <th>Score</th>
                    <th>Note</th>
                  </tr>
                </thead>
                <tbody>
                  {(modal.data.answers || []).map((a, i) => (
                    <tr key={i}>
                      <td style={{ color: "#7aaace", fontWeight: 600 }}>
                        {a.questionKey}
                      </td>
                      <td>
                        <div className="rd-score-wrap">
                          <div
                            className="rd-score-track"
                            style={{ minWidth: 40 }}
                          >
                            <div
                              className="rd-score-fill medium"
                              style={{ width: `${(a.score / 5) * 100}%` }}
                            />
                          </div>
                          <span className="rd-score-num">{a.score}</span>
                        </div>
                      </td>
                      <td style={{ color: "rgba(53,88,114,0.55)" }}>
                        {a.note || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="rd-modal-footer">
              <button className="rd-btn rd-btn-cancel" onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
