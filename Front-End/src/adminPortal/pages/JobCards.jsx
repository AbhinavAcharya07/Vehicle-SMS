import { Link } from "react-router-dom";
import { FiPlus, FiClipboard } from "react-icons/fi";
import useFetch from "../hooks/useFetch";
import { listJobCards } from "../api/jobCards";
import { hasItems, toArray } from "../utils/hasData";
import { normalizeJobCards } from "../utils/normalizeJobCard";
import { Loader, EmptyState, ErrorState } from "../components/Loader";

const STAGE_LABEL = {
  queued: "Queued",
  in_progress: "In Progress",
  awaiting_parts: "Awaiting Parts",
  ready_for_pickup: "Ready for Pickup",
  bill_sent: "Service Done",
  accepted: "Service Done",
  closed: "Service Done",
};
const STAGE_CHIP_CLASS = {
  queued: "queued",
  in_progress: "progress",
  awaiting_parts: "awaiting",
  ready_for_pickup: "ready",
  bill_sent: "ready",
  accepted: "ready",
  closed: "ready",
};

export default function JobCards() {
  const { data: jobCards, loading, error } = useFetch(listJobCards, []);
  if (loading) return <Loader label="Loading job cards..." />;
  if (error) return <ErrorState message={error.message} />;

  const cards = normalizeJobCards(toArray(jobCards));

  return (
    <>
      <div className="topbar">
        <div>
          <div className="page-title">Job Cards</div>
          <div className="page-sub">All active and recent job cards.</div>
        </div>
        <Link to="/admin/new-job-card" className="btn btn-primary">
          <FiPlus size={14} /> New Job Card
        </Link>
      </div>

      <div className="sec-head">
        <h3>All Job Cards</h3>
      </div>

      {!hasItems(cards) ? (
        <EmptyState
          icon={<FiClipboard />}
          title="No job cards yet"
          message="Create one to start tracking a vehicle."
        />
      ) : (
        <div className="history-card">
          <div className="h-row head">
            <div>Vehicle</div>
            <div>Customer</div>
            <div>Technician</div>
            <div>Created</div>
            <div>Status</div>
          </div>
          {cards.map((c) => (
            <div className="h-row" key={c.id}>
              <div className="h-service">
                {c.vehicleName} · {c.plateNumber}
              </div>
              <div>{c.customerName}</div>
              <div>{c.technicianName || "Unassigned"}</div>
              <div className="h-date">{formatDate(c.createdAt)}</div>
              <div>
                <span
                  className={`queue-chip ${STAGE_CHIP_CLASS[c.stage] || "queued"}`}
                >
                  {STAGE_LABEL[c.stage] || "Queued"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
