
import { useState } from "react";

import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  Eye,
  EyeOff,
  Store,
  ShieldCheck,
  ArrowRight,
  LockKeyhole,
  CheckCircle2,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { getApiErrorMessage } from "../../utils/format.js";

export default function Login() {
  const { login, isAuthenticated } = useAuth();

  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // =========================================================
  // FORM STATE
  // =========================================================

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    username: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // =========================================================
  // REDIRECT AUTHENTICATED USER
  // =========================================================

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // =========================================================
  // HANDLE INPUT CHANGE
  // =========================================================

  const handleChange = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    // Remove the error as soon as the user starts correcting it
    if (errors[field]) {
      setErrors((previous) => ({
        ...previous,
        [field]: "",
      }));
    }
  };

  // =========================================================
  // VALIDATION
  // =========================================================

  const validate = () => {
    const validationErrors = {
      username: "",
      password: "",
    };

    const username = form.username.trim();

    if (!username) {
      validationErrors.username =
        "Username or email is required.";
    }

    if (!form.password) {
      validationErrors.password =
        "Password is required.";
    } else if (form.password.length < 8) {
      validationErrors.password =
        "Password must contain at least 8 characters.";
    }

    setErrors(validationErrors);

    return !Object.values(validationErrors).some(
      (error) => error
    );
  };

  // =========================================================
  // SUBMIT LOGIN
  // =========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) {
      return;
    }

    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      const username = form.username.trim();
      const password = form.password;

      console.log("LOGIN USERNAME:", username);

      await login(username, password);

      const redirectTo =
        location.state?.from || "/dashboard";

      navigate(redirectTo, {
        replace: true,
      });
    } catch (error) {
      console.error("LOGIN ERROR:", error);

      toast.error(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // NORMAL INPUT
  // =========================================================

  const FormInput = ({
    label,
    field,
    type = "text",
    placeholder,
    autoComplete,
  }) => {
    const hasError = Boolean(errors[field]);

    return (
      <div className="w-full">
        <label
          htmlFor={field}
          className="mb-2 block text-sm font-semibold text-white"
        >
          {label}
        </label>

        <input
          id={field}
          name={field}
          type={type}
          value={form[field]}
          placeholder={placeholder}
          autoComplete={autoComplete}
          spellCheck={false}
          onChange={(event) =>
            handleChange(field, event.target.value)
          }
          className={`h-12 w-full rounded-xl border bg-white/[0.045] px-4 text-sm font-medium text-white caret-white outline-none transition-all duration-200 placeholder:text-white/35 ${
            hasError
              ? "border-red-500/70 focus:border-red-400 focus:ring-2 focus:ring-red-500/10"
              : "border-white/10 focus:border-violet-500/70 focus:bg-white/[0.07] focus:ring-2 focus:ring-violet-500/10"
          }`}
        />

        {hasError && (
          <p className="mt-1.5 text-xs font-medium text-red-400">
            {errors[field]}
          </p>
        )}
      </div>
    );
  };

  // =========================================================
  // PASSWORD INPUT
  // =========================================================

  const PasswordInput = ({
    label,
    field,
    show,
    setShow,
    error,
  }) => {
    return (
      <div className="w-full">
        <label
          htmlFor={field}
          className="mb-2 block text-sm font-semibold text-white"
        >
          {label}
        </label>

        <div className="relative">
          <input
            id={field}
            name={field}
            type={show ? "text" : "password"}
            value={form[field]}
            placeholder="Enter password"
            autoComplete="current-password"
            onChange={(event) =>
              handleChange(field, event.target.value)
            }
            className={`h-12 w-full rounded-xl border bg-white/[0.045] px-4 pr-12 text-sm font-medium text-white caret-white outline-none transition-all duration-200 placeholder:text-white/35 ${
              error
                ? "border-red-500/70 focus:border-red-400 focus:ring-2 focus:ring-red-500/10"
                : "border-white/10 focus:border-violet-500/70 focus:bg-white/[0.07] focus:ring-2 focus:ring-violet-500/10"
            }`}
          />

          <button
            type="button"
            aria-label={
              show
                ? "Hide password"
                : "Show password"
            }
            onClick={() =>
              setShow((previous) => !previous)
            }
            className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-white/45 transition hover:bg-white/5 hover:text-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
          >
            {show ? (
              <EyeOff size={18} />
            ) : (
              <Eye size={18} />
            )}
          </button>
        </div>

        {error && (
          <p className="mt-1.5 text-xs font-medium text-red-400">
            {error}
          </p>
        )}
      </div>
    );
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#07051A] text-white">

      {/* =====================================================
          BACKGROUND EFFECTS
      ====================================================== */}

      <div className="pointer-events-none fixed inset-0">

        {/* Violet Glow */}
        <div className="absolute -left-40 -top-40 h-[420px] w-[420px] rounded-full bg-violet-600/20 blur-[120px]" />

        {/* Blue Glow */}
        <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-blue-600/20 blur-[130px]" />

        {/* Center Glow */}
        <div className="absolute left-1/2 top-1/2 h-[350px] w-[350px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600/10 blur-[120px]" />

        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "45px 45px",
          }}
        />
      </div>

      {/* =====================================================
          MAIN
      ====================================================== */}

      <main className="relative z-10 flex min-h-screen items-start justify-center px-4 py-6 sm:px-6 lg:items-center lg:py-10">

        <div className="grid w-full max-w-6xl overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.04] shadow-2xl shadow-black/50 backdrop-blur-2xl lg:grid-cols-2">

          {/* =================================================
              LEFT BRAND PANEL
          ================================================== */}

          <section className="relative hidden min-h-[680px] overflow-hidden border-r border-white/10 bg-gradient-to-br from-[#17103F] via-[#100C2D] to-[#081633] p-10 lg:flex lg:flex-col lg:justify-between xl:p-14">

            {/* Decorative Circles */}

            <div className="pointer-events-none absolute -right-28 -top-28 h-80 w-80 rounded-full border border-violet-400/10" />

            <div className="pointer-events-none absolute -right-10 -top-10 h-52 w-52 rounded-full border border-blue-400/10" />

            <div className="pointer-events-none absolute bottom-20 -left-24 h-64 w-64 rounded-full border border-violet-500/5" />

            {/* Brand */}

            <div className="relative z-10">

              <div className="flex items-center gap-3">

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-blue-600 shadow-lg shadow-violet-600/25">
                  <Store
                    size={24}
                    strokeWidth={2.2}
                  />
                </div>

                <div>
                  <h2 className="text-lg font-bold tracking-tight text-white">
                    POS
                    <span className="text-violet-400">
                      FLOW
                    </span>
                  </h2>

                  <p className="text-[9px] font-medium uppercase tracking-[0.25em] text-white/50">
                    Retail Management
                  </p>
                </div>

              </div>

              {/* Hero */}

              <div className="mt-24">

                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1.5">

                  <span className="h-1.5 w-1.5 rounded-full bg-violet-400 shadow-[0_0_10px_rgba(167,139,250,0.9)]" />

                  <span className="text-xs font-medium text-violet-300">
                    Welcome Back
                  </span>

                </div>

                <h1 className="max-w-lg text-4xl font-bold leading-[1.12] tracking-tight text-white xl:text-5xl">

                  Manage your

                  <span className="block bg-gradient-to-r from-violet-300 via-indigo-300 to-blue-300 bg-clip-text text-transparent">
                    business smarter.
                  </span>

                </h1>

                <p className="mt-6 max-w-md text-sm leading-7 text-white/60">
                  Access your POSFLOW dashboard and
                  manage sales, products, inventory,
                  staff and customers from one powerful
                  platform.
                </p>

              </div>

              {/* Benefits */}

              <div className="mt-12 space-y-4">

                <div className="flex items-center gap-3">
                  <CheckCircle2
                    size={18}
                    className="text-violet-400"
                  />

                  <span className="text-sm text-white/75">
                    Fast and reliable billing
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <CheckCircle2
                    size={18}
                    className="text-violet-400"
                  />

                  <span className="text-sm text-white/75">
                    Easy product & inventory management
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <CheckCircle2
                    size={18}
                    className="text-violet-400"
                  />

                  <span className="text-sm text-white/75">
                    Powerful sales management
                  </span>
                </div>

              </div>

            </div>

            {/* Bottom */}

            <div className="relative z-10 mt-12">

              <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.035] p-4">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-300">
                  <ShieldCheck size={19} />
                </div>

                <div>
                  <p className="text-sm font-semibold text-white">
                    Secure Authentication
                  </p>

                  <p className="mt-1 text-xs text-white/50">
                    Your account information is protected.
                  </p>
                </div>

              </div>

              <p className="pt-5 text-xs text-white/35">
                © 2026 POSFLOW. All rights reserved.
              </p>

            </div>

          </section>

          {/* =================================================
              RIGHT LOGIN PANEL
          ================================================== */}

          <section className="bg-[#0B0920]/95 p-5 sm:p-8 lg:p-10 xl:p-12">

            <div className="mx-auto flex min-h-[640px] w-full max-w-md flex-col justify-center">

              {/* MOBILE LOGO */}

              <div className="mb-7 flex justify-center lg:hidden">

                <div className="flex items-center gap-3">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-blue-600 shadow-lg shadow-violet-600/20">
                    <Store size={22} />
                  </div>

                  <div>
                    <p className="text-lg font-bold text-white">
                      POS
                      <span className="text-violet-400">
                        FLOW
                      </span>
                    </p>

                    <p className="text-[9px] uppercase tracking-[0.22em] text-white/50">
                      Retail Management
                    </p>
                  </div>

                </div>

              </div>

              {/* HEADER */}

              <div className="mb-7">

                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-violet-400/20 bg-gradient-to-br from-violet-500/15 to-blue-500/10 text-violet-300">

                  <LockKeyhole
                    size={23}
                    strokeWidth={1.9}
                  />

                </div>

                <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  Welcome back
                </h2>

                <p className="mt-2 text-sm leading-6 text-white/70">
                  Sign in to continue to your
                  POSFLOW account.
                </p>

              </div>

              {/* LOGIN FORM */}

              <form
                onSubmit={handleSubmit}
                className="space-y-5"
                noValidate
              >

                {/* Username */}

                <FormInput
                  label="Email / Username"
                  field="username"
                  placeholder="Enter username or email"
                  autoComplete="username"
                />

                {/* Password */}

                <PasswordInput
                  label="Password"
                  field="password"
                  show={showPassword}
                  setShow={setShowPassword}
                  error={errors.password}
                />

                {/* Security Hint */}

                <div className="rounded-xl border border-white/10 bg-white/[0.025] px-4 py-3">

                  <div className="flex items-center gap-2">

                    <ShieldCheck
                      size={15}
                      className="text-violet-400"
                    />

                    <span className="text-xs font-medium text-white/60">
                      Your credentials are securely protected.
                    </span>

                  </div>

                </div>

                {/* LOGIN BUTTON */}

                <button
                  type="submit"
                  disabled={loading}
                  className="group mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 text-sm font-semibold text-white shadow-xl shadow-violet-900/25 transition-all duration-200 hover:-translate-y-0.5 hover:from-violet-500 hover:via-indigo-500 hover:to-blue-500 hover:shadow-violet-700/30 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                >

                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In

                      <ArrowRight
                        size={17}
                        className="transition-transform duration-200 group-hover:translate-x-1"
                      />
                    </>
                  )}

                </button>

              </form>

              {/* DIVIDER */}

              <div className="mt-8 flex items-center gap-3">

                <div className="h-px flex-1 bg-white/10" />

                <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/25">
                  Account
                </span>

                <div className="h-px flex-1 bg-white/10" />

              </div>

              {/* REGISTER */}

              <div className="mt-6">

                <p className="text-center text-sm text-white/75">

                  Don't have an account?

                  <Link
                    to="/register"
                    className="ml-1 font-semibold text-violet-400 transition-colors hover:text-violet-300"
                  >
                    Create account
                  </Link>

                </p>

              </div>

              {/* SECURITY */}

              <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-white/50">

                <ShieldCheck size={13} />

                <span>
                  Secure authentication
                </span>

              </div>

            </div>

          </section>

        </div>

      </main>

    </div>
  );
}
