import { useState, useEffect, useMemo } from "react";
import {
  getMaturityResults,
  getMyMaturityResult,
  submitMaturityAssessment,
} from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import "./Maturity.css";

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

/* ─── Maturity questions (hardcoded with predefined keys) ────────────────── */
const MATURITY_QUESTIONS = [
  {
    key: "maturity_strategy_q1",
    text: "Does the organization have a defined cloud adoption strategy aligned with business objectives?",
  },
  {
    key: "maturity_strategy_q2",
    text: "Is there a formal governance framework for cloud services management?",
  },
  {
    key: "maturity_strategy_q3",
    text: "Are cloud policies reviewed and updated on a regular basis?",
  },
  {
    key: "maturity_process_q1",
    text: "Are cloud deployment processes standardized and documented?",
  },
  {
    key: "maturity_process_q2",
    text: "Is there a formal change management process for cloud environments?",
  },
  {
    key: "maturity_process_q3",
    text: "Are incident response procedures defined and tested for cloud systems?",
  },
  {
    key: "maturity_tech_q1",
    text: "Is infrastructure-as-code (IaC) used for cloud resource provisioning?",
  },
  {
    key: "maturity_tech_q2",
    text: "Are automated monitoring and alerting systems in place for cloud workloads?",
  },
  {
    key: "maturity_tech_q3",
    text: "Is there a formal CI/CD pipeline for cloud application deployments?",
  },
  {
    key: "maturity_security_q1",
    text: "Are identity and access management (IAM) controls enforced across all cloud services?",
  },
  {
    key: "maturity_security_q2",
    text: "Is data encrypted at rest and in transit across all cloud environments?",
  },
  {
    key: "maturity_security_q3",
    text: "Are regular security assessments and penetration tests conducted on cloud systems?",
  },
  {
    key: "maturity_people_q1",
    text: "Does the team have certified cloud professionals managing the environment?",
  },
  {
    key: "maturity_people_q2",
    text: "Are training and upskilling programs in place for cloud technologies?",
  },
  {
    key: "maturity_people_q3",
    text: "Is there a defined cloud center of excellence (CCoE) or cloud team?",
  },
  {
    key: "maturity_cost_q1",
    text: "Are cloud costs monitored and optimized on an ongoing basis?",
  },
  {
    key: "maturity_cost_q2",
    text: "Is FinOps or cost management tooling in use for cloud spend visibility?",
  },
];

const LIKERT = [
  { value: 1, label: "Initial" },
  { value: 2, label: "Managed" },
  { value: 3, label: "Defined" },
  { value: 4, label: "Quantified" },
  { value: 5, label: "Optimized" },
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
    send: (
      <svg viewBox="0 0 24 24">
        <line x1="22" y1="2" x2="11" y2="13" />
        <polygon points="22 2 15 22 11 13 2 9 22 2" />
      </svg>
    ),
    plus: (
      <svg viewBox="0 0 24 24">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    ),
    check: (
      <svg viewBox="0 0 24 24">
        <polyline points="20 6 9 17 4 12" />
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
export default function Maturity() {
  const { role } = useAuth();
  const isAdmin = role === "PlatformAdmin";
  const isEntityAdmin = role === "EntityAdmin";

  /* ── Admin state ── */
  const [results, setResults] = useState([]);
  const [search, setSearch] = useState("");

  /* ── Entity admin state ── */
  const [myResult, setMyResult] = useState(null);
  const [hasResult, setHasResult] = useState(false);

  /* ── Shared state ── */
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);

  /* ── Assessment form state ── */
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    if (isAdmin) loadAllResults();
    if (isEntityAdmin) loadMyResult();
  }, []);

  /* ── Load all results (admin) ── */
  const loadAllResults = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getMaturityResults();
      setResults((Array.isArray(data) ? data : []).map(normalize));
    } catch (err) {
      console.error(err);
      setError("Failed to load maturity results.");
    } finally {
      setLoading(false);
    }
  };

  /* ── Load my result (entity admin) ── */
  const loadMyResult = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getMyMaturityResult();
      if (data) {
        setMyResult(normalize(data));
        setHasResult(true);
      }
    } catch (err) {
      // 404 means no result yet — not an error
      if (
        err?.message?.includes("404") ||
        err?.message?.includes("not found")
      ) {
        setHasResult(false);
      } else {
        console.error(err);
        setError("Failed to load your maturity result.");
      }
    } finally {
      setLoading(false);
    }
  };

  /* ── Filtered results (admin) ── */
  const filtered = useMemo(() => {
    return results
      .filter((r) => {
        const q = search.toLowerCase();
        return (
          (r.governmentEntityName || "").toLowerCase().includes(q) ||
          String(r.governmentEntityId).includes(q)
        );
      })
      .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
  }, [results, search]);

  /* ── Stats (admin) ── */
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

  /* ── Submit assessment ── */
  const handleSubmit = async () => {
    const unanswered = MATURITY_QUESTIONS.filter(
      (q) => answers[q.key] === undefined,
    );
    if (unanswered.length > 0) {
      alert(
        `Please answer all ${MATURITY_QUESTIONS.length} questions before submitting.`,
      );
      return;
    }
    setSaving(true);
    try {
      const payload = {
        answers: MATURITY_QUESTIONS.map((q) => ({
          questionKey: q.key,
          score: answers[q.key],
          note: "",
        })),
      };
      await submitMaturityAssessment(payload);
      await loadMyResult();
      closeModal();
    } catch (err) {
      console.error(err);
      alert("Failed to submit assessment. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  /* ── Modal helpers ── */
  const openAssessment = () => {
    setAnswers({});
    setModal({ mode: "assess" });
  };
  const openViewResult = (r) => setModal({ mode: "view", data: r });
  const openMyDetail = () => setModal({ mode: "view", data: myResult });
  const closeModal = () => setModal(null);

  const setAnswer = (key, val) => setAnswers((p) => ({ ...p, [key]: val }));

  /* ── Loading / error ── */
  if (loading) {
    return (
      <div
        className="mt-wrap"
        style={{ alignItems: "center", justifyContent: "center" }}
      >
        <div style={{ color: "rgba(53,88,114,0.5)", fontSize: "0.9rem" }}>
          Loading maturity data…
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="mt-wrap"
        style={{ alignItems: "center", justifyContent: "center" }}
      >
        <div style={{ color: "#c0392b", fontSize: "0.9rem" }}>{error}</div>
        <button
          onClick={isAdmin ? loadAllResults : loadMyResult}
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
    <div className="mt-wrap">
      {/* ══════════════════════════════════════════════════════════════════
          PLATFORM ADMIN VIEW
      ══════════════════════════════════════════════════════════════════ */}
      {isAdmin && (
        <>
          {/* Toolbar */}
          <div className="mt-toolbar">
            <div className="mt-search">
              <div style={{ width: 15, height: 15, flexShrink: 0 }}>
                <Icon name="search" />
              </div>
              <input
                placeholder="Search by entity name…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="mt-stats">
            <div className="mt-stat">
              <div className="mt-stat-icon total">
                <div style={{ width: 16, height: 16 }}>
                  <Icon name="chart" />
                </div>
              </div>
              <div>
                <div className="mt-stat-val">{stats.total}</div>
                <div className="mt-stat-lbl">Total Submissions</div>
              </div>
            </div>
            <div className="mt-stat">
              <div className="mt-stat-icon excellent">
                <div style={{ width: 16, height: 16 }}>
                  <Icon name="check" />
                </div>
              </div>
              <div>
                <div className="mt-stat-val">{stats.excellent}</div>
                <div className="mt-stat-lbl">Excellent</div>
              </div>
            </div>
            <div className="mt-stat">
              <div className="mt-stat-icon good">
                <div style={{ width: 16, height: 16 }}>
                  <Icon name="check" />
                </div>
              </div>
              <div>
                <div className="mt-stat-val">{stats.good}</div>
                <div className="mt-stat-lbl">Good</div>
              </div>
            </div>
            <div className="mt-stat">
              <div className="mt-stat-icon medium">
                <div style={{ width: 16, height: 16 }}>
                  <Icon name="chart" />
                </div>
              </div>
              <div>
                <div className="mt-stat-val">{stats.medium}</div>
                <div className="mt-stat-lbl">Medium</div>
              </div>
            </div>
            <div className="mt-stat">
              <div className="mt-stat-icon low">
                <div style={{ width: 16, height: 16 }}>
                  <Icon name="chart" />
                </div>
              </div>
              <div>
                <div className="mt-stat-val">{stats.low}</div>
                <div className="mt-stat-lbl">Low / Very Low</div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="mt-table-card">
            <div className="mt-table-scroll">
              <table className="mt-table">
                <thead>
                  <tr>
                    <th>Entity</th>
                    <th>Final Score</th>
                    <th>Result Level</th>
                    <th>Submitted At</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5}>
                        <div className="mt-empty">
                          No maturity results found.
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((r) => (
                      <tr
                        key={r.submissionId}
                        onClick={() => openViewResult(r)}
                      >
                        <td style={{ fontWeight: 600 }}>
                          {r.governmentEntityName || "—"}
                        </td>
                        <td>
                          <div className="mt-score-wrap">
                            <div className="mt-score-track">
                              <div
                                className={`mt-score-fill ${r.levelKey}`}
                                style={{
                                  width: `${(r.finalScore / 5) * 100}%`,
                                }}
                              />
                            </div>
                            <span className="mt-score-num">
                              {Number(r.finalScore).toFixed(1)}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className={`mt-level ${r.levelKey}`}>
                            {LEVEL_LABELS[r.levelKey]}
                          </span>
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
                          <div className="mt-row-actions">
                            <button
                              className="mt-icon-btn view"
                              onClick={() => openViewResult(r)}
                              title="View"
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
        </>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          ENTITY ADMIN VIEW
      ══════════════════════════════════════════════════════════════════ */}
      {isEntityAdmin && (
        <>
          {hasResult && myResult ? (
            <>
              {/* My result card */}
              <div className="mt-my-result">
                <div className="mt-my-score-circle">
                  <span className="mt-my-score-val">
                    {Number(myResult.finalScore).toFixed(1)}
                  </span>
                </div>
                <div className="mt-my-info">
                  <div className="mt-my-title">
                    Your Maturity Assessment Result
                  </div>
                  <div className="mt-my-sub">
                    Submitted on {formatDate(myResult.submittedAt)}
                  </div>
                  <span className={`mt-level ${myResult.levelKey}`}>
                    {LEVEL_LABELS[myResult.levelKey]}
                  </span>
                </div>
                <button
                  className="mt-btn-primary"
                  onClick={openMyDetail}
                  style={{ marginLeft: "auto" }}
                >
                  <div style={{ width: 15, height: 15 }}>
                    <Icon name="eye" />
                  </div>
                  View Details
                </button>
              </div>

              {/* Answers summary table */}
              <div className="mt-table-card">
                <div className="mt-table-scroll">
                  <table className="mt-table">
                    <thead>
                      <tr>
                        <th>Question Key</th>
                        <th>Score</th>
                        <th>Note</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(myResult.answers || []).map((a, i) => (
                        <tr key={i}>
                          <td
                            style={{
                              fontSize: "0.8rem",
                              color: "#7aaace",
                              fontWeight: 600,
                            }}
                          >
                            {a.questionKey}
                          </td>
                          <td>
                            <div className="mt-score-wrap">
                              <div className="mt-score-track">
                                <div
                                  className="mt-score-fill medium"
                                  style={{ width: `${(a.score / 5) * 100}%` }}
                                />
                              </div>
                              <span className="mt-score-num">{a.score}</span>
                            </div>
                          </td>
                          <td
                            style={{
                              fontSize: "0.8rem",
                              color: "rgba(53,88,114,0.6)",
                            }}
                          >
                            {a.note || "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            /* No result yet */
            <div className="mt-no-result">
              <div className="mt-no-result-title">
                No Maturity Assessment Submitted Yet
              </div>
              <div className="mt-no-result-sub">
                Complete the maturity assessment to get your organization's
                cloud maturity score across strategy, processes, technology,
                security, people, and cost management.
              </div>
              <button
                className="mt-btn-primary"
                style={{ margin: "0 auto" }}
                onClick={openAssessment}
              >
                <div style={{ width: 15, height: 15 }}>
                  <Icon name="plus" />
                </div>
                Start Assessment
              </button>
            </div>
          )}
        </>
      )}

      {/* ══ MODAL ════════════════════════════════════════════════════════ */}
      {modal && (
        <div className="mt-overlay" onClick={closeModal}>
          <div className="mt-modal" onClick={(e) => e.stopPropagation()}>
            {/* ── VIEW RESULT ── */}
            {modal.mode === "view" && (
              <>
                <div className="mt-modal-header">
                  <div>
                    <div className="mt-modal-title">
                      {modal.data.governmentEntityName || "My Result"}
                    </div>
                    <div className="mt-modal-sub">
                      Submitted {formatDate(modal.data.submittedAt)}
                    </div>
                  </div>
                  <button className="mt-modal-close" onClick={closeModal}>
                    <div style={{ width: 15, height: 15 }}>
                      <Icon name="x" />
                    </div>
                  </button>
                </div>
                <div className="mt-modal-body">
                  <div className="mt-detail-grid">
                    <div>
                      <div className="mt-detail-label">Final Score</div>
                      <div className="mt-detail-value">
                        {Number(modal.data.finalScore).toFixed(2)} / 5
                      </div>
                    </div>
                    <div>
                      <div className="mt-detail-label">Result Level</div>
                      <div>
                        <span className={`mt-level ${modal.data.levelKey}`}>
                          {LEVEL_LABELS[modal.data.levelKey]}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="mt-detail-label">Entity</div>
                      <div className="mt-detail-value">
                        {modal.data.governmentEntityName || "—"}
                      </div>
                    </div>
                    <div>
                      <div className="mt-detail-label">Submitted At</div>
                      <div className="mt-detail-value">
                        {formatDate(modal.data.submittedAt)}
                      </div>
                    </div>
                  </div>
                  <div className="mt-detail-divider" />
                  <div className="mt-detail-label" style={{ marginBottom: 10 }}>
                    Answers
                  </div>
                  <div className="mt-answers-list">
                    {(modal.data.answers || []).map((a, i) => (
                      <div className="mt-answer-item" key={i}>
                        <span className="mt-answer-key">{a.questionKey}</span>
                        <span className="mt-answer-score">{a.score}/5</span>
                        <span className="mt-answer-note">{a.note || "—"}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-modal-footer">
                  <button className="mt-btn mt-btn-cancel" onClick={closeModal}>
                    Close
                  </button>
                </div>
              </>
            )}

            {/* ── ASSESSMENT FORM ── */}
            {modal.mode === "assess" && (
              <>
                <div className="mt-modal-header">
                  <div>
                    <div className="mt-modal-title">Maturity Assessment</div>
                    <div className="mt-modal-sub">
                      {Object.keys(answers).length} /{" "}
                      {MATURITY_QUESTIONS.length} answered
                    </div>
                  </div>
                  <button className="mt-modal-close" onClick={closeModal}>
                    <div style={{ width: 15, height: 15 }}>
                      <Icon name="x" />
                    </div>
                  </button>
                </div>
                <div className="mt-modal-body">
                  {MATURITY_QUESTIONS.map((q, idx) => (
                    <div key={q.key}>
                      <div className="mt-question">
                        <span className="mt-q-num">Question {idx + 1}</span>
                        <div className="mt-q-text">{q.text}</div>
                        <div className="mt-radio-row">
                          {LIKERT.map((opt) => (
                            <label className="mt-radio-option" key={opt.value}>
                              <input
                                type="radio"
                                name={q.key}
                                value={opt.value}
                                checked={answers[q.key] === opt.value}
                                onChange={() => setAnswer(q.key, opt.value)}
                              />
                              <span className="mt-radio-label">
                                <span className="mt-radio-num">
                                  {opt.value}
                                </span>
                                <span className="mt-radio-text">
                                  {opt.label}
                                </span>
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                      {idx < MATURITY_QUESTIONS.length - 1 && (
                        <div className="mt-question-divider" />
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-modal-footer">
                  <div
                    style={{
                      fontSize: "0.82rem",
                      color: "rgba(53,88,114,0.5)",
                      flex: 1,
                    }}
                  >
                    {Object.keys(answers).length} / {MATURITY_QUESTIONS.length}{" "}
                    answered
                  </div>
                  <button className="mt-btn mt-btn-cancel" onClick={closeModal}>
                    Cancel
                  </button>
                  <button
                    className="mt-btn mt-btn-submit"
                    onClick={handleSubmit}
                    disabled={
                      saving ||
                      Object.keys(answers).length < MATURITY_QUESTIONS.length
                    }
                  >
                    {saving ? (
                      <>
                        <div className="mt-spinner" /> Submitting…
                      </>
                    ) : (
                      <>
                        <div style={{ width: 14, height: 14 }}>
                          <Icon name="send" />
                        </div>{" "}
                        Submit
                      </>
                    )}
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
