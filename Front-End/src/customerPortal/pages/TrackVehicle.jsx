import { FaCarSide } from "react-icons/fa";
import useFetch from "../hooks/useFetch";
import { getMyVehicle, getServiceTracking } from "../api/vehicle";
import { hasVehicle, hasTracking } from "../utils/hasData";
import { formatDateTime, formatDate } from "../utils/formatDateTime";
import VehicleCard from "../components/VehicleCard";
import ProgressRing from "../components/ProgressRing";
import Stepper from "../components/Stepper";
import { Loader, EmptyState, ErrorState } from "../components/Loader";

export default function TrackVehicle() {
  const { data: vehicle, loading: loadingVehicle } = useFetch(getMyVehicle, []);

  const {
    data: tracking,
    loading: loadingTracking,
    error,
  } = useFetch(
    () =>
      hasVehicle(vehicle)
        ? getServiceTracking(vehicle.id)
        : Promise.resolve(null),
    [vehicle?.id],
  );

  if (loadingVehicle || loadingTracking)
    return <Loader label="Fetching vehicle status..." />;
  if (error) return <ErrorState message={error.message} />;

  return (
    <>
      <div className="topbar">
        <div>
          <div className="page-title">Track Vehicle</div>
          <div className="page-sub">
            Live status for the vehicle linked to your account.
          </div>
        </div>
      </div>

      {!hasVehicle(vehicle) ? (
        <EmptyState
          icon={<FaCarSide />}
          title="No vehicle to track"
          message="Tracking appears here once a vehicle is registered to your plate number."
        />
      ) : (
        <VehicleCard vehicle={vehicle} />
      )}

      <div className="sec-head" style={{ marginTop: 26 }}>
        <h3>Service Progress</h3>
      </div>

      {!hasTracking(tracking) ? (
        <EmptyState
          title="No active service yet"
          message="When this vehicle is admitted for service, progress will show here."
        />
      ) : (
        <div className="vehicle-card">
          <div style={{ display: "flex", gap: 30, alignItems: "center" }}>
            <ProgressRing percent={tracking.percentComplete ?? 0} />
            <div style={{ flex: 1 }}>
              <div className="detail-grid">
                <Detail
                  k="Technician"
                  v={tracking.technicianName || "Unassigned"}
                />
                <Detail
                  k="ETA"
                  v={tracking.eta ? formatDate(tracking.eta) : "Not set yet"}
                />
                <Detail k="Service" v={tracking.serviceName || "—"} />
                <Detail
                  k="Last Update"
                  v={formatDateTime(tracking.lastUpdate)}
                />
              </div>
            </div>
          </div>
          <Stepper stages={tracking.stages ?? []} />
        </div>
      )}
    </>
  );
}

function Detail({ k, v }) {
  return (
    <div className="detail-box">
      <div className="k">{k}</div>
      <div className="v">{v}</div>
    </div>
  );
}
