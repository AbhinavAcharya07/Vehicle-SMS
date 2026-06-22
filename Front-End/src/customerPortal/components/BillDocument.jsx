import { useState } from "react";
import { FaCheck, FaTimes, FaCarSide } from "react-icons/fa";
import { acceptBillingRequest } from "../api/billing";

const money = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

export default function BillDocument({ bill, onAction }) {
  const [submitting, setSubmitting] = useState(false);

  if (!bill) return null;

  const handleAccept = async () => {
    setSubmitting(true);
    try {
      await acceptBillingRequest(bill.id);
      onAction?.();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (bill.status === "accepted_pending_admin") {
    return (
      <div className="live-bill">
        <div className="live-head">
          <div className="vehicle-name" style={{ fontSize: 17 }}>
            <FaCarSide /> {bill.vehicleLabel}{" "}
            <span
              className="plate"
              style={{ fontSize: 13, color: "var(--text-faint)" }}
            >
              · {bill.plateNumber}
            </span>
          </div>
          <span className="live-tag pending">
            <span className="spinner" /> Awaiting Admin Confirmation
          </span>
        </div>
        <div style={{ color: "var(--text-dim)", fontSize: 13.5, marginTop: 8 }}>
          You accepted the bill of <b>{money(bill.total)}</b>. Waiting for the
          admin to confirm and close out payment.
        </div>
        <div className="pulse-bar">
          <div className="fill" />
        </div>
      </div>
    );
  }

  if (bill.status === "declined") {
    return (
      <div className="live-bill">
        <div className="live-head">
          <div className="vehicle-name" style={{ fontSize: 17 }}>
            <FaCarSide /> {bill.vehicleLabel}
          </div>
          <span className="live-tag declined">
            <FaTimes /> Declined
          </span>
        </div>
        <div style={{ color: "var(--text-dim)", fontSize: 13.5, marginTop: 8 }}>
          You declined this bill. The admin has been notified and will review
          the charges with you.
        </div>
      </div>
    );
  }

  return (
    <div className="live-bill">
      <div className="live-head">
        <div>
          <div className="vehicle-name" style={{ fontSize: 17 }}>
            <FaCarSide /> {bill.vehicleLabel}{" "}
            <span
              className="plate"
              style={{ fontSize: 13, color: "var(--text-faint)" }}
            >
              · {bill.plateNumber}
            </span>
          </div>
          <div
            style={{ color: "var(--text-faint)", fontSize: 12.5, marginTop: 4 }}
          >
            {bill.serviceName}
          </div>
        </div>
        <span className="live-tag pending">🧾 Bill Issued</span>
      </div>

      <div className="bill-doc">
        <Row label="Service Date" value={bill.serviceDate} />
        <Row label="Admitted Date" value={bill.admittedDate} />
        <Row label="Released Date" value={bill.releasedDate} />
        <Row label="Vehicle Plate" value={bill.plateNumber} mono />
        <div className="bill-doc-divider" />
        <Row label="Technician Charge" value={money(bill.technicianCharge)} />
        <Row label="Service Charge" value={money(bill.serviceCharge)} />
        <Row label="Parts Charge" value={money(bill.partsCharge)} />
        <Row label="GST (18%)" value={money(bill.gst)} />
      </div>

      <div className="total-box">
        <div className="k">Total Amount</div>
        <div className="v">{money(bill.total)}</div>
      </div>

      <div
        className="admin-actions"
        style={{ justifyContent: "flex-start", marginTop: 18 }}
      >
        <button
          className="btn btn-success"
          disabled={submitting}
          onClick={handleAccept}
        >
          <FaCheck /> Accept Bill
        </button>
      </div>
    </div>
  );
}

function Row({ label, value, mono }) {
  return (
    <div className="bill-doc-row">
      <span>{label}</span>
      <b className={mono ? "plate" : ""}>{value}</b>
    </div>
  );
}
