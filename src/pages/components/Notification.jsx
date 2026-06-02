import { useState, useEffect, useMemo } from "react";
import {
  getAllNotifications,
  getMyNotifications,
  broadcastNotification,
  sendNotificationToEntity,
  markNotificationRead,
  deleteNotification,
  getAllGovEntities,
} from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import "./Notification.css";

/* ─── Enum maps ──────────────────────────────────────────────────────────── */
const TYPE_MAP = {
  0: "general",
  1: "alert",
  2: "maintenance",
  3: "vulnerability",
  4: "policyupdate",
};
const TYPE_TO_NUM = {
  general: 0,
  alert: 1,
  maintenance: 2,
  vulnerability: 3,
  policyupdate: 4,
};
const TYPE_LABELS = {
  general: "General",
  alert: "Alert",
  maintenance: "Maintenance",
  vulnerability: "Vulnerability",
  policyupdate: "Policy Update",
};

function normalize(n) {
  return { ...n, type: TYPE_MAP[n.type] ?? "general" };
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
    bell: (
      <svg viewBox="0 0 24 24">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
    alert: (
      <svg viewBox="0 0 24 24">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
    wrench: (
      <svg viewBox="0 0 24 24">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    ),
    shield: (
      <svg viewBox="0 0 24 24">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    file: (
      <svg viewBox="0 0 24 24">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
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
    x: (
      <svg viewBox="0 0 24 24">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    ),
    send: (
      <svg viewBox="0 0 24 24">
        <line x1="22" y1="2" x2="11" y2="13" />
        <polygon points="22 2 15 22 11 13 2 9 22 2" />
      </svg>
    ),
    broadcast: (
      <svg viewBox="0 0 24 24">
        <path d="M18 8a6 6 0 0 1 0 8" />
        <path d="M6 8a6 6 0 0 0 0 8" />
        <path d="M20 5a10 10 0 0 1 0 14" />
        <path d="M4 5a10 10 0 0 0 0 14" />
        <circle cx="12" cy="12" r="2" />
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

function typeIcon(type) {
  const map = {
    general: "bell",
    alert: "alert",
    maintenance: "wrench",
    vulnerability: "shield",
    policyupdate: "file",
  };
  return map[type] || "bell";
}

function blankForm(mode) {
  return {
    title: "",
    message: "",
    type: "general",
    governmentEntityId: "",
    mode,
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════════════ */
export default function Notifications() {
  const { role } = useAuth();
  const isAdmin = role === "PlatformAdmin";

  const [notifications, setNotifications] = useState([]);
  const [entities, setEntities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterRead, setFilterRead] = useState("all");
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadNotifications();
    if (isAdmin) loadEntities();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    setError("");
    try {
      const data = isAdmin
        ? await getAllNotifications()
        : await getMyNotifications();
      setNotifications((Array.isArray(data) ? data : []).map(normalize));
    } catch (err) {
      console.error(err);
      setError("Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  const loadEntities = async () => {
    try {
      const data = await getAllGovEntities();
      setEntities(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  /* ── Filtered list ── */
  const filtered = useMemo(() => {
    return notifications
      .filter((n) => {
        const q = search.toLowerCase();
        return (
          (n.title || "").toLowerCase().includes(q) ||
          (n.message || "").toLowerCase().includes(q)
        );
      })
      .filter((n) => filterType === "all" || n.type === filterType)
      .filter((n) => {
        if (filterRead === "unread") return !n.isRead;
        if (filterRead === "read") return n.isRead;
        return true;
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [notifications, search, filterType, filterRead]);

  /* ── Stats ── */
  const stats = useMemo(
    () => ({
      total: notifications.length,
      unread: notifications.filter((n) => !n.isRead).length,
      alerts: notifications.filter(
        (n) => n.type === "alert" || n.type === "vulnerability",
      ).length,
      general: notifications.filter((n) => n.type === "general").length,
    }),
    [notifications],
  );

  /* ── Modal helpers ── */
  const openView = (n) => setModal({ mode: "view", data: { ...n } });
  const openBroadcast = () =>
    setModal({ mode: "broadcast", form: blankForm("broadcast") });
  const openSendTo = () =>
    setModal({ mode: "sendto", form: blankForm("sendto") });
  const openDelete = (n) => setModal({ mode: "delete", data: { ...n } });
  const closeModal = () => setModal(null);
  const setFormField = (k, v) =>
    setModal((p) => ({ ...p, form: { ...p.form, [k]: v } }));

  /* ── Mark as read ── */
  const handleMarkRead = async (n, e) => {
    e?.stopPropagation();
    if (n.isRead) return;
    try {
      await markNotificationRead(n.id);
      setNotifications((prev) =>
        prev.map((x) => (x.id === n.id ? { ...x, isRead: true } : x)),
      );
      if (modal?.data?.id === n.id)
        setModal((p) => ({ ...p, data: { ...p.data, isRead: true } }));
    } catch (err) {
      console.error(err);
    }
  };

  /* ── Delete ── */
  const handleDelete = async () => {
    setSaving(true);
    try {
      await deleteNotification(modal.data.id);
      setNotifications((prev) => prev.filter((n) => n.id !== modal.data.id));
      closeModal();
    } catch (err) {
      console.error(err);
      alert("Failed to delete notification.");
    } finally {
      setSaving(false);
    }
  };

  /* ── Send notification ── */
  const handleSend = async () => {
    const f = modal.form;
    if (!f.title || !f.message) return;
    setSaving(true);
    try {
      const body = {
        title: f.title,
        message: f.message,
        type: TYPE_TO_NUM[f.type] ?? 0,
      };
      if (modal.mode === "broadcast") {
        await broadcastNotification(body);
      } else {
        if (!f.governmentEntityId) return;
        await sendNotificationToEntity({
          ...body,
          governmentEntityId: Number(f.governmentEntityId),
        });
      }
      await loadNotifications();
      closeModal();
    } catch (err) {
      console.error(err);
      alert("Failed to send notification.");
    } finally {
      setSaving(false);
    }
  };

  /* ── Loading / error ── */
  if (loading) {
    return (
      <div
        className="nt-wrap"
        style={{ alignItems: "center", justifyContent: "center" }}
      >
        <div style={{ color: "rgba(53,88,114,0.5)", fontSize: "0.9rem" }}>
          Loading notifications…
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="nt-wrap"
        style={{ alignItems: "center", justifyContent: "center" }}
      >
        <div style={{ color: "#c0392b", fontSize: "0.9rem" }}>{error}</div>
        <button
          onClick={loadNotifications}
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
    <div className="nt-wrap">
      {/* ── Toolbar ── */}
      <div className="nt-toolbar">
        <div className="nt-search">
          <div style={{ width: 15, height: 15, flexShrink: 0 }}>
            <Icon name="search" />
          </div>
          <input
            placeholder="Search notifications…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="nt-filter-select"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="all">All Types</option>
          {Object.entries(TYPE_LABELS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>

        <select
          className="nt-filter-select"
          value={filterRead}
          onChange={(e) => setFilterRead(e.target.value)}
        >
          <option value="all">All</option>
          <option value="unread">Unread</option>
          <option value="read">Read</option>
        </select>

        {/* Admin only send buttons */}
        {isAdmin && (
          <>
            <button
              className="nt-btn-primary"
              style={{ marginLeft: 0 }}
              onClick={openSendTo}
            >
              <div style={{ width: 15, height: 15 }}>
                <Icon name="send" />
              </div>
              Send to Entity
            </button>
            <button className="nt-btn-primary" onClick={openBroadcast}>
              <div style={{ width: 15, height: 15 }}>
                <Icon name="broadcast" />
              </div>
              Broadcast
            </button>
          </>
        )}
      </div>

      {/* ── Stats ── */}
      <div className="nt-stats">
        <div className="nt-stat">
          <div className="nt-stat-icon total">
            <div style={{ width: 18, height: 18 }}>
              <Icon name="bell" />
            </div>
          </div>
          <div>
            <div className="nt-stat-val">{stats.total}</div>
            <div className="nt-stat-lbl">Total</div>
          </div>
        </div>
        <div className="nt-stat">
          <div className="nt-stat-icon unread">
            <div style={{ width: 18, height: 18 }}>
              <Icon name="bell" />
            </div>
          </div>
          <div>
            <div className="nt-stat-val">{stats.unread}</div>
            <div className="nt-stat-lbl">Unread</div>
          </div>
        </div>
        <div className="nt-stat">
          <div className="nt-stat-icon alert">
            <div style={{ width: 18, height: 18 }}>
              <Icon name="alert" />
            </div>
          </div>
          <div>
            <div className="nt-stat-val">{stats.alerts}</div>
            <div className="nt-stat-lbl">Alerts</div>
          </div>
        </div>
        <div className="nt-stat">
          <div className="nt-stat-icon general">
            <div style={{ width: 18, height: 18 }}>
              <Icon name="bell" />
            </div>
          </div>
          <div>
            <div className="nt-stat-val">{stats.general}</div>
            <div className="nt-stat-lbl">General</div>
          </div>
        </div>
      </div>

      {/* ── List ── */}
      <div className="nt-list-card">
        <div className="nt-list-scroll">
          {filtered.length === 0 ? (
            <div className="nt-empty">No notifications found.</div>
          ) : (
            filtered.map((n) => (
              <div
                key={n.id}
                className={`nt-item${n.isRead ? "" : " unread"}`}
                onClick={() => {
                  openView(n);
                  handleMarkRead(n);
                }}
              >
                <div className={`nt-item-icon ${n.type}`}>
                  <div style={{ width: 17, height: 17 }}>
                    <Icon name={typeIcon(n.type)} />
                  </div>
                </div>

                <div className="nt-item-body">
                  <div className="nt-item-title">{n.title}</div>
                  <div className="nt-item-message">{n.message}</div>
                  <div className="nt-item-meta">
                    <span className={`nt-type-pill ${n.type}`}>
                      {TYPE_LABELS[n.type]}
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    gap: 8,
                    flexShrink: 0,
                  }}
                >
                  <span className="nt-item-time">
                    {formatDate(n.createdAt)}
                  </span>
                  <div
                    className="nt-item-actions"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {!n.isRead && (
                      <button
                        className="nt-icon-btn read"
                        onClick={(e) => handleMarkRead(n, e)}
                        title="Mark as read"
                      >
                        <div style={{ width: 13, height: 13 }}>
                          <Icon name="check" />
                        </div>
                      </button>
                    )}
                    {isAdmin && (
                      <button
                        className="nt-icon-btn delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          openDelete(n);
                        }}
                        title="Delete"
                      >
                        <div style={{ width: 13, height: 13 }}>
                          <Icon name="trash" />
                        </div>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ══ MODAL ════════════════════════════════════════════════════════ */}
      {modal && (
        <div className="nt-overlay" onClick={closeModal}>
          <div className="nt-modal" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="nt-modal-header">
              <div>
                <div className="nt-modal-title">
                  {modal.mode === "view" && modal.data.title}
                  {modal.mode === "broadcast" && "Broadcast Notification"}
                  {modal.mode === "sendto" && "Send to Entity"}
                  {modal.mode === "delete" && "Delete Notification"}
                </div>
                {modal.mode === "view" && (
                  <div className="nt-modal-sub">
                    {TYPE_LABELS[modal.data.type]} ·{" "}
                    {formatDate(modal.data.createdAt)}
                  </div>
                )}
              </div>
              <button className="nt-modal-close" onClick={closeModal}>
                <div style={{ width: 15, height: 15 }}>
                  <Icon name="x" />
                </div>
              </button>
            </div>

            {/* Body */}
            <div className="nt-modal-body">
              {/* VIEW */}
              {modal.mode === "view" && (
                <>
                  <div className="nt-detail-message">{modal.data.message}</div>
                  <div className="nt-detail-grid">
                    <div>
                      <div className="nt-detail-label">Type</div>
                      <div>
                        <span className={`nt-type-pill ${modal.data.type}`}>
                          {TYPE_LABELS[modal.data.type]}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="nt-detail-label">Status</div>
                      <div className="nt-detail-value">
                        {modal.data.isRead ? "Read" : "Unread"}
                      </div>
                    </div>
                    <div>
                      <div className="nt-detail-label">Created At</div>
                      <div className="nt-detail-value">
                        {formatDate(modal.data.createdAt)}
                      </div>
                    </div>
                    {modal.data.governmentEntityId && (
                      <div>
                        <div className="nt-detail-label">Entity ID</div>
                        <div className="nt-detail-value">
                          {modal.data.governmentEntityId}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* BROADCAST / SEND TO ENTITY */}
              {(modal.mode === "broadcast" || modal.mode === "sendto") && (
                <div className="nt-form-grid">
                  {modal.mode === "sendto" && (
                    <div className="nt-field">
                      <label className="nt-label">Government Entity</label>
                      <select
                        className="nt-select"
                        value={modal.form.governmentEntityId}
                        onChange={(e) =>
                          setFormField("governmentEntityId", e.target.value)
                        }
                      >
                        <option value="">Select entity…</option>
                        {entities.map((en) => (
                          <option key={en.id} value={en.id}>
                            {en.name || en.entityName}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div className="nt-field">
                    <label className="nt-label">Title</label>
                    <input
                      className="nt-input"
                      placeholder="Notification title"
                      value={modal.form.title}
                      onChange={(e) => setFormField("title", e.target.value)}
                    />
                  </div>
                  <div className="nt-field">
                    <label className="nt-label">Type</label>
                    <select
                      className="nt-select"
                      value={modal.form.type}
                      onChange={(e) => setFormField("type", e.target.value)}
                    >
                      {Object.entries(TYPE_LABELS).map(([k, v]) => (
                        <option key={k} value={k}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="nt-field">
                    <label className="nt-label">Message</label>
                    <textarea
                      className="nt-textarea"
                      placeholder="Write your message…"
                      value={modal.form.message}
                      onChange={(e) => setFormField("message", e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* DELETE */}
              {modal.mode === "delete" && (
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
                    Delete Notification?
                  </div>
                  <div
                    style={{
                      fontSize: "0.87rem",
                      color: "rgba(53,88,114,0.6)",
                      lineHeight: 1.5,
                    }}
                  >
                    This will permanently remove{" "}
                    <strong>"{modal.data.title}"</strong>. This action cannot be
                    undone.
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="nt-modal-footer">
              {modal.mode === "view" && (
                <>
                  {!modal.data.isRead && (
                    <button
                      className="nt-btn nt-btn-read"
                      onClick={() => handleMarkRead(modal.data)}
                    >
                      <div style={{ width: 14, height: 14 }}>
                        <Icon name="check" />
                      </div>{" "}
                      Mark as Read
                    </button>
                  )}
                  {isAdmin && (
                    <button
                      className="nt-btn nt-btn-delete"
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
              {(modal.mode === "broadcast" || modal.mode === "sendto") && (
                <>
                  <button className="nt-btn nt-btn-cancel" onClick={closeModal}>
                    Cancel
                  </button>
                  <button
                    className="nt-btn nt-btn-send"
                    onClick={handleSend}
                    disabled={
                      saving || !modal.form.title || !modal.form.message
                    }
                  >
                    <div style={{ width: 14, height: 14 }}>
                      <Icon name="send" />
                    </div>
                    {saving
                      ? "Sending…"
                      : modal.mode === "broadcast"
                        ? "Broadcast"
                        : "Send"}
                  </button>
                </>
              )}
              {modal.mode === "delete" && (
                <>
                  <button className="nt-btn nt-btn-cancel" onClick={closeModal}>
                    Cancel
                  </button>
                  <button
                    className="nt-btn nt-btn-delete"
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
