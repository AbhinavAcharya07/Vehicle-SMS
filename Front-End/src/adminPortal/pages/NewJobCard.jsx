import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createJobCard } from "../api/jobCards";

const S = {
  card: {
    background: "#121729",
    border: "1px solid #232b42",
    borderRadius: 16,
    padding: "26px 28px",
  },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  fieldWrap: { marginBottom: 18 },
  label: {
    display: "block",
    fontSize: 12.5,
    fontWeight: 700,
    color: "#8d95ac",
    marginBottom: 7,
    textTransform: "uppercase",
    letterSpacing: "0.4px",
  },
  input: {
    width: "100%",
    background: "#0d1220",
    border: "1px solid #232b42",
    borderRadius: 10,
    padding: "11px 14px",
    color: "#f3f5fa",
    fontSize: 14,
    fontFamily: "inherit",
    boxSizing: "border-box",
  },
  inputError: {
    width: "100%",
    background: "#0d1220",
    border: "1px solid #f87171",
    borderRadius: 10,
    padding: "11px 14px",
    color: "#f3f5fa",
    fontSize: 14,
    fontFamily: "inherit",
    boxSizing: "border-box",
  },
  textarea: {
    width: "100%",
    background: "#0d1220",
    border: "1px solid #232b42",
    borderRadius: 10,
    padding: "11px 14px",
    color: "#f3f5fa",
    fontSize: 14,
    fontFamily: "inherit",
    resize: "vertical",
    minHeight: 80,
    boxSizing: "border-box",
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 6,
  },
  btnGhost: {
    background: "#121729",
    border: "1px solid #232b42",
    borderRadius: 10,
    padding: "10px 16px",
    color: "#f3f5fa",
    fontSize: 13.5,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  btnPrimary: {
    background: "linear-gradient(135deg,#ff7a3d,#ff4d4d)",
    border: "none",
    borderRadius: 10,
    padding: "10px 16px",
    color: "#fff",
    fontSize: 13.5,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  error: {
    color: "#f87171",
    marginBottom: 16,
    fontSize: 13.5,
    background: "rgba(248,113,113,0.08)",
    border: "1px solid rgba(248,113,113,0.3)",
    borderRadius: 10,
    padding: "12px 16px",
  },
  fieldError: {
    color: "#f87171",
    fontSize: 11.5,
    marginTop: 5,
  },
};

function Field({ label, children, errorMsg }) {
  return (
    <div style={S.fieldWrap}>
      <label style={S.label}>{label}</label>
      {children}
      {errorMsg && <div style={S.fieldError}>⚠ {errorMsg}</div>}
    </div>
  );
}

export default function NewJobCard() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    customerName: "",
    vehiclePlateNumber: "",
    vehicleName: "",
    technicianName: "",
    serviceType: "",
    eta: "",
    notes: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const update = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    if (fieldErrors[key]) {
      setFieldErrors((fe) => ({ ...fe, [key]: null }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!form.customerName.trim())
      errs.customerName = "Customer name is required";
    if (!form.vehiclePlateNumber.trim())
      errs.vehiclePlateNumber = "Plate number is required";
    if (!form.vehicleName.trim())
      errs.vehicleName = "Vehicle make & model is required";
    if (!form.serviceType.trim()) errs.serviceType = "Service type is required";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        customerName: form.customerName.trim(),
        vehiclePlateNumber: form.vehiclePlateNumber.trim(),
        vehicleMakeModel: form.vehicleName.trim(),
        assignedTechnician: form.technicianName.trim(),
        serviceType: form.serviceType.trim(),
        estimatedCompletion: form.eta.trim(),
        notes: form.notes.trim(),
      };

      const created = await createJobCard(payload);
      navigate("/admin/work-progress", {
        state: { focusId: created?.jobCard?._id },
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Topbar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 30,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 24,
              fontWeight: 800,
              letterSpacing: "-0.3px",
              color: "#f3f5fa",
            }}
          >
            New Job Card
          </div>
          <div style={{ fontSize: 13.5, color: "#5d6480", marginTop: 3 }}>
            Admit a vehicle and assign a technician to start tracking work.
          </div>
        </div>
      </div>

      {error && <div style={S.error}>{error}</div>}

      <form style={S.card} onSubmit={handleSubmit}>
        <div style={S.grid2}>
          <Field label="Customer Name" errorMsg={fieldErrors.customerName}>
            <input
              style={fieldErrors.customerName ? S.inputError : S.input}
              value={form.customerName}
              onChange={update("customerName")}
              placeholder="e.g. Arjun Mehta"
            />
          </Field>

          <Field
            label="Vehicle Plate Number"
            errorMsg={fieldErrors.vehiclePlateNumber}
          >
            <input
              style={fieldErrors.vehiclePlateNumber ? S.inputError : S.input}
              value={form.vehiclePlateNumber}
              onChange={update("vehiclePlateNumber")}
              placeholder="e.g. KA01AB1234"
            />
          </Field>

          <Field
            label="Vehicle Make & Model"
            errorMsg={fieldErrors.vehicleName}
          >
            <input
              style={fieldErrors.vehicleName ? S.inputError : S.input}
              value={form.vehicleName}
              onChange={update("vehicleName")}
              placeholder="e.g. Honda City 2021"
            />
          </Field>

          <Field label="Assign Technician">
            <input
              style={S.input}
              value={form.technicianName}
              onChange={update("technicianName")}
              placeholder="e.g. Rajesh Kumar"
            />
          </Field>

          <Field label="Service Type" errorMsg={fieldErrors.serviceType}>
            <input
              style={fieldErrors.serviceType ? S.inputError : S.input}
              value={form.serviceType}
              onChange={update("serviceType")}
              placeholder="e.g. Engine Tune-up & Oil Change"
            />
          </Field>

          <Field label="Estimated Completion (ETA)">
            <input
              style={S.input}
              value={form.eta}
              onChange={update("eta")}
              placeholder="e.g. Jun 28, 2026"
            />
          </Field>
        </div>

        <Field label="Notes">
          <textarea
            style={S.textarea}
            value={form.notes}
            onChange={update("notes")}
            placeholder="Any additional notes..."
          />
        </Field>

        <div style={S.actions}>
          <button type="button" style={S.btnGhost} disabled={submitting}>
            Save as Draft
          </button>
          <button
            type="submit"
            style={{ ...S.btnPrimary, opacity: submitting ? 0.7 : 1 }}
            disabled={submitting}
          >
            {submitting ? "Creating..." : "Create Job Card"}
          </button>
        </div>
      </form>
    </>
  );
}
