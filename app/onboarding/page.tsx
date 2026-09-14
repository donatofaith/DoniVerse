"use client";

import {
  FormEvent,
  ReactNode,
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
  CheckCircle2,
  ChevronDown,
  GraduationCap,
  Hash,
  Loader2,
  RefreshCw,
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

type ProfileRow = {
  full_name: string | null;
  matric_number: string | null;
  school_id: number | null;
  department_id: number | null;
  level: string | null;
  student_status: string | null;
  onboarding_completed: boolean | null;
};

type StudentStatus =
  | "fresher"
  | "returning"
  | "";

type DropdownOption = {
  value: string;
  label: string;
  sublabel?: string;
};

type LoadState =
  | "loading"
  | "ready"
  | "error";

const levels = [
  "100",
  "200",
  "300",
  "400",
  "500",
  "600",
];

const REQUEST_TIMEOUT = 12000;

function withTimeout<T>(
  promise: PromiseLike<T>,
  timeout = REQUEST_TIMEOUT
): Promise<T> {
  return Promise.race([
    Promise.resolve(promise),

    new Promise<T>((_, reject) => {
      window.setTimeout(() => {
        reject(
          new Error(
            "The request took too long."
          )
        );
      }, timeout);
    }),
  ]);
}

export default function OnboardingPage() {
  const router = useRouter();

  const [schools, setSchools] = useState<
    SchoolRow[]
  >([]);

  const [
    departments,
    setDepartments,
  ] = useState<DepartmentRow[]>([]);

  const [fullName, setFullName] =
    useState("");

  const [
    matricNumber,
    setMatricNumber,
  ] = useState("");

  const [schoolId, setSchoolId] =
    useState("");

  const [
    departmentId,
    setDepartmentId,
  ] = useState("");

  const [level, setLevel] =
    useState("");

  const [
    studentStatus,
    setStudentStatus,
  ] =
    useState<StudentStatus>("");

  const [loadState, setLoadState] =
    useState<LoadState>("loading");

  const [
    loadError,
    setLoadError,
  ] = useState("");

  const [saving, setSaving] =
    useState(false);

  const [formError, setFormError] =
    useState("");

  const loadOnboardingData =
    useCallback(async () => {
      setLoadState("loading");
      setLoadError("");
      setFormError("");

      try {
        /*
         * getSession checks the session stored in
         * this browser/device first.
         */
        const sessionResult =
          await withTimeout(
            supabase.auth.getSession()
          );

        if (
          sessionResult.error ||
          !sessionResult.data.session
        ) {
          router.replace("/auth");
          return;
        }

        const user =
          sessionResult.data.session.user;

        /*
         * Fetch the profile and academic data.
         * None of these requests are allowed to
         * leave the page loading forever.
         */
        const [
          profileResult,
          schoolResult,
          departmentResult,
        ] = await Promise.all([
          withTimeout(
            supabase
              .from("profiles")
              .select(
                `
                  full_name,
                  matric_number,
                  school_id,
                  department_id,
                  level,
                  student_status,
                  onboarding_completed
                `
              )
              .eq("id", user.id)
              .maybeSingle()
          ),

          withTimeout(
            supabase
              .from("schools")
              .select(
                "id, name, short_name"
              )
              .order("name")
          ),

          withTimeout(
            supabase
              .from("departments")
              .select(
                "id, school_id, name, short_name"
              )
              .order("name")
          ),
        ]);

        if (profileResult.error) {
          throw new Error(
            "We could not load your FUTAGO profile."
          );
        }

        if (!profileResult.data) {
          throw new Error(
            "Your FUTAGO profile could not be found. Please sign in again."
          );
        }

        if (
          schoolResult.error ||
          departmentResult.error
        ) {
          throw new Error(
            "We could not load FUTA academic information."
          );
        }

        const profile =
          profileResult.data as ProfileRow;

        /*
         * Existing users who already completed
         * onboarding should not see this page.
         */
        if (
          profile.onboarding_completed
        ) {
          router.replace("/");
          return;
        }

        setSchools(
          (schoolResult.data ??
            []) as SchoolRow[]
        );

        setDepartments(
          (departmentResult.data ??
            []) as DepartmentRow[]
        );

        setFullName(
          profile.full_name ?? ""
        );

        setMatricNumber(
          profile.matric_number ?? ""
        );

        setSchoolId(
          profile.school_id
            ? String(profile.school_id)
            : ""
        );

        setDepartmentId(
          profile.department_id
            ? String(
                profile.department_id
              )
            : ""
        );

        setLevel(
          profile.level ?? ""
        );

        const savedStatus =
          profile.student_status;

        if (
          savedStatus === "fresher" ||
          savedStatus === "returning"
        ) {
          setStudentStatus(
            savedStatus
          );
        } else {
          setStudentStatus("");
        }

        setLoadState("ready");
      } catch (caughtError) {
        console.error(
          "FUTAGO onboarding load error:",
          caughtError
        );

        if (
          caughtError instanceof Error
        ) {
          if (
            caughtError.message.includes(
              "took too long"
            )
          ) {
            setLoadError(
              "FUTAGO could not reach the server in time. Check your connection and try again."
            );
          } else {
            setLoadError(
              caughtError.message
            );
          }
        } else {
          setLoadError(
            "Something went wrong while preparing your profile."
          );
        }

        setLoadState("error");
      }
    }, [router]);

  useEffect(() => {
    void loadOnboardingData();
  }, [loadOnboardingData]);

  const filteredDepartments =
    useMemo(() => {
      if (!schoolId) {
        return [];
      }

      return departments.filter(
        (department) =>
          department.school_id ===
          Number(schoolId)
      );
    }, [departments, schoolId]);

  const schoolOptions =
    useMemo<DropdownOption[]>(
      () =>
        schools.map((school) => ({
          value: String(school.id),
          label: school.name,

          sublabel:
            school.short_name ??
            undefined,
        })),
      [schools]
    );

  const departmentOptions =
    useMemo<DropdownOption[]>(
      () =>
        filteredDepartments.map(
          (department) => ({
            value: String(
              department.id
            ),

            label: department.name,

            sublabel:
              department.short_name ??
              undefined,
          })
        ),

      [filteredDepartments]
    );

  const handleSchoolChange = (
    value: string
  ) => {
    setSchoolId(value);
    setDepartmentId("");
    setFormError("");
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (saving) return;

    setFormError("");

    const cleanedFullName =
      fullName.trim();

    const cleanedMatricNumber =
      matricNumber
        .trim()
        .toUpperCase();

    if (!cleanedFullName) {
      setFormError(
        "Enter your full name."
      );
      return;
    }

    if (!cleanedMatricNumber) {
      setFormError(
        "Enter your matric number."
      );
      return;
    }

    if (!schoolId) {
      setFormError(
        "Choose your school."
      );
      return;
    }

    if (!departmentId) {
      setFormError(
        "Choose your department."
      );
      return;
    }

    if (!level) {
      setFormError(
        "Choose your level."
      );
      return;
    }

    if (!studentStatus) {
      setFormError(
        "Choose your student status."
      );
      return;
    }

    try {
      setSaving(true);

      const sessionResult =
        await withTimeout(
          supabase.auth.getSession()
        );

      if (
        sessionResult.error ||
        !sessionResult.data.session
      ) {
        router.replace("/auth");
        return;
      }

      const user =
        sessionResult.data.session.user;

      const updateResult =
        await withTimeout(
          supabase
            .from("profiles")
            .update({
              full_name:
                cleanedFullName,

              matric_number:
                cleanedMatricNumber,

              school_id:
                Number(schoolId),

              department_id:
                Number(departmentId),

              level,

              student_status:
                studentStatus,

              onboarding_completed:
                true,
            })
            .eq("id", user.id)
        );

      if (updateResult.error) {
        const message =
          updateResult.error.message.toLowerCase();

        if (
          message.includes(
            "duplicate"
          ) ||
          message.includes(
            "unique"
          )
        ) {
          setFormError(
            "That matric number is already connected to another FUTAGO account."
          );
        } else {
          setFormError(
            updateResult.error.message
          );
        }

        return;
      }

      router.replace("/");
    } catch (caughtError) {
      console.error(
        "FUTAGO onboarding save error:",
        caughtError
      );

      if (
        caughtError instanceof Error &&
        caughtError.message.includes(
          "took too long"
        )
      ) {
        setFormError(
          "Saving took too long. Check your connection and try again."
        );
      } else {
        setFormError(
          "We could not save your profile. Please try again."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  if (loadState === "loading") {
    return <LoadingScreen />;
  }

  if (loadState === "error") {
    return (
      <ErrorScreen
        message={loadError}
        onRetry={() => {
          void loadOnboardingData();
        }}
        onSignIn={() =>
          router.replace("/auth")
        }
      />
    );
  }

  return (
    <main className="min-h-[100dvh] overflow-x-hidden bg-[#f5f5ef] text-[#132118] dark:bg-[#07100b] dark:text-white">
      <div className="mx-auto min-h-[100dvh] w-full max-w-[1180px] px-4 pb-[max(40px,env(safe-area-inset-bottom))] pt-[max(16px,env(safe-area-inset-top))] sm:px-6 md:px-8 lg:px-10">
        {/* HEADER */}
        <header className="flex min-h-12 items-center justify-between">
          <button
            type="button"
            onClick={() =>
              router.replace("/")
            }
            aria-label="Go back"
            className="flex h-11 w-11 shrink-0 touch-manipulation items-center justify-center rounded-full border border-black/[0.06] bg-white text-[#183624] shadow-sm active:scale-95 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-white"
          >
            <ArrowLeft size={19} />
          </button>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-[#123f29] text-white dark:bg-[#91eab0] dark:text-[#082013]">
              <GraduationCap
                size={20}
              />
            </div>

            <div className="hidden sm:block">
              <p className="text-base font-black tracking-[-0.04em]">
                FUTAGO
              </p>

              <p className="text-[11px] text-black/40 dark:text-white/35">
                Know where to go.
              </p>
            </div>
          </div>
        </header>

        <div className="mx-auto mt-7 grid max-w-[1050px] gap-6 sm:mt-9 lg:mt-12 lg:grid-cols-[0.78fr_1.22fr] lg:gap-8">
          {/* INFORMATION PANEL */}
          <section className="relative overflow-hidden rounded-[28px] bg-[#103d27] p-6 text-white sm:rounded-[32px] sm:p-8 lg:min-h-[680px]">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 overflow-hidden"
            >
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#8ce6ad]/10 blur-3xl" />

              <div className="absolute -bottom-24 left-0 h-72 w-72 rounded-full bg-[#f0cb63]/10 blur-3xl" />

              <div className="absolute right-[12%] top-[18%] h-2.5 w-2.5 rounded-full bg-[#8ce6ad]/70" />

              <div className="absolute bottom-[22%] right-[18%] h-2 w-2 rounded-full bg-[#f0cb63]/80" />
            </div>

            <div className="relative z-10">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8ce6ad]">
                Student setup
              </p>

              <h1 className="mt-4 max-w-sm text-[36px] font-black leading-[0.98] tracking-[-0.055em] min-[390px]:text-[40px] sm:text-[48px]">
                Make campus feel like
                yours.
              </h1>

              <p className="mt-5 max-w-sm text-sm leading-6 text-white/55 sm:text-[15px]">
                These details help
                FUTAGO personalize your
                department, journey and
                campus directions.
              </p>
            </div>

            <div className="relative z-10 mt-8 grid gap-3 sm:grid-cols-2 lg:mt-16 lg:grid-cols-1">
              <FeatureItem
                icon={
                  <School size={18} />
                }
                title="Your department"
                description="Quickly find where your department is."
              />

              <FeatureItem
                icon={
                  <BookOpen
                    size={18}
                  />
                }
                title="Your journey"
                description="See the steps that matter to your level."
              />

              <FeatureItem
                icon={
                  <Check size={18} />
                }
                title="Your progress"
                description="Keep your FUTAGO journey organized."
              />
            </div>

            <div className="relative z-10 mt-8 rounded-[22px] border border-white/10 bg-white/[0.06] p-5 backdrop-blur-md lg:mt-16">
              <p className="text-sm font-bold">
                Your privacy matters.
              </p>

              <p className="mt-2 text-xs leading-5 text-white/50">
                FUTAGO only asks for
                student information that
                helps personalize your
                campus experience. It is
                not an official FUTA
                registration portal.
              </p>
            </div>
          </section>

          {/* FORM PANEL */}
          <section className="rounded-[28px] border border-black/[0.05] bg-white p-5 shadow-[0_22px_70px_rgba(23,55,34,0.07)] sm:rounded-[32px] sm:p-7 md:p-8 dark:border-white/[0.07] dark:bg-white/[0.04] dark:shadow-none">
            <div className="mb-7">
              <p className="text-sm font-bold text-[#2d7c4b] dark:text-[#8ce6ad]">
                Almost there
              </p>

              <h2 className="mt-2 text-[30px] font-black leading-tight tracking-[-0.045em] sm:text-[36px]">
                Set up your student
                profile.
              </h2>

              <p className="mt-2 max-w-lg text-sm leading-6 text-black/45 dark:text-white/40">
                Fill this once and
                FUTAGO can personalize
                the experience for you.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              <FieldLabel label="Full name">
                <InputShell
                  icon={
                    <UserRound
                      size={18}
                    />
                  }
                >
                  <input
                    type="text"
                    value={fullName}
                    onChange={(
                      event
                    ) => {
                      setFullName(
                        event.target.value
                      );

                      setFormError(
                        ""
                      );
                    }}
                    placeholder="Your full name"
                    autoComplete="name"
                    enterKeyHint="next"
                    className="h-full min-w-0 flex-1 bg-transparent text-base font-medium outline-none placeholder:text-black/25 dark:placeholder:text-white/25"
                  />
                </InputShell>
              </FieldLabel>

              <FieldLabel
                label="Matric number"
                helper="This becomes your FUTAGO Student ID."
              >
                <InputShell
                  icon={
                    <Hash size={18} />
                  }
                >
                  <input
                    type="text"
                    value={matricNumber}
                    onChange={(
                      event
                    ) => {
                      setMatricNumber(
                        event.target.value.toUpperCase()
                      );

                      setFormError(
                        ""
                      );
                    }}
                    placeholder="Enter your matric number"
                    autoCapitalize="characters"
                    spellCheck={false}
                    enterKeyHint="next"
                    className="h-full min-w-0 flex-1 bg-transparent text-base font-semibold uppercase outline-none placeholder:normal-case placeholder:font-medium placeholder:text-black/25 dark:placeholder:text-white/25"
                  />
                </InputShell>
              </FieldLabel>

              <div className="grid gap-5 md:grid-cols-2">
                <FieldLabel label="School">
                  <CustomDropdown
                    value={schoolId}
                    options={
                      schoolOptions
                    }
                    placeholder="Choose your school"
                    icon={
                      <School
                        size={18}
                      />
                    }
                    onChange={
                      handleSchoolChange
                    }
                  />
                </FieldLabel>

                <FieldLabel label="Department">
                  <CustomDropdown
                    value={
                      departmentId
                    }
                    options={
                      departmentOptions
                    }
                    placeholder={
                      schoolId
                        ? "Choose your department"
                        : "Choose school first"
                    }
                    icon={
                      <BookOpen
                        size={18}
                      />
                    }
                    disabled={
                      !schoolId
                    }
                    onChange={(
                      value
                    ) => {
                      setDepartmentId(
                        value
                      );

                      setFormError(
                        ""
                      );
                    }}
                  />
                </FieldLabel>
              </div>

              <FieldLabel label="Level">
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                  {levels.map(
                    (item) => {
                      const selected =
                        level === item;

                      return (
                        <button
                          key={
                            item
                          }
                          type="button"
                          onClick={() => {
                            setLevel(
                              item
                            );

                            setFormError(
                              ""
                            );
                          }}
                          className={`min-h-[48px] touch-manipulation rounded-[15px] border px-2 py-3 text-sm font-bold transition active:scale-[0.97] ${
                            selected
                              ? "border-[#226640] bg-[#173f2a] text-white shadow-sm dark:border-[#8ce6ad] dark:bg-[#8ce6ad] dark:text-[#082013]"
                              : "border-black/[0.06] bg-black/[0.025] text-black/50 dark:border-white/[0.07] dark:bg-white/[0.04] dark:text-white/45"
                          }`}
                        >
                          {item}L
                        </button>
                      );
                    }
                  )}
                </div>
              </FieldLabel>

              <FieldLabel label="Student status">
                <div className="grid gap-3 sm:grid-cols-2">
                  <StatusButton
                    active={
                      studentStatus ===
                      "fresher"
                    }
                    title="Fresher"
                    description="Newly admitted student"
                    onClick={() => {
                      setStudentStatus(
                        "fresher"
                      );

                      setFormError(
                        ""
                      );
                    }}
                  />

                  <StatusButton
                    active={
                      studentStatus ===
                      "returning"
                    }
                    title="Returning"
                    description="Already studying at FUTA"
                    onClick={() => {
                      setStudentStatus(
                        "returning"
                      );

                      setFormError(
                        ""
                      );
                    }}
                  />
                </div>
              </FieldLabel>

              {formError && (
                <div
                  role="alert"
                  className="rounded-[17px] border border-red-500/15 bg-red-500/[0.07] px-4 py-3 text-sm font-medium leading-5 text-red-700 dark:text-red-300"
                >
                  {formError}
                </div>
              )}

              <button
                type="submit"
                disabled={saving}
                className="flex min-h-[62px] w-full touch-manipulation items-center justify-between gap-4 rounded-[19px] bg-[#123f29] px-5 py-3 text-left text-white shadow-[0_16px_40px_rgba(18,63,41,0.18)] transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#8ce6ad] dark:text-[#082013]"
              >
                <div className="min-w-0">
                  <span className="block text-[15px] font-extrabold">
                    {saving
                      ? "Saving your profile..."
                      : "Finish setup"}
                  </span>

                  {!saving && (
                    <span className="mt-0.5 block text-xs text-white/55 dark:text-[#082013]/55">
                      Continue to your
                      FUTAGO home
                    </span>
                  )}
                </div>

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 dark:bg-[#082013]/10">
                  {saving ? (
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                  ) : (
                    <ArrowRight
                      size={18}
                    />
                  )}
                </div>
              </button>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}

function LoadingScreen() {
  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-[#f5f5ef] px-5 text-[#132118] dark:bg-[#07100b] dark:text-white">
      <div className="flex max-w-sm flex-col items-center text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-[#123f29] text-white shadow-[0_14px_34px_rgba(18,63,41,0.16)] dark:bg-[#8ce6ad] dark:text-[#082013]">
          <GraduationCap
            size={26}
          />
        </div>

        <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-black/50 dark:text-white/45">
          <Loader2
            size={17}
            className="animate-spin"
          />

          Preparing your FUTAGO
          profile
        </div>

        <p className="mt-2 text-xs leading-5 text-black/35 dark:text-white/30">
          This should only take a
          moment.
        </p>
      </div>
    </main>
  );
}

function ErrorScreen({
  message,
  onRetry,
  onSignIn,
}: {
  message: string;
  onRetry: () => void;
  onSignIn: () => void;
}) {
  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-[#f5f5ef] px-5 py-10 text-[#132118] dark:bg-[#07100b] dark:text-white">
      <div className="w-full max-w-[420px] rounded-[28px] border border-black/[0.06] bg-white p-6 text-center shadow-[0_22px_70px_rgba(23,55,34,0.08)] dark:border-white/[0.07] dark:bg-white/[0.04] dark:shadow-none sm:p-8">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[18px] bg-[#123f29] text-white dark:bg-[#8ce6ad] dark:text-[#082013]">
          <GraduationCap
            size={25}
          />
        </div>

        <h1 className="mt-5 text-2xl font-black tracking-[-0.04em]">
          We couldn&apos;t prepare
          your profile.
        </h1>

        <p className="mt-3 text-sm leading-6 text-black/50 dark:text-white/45">
          {message}
        </p>

        <button
          type="button"
          onClick={onRetry}
          className="mt-7 flex min-h-[54px] w-full touch-manipulation items-center justify-center gap-2 rounded-[17px] bg-[#123f29] px-4 text-sm font-extrabold text-white active:scale-[0.99] dark:bg-[#8ce6ad] dark:text-[#082013]"
        >
          <RefreshCw
            size={17}
          />

          Try again
        </button>

        <button
          type="button"
          onClick={onSignIn}
          className="mt-2 min-h-[48px] w-full touch-manipulation text-sm font-bold text-[#34714b] dark:text-[#91eab0]"
        >
          Back to sign in
        </button>
      </div>
    </main>
  );
}

function FeatureItem({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-4 rounded-[20px] border border-white/[0.08] bg-white/[0.05] p-4 backdrop-blur-md">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] bg-white/[0.08] text-[#91eab0]">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-sm font-bold">
          {title}
        </p>

        <p className="mt-1 text-xs leading-5 text-white/45">
          {description}
        </p>
      </div>
    </div>
  );
}

function FieldLabel({
  label,
  helper,
  children,
}: {
  label: string;
  helper?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0">
      <div className="mb-2">
        <label className="block text-sm font-semibold text-black/65 dark:text-white/65">
          {label}
        </label>

        {helper && (
          <p className="mt-1 text-xs text-black/35 dark:text-white/30">
            {helper}
          </p>
        )}
      </div>

      {children}
    </div>
  );
}

function InputShell({
  icon,
  children,
}: {
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex h-[58px] min-w-0 items-center gap-3 rounded-[18px] border border-black/[0.07] bg-[#fafaf7] px-4 transition focus-within:border-[#4aa269]/40 focus-within:ring-4 focus-within:ring-[#4aa269]/10 dark:border-white/[0.08] dark:bg-white/[0.04]">
      <span className="shrink-0 text-black/35 dark:text-white/35">
        {icon}
      </span>

      {children}
    </div>
  );
}

function CustomDropdown({
  value,
  options,
  placeholder,
  icon,
  disabled = false,
  onChange,
}: {
  value: string;
  options: DropdownOption[];
  placeholder: string;
  icon: ReactNode;
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] =
    useState(false);

  const containerRef =
    useRef<HTMLDivElement | null>(
      null
    );

  const selectedOption =
    options.find(
      (option) =>
        option.value === value
    );

  useEffect(() => {
    const handleOutsidePointer = (
      event: PointerEvent
    ) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(
          event.target as Node
        )
      ) {
        setOpen(false);
      }
    };

    document.addEventListener(
      "pointerdown",
      handleOutsidePointer
    );

    return () => {
      document.removeEventListener(
        "pointerdown",
        handleOutsidePointer
      );
    };
  }, []);

  useEffect(() => {
    if (disabled) {
      setOpen(false);
    }
  }, [disabled]);

  return (
    <div
      ref={containerRef}
      className="relative min-w-0"
    >
      <button
        type="button"
        disabled={disabled}
        aria-expanded={open}
        onClick={() => {
          if (!disabled) {
            setOpen(
              (current) =>
                !current
            );
          }
        }}
        className={`flex min-h-[58px] w-full touch-manipulation items-center gap-3 rounded-[18px] border px-4 text-left transition active:scale-[0.995] ${
          open
            ? "border-[#4aa269]/40 ring-4 ring-[#4aa269]/10"
            : "border-black/[0.07] dark:border-white/[0.08]"
        } ${
          disabled
            ? "cursor-not-allowed opacity-45"
            : ""
        } bg-[#fafaf7] dark:bg-[#0f1813]`}
      >
        <span className="shrink-0 text-black/35 dark:text-white/35">
          {icon}
        </span>

        <div className="min-w-0 flex-1">
          {selectedOption ? (
            <p className="truncate text-sm font-semibold text-[#162c1d] dark:text-white">
              {selectedOption.sublabel
                ? `${selectedOption.sublabel} — ${selectedOption.label}`
                : selectedOption.label}
            </p>
          ) : (
            <p className="truncate text-sm font-medium text-black/30 dark:text-white/30">
              {placeholder}
            </p>
          )}
        </div>

        <ChevronDown
          size={17}
          className={`shrink-0 text-black/35 transition-transform duration-200 dark:text-white/35 ${
            open
              ? "rotate-180"
              : ""
          }`}
        />
      </button>

      {open && !disabled && (
        <div className="absolute left-0 right-0 top-full z-[60] mt-2 overflow-hidden rounded-[20px] border border-black/[0.07] bg-white p-2 shadow-[0_24px_60px_rgba(18,45,28,0.16)] dark:border-white/[0.08] dark:bg-[#0d1711] dark:shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
          <div className="max-h-[280px] overscroll-contain overflow-y-auto">
            {options.length === 0 ? (
              <div className="px-4 py-5 text-sm text-black/40 dark:text-white/35">
                No options available
                yet.
              </div>
            ) : (
              options.map(
                (option) => {
                  const selected =
                    option.value ===
                    value;

                  return (
                    <button
                      key={
                        option.value
                      }
                      type="button"
                      onClick={() => {
                        onChange(
                          option.value
                        );

                        setOpen(
                          false
                        );
                      }}
                      className={`flex min-h-[52px] w-full touch-manipulation items-center justify-between gap-3 rounded-[15px] px-4 py-3 text-left active:scale-[0.995] ${
                        selected
                          ? "bg-[#edf8f0] dark:bg-[#8ce6ad]/10"
                          : "active:bg-black/[0.035] dark:active:bg-white/[0.05]"
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-[#162c1d] dark:text-white">
                          {
                            option.label
                          }
                        </p>

                        {option.sublabel && (
                          <p className="mt-0.5 text-xs font-medium text-[#43815a] dark:text-[#8ce6ad]">
                            {
                              option.sublabel
                            }
                          </p>
                        )}
                      </div>

                      {selected && (
                        <CheckCircle2
                          size={18}
                          className="shrink-0 text-[#2f7b4a] dark:text-[#8ce6ad]"
                        />
                      )}
                    </button>
                  );
                }
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StatusButton({
  active,
  title,
  description,
  onClick,
}: {
  active: boolean;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-[78px] w-full touch-manipulation items-center gap-3 rounded-[18px] border p-4 text-left transition active:scale-[0.99] ${
        active
          ? "border-[#2f8050]/30 bg-[#edf8f0] shadow-sm dark:border-[#8ce6ad]/25 dark:bg-[#8ce6ad]/10"
          : "border-black/[0.06] bg-black/[0.02] dark:border-white/[0.07] dark:bg-white/[0.035]"
      }`}
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] ${
          active
            ? "bg-[#173f2a] text-white dark:bg-[#8ce6ad] dark:text-[#082013]"
            : "bg-black/[0.04] text-black/35 dark:bg-white/[0.06] dark:text-white/35"
        }`}
      >
        {active ? (
          <Check size={18} />
        ) : (
          <GraduationCap
            size={18}
          />
        )}
      </div>

      <div className="min-w-0">
        <p className="text-sm font-bold">
          {title}
        </p>

        <p className="mt-1 text-xs leading-5 text-black/40 dark:text-white/35">
          {description}
        </p>
      </div>
    </button>
  );
}