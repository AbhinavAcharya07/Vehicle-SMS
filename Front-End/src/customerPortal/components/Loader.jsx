import { FaInbox } from "react-icons/fa";

export function Loader({ label = "Loading..." }) {
  return (
    <div className="loader-box">
      <span className="spinner" />
      {label}
    </div>
  );
}

export function EmptyState({ icon = <FaInbox />, title, message }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <div className="empty-title">{title}</div>
      {message && <div className="empty-msg">{message}</div>}
    </div>
  );
}

export function ErrorState({ message }) {
  return (
    <div className="empty-state error">
      <div className="empty-title">Couldn't load this section</div>
      <div className="empty-msg">{message}</div>
    </div>
  );
}
