import EllipsisLoader from "@/components/EllipsisLoader";
import { lazy, Suspense, useLayoutEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import DashboardLayout from "./layout/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import EventSphereHome from "./page/EventSphereHome";
const Dashboard = lazy(() => import("./page/Dashboard"));
const EventBooking = lazy(() => import("./page/EventBooking"));
const ExpoBooking = lazy(() => import("./page/ExpoBooking"));
const AttendeeProfile = lazy(() => import("./page/AttendeeProfile"));
const PassVerification = lazy(() => import("./page/PassVerification"));
const Contact = lazy(() => import("./page/Contact"));
const Expos = lazy(() => import("./page/Expos"));
const ExpoDetail = lazy(() =>
  import("./page/Expos").then((module) => ({
    default: module.ExpoDetailPage,
  })),
);
const EventListing = lazy(() =>
  import("./page/Expos").then((module) => ({
    default: module.EventsPage,
  })),
);
const Gallery = lazy(() => import("./page/Gallery"));
const PublicFeedback = lazy(() => import("./page/PublicFeedback"));
const PublicExhibitorProfile = lazy(() => import("./page/PublicExhibitorProfile"));
const Services = lazy(() => import("./page/Services"));
const Login = lazy(() => import("./page/login"));
const Signup = lazy(() => import("./page/signup"));
const Forget = lazy(() => import("./page/forget_pass"));
const Otp = lazy(() => import("./page/otp"));
const Reset = lazy(() => import("./page/reset"));
const EventsManagement = lazy(() => import("./page/EventsManagement"));
const ExhibitorsManagement = lazy(() => import("./page/ExhibitorsManagement"));
const ExhibitorProfile = lazy(() => import("./page/ExhibitorProfile"));
const AttendeesManagement = lazy(() => import("./page/AttendeesManagement"));
const BoothSelection = lazy(() => import("./page/BoothSelection"));
const SessionsManagement = lazy(() => import("./page/SessionsManagement"));
const NotificationsManagement = lazy(
  () => import("./page/NotificationsManagement"),
);
const AnalyticsDashboard = lazy(() => import("./page/AnalyticsDashboard"));
const ExhibitorSearch = lazy(() => import("./page/ExhibitorSearch"));
const FeedbackSupport = lazy(() => import("./page/FeedbackSupport"));
const Messages = lazy(() => import("./page/Messages"));
const UsersManagement = lazy(() => import("./page/UsersManagement"));
const WebsiteSettings = lazy(() => import("./page/WebsiteSettings"));
const ContactMessages = lazy(() => import("./page/ContactMessages"));
const ExpoTickets = lazy(() => import("./page/ExpoTickets"));
const EventApprovals = lazy(() => import("./page/EventApprovals"));
const FloorPlan = lazy(() => import("./page/FloorPlan"));
const allRoles = ["admin", "organizer", "exhibitor", "attendee"];
function App() {
  const { key, hash } = useLocation();

  useLayoutEffect(() => {
    if (!hash) window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [key, hash]);

  return (
    <Suspense fallback={<EllipsisLoader scope="viewport" />}>
      <Routes>
        <Route path="/" element={<EventSphereHome />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/expos" element={<Expos />} />
        <Route path="/expos/:expoId" element={<ExpoDetail />} />
        <Route path="/event-listing" element={<EventListing />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/share-feedback" element={<PublicFeedback />} />
        <Route path="/exhibitors/profile/:userId" element={<PublicExhibitorProfile />} />
        <Route path="/event-gallery" element={<Gallery />} />
        <Route path="/service" element={<Services />} />
        <Route path="/services" element={<Services />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/register" element={<Signup />} />
        <Route path="/forget" element={<Forget />} />
        <Route path="/reset" element={<Reset />} />
        {Object.entries({
          expos: "events",
          exhibitors: "exhibitors",
          booths: "booths",
          schedule: "sessions",
          registrations: "attendees",
          bookmarks: "sessions",
          messages: "messages",
          notifications: "notifications",
          feedback: "feedback",
          analytics: "analytics",
          users: "users",
          settings: "website-settings",
          "website-settings": "website-settings",
          "contact-messages": "contact-messages",
          tickets: "expo-tickets",
          "expo-tickets": "expo-tickets",
          "event-approvals": "event-approvals",
        }).map(([alias, target]) => (
          <Route
            key={alias}
            path={"/dashboard/" + alias}
            element={<Navigate to={"/" + target} replace />}
          />
        ))}
        <Route path="/dashboard/login" element={<Login />} />
        <Route path="/dashboard/signup" element={<Signup />} />
        <Route path="/dashboard/forget-password" element={<Forget />} />
        <Route path="/dashboard/otp" element={<Otp />} />
        <Route path="/dashboard/reset" element={<Reset />} />
        <Route path="/passes/verify" element={<PassVerification />} />
        <Route element={<ProtectedRoute allowedRoles={["attendee"]} />}>
          <Route path="profile" element={<AttendeeProfile />} />
          <Route path="book" element={<EventBooking />} />
          <Route path="expo-booking" element={<ExpoBooking />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={allRoles} />}>
          <Route element={<DashboardLayout />}>
            <Route path="dashboard" element={<Dashboard />} />

            <Route
              element={
                <ProtectedRoute loadingScope="page" allowedRoles={allRoles} />
              }
            >
              <Route path="events" element={<EventsManagement key="expo" />} />
              <Route
                path="dashboard/events"
                element={<EventsManagement key="event" listingType="event" />}
              />
              <Route path="sessions" element={<SessionsManagement />} />
              <Route path="floor-plan" element={<FloorPlan />} />
              <Route
                path="notifications"
                element={<NotificationsManagement />}
              />
              <Route path="exhibitor-search" element={<ExhibitorSearch />} />
              <Route path="feedback" element={<FeedbackSupport />} />
              <Route
                path="product/:id"
                element={<Navigate to="/dashboard" replace />}
              />
              <Route
                path="products"
                element={<Navigate to="/dashboard" replace />}
              />
            </Route>

            <Route
              element={
                <ProtectedRoute loadingScope="page" allowedRoles={allRoles} />
              }
            >
              <Route path="messages" element={<Messages />} />
            </Route>

            <Route
              element={
                <ProtectedRoute
                  loadingScope="page"
                  allowedRoles={["admin", "organizer", "exhibitor"]}
                />
              }
            >
              <Route path="exhibitors" element={<ExhibitorsManagement />} />
              <Route path="booths" element={<BoothSelection />} />
            </Route>
            <Route
              element={
                <ProtectedRoute
                  loadingScope="page"
                  allowedRoles={["exhibitor"]}
                />
              }
            >
              <Route path="exhibitor-profile" element={<ExhibitorProfile />} />
            </Route>

            <Route
              element={
                <ProtectedRoute
                  loadingScope="page"
                  allowedRoles={["admin", "organizer", "attendee", "exhibitor"]}
                />
              }
            >
              <Route path="attendees" element={<AttendeesManagement />} />

            </Route>

            <Route element={<ProtectedRoute loadingScope="page" allowedRoles={["admin", "organizer", "exhibitor"]} />}><Route path="event-approvals" element={<EventApprovals />} /></Route>
            <Route
              element={
                <ProtectedRoute loadingScope="page" allowedRoles={["admin"]} />
              }
            >
              <Route path="users" element={<UsersManagement />} />
              <Route path="website-settings" element={<WebsiteSettings />} />
              <Route path="contact-messages" element={<ContactMessages />} />
            </Route>
            <Route
              element={
                <ProtectedRoute
                  loadingScope="page"
                  allowedRoles={["admin", "organizer", "attendee"]}
                />
              }
            >
              <Route path="expo-tickets" element={<ExpoTickets />} />
            </Route>
            <Route
              element={
                <ProtectedRoute
                  loadingScope="page"
                  allowedRoles={["admin", "organizer"]}
                />
              }
            >
              <Route path="analytics" element={<AnalyticsDashboard />} />

              <Route
                path="add-product"
                element={<Navigate to="/dashboard" replace />}
              />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<h1 className="p-6">Page not found</h1>} />
      </Routes>
    </Suspense>
  );
}
export default App;
