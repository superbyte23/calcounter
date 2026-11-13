import { HashRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { DataProvider } from "./context/DataContext";
import { ToastProvider } from "./context/ToastContext";
import { DashboardLayout } from "./components/layout";
import { Spinner } from "./components/ui";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Diary from "./pages/Diary";
import FoodSearch from "./pages/FoodSearch";
import BarcodeScanner from "./pages/BarcodeScanner";
import MealScan from "./pages/MealScan";
import DietPlans from "./pages/DietPlans";
import Reports from "./pages/Reports";
import Weight from "./pages/Weight";
import Settings from "./pages/Settings";

function Protected({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Spinner className="h-8 w-8 text-emerald-500" />
          <p className="text-sm text-slate-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/app"
        element={
          <Protected>
            <DashboardLayout><Dashboard /></DashboardLayout>
          </Protected>
        }
      />
      <Route
        path="/app/diary"
        element={
          <Protected>
            <DashboardLayout><Diary /></DashboardLayout>
          </Protected>
        }
      />
      <Route
        path="/app/foods"
        element={
          <Protected>
            <DashboardLayout><FoodSearch /></DashboardLayout>
          </Protected>
        }
      />
      <Route
        path="/app/scan"
        element={
          <Protected>
            <DashboardLayout><BarcodeScanner /></DashboardLayout>
          </Protected>
        }
      />
      <Route
        path="/app/meal-scan"
        element={
          <Protected>
            <DashboardLayout><MealScan /></DashboardLayout>
          </Protected>
        }
      />
      <Route
        path="/app/plans"
        element={
          <Protected>
            <DashboardLayout><DietPlans /></DashboardLayout>
          </Protected>
        }
      />
      <Route
        path="/app/reports"
        element={
          <Protected>
            <DashboardLayout><Reports /></DashboardLayout>
          </Protected>
        }
      />
      <Route
        path="/app/weight"
        element={
          <Protected>
            <DashboardLayout><Weight /></DashboardLayout>
          </Protected>
        }
      />
      <Route
        path="/app/settings"
        element={
          <Protected>
            <DashboardLayout><Settings /></DashboardLayout>
          </Protected>
        }
      />
      <Route path="*" element={<Navigate to="/app" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <DataProvider>
          <ToastProvider>
            <AppRoutes />
          </ToastProvider>
        </DataProvider>
      </AuthProvider>
    </HashRouter>
  );
}
