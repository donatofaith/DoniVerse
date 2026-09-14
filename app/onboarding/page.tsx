"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  GraduationCap,
  Hash,
  Loader2,
  School,
  UserRound,
} from "lucide-react";

import { supabase } from "@/lib/supabase/client";

type SchoolRow = {
  id: number;
  name: string;
  short_name: string | null;
};

type DepartmentRow = {
  id: number;
  school_id: number;
  name: string;
  short_name: string | null;
};

type StudentStatus = "fresher" | "returning" | "";

type ProfileRow = {
  full_name: string | null;
  matric_number: string | null;
  school_id: number | null;
  department_id: number | null;
  level: number | string | null;
  student_status: string | null;
  onboarding_completed: boolean | null;
};

type SelectOption = {
  value: string;
  label: string;
};

const levels = [100, 200, 300, 400, 500, 600];
const currentEngineeringSchools = new Set(["SIMME", "SESE"]);

export default function OnboardingPage() {
  const router = useRouter();

  const [schools, setSchools] = useState<SchoolRow[]>([]);
  const [departments, setDepartments] = useState<DepartmentRow[]>([]);
  const [fullName, setFullName] = useState("");
  const [matricNumber, setMatricNumber] = useState("");
  const [schoolId, setSchoolId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [level, setLevel] = useState("");
  const [studentStatus, setStudentStatus] = useState<StudentStatus>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editingExistingProfile, setEditingExistingProfile] = useState(false);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError("");

    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData.session;

    if (!session) {
      router.replace("/auth");
      return;
    }

    const [profileResult, schoolResult, departmentResult] = await Promise.all([
      supabase
        .from("profiles")
        .select(
          "full_name,matric_number,school_id,department_id,level,student_status,onboarding_completed",
        )
        .eq("id", session.user.id)
        .maybeSingle(),
      supabase.from("schools").select("id,name,short_name").order("name"),
      supabase
        .from("departments")
        .select("id,school_id,name,short_name")
        .order("name"),
    ]);

    if (profileResult.error || !profileResult.data) {
      setError("We could not load your FUTAGO profile.");
      setLoading(false);
      return;
    }

    if (schoolResult.error || departmentResult.error) {
      setError("We could not load FUTA schools and departments.");
      setLoading(false);
      return;
    }

    const profile = profileResult.data as ProfileRow;
    const loadedSchools = (schoolResult.data ?? []) as SchoolRow[];
    const hasCurrentEngineering = loadedSchools.some((school) =>
      school.short_name ? currentEngineeringSchools.has(school.short_name) : false,
    );

    setSchools(
      hasCurrentEngineering
        ? loadedSchools.filter((school) => school.short_name !== "SEET")
        : loadedSchools,
    );
    setDepartments((departmentResult.data ?? []) as DepartmentRow[]);
    setFullName(profile.full_name ?? session.user.user_metadata?.full_name ?? "");
    setMatricNumber(profile.matric_number ?? "");
    setSchoolId(profile.school_id ? String(profile.school_id) : "");
    setDepartmentId(profile.department_id ? String(profile.department_id) : "");
    setLevel(profile.level ? String(profile.level) : "");
    setStudentStatus(
      profile.student_status === "fresher" || profile.student_status === "returning"
        ? profile.student_status
        : "",
    );
    setEditingExistingProfile(Boolean(profile.onboarding_completed));
    setLoading(false);
  }, [router]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const visibleDepartments = useMemo(
    () =>
      departments.filter(
        (department) => schoolId && department.school_id === Number(schoolId),
      ),
    [departments, schoolId],
  );

  const submitProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving) return;

    setError("");

    const cleanedName = fullName.trim();
    const cleanedMatric = matricNumber.trim().toUpperCase();

    if (!cleanedName) return setError("Enter your full name.");
    if (!cleanedMatric) return setError("Enter your matric number.");
    if (!schoolId) return setError("Choose your school.");
    if (!departmentId) return setError("Choose your department.");
    if (!level) return setError("Choose your level.");
    if (!studentStatus) return setError("Choose your student status.");

    setSaving(true);

    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData.session;

    if (!session) {
      setSaving(false);
      router.replace("/auth");
      return;
    }

    const { error: saveError } = await supabase
      .from("profiles")
      .update({
        full_name: cleanedName,
        matric_number: cleanedMatric,
        school_id: Number(schoolId),
        department_id: Number(departmentId),
        level: Number(level),
        student_status: studentStatus,
        onboarding_completed: true,
      })
      .eq("id", session.user.id);

    if (saveError) {
      const normalized = saveError.message.toLowerCase();
      setError(
        normalized.includes("duplicate") || normalized.includes("unique")
          ? "That matric number is already connected to another FUTAGO account."
          : "We could not save your profile. Please try again.",
      );
      setSaving(false);
      return;
    }

    router.replace("/");
    router.refresh();
  };

  if (loading) {
    return (
      <main className="flex min-h-[100dvh] items-center justify-center bg-transparent text-[#102017] dark:text-white">
        <div className="rounded-[26px] border border-white/60 bg-white/55 px-7 py-6 text-center shadow-xl backdrop-blur-3xl dark:border-white/10 dark:bg-white/[0.05]">
          <Loader2 className="mx-auto animate-spin" size={22} />
          <p className="mt-3 text-sm font-bold">Loading your profile...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden bg-transparent pb-12 text-[#102017] dark:text-white">
      <div className="relative mx-auto w-full max-w-[1080px] px-4 pb-[max(32px,env(safe-area-inset-bottom))] pt-[max(16px,env(safe-area-inset-top))] sm:px-6 md:px-8">
        <header className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => router.replace("/")}
            aria-label="Back to home"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/65 bg-white/48 shadow-sm backdrop-blur-2xl active:scale-95 dark:border-white/10 dark:bg-white/[0.05]"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="flex items-center gap-3 rounded-full border border-white/60 bg-white/42 px-3 py-2 backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.04]">
            <div className="flex h-9 w-9 items-center justify-center rounded-[13px] bg-white/70 text-[#2d6846] shadow-sm dark:bg-white/10 dark:text-[#a6efbf]">
              <GraduationCap size={18} />
            </div>
            <div className="pr-2">
              <p className="text-sm font-black">FUTAGO</p>
              <p className="text-[10px] text-black/40 dark:text-white/35">Student profile</p>
            </div>
          </div>
        </header>

        <section className="mt-7 rounded-[32px] border border-white/65 bg-white/46 p-5 shadow-[0_26px_80px_rgba(26,58,39,0.1)] backdrop-blur-3xl dark:border-white/10 dark:bg-[#0c1511]/45 sm:p-7 md:p-8">
          <div className="max-w-2xl">
            <p className="text-xs font-black uppercase tracking-[0.15em] text-[#3c7854] dark:text-[#9bedb7]">
              {editingExistingProfile ? "Profile" : "Student setup"}
            </p>
            <h1 className="mt-2 text-[34px] font-black leading-[0.98] tracking-[-0.055em] sm:text-[46px]">
              {editingExistingProfile ? "Keep your details up to date." : "Make FUTAGO yours."}
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-black/48 dark:text-white/42">
              Your school, department and level help FUTAGO personalise your campus experience.
            </p>
          </div>

          <form onSubmit={submitProfile} className="mt-7 grid gap-5 lg:grid-cols-2">
            <TextField
              label="Full name"
              icon={<UserRound size={18} />}
              value={fullName}
              onChange={setFullName}
              placeholder="Your full name"
            />

            <TextField
              label="Matric number"
              icon={<Hash size={18} />}
              value={matricNumber}
              onChange={(value) => setMatricNumber(value.toUpperCase())}
              placeholder="Your matric number"
              uppercase
            />

            <SelectField
              label="School"
              icon={<School size={18} />}
              value={schoolId}
              onChange={(value) => {
                setSchoolId(value);
                setDepartmentId("");
              }}
              placeholder="Choose your school"
              options={schools.map((school) => ({
                value: String(school.id),
                label: school.short_name ? `${school.short_name} — ${school.name}` : school.name,
              }))}
            />

            <SelectField
              label="Department"
              icon={<BookOpen size={18} />}
              value={departmentId}
              onChange={setDepartmentId}
              placeholder={schoolId ? "Choose your department" : "Choose school first"}
              disabled={!schoolId}
              options={visibleDepartments.map((department) => ({
                value: String(department.id),
                label: department.short_name
                  ? `${department.short_name} — ${department.name}`
                  : department.name,
              }))}
            />

            <div>
              <label className="text-sm font-bold text-black/60 dark:text-white/60">Level</label>
              <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6 lg:grid-cols-3 xl:grid-cols-6">
                {levels.map((item) => {
                  const active = level === String(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setLevel(String(item))}
                      className={`min-h-12 rounded-[16px] border text-sm font-black transition active:scale-[0.98] ${
                        active
                          ? "border-[#79b98f]/40 bg-[#dff3e5]/80 text-[#245c3a] shadow-sm dark:border-[#8ce6ad]/20 dark:bg-[#8ce6ad]/15 dark:text-[#a9efc1]"
                          : "border-white/65 bg-white/40 text-black/45 backdrop-blur-xl dark:border-white/8 dark:bg-white/[0.035] dark:text-white/40"
                      }`}
                    >
                      {item}L
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-sm font-bold text-black/60 dark:text-white/60">Student status</label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {(["fresher", "returning"] as const).map((status) => {
                  const active = studentStatus === status;
                  return (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setStudentStatus(status)}
                      className={`min-h-12 rounded-[16px] border px-3 text-sm font-black capitalize transition active:scale-[0.98] ${
                        active
                          ? "border-[#79b98f]/40 bg-[#dff3e5]/80 text-[#245c3a] shadow-sm dark:border-[#8ce6ad]/20 dark:bg-[#8ce6ad]/15 dark:text-[#a9efc1]"
                          : "border-white/65 bg-white/40 text-black/45 backdrop-blur-xl dark:border-white/8 dark:bg-white/[0.035] dark:text-white/40"
                      }`}
                    >
                      {status}
                    </button>
                  );
                })}
              </div>
            </div>

            {error && (
              <div className="lg:col-span-2 rounded-[18px] border border-red-400/15 bg-red-400/[0.08] px-4 py-3 text-sm font-semibold text-red-700 dark:text-red-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="lg:col-span-2 flex min-h-[60px] items-center justify-between rounded-[19px] border border-[#75b68d]/35 bg-[#dff3e5]/85 px-5 text-left text-[#17462d] shadow-[0_16px_42px_rgba(52,116,76,0.12)] backdrop-blur-2xl transition active:scale-[0.99] disabled:opacity-60 dark:border-[#8ce6ad]/20 dark:bg-[#8ce6ad]/15 dark:text-[#a9efc1]"
            >
              <div>
                <p className="text-sm font-black">
                  {saving
                    ? "Saving..."
                    : editingExistingProfile
                      ? "Save profile"
                      : "Finish setup"}
                </p>
                <p className="mt-0.5 text-xs opacity-60">Continue to FUTAGO</p>
              </div>
              {saving ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}

function TextField({
  label,
  icon,
  value,
  onChange,
  placeholder,
  uppercase = false,
}: {
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  uppercase?: boolean;
}) {
  return (
    <div>
      <label className="text-sm font-bold text-black/60 dark:text-white/60">{label}</label>
      <div className="mt-2 flex h-[58px] items-center gap-3 rounded-[18px] border border-white/65 bg-white/45 px-4 shadow-sm backdrop-blur-2xl focus-within:border-[#6caf83]/45 dark:border-white/10 dark:bg-white/[0.04]">
        <span className="text-black/35 dark:text-white/35">{icon}</span>
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className={`min-w-0 flex-1 bg-transparent text-base font-semibold outline-none placeholder:normal-case placeholder:text-black/28 dark:text-white dark:placeholder:text-white/25 ${uppercase ? "uppercase" : ""}`}
        />
      </div>
    </div>
  );
}

function SelectField({
  label,
  icon,
  value,
  onChange,
  placeholder,
  options,
  disabled = false,
}: {
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  options: SelectOption[];
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    const close = (event: PointerEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);

  useEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled]);

  return (
    <div ref={ref} className="relative">
      <label className="text-sm font-bold text-black/60 dark:text-white/60">{label}</label>
      <button
        type="button"
        disabled={disabled}
        aria-expanded={open}
        onClick={() => !disabled && setOpen((current) => !current)}
        className={`mt-2 flex min-h-[58px] w-full items-center gap-3 rounded-[18px] border px-4 text-left shadow-sm backdrop-blur-2xl transition disabled:cursor-not-allowed disabled:opacity-45 ${
          open
            ? "border-[#6caf83]/45 bg-white/60 ring-4 ring-[#6caf83]/10 dark:border-[#8ce6ad]/25 dark:bg-[#101914]/90"
            : "border-white/65 bg-white/45 dark:border-white/10 dark:bg-[#101914]/70"
        }`}
      >
        <span className="shrink-0 text-black/35 dark:text-white/35">{icon}</span>
        <span
          className={`min-w-0 flex-1 truncate text-base font-semibold ${
            selected ? "text-[#102017] dark:text-white" : "text-black/28 dark:text-white/30"
          }`}
        >
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown
          size={17}
          className={`shrink-0 text-black/35 transition dark:text-white/35 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && !disabled && (
        <div className="absolute left-0 right-0 top-full z-[80] mt-2 overflow-hidden rounded-[20px] border border-white/70 bg-[rgba(239,245,240,0.96)] p-2 shadow-[0_24px_70px_rgba(17,46,29,0.22)] backdrop-blur-3xl dark:border-white/10 dark:bg-[rgba(12,21,16,0.97)]">
          <div className="max-h-[270px] overflow-y-auto overscroll-contain pr-1">
            {options.length === 0 ? (
              <div className="px-3 py-4 text-sm font-medium text-black/40 dark:text-white/35">
                No options available
              </div>
            ) : (
              options.map((option) => {
                const active = option.value === value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                    className={`flex min-h-[50px] w-full items-center justify-between gap-3 rounded-[14px] px-3 py-2.5 text-left transition ${
                      active
                        ? "bg-[#dff3e5] text-[#214f34] dark:bg-[#8ce6ad]/15 dark:text-[#baf4cd]"
                        : "text-[#102017] hover:bg-white/65 dark:text-white dark:hover:bg-white/[0.06]"
                    }`}
                  >
                    <span className="min-w-0 flex-1 text-sm font-semibold leading-5">
                      {option.label}
                    </span>
                    {active && <Check size={16} className="shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
