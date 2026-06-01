import { useState } from "react";
import "./Policies.css";

/* ─────────────────────────────────────────────────────────────
   INITIAL DATA
───────────────────────────────────────────────────────────── */

const INITIAL_POLICIES = [
  {
    id: 1,
    title: "Information Security Policy",
    category: "Security",
    version: "3.2",
    owner: "IT Department",
    status: "active",
    effectiveDate: "2026-01-01",
    reviewDate: "2027-01-01",
    description: "Defines information security controls and requirements.",
  },
  {
    id: 2,
    title: "Data Privacy Policy",
    category: "Privacy",
    version: "2.1",
    owner: "Compliance Department",
    status: "under-review",
    effectiveDate: "2025-09-15",
    reviewDate: "2026-09-15",
    description: "Outlines requirements for handling personal information.",
  },
  {
    id: 3,
    title: "Financial Governance Policy",
    category: "Finance",
    version: "4.0",
    owner: "Finance Department",
    status: "active",
    effectiveDate: "2025-01-01",
    reviewDate: "2026-12-31",
    description: "Provides governance controls for financial operations.",
  },
  {
    id: 4,
    title: "Remote Work Policy",
    category: "Human Resources",
    version: "1.4",
    owner: "HR Department",
    status: "draft",
    effectiveDate: "2026-06-01",
    reviewDate: "2027-06-01",
    description: "Guidelines and responsibilities for remote employees.",
  },
  {
    id: 5,
    title: "Risk Management Policy",
    category: "Risk Management",
    version: "2.7",
    owner: "Risk Office",
    status: "archived",
    effectiveDate: "2023-01-01",
    reviewDate: "2025-01-01",
    description: "Legacy risk management framework retained for reference.",
  },
];

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

const STATUSES = ["active", "draft", "under-review", "archived"];

let nextId = INITIAL_POLICIES.length + 1;

/* ─────────────────────────────────────────────────────────────
   ICONS
───────────────────────────────────────────────────────────── */

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
  };

  return icons[name] || null;
}

/* ─────────────────────────────────────────────────────────────
   EMPTY FORM
───────────────────────────────────────────────────────────── */

const emptyForm = {
  title: "",
  category: "Security",
  version: "",
  owner: "",
  status: "draft",
  effectiveDate: "",
  reviewDate: "",
  description: "",
};

/* ─────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────── */

export default function Policies() {
  const [policies, setPolicies] = useState(INITIAL_POLICIES);

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const [modal, setModal] = useState(null);

  const [form, setForm] = useState(emptyForm);

  const visiblePolicies = policies.filter((policy) => {
    const matchesSearch =
      policy.title.toLowerCase().includes(search.toLowerCase()) ||
      policy.category.toLowerCase().includes(search.toLowerCase()) ||
      policy.owner.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || policy.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const totalPolicies = policies.length;

  const activePolicies = policies.filter((p) => p.status === "active").length;

  const draftPolicies = policies.filter((p) => p.status === "draft").length;

  const archivedPolicies = policies.filter(
    (p) => p.status === "archived",
  ).length;

  const openView = (policy) => {
    setModal({
      mode: "view",
      policy,
    });
  };

  const openEdit = (policy) => {
    setForm({ ...policy });

    setModal({
      mode: "edit",
      policy,
    });
  };

  const openCreate = () => {
    setForm({ ...emptyForm });

    setModal({
      mode: "create",
    });
  };

  const closeModal = () => {
    setModal(null);
  };

  const handleFormChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  /* ─────────────────────────────────────────────────────────────
     CRUD ACTIONS
  ───────────────────────────────────────────────────────────── */

  const handleCreate = () => {
    const newPolicy = {
      ...form,
      id: nextId++,
    };

    setPolicies((prev) => [newPolicy, ...prev]);
    closeModal();
  };

  const handleUpdate = () => {
    setPolicies((prev) =>
      prev.map((policy) => (policy.id === form.id ? form : policy)),
    );

    closeModal();
  };

  const handleStatusChange = (id, newStatus) => {
    setPolicies((prev) =>
      prev.map((policy) =>
        policy.id === id ? { ...policy, status: newStatus } : policy,
      ),
    );

    if (modal?.policy?.id === id) {
      setModal((m) => ({
        ...m,
        policy: {
          ...m.policy,
          status: newStatus,
        },
      }));

      if (modal.mode === "edit") {
        setForm((f) => ({
          ...f,
          status: newStatus,
        }));
      }
    }
  };

  /* ─────────────────────────────────────────────────────────────
     RENDER
  ───────────────────────────────────────────────────────────── */

  return (
    <div className="po-wrap">
      {/* ───────────────── Toolbar ───────────────── */}

      <div className="po-toolbar">
        <div className="po-search">
          <Icon name="search" />

          <input
            placeholder="Search policies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="po-filter-select"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All Statuses</option>

          {STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>

        <button className="po-btn-primary" onClick={openCreate}>
          <Icon name="plus" />
          Create Policy
        </button>
      </div>

      {/* ───────────────── Stats ───────────────── */}

      <div className="po-stats">
        <div className="po-stat">
          <div className="po-stat-icon all">
            <Icon name="document" />
          </div>

          <div>
            <div className="po-stat-val">{totalPolicies}</div>

            <div className="po-stat-lbl">Total Policies</div>
          </div>
        </div>

        <div className="po-stat">
          <div className="po-stat-icon active">
            <Icon name="document" />
          </div>

          <div>
            <div className="po-stat-val">{activePolicies}</div>

            <div className="po-stat-lbl">Active Policies</div>
          </div>
        </div>

        <div className="po-stat">
          <div className="po-stat-icon draft">
            <Icon name="document" />
          </div>

          <div>
            <div className="po-stat-val">{draftPolicies}</div>

            <div className="po-stat-lbl">Draft Policies</div>
          </div>
        </div>

        <div className="po-stat">
          <div className="po-stat-icon archived">
            <Icon name="document" />
          </div>

          <div>
            <div className="po-stat-val">{archivedPolicies}</div>

            <div className="po-stat-lbl">Archived Policies</div>
          </div>
        </div>
      </div>

      {/* ───────────────── Table ───────────────── */}

      <div className="po-table-card">
        <div className="po-table-scroll">
          <table className="po-table">
            <thead>
              <tr>
                <th>Policy</th>
                <th>Category</th>
                <th>Version</th>
                <th>Owner</th>
                <th>Status</th>
                <th>Review Date</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {visiblePolicies.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="po-empty">No policies found.</div>
                  </td>
                </tr>
              ) : (
                visiblePolicies.map((policy) => (
                  <tr key={policy.id} onClick={() => openView(policy)}>
                    <td>
                      <div className="po-policy-name">{policy.title}</div>

                      <div className="po-policy-sub">{policy.owner}</div>
                    </td>

                    <td>
                      <span className="po-category">{policy.category}</span>
                    </td>

                    <td>{policy.version}</td>

                    <td>{policy.owner}</td>

                    <td>
                      <span className={`po-pill ${policy.status}`}>
                        {policy.status}
                      </span>
                    </td>

                    <td>{policy.reviewDate}</td>

                    <td>
                      <div
                        className="po-row-actions"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          className="po-icon-btn view"
                          onClick={() => openView(policy)}
                          title="View"
                        >
                          <Icon name="eye" />
                        </button>

                        <button
                          className="po-icon-btn edit"
                          onClick={() => openEdit(policy)}
                          title="Edit"
                        >
                          <Icon name="edit" />
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
      {/* ─────────────────────────────────────────────
          MODALS
      ───────────────────────────────────────────── */}

      {modal && (
        <div className="po-overlay" onClick={closeModal}>
          <div className="po-modal" onClick={(e) => e.stopPropagation()}>
            {/* ======================================
                VIEW POLICY
            ====================================== */}

            {modal.mode === "view" && (
              <>
                <div className="po-modal-header">
                  <div>
                    <div className="po-modal-title">{modal.policy.title}</div>

                    <div className="po-modal-sub">{modal.policy.category}</div>
                  </div>

                  <button className="po-modal-close" onClick={closeModal}>
                    <Icon name="close" />
                  </button>
                </div>

                <div className="po-modal-body">
                  <div className="po-status-label">Update Status</div>

                  <div className="po-status-tabs">
                    {STATUSES.map((status) => (
                      <button
                        key={status}
                        className={`po-status-tab ${
                          modal.policy.status === status ? status : ""
                        }`}
                        onClick={() =>
                          handleStatusChange(modal.policy.id, status)
                        }
                      >
                        {status}
                      </button>
                    ))}
                  </div>

                  <div className="po-detail-grid">
                    <div className="po-detail-item">
                      <div className="po-detail-label">Policy Name</div>

                      <div className="po-detail-value">
                        {modal.policy.title}
                      </div>
                    </div>

                    <div className="po-detail-item">
                      <div className="po-detail-label">Category</div>

                      <div className="po-detail-value">
                        {modal.policy.category}
                      </div>
                    </div>

                    <div className="po-detail-item">
                      <div className="po-detail-label">Version</div>

                      <div className="po-detail-value">
                        {modal.policy.version}
                      </div>
                    </div>

                    <div className="po-detail-item">
                      <div className="po-detail-label">Owner</div>

                      <div className="po-detail-value">
                        {modal.policy.owner}
                      </div>
                    </div>

                    <div className="po-detail-item">
                      <div className="po-detail-label">Effective Date</div>

                      <div className="po-detail-value">
                        {modal.policy.effectiveDate}
                      </div>
                    </div>

                    <div className="po-detail-item">
                      <div className="po-detail-label">Review Date</div>

                      <div className="po-detail-value">
                        {modal.policy.reviewDate}
                      </div>
                    </div>

                    <div className="po-detail-item">
                      <div className="po-detail-label">Status</div>

                      <div className="po-detail-value">
                        <span className={`po-pill ${modal.policy.status}`}>
                          {modal.policy.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="po-detail-divider" />

                  <div className="po-detail-item">
                    <div className="po-detail-label">Description</div>

                    <div
                      className="po-detail-value"
                      style={{
                        marginTop: 8,
                        lineHeight: 1.7,
                      }}
                    >
                      {modal.policy.description}
                    </div>
                  </div>
                </div>

                <div className="po-modal-footer">
                  <button
                    className="po-btn po-btn-edit"
                    onClick={() => openEdit(modal.policy)}
                  >
                    <Icon name="edit" />
                    Edit Policy
                  </button>
                </div>
              </>
            )}

            {/* ======================================
                CREATE / EDIT POLICY
            ====================================== */}

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
                        ? "Fill policy details"
                        : form.title}
                    </div>
                  </div>

                  <button className="po-modal-close" onClick={closeModal}>
                    <Icon name="close" />
                  </button>
                </div>

                <div className="po-modal-body">
                  <div className="po-form-grid">
                    <div className="po-field span2">
                      <label className="po-label">Policy Name</label>

                      <input
                        className="po-input"
                        value={form.title}
                        placeholder="Policy Name"
                        onChange={(e) =>
                          handleFormChange("title", e.target.value)
                        }
                      />
                    </div>

                    <div className="po-field">
                      <label className="po-label">Category</label>

                      <select
                        className="po-select"
                        value={form.category}
                        onChange={(e) =>
                          handleFormChange("category", e.target.value)
                        }
                      >
                        {CATEGORIES.map((cat) => (
                          <option key={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div className="po-field">
                      <label className="po-label">Version</label>

                      <input
                        className="po-input"
                        value={form.version}
                        placeholder="e.g. 1.0"
                        onChange={(e) =>
                          handleFormChange("version", e.target.value)
                        }
                      />
                    </div>

                    <div className="po-field">
                      <label className="po-label">Owner</label>

                      <input
                        className="po-input"
                        value={form.owner}
                        placeholder="Department"
                        onChange={(e) =>
                          handleFormChange("owner", e.target.value)
                        }
                      />
                    </div>

                    <div className="po-field">
                      <label className="po-label">Status</label>

                      <select
                        className="po-select"
                        value={form.status}
                        onChange={(e) =>
                          handleFormChange("status", e.target.value)
                        }
                      >
                        {STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="po-field">
                      <label className="po-label">Effective Date</label>

                      <input
                        type="date"
                        className="po-input"
                        value={form.effectiveDate}
                        onChange={(e) =>
                          handleFormChange("effectiveDate", e.target.value)
                        }
                      />
                    </div>

                    <div className="po-field">
                      <label className="po-label">Review Date</label>

                      <input
                        type="date"
                        className="po-input"
                        value={form.reviewDate}
                        onChange={(e) =>
                          handleFormChange("reviewDate", e.target.value)
                        }
                      />
                    </div>

                    <div className="po-field span2">
                      <label className="po-label">Description</label>

                      <textarea
                        className="po-textarea"
                        value={form.description}
                        placeholder="Policy description..."
                        onChange={(e) =>
                          handleFormChange("description", e.target.value)
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
                    disabled={!form.title.trim()}
                    onClick={
                      modal.mode === "create" ? handleCreate : handleUpdate
                    }
                  >
                    <Icon name="save" />

                    {modal.mode === "create" ? "Create Policy" : "Save Changes"}
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
