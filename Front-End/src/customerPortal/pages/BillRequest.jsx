import { FaCreditCard } from "react-icons/fa";
import { FiCheckCircle } from "react-icons/fi";
import { useState, useEffect, useCallback } from "react";
import useFetch from "../hooks/useFetch";
import { getMyVehicle } from "../api/vehicle";
import { getLiveBillingRequest, getMyBillingHistory } from "../api/billing";
import { hasVehicle, hasBill } from "../utils/hasData";
import BillDocument from "../components/BillDocument";
import { Loader, EmptyState, ErrorState } from "../components/Loader";

export default function BillRequest() {
  const { data: vehicle, loading: loadingVehicle } = useFetch(getMyVehicle, []);

  const [bill, setBill] = useState(null);
  const [loadingBill, setLoadingBill] = useState(true);
  const [billError, setBillError] = useState(null);

  const fetchBill = useCallback(async () => {
    if (!hasVehicle(vehicle)) {
      setLoadingBill(false);
      return;
    }
    try {
      const data = await getLiveBillingRequest(vehicle.id);
      setBill(data);
    } catch (err) {
      setBillError(err);
    } finally {
      setLoadingBill(false);
    }
  }, [vehicle?.id]);

  useEffect(() => {
    fetchBill();
    const id = setInterval(fetchBill, 15000);
    return () => clearInterval(id);
  }, [fetchBill]);

  const { data: recent } = useFetch(getMyBillingHistory, []);

  if (loadingVehicle || loadingBill)
    return <Loader label="Loading billing info..." />;
  if (billError) return <ErrorState message={billError.message} />;

  return (
    <>
      <div className="topbar">
        <div>
          <div className="page-title">Bill Request</div>
          <div className="page-sub">
            Billing requests raised by the service admin for{" "}
            {hasVehicle(vehicle) ? vehicle.plateNumber : "your vehicle"}.
          </div>
        </div>
      </div>

      <div className="sec-head">
        <h3>Live Billing Request</h3>
      </div>

      {!hasBill(bill) ? (
        <EmptyState
          icon={<FaCreditCard />}
          title="No billing request right now"
          message="When the admin issues a bill for a completed service, it will appear here for you to review."
        />
      ) : (
        <BillDocument bill={bill} onAction={fetchBill} />
      )}

      <div className="sec-head" style={{ marginTop: 28 }}>
        <h3>Recent Requests</h3>
      </div>

      {!recent || recent.length === 0 ? (
        <EmptyState title="No past billing requests" />
      ) : (
        recent.map((r) => (
          <div className="bill-row" key={r.id ?? r._id}>
            <div>
              <div className="nm">
                {r.vehiclePlateNumber} &nbsp;·&nbsp; {r.serviceType}
              </div>
              <div className="sub">
                {r.admittedDate && `Admitted ${r.admittedDate}`}
                {r.releasedDate && ` · Released ${r.releasedDate}`}
                {r.totalAmount != null &&
                  ` · Total ₹${Number(r.totalAmount).toLocaleString("en-IN")}`}
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
