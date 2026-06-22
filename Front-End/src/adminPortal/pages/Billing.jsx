import { useEffect, useState } from "react";
import {
  FiRefreshCw,
  FiCheckCircle,
  FiX,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import useFetch from "../hooks/useFetch";
import {
  getBillingOverview,
  saveBillingDraft,
  markDoneAndSend,
  closeBilling,
} from "../api/billing";
import { toArray, hasItems } from "../utils/hasData";
import { Loader, EmptyState, ErrorState } from "../components/Loader";

const STATUS = {
  PENDING: "pending",
  AWAITING_CUSTOMER: "awaiting_customer",
  ACCEPTED: "accepted",
  CLOSED: "closed",
};

const C = {
  bg: "#0a0e1a",
  bgSoft: "#0d1220",
  card: "#121729",
  cardBorder: "#232b42",
  text: "#f3f5fa",
  textDim: "#8d95ac",
  textFaint: "#5d6480",
  accent: "#ff7a3d",
  accentSoft: "rgba(255,122,61,0.14)",
  green: "#22c55e",
  greenSoft: "rgba(34,197,94,0.12)",
  amber: "#f5a623",
  amberSoft: "rgba(245,166,35,0.12)",
};

const S = {
  topbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 800,
    letterSpacing: "-0.3px",
    color: C.text,
  },
  pageSub: { fontSize: 13.5, color: C.textFaint, marginTop: 3 },
  secHead: {
    fontSize: 13,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: C.textDim,
    fontWeight: 700,
    margin: "24px 0 16px",
  },
  btnGhost: {
    background: C.card,
    border: `1px solid ${C.cardBorder}`,
    borderRadius: 10,
    padding: "10px 16px",
    color: C.text,
    fontSize: 13.5,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
  },
  btnPrimary: {
    background: `linear-gradient(135deg,${C.accent},#ff4d4d)`,
    border: "none",
    borderRadius: 10,
    padding: "10px 16px",
    color: "#fff",
    fontSize: 13.5,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
  },
  btnSuccess: {
    background: "linear-gradient(135deg,#22c55e,#16a34a)",
    border: "none",
    borderRadius: 10,
    padding: "10px 16px",
    color: "#fff",
    fontSize: 13.5,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
  },
  adminRow: {
    background: C.card,
    border: `1px solid ${C.cardBorder}`,
    borderRadius: 16,
    padding: "22px 24px",
    marginBottom: 18,
  },
  rowHead: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
    cursor: "pointer",
  },
  who: { fontWeight: 800, fontSize: 15.5, color: C.text },
  sub: { fontSize: 12, color: C.textFaint, marginTop: 3, fontWeight: 600 },
  formGrid: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 },
  fieldWrap: { marginBottom: 0 },
  label: {
    display: "block",
    fontSize: 12.5,
    fontWeight: 700,
    color: C.textDim,
    marginBottom: 7,
    textTransform: "uppercase",
    letterSpacing: "0.4px",
  },
  input: {
    width: "100%",
    background: C.bgSoft,
    border: `1px solid ${C.cardBorder}`,
    borderRadius: 10,
    padding: "11px 14px",
    color: C.text,
    fontSize: 14,
    fontFamily: "inherit",
    boxSizing: "border-box",
  },
  totalBox: {
    background: C.accentSoft,
    border: `1px solid rgba(255,122,61,0.3)`,
    borderRadius: 12,
    padding: "16px 18px",
    marginTop: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  totalKey: {
    fontSize: 12.5,
    color: C.accent,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  totalVal: { fontSize: 22, fontWeight: 800, color: C.text },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 10,
    marginTop: 16,
  },
  pillWait: {
    background: C.amberSoft,
    color: C.amber,
    fontSize: 11.5,
    fontWeight: 700,
    padding: "5px 12px",
    borderRadius: 14,
    display: "inline-flex",
    alignItems: "center",
  },
  pillSent: {
    background: C.greenSoft,
    color: C.green,
    fontSize: 11.5,
    fontWeight: 700,
    padding: "5px 12px",
    borderRadius: 14,
    display: "inline-flex",
    alignItems: "center",
  },
  billRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: C.bgSoft,
    border: `1px solid ${C.cardBorder}`,
    borderRadius: 12,
    padding: "16px 18px",
    marginBottom: 12,
  },
  billNm: { fontWeight: 700, fontSize: 14.5, color: C.text },
  billSub: { fontSize: 12, color: C.textFaint, marginTop: 3 },
};

function Field({ label, children }) {
  return (
    <div style={S.fieldWrap}>
      <label style={S.label}>{label}</label>
      {children}
    </div>
  );
}

function toDateInputValue(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

export default function Billing() {
  const {
    data: rawData,
    loading,
    error,
    refetch,
  } = useFetch(getBillingOverview, []);

  if (loading) return <Loader label="Loading billing queue..." />;
  if (error) return <ErrorState message={error.message} />;

  const pending = toArray(rawData?.pending);
  const sent = toArray(rawData?.recentlySent);

  return (
    <>
      <div style={S.topbar}>
        <div>
          <div style={S.pageTitle}>Billing</div>
          <div style={S.pageSub}>
            Generate and send billing breakdowns for completed services.
          </div>
        </div>
        <button style={S.btnGhost} onClick={refetch}>
          <FiRefreshCw size={14} /> Refresh
        </button>
      </div>

      <div style={S.secHead}>Pending Billing Requests</div>
      {!hasItems(pending) ? (
        <EmptyState
          title="No vehicles waiting on billing"
          message="Push a job card to billing from Work Progress once it's ready for pickup."
        />
      ) : (
        pending.map((card) => (
          <BillingRow key={card.id} card={card} onUpdated={refetch} />
        ))
      )}

      <div style={S.secHead}>Recently Sent</div>
      {!hasItems(sent) ? (
        <EmptyState title="No completed bills yet" />
      ) : (
        sent.map((card) => (
          <div style={S.billRow} key={card.id}>
            <div>
              <div style={S.billNm}>
                {card.customerName} · {card.vehiclePlateNumber}
              </div>
              <div style={S.billSub}>
                {card.serviceType} · Total ₹
                {Number(card.totalAmount).toLocaleString("en-IN")}
              </div>
            </div>
            <span style={S.pillSent}>
              <FiCheckCircle size={12} style={{ marginRight: 5 }} /> Payment
              Successful
            </span>
          </div>
        ))
      )}
    </>
  );
}

function BillingRow({ card, onUpdated }) {
  const [open, setOpen] = useState(false);

  const [localStatus, setLocalStatus] = useState(null);

  const b = card.billing || card;

  const rawBillingStatus = card.billingStatus || b.status || STATUS.PENDING;

  const resolvedStatus =
    rawBillingStatus === "awaiting_bill"
      ? STATUS.PENDING
      : rawBillingStatus === "bill_sent"
        ? STATUS.AWAITING_CUSTOMER
        : rawBillingStatus;

  const effectiveStatus = localStatus || resolvedStatus;

  const [form, setForm] = useState({
    serviceDate: card.serviceDate
      ? toDateInputValue(card.serviceDate)
      : toDateInputValue(card.admittedDate ?? card.createdAt),
    admittedDate: card.admittedDate
      ? toDateInputValue(card.admittedDate)
      : toDateInputValue(card.createdAt),
    releasedDate: card.releasedDate
      ? toDateInputValue(card.releasedDate)
      : toDateInputValue(card.estimatedCompletion),
    technicianCharge:
      card.chargeBreakdown?.technicianCharge ?? b.technicianCharge ?? 0,
    serviceCharge: card.chargeBreakdown?.serviceCharge ?? b.serviceCharge ?? 0,
    partsCharge: card.chargeBreakdown?.partsCharge ?? b.partsCharge ?? 0,
    gst: card.chargeBreakdown?.gst ?? b.gst ?? 0,
  });

  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [closing, setClosing] = useState(false);

  const total =
    Number(form.technicianCharge || 0) +
    Number(form.serviceCharge || 0) +
    Number(form.partsCharge || 0) +
    Number(form.gst || 0);

  const upd = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const isLocked = effectiveStatus !== STATUS.PENDING;

  const statusPill =
    effectiveStatus === STATUS.ACCEPTED ? (
      <span style={S.pillSent}>Customer Accepted</span>
    ) : effectiveStatus === STATUS.AWAITING_CUSTOMER ? (
      <span style={S.pillWait}>Awaiting Bill</span>
    ) : (
      <span style={S.pillWait}>Draft</span>
    );

  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      await saveBillingDraft(card._id ?? card.id, { ...form, total });
      onUpdated();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleMarkDoneAndSend = async () => {
    setSending(true);
    try {
      await markDoneAndSend(card._id ?? card.id, { ...form, total });
      setLocalStatus(STATUS.AWAITING_CUSTOMER);
      onUpdated();
    } catch (err) {
      alert(err.message);
    } finally {
      setSending(false);
    }
  };

  const handleClose = async () => {
    setClosing(true);
    try {
      await closeBilling(card._id ?? card.id);
      onUpdated();
    } catch (err) {
      alert(err.message);
    } finally {
      setClosing(false);
    }
  };

  const inputStyle = (locked) => ({
    ...S.input,
    opacity: locked ? 0.6 : 1,
    cursor: locked ? "not-allowed" : "text",
  });

  return (
    <div style={S.adminRow}>
      <div style={S.rowHead} onClick={() => setOpen((o) => !o)}>
        <div>
          <div style={S.who}>
            {card.customerName}&nbsp;·&nbsp;
            <span
              style={{
                fontFamily: "'JetBrains Mono',monospace",
                fontWeight: 700,
              }}
            >
              {card.vehiclePlateNumber}
            </span>
          </div>
          <div style={S.sub}>
            {card.vehicleMakeModel ?? card.vehicleName} — {card.serviceType}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {statusPill}
          {open ? (
            <FiChevronUp size={16} color="#5d6480" />
          ) : (
            <FiChevronDown size={16} color="#5d6480" />
          )}
        </div>
      </div>

      {!open ? (
        <div style={{ color: C.textFaint, fontSize: 13 }}>
          Click to expand and generate this bill.
        </div>
      ) : (
        <>
          <div style={{ ...S.formGrid, marginBottom: 14 }}>
            <Field label="Service Date">
              <input
                type="date"
                style={inputStyle(isLocked)}
                value={form.serviceDate}
                onChange={upd("serviceDate")}
                disabled={isLocked}
              />
            </Field>
            <Field label="Admitted Date">
              <input
                type="date"
                style={inputStyle(isLocked)}
                value={form.admittedDate}
                onChange={upd("admittedDate")}
                disabled={isLocked}
              />
            </Field>
            <Field label="Released Date">
              <input
                type="date"
                style={inputStyle(isLocked)}
                value={form.releasedDate}
                onChange={upd("releasedDate")}
                disabled={isLocked}
              />
            </Field>
            <Field label="Vehicle Plate">
              <input
                style={inputStyle(true)}
                value={card.vehiclePlateNumber}
                disabled
              />
            </Field>
          </div>

          <div style={S.formGrid}>
            <Field label="Technician Charge (₹)">
              <input
                type="number"
                style={inputStyle(isLocked)}
                value={form.technicianCharge}
                onChange={upd("technicianCharge")}
                disabled={isLocked}
              />
            </Field>
            <Field label="Service Charge (₹)">
              <input
                type="number"
                style={inputStyle(isLocked)}
                value={form.serviceCharge}
                onChange={upd("serviceCharge")}
                disabled={isLocked}
              />
            </Field>
            <Field label="Parts Charge (₹)">
              <input
                type="number"
                style={inputStyle(isLocked)}
                value={form.partsCharge}
                onChange={upd("partsCharge")}
                disabled={isLocked}
              />
            </Field>
            <Field label="GST (₹)">
              <input
                type="number"
                style={inputStyle(isLocked)}
                value={form.gst}
                onChange={upd("gst")}
                disabled={isLocked}
              />
            </Field>
          </div>

          <div style={S.totalBox}>
            <div style={S.totalKey}>Total Amount</div>
            <div style={S.totalVal}>₹{total.toLocaleString("en-IN")}</div>
          </div>

          <div style={S.actions}>
            {effectiveStatus === STATUS.PENDING && (
              <>
                <button
                  style={S.btnGhost}
                  onClick={handleSaveDraft}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Draft"}
                </button>
                <button
                  style={S.btnSuccess}
                  onClick={handleMarkDoneAndSend}
                  disabled={sending}
                >
                  <FiCheckCircle size={14} />
                  {sending ? "Sending..." : "Mark Done & Send"}
                </button>
              </>
            )}
            {effectiveStatus === STATUS.AWAITING_CUSTOMER && (
              <span style={{ color: C.textFaint, fontSize: 13 }}>
                Waiting for the customer to accept this bill...
              </span>
            )}
            {effectiveStatus === STATUS.ACCEPTED && (
              <button
                style={S.btnPrimary}
                onClick={handleClose}
                disabled={closing}
              >
                <FiX size={14} />
                {closing ? "Closing..." : "Close"}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
