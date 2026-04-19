import { Suspense, lazy, useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import useAuthStore from "./store/authStore";
import useTheme from "./hooks/useTheme";

const HomePage = lazy(() => import("./pages/HomePage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const HistoryPage = lazy(() => import("./pages/HistoryPage"));
const GraphPage = lazy(() => import("./pages/GraphPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

function RouteFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-primary">
      <div className="glass-panel flex items-center gap-3 px-6 py-4">
        <div className="h-3 w-3 animate-pulse rounded-full bg-primary" />
        <p className="text-sm text-text-muted">Loading NeuroGraph...</p>
      </div>
    </div>
  );
}

function AppBoot() {
  const location = useLocation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const loadFromStorage = useAuthStore((state) => state.loadFromStorage);

  useTheme();

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  if (!hasHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-primary">
        <div className="glass-panel flex items-center gap-3 px-6 py-4">
          <div className="h-3 w-3 animate-pulse rounded-full bg-primary" />
          <p className="text-sm text-text-muted">Preparing your memory graph...</p>
        </div>
      </div>
    );
  }

  const isAuthRoute = ["/login", "/register"].includes(location.pathname);

  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
        />
        <Route
          path="/register"
          element={isAuthenticated ? <Navigate to="/" replace /> : <RegisterPage />}
        />
        <Route
          path="/"
          element={isAuthenticated ? <HomePage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/history"
          element={isAuthenticated ? <HistoryPage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/graph"
          element={isAuthenticated ? <GraphPage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/dashboard"
          element={isAuthenticated ? <DashboardPage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="*"
          element={
            isAuthRoute || isAuthenticated ? (
              <NotFoundPage />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return <AppBoot />;
}
