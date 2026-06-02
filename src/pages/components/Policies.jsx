import { useState, useEffect, useMemo } from "react";
import {
  getAllPolicies,
  createPolicy,
  updatePolicy,
  deletePolicy,
} from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import "./Policies.css";

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const CATEGORIES = [
  "Security",
  "Compliance",
  "Governance",
  "Privacy",
  "Finance",
  "Operations",
  "Human Resources",
  "Risk Management",
];

function emptyForm() {
  return { title: "", description: "", category: "Security" };
}

/* ─── Icons ──────────────────────────────────────────────────────────────── */
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
    document: (
      <svg viewBox="0 0 24 24" {...s}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
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
  };
  return icons[name] || null;
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════════════ */
export default function Policies() {
  const { role } = useAuth();
  const isAdmin = role === "PlatformAdmin";

  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPolicies();
  }, []);

  const loadPolicies = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAllPolicies();
      setPolicies(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Failed to load policies. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ── Filtered list ── */
  const visible = useMemo(() => {
    return policies
      .filter((p) => {
        const q = search.toLowerCase();
        return (
          (p.title || "").toLowerCase().includes(q) ||
          (p.category || "").toLowerCase().includes(q) ||
          (p.createdByFullName || "").toLowerCase().includes(q)
        );
      })
      .filter((p) => filterCat === "all" || p.category === filterCat)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [policies, search, filterCat]);

  /* ── Stats ── */
  const categories = useMemo(() => {
    const cats = {};
    policies.forEach((p) => {
      cats[p.category] = (cats[p.category] || 0) + 1;
    });
    return cats;
  }, [policies]);

  /* ── Modal helpers ── */
  const openView = (p) => setModal({ mode: "view", data: { ...p } });
  const openEdit = (p) => {
    setForm({
      title: p.title,
      description: p.description,
      category: p.category,
    });
    setModal({ mode: "edit", data: { ...p } });
  };
  const openCreate = () => {
    setForm(emptyForm());
    setModal({ mode: "create" });
  };
  const openDelete = (p) => setModal({ mode: "delete", data: { ...p } });
  const closeModal = () => setModal(null);
  const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  /* ── Create ── */
  const handleCreate = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const created = await createPolicy(form);
      setPolicies((prev) => [created, ...prev]);
      closeModal();
    } catch (err) {
      console.error(err);
      alert("Failed to create policy.");
    } finally {
      setSaving(false);
    }
  };

  /* ── Update ── */
  const handleUpdate = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      await updatePolicy(modal.data.id, form);
      setPolicies((prev) =>
        prev.map((p) =>
          p.id === modal.data.id
            ? { ...p, ...form, updatedAt: new Date().toISOString() }
            : p,
        ),
      );
      closeModal();
    } catch (err) {
      console.error(err);
      alert("Failed to update policy.");
    } finally {
      setSaving(false);
    }
  };

  /* ── Delete ── */
  const handleDelete = async () => {
    setSaving(true);
    try {
      await deletePolicy(modal.data.id);
      setPolicies((prev) => prev.filter((p) => p.id !== modal.data.id));
      closeModal();
    } catch (err) {
      console.error(err);
      alert("Failed to delete policy.");
    } finally {
      setSaving(false);
    }
  };

  /* ── Loading / error ── */
  if (loading) {
    return (
      <div
        className="po-wrap"
        style={{ alignItems: "center", justifyContent: "center" }}
      >
        <div style={{ color: "rgba(53,88,114,0.5)", fontSize: "0.9rem" }}>
          Loading policies…
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="po-wrap"
        style={{ alignItems: "center", justifyContent: "center" }}
      >
        <div style={{ color: "#c0392b", fontSize: "0.9rem" }}>{error}</div>
        <button
          onClick={loadPolicies}
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
    <div className="po-wrap">
      {/* ── Toolbar ── */}
      <div className="po-toolbar">
        <div className="po-search">
          <Icon name="search" />
          <input
            placeholder="Search policies…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="po-filter-select"
          value={filterCat}
          onChange={(e) => setFilterCat(e.target.value)}
        >
          <option value="all">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        {isAdmin && (
          <button className="po-btn-primary" onClick={openCreate}>
            <Icon name="plus" /> Create Policy
          </button>
        )}
      </div>

      {/* ── Stats ── */}
      <div className="po-stats">
        <div className="po-stat">
          <div className="po-stat-icon all">
            <Icon name="document" />
          </div>
          <div>
            <div className="po-stat-val">{policies.length}</div>
            <div className="po-stat-lbl">Total Policies</div>
          </div>
        </div>
        {["Security", "Compliance", "Governance"].map((cat) => (
          <div className="po-stat" key={cat}>
            <div className={`po-stat-icon ${cat.toLowerCase()}`}>
              <Icon name="document" />
            </div>
            <div>
              <div className="po-stat-val">{categories[cat] || 0}</div>
              <div className="po-stat-lbl">{cat}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Table ── */}
      <div className="po-table-card">
        <div className="po-table-scroll">
          <table className="po-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Title</th>
                <th>Category</th>
                <th>Created By</th>
                <th>Created At</th>
                <th>Updated At</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="po-empty">No policies found.</div>
                  </td>
                </tr>
              ) : (
                visible.map((p) => (
                  <tr key={p.id} onClick={() => openView(p)}>
                    <td
                      style={{
                        fontSize: "0.78rem",
                        color: "#7aaace",
                        fontWeight: 600,
                      }}
                    >
                      #{p.id}
                    </td>
                    <td>
                      <div className="po-policy-name">{p.title}</div>
                      <div className="po-policy-sub">
                        {p.description?.slice(0, 60)}
                        {p.description?.length > 60 ? "…" : ""}
                      </div>
                    </td>
                    <td>
                      <span className="po-category">{p.category || "—"}</span>
                    </td>
                    <td style={{ fontSize: "0.82rem" }}>
                      {p.createdByFullName || "—"}
                    </td>
                    <td
                      style={{
                        fontSize: "0.8rem",
                        color: "rgba(53,88,114,0.6)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {formatDate(p.createdAt)}
                    </td>
                    <td
                      style={{
                        fontSize: "0.8rem",
                        color: "rgba(53,88,114,0.6)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {formatDate(p.updatedAt)}
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div className="po-row-actions">
                        <button
                          className="po-icon-btn view"
                          onClick={() => openView(p)}
                          title="View"
                        >
                          <Icon name="eye" />
                        </button>
                        {isAdmin && (
                          <>
                            <button
                              className="po-icon-btn edit"
                              onClick={() => openEdit(p)}
                              title="Edit"
                            >
                              <Icon name="edit" />
                            </button>
                            <button
                              className="po-icon-btn delete"
                              onClick={() => openDelete(p)}
                              title="Delete"
                            >
                              <Icon name="trash" />
                            </button>
                          </>
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

      {/* ══ MODALS ═══════════════════════════════════════════════════════ */}
      {modal && (
        <div className="po-overlay" onClick={closeModal}>
          <div className="po-modal" onClick={(e) => e.stopPropagation()}>
            {/* ── VIEW ── */}
            {modal.mode === "view" && (
              <>
                <div className="po-modal-header">
                  <div>
                    <div className="po-modal-title">{modal.data.title}</div>
                    <div className="po-modal-sub">
                      {modal.data.category || "—"}
                    </div>
                  </div>
                  <button className="po-modal-close" onClick={closeModal}>
                    <Icon name="close" />
                  </button>
                </div>
                <div className="po-modal-body">
                  <div className="po-detail-grid">
                    <div className="po-detail-item">
                      <div className="po-detail-label">Title</div>
                      <div className="po-detail-value">{modal.data.title}</div>
                    </div>
                    <div className="po-detail-item">
                      <div className="po-detail-label">Category</div>
                      <div className="po-detail-value">
                        {modal.data.category || "—"}
                      </div>
                    </div>
                    <div className="po-detail-item">
                      <div className="po-detail-label">Created By</div>
                      <div className="po-detail-value">
                        {modal.data.createdByFullName || "—"}
                      </div>
                    </div>
                    <div className="po-detail-item">
                      <div className="po-detail-label">Created At</div>
                      <div className="po-detail-value">
                        {formatDate(modal.data.createdAt)}
                      </div>
                    </div>
                    <div className="po-detail-item">
                      <div className="po-detail-label">Updated At</div>
                      <div className="po-detail-value">
                        {formatDate(modal.data.updatedAt)}
                      </div>
                    </div>
                  </div>
                  <div className="po-detail-divider" />
                  <div className="po-detail-label">Description</div>
                  <div
                    className="po-detail-value"
                    style={{ marginTop: 8, lineHeight: 1.7 }}
                  >
                    {modal.data.description || "—"}
                  </div>
                </div>
                <div className="po-modal-footer">
                  {isAdmin && (
                    <>
                      <button
                        className="po-btn po-btn-edit"
                        onClick={() => openEdit(modal.data)}
                      >
                        <Icon name="edit" /> Edit Policy
                      </button>
                      <button
                        className="po-btn po-btn-delete"
                        onClick={() => openDelete(modal.data)}
                      >
                        <Icon name="trash" /> Delete
                      </button>
                    </>
                  )}
                </div>
              </>
            )}

            {/* ── CREATE / EDIT ── */}
            {(modal.mode === "create" || modal.mode === "edit") && (
              <>
                <div className="po-modal-header">
                  <div>
                    <div className="po-modal-title">
                      {modal.mode === "create"
                        ? "Create Policy"
                        : "Edit Policy"}
                    </div>
                    <div className="po-modal-sub">
                      {modal.mode === "create"
                        ? "Fill in the details below"
                        : modal.data.title}
                    </div>
                  </div>
                  <button className="po-modal-close" onClick={closeModal}>
                    <Icon name="close" />
                  </button>
                </div>
                <div className="po-modal-body">
                  <div className="po-form-grid">
                    <div className="po-field span2">
                      <label className="po-label">Title</label>
                      <input
                        className="po-input"
                        placeholder="Policy title"
                        value={form.title}
                        onChange={(e) => setField("title", e.target.value)}
                      />
                    </div>
                    <div className="po-field span2">
                      <label className="po-label">Category</label>
                      <select
                        className="po-select"
                        value={form.category}
                        onChange={(e) => setField("category", e.target.value)}
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="po-field span2">
                      <label className="po-label">Description</label>
                      <textarea
                        className="po-textarea"
                        placeholder="Policy description…"
                        value={form.description}
                        onChange={(e) =>
                          setField("description", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>
                <div className="po-modal-footer">
                  <button className="po-btn po-btn-cancel" onClick={closeModal}>
                    Cancel
                  </button>
                  <button
                    className="po-btn po-btn-save"
                    onClick={
                      modal.mode === "create" ? handleCreate : handleUpdate
                    }
                    disabled={saving || !form.title.trim()}
                    style={{
                      opacity: form.title.trim() ? 1 : 0.5,
                      cursor: form.title.trim() ? "pointer" : "not-allowed",
                    }}
                  >
                    <Icon name="save" />
                    {saving
                      ? "Saving…"
                      : modal.mode === "create"
                        ? "Create Policy"
                        : "Save Changes"}
                  </button>
                </div>
              </>
            )}

            {/* ── DELETE ── */}
            {modal.mode === "delete" && (
              <>
                <div className="po-modal-header">
                  <div>
                    <div className="po-modal-title">Confirm Deletion</div>
                    <div className="po-modal-sub">
                      This action cannot be undone
                    </div>
                  </div>
                  <button className="po-modal-close" onClick={closeModal}>
                    <Icon name="close" />
                  </button>
                </div>
                <div className="po-modal-body">
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
                      <Icon name="trash" />
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
                      Delete "{modal.data.title}"?
                    </div>
                    <p
                      style={{
                        fontSize: "0.87rem",
                        color: "rgba(53,88,114,0.6)",
                        lineHeight: 1.5,
                      }}
                    >
                      This will permanently remove this policy from the
                      platform.
                    </p>
                  </div>
                </div>
                <div className="po-modal-footer">
                  <button className="po-btn po-btn-cancel" onClick={closeModal}>
                    Cancel
                  </button>
                  <button
                    className="po-btn po-btn-delete"
                    onClick={handleDelete}
                    disabled={saving}
                    style={{ marginLeft: "auto" }}
                  >
                    <Icon name="trash" /> {saving ? "Deleting…" : "Yes, Delete"}
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
