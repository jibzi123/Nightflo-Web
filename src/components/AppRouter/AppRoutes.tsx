import { useAuth } from "../../contexts/AuthContext";
import React, { useEffect, useState } from "react";
import {
  Routes,
  Route,
  Navigate,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";

/* ----------------------- Feature Components ---------------------- */
import EventCreator from "../Events/EventCreator";
import LoginForm from "../Auth/LoginForm";
import InteractiveTableBooking from "../interactive-table-booking";
import Dashboard from "../Dashboard/Dashboard";
import EventsManager from "../Events/EventsManager";
import BookingsManager from "../Bookings/BookingsManager";
import ClubManager from "../Clubs/ClubManager";
import StaffManager from "../Staff/StaffManager";
import CustomerManager from "../Customers/CustomerManager";
import FinancialManager from "../Financial/FinancialManager";
import PromoterManager from "../Promoters/PromoterManager";
import UserManager from "../Users/UserManager";
import QRScanner from "../QRScan/QRScanner";
import ClubSettings from "../Settings/ClubSettings";
import RefundsManager from "../Refunds/RefundsManager";
import ReviewsManager from "../Reviews/ReviewsManager";
import ComplianceManager from "../Compliance/ComplianceManager";
import SubscriptionManager from "../Subscriptions/SubscriptionManager";
import PackageManager from "../Packages/PackageManager";
import Layout from "../Layout/Layout";

/* --------------------------- Styles ------------------------------- */
import "./../../styles/global.css";
import "./../../styles/components.css";
import "./../../styles/layout.css";
import "./../../styles/auth.css";
import "./../../styles/events.css";
import "./../../styles/dashboard.css";

/* --------------------- Module Title Helper ------------------------ */
function getModuleTitle(module: string): string {
  const titles: Record<string, string> = {
    dashboard: "Dashboard",
    events: "Events Management",
    bookings: "Bookings Management",
    clubs: "Club Management",
    staff: "Staff Management",
    customers: "Customer Management",
    financial: "Financial Management",
    promoters: "Promoter Network",
    users: "User Management",
    "qr-scan": "QR Scanner",
    settings: "Club Settings",
    refunds: "Refunds Management",
    reviews: "Customer Reviews",
    "create-event": "Create Event",
    compliance: "Compliance Management",
    subscriptions: "Subscription Management",
    "edit-event": "Edit Event",
    packages: "Package Management",
  };
  return titles[module] || "Dashboard";
}

/* ------------------------ Auth Guard ------------------------------ */

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated, isCheckingAuth } = useAuth();

  if (isCheckingAuth) {
    return <div>Loading...</div>; // ⏳ block until we know
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};
const AppRoutes: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeModule, setActiveModule] = useState("dashboard");
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [pastEvents, setPastEvents] = useState<any[]>([]);

  /* ----------------- Keep activeModule synced -------------------- */
  useEffect(() => {
    const pathParts = location.pathname.split("/").filter(Boolean);
    if (pathParts[0] === "app") {
      setActiveModule(pathParts[1] || "dashboard");
    } else {
      setActiveModule("dashboard");
    }
  }, [location.pathname]);

  /* ----------------- Event Update Helpers ------------------------ */
  const handleEventUpdated = (updatedEvent: any) => {
    setUpcomingEvents((prev) =>
      prev.map((ev) =>
        ev.id === updatedEvent.id ? { ...ev, ...updatedEvent } : ev
      )
    );
    setPastEvents((prev) =>
      prev.map((ev) =>
        ev.id === updatedEvent.id ? { ...ev, ...updatedEvent } : ev
      )
    );
  };

  /* ----------------- Navigation Helper --------------------------- */
  const navigateToModule = (module: string) => {
    setActiveModule(module);
    navigate(
      module === "dashboard" ? "/admin-portal" : `/admin-portal/${module}`
    );
  };

  /* ---------------- Layout Wrapper ------------------------------- */
  const LayoutWrapper: React.FC = () => (
    <Layout
      title={getModuleTitle(activeModule)}
      activeModule={activeModule}
      onModuleChange={navigateToModule}
    >
      <Outlet />
    </Layout>
  );

  /* ---------------- Login Page ------------------- */
  const LoginPage: React.FC = () =>
    isAuthenticated ? <Navigate to="/" replace /> : <LoginForm />;

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin-portal" replace />} />
      {/*   <Route path="*" element={<Navigate to="/app" replace />} /> */}
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/table-booking"
        element={
          <PrivateRoute>
            <InteractiveTableBooking />
          </PrivateRoute>
        }
      />

      {/* Protected App Layout */}
      <Route
        path="/admin-portal"
        element={
          <PrivateRoute>
            <LayoutWrapper />
          </PrivateRoute>
        }
      >
        <Route index element={<Dashboard />} />

        <Route
          path="events"
          element={
            <EventsManager
              onModuleChange={navigateToModule}
              onEditEvent={(event: any) => {
                setSelectedEvent(event);
                navigate("/app/edit-event");
              }}
              upcomingEvents={upcomingEvents}
              pastEvents={pastEvents}
            />
          }
        />
        <Route
          path="create-event"
          element={
            <EventCreator
              mode="create"
              onEventCreated={() => navigate("/admin-portal/events")}
            />
          }
        />
        <Route
          path="edit-event"
          element={
            <EventCreator
              mode="edit"
              eventData={selectedEvent}
              onEventUpdated={(updatedEvent: any) => {
                handleEventUpdated(updatedEvent);
                navigate("/admin-portal/events");
              }}
            />
          }
        />

        <Route path="bookings" element={<BookingsManager />} />
        <Route
          path="clubs"
          element={
            user?.userType === "super_admin" ? <ClubManager /> : <Dashboard />
          }
        />
        <Route path="staff" element={<StaffManager />} />
        <Route path="customers" element={<CustomerManager />} />
        <Route path="financial" element={<FinancialManager />} />
        <Route path="promoters" element={<PromoterManager />} />
        <Route
          path="users"
          element={
            user?.userType === "super_admin" ? <UserManager /> : <Dashboard />
          }
        />
        <Route path="qr-scan" element={<QRScanner />} />
        <Route
          path="settings"
          element={
            user?.userType === "CLUB_OWNER" ? <ClubSettings /> : <Dashboard />
          }
        />
        <Route
          path="refunds"
          element={
            user?.userType === "CLUB_OWNER" ||
            user?.userType === "super_admin" ? (
              <RefundsManager />
            ) : (
              <Dashboard />
            )
          }
        />
        <Route
          path="reviews"
          element={
            user?.userType === "CLUB_OWNER" ||
            user?.userType === "super_admin" ? (
              <ReviewsManager />
            ) : (
              <Dashboard />
            )
          }
        />
        <Route
          path="compliance"
          element={
            user?.userType === "super_admin" ? (
              <ComplianceManager />
            ) : (
              <Dashboard />
            )
          }
        />
        <Route
          path="subscriptions"
          element={
            user?.userType === "super_admin" ? (
              <SubscriptionManager />
            ) : (
              <Dashboard />
            )
          }
        />
        <Route
          path="packages"
          element={
            user?.userType === "super_admin" ? (
              <PackageManager />
            ) : (
              <Dashboard />
            )
          }
        />
      </Route>
      <Route path="*" element={<div>404 - Page Not Found</div>} />
    </Routes>
  );
};

export default AppRoutes;
