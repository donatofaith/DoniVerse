"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  KeyRound,
  Loader2,
} from "lucide-react";

import { supabase } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [checkingSession, setCheckingSession] = useState(true);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const checkRecoverySession = async () => {
      const { data } = await supabase.auth.getSession();

      if (data.session) {
        setCheckingSession(false);
        return;
      }

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event, session) => {
        if (
          event === "PASSWORD_RECOVERY" ||
          (event === "SIGNED_IN" && session)
        ) {
          setCheckingSession(false);
        }
      });

      const timeout = setTimeout(() => {
        setCheckingSession(false);
      }, 3000);

      return () => {
        clearTimeout(timeout);
        subscription.unsubscribe();
      };
    };

    checkRecoverySession();
  }, []);

  const handleReset = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");

    if (password.length < 6) {
      setError("Your password must contain at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const { error: updateError } =
        await supabase.auth.updateUser({
          password,
        });

      if (updateError) {
        throw updateError;
      }

      setSuccess(true);

      await supabase.auth.signOut();

      setTimeout(() => {
        router.replace("/auth");
      }, 1800);
    } catch (caughtError) {
      if (caughtError instanceof Error) {
        setError(caughtError.message);
      } else {
        setError("We could not update your password.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f5ef] dark:bg-[#07100b]">
        <div className="flex items-center gap-3 text-sm font-bold text-black/45 dark:text-white/45">
          <Loader2 size={19} className="animate-spin" />
          Opening secure reset session...
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f5ef] px-4 py-8 text-[#132118] dark:bg-[#07100b] dark:text-white">
      <div className="w-full max-w-[480px] rounded-[30px] border border-black/[0.06] bg-white p-6 shadow-[0_22px_70px_rgba(23,55,34,0.08)] sm:p-8 dark:border-white/[0.07] dark:bg-white/[0.045] dark:shadow-none">
        <div className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-[#123f29] text-white dark:bg-[#8ce6ad] dark:text-[#082013]">
          <GraduationCap size={25} />
        </div>

        {success ? (
          <div className="py-8">
            <CheckCircle2
              size={40}
              className="text-[#30804e] dark:text-[#8ce6ad]"
            />

            <h1 className="mt-5 text-3xl font-black tracking-[-0.04em]">
              Password updated.
            </h1>

            <p className="mt-3 text-sm leading-6 text-black/45 dark:text-white/40">
              Your new password is ready. We&apos;re taking you
              back to sign in.
            </p>
          </div>
        ) : (
          <>
            <p className="mt-7 text-sm font-bold text-[#2d7c4b] dark:text-[#8ce6ad]">
              Account recovery
            </p>

            <h1 className="mt-2 text-[34px] font-black leading-tight tracking-[-0.05em]">
              Choose a new password.
            </h1>

            <p className="mt-3 text-sm leading-6 text-black/45 dark:text-white/40">
              Use a password you&apos;ll remember and don&apos;t
              share it with anyone.
            </p>

            <form
              onSubmit={handleReset}
              className="mt-8 space-y-5"
            >
              <PasswordField
                label="New password"
                value={password}
                show={showPassword}
                onChange={setPassword}
                onToggle={() =>
                  setShowPassword((current) => !current)
                }
              />

              <PasswordField
                label="Confirm new password"
                value={confirmPassword}
                show={showConfirmPassword}
                onChange={setConfirmPassword}
                onToggle={() =>
                  setShowConfirmPassword((current) => !current)
                }
              />

              {error && (
                <div className="rounded-[16px] border border-red-500/15 bg-red-500/[0.07] px-4 py-3 text-sm font-medium text-red-700 dark:text-red-300">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex h-[60px] w-full items-center justify-between rounded-[19px] bg-[#123f29] px-5 text-white disabled:opacity-60 dark:bg-[#8ce6ad] dark:text-[#082013]"
              >
                <span className="font-extrabold">
                  {loading
                    ? "Updating password..."
                    : "Set new password"}
                </span>

                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <ArrowRight size={18} />
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}

function PasswordField({
  label,
  value,
  show,
  onChange,
  onToggle,
}: {
  label: string;
  value: string;
  show: boolean;
  onChange: (value: string) => void;
  onToggle: () => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-black/65 dark:text-white/65">
        {label}
      </label>

      <div className="flex h-[58px] items-center gap-3 rounded-[18px] border border-black/[0.07] bg-[#fafaf7] px-4 dark:border-white/[0.08] dark:bg-white/[0.04]">
        <KeyRound
          size={18}
          className="text-black/35 dark:text-white/35"
        />

        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="At least 6 characters"
          autoComplete="new-password"
          className="h-full min-w-0 flex-1 bg-transparent text-[15px] font-medium outline-none placeholder:text-black/25 dark:placeholder:text-white/25"
        />

        <button
          type="button"
          onClick={onToggle}
          className="text-black/35 dark:text-white/35"
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
}