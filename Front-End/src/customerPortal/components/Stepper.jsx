import { FaCheck } from "react-icons/fa";

export default function Stepper({ stages = [] }) {
  return (
    <div className="stepper">
      {stages.map((stage, i) => (
        <div
          key={stage.label}
          style={{
            display: "flex",
            alignItems: "center",
            flex: i === stages.length - 1 ? "0 0 84px" : 1,
          }}
        >
          <div className={`step ${stage.state}`}>
            <div className="dot">
              {stage.state === "done" || stage.state === "current" ? (
                <FaCheck />
              ) : (
                i + 1
              )}
            </div>
            <span className="lbl">{stage.label}</span>
          </div>
          {i < stages.length - 1 && (
            <div
              className={`step-line ${stage.state === "done" ? "done" : ""}`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
