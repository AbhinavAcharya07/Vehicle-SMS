import { FaClipboardList, FaCreditCard } from "react-icons/fa";
import { FiCheckCircle } from "react-icons/fi";
import useFetch from "../hooks/useFetch";
import { getMyVehicle } from "../api/vehicle";
import { getServiceHistory } from "../api/serviceHistory";
import { getMyBillingHistory } from "../api/billing";
import { hasVehicle, hasItems } from "../utils/hasData";
import { Loader, EmptyState, ErrorState } from "../components/Loader";

export default function ServiceHistory() {
  const { data: vehicle, loading: loadingVehicle } = useFetch(getMyVehicle, []);

  const {
    data: history,
    loading: loadingHistory,
    error,
  } = useFetch(
    () =>
      hasVehicle(vehicle) ? getServiceHistory(vehicle.id) : Promise.resolve([]),
    [vehicle?.id],
  );

  const { data: billingHistory } = useFetch(getMyBillingHistory, []);

  if (loadingVehicle || loadingHistory)
    return <Loader label="Loading service history..." />;
  if (error) return <ErrorState message={error.message} />;

  return (
    <>
      <div className="topbar">
        <div>
          <div className="page-title">Service History</div>
          <div className="page-sub">
            Past services for{" "}
            {hasVehicle(vehicle) ? vehicle.plateNumber : "your vehicle"}.
          </div>
        </div>
      </div>

      <div className="sec-head">
        <h3>All Visits</h3>
      </div>
      {!hasItems(history) ? (
        <EmptyState
          icon={<FaClipboardList />}
          title="No service history yet"
          message="Completed visits for this vehicle will show up here."
        />
      ) : (
        <div className="history-card">
          <div className="h-row head">
            <div>Date</div>
            <div>Service</div>
            <div>Technician</div>
            <div>Cost</div>
            <div>Status</div>
          </div>
          {history.map((row) => (
            <div className="h-row" key={row.id}>
              <div className="h-date">{row.date}</div>
              <div className="h-service">{row.serviceName}</div>
              <div>{row.technicianName}</div>
              <div className="h-cost">
                ₹{Number(row.cost).toLocaleString("en-IN")}
              </div>
              <div>
                <span className="tag-done">{row.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="sec-head" style={{ marginTop: 28 }}>
        <h3>Payment History</h3>
      </div>
      {!hasItems(billingHistory) ? (
        <EmptyState
          icon={<FaCreditCard />}
          title="No payment history yet"
          message="Bills you've accepted will appear here once the admin marks them complete."
        />
      ) : (
        billingHistory.map((r) => (
          <div className="bill-row" key={r._id ?? r.id}>
            <div>
              <div className="nm">
                {r.vehiclePlateNumber} &nbsp;·&nbsp; {r.serviceType}
              </div>
              <div className="sub">
                {r.admittedDate &&
                  `Admitted ${new Date(r.admittedDate).toLocaleDateString("en-IN")}`}
                {r.releasedDate &&
                  ` · Released ${new Date(r.releasedDate).toLocaleDateString("en-IN")}`}
                {(r.totalAmount ?? r.chargeBreakdown) &&
                  ` · Total ₹${Number(r.totalAmount ?? 0).toLocaleString("en-IN")}`}
              </div>
            </div>
            <div
              className="bill-status sent"
              style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <FiCheckCircle size={13} />
              Payment Successful
            </div>
          </div>
        ))
      )}
    </>
  );
}
