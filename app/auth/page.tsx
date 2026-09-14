"use client";

import { FormEvent, ReactNode, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  GraduationCap,
  Loader2,
  LockKeyhole,
  Mail,
  UserRound,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { FUTAGO_GUEST_KEY } from "@/components/AppAccessGate";

type AuthMode = "signup" | "signin";
type ViewMode = "auth" | "forgot";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("signup");
  const [viewMode, setViewMode] = useState<ViewMode>("auth");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const resetFeedback = () => {
    setMessage("");
    setError("");
  };

  const switchMode = (nextMode: AuthMode) => {
    if (loading) return;
    setMode(nextMode);
    setViewMode("auth");
    setPassword("");
    setShowPassword(false);
    resetFeedback();
  };

  const continueAsGuest = async () => {
    if (loading) return;

    try {
      setLoading(true);
      await supabase.auth.signOut();
      window.localStorage.setItem(FUTAGO_GUEST_KEY, "1");
      router.replace("/");
    } finally {
      setLoading(false);
    }
  };

  const routeSignedInUser = async (userId: string) => {
    window.localStorage.removeItem(FUTAGO_GUEST_KEY);

    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarding_completed")
      .eq("id", userId)
      .maybeSingle();

    router.replace(profile?.onboarding_completed ? "/" : "/onboarding");
  };

  const handleBack = () => {
    if (loading) return;

    if (viewMode === "forgot") {
      setViewMode("auth");
      setMode("signin");
      resetFeedback();
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) return;

    resetFeedback();

    const cleanedEmail = email.trim().toLowerCase();
    const cleanedFullName = fullName.trim();

    if (mode === "signup" && !cleanedFullName) {
      setError("Enter your full name.");
      return;
    }

    if (!cleanedEmail) {
      setError("Enter your email address.");
      return;
    }

    if (password.length < 6) {
      setError("Your password must contain at least 6 characters.");
      return;
    }

    try {
      setLoading(true);

      if (mode === "signup") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: cleanedEmail,
          password,
          options: {
            data: { full_name: cleanedFullName },
            emailRedirectTo: `${window.location.origin}/onboarding`,
          },
        });

        if (signUpError) throw signUpError;

        window.localStorage.removeItem(FUTAGO_GUEST_KEY);

        if (data.session && data.user) {
          await routeSignedInUser(data.user.id);
          return;
        }

        setMessage("Account created. Check your email to confirm your account, then sign in.");
        setMode("signin");
        setPassword("");
        setShowPassword(false);
        return;
      }

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: cleanedEmail,
        password,
      });

      if (signInError) throw signInError;

      await routeSignedInUser(data.user.id);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) return;

    resetFeedback();
    const cleanedEmail = email.trim().toLowerCase();

    if (!cleanedEmail) {
      setError("Enter the email connected to your FUTAGO account.");
      return;
    }

    try {
      setLoading(true);
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(cleanedEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) throw resetError;
      setMessage("Reset link sent. Check your email and follow the link to choose a new password.");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "We could not send the reset email.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[100dvh] overflow-x-hidden bg-[#f5f5ef] text-[#132118] dark:bg-[#07100b] dark:text-white">
      <div className="mx-auto min-h-[100dvh] w-full max-w-[1200px] lg:grid lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden min-h-[100dvh] overflow-hidden bg-[#0e3b25] p-10 lg:flex lg:flex-col lg:justify-between xl:p-14">
          <DesktopDecoration />

          <div className="relative z-10 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-[15px] bg-white text-[#0e3b25]">
              <GraduationCap size={22} />
            </div>
            <div>
              <p className="text-xl font-black tracking-[-0.04em] text-white">FUTAGO</p>
              <p className="text-xs text-white/50">Know where to go.</p>
            </div>
          </div>

          <div className="relative z-10 max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#98f5bd]">
              Your campus companion
            </p>
            <h1 className="mt-4 max-w-lg text-5xl font-black leading-[0.98] tracking-[-0.055em] text-white xl:text-6xl">
              Campus feels easier when you know where to go.
            </h1>
            <p className="mt-6 max-w-md text-base leading-7 text-white/60">
              Find places, follow your student journey and discover what FUTA has around you.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-3 text-sm text-white/45">
            <span className="h-2 w-2 rounded-full bg-[#98f5bd]" />
            Built for everyday campus life
          </div>
        </section>

        <section className="relative flex min-h-[100dvh] min-w-0 flex-col">
          <header className="flex min-h-[72px] shrink-0 items-center justify-between px-4 pt-[env(safe-area-inset-top)] sm:px-8 lg:justify-end lg:px-12 xl:px-16">
            {viewMode === "forgot" ? (
              <button
                type="button"
                onClick={handleBack}
                disabled={loading}
                aria-label="Go back"
                className="flex h-11 w-11 shrink-0 touch-manipulation items-center justify-center rounded-full border border-black/[0.06] bg-white text-[#183624] shadow-sm active:scale-95 disabled:opacity-50 dark:border-white/10 dark:bg-white/[0.06] dark:text-white lg:hidden"
              >
                <ArrowLeft size={19} />
              </button>
            ) : (
              <div className="h-11 w-11 lg:hidden" />
            )}

            <button
              type="button"
              onClick={() => void continueAsGuest()}
              disabled={loading}
              className="touch-manipulation rounded-full px-3 py-3 text-sm font-semibold text-[#31543c] active:opacity-60 disabled:opacity-50 dark:text-white/65 sm:px-4"
            >
              Continue as guest
            </button>
          </header>

          <div className="mx-auto flex w-full max-w-[560px] flex-1 flex-col justify-center px-4 pb-[max(32px,env(safe-area-inset-bottom))] pt-6 sm:px-8 sm:py-12 md:px-10 lg:px-12 xl:px-16">
            <div className="mb-8 lg:hidden">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] bg-[#123f29] text-white shadow-[0_12px_30px_rgba(18,63,41,0.14)] dark:bg-[#99efb8] dark:text-[#092012]">
                  <GraduationCap size={22} />
                </div>
                <div>
                  <p className="text-xl font-black tracking-[-0.04em]">FUTAGO</p>
                  <p className="text-xs text-black/45 dark:text-white/45">Know where to go.</p>
                </div>
              </div>
            </div>

            {viewMode === "forgot" ? (
              <ForgotPasswordView
                email={email}
                setEmail={setEmail}
                loading={loading}
                error={error}
                message={message}
                onSubmit={handlePasswordReset}
                onBack={handleBack}
              />
            ) : (
              <AuthView
                mode={mode}
                fullName={fullName}
                email={email}
                password={password}
                showPassword={showPassword}
                loading={loading}
                error={error}
                message={message}
                setFullName={setFullName}
                setEmail={setEmail}
                setPassword={setPassword}
                setShowPassword={setShowPassword}
                onSwitchMode={switchMode}
                onForgotPassword={() => {
                  if (loading) return;
                  resetFeedback();
                  setViewMode("forgot");
                }}
                onSubmit={handleSubmit}
              />
            )}

            <p className="mt-8 text-center text-xs leading-5 text-black/35 dark:text-white/30">
              FUTAGO is an independent student companion and is not an official FUTA portal.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

function AuthView({
  mode,
  fullName,
  email,
  password,
  showPassword,
  loading,
  error,
  message,
  setFullName,
  setEmail,
  setPassword,
  setShowPassword,
  onSwitchMode,
  onForgotPassword,
  onSubmit,
}: {
  mode: AuthMode;
  fullName: string;
  email: string;
  password: string;
  showPassword: boolean;
  loading: boolean;
  error: string;
  message: string;
  setFullName: (value: string) => void;
  setEmail: (value: string) => void;
  setPassword: (value: string) => void;
  setShowPassword: (value: boolean) => void;
  onSwitchMode: (mode: AuthMode) => void;
  onForgotPassword: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
}) {
  return (
    <>
      <p className="text-sm font-bold text-[#2c7a49] dark:text-[#8ce6ad]">
        {mode === "signup" ? "Create your account" : "Welcome back"}
      </p>
      <h1 className="mt-2 max-w-[430px] text-[34px] font-black leading-[1.02] tracking-[-0.05em] min-[380px]:text-[38px] sm:text-[42px]">
        {mode === "signup" ? "Make FUTAGO yours." : "Sign in to FUTAGO."}
      </h1>
      <p className="mt-3 max-w-sm text-sm leading-6 text-black/50 dark:text-white/45">
        {mode === "signup"
          ? "Create an account to save your department, level and student journey."
          : "Continue with your saved campus profile and journey."}
      </p>

      <div className="mt-7 grid grid-cols-2 gap-1 rounded-[18px] bg-black/[0.04] p-1 dark:bg-white/[0.06]">
        {(["signup", "signin"] as AuthMode[]).map((item) => (
          <button
            key={item}
            type="button"
            disabled={loading}
            onClick={() => onSwitchMode(item)}
            className={`min-h-[48px] touch-manipulation rounded-[14px] px-2 text-[13px] font-bold transition active:scale-[0.99] disabled:opacity-50 sm:px-4 sm:text-sm ${
              mode === item
                ? "bg-white text-[#173823] shadow-sm dark:bg-[#173b27] dark:text-white"
                : "text-black/45 dark:text-white/40"
            }`}
          >
            {item === "signup" ? "Create account" : "Sign in"}
          </button>
        ))}
      </div>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        {mode === "signup" && (
          <AuthField label="Full name" icon={<UserRound size={19} />}>
            <input
              type="text"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Your full name"
              autoComplete="name"
              className="h-full min-w-0 flex-1 bg-transparent text-base font-medium outline-none placeholder:text-black/30 dark:placeholder:text-white/25"
            />
          </AuthField>
        )}

        <AuthField label="Email" icon={<Mail size={19} />}>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            inputMode="email"
            autoCapitalize="none"
            spellCheck={false}
            className="h-full min-w-0 flex-1 bg-transparent text-base font-medium outline-none placeholder:text-black/30 dark:placeholder:text-white/25"
          />
        </AuthField>

        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <label htmlFor="password" className="text-sm font-semibold text-black/65 dark:text-white/65">
              Password
            </label>
            {mode === "signin" && (
              <button
                type="button"
                disabled={loading}
                onClick={onForgotPassword}
                className="touch-manipulation text-xs font-bold text-[#31784b] disabled:opacity-50 dark:text-[#91eab0]"
              >
                Forgot password?
              </button>
            )}
          </div>

          <div className="flex h-[58px] min-w-0 items-center gap-3 rounded-[18px] border border-black/[0.07] bg-white px-4 shadow-sm focus-within:border-[#4c9967]/40 focus-within:ring-4 focus-within:ring-[#4c9967]/[0.07] dark:border-white/[0.08] dark:bg-white/[0.045]">
            <LockKeyhole size={19} className="shrink-0 text-black/35 dark:text-white/35" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 6 characters"
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              className="h-full min-w-0 flex-1 bg-transparent text-base font-medium outline-none placeholder:text-black/30 dark:placeholder:text-white/25"
            />
            <button
              type="button"
              disabled={loading}
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="flex h-10 w-10 shrink-0 touch-manipulation items-center justify-center rounded-full text-black/35 active:bg-black/[0.05] disabled:opacity-50 dark:text-white/35 dark:active:bg-white/[0.05]"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {error && <FeedbackBox text={error} error />}
        {message && <FeedbackBox text={message} />}

        <button
          type="submit"
          disabled={loading}
          className="flex min-h-[60px] w-full touch-manipulation items-center justify-between gap-4 rounded-[19px] bg-[#123f29] px-5 py-3 text-left text-white shadow-[0_16px_40px_rgba(18,63,41,0.18)] transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#89e4aa] dark:text-[#082013]"
        >
          <div className="min-w-0">
            <span className="block text-[15px] font-extrabold">
              {loading ? "Please wait..." : mode === "signup" ? "Create my account" : "Sign in"}
            </span>
            {!loading && (
              <span className="mt-0.5 block text-xs text-white/55 dark:text-[#082013]/55">
                {mode === "signup" ? "Continue to student setup" : "Continue to FUTAGO"}
              </span>
            )}
          </div>
          {loading ? <Loader2 size={19} className="animate-spin" /> : <ArrowRight size={18} />}
        </button>
      </form>
    </>
  );
}

function ForgotPasswordView({
  email,
  setEmail,
  loading,
  error,
  message,
  onSubmit,
  onBack,
}: {
  email: string;
  setEmail: (value: string) => void;
  loading: boolean;
  error: string;
  message: string;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  onBack: () => void;
}) {
  return (
    <>
      <p className="text-sm font-bold text-[#2c7a49] dark:text-[#8ce6ad]">Account recovery</p>
      <h1 className="mt-2 text-[34px] font-black leading-[1.02] tracking-[-0.05em] min-[380px]:text-[38px] sm:text-[42px]">
        Reset your password.
      </h1>
      <p className="mt-3 max-w-sm text-sm leading-6 text-black/50 dark:text-white/45">
        Enter the email connected to your FUTAGO account. We&apos;ll send you a secure reset link.
      </p>

      <form onSubmit={onSubmit} className="mt-7 space-y-4">
        <AuthField label="Email" icon={<Mail size={19} />}>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            inputMode="email"
            autoCapitalize="none"
            spellCheck={false}
            className="h-full min-w-0 flex-1 bg-transparent text-base font-medium outline-none placeholder:text-black/30 dark:placeholder:text-white/25"
          />
        </AuthField>

        {error && <FeedbackBox text={error} error />}
        {message && <FeedbackBox text={message} />}

        <button
          type="submit"
          disabled={loading}
          className="flex min-h-[60px] w-full touch-manipulation items-center justify-between gap-4 rounded-[19px] bg-[#123f29] px-5 py-3 text-white shadow-[0_16px_40px_rgba(18,63,41,0.18)] active:scale-[0.99] disabled:opacity-60 dark:bg-[#89e4aa] dark:text-[#082013]"
        >
          <span className="font-extrabold">{loading ? "Sending reset link..." : "Send reset link"}</span>
          {loading ? <Loader2 size={19} className="animate-spin" /> : <ArrowRight size={18} />}
        </button>

        <button
          type="button"
          disabled={loading}
          onClick={onBack}
          className="min-h-[48px] w-full touch-manipulation text-sm font-bold text-[#2f6845] disabled:opacity-50 dark:text-[#91eab0]"
        >
          Back to sign in
        </button>
      </form>
    </>
  );
}

function AuthField({ label, icon, children }: { label: string; icon: ReactNode; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <label className="mb-2 block text-sm font-semibold text-black/65 dark:text-white/65">{label}</label>
      <div className="flex h-[58px] min-w-0 items-center gap-3 rounded-[18px] border border-black/[0.07] bg-white px-4 shadow-sm focus-within:border-[#4c9967]/40 focus-within:ring-4 focus-within:ring-[#4c9967]/[0.07] dark:border-white/[0.08] dark:bg-white/[0.045]">
        <span className="shrink-0 text-black/35 dark:text-white/35">{icon}</span>
        {children}
      </div>
    </div>
  );
}

function FeedbackBox({ text, error = false }: { text: string; error?: boolean }) {
  return (
    <div
      role={error ? "alert" : "status"}
      className={`rounded-[16px] border px-4 py-3 text-sm font-medium leading-5 ${
        error
          ? "border-red-500/15 bg-red-500/[0.07] text-red-700 dark:text-red-300"
          : "border-emerald-500/15 bg-emerald-500/[0.08] text-emerald-800 dark:text-emerald-200"
      }`}
    >
      {text}
    </div>
  );
}

function DesktopDecoration() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -left-28 top-20 h-80 w-80 rounded-full bg-[#58d68d]/10 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-[420px] w-[420px] rounded-full bg-[#b8e994]/10 blur-3xl" />
      <div className="absolute left-[18%] top-[34%] h-px w-[62%] rotate-[-12deg] bg-white/10" />
      <div className="absolute left-[28%] top-[50%] h-px w-[52%] rotate-[20deg] bg-white/10" />
      <div className="absolute right-[15%] top-[28%] h-4 w-4 rounded-full border-4 border-[#98f5bd] bg-[#0e3b25] shadow-[0_0_30px_rgba(152,245,189,0.4)]" />
      <div className="absolute bottom-[28%] left-[20%] h-3 w-3 rounded-full bg-[#f1c75b]" />
    </div>
  );
}
