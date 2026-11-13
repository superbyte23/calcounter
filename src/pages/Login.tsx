import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Flame, Mail, Lock, ArrowRight, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Button, Input, Label } from "../components/ui";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("demo@calcounter.app");
  const [password, setPassword] = useState("demo1234");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setTimeout(() => {
      const res = login(email, password);
      setLoading(false);
      if (res.ok) navigate("/app");
      else setError(res.error ?? "Login failed");
    }, 400);
  };

  const fillDemo = () => {
    setEmail("demo@calcounter.app");
    setPassword("demo1234");
  };

  return (
    <div className="flex min-h-screen">
      {/* Left brand panel */}
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
          <h1 className="text-4xl font-bold leading-tight">
            Count calories, track food, and crush your goals — with ease.
          </h1>
          <p className="max-w-md text-emerald-100">
            A smart nutrition companion with a free barcode scanner, personal diet plans, and Meal Scan for instant logging.
          </p>
          <div className="flex flex-wrap gap-3">
            {["Barcode Scanner", "Meal Scan AI", "Macro Tracking", "Diet Plans"].map((f) => (
              <span key={f} className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-sm font-medium backdrop-blur">
                <Sparkles className="h-3.5 w-3.5" /> {f}
              </span>
            ))}
          </div>
        </div>
        <div className="relative text-sm text-emerald-200">
          Trusted by health-conscious eaters everywhere.
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex w-full flex-col justify-center px-6 py-12 sm:px-12 lg:w-1/2">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600">
              <Flame className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900">CalCounter</span>
          </div>

          <h2 className="text-2xl font-bold text-slate-900">Welcome back</h2>
          <p className="mt-1 text-sm text-slate-500">Log in to continue tracking your nutrition.</p>

          <button
            onClick={fillDemo}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-100"
          >
            <Sparkles className="h-4 w-4" /> Use demo account
          </button>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-xs font-medium text-slate-400">or sign in</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Email</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="pl-10" required />
              </div>
            </div>
            <div>
              <Label>Password</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="pl-10" required />
              </div>
            </div>

            {error && (
              <div className="rounded-xl bg-rose-50 px-3 py-2.5 text-sm font-medium text-rose-600">{error}</div>
            )}

            <Button type="submit" loading={loading} className="w-full" size="lg">
              Sign in <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Don't have an account?{" "}
            <Link to="/signup" className="font-semibold text-emerald-600 hover:text-emerald-700">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
