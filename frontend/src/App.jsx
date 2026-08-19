
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./firebase";

// Import your page and component files
import Welcome from "./pages/Welcome";
import Login from "./pages/Login";
import SignUp from "./pages/Signup";
import Dashboard from "./components/Dashboard";
import Navbar from "./components/Navbar";
import HotelBooking from "./components/HotelBooking";
import Transportation from './components/Transportation';
import ItineraryPlanner from "./components/ItineraryPlanner";
import StreetPreview from "./components/StreetPreview";
import Marketplace from "./components/Marketplace";
import Feedback from "./components/Feedback";
import LocalBusinessHub from "./components/LocalBusinessHub";
import HelpDesk from "./components/HelpDesk";
import ArtWorkshop from "./components/Workshops";
import UserVerification from './components/UserVerification';
import InfiniteScroll from './components/InfiniteScroll';
import Services from "./components/services";
import JharkhandInfo from "./components/JharkhandInfo";
import Chatbot from "./components/Chatbot";
import PrivateRoute from "./components/PrivateRoute";

// import TourismAnalyticsDashboard from "./components/TourismAnalyticsDashboard";





// --- Helper Components (No changes needed here) ---

// Loading component for a better user experience
const Loading = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    <p className="ml-4 text-gray-600">Loading...</p>
  </div>
);

// Error component for Firebase errors
const ErrorComponent = ({ error }) => (
  <div className="min-h-screen flex items-center justify-center bg-red-50">
    <div className="text-center p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-xl font-bold text-red-700">Authentication Error</h2>
      <p className="text-gray-600 mt-2">{error.message}</p>
      <button
        onClick={() => window.location.reload()}
        className="mt-4 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition-colors"
      >
        Retry
      </button>
    </div>
  </div>
);

// Protected Route: Only allows access if the user is authenticated
const ProtectedRoute = ({ children }) => {
  const [user, loading, error] = useAuthState(auth);

  if (loading) return <Loading />;
  if (error) return <ErrorComponent error={error} />;
  return user ? children : <Navigate to="/login" replace />;
};

// Public Route: Redirects to dashboard if the user is already authenticated
const PublicRoute = ({ children }) => {
  const [user, loading, error] = useAuthState(auth);

  if (loading) return <Loading />;
  if (error) return <ErrorComponent error={error} />;
  return !user ? children : <Navigate to="/dashboard" replace />;
};

// Layout wrapper for pages that should have a navbar
const LayoutWithNavbar = ({ children }) => (
  <>
    <Navbar />
    <main className="pt-16"> {/* Add padding to prevent content from hiding under the fixed navbar */}
      {children}
    </main>
  </>
);


function App() {
  return (
    <div className="App">
      <Navbar />
     <Routes>
        {/* Public routes */}
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/hotelbooking"
          element={
            <PrivateRoute>
              <HotelBooking />
            </PrivateRoute>
          }
        />
        <Route
          path="/transportation"
          element={
            <PrivateRoute>
              <Transportation />
            </PrivateRoute>
          }
        />
        <Route
          path="/planner"
          element={
            <PrivateRoute>
              <ItineraryPlanner />
            </PrivateRoute>
          }
        />
        <Route
          path="/streetpreview"
          element={
            <PrivateRoute>
              <StreetPreview />
            </PrivateRoute>
          }
        />
        <Route
          path="/marketplace"
          element={
            <PrivateRoute>
              <Marketplace />
            </PrivateRoute>
          }
        />
        <Route
          path="/feedback"
          element={
            <PrivateRoute>
              <Feedback />
            </PrivateRoute>
          }
        />
        <Route
          path="/localbusinesshub"
          element={
            <PrivateRoute>
              <LocalBusinessHub />
            </PrivateRoute>
          }
        />
        <Route
          path="/helpdesk"
          element={
            <PrivateRoute>
              <HelpDesk />
            </PrivateRoute>
          }
        />
        <Route
          path="/artworkshop"
          element={
            <PrivateRoute>
              <ArtWorkshop />
            </PrivateRoute>
          }
        />
        <Route
          path="/verify-identity"
          element={
            <PrivateRoute>
              <UserVerification />
            </PrivateRoute>
          }
        />
        <Route
          path="/infinite"
          element={
            <PrivateRoute>
              <InfiniteScroll />
            </PrivateRoute>
          }
        />
        <Route
          path="/Services"
          element={
            <PrivateRoute>
              <Services />
            </PrivateRoute>
          }
        />
        <Route
          path="/JharkhandInfo"
          element={
            <PrivateRoute>
              <JharkhandInfo />
            </PrivateRoute>
          }
        />

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Chatbot />
    </div>
  );
}

export default App;
