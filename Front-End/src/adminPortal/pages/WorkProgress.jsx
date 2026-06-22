import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiEdit2, FiCheck, FiArrowRight } from "react-icons/fi";
import useFetch from "../hooks/useFetch";
import { listJobCards, updateProgress, pushToBilling } from "../api/jobCards";
import { hasItems, toArray } from "../utils/hasData";
import { Loader, EmptyState, ErrorState } from "../components/Loader";

const STAGES = [
  { key: "queued", label: "Queued" },
  { key: "in_progress", label: "In Progress" },
  { key: "awaiting_parts", label: "Awaiting Parts" },
  { key: "ready_for_pickup", label: "Ready for Pickup" },
];
const STAGE_INDEX = Object.fromEntries(STAGES.map((s, i) => [s.key, i]));
const CHIP_CLASS = {
  queued: "queued",
  in_progress: "progress",
  awaiting_parts: "awaiting",
  ready_for_pickup: "ready",
};
const DOT_CLASS = {
  queued: "blue",
  in_progress: "amber",
  awaiting_parts: "red",
  ready_for_pickup: "green",
};
const RING_CIRCUMFERENCE = 339.3;

function formatDate(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatRelativeTime(value) {
  if (!value) return null;
  const then = new Date(value).getTime();
  if (Number.isNaN(then)) return null;
  const diffMs = Date.now() - then;
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

export default function WorkProgress() {
  const {
    data: jobCardsResponse,
    loading,
    error,
    refetch,
  } = useFetch(listJobCards, []);

  const [openId, setOpenId] = useState(null);

  if (loading) return <Loader label="Loading workshop progress..." />;
  if (error) return <ErrorState message={error.message} />;

  const rawList = jobCardsResponse?.jobCards ?? jobCardsResponse;
  const allCards = toArray(rawList);

  const cards = allCards.filter(
    (c) => c.billingStatus !== "closed" && c.billingStatus !== "bill_sent",
  );

  return (
    <>
      <div className="topbar">
        <div>
          <div className="page-title">Work Progress</div>
          <div className="page-sub">
            Click a vehicle to open its live progress editor.
          </div>
        </div>
      </div>
      <div className="sec-head">
        <h3>Vehicles In Workshop</h3>
      </div>

      {!hasItems(cards) ? (
        <EmptyState
          title="No vehicles in the workshop"
          message="Create a job card to admit a vehicle."
        />
      ) : (
        <div className="queue-list">
          {cards.map((c) => (
            <JobCardRow
              key={c._id}
              card={c}
              isOpen={openId === c._id}
              onToggle={() => setOpenId(openId === c._id ? null : c._id)}
              onUpdated={refetch}
            />
          ))}
        </div>
      )}
    </>
  );
}

function JobCardRow({ card, isOpen, onToggle, onUpdated }) {
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);

  const [form, setForm] = useState({
    technicianName: card.assignedTechnician || "",
    eta: formatDate(card.estimatedCompletion) || "",
    serviceType: card.serviceType || "",
    stage: card.progressStatus,
    percentComplete: card.progressPercent ?? 0,
  });
  const [saving, setSaving] = useState(false);
  const [pushing, setPushing] = useState(false);

  const resolvedBillingStatus =
    card.billingStatus || card.billing?.status || "not_billed";

  const ALREADY_PUSHED_STATUSES = new Set([
    "bill_sent",
    "awaiting_customer",
    "accepted",
    "closed",
  ]);

  const canPushToBilling =
    card.progressStatus === "ready_for_pickup" &&
    !ALREADY_PUSHED_STATUSES.has(resolvedBillingStatus);

  const offset = RING_CIRCUMFERENCE * (1 - (card.progressPercent ?? 0) / 100);
  const currentStageIndex = STAGE_INDEX[card.progressStatus] ?? 0;

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProgress(card._id, {
        progressStatus: form.stage,
        progressPercent: form.percentComplete,
        assignedTechnician: form.technicianName,
        estimatedCompletion: form.eta,
        serviceType: form.serviceType,
      });
      await onUpdated();
      setEditing(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePushToBilling = async () => {
    setPushing(true);
    try {
      if (resolvedBillingStatus !== "not_billed") {
        navigate("/admin/billing");
        return;
      }
      await pushToBilling(card._id);
      await onUpdated();
      navigate("/admin/billing");
    } catch (err) {
      alert(err.message);
    } finally {
      setPushing(false);
    }
  };

  return (
    <div>
      <button
        onClick={onToggle}
        className="queue-row wp-toggle"
        style={{
          width: "100%",
          textAlign: "left",
          border: "1px solid var(--card-border)",
          cursor: "pointer",
        }}
      >
        <div className="queue-left">
          <span
            className={`queue-dot ${DOT_CLASS[card.progressStatus] || "blue"}`}
          ></span>
          <div className="queue-info">
            <div className="veh">
              {card.vehicleMakeModel} · {card.vehiclePlateNumber}
            </div>
            <div className="who">
              {card.customerName} · {card.serviceType} ·{" "}
              {card.progressPercent ?? 0}% complete
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <span
            className={`queue-chip ${CHIP_CLASS[card.progressStatus] || "queued"}`}
          >
            {STAGES.find((s) => s.key === card.progressStatus)?.label ||
              card.progressStatus}
          </span>
          <span className="queue-arrow">{isOpen ? "▴" : "▾"}</span>
        </div>
      </button>

      {isOpen && (
        <div className="vehicle-card wp-editor-panel" style={{ marginTop: 10 }}>
          <div className="edit-toolbar">
            {canPushToBilling && (
              <button
                className="btn btn-success"
                onClick={handlePushToBilling}
                disabled={pushing}
              >
                <FiArrowRight size={14} />{" "}
                {pushing ? "Pushing..." : "Push to Billing"}
              </button>
            )}
            {!editing ? (
              <button
                className="btn btn-ghost"
                onClick={() => setEditing(true)}
              >
                <FiEdit2 size={14} /> Edit
              </button>
            ) : (
              <button
                className="btn btn-primary"
                onClick={handleSave}
                disabled={saving}
              >
                <FiCheck size={14} /> {saving ? "Saving..." : "Update Progress"}
              </button>
            )}
          </div>

          <div style={{ display: "flex", gap: 30, alignItems: "center" }}>
            <div className="ring-wrap">
              <svg width="130" height="130" viewBox="0 0 130 130">
                <circle
                  cx="65"
                  cy="65"
                  r="54"
                  fill="none"
                  stroke="#1c2336"
                  strokeWidth="12"
                />
                <circle
                  cx="65"
                  cy="65"
                  r="54"
                  fill="none"
                  stroke="#f5a623"
                  strokeWidth="12"
                  strokeDasharray={RING_CIRCUMFERENCE}
                  strokeDashoffset={offset}
                  strokeLinecap="round"
                  transform="rotate(-90 65 65)"
                />
              </svg>
              <div className="ring-pct">{card.progressPercent ?? 0}%</div>
            </div>
            <div style={{ flex: 1 }}>
              <div className="detail-grid">
                <EditableDetail
                  label="Technician"
                  editing={editing}
                  value={form.technicianName}
                  onChange={(v) =>
                    setForm((f) => ({ ...f, technicianName: v }))
                  }
                />
                <EditableDetail
                  label="ETA"
                  editing={editing}
                  value={form.eta}
                  onChange={(v) => setForm((f) => ({ ...f, eta: v }))}
                />
                <EditableDetail
                  label="Service"
                  editing={editing}
                  value={form.serviceType}
                  onChange={(v) => setForm((f) => ({ ...f, serviceType: v }))}
                />
                <div className="detail-box">
                  <div className="k">Last Update</div>
                  <div className="v">
                    {formatRelativeTime(card.updatedAt) || "—"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="stepper">
            {STAGES.map((s, i) => (
              <Step
                key={s.key}
                stage={s}
                index={i}
                currentIndex={currentStageIndex}
                isLast={i === STAGES.length - 1}
              />
            ))}
          </div>

          {editing && (
            <>
              <div className="field" style={{ marginTop: 18 }}>
                <label>Update Stage</label>
                <select
                  value={form.stage}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, stage: e.target.value }))
                  }
                >
                  {STAGES.map((s) => (
                    <option key={s.key} value={s.key}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>Percent Complete</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={form.percentComplete}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      percentComplete: Number(e.target.value),
                    }))
                  }
                />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function EditableDetail({ label, editing, value, onChange }) {
  return (
    <div className={`detail-box${editing ? " editing" : ""}`}>
      <div className="k">{label}</div>
      {editing ? (
        <input value={value} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <div className="v">{value || "—"}</div>
      )}
    </div>
  );
}

function Step({ stage, index, currentIndex, isLast }) {
  const done = index < currentIndex;
  const current = index === currentIndex;
  return (
    <>
      <div className={`step${done ? " done" : current ? " current" : ""}`}>
        <div className="dot">
          {done || current ? <FiCheck size={14} /> : index + 1}
        </div>
        <span className="lbl">{stage.label}</span>
      </div>
      {!isLast && (
        <div
          className={`step-line${index < currentIndex ? " done" : ""}`}
        ></div>
      )}
    </>
  );
}
