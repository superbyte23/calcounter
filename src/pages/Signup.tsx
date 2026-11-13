import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Flame, Mail, Lock, User, ArrowRight, TrendingUp } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Button, Input, Label, Select } from "../components/ui";
import type { Gender, Goal, ActivityLevel } from "../lib/types";
import { ACTIVITY_LABELS, GOAL_LABELS } from "../lib/utils";

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    age: 28,
    gender: "female" as Gender,
    weight: 70,
    height: 170,
    activityLevel: "light" as ActivityLevel,
    goal: "lose" as Goal,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k: string, v: string | number) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const res = signup(form);
      setLoading(false);
      if (res.ok) navigate("/app");
      else setError(res.error ?? "Signup failed");
    }, 500);
  };

  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 p-12 text-white lg:flex">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-24 -left-10 h-80 w-80 rounded-full bg-teal-400/20 blur-3xl" />
        <div className="relative flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
            <Flame className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold">CalCounter</span>
        </div>
        <div className="relative space-y-6">
          <h1 className="text-4xl font-bold leading-tight">Start your journey to better nutrition today.</h1>
          <p className="max-w-md text-emerald-100">
            Set your goals, get personalized targets, and track every meal with a beautiful, easy-to-use app.
          </p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: "🎯", label: "Smart targets" },
              { icon: "📊", label: "Insights" },
              { icon: "⚡", label: "Fast logging" },
            ].map((f) => (
              <div key={f.label} className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                <div className="text-2xl">{f.icon}</div>
                <p className="mt-1 text-sm font-medium">{f.label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="relative flex items-center gap-2 text-sm text-emerald-200">
          <TrendingUp className="h-4 w-4" /> Join thousands reaching their goals.
        </div>
      </div>

      <div className="flex w-full flex-col justify-center px-6 py-10 sm:px-12 lg:w-1/2">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-6 flex items-center gap-2.5 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600">
              <Flame className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900">CalCounter</span>
          </div>

          <h2 className="text-2xl font-bold text-slate-900">Create your account</h2>
          <p className="mt-1 text-sm text-slate-500">It only takes a minute. No credit card required.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Name</Label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Your name" className="pl-10" required />
                </div>
              </div>
              <div>
                <Label>Email</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="you@example.com" className="pl-10" required />
                </div>
              </div>
            </div>

            <div>
              <Label>Password</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input type="password" value={form.password} onChange={(e) => set("password", e.target.value)} placeholder="At least 6 characters" className="pl-10" required />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Age</Label>
                <Input type="number" min={14} max={100} value={form.age} onChange={(e) => set("age", Number(e.target.value))} />
              </div>
              <div>
                <Label>Weight (kg)</Label>
                <Input type="number" min={30} max={300} value={form.weight} onChange={(e) => set("weight", Number(e.target.value))} />
              </div>
              <div>
                <Label>Height (cm)</Label>
                <Input type="number" min={100} max={250} value={form.height} onChange={(e) => set("height", Number(e.target.value))} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Gender</Label>
                <Select value={form.gender} onChange={(e) => set("gender", e.target.value)}>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                </Select>
              </div>
              <div>
                <Label>Goal</Label>
                <Select value={form.goal} onChange={(e) => set("goal", e.target.value)}>
                  {(Object.keys(GOAL_LABELS) as Goal[]).map((g) => (
                    <option key={g} value={g}>{GOAL_LABELS[g]}</option>
                  ))}
                </Select>
              </div>
            </div>

            <div>
              <Label>Activity level</Label>
              <Select value={form.activityLevel} onChange={(e) => set("activityLevel", e.target.value)}>
                {(Object.keys(ACTIVITY_LABELS) as ActivityLevel[]).map((a) => (
                  <option key={a} value={a}>{ACTIVITY_LABELS[a]}</option>
                ))}
              </Select>
            </div>

            {error && (
              <div className="rounded-xl bg-rose-50 px-3 py-2.5 text-sm font-medium text-rose-600">{error}</div>
            )}

            <Button type="submit" loading={loading} className="w-full" size="lg">
              Create account <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-emerald-600 hover:text-emerald-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
