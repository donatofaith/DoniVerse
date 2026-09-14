"use client";

import { FormEvent, ReactNode, useEffect, useRef, useState } from "react";
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

import { FUTAGO_GUEST_KEY } from "@/components/AppAccessGate";
import { supabase } from "@/lib/supabase/client";

type AuthMode = "signup" | "signin";
type ViewMode = "auth" | "forgot";

const FUTA_CAMPUS_IMAGE =
  "https://upload.wikimedia.org/wikipedia/commons/2/29/Federal_University_of_Technology%2C_Akure%2C_Ondo_State11.jpg";
const FUTA_CAMPUS_VIDEO = "/futago-auth-campus.mp4";

export default function AuthPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [mode, setMode] = useState<AuthMode>("signup");
  const [viewMode, setViewMode] = useState<ViewMode>("auth");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    const tryPlay = () => {
      void video.play().catch(() => {
        // The poster image remains visible if autoplay is unavailable.
      });
    };

    if (video.readyState >= 2) tryPlay();
    else video.addEventListener("canplay", tryPlay, { once: true });

    return () => video.removeEventListener("canplay", tryPlay);
  }, []);

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

  const continueAsGuest = () => {
    if (loading) return;
    window.localStorage.setItem(FUTAGO_GUEST_KEY, "1");
    router.replace("/");
  };

  const handleBack = () => {
    if (loading) return;

    if (viewMode === "forgot") {
      setViewMode("auth");
      setMode("signin");
      resetFeedback();
      return;
    }

    continueAsGuest();
  };

  const goAfterSignIn = async (userId: string) => {
    window.localStorage.removeItem(FUTAGO_GUEST_KEY);

    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarding_completed")
      .eq("id", userId)
      .maybeSingle();

    router.replace(profile?.onboarding_completed ? "/" : "/onboarding");
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

        if (data.session) {
          await goAfterSignIn(data.session.user.id);
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
      if (!data.user) throw new Error("We could not sign you in. Please try again.");

      await goAfterSignIn(data.user.id);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Something went wrong. Please try again.");
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
      setError(caughtError instanceof Error ? caughtError.message : "We could not send the reset email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[100dvh] overflow-hidden bg-[#08110c] text-white">
      <div className="relative min-h-[100dvh]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${FUTA_CAMPUS_IMAGE})` }}
          aria-hidden="true"
        />
        <video
          ref={videoRef}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${videoReady ? "opacity-100" : "opacity-0"}`}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster={FUTA_CAMPUS_IMAGE}
          onCanPlay={() => setVideoReady(true)}
          onPlaying={() => setVideoReady(true)}
          aria-hidden="true"
        >
          <source src={FUTA_CAMPUS_VIDEO} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,15,10,0.22)_0%,rgba(5,15,10,0.46)_40%,rgba(5,15,10,0.90)_100%)]" aria-hidden="true" />

        <div className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-[1220px] flex-col px-4 pb-[max(24px,env(safe-area-inset-bottom))] pt-[max(16px,env(safe-area-inset-top))] sm:px-6 lg:grid lg:grid-cols-[1.05fr_.95fr] lg:gap-12 lg:px-10">
          <section className="flex min-h-[38vh] flex-col justify-between pb-8 lg:min-h-[100dvh] lg:py-10">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-[15px] border border-white/20 bg-white/12 text-white shadow-lg backdrop-blur-2xl">
                  <GraduationCap size={22} />
                </div>
                <div>
                  <p className="text-xl font-black tracking-[-0.045em]">FUTAGO</p>
                  <p className="text-[11px] text-white/55">Know where to go.</p>
                </div>
              </div>

              <button
                type="button"
                onClick={continueAsGuest}
                disabled={loading}
                className="rounded-full border border-white/15 bg-white/10 px-4 py-2.5 text-xs font-bold text-white/85 backdrop-blur-2xl transition active:scale-95 disabled:opacity-50 lg:hidden"
              >
                Continue as guest
              </button>
            </div>

            <div className="mt-12 max-w-2xl lg:mb-24">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#a0efbb]">Your campus companion</p>
              <h1 className="mt-4 max-w-[620px] text-[43px] font-black leading-[0.94] tracking-[-0.06em] sm:text-[58px] lg:text-[72px]">
                Welcome to
                <span className="block text-[#a0efbb]">FUTAGO.</span>
              </h1>
              <p className="mt-5 max-w-md text-sm leading-6 text-white/62 sm:text-[15px]">
                Find your way around FUTA, follow your student journey and stay connected to campus life.
              </p>
            </div>

            <p className="hidden text-xs text-white/35 lg:block">Federal University of Technology, Akure</p>
          </section>

          <section className="flex flex-1 items-end pb-2 lg:items-center lg:py-12">
            <div className="w-full rounded-[30px] border border-white/15 bg-[#08110c]/55 p-4 shadow-[0_30px_100px_rgba(0,0,0,0.35)] backdrop-blur-3xl sm:p-6 lg:p-7">
              <div className="mb-6 flex items-center justify-between gap-4 lg:mb-8">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={loading}
                  aria-label="Go back"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-white/[0.07] text-white/75 transition active:scale-95 disabled:opacity-50"
                >
                  <ArrowLeft size={18} />
                </button>

                <button
                  type="button"
                  onClick={continueAsGuest}
                  disabled={loading}
                  className="hidden rounded-full border border-white/12 bg-white/[0.07] px-4 py-2.5 text-xs font-bold text-white/75 transition active:scale-95 disabled:opacity-50 lg:block"
                >
                  Continue as guest
                </button>
              </div>

              {viewMode === "forgot" ? (
                <ForgotPasswordView
                  email={email}
                  setEmail={setEmail}
                  loading={loading}
                  error={error}
                  message={message}
                  onSubmit={handlePasswordReset}
                  onBack={() => {
                    if (loading) return;
                    setViewMode("auth");
                    setMode("signin");
                    resetFeedback();
                  }}
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
            </div>
          </section>
        </div>
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
      <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#a0efbb]">
        {mode === "signup" ? "Create your account" : "Welcome back"}
      </p>
      <h2 className="mt-2 text-[30px] font-black tracking-[-0.05em] sm:text-[36px]">
        {mode === "signup" ? "Make FUTAGO yours." : "Sign in to FUTAGO."}
      </h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-white/50">
        {mode === "signup"
          ? "Save your department, level and student journey."
          : "Continue with your saved campus profile and journey."}
      </p>

      <div className="mt-6 grid grid-cols-2 gap-1 rounded-[17px] border border-white/[0.07] bg-black/20 p-1">
        <button
          type="button"
          disabled={loading}
          onClick={() => onSwitchMode("signup")}
          className={`min-h-11 rounded-[13px] px-3 text-sm font-bold transition disabled:opacity-50 ${
            mode === "signup" ? "bg-white text-[#102017] shadow-sm" : "text-white/50"
          }`}
        >
          Create account
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={() => onSwitchMode("signin")}
          className={`min-h-11 rounded-[13px] px-3 text-sm font-bold transition disabled:opacity-50 ${
            mode === "signin" ? "bg-white text-[#102017] shadow-sm" : "text-white/50"
          }`}
        >
          Sign in
        </button>
      </div>

      <form onSubmit={onSubmit} className="mt-5 space-y-4">
        {mode === "signup" && (
          <GlassField label="Full name" icon={<UserRound size={18} />}>
            <input
              type="text"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Your full name"
              autoComplete="name"
              className="h-full min-w-0 flex-1 bg-transparent text-base font-medium text-white outline-none placeholder:text-white/28"
            />
          </GlassField>
        )}

        <GlassField label="Email" icon={<Mail size={18} />}>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            inputMode="email"
            autoCapitalize="none"
            spellCheck={false}
            className="h-full min-w-0 flex-1 bg-transparent text-base font-medium text-white outline-none placeholder:text-white/28"
          />
        </GlassField>

        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <label htmlFor="password" className="text-sm font-semibold text-white/65">Password</label>
            {mode === "signin" && (
              <button
                type="button"
                disabled={loading}
                onClick={onForgotPassword}
                className="text-xs font-bold text-[#a0efbb] disabled:opacity-50"
              >
                Forgot password?
              </button>
            )}
          </div>

          <div className="flex h-[56px] items-center gap-3 rounded-[17px] border border-white/12 bg-white/[0.07] px-4 backdrop-blur-2xl focus-within:border-[#a0efbb]/35 focus-within:ring-4 focus-within:ring-[#a0efbb]/[0.05]">
            <LockKeyhole size={18} className="shrink-0 text-white/40" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 6 characters"
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              className="h-full min-w-0 flex-1 bg-transparent text-base font-medium text-white outline-none placeholder:text-white/28"
            />
            <button
              type="button"
              disabled={loading}
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white/40 active:bg-white/[0.06] disabled:opacity-50"
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </div>

        {error && <FeedbackBox text={error} error />}
        {message && <FeedbackBox text={message} />}

        <button
          type="submit"
          disabled={loading}
          className="flex min-h-[58px] w-full items-center justify-between gap-4 rounded-[18px] bg-[#a0efbb] px-5 text-left text-[#082013] shadow-[0_16px_40px_rgba(83,207,126,0.16)] transition active:scale-[0.99] disabled:opacity-60"
        >
          <span className="font-extrabold">
            {loading ? "Please wait..." : mode === "signup" ? "Create my account" : "Sign in"}
          </span>
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
      <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#a0efbb]">Account recovery</p>
      <h2 className="mt-2 text-[30px] font-black tracking-[-0.05em] sm:text-[36px]">Reset your password.</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-white/50">Enter the email connected to your FUTAGO account.</p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <GlassField label="Email" icon={<Mail size={18} />}>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            inputMode="email"
            autoCapitalize="none"
            spellCheck={false}
            className="h-full min-w-0 flex-1 bg-transparent text-base font-medium text-white outline-none placeholder:text-white/28"
          />
        </GlassField>

        {error && <FeedbackBox text={error} error />}
        {message && <FeedbackBox text={message} />}

        <button
          type="submit"
          disabled={loading}
          className="flex min-h-[58px] w-full items-center justify-between rounded-[18px] bg-[#a0efbb] px-5 font-extrabold text-[#082013] disabled:opacity-60"
        >
          <span>{loading ? "Sending reset link..." : "Send reset link"}</span>
          {loading ? <Loader2 size={19} className="animate-spin" /> : <ArrowRight size={18} />}
        </button>

        <button
          type="button"
          disabled={loading}
          onClick={onBack}
          className="min-h-11 w-full text-sm font-bold text-[#a0efbb] disabled:opacity-50"
        >
          Back to sign in
        </button>
      </form>
    </>
  );
}

function GlassField({ label, icon, children }: { label: string; icon: ReactNode; children: ReactNode }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-white/65">{label}</label>
      <div className="flex h-[56px] items-center gap-3 rounded-[17px] border border-white/12 bg-white/[0.07] px-4 backdrop-blur-2xl focus-within:border-[#a0efbb]/35 focus-within:ring-4 focus-within:ring-[#a0efbb]/[0.05]">
        <span className="shrink-0 text-white/40">{icon}</span>
        {children}
      </div>
    </div>
  );
}

function FeedbackBox({ text, error = false }: { text: string; error?: boolean }) {
  return (
    <div
      role={error ? "alert" : "status"}
      className={`rounded-[15px] border px-4 py-3 text-sm font-medium leading-5 ${
        error
          ? "border-red-300/15 bg-red-400/[0.09] text-red-100"
          : "border-[#a0efbb]/15 bg-[#a0efbb]/[0.08] text-[#c9f8da]"
      }`}
    >
      {text}
    </div>
  );
}
