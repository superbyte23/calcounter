import { useState } from "react";
import { Scale, Plus, Trash2, TrendingDown, TrendingUp, Target, Award } from "lucide-react";
import { useData } from "../context/DataContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Card, Button, Input, Label, Modal, EmptyState, Badge } from "../components/ui";
import { LineChart } from "../components/charts";
import { todayISO, formatDate, relativeDay } from "../lib/utils";

export default function Weight() {
  const { weights, addWeight, deleteWeight } = useData();
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [weight, setWeight] = useState(user?.weight ?? 70);
  const [date, setDate] = useState(todayISO());
  const [note, setNote] = useState("");

  const sorted = [...weights].sort((a, b) => a.date.localeCompare(b.date));
  const latest = sorted[sorted.length - 1];
  const first = sorted[0];
  const change = latest && first ? latest.weight - first.weight : 0;
  const targetWeight = user?.targetWeight;

  const handleSave = () => {
    addWeight(weight, date, note || undefined);
    toast("Weight logged", "success");
    setOpen(false);
    setNote("");
  };

  const handleDelete = (id: string) => {
    deleteWeight(id);
    toast("Entry deleted", "info");
  };

  const chartData = sorted.map((w) => ({ label: new Date(w.date).getDate().toString(), value: w.weight }));

  const toGoal = targetWeight && latest ? latest.weight - targetWeight : 0;

  return (
    <div className="space-y-6">
      {/* Header with quick log */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Weight Tracking</h2>
          <p className="text-sm text-slate-500">Monitor your progress over time</p>
        </div>
        <Button onClick={() => { setWeight(latest?.weight ?? user?.weight ?? 70); setDate(todayISO()); setOpen(true); }}>
          <Plus className="h-4 w-4" /> Log Weight
        </Button>
      </div>

      {/* Current stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-400">Current</span>
            <Scale className="h-4 w-4 text-slate-400" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{latest?.weight ?? "—"}<span className="text-sm font-medium text-slate-400"> kg</span></p>
          <p className="mt-0.5 text-xs text-slate-400">{latest ? relativeDay(latest.date) : "No data"}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-400">Change</span>
            {change < 0 ? <TrendingDown className="h-4 w-4 text-emerald-500" /> : change > 0 ? <TrendingUp className="h-4 w-4 text-rose-500" /> : <Scale className="h-4 w-4 text-slate-400" />}
          </div>
          <p className={`mt-2 text-2xl font-bold ${change < 0 ? "text-emerald-600" : change > 0 ? "text-rose-600" : "text-slate-900"}`}>
            {change > 0 ? "+" : ""}{change.toFixed(1)}<span className="text-sm font-medium text-slate-400"> kg</span>
          </p>
          <p className="mt-0.5 text-xs text-slate-400">{first ? `Since ${formatDate(first.date)}` : "No data"}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-400">Goal</span>
            <Target className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{targetWeight ?? "—"}<span className="text-sm font-medium text-slate-400"> kg</span></p>
          <p className="mt-0.5 text-xs text-slate-400">{targetWeight ? `${toGoal > 0 ? toGoal.toFixed(1) + " kg to go" : "Goal reached! 🎉"}` : "Set in settings"}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-400">Entries</span>
            <Award className="h-4 w-4 text-amber-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{sorted.length}</p>
          <p className="mt-0.5 text-xs text-slate-400">total logged</p>
        </Card>
      </div>

      {/* Chart */}
      <Card className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Weight Trend</h3>
            <p className="text-xs text-slate-500">Your weight journey</p>
          </div>
          {targetWeight && (
            <Badge color="emerald">Goal: {targetWeight} kg</Badge>
          )}
        </div>
        {chartData.length > 1 ? (
          <LineChart data={chartData} color="#8b5cf6" height={220} formatValue={(n) => n.toFixed(1)} />
        ) : (
          <EmptyState
            icon={<Scale className="h-6 w-6" />}
            title="Start tracking your weight"
            description="Log at least 2 weight entries to see your trend chart."
            action={<Button size="sm" onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Log weight</Button>}
          />
        )}
      </Card>

      {/* History */}
      <Card className="overflow-hidden">
        <div className="border-b border-slate-100 px-5 py-3">
          <h3 className="text-base font-bold text-slate-900">History</h3>
        </div>
        {sorted.length === 0 ? (
          <div className="p-5">
            <EmptyState icon={<Scale className="h-6 w-6" />} title="No entries yet" description="Log your weight to start tracking progress." />
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {[...sorted].reverse().map((w) => (
              <div key={w.id} className="group flex items-center gap-3 px-5 py-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50">
                  <Scale className="h-4 w-4 text-violet-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-800">{w.weight} kg</p>
                  <p className="text-xs text-slate-400">{formatDate(w.date)} · {relativeDay(w.date)}{w.note ? ` · ${w.note}` : ""}</p>
                </div>
                <button onClick={() => handleDelete(w.id)} className="rounded-lg p-1.5 text-slate-300 opacity-0 transition-opacity hover:bg-rose-50 hover:text-rose-500 group-hover:opacity-100">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Log modal */}
      <Modal open={open} onClose={() => setOpen(false)} title="Log Weight" size="sm">
        <div className="space-y-4">
          <div>
            <Label>Weight (kg)</Label>
            <Input type="number" step="0.1" value={weight} onChange={(e) => setWeight(Number(e.target.value))} autoFocus />
          </div>
          <div>
            <Label>Date</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} max={todayISO()} />
          </div>
          <div>
            <Label>Note (optional)</Label>
            <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Morning, before breakfast" />
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>Cancel</Button>
            <Button className="flex-1" onClick={handleSave}><Plus className="h-4 w-4" /> Save</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
