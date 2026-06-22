import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./customerPortal/context/AuthContext";
import {
  AdminAuthProvider,
  useAdminAuth,
} from "./adminPortal/context/AdminAuthContext";
import ProtectedRoute from "./customerPortal/components/ProtectedRoute";
import AdminProtectedRoute from "./adminPortal/components/ProtectedRoute";
import Layout from "./customerPortal/components/Layout";
import AdminLayout from "./adminPortal/components/Layout";
import Dashboard from "./customerPortal/pages/Dashboard";
import TrackVehicle from "./customerPortal/pages/TrackVehicle";
import ServiceHistory from "./customerPortal/pages/ServiceHistory";
import BillRequest from "./customerPortal/pages/BillRequest";
import AdminDashboard from "./adminPortal/pages/Dashboard";
import JobCards from "./adminPortal/pages/JobCards";
import NewJobCard from "./adminPortal/pages/NewJobCard";
import WorkProgress from "./adminPortal/pages/WorkProgress";
import Billing from "./adminPortal/pages/Billing";
import CustomerPortal from "./authComponents/CustomerPortal";
import AdminPortal from "./authComponents/AdminPortal";
import { colors } from "./theme";

export default function App() {
  return (
    <AuthProvider>
      <AdminAuthProvider>
        <style>{`
          html, body, #root { margin: 0; padding: 0; width: 100%; min-height: 100%; background: ${colors.bg}; }
          * { box-sizing: border-box; }
        `}</style>
        <Routes>
          <Route path="/login" element={<LoginGate />} />
          <Route path="/admin/login" element={<AdminLoginGate />} />

          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/track-vehicle" element={<TrackVehicle />} />
            <Route path="/service-history" element={<ServiceHistory />} />
            <Route path="/bill-request" element={<BillRequest />} />
          </Route>

          <Route
            element={
              <AdminProtectedRoute>
                <AdminLayout />
              </AdminProtectedRoute>
            }
          >
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/job-cards" element={<JobCards />} />
            <Route path="/admin/new-job-card" element={<NewJobCard />} />
            <Route path="/admin/work-progress" element={<WorkProgress />} />
            <Route path="/admin/billing" element={<Billing />} />
          </Route>

          <Route path="*" element={<NotFoundRedirect />} />
        </Routes>
      </AdminAuthProvider>
    </AuthProvider>
  );
}

function LoginGate() {
  const { user } = useAuth();
  if (user) return <Navigate to="/dashboard" replace />;
  return <CustomerPortal />;
}
function AdminLoginGate() {
  const { user } = useAdminAuth();
  if (user) return <Navigate to="/admin/dashboard" replace />;
  return <AdminPortal />;
}
function NotFoundRedirect() {
  const { user } = useAuth();
  const { user: staffUser } = useAdminAuth();
  if (staffUser) return <Navigate to="/admin/dashboard" replace />;
  if (user) return <Navigate to="/dashboard" replace />;
  return <Navigate to="/login" replace />;
}
