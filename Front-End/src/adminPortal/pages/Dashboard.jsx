import {
  FiTruck,
  FiTrendingUp,
  FiAlertTriangle,
  FiCheckCircle,
  FiPlus,
} from "react-icons/fi";
import { Link } from "react-router-dom";
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
const STAGE_DOT_CLASS = {
  queued: "blue",
  in_progress: "amber",
  awaiting_parts: "red",
  ready_for_pickup: "green",
  bill_sent: "green",
  accepted: "green",
  closed: "green",
};

export default function AdminDashboard() {
  const { data: jobCards, loading, error } = useFetch(listJobCards, []);
  if (loading) return <Loader label="Loading workshop overview..." />;
  if (error) return <ErrorState message={error.message} />;

  const cards = normalizeJobCards(toArray(jobCards));

  const counts = {
    total: cards.length,
    inProgress: cards.filter((c) => c.stage === "in_progress").length,
    awaitingParts: cards.filter((c) => c.stage === "awaiting_parts").length,
    readyForPickup: cards.filter((c) => c.stage === "ready_for_pickup").length,
  };

  return (
    <>
      <div className="topbar">
        <div>
          <div className="page-title">Dashboard</div>
          <div className="page-sub">
            Live overview of every vehicle currently in the workshop.
          </div>
        </div>
        <Link to="/admin/new-job-card" className="btn btn-primary">
          <FiPlus size={14} /> New Job Card
        </Link>
      </div>

      <div
        className="stat-row"
        style={{ gridTemplateColumns: "repeat(4,1fr)" }}
      >
        <div className="stat-card">
          <div className="stat-icon blue">
            <FiTruck />
          </div>
          <div>
            <div className="stat-num">{counts.total}</div>
            <div className="stat-label">Vehicles in Garage</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon amber">
            <FiTrendingUp />
          </div>
          <div>
            <div className="stat-num">{counts.inProgress}</div>
            <div className="stat-label">In Progress</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red">
            <FiAlertTriangle />
          </div>
          <div>
            <div className="stat-num">{counts.awaitingParts}</div>
            <div className="stat-label">Awaiting Parts</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">
            <FiCheckCircle />
          </div>
          <div>
            <div className="stat-num">{counts.readyForPickup}</div>
            <div className="stat-label">Ready for Pickup</div>
          </div>
        </div>
      </div>

      <div className="sec-head">
        <h3>Live Job Queue</h3>
      </div>

      {!hasItems(cards) ? (
        <EmptyState
          title="No vehicles in the workshop"
          message="Create a job card to admit a vehicle for service."
        />
      ) : (
        <div className="queue-list">
          {cards.map((c) => (
            <Link key={c.id} to="/admin/work-progress" className="queue-row">
              <div className="queue-left">
                <span
                  className={`queue-dot ${STAGE_DOT_CLASS[c.stage] || "blue"}`}
                ></span>
                <div className="queue-info">
                  <div className="veh">
                    {c.vehicleName} · {c.plateNumber}
                  </div>
                  <div className="who">
                    {c.customerName} · {c.technicianName || "Unassigned"}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                <span
                  className={`queue-chip ${STAGE_CHIP_CLASS[c.stage] || "queued"}`}
                >
                  {STAGE_LABEL[c.stage] || "Queued"}
                </span>
                <span className="queue-arrow">→</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
