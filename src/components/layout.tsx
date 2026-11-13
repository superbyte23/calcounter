import { useState, type ReactNode } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  Search,
  ScanLine,
  Camera,
  Target,
  LineChart,
  Scale,
  Settings,
  LogOut,
  Menu,
  X,
  Flame,
  Plus,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import { cn } from "../utils/cn";
import { initials, todayISO } from "../lib/utils";
import { Button } from "./ui";

const NAV = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/app/diary", label: "Food Diary", icon: BookOpen },
  { to: "/app/foods", label: "Food Search", icon: Search },
  { to: "/app/scan", label: "Barcode Scan", icon: ScanLine },
  { to: "/app/meal-scan", label: "Meal Scan", icon: Camera },
  { to: "/app/plans", label: "Diet Plans", icon: Target },
  { to: "/app/reports", label: "Reports", icon: LineChart },
  { to: "/app/weight", label: "Weight", icon: Scale },
  { to: "/app/settings", label: "Settings", icon: Settings },
];

export function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const { totalsForDate, targets } = useData();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const today = todayISO();
  const totals = totalsForDate(today);
  const remaining = Math.max(0, targets.calories - totals.calories);

  const current = NAV.find((n) => (n.end ? location.pathname === n.to : location.pathname.startsWith(n.to)));

  const SidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/30">
          <Flame className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-base font-bold leading-tight text-slate-900">CalCounter</p>
          <p className="text-[11px] font-medium text-slate-400">Nutrition Tracker</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                isActive ? "bg-emerald-50 text-emerald-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
              )
            }
          >
            <item.icon className="h-[18px] w-[18px]" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-100 p-3">
        <div className="flex items-center gap-3 rounded-xl px-2 py-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-slate-700 to-slate-900 text-xs font-bold text-white">
            {initials(user?.name ?? "U")}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-800">{user?.name}</p>
            <p className="truncate text-xs text-slate-400">{user?.email}</p>
          </div>
          <button onClick={logout} title="Log out" className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600">
            <LogOut className="h-[18px] w-[18px]" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-slate-200 bg-white lg:block">
        {SidebarContent}
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 bg-white shadow-xl animate-[slideRight_0.2s_ease]">
            <button onClick={() => setMobileOpen(false)} className="absolute right-3 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
              <X className="h-5 w-5" />
            </button>
            {SidebarContent}
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur-md">
          <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
            <button onClick={() => setMobileOpen(true)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden">
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-slate-900 sm:text-xl">{current?.label ?? "Dashboard"}</h1>
            </div>
            <div className="hidden items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 sm:flex">
              <Flame className="h-4 w-4 text-emerald-600" />
              <span className="text-sm font-semibold text-emerald-700">{remaining}</span>
              <span className="text-xs text-emerald-600/70">kcal left</span>
            </div>
            <Button size="sm" className="hidden sm:inline-flex" onClick={() => (window.location.hash = "#/app/diary")}>
              <Plus className="h-4 w-4" /> Log Food
            </Button>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      </div>
    </div>
  );
}
