import { useState, useEffect, useMemo } from "react";
import {
  getAllSupportRequests,
  getMySupportRequests,
  createSupportRequest,
  replySupportRequest,
  closeSupportRequest,
  deleteSupportRequest,
} from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import "./SupportRequests.css";

/* ─── Enum maps ──────────────────────────────────────────────────────────── */
const STATUS_MAP = { 0: "open", 1: "inprogress", 2: "closed" };
const STATUS_LABELS = {
  open: "Open",
  inprogress: "In Progress",
  closed: "Closed",
};

function normalize(r) {
  return { ...r, statusKey: STATUS_MAP[r.status] ?? "open" };
}

function formatDate(iso) {
  if (!iso) return "—";
  return (
    new Date(iso).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }) +
    " " +
    new Date(iso).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    })
  );
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
    x: (
      <svg viewBox="0 0 24 24">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    ),
    headphones: (
      <svg viewBox="0 0 24 24">
        <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
        <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
      </svg>
    ),
    check: (
      <svg viewBox="0 0 24 24">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
    trash: (
      <svg viewBox="0 0 24 24">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
        <path d="M10 11v6M14 11v6" />
        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
      </svg>
    ),
    reply: (
      <svg viewBox="0 0 24 24">
        <polyline points="9 17 4 12 9 7" />
        <path d="M20 18v-2a4 4 0 0 0-4-4H4" />
      </svg>
    ),
    save: (
      <svg viewBox="0 0 24 24">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
        <polyline points="17 21 17 13 7 13 7 21" />
        <polyline points="7 3 7 8 15 8" />
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
export default function SupportRequests() {
  const { role } = useAuth();
  const isAdmin = role === "PlatformAdmin";
  const isEntityAdmin = role === "EntityAdmin";

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [newForm, setNewForm] = useState({ subject: "", message: "" });

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    setError("");
    try {
      const data = isEntityAdmin
        ? await getMySupportRequests()
        : await getAllSupportRequests();
      setRequests((Array.isArray(data) ? data : []).map(normalize));
    } catch (err) {
      console.error(err);
      setError("Failed to load support requests.");
    } finally {
      setLoading(false);
    }
  };

  /* ── Filtered list ── */
  const filtered = useMemo(() => {
    return requests
      .filter((r) => {
        const q = search.toLowerCase();
        return (
          (r.subject || "").toLowerCase().includes(q) ||
          (r.message || "").toLowerCase().includes(q) ||
          (r.governmentEntityName || "").toLowerCase().includes(q) ||
          (r.createdByFullName || "").toLowerCase().includes(q)
        );
      })
      .filter((r) => filterStatus === "all" || r.statusKey === filterStatus)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [requests, search, filterStatus]);

  /* ── Stats ── */
  const stats = useMemo(
    () => ({
      total: requests.length,
      open: requests.filter(
        (r) => r.statusKey === "open" || r.statusKey === "inprogress",
      ).length,
      closed: requests.filter((r) => r.statusKey === "closed").length,
    }),
    [requests],
  );

  /* ── Modal helpers ── */
  const openView = (r) => {
    setReplyText("");
    setModal({ mode: "view", data: { ...r } });
  };
  const openCreate = () => {
    setNewForm({ subject: "", message: "" });
    setModal({ mode: "create" });
  };
  const openDelete = (r) => setModal({ mode: "delete", data: { ...r } });
  const closeModal = () => setModal(null);

  /* ── Create request (EntityAdmin only) ── */
  const handleCreate = async () => {
    if (!newForm.subject.trim() || !newForm.message.trim()) return;
    setSaving(true);
    try {
      const created = await createSupportRequest(newForm);
      setRequests((prev) => [normalize(created), ...prev]);
      closeModal();
    } catch (err) {
      console.error(err);
      alert("Failed to create support request.");
    } finally {
      setSaving(false);
    }
  };

  /* ── Reply (admin only) ── */
  const handleReply = async () => {
    if (!replyText.trim()) return;
    setSaving(true);
    try {
      await replySupportRequest(modal.data.id, { message: replyText });
      // refresh the request to get updated replies
      await loadRequests();
      setReplyText("");
      closeModal();
    } catch (err) {
      console.error(err);
      alert("Failed to send reply.");
    } finally {
      setSaving(false);
    }
  };

  /* ── Close request (admin only) ── */
  const handleClose = async (id) => {
    setSaving(true);
    try {
      await closeSupportRequest(id);
      setRequests((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                statusKey: "closed",
                status: 2,
                closedAt: new Date().toISOString(),
              }
            : r,
        ),
      );
      if (modal?.data?.id === id)
        setModal((p) => ({ ...p, data: { ...p.data, statusKey: "closed" } }));
    } catch (err) {
      console.error(err);
      alert("Failed to close request.");
    } finally {
      setSaving(false);
    }
  };

  /* ── Delete (admin only) ── */
  const handleDelete = async () => {
    setSaving(true);
    try {
      await deleteSupportRequest(modal.data.id);
      setRequests((prev) => prev.filter((r) => r.id !== modal.data.id));
      closeModal();
    } catch (err) {
      console.error(err);
      alert("Failed to delete request.");
    } finally {
      setSaving(false);
    }
  };

  /* ── Loading / error ── */
  if (loading) {
    return (
      <div
        className="sr-wrap"
        style={{ alignItems: "center", justifyContent: "center" }}
      >
        <div style={{ color: "rgba(53,88,114,0.5)", fontSize: "0.9rem" }}>
          Loading support requests…
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="sr-wrap"
        style={{ alignItems: "center", justifyContent: "center" }}
      >
        <div style={{ color: "#c0392b", fontSize: "0.9rem" }}>{error}</div>
        <button
          onClick={loadRequests}
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
    <div className="sr-wrap">
      {/* ── Toolbar ── */}
      <div className="sr-toolbar">
        <div className="sr-search">
          <div style={{ width: 15, height: 15, flexShrink: 0 }}>
            <Icon name="search" />
          </div>
          <input
            placeholder="Search requests…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="sr-filter-select"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="open">Open</option>
          <option value="inprogress">In Progress</option>
          <option value="closed">Closed</option>
        </select>

        {/* Only EntityAdmin can create */}
        {isEntityAdmin && (
          <button className="sr-btn-primary" onClick={openCreate}>
            <div style={{ width: 15, height: 15 }}>
              <Icon name="plus" />
            </div>
            New Request
          </button>
        )}
      </div>

      {/* ── Stats ── */}
      <div className="sr-stats">
        <div className="sr-stat">
          <div className="sr-stat-icon total">
            <div style={{ width: 18, height: 18 }}>
              <Icon name="headphones" />
            </div>
          </div>
          <div>
            <div className="sr-stat-val">{stats.total}</div>
            <div className="sr-stat-lbl">Total Requests</div>
          </div>
        </div>
        <div className="sr-stat">
          <div className="sr-stat-icon open">
            <div style={{ width: 18, height: 18 }}>
              <Icon name="headphones" />
            </div>
          </div>
          <div>
            <div className="sr-stat-val">{stats.open}</div>
            <div className="sr-stat-lbl">Open / In Progress</div>
          </div>
        </div>
        <div className="sr-stat">
          <div className="sr-stat-icon closed">
            <div style={{ width: 18, height: 18 }}>
              <Icon name="check" />
            </div>
          </div>
          <div>
            <div className="sr-stat-val">{stats.closed}</div>
            <div className="sr-stat-lbl">Closed</div>
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="sr-table-card">
        <div className="sr-table-scroll">
          <table className="sr-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Subject</th>
                {isAdmin && <th>Entity</th>}
                {isAdmin && <th>Created By</th>}
                <th>Status</th>
                <th>Replies</th>
                <th>Created At</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 8 : 6}>
                    <div className="sr-empty">No support requests found.</div>
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id} onClick={() => openView(r)}>
                    <td
                      style={{
                        fontSize: "0.78rem",
                        color: "#7aaace",
                        fontWeight: 600,
                      }}
                    >
                      #{r.id}
                    </td>
                    <td>
                      <div className="sr-subject">{r.subject}</div>
                      <div className="sr-message-preview">{r.message}</div>
                    </td>
                    {isAdmin && (
                      <td style={{ fontSize: "0.82rem" }}>
                        {r.governmentEntityName || "—"}
                      </td>
                    )}
                    {isAdmin && (
                      <td style={{ fontSize: "0.82rem" }}>
                        {r.createdByFullName || "—"}
                      </td>
                    )}
                    <td>
                      <span className={`sr-pill ${r.statusKey}`}>
                        {STATUS_LABELS[r.statusKey]}
                      </span>
                    </td>
                    <td>
                      <span className="sr-replies-badge">
                        <div style={{ width: 12, height: 12 }}>
                          <Icon name="reply" />
                        </div>
                        {(r.replies || []).length}
                      </span>
                    </td>
                    <td
                      style={{
                        fontSize: "0.8rem",
                        color: "rgba(53,88,114,0.6)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {formatDate(r.createdAt)}
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div className="sr-row-actions">
                        <button
                          className="sr-icon-btn view"
                          onClick={() => openView(r)}
                          title="View"
                        >
                          <div style={{ width: 13, height: 13 }}>
                            <Icon name="eye" />
                          </div>
                        </button>
                        {isAdmin && r.statusKey !== "closed" && (
                          <button
                            className="sr-icon-btn close"
                            onClick={() => handleClose(r.id)}
                            title="Close"
                          >
                            <div style={{ width: 13, height: 13 }}>
                              <Icon name="check" />
                            </div>
                          </button>
                        )}
                        {isAdmin && (
                          <button
                            className="sr-icon-btn delete"
                            onClick={() => openDelete(r)}
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

      {/* ══ MODAL ════════════════════════════════════════════════════════ */}
      {modal && (
        <div className="sr-overlay" onClick={closeModal}>
          <div className="sr-modal" onClick={(e) => e.stopPropagation()}>
            {/* ── VIEW ── */}
            {modal.mode === "view" && (
              <>
                <div className="sr-modal-header">
                  <div>
                    <div className="sr-modal-title">{modal.data.subject}</div>
                    <div className="sr-modal-sub">
                      #{modal.data.id} · {formatDate(modal.data.createdAt)}
                    </div>
                  </div>
                  <button className="sr-modal-close" onClick={closeModal}>
                    <div style={{ width: 15, height: 15 }}>
                      <Icon name="x" />
                    </div>
                  </button>
                </div>
                <div className="sr-modal-body">
                  {/* Message */}
                  <div className="sr-detail-message">{modal.data.message}</div>

                  {/* Details */}
                  <div className="sr-detail-grid">
                    <div>
                      <div className="sr-detail-label">Status</div>
                      <div>
                        <span className={`sr-pill ${modal.data.statusKey}`}>
                          {STATUS_LABELS[modal.data.statusKey]}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="sr-detail-label">Created By</div>
                      <div className="sr-detail-value">
                        {modal.data.createdByFullName || "—"}
                      </div>
                    </div>
                    {isAdmin && (
                      <div>
                        <div className="sr-detail-label">Entity</div>
                        <div className="sr-detail-value">
                          {modal.data.governmentEntityName || "—"}
                        </div>
                      </div>
                    )}
                    <div>
                      <div className="sr-detail-label">Closed At</div>
                      <div className="sr-detail-value">
                        {formatDate(modal.data.closedAt)}
                      </div>
                    </div>
                  </div>

                  <div className="sr-detail-divider" />

                  {/* Replies */}
                  <div className="sr-detail-label" style={{ marginBottom: 10 }}>
                    Replies ({(modal.data.replies || []).length})
                  </div>
                  <div className="sr-replies">
                    {(modal.data.replies || []).length === 0 ? (
                      <div className="sr-no-replies">No replies yet.</div>
                    ) : (
                      (modal.data.replies || []).map((rep, i) => (
                        <div className="sr-reply-item" key={i}>
                          <div className="sr-reply-meta">
                            <span className="sr-reply-author">
                              {rep.repliedByFullName ||
                                rep.repliedByUserId ||
                                "Support"}
                            </span>
                            <span className="sr-reply-time">
                              {formatDate(rep.repliedAt)}
                            </span>
                          </div>
                          <div className="sr-reply-text">{rep.message}</div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Reply input — admin only, only if not closed */}
                  {isAdmin && modal.data.statusKey !== "closed" && (
                    <>
                      <div className="sr-detail-divider" />
                      <div className="sr-reply-wrap">
                        <div className="sr-reply-label">Write a Reply</div>
                        <textarea
                          className="sr-reply-input"
                          placeholder="Type your reply…"
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                        />
                      </div>
                    </>
                  )}
                </div>

                <div className="sr-modal-footer">
                  {isAdmin && modal.data.statusKey !== "closed" && (
                    <>
                      <button
                        className="sr-btn sr-btn-primary-modal"
                        onClick={handleReply}
                        disabled={saving || !replyText.trim()}
                      >
                        <div style={{ width: 14, height: 14 }}>
                          <Icon name="reply" />
                        </div>
                        {saving ? "Sending…" : "Send Reply"}
                      </button>
                      <button
                        className="sr-btn sr-btn-close"
                        onClick={() => handleClose(modal.data.id)}
                        disabled={saving}
                      >
                        <div style={{ width: 14, height: 14 }}>
                          <Icon name="check" />
                        </div>
                        Close Request
                      </button>
                    </>
                  )}
                  {isAdmin && (
                    <button
                      className="sr-btn sr-btn-delete"
                      onClick={() => openDelete(modal.data)}
                    >
                      <div style={{ width: 14, height: 14 }}>
                        <Icon name="trash" />
                      </div>{" "}
                      Delete
                    </button>
                  )}
                  {!isAdmin && (
                    <button
                      className="sr-btn sr-btn-cancel"
                      onClick={closeModal}
                    >
                      Close
                    </button>
                  )}
                </div>
              </>
            )}

            {/* ── CREATE (EntityAdmin only) ── */}
            {modal.mode === "create" && (
              <>
                <div className="sr-modal-header">
                  <div>
                    <div className="sr-modal-title">New Support Request</div>
                    <div className="sr-modal-sub">
                      Describe your issue and we'll get back to you
                    </div>
                  </div>
                  <button className="sr-modal-close" onClick={closeModal}>
                    <div style={{ width: 15, height: 15 }}>
                      <Icon name="x" />
                    </div>
                  </button>
                </div>
                <div className="sr-modal-body">
                  <div className="sr-form-grid">
                    <div className="sr-field">
                      <label className="sr-label">Subject</label>
                      <input
                        className="sr-input"
                        placeholder="Brief description of the issue"
                        value={newForm.subject}
                        onChange={(e) =>
                          setNewForm((p) => ({ ...p, subject: e.target.value }))
                        }
                      />
                    </div>
                    <div className="sr-field">
                      <label className="sr-label">Message</label>
                      <textarea
                        className="sr-textarea"
                        placeholder="Describe your issue in detail…"
                        value={newForm.message}
                        onChange={(e) =>
                          setNewForm((p) => ({ ...p, message: e.target.value }))
                        }
                      />
                    </div>
                  </div>
                </div>
                <div className="sr-modal-footer">
                  <button className="sr-btn sr-btn-cancel" onClick={closeModal}>
                    Cancel
                  </button>
                  <button
                    className="sr-btn sr-btn-primary-modal"
                    onClick={handleCreate}
                    disabled={
                      saving ||
                      !newForm.subject.trim() ||
                      !newForm.message.trim()
                    }
                  >
                    <div style={{ width: 14, height: 14 }}>
                      <Icon name="save" />
                    </div>
                    {saving ? "Submitting…" : "Submit Request"}
                  </button>
                </div>
              </>
            )}

            {/* ── DELETE ── */}
            {modal.mode === "delete" && (
              <>
                <div className="sr-modal-header">
                  <div>
                    <div className="sr-modal-title">Delete Request</div>
                    <div className="sr-modal-sub">
                      This action cannot be undone
                    </div>
                  </div>
                  <button className="sr-modal-close" onClick={closeModal}>
                    <div style={{ width: 15, height: 15 }}>
                      <Icon name="x" />
                    </div>
                  </button>
                </div>
                <div className="sr-modal-body">
                  <div style={{ textAlign: "center", padding: "10px 0" }}>
                    <div
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: "50%",
                        background: "rgba(220,80,60,0.1)",
                        display: "grid",
                        placeItems: "center",
                        margin: "0 auto 14px",
                        color: "#c0392b",
                      }}
                    >
                      <div style={{ width: 24, height: 24 }}>
                        <Icon name="trash" />
                      </div>
                    </div>
                    <div
                      style={{
                        fontFamily: "Syne,sans-serif",
                        fontSize: "1.05rem",
                        fontWeight: 700,
                        color: "#355872",
                        marginBottom: 8,
                      }}
                    >
                      Delete Request #{modal.data.id}?
                    </div>
                    <p
                      style={{
                        fontSize: "0.87rem",
                        color: "rgba(53,88,114,0.6)",
                        lineHeight: 1.5,
                      }}
                    >
                      This will permanently remove{" "}
                      <strong>"{modal.data.subject}"</strong> and all its
                      replies.
                    </p>
                  </div>
                </div>
                <div className="sr-modal-footer">
                  <button className="sr-btn sr-btn-cancel" onClick={closeModal}>
                    Cancel
                  </button>
                  <button
                    className="sr-btn sr-btn-delete"
                    onClick={handleDelete}
                    disabled={saving}
                  >
                    <div style={{ width: 14, height: 14 }}>
                      <Icon name="trash" />
                    </div>
                    {saving ? "Deleting…" : "Yes, Delete"}
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
