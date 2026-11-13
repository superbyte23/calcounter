import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Flame, Beef, Wheat, Droplet, Plus, ScanLine, Camera, BookOpen, Target, TrendingUp, ChevronRight, Utensils } from "lucide-react";
import { useData } from "../context/DataContext";
import { useAuth } from "../context/AuthContext";
import { Card, ProgressRing, ProgressBar, Button, EmptyState, Badge } from "../components/ui";
import { MacroDonut, LineChart, StatTile } from "../components/charts";
import { todayISO, addDays, MEAL_LABELS, MEAL_EMOJI, formatDateLong, pct } from "../lib/utils";
import type { MealType } from "../lib/types";

const MEAL_ORDER: MealType[] = ["breakfast", "lunch", "dinner", "snack"];

export default function Dashboard() {
  const { totalsForDate, entriesForDate, targets, weights, water } = useData();
  const { user } = useAuth();
  const today = todayISO();
  const totals = totalsForDate(today);
  const entries = entriesForDate(today);

  const remaining = Math.max(0, targets.calories - totals.calories);
  const over = totals.calories > targets.calories;

  // 7-day calorie trend
  const weekData = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = addDays(today, -(6 - i));
      return { label: ["S", "M", "T", "W", "T", "F", "S"][new Date(d).getDay()], value: totalsForDate(d).calories };
    });
  }, [today, totalsForDate]);

  const weightData = useMemo(() => {
    const last10 = weights.slice(-10);
    return last10.map((w) => ({ label: new Date(w.date).getDate().toString(), value: w.weight }));
  }, [weights]);

  const todayWater = water.filter((w) => w.date === today).reduce((s, w) => s + w.amount, 0);
  const waterGoal = 2500;

  const grouped = useMemo(() => {
    const g: Record<MealType, typeof entries> = { breakfast: [], lunch: [], dinner: [], snack: [] };
    entries.forEach((e) => g[e.mealType].push(e));
    return g;
  }, [entries]);

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold text-slate-900">
          {greeting()}, {user?.name.split(" ")[0]} 👋
        </h2>
        <p className="text-sm text-slate-500">{formatDateLong(today)}</p>
      </div>

      {/* Top stat tiles */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Calories" value={totals.calories} unit="kcal" icon={<Flame className="h-4 w-4 text-emerald-600" />} color="bg-emerald-50" target={targets.calories} progress={pct(totals.calories, targets.calories)} />
        <StatTile label="Protein" value={totals.protein} unit="g" icon={<Beef className="h-4 w-4 text-sky-600" />} color="bg-sky-50" target={targets.protein} progress={pct(totals.protein, targets.protein)} />
        <StatTile label="Carbs" value={totals.carbs} unit="g" icon={<Wheat className="h-4 w-4 text-amber-600" />} color="bg-amber-50" target={targets.carbs} progress={pct(totals.carbs, targets.carbs)} />
        <StatTile label="Fat" value={totals.fat} unit="g" icon={<Droplet className="h-4 w-4 text-rose-600" />} color="bg-rose-50" target={targets.fat} progress={pct(totals.fat, targets.fat)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calorie ring + macros */}
        <Card className="p-6 lg:col-span-2">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
            <div className="flex flex-col items-center">
              <ProgressRing
                value={totals.calories}
                max={targets.calories}
                size={150}
                stroke={12}
                color={over ? "#f43f5e" : "#10b981"}
                label={`${totals.calories}`}
                sublabel={`of ${targets.calories} kcal`}
              />
              <div className="mt-3 text-center">
                <p className={`text-sm font-semibold ${over ? "text-rose-600" : "text-emerald-600"}`}>
                  {over ? `${totals.calories - targets.calories} over` : `${remaining} kcal left`}
                </p>
              </div>
            </div>

            <div className="flex-1 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">Today's Macros</h3>
                <MacroDonut protein={totals.protein} carbs={totals.carbs} fat={totals.fat} size={90} />
              </div>
              {[
                { label: "Protein", value: totals.protein, target: targets.protein, color: "sky", icon: <Beef className="h-3.5 w-3.5" /> },
                { label: "Carbs", value: totals.carbs, target: targets.carbs, color: "amber", icon: <Wheat className="h-3.5 w-3.5" /> },
                { label: "Fat", value: totals.fat, target: targets.fat, color: "rose", icon: <Droplet className="h-3.5 w-3.5" /> },
              ].map((m) => (
                <div key={m.label}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5 font-medium text-slate-600">
                      <span className={`flex h-5 w-5 items-center justify-center rounded ${m.color === "sky" ? "bg-sky-100 text-sky-600" : m.color === "amber" ? "bg-amber-100 text-amber-600" : "bg-rose-100 text-rose-600"}`}>{m.icon}</span>
                      {m.label}
                    </span>
                    <span className="text-slate-500">
                      <span className="font-semibold text-slate-700">{Math.round(m.value)}g</span> / {Math.round(m.target)}g
                    </span>
                  </div>
                  <ProgressBar value={m.value} max={m.target} color={m.color as "sky" | "amber" | "rose"} />
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Quick actions */}
        <Card className="flex flex-col p-6">
          <h3 className="text-base font-bold text-slate-900">Quick Log</h3>
          <p className="mt-0.5 text-sm text-slate-500">Add food in seconds.</p>
          <div className="mt-4 grid flex-1 grid-cols-2 gap-3">
            <QuickAction to="/app/foods" icon={<BookOpen className="h-5 w-5" />} label="Search" color="emerald" />
            <QuickAction to="/app/scan" icon={<ScanLine className="h-5 w-5" />} label="Barcode" color="violet" />
            <QuickAction to="/app/meal-scan" icon={<Camera className="h-5 w-5" />} label="Meal Scan" color="amber" />
            <QuickAction to="/app/diary" icon={<Plus className="h-5 w-5" />} label="Diary" color="sky" />
          </div>
          <Link to="/app/plans" className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 transition-colors hover:bg-slate-100">
            <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Target className="h-4 w-4 text-emerald-600" /> Active Plan
            </span>
            <ChevronRight className="h-4 w-4 text-slate-400" />
          </Link>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Today's meals */}
        <Card className="p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Today's Meals</h3>
            <Link to="/app/diary" className="flex items-center gap-1 text-sm font-semibold text-emerald-600 hover:text-emerald-700">
              View all <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          {entries.length === 0 ? (
            <EmptyState
              icon={<Utensils className="h-6 w-6" />}
              title="No food logged yet"
              description="Start by logging your first meal of the day."
              action={<Link to="/app/foods"><Button size="sm"><Plus className="h-4 w-4" /> Log food</Button></Link>}
            />
          ) : (
            <div className="space-y-3">
              {MEAL_ORDER.map((meal) => {
                const mealEntries = grouped[meal];
                const mealCal = mealEntries.reduce((s, e) => s + e.calories, 0);
                if (mealEntries.length === 0) return null;
                return (
                  <div key={meal} className="rounded-xl border border-slate-100 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <span>{MEAL_EMOJI[meal]}</span> {MEAL_LABELS[meal]}
                      </span>
                      <span className="text-sm font-bold text-slate-900">{mealCal} kcal</span>
                    </div>
                    <div className="space-y-1.5">
                      {mealEntries.slice(0, 3).map((e) => (
                        <div key={e.id} className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2 text-slate-600">
                            <span>{e.emoji ?? "🍽️"}</span>
                            <span className="truncate">{e.foodName}</span>
                            <span className="text-xs text-slate-400">×{e.quantity}</span>
                          </span>
                          <span className="font-medium text-slate-500">{e.calories} kcal</span>
                        </div>
                      ))}
                      {mealEntries.length > 3 && (
                        <p className="pl-7 text-xs text-slate-400">+{mealEntries.length - 3} more</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Trends */}
        <div className="space-y-6">
          <Card className="p-6">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Calorie Trend</h3>
              <Badge color="emerald">7 days</Badge>
            </div>
            <LineChart data={weekData} color="#10b981" height={150} />
            <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
              <span>Avg: {Math.round(weekData.reduce((s, d) => s + d.value, 0) / 7)} kcal</span>
              <span>Target: {targets.calories}</span>
            </div>
          </Card>

          <Card className="p-6">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Weight Trend</h3>
              <Link to="/app/weight" className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
                <TrendingUp className="h-3.5 w-3.5" /> Track
              </Link>
            </div>
            {weightData.length > 1 ? (
              <>
                <LineChart data={weightData} color="#8b5cf6" height={130} formatValue={(n) => n.toFixed(1)} />
                <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                  <span>Current: {weights[weights.length - 1]?.weight} kg</span>
                  {weights.length > 1 && (
                    <span className={weights[weights.length - 1].weight < weights[0].weight ? "font-semibold text-emerald-600" : "font-semibold text-rose-600"}>
                      {(weights[0].weight - weights[weights.length - 1].weight).toFixed(1)} kg
                    </span>
                  )}
                </div>
              </>
            ) : (
              <EmptyState icon={<TrendingUp className="h-6 w-6" />} title="No weight data" description="Log your weight to see trends." />
            )}
          </Card>
        </div>
      </div>

      {/* Water + streak */}
      <div className="grid gap-6 sm:grid-cols-2">
        <Card className="flex items-center gap-4 p-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50">
            <Droplet className="h-7 w-7 text-sky-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-slate-700">Water Intake</h3>
            <p className="text-2xl font-bold text-slate-900">{(todayWater / 1000).toFixed(1)}L <span className="text-sm font-medium text-slate-400">/ 2.5L</span></p>
            <ProgressBar value={todayWater} max={waterGoal} color="sky" className="mt-2" />
          </div>
          <Link to="/app/diary"><Button size="sm" variant="outline">Log</Button></Link>
        </Card>

        <Card className="flex items-center gap-4 p-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50">
            <Flame className="h-7 w-7 text-amber-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-slate-700">Day Streak</h3>
            <p className="text-2xl font-bold text-slate-900">{streakDays()} <span className="text-sm font-medium text-slate-400">days</span></p>
            <p className="text-xs text-slate-500">Keep logging daily to build momentum!</p>
          </div>
        </Card>
      </div>
    </div>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function streakDays() {
  // Demo streak based on day of year
  return (new Date().getDate() % 12) + 3;
}

function QuickAction({ to, icon, label, color }: { to: string; icon: React.ReactNode; label: string; color: string }) {
  const colors: Record<string, string> = {
    emerald: "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100",
    violet: "bg-violet-50 text-violet-600 group-hover:bg-violet-100",
    amber: "bg-amber-50 text-amber-600 group-hover:bg-amber-100",
    sky: "bg-sky-50 text-sky-600 group-hover:bg-sky-100",
  };
  return (
    <Link to={to} className="group flex flex-col items-center gap-2 rounded-xl border border-slate-100 p-3 transition-all hover:border-slate-200 hover:shadow-sm">
      <span className={`flex h-11 w-11 items-center justify-center rounded-xl transition-colors ${colors[color]}`}>{icon}</span>
      <span className="text-xs font-semibold text-slate-600">{label}</span>
    </Link>
  );
}
