import { FaCarSide } from "react-icons/fa";

const STATUS_STYLE = {
  "In Progress": "progress",
  "Ready for Pickup": "ready",
  Queued: "queued",
};

export default function VehicleCard({ vehicle }) {
  if (!vehicle) return null;

  const statusClass = STATUS_STYLE[vehicle.status] || "queued";

  return (
    <div className="vehicle-card">
      <div className="vehicle-top">
        <div>
          <div className="vehicle-name">
            <FaCarSide /> {vehicle.make} {vehicle.model} {vehicle.year}
          </div>
          <div className="vehicle-meta">Registered owner · {vehicle.ownerName}</div>
          <div className="plate-badge">{vehicle.plateNumber}</div>
        </div>
        <div className={`status-chip ${statusClass}`}>{vehicle.status}</div>
      </div>
      {vehicle.currentServiceName && (
        <div className="service-line">Currently in for: {vehicle.currentServiceName}</div>
      )}
    </div>
  );
}
