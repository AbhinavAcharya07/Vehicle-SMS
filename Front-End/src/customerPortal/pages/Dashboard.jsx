import {
  FaMapMarkerAlt,
  FaCreditCard,
  FaCarSide,
  FaClipboardList,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import useFetch from "../hooks/useFetch";
import { getMyVehicle, getServiceTracking } from "../api/vehicle";
import { getLiveBillingRequest } from "../api/billing";
import { hasVehicle } from "../utils/hasData";
import StatCard from "../components/StatCard";
import VehicleCard from "../components/VehicleCard";
import { Loader, EmptyState, ErrorState } from "../components/Loader";

export default function Dashboard() {
  const { user } = useAuth();

  const {
    data: vehicle,
    loading: loadingVehicle,
    error: vehicleError,
  } = useFetch(getMyVehicle, []);

  const { data: tracking } = useFetch(
    () =>
      hasVehicle(vehicle)
        ? getServiceTracking(vehicle.id)
        : Promise.resolve(null),
    [vehicle?.id],
  );

  const { data: bill } = useFetch(
    () =>
      hasVehicle(vehicle)
        ? getLiveBillingRequest(vehicle.id)
        : Promise.resolve(null),
    [vehicle?.id],
  );

  if (loadingVehicle) return <Loader label="Loading your dashboard..." />;
  if (vehicleError) return <ErrorState message={vehicleError.message} />;

  return (
    <>
      <div className="topbar">
        <div>
          <div className="page-title">Dashboard</div>
          <div className="page-sub">
            Welcome back, {user?.fullName?.split(" ")[0] || "there"} — here's
            what's happening with your vehicle.
          </div>
        </div>
      </div>

      <div
        className="stat-row"
        style={{ gridTemplateColumns: "repeat(2, 1fr)" }}
      >
        <StatCard
          icon={<FaMapMarkerAlt />}
          tone="blue"
          label="Service Status"
          value={tracking?.status || "—"}
        />
        <StatCard
          icon={<FaCreditCard />}
          tone="danger"
          label="Bill Request"
          value={bill ? "Yes" : "No"}
        />
      </div>

      <div className="sec-head">
        <h3>My Vehicle</h3>
      </div>
      {!hasVehicle(vehicle) ? (
        <EmptyState
          icon={<FaCarSide />}
          title="No vehicle linked to your account yet"
          message="Once your license plate is registered by the service center, your vehicle details will appear here."
        />
      ) : (
        <VehicleCard vehicle={vehicle} />
      )}

      <div className="sec-head" style={{ marginTop: 28 }}>
        <h3>Quick Actions</h3>
      </div>
      <div className="stat-row" style={{ marginBottom: 0 }}>
        <Link to="/track-vehicle" className="quick-tile">
          <div className="stat-card">
            <div className="stat-icon blue">
              <FaMapMarkerAlt />
            </div>
            <div>
              <div className="stat-num" style={{ fontSize: 16 }}>
                Track Vehicle
              </div>
              <div className="stat-label">See live service progress</div>
            </div>
          </div>
        </Link>
        <Link to="/service-history" className="quick-tile">
          <div className="stat-card">
            <div className="stat-icon green">
              <FaClipboardList />
            </div>
            <div>
              <div className="stat-num" style={{ fontSize: 16 }}>
                Service History
              </div>
              <div className="stat-label">View past visits</div>
            </div>
          </div>
        </Link>
        <Link to="/bill-request" className="quick-tile">
          <div className="stat-card">
            <div className="stat-icon amber">
              <FaCreditCard />
            </div>
            <div>
              <div className="stat-num" style={{ fontSize: 16 }}>
                Bill Request
              </div>
              <div className="stat-label">Review and respond to bills</div>
            </div>
          </div>
        </Link>
      </div>
    </>
  );
}
