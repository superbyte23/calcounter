import { useMemo, useState } from "react";
import { TrendingUp, TrendingDown, Flame, Beef, Award, Calendar } from "lucide-react";
import { useData } from "../context/DataContext";
import { Card, Badge, EmptyState } from "../components/ui";
import { LineChart, BarChart, MacroDonut } from "../components/charts";
import { todayISO, addDays, pct } from "../lib/utils";

type Range = 7 | 14 | 30;

export default function Reports() {
  const { totalsForDate, targets, weights, entries } = useData();
  const [range, setRange] = useState<Range>(7);

  const days = useMemo(() => {
    return Array.from({ length: range }, (_, i) => addDays(todayISO(), -(range - 1 - i)));
  }, [range]);

  const calorieData = useMemo(
    () => days.map((d) => ({ label: new Date(d).getDate().toString(), value: totalsForDate(d).calories })),
    [days, totalsForDate],
  );

  const macroData = useMemo(() => {
    const totals = days.reduce(
      (acc, d) => {
        const t = totalsForDate(d);
        return { protein: acc.protein + t.protein, carbs: acc.carbs + t.carbs, fat: acc.fat + t.fat };
      },
      { protein: 0, carbs: 0, fat: 0 },
    );
    return totals;
  }, [days, totalsForDate]);

  const avgCalories = Math.round(calorieData.reduce((s, d) => s + d.value, 0) / range);
  const avgProtein = Math.round(macroData.protein / range);
  const avgCarbs = Math.round(macroData.carbs / range);
  const avgFat = Math.round(macroData.fat / range);

  const calorieGoalMet = calorieData.filter((d) => d.value <= targets.calories && d.value > 0).length;
  const streak = (() => {
    let s = 0;
    for (let i = calorieData.length - 1; i >= 0; i--) {
      if (calorieData[i].value > 0) s++;
      else break;
    }
    return s;
  })();

  const weightChange = weights.length > 1 ? weights[weights.length - 1].weight - weights[0].weight : 0;

  // Top foods
  const topFoods = useMemo(() => {
    const counts: Record<string, { name: string; emoji?: string; calories: number; count: number }> = {};
    entries
      .filter((e) => days.includes(e.date))
      .forEach((e) => {
        if (!counts[e.foodName]) counts[e.foodName] = { name: e.foodName, emoji: e.emoji, calories: 0, count: 0 };
        counts[e.foodName].calories += e.calories;
        counts[e.foodName].count += 1;
      });
    return Object.values(counts).sort((a, b) => b.count - a.count).slice(0, 5);
  }, [entries, days]);

  const ranges: { label: string; value: Range }[] = [
    { label: "7D", value: 7 },
    { label: "14D", value: 14 },
    { label: "30D", value: 30 },
  ];

  return (
    <div className="space-y-6">
      {/* Range selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">Nutrition Reports</h2>
        <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
          {ranges.map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                range === r.value ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryCard
          icon={<Flame className="h-4 w-4 text-emerald-600" />}
          label="Avg Calories"
          value={avgCalories}
          unit="kcal"
          sub={`Target: ${targets.calories}`}
          trend={avgCalories <= targets.calories ? "good" : "warn"}
        />
        <SummaryCard
          icon={<Beef className="h-4 w-4 text-sky-600" />}
          label="Avg Protein"
          value={avgProtein}
          unit="g"
          sub={`Target: ${targets.protein}g`}
          trend={avgProtein >= targets.protein * 0.9 ? "good" : "warn"}
        />
        <SummaryCard
          icon={<Calendar className="h-4 w-4 text-violet-600" />}
          label="Goal Met"
          value={calorieGoalMet}
          unit={`/${range}d`}
          sub="days on target"
          trend="good"
        />
        <SummaryCard
          icon={<Award className="h-4 w-4 text-amber-600" />}
          label="Log Streak"
          value={streak}
          unit="days"
          sub="keep it up!"
          trend="good"
        />
      </div>

      {/* Calorie trend chart */}
      <Card className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Calorie Trend</h3>
            <p className="text-xs text-slate-500">Daily calorie intake over the last {range} days</p>
          </div>
          <Badge color="emerald">Avg {avgCalories} kcal</Badge>
        </div>
        <LineChart data={calorieData} color="#10b981" height={200} />
        <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Intake</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-slate-300" /> Target {targets.calories}</span>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Macro breakdown */}
        <Card className="p-5">
          <h3 className="text-base font-bold text-slate-900">Macro Distribution</h3>
          <p className="text-xs text-slate-500">Average daily macros over {range} days</p>
          <div className="mt-4 flex items-center gap-6">
            <MacroDonut protein={macroData.protein / range} carbs={macroData.carbs / range} fat={macroData.fat / range} size={130} />
            <div className="flex-1 space-y-3">
              <MacroRow color="bg-sky-500" label="Protein" value={avgProtein} target={targets.protein} unit="g" />
              <MacroRow color="bg-amber-500" label="Carbs" value={avgCarbs} target={targets.carbs} unit="g" />
              <MacroRow color="bg-rose-500" label="Fat" value={avgFat} target={targets.fat} unit="g" />
            </div>
          </div>
        </Card>

        {/* Weight trend */}
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Weight Trend</h3>
              <p className="text-xs text-slate-500">Last {Math.min(weights.length, range)} entries</p>
            </div>
            {weights.length > 1 && (
              <div className={`flex items-center gap-1 text-sm font-bold ${weightChange < 0 ? "text-emerald-600" : "text-rose-600"}`}>
                {weightChange < 0 ? <TrendingDown className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />}
                {Math.abs(weightChange).toFixed(1)} kg
              </div>
            )}
          </div>
          {weights.length > 1 ? (
            <LineChart
              data={weights.slice(-range).map((w) => ({ label: new Date(w.date).getDate().toString(), value: w.weight }))}
              color="#8b5cf6"
              height={180}
              formatValue={(n) => n.toFixed(1)}
            />
          ) : (
            <EmptyState icon={<TrendingUp className="h-6 w-6" />} title="Not enough data" description="Log your weight regularly to see trends." />
          )}
        </Card>
      </div>

      {/* Macro bar chart */}
      <Card className="p-5">
        <h3 className="text-base font-bold text-slate-900">Daily Macro Comparison</h3>
        <p className="text-xs text-slate-500">Protein vs Carbs vs Fat (g) per day</p>
        <div className="mt-4 space-y-4">
          <div>
            <p className="mb-1 text-xs font-semibold text-sky-600">Protein</p>
            <BarChart data={days.map((d) => ({ label: new Date(d).getDate().toString(), value: totalsForDate(d).protein }))} color="#0ea5e9" height={120} />
          </div>
          <div>
            <p className="mb-1 text-xs font-semibold text-amber-600">Carbs</p>
            <BarChart data={days.map((d) => ({ label: new Date(d).getDate().toString(), value: totalsForDate(d).carbs }))} color="#f59e0b" height={120} />
          </div>
          <div>
            <p className="mb-1 text-xs font-semibold text-rose-600">Fat</p>
            <BarChart data={days.map((d) => ({ label: new Date(d).getDate().toString(), value: totalsForDate(d).fat }))} color="#f43f5e" height={120} />
          </div>
        </div>
      </Card>

      {/* Top foods */}
      <Card className="p-5">
        <h3 className="text-base font-bold text-slate-900">Most Logged Foods</h3>
        <p className="text-xs text-slate-500">Your top foods over the last {range} days</p>
        {topFoods.length === 0 ? (
          <div className="mt-4"><EmptyState icon={<Flame className="h-6 w-6" />} title="No food logged" description="Start logging to see your most eaten foods here." /></div>
        ) : (
          <div className="mt-4 space-y-2">
            {topFoods.map((f, i) => (
              <div key={f.name} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-500">{i + 1}</span>
                <span className="text-xl">{f.emoji ?? "🍽️"}</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-800">{f.name}</p>
                  <p className="text-xs text-slate-400">{f.count} times logged</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">{f.calories}</p>
                  <p className="text-[10px] text-slate-400">total kcal</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function SummaryCard({ icon, label, value, unit, sub, trend }: { icon: React.ReactNode; label: string; value: number; unit: string; sub: string; trend: "good" | "warn" }) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</span>
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-50">{icon}</span>
      </div>
      <p className="mt-2 text-2xl font-bold text-slate-900">
        {value}<span className="text-sm font-medium text-slate-400"> {unit}</span>
      </p>
      <p className={`mt-0.5 text-xs font-medium ${trend === "good" ? "text-emerald-600" : "text-amber-600"}`}>{sub}</p>
    </Card>
  );
}

function MacroRow({ color, label, value, target, unit }: { color: string; label: string; value: number; target: number; unit: string }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 font-medium text-slate-600">
          <span className={`h-2.5 w-2.5 rounded-full ${color}`} /> {label}
        </span>
        <span className="text-slate-500">{Math.round(value)}{unit} / {target}{unit}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${pct(value, target)}%` }} />
      </div>
    </div>
  );
}
