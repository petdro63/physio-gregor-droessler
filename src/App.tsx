import { useEffect, useRef, useState } from "react";
import {
  Activity,
  ArrowDownToLine,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock3,
  ClipboardList,
  Download,
  Heart,
  HelpCircle,
  LayoutDashboard,
  Leaf,
  LogOut,
  Menu,
  Pause,
  Play,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  SkipForward,
  Sparkles,
  Timer,
  Users,
  X,
} from "lucide-react";
import taxonomy from "./exercise-taxonomy.json";
import rehabLibrary from "./rehab-evidence.json" with { type: "json" };
import brochures from "./brochure-library.json";
import { ConditionLibrary, RelaxationPage, ClinicalAssignmentFields, EvidenceCard } from "./ClinicalLibrary";
import { LicensedMedia, catalogMediaUrl } from "./LicensedMedia";
import { findExercises } from "./exercise-search";
import { ReferencePose, ReferencePositions, referencePose } from './ReferencePositions';
import { api, setCsrf } from "./api";
import { Illustration } from "./Illustration";
import { RealPersonVideo, REAL_PERSON_EXAMPLE } from "./RealPersonVideo";
import { OwnExerciseVideo, OWN_KNEE_TRANSCRIPT } from "./OwnExerciseVideo";
import type {
  Exercise,
  Overview,
  Plan,
  PlanItem,
  Practice,
  Session,
  User,
} from "./types";

const dayKey = (value = new Date()) =>
  value.toLocaleDateString("sv-SE", { timeZone: "Europe/Berlin" });
const displayDate = (value: string) =>
  new Date(value + "T12:00:00").toLocaleDateString("de-DE");
const weekdays = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
const statusLabel: Record<string, string> = {
  demo: "Demonstration",
  draft: "Entwurf",
  review: "In Prüfung",
  published: "Freigegeben",
  archived: "Archiviert",
  active: "Freigeschaltet",
  blocked: "Gesperrt",
  invited: "Freischaltung offen",
};
function errorMessage(e: unknown) {
  return e instanceof Error ? e.message : "Die Aktion ist fehlgeschlagen.";
}
function Empty({ title, body }: { title: string; body: string }) {
  return (
    <div className="empty">
      <Leaf size={35} />
      <h3>{title}</h3>
      <p>{body}</p>
    </div>
  );
}
function Modal({
  title,
  children,
  onClose,
  wide = false,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    d?.showModal();
    return () => d?.close();
  }, []);
  return (
    <dialog
      ref={ref}
      aria-label={title}
      className={wide ? "modal wide" : "modal"}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <div className="modal-title">
        <h2>{title}</h2>
        <button
          className="icon-button"
          aria-label="Schließen"
          onClick={onClose}
        >
          <X />
        </button>
      </div>
      {children}
    </dialog>
  );
}
function Brand() {
  return (
    <div className="brand">
      <span className="brand-symbol">
        <Activity size={29} />
      </span>
      <div>
        <strong>
          physio<span className="brand-dot">.</span>
        </strong>
        <small>GREGOR DRÖSSLER</small>
      </div>
    </div>
  );
}
function App() {
  const [session, setSession] = useState<Session | null>(null),
    [data, setData] = useState<Overview | null>(null),
    [page, setPage] = useState("home"),
    [patient, setPatient] = useState(""),
    [error, setError] = useState(""),
    [toast, setToast] = useState(""),
    [mobile, setMobile] = useState(false);
  const [detail, setDetail] = useState<Exercise | null>(null),
    [training, setTraining] = useState<Plan | null>(null),
    [planEditor, setPlanEditor] = useState(false),
    [exerciseEditor, setExerciseEditor] = useState<Exercise | "new" | null>(
      null,
    ),
    [coverage, setCoverage] = useState(false),
    [about, setAbout] = useState(false);
  const deepLinkOpened = useRef(false);
  const loadSession = async () => {
    const s = await api<Session>("/session");
    setCsrf(s.csrf);
    setSession(s);
    if (!s.user) setData(null);
    return s;
  };
  const load = async () => {
    const d = await api<Overview>(
      "/overview" + (patient ? "?patient=" + encodeURIComponent(patient) : ""),
    );
    setData(d);
  };
  useEffect(() => {
    loadSession().catch((e) => setError(errorMessage(e)));
  }, []);
  useEffect(() => {
    if (session?.user) load().catch((e) => setError(errorMessage(e)));
  }, [session?.user?.id, patient]);
  useEffect(() => {
    if (!data || deepLinkOpened.current) return;
    const exerciseId = new URLSearchParams(location.search).get("uebung");
    if (!exerciseId) return;
    const exercise = data.exercises.find((e) => e.id === exerciseId);
    if (exercise) {
      deepLinkOpened.current = true;
      setDetail(exercise);
    }
  }, [data]);
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(""), 5000);
      return () => clearTimeout(t);
    }
  }, [toast]);
  async function run(fn: () => Promise<unknown>, message = "Gespeichert") {
    try {
      await fn();
      await load();
      setToast(message);
    } catch (e) {
      setError(errorMessage(e));
    }
  }
  const logout = async () => {
    try {
      await api("/logout", "POST");
      await loadSession();
      setError("");
    } catch (e) {
      setError(errorMessage(e));
    }
  };
  const demoRole = async (role: string) => {
    try {
      await api("/demo", "POST", { role });
      setPatient("");
      setPage("home");
      await loadSession();
    } catch (e) {
      setError(errorMessage(e));
    }
  };
  if (!session)
    return (
      <div className="loading">
        <Activity className="pulse" />
        <p>{error || "Ihr Übungsplan wird geladen …"}</p>
      </div>
    );
  if (!session.user)
    return <Auth session={session} onLogin={loadSession} onDemo={demoRole} />;
  const staff = session.user.role !== "patient";
  const plan = data?.plans.find((p) => p.status === "active");
  const trainingAvailable =
    !!plan &&
    plan.start <= dayKey() &&
    plan.end >= dayKey() &&
    plan.days.includes(new Date(dayKey() + "T12:00:00").getDay());
  const todayEntries =
    data?.history.filter((h) => dayKey(new Date(h.created_at)) === dayKey()) ||
    [];
  const completed = new Set(
    todayEntries
      .filter(
        (h) =>
          h.outcome === "done" &&
          h.plan_id === plan?.id &&
          h.plan_version === plan?.version,
      )
      .map((h) => h.exercise_id),
  );
  const nav = [
    {
      id: "home",
      label: staff ? "Übersicht" : "Mein Trainingsplan",
      icon: LayoutDashboard,
    },
    {
      id: "library",
      label: staff ? "Übungsbibliothek" : "Meine Übungen",
      icon: BookOpen,
    },
    {
      id: "history",
      label: staff ? "Trainingsverlauf" : "Mein Verlauf",
      icon: Activity,
    },
    ...(staff ? [{ id: "rehab", label: "Krankheitsbilder & Evidenz", icon: BookOpen }] : []),
    { id: "relaxation", label: "Entspannung", icon: Leaf },
    ...(staff ? [{ id: "patients", label: "Patienten", icon: Users }] : []),
    { id: "help", label: "Praxis & Hilfe", icon: HelpCircle },
    ...(session.user.role === "admin"
      ? [{ id: "settings", label: "Praxisverwaltung", icon: Settings }]
      : []),
  ];
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        Zum Inhalt springen
      </a>
      {mobile && (
        <div className="sidebar-scrim" onClick={() => setMobile(false)} />
      )}
      <aside className={"sidebar " + (mobile ? "is-open" : "")}>
        <Brand />
        <div className="workspace-label">
          {staff ? "PRAXISBEREICH" : "IHR PATIENTENBEREICH"}
        </div>
        <nav aria-label="Hauptnavigation">
          {nav.map((n) => (
            <button
              key={n.id}
              className={page === n.id ? "nav-item active" : "nav-item"}
              aria-current={page === n.id ? "page" : undefined}
              onClick={() => {
                setPage(n.id);
                setMobile(false);
              }}
            >
              <n.icon size={20} />
              {n.label}
              {page === n.id && <span className="nav-dot" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-tip">
            <span className="mini-leaf">
              <Leaf size={21} />
            </span>
            <strong>Jeder Schritt zählt.</strong>
            <p>
              Ein bisschen Bewegung.
              <br />
              Ein gutes Gefühl.
            </p>
          </div>
          <button className="about-button" onClick={() => setAbout(true)}>
            <ShieldCheck size={15} /> Über die App <ChevronRight size={14} />
          </button>
          <div className="sidebar-user">
            <span className="avatar">
              {session.user.name
                .split(" ")
                .map((x) => x[0])
                .slice(0, 2)
                .join("")}
            </span>
            <div>
              <strong>{session.user.name}</strong>
              <small>{staff ? "Praxisteam" : "Mein persönlicher Zugang"}</small>
            </div>
            <button
              className="icon-button"
              onClick={logout}
              aria-label="Abmelden"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="icon-button mobile-menu"
              aria-label="Menü öffnen"
              onClick={() => setMobile(true)}
            >
              <Menu />
            </button>
            <span>{staff ? "Praxisteam" : "Mein Bereich"}</span>
            <ChevronRight size={14} />
            <strong>{nav.find((n) => n.id === page)?.label}</strong>
          </div>
          <div className="topbar-right">
            {session.demo && (
              <span className="demo-badge">
                <span />
                Demonstration
              </span>
            )}
            <span className="date-desktop">
              <CalendarDays size={16} />
              {new Date().toLocaleDateString("de-DE", {
                day: "2-digit",
                month: "long",
                year: "numeric",
                timeZone: "Europe/Berlin",
              })}
            </span>
            <span className="avatar small">
              {session.user.name
                .split(" ")
                .map((x) => x[0])
                .slice(0, 2)
                .join("")}
            </span>
          </div>
        </header>
        <main id="main" className="content">
          {error && (
            <div role="alert" className="alert error">
              {error}
              <button
                onClick={() => setError("")}
                aria-label="Fehlermeldung schließen"
              >
                <X size={17} />
              </button>
            </div>
          )}
          {session.demo && (
            <div className="demo-strip">
              <span>
                <Sparkles size={15} /> Vorschau mit erfundenen Patientenprofilen
                und ungeprüften Übungsbeispielen.
              </span>
              <select
                aria-label="Demoansicht wechseln"
                value={session.user.role}
                onChange={(e) => demoRole(e.target.value)}
              >
                <option value="patient">Patientenansicht</option>
                <option value="admin">Praxisansicht</option>
                <option value="therapist">Therapeutenansicht</option>
              </select>
            </div>
          )}
          {!data ? (
            <div className="loading">
              <Activity className="pulse" /> Einen Moment …
            </div>
          ) : (
            <>
              {staff && page !== "settings" && page !== "patients" && (
                <div className="patient-picker">
                  <label>
                    Patient auswählen{" "}
                    <select
                      value={data.selectedPatient?.id || ""}
                      onChange={(e) => setPatient(e.target.value)}
                    >
                      {data.patients.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              )}
              {page === "home" && (
                <>
                  <div className="page-heading">
                    <div>
                      <div className="eyebrow">BEWEGUNG, DIE GUTTUT</div>
                      <h1>
                        {staff
                          ? "Gemeinsam Fortschritte machen."
                          : `Hallo ${session.user.name.split(" ")[0]}, schön, dass Sie da sind.`}
                      </h1>
                      <p>
                        {staff
                          ? "Individuell begleiten. Einfach in Bewegung bleiben."
                          : "Ihr persönlicher Übungsplan – Schritt für Schritt zu mehr Wohlbefinden."}
                      </p>
                    </div>
                    {staff && (
                      <button
                        className="button primary"
                        disabled={!data.selectedPatient}
                        onClick={() => setPlanEditor(true)}
                      >
                        <Plus size={18} /> Trainingsplan erstellen
                      </button>
                    )}
                  </div>
                  {plan ? (
                    <>
                      <div className="hero-grid">
                        <section className="hero-card">
                          <div className="hero-text">
                            <span className="pill light">
                              <span className="live-dot" /> Ihr aktueller
                              Trainingsplan
                            </span>
                            <h2>{plan.title}</h2>
                            <p>
                              Ein guter Moment, etwas für sich zu tun.
                              <br />
                              Ihr Training wartet schon auf Sie.
                            </p>
                            <div className="hero-meta">
                              <span>
                                <BookOpen size={16} />
                                {plan.items.length} Übungen
                              </span>
                              <span>
                                <Clock3 size={16} />
                                ca.{" "}
                                {plan.items.reduce(
                                  (s, i) => s + i.exercise.duration,
                                  0,
                                )}{" "}
                                Minuten
                              </span>
                            </div>
                            <button
                              className="button primary"
                              onClick={() => setTraining(plan)}
                              disabled={
                                staff ||
                                !plan.items.length ||
                                !trainingAvailable
                              }
                            >
                              <Play size={17} fill="currentColor" />
                              {staff
                                ? "Training in Patientenansicht"
                                : trainingAvailable
                                  ? "Training starten"
                                  : "Heute kein Training geplant"}
                              <ArrowRight size={17} />
                            </button>
                          </div>
                          <div className="hero-art">
                            <div className="hero-circle" />
                            <Illustration kind="schulterkreisen" phase={1} />
                            <div className="hero-art-label">
                              <span>
                                <Check size={14} />
                              </span>{" "}
                              In Ihrem eigenen Tempo
                            </div>
                          </div>
                        </section>
                        <section className="goal-card">
                          <div className="section-title">
                            <h3>Heute für mich</h3>
                            <span className="soft-icon">
                              <Heart size={18} />
                            </span>
                          </div>
                          <div
                            className="progress-ring"
                            style={
                              {
                                "--progress": `${plan.items.length ? Math.min(100, (completed.size / plan.items.length) * 100) : 0}%`,
                              } as React.CSSProperties
                            }
                          >
                            <div>
                              <strong>
                                {completed.size}
                                <span> / {plan.items.length}</span>
                              </strong>
                              <small>Übungen geschafft</small>
                            </div>
                          </div>
                          <p>
                            {completed.size === plan.items.length
                              ? "Geschafft! Schön, dass Sie sich Zeit genommen haben."
                              : "Jede Bewegung ist ein kleiner Fortschritt."}
                          </p>
                          <div className="goal-caption">
                            <Leaf size={15} /> Ganz ohne Leistungsdruck
                          </div>
                        </section>
                      </div>
                      <div className="section-heading">
                        <div>
                          <h2>
                            {trainingAvailable
                              ? "Ihre Übungen für heute"
                              : "Ihre persönlichen Übungen"}
                          </h2>
                          <p>
                            {plan.focus} <span className="middle-dot">·</span>{" "}
                            Individuell für Sie zusammengestellt
                          </p>
                        </div>
                        <a
                          className="text-button"
                          href={`/api/plans/${plan.id}/pdf`}
                        >
                          <Download size={16} /> Plan als PDF
                        </a>
                      </div>
                      <div className="exercise-grid">
                        {plan.items.map((item, i) => (
                          <ExerciseCard
                            key={item.exerciseId}
                            exercise={item.exercise}
                            item={item}
                            index={i}
                            done={completed.has(item.exerciseId)}
                            onClick={() => setDetail(item.exercise)}
                          />
                        ))}
                      </div>
                      <div className="bottom-grid">
                        <section className="week-card">
                          <div className="section-title">
                            <div>
                              <h3>Ihre Woche in Bewegung</h3>
                              <p>
                                Auch kleine Schritte machen einen Unterschied.
                              </p>
                            </div>
                            <CalendarDays size={19} />
                          </div>
                          <Week history={data.history} />
                        </section>
                        <section className="therapist-card">
                          <div className="therapist-avatar">GD</div>
                          <div>
                            <div className="eyebrow">AN IHRER SEITE</div>
                            <h3>{plan.therapistName}</h3>
                            <p>
                              {data.practice.message ||
                                "Ihr Praxisteam begleitet Sie."}
                            </p>
                            <button
                              className="text-button"
                              onClick={() => setPage("help")}
                            >
                              Zur Praxis <ArrowRight size={15} />
                            </button>
                          </div>
                          <span className="quote">“</span>
                        </section>
                      </div>
                      <p className="quiet-note">
                        <ShieldCheck size={15} />
                        {data.practice.replyInfo}
                      </p>
                    </>
                  ) : (
                    <Empty
                      title="Hier entsteht Ihr persönlicher Plan"
                      body="Ihr Praxisteam stellt Ihre Übungen zusammen. Sobald ein Plan freigegeben ist, finden Sie ihn hier."
                    />
                  )}
                </>
              )}
              {page === "library" && (
                <Library
                  exercises={data.exercises}
                  staff={staff}
                  onSelect={setDetail}
                  onCreate={() => setExerciseEditor("new")}
                  onCoverage={() => setCoverage(true)}
                />
              )}
              {page === "rehab" && staff && <ConditionLibrary exercises={data.exercises} onSelect={setDetail} />}
              {page === "relaxation" && <RelaxationPage exercises={data.exercises} staff={staff} onSelect={setDetail} />}
              {page === "history" && <History data={data} />}
              {page === "patients" && (
                <Patients
                  data={data}
                  role={session.user.role}
                  run={run}
                  onSelect={(id) => {
                    setPatient(id);
                    setPage("home");
                  }}
                />
              )}
              {page === "help" && (
                <Help practice={data.practice} user={session.user} />
              )}
              {page === "settings" && (
                <SettingsPage practice={data.practice} run={run} />
              )}
            </>
          )}
          <footer className="footer">
            <span>
              Physiopraxis Gregor Drößler <span className="middle-dot">·</span>{" "}
              Leinefelde
            </span>
            <span>
              <ShieldCheck size={13} /> Ihr persönlicher, geschützter Bereich
            </span>
          </footer>
        </main>
      </div>
      {toast && (
        <div className="toast" role="status">
          <CheckCircle2 size={19} />
          {toast}
        </div>
      )}
      {detail && (
        <ExerciseDetail
          key={detail.id}
          exercise={detail}
          familyVariants={(data?.exercises || []).filter(e => detail.familyId && e.familyId === detail.familyId)}
          onSelectVariant={setDetail}
          demo={session.demo}
          staff={staff}
          onClose={() => setDetail(null)}
          onEdit={() => {
            setExerciseEditor(detail);
            setDetail(null);
          }}
          onStatus={(status) =>
            run(async () => {
              await api(`/exercises/${detail.id}/status`, "POST", { status });
              setDetail(null);
            }, "Übungsstatus aktualisiert")
          }
        />
      )}
      {training && (
        <Training
          plan={training}
          demo={session.demo}
          onClose={() => setTraining(null)}
          onSave={async (body) => {
            await api("/training", "POST", body);
            await load();
          }}
        />
      )}
      {planEditor && data && (
        <PlanEditor
          data={data}
          onClose={() => setPlanEditor(false)}
          onSave={(p) =>
            run(async () => {
              await api(
                `/patients/${data.selectedPatient!.id}/plans`,
                "POST",
                p,
              );
              setPlanEditor(false);
            }, "Trainingsplan gespeichert")
          }
        />
      )}
      {exerciseEditor && (
        <ExerciseEditor
          initial={exerciseEditor}
          onClose={() => setExerciseEditor(null)}
          onSave={(p) =>
            run(async () => {
              await api(
                exerciseEditor === "new"
                  ? "/exercises"
                  : `/exercises/${exerciseEditor.id}`,
                exerciseEditor === "new" ? "POST" : "PUT",
                p,
              );
              setExerciseEditor(null);
            }, "Übung als Entwurf gespeichert")
          }
        />
      )}
      {coverage && data && (
        <Modal
          title="Abdeckung der Übungsbibliothek"
          onClose={() => setCoverage(false)}
          wide
        >
          <p className="muted">
            Ziel: alle für die Praxis relevanten gängigen Heimübungen. Die
            Vorschau ersetzt keine geprüfte Bibliothek.
          </p>
          <div className="coverage-list">
            {data.coverage.map((c) => (
              <div key={c.key}>
                <span>{c.name}</span>
                <span>
                  {c.count} Beispiele <b>{c.published} freigegeben</b>
                </span>
              </div>
            ))}
          </div>
          <p className="notice">
            Offen sind fachliche Prüfung, geeignete Originalaufnahmen und
            Rechtefreigaben. Spezialisierte Module werden gesondert freigegeben.
          </p>
        </Modal>
      )}
      {about && (
        <Modal title="Über die App" onClose={() => setAbout(false)}>
          <Brand />
          <p>Physio Gregor Drößler – Mein Übungsplan</p>
          <dl className="info-list">
            <dt>Version</dt>
            <dd>{session.version}</dd>
            <dt>Versionsdatum</dt>
            <dd>{displayDate(session.date)}</dd>
            <dt>Zeitzone</dt>
            <dd>Europe/Berlin</dd>
            <dt>Betriebsart</dt>
            <dd>{session.demo ? "Lokale Demonstration" : "Praxisbetrieb"}</dd>
          </dl>
          <p className="notice">
            {session.demo
              ? "Die Patientenprofile sind erfunden. Die Übungen sind ungeprüfte Demonstrationsinhalte."
              : "Die Übungen werden individuell durch die Praxis ausgewählt."}
          </p>
        </Modal>
      )}
    </div>
  );
}

function Auth({
  session,
  onLogin,
  onDemo,
}: {
  session: Session;
  onLogin: () => Promise<unknown>;
  onDemo: (role: string) => Promise<void>;
}) {
  const [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [mfa, setMfa] = useState(false),
    [qr, setQr] = useState(""),
    [secret, setSecret] = useState(""),
    [code, setCode] = useState(""),
    [invite, setInvite] = useState<{ name: string } | null>(null),
    [accepted, setAccepted] = useState(false);
  const token = new URLSearchParams(location.search).get("einladung");
  useEffect(() => {
    if (token)
      api("/invitation?token=" + encodeURIComponent(token))
        .then(setInvite)
        .catch((e) => setError(errorMessage(e)));
  }, [token]);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (token && !accepted) {
        await api("/invitation/accept", "POST", { token, password });
        setAccepted(true);
        history.replaceState(null, "", "/");
      } else if (mfa) {
        await api("/mfa/verify", "POST", { code });
        await onLogin();
      } else {
        const result = await api("/login", "POST", { email, password });
        setCsrf(result.csrf);
        if (result.mfa) {
          setMfa(true);
          if (result.enroll) {
            const e = await api("/mfa/enroll");
            setQr(e.qr);
            setSecret(e.secret);
          }
        } else await onLogin();
      }
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="auth-page">
      <section className="auth-story">
        <Brand />
        <div className="auth-story-text">
          <span className="pill light">
            <Leaf size={15} /> Für Ihre Gesundheit in Bewegung
          </span>
          <h1>
            Gut begleitet.
            <br />
            Auch zu Hause.
          </h1>
          <p>
            Ihr persönlicher Übungsplan aus der
            <br />
            Physiopraxis Gregor Drößler in Leinefelde.
          </p>
        </div>
        <div className="auth-illustration">
          <Illustration phase={1} />
        </div>
        <div className="auth-story-bottom">
          <ShieldCheck size={18} /> Persönlich ausgewählt. Verständlich
          angeleitet.
        </div>
      </section>
      <section className="auth-form-panel">
        <div className="auth-form">
          <div className="eyebrow">WILLKOMMEN IN IHREM PATIENTENBEREICH</div>
          <h2>
            {accepted
              ? "Zugang eingerichtet"
              : token
                ? "Ihre persönliche Einladung"
                : mfa
                  ? "Sicher anmelden"
                  : "Schön, dass Sie da sind."}
          </h2>
          <p className="muted">
            {accepted
              ? "Sie können sich nach der Freischaltung durch die Praxis anmelden."
              : token
                ? invite
                  ? `Hallo ${invite.name}, richten Sie Ihren Zugang ein.`
                  : "Die Einladung wird geprüft."
                : mfa
                  ? "Geben Sie den aktuellen Code Ihrer Authenticator-App ein."
                  : "Melden Sie sich mit Ihrem freigeschalteten Zugang an."}
          </p>
          {error && (
            <div className="alert error" role="alert">
              {error}
            </div>
          )}
          {accepted ? (
            <button
              className="button primary full"
              onClick={() => {
                location.href = "/";
              }}
            >
              Zur Anmeldung <ArrowRight size={17} />
            </button>
          ) : (
            <form onSubmit={submit}>
              {!token && !mfa && (
                <label>
                  E-Mail-Adresse
                  <input
                    autoComplete="username"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@beispiel.de"
                  />
                </label>
              )}
              {!mfa && (
                <label>
                  {token ? "Passwort festlegen" : "Passwort"}
                  <input
                    type="password"
                    autoComplete={token ? "new-password" : "current-password"}
                    minLength={token ? 12 : 1}
                    maxLength={72}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  {token && <small>Mindestens 12 Zeichen.</small>}
                </label>
              )}
              {mfa && (
                <>
                  {qr && (
                    <div className="mfa-setup">
                      <img src={qr} alt="QR-Code für die Authenticator-App" />
                      <p>
                        QR-Code scannen oder Einrichtungsschlüssel manuell
                        eingeben:
                      </p>
                      <code>{secret}</code>
                    </div>
                  )}
                  <label>
                    Bestätigungscode
                    <input
                      inputMode="numeric"
                      pattern="[0-9]{6}"
                      maxLength={6}
                      required
                      autoComplete="one-time-code"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                    />
                  </label>
                </>
              )}
              <button
                className="button primary full"
                disabled={busy || (!!token && !invite)}
              >
                {busy
                  ? "Einen Moment …"
                  : token
                    ? "Zugang einrichten"
                    : mfa
                      ? "Code bestätigen"
                      : "Anmelden"}
                <ArrowRight size={17} />
              </button>
            </form>
          )}
          {!token && (
            <p className="auth-help">
              <HelpCircle size={16} /> Noch keinen Zugang oder Passwort
              vergessen?
              <br />
              Bitte wenden Sie sich an Ihre Praxis.
            </p>
          )}
          {session.demo && !token && (
            <div className="demo-entry">
              <span>LOKALE VORSCHAU</span>
              <p>
                Entdecken Sie die App mit erfundenen Beispieldaten. Die Inhalte
                sind nicht zur Behandlung freigegeben.
              </p>
              <button
                className="button secondary full"
                onClick={() => onDemo("patient")}
              >
                Patientenansicht entdecken <ArrowRight size={17} />
              </button>
              <button className="text-button" onClick={() => onDemo("admin")}>
                Praxisansicht öffnen <ChevronRight size={15} />
              </button>
            </div>
          )}
          <div className="auth-version">
            Version {session.version} · {displayDate(session.date)}
          </div>
        </div>
      </section>
    </div>
  );
}

function ExerciseCard({
  exercise: e,
  item,
  index,
  done,
  onClick,
}: {
  exercise: Exercise;
  item?: PlanItem;
  index?: number;
  done?: boolean;
  onClick: () => void;
}) {
  return (
    <button className="exercise-card" onClick={onClick}>
      <div className={"exercise-art art-" + ((index ?? 0) % 3)}>
        {referencePose(e) ? <ReferencePose exercise={e}/> : e.catalogMedia.length ? (
          <img src={catalogMediaUrl(e,e.catalogMedia[0],"start.png")} alt={`${e.title} – allgemeine CDC-Bewegungsdarstellung`} />
        ) : e.demo ? (
          <Illustration kind={e.id} phase={(index ?? 0) % 2} />
        ) : e.mediaDetails?.some((m) => m.kind === "image") ? (
          <img
            src={
              "/api/media/" + e.mediaDetails.find((m) => m.kind === "image")!.id
            }
            alt={e.title}
          />
        ) : (
          <div className="catalog-placeholder"><BookOpen size={42} /><strong>Übungsentwurf</strong><span>{e.equipment} · {e.position}</span><small>Bilder und Video noch offen</small></div>
        )}
        <span className="card-region">{e.region}</span>
        {done && (
          <span className="done-chip">
            <Check size={13} /> Geschafft
          </span>
        )}
        {(e.demo || e.mediaDetails?.some(m => m.kind === "video")) && <span className="play-bubble">
          <Play size={18} fill="currentColor" />
        </span>}
      </div>
      <div className="exercise-copy">
        <div className="exercise-goal">
          {e.goal} <span>·</span> {e.difficulty}
        </div>
        <h3>{e.title}</h3>
        <p>{e.subtitle}</p>
        <p className="exercise-anatomy">{e.trainingTypes.map(t => t === "Kraft" ? "Kräftigung" : t).join(" · ")}<br />{e.joints.join(" · ")}</p>
        <div className="exercise-bottom">
          <span>
            {item ? (
              <>
                <ClipboardList size={15} />
                {item.sets} Sätze × {item.reps} Wdh.
              </>
            ) : (
              <>
                <Clock3 size={15} />
                ca. {e.duration} Min.
              </>
            )}
          </span>
          <span className="circle-arrow">
            <ArrowRight size={17} />
          </span>
        </div>
        {!item && (
          <span className={"status small-status " + e.status}>
            {statusLabel[e.status]}
          </span>
        )}
      </div>
    </button>
  );
}
function Week({ history: entries }: { history: Overview["history"] }) {
  const today = new Date();
  const offset = (today.getDay() + 6) % 7;
  const dates = weekdays.map((label, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - offset + i);
    const done = entries.some(
      (e) =>
        e.outcome === "done" && dayKey(new Date(e.created_at)) === dayKey(d),
    );
    return { label, date: d, done };
  });
  return (
    <div className="week-days">
      {dates.map((d) => (
        <div
          key={d.label}
          className={
            dayKey(d.date) === dayKey() ? "week-day today" : "week-day"
          }
        >
          <span>{d.label}</span>
          <div className={d.done ? "day-circle done" : "day-circle"}>
            {d.done ? <Check size={18} /> : d.date.getDate()}
          </div>
          <span className={d.done ? "day-dot checked" : "day-dot"} />
        </div>
      ))}
    </div>
  );
}
function Library({
  exercises,
  staff,
  onSelect,
  onCreate,
  onCoverage,
}: {
  exercises: Exercise[];
  staff: boolean;
  onSelect: (e: Exercise) => void;
  onCreate: () => void;
  onCoverage: () => void;
}) {
  const [search, setSearch] = useState(""),
    [region, setRegion] = useState(""),
    [goal, setGoal] = useState(""),
    [equipment, setEquipment] = useState(""),
    [difficulty, setDifficulty] = useState(""),
    [position, setPosition] = useState(""),
    [trainingType, setTrainingType] = useState(""),
    [joint, setJoint] = useState(""),
    [muscle, setMuscle] = useState(""),
    [sort, setSort] = useState("joint"),
    [condition, setCondition] = useState(""),
    [method, setMethod] = useState(""),
    [brochure, setBrochure] = useState("");
  const [page, setPage] = useState(1);
  const [groupFamilies, setGroupFamilies] = useState(true);
  const filtered = findExercises(exercises, { search, region, goal, equipment, difficulty, position, trainingType, joint, muscle, sort, condition, method, brochure });
  const representatives = new Map<string, string>();
  for (const exercise of filtered) if (exercise.familyId) {
    if (!representatives.has(exercise.familyId) || /-(aktiv|dynamisch|frei|schulterbreit|beidarm|beidhaendig)$/.test(exercise.id)) representatives.set(exercise.familyId, exercise.id);
  }
  const visible = groupFamilies ? filtered.filter(e => !e.familyId || representatives.get(e.familyId) === e.id) : filtered;
  const pageSize = 24;
  const pages = Math.max(1, Math.ceil(visible.length / pageSize));
  const currentPage = Math.min(page, pages);
  useEffect(() => { setPage(1); }, [search, region, goal, equipment, difficulty, position, trainingType, joint, muscle, sort, condition, method, brochure, groupFamilies]);
  const resetFilters = () => {
    setSearch(""); setRegion(""); setGoal(""); setEquipment(""); setDifficulty("");
    setPosition(""); setTrainingType(""); setJoint(""); setMuscle(""); setCondition(""); setMethod(""); setBrochure("");
  };
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">VERSTÄNDLICH ANGELEITET</div>
          <h1>
            {staff
              ? "Die passende Bewegung finden."
              : "Ihre Übungen, einfach erklärt."}
          </h1>
          <p>
            {staff
              ? "Übungen auswählen, Inhalte pflegen und individuell einsetzen."
              : "Hier finden Sie alle Übungen aus Ihrem persönlichen Plan."}
          </p>
        </div>
        {staff && (
          <button className="button primary" onClick={onCreate}>
            <Plus size={18} /> Übung anlegen
          </button>
        )}
      </div>
      {staff && <section className="catalog-summary panel" aria-label="Gelenkabdeckung">
        <h2>Nach Gelenk einsteigen</h2>
        <p>Neue Bibliothek: 150 Grundmuster mit 1.200 Variantenentwürfen. Jede Variante hat eine eigene Anleitung; fachliche Freigaben stehen noch aus.</p>
        <div className="joint-shortcuts">{["Schultergelenk", "Ellenbogengelenk", "Handgelenk", "Hüftgelenk", "Kniegelenk", "Sprunggelenk"].map(name => <button type="button" key={name} className={joint === name ? "button primary" : "button secondary"} onClick={() => { resetFilters(); setJoint(name); }}><strong>{name}</strong><span>{exercises.filter(e => e.joints.includes(name)).length} Einträge</span></button>)}</div>
      </section>}
      <div className="library-toolbar">
        <label className="search-input">
          <Search size={19} />
          <input
            aria-label="Übungen durchsuchen"
            placeholder="Übung, Gelenk oder Muskel suchen …"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <div className="training-type-tabs" role="group" aria-label="Trainingsart auswählen">
          {["", "Mobilisation", "Kraft", "Dehnung"].map(type => (
            <button key={type} type="button" className={trainingType === type ? "button primary" : "button secondary"} aria-pressed={trainingType === type} onClick={() => setTrainingType(type)}>
              {type === "" ? "Alle Übungen" : type === "Kraft" ? "Kräftigung" : type}
            </button>
          ))}
        </div>
        <div className="filter-row">
          <select aria-label="Alle Krankheitsbilder" value={condition} onChange={e => setCondition(e.target.value)}><option value="">Alle Krankheitsbilder</option>{rehabLibrary.conditions.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
          <select aria-label="Alle Methoden" value={method} onChange={e => setMethod(e.target.value)}><option value="">Alle Methoden</option><option value="PIR">Postisometrische Relaxation (PIR)</option><option value="Kieferentspannung">Kieferentspannung</option></select>
          <select aria-label="Alle Broschüren" value={brochure} onChange={e => setBrochure(e.target.value)}><option value="">Alle Broschüren</option>{brochures.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}</select>
          {[
            { label: "Alle Trainingsarten", value: trainingType, set: setTrainingType, options: taxonomy.trainingTypes },
            { label: "Alle Gelenke", value: joint, set: setJoint, options: [...new Set(exercises.flatMap(e => e.joints))].sort((a,b) => a.localeCompare(b,"de")) },
            { label: "Alle Zielmuskeln (Kräftigung)", value: muscle, set: setMuscle, options: [...new Set(exercises.filter(e => e.trainingTypes.includes("Kraft")).flatMap(e => e.strengthMuscles))].sort((a,b) => a.localeCompare(b,"de")) },
          ].map(f => (
            <select key={f.label} aria-label={f.label} value={f.value} onChange={e => f.set(e.target.value)}>
              <option value="">{f.label}</option>
              {f.options.map(option => <option key={option}>{option}</option>)}
            </select>
          ))}
          <select aria-label="Übungen sortieren" value={sort} onChange={e => setSort(e.target.value)}>
            <option value="joint">Nach Gelenk sortieren</option>
            <option value="type">Nach Trainingsart sortieren</option>
            <option value="title">Nach Name sortieren</option>
          </select>
          {[
            {
              label: "Alle Körperregionen",
              value: region,
              set: setRegion,
              field: "region",
            },
            {
              label: "Alle Trainingsziele",
              value: goal,
              set: setGoal,
              field: "goal",
            },
            {
              label: "Alle Hilfsmittel",
              value: equipment,
              set: setEquipment,
              field: "equipment",
            },
            {
              label: "Alle Schwierigkeiten",
              value: difficulty,
              set: setDifficulty,
              field: "difficulty",
            },
            {
              label: "Alle Ausgangsstellungen",
              value: position,
              set: setPosition,
              field: "position",
            },
          ].map((f) => (
            <select
              key={f.field}
              aria-label={f.label}
              value={f.value}
              onChange={(e) => f.set(e.target.value)}
            >
              <option value="">{f.label}</option>
              {[
                ...new Set(
                  exercises.map((e) => String(e[f.field as keyof Exercise])),
                ),
              ].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          ))}
        </div>
        <button type="button" className="text-button" onClick={resetFilters}>Filter zurücksetzen</button>
      </div>
      <div className="section-heading">
        <p>
          {filtered.length} passende Einträge{groupFamilies ? ` · ${visible.length} Grundmuster / Einzelübungen` : " einschließlich Varianten"}
        </p>
        <label className="family-toggle"><input type="checkbox" checked={groupFamilies} onChange={e => setGroupFamilies(e.target.checked)} /> Varianten je Grundmuster zusammenfassen</label>
        {staff && (
          <button className="text-button" onClick={onCoverage}>
            Bibliotheksabdeckung ansehen <ArrowRight size={15} />
          </button>
        )}
      </div>
      {filtered.length ? (
        <div className="exercise-grid library-grid">
          {visible.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((e, i) => (
            <ExerciseCard
              key={e.id}
              exercise={e}
              index={i}
              onClick={() => onSelect(e)}
            />
          ))}
        </div>
      ) : (
        <Empty
          title="Keine passenden Übungen"
          body="Passen Sie die Suche oder die Filter an."
        />
      )}
      {visible.length > pageSize && <nav className="catalog-pagination" aria-label="Seiten der Übungsbibliothek"><button className="button secondary" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>Zurück</button><span>Seite {currentPage} von {pages} · {visible.length} Ergebnisse</span><button className="button secondary" disabled={currentPage === pages} onClick={() => setPage(currentPage + 1)}>Weiter</button></nav>}
    </>
  );
}

function ExerciseDetail({
  exercise: e,
  familyVariants,
  onSelectVariant,
  demo,
  staff,
  onClose,
  onEdit,
  onStatus,
}: {
  exercise: Exercise;
  familyVariants: Exercise[];
  onSelectVariant: (exercise: Exercise) => void;
  demo: boolean;
  staff: boolean;
  onClose: () => void;
  onEdit: () => void;
  onStatus: (s: string) => void;
}) {
  const kneeExample = demo && e.demo && e.id === REAL_PERSON_EXAMPLE.exerciseId;
  const requestedVideo = new URLSearchParams(location.search).get("video");
  const [phase, setPhase] = useState(0),
    [video, setVideo] = useState(
      kneeExample && ["menschen", "eigenes"].includes(requestedVideo || ""),
    ),
    [videoSource, setVideoSource] = useState(
      requestedVideo === "menschen" ? "external" : "own",
    ),
    [mediaInfo, setMediaInfo] = useState<{ id: string; kind: string }[]>([]);
  useEffect(() => {
    if (e.media.length)
      Promise.all(
        e.media.map(async (id) => {
          const r = await fetch("/api/media/" + id, { method: "HEAD" });
          return {
            id,
            kind: r.headers.get("Content-Type")?.startsWith("video")
              ? "video"
              : r.headers.get("Content-Type")?.startsWith("text/vtt")
                ? "captions"
                : "image",
          };
        }),
      ).then(setMediaInfo);
  }, [e.id]);
  const actualVideo = mediaInfo.find((m) => m.kind === "video");
  return (
    <Modal title={e.title} onClose={onClose} wide>
      <div
        className={
          kneeExample && video
            ? "detail-layout real-person-layout"
            : "detail-layout"
        }
      >
        <div>
          {referencePose(e) ? <ReferencePositions exercise={e}/> : e.catalogMedia.length ? <LicensedMedia exercise={e} /> : <>
          <div
            className={
              kneeExample && video ? "detail-art real-video-art" : "detail-art"
            }
          >
            {video ? (
              kneeExample && videoSource === "own" ? (
                <OwnExerciseVideo />
              ) : kneeExample ? (
                <RealPersonVideo />
              ) : e.demo && demo ? (
                <video
                  autoPlay
                  controls
                  loop
                  playsInline
                  src={`/api/demo-media/${e.id}/movement.mp4`}
                >
                  <track
                    kind="captions"
                    src={`/api/demo-media/${e.id}/captions.vtt`}
                    srcLang="de"
                    label="Deutsch"
                    default
                  />
                </video>
              ) : actualVideo ? (
                <video
                  autoPlay
                  controls
                  loop
                  playsInline
                  src={"/api/media/" + actualVideo.id}
                >
                  {mediaInfo.some((m) => m.kind === "captions") && (
                    <track
                      kind="captions"
                      src={
                        "/api/media/" +
                        mediaInfo.find((m) => m.kind === "captions")!.id
                      }
                      srcLang="de"
                      label="Deutsch"
                      default
                    />
                  )}
                </video>
              ) : (
                <p>Video noch nicht hinterlegt.</p>
              )
            ) : e.demo ? (
              <Illustration kind={e.id} phase={phase} />
            ) : mediaInfo.filter((m) => m.kind === "image").length ? (
              <img
                src={
                  "/api/media/" +
                  mediaInfo.filter((m) => m.kind === "image")[
                    phase % mediaInfo.filter((m) => m.kind === "image").length
                  ].id
                }
                alt={e.title}
              />
            ) : (
              <p>Bilder noch nicht hinterlegt.</p>
            )}
          </div>
          <div className="detail-controls">
            <button
              className={"button " + (!video ? "primary" : "secondary")}
              onClick={() => {
                setVideo(false);
                setPhase(phase + 1);
              }}
            >
              Bilder · Phase {phase + 1}
            </button>
            <button
              className={"button " + (video ? "primary" : "secondary")}
              onClick={() => {
                setVideo(true);
                if (kneeExample) setVideoSource("own");
              }}
            >
              <Play size={16} />
              {kneeExample ? "Eigenes Video (Deutsch)" : "Video ansehen"}
            </button>
          </div>
          </>}
          {kneeExample && (
            <button
              className="text-button"
              onClick={() => {
                setVideo(true);
                setVideoSource("external");
              }}
            >
              Externes Originalbeispiel auf Englisch ansehen
            </button>
          )}
          {e.demo && (
            <p className="notice">
              {kneeExample
                ? videoSource === "own"
                  ? "Selbst erstellte 3D-Animation mit deutscher Tonspur. Die Darstellung ist ein Demonstrationsentwurf und noch nicht fachlich freigegeben."
                  : "Externes Anschauungsbeispiel mit einer realen Person. Noch nicht als individuelles Praxisvideo freigegeben. Die Abbildungen bleiben schematische Beispiele."
                : "Schematische Demonstration. Das Video veranschaulicht ausschließlich den technischen Ablauf und ist keine Anleitung dieser Übung."}
            </p>
          )}
          <details>
            <summary>Videotranskript</summary>
            {kneeExample && videoSource === "own" ? (
              <p>{OWN_KNEE_TRANSCRIPT}</p>
            ) : kneeExample ? (
              <p>
                Das englische Originaltranskript finden Sie auf der{" "}
                <a
                  href={REAL_PERSON_EXAMPLE.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Quellseite der Cambridge University Hospitals
                </a>
                , Abschnitt „Video transcript: phase 1“, ab 03:12.
              </p>
            ) : (
              <p>{e.transcript || "Noch nicht hinterlegt."}</p>
            )}
          </details>
          <div className="detail-tags">
            <span>{e.region}</span>
            <span>{e.goal}</span>
            <span>{e.equipment}</span>
            <span>{e.difficulty}</span>
          </div>
        </div>
        <div className="detail-instructions">
          {familyVariants.length > 1 && <label>Variante dieses Grundmusters<select aria-label="Variante dieses Grundmusters" value={e.id} onChange={event => { const next = familyVariants.find(v => v.id === event.target.value); if (next) onSelectVariant(next); }}>{familyVariants.map(v => <option value={v.id} key={v.id}>{v.variantLabel}</option>)}</select></label>}
          {e.requiresSupervision && <div className="notice">Diese Technik nur nach persönlicher Anleitung durchführen.</div>}
          {e.conditionUses.length > 0 && <details className="clinical-use-details"><summary>Krankheitsbezogene Einordnung</summary>{e.conditionUses.map((use,index) => {
            const condition = rehabLibrary.conditions.find(c => c.id === use.conditionId);
            return <section key={index}><h4>{condition?.name}</h4><p>{condition?.phases.filter(p => use.phases.includes(p.id)).map(p => p.name).join(" · ")}</p><p>{use.note}</p>{use.evidenceIds.length ? use.evidenceIds.map(id => <EvidenceCard id={id} key={id}/>) : <p>Kein spezifischer Wirksamkeitsnachweis für diese Übung hinterlegt.</p>}</section>;
          })}</details>}
          <h3>Trainingsart und Gelenke</h3>
          <p>{e.trainingTypes.map(t => t === "Kraft" ? "Kräftigung" : t).join(", ") || "Noch nicht zugeordnet"}</p>
          <p>{e.joints.join(", ") || "Keine Gelenkzuordnung"}</p>
          {e.strengthMuscles.length > 0 && <><h3>Zielmuskeln der Kräftigung</h3><ul>{e.strengthMuscles.map(m => <li key={m}>{m}</li>)}</ul></>}
          {e.sources.length > 0 && <details><summary>Quellen und Recherche</summary><ul>{e.sources.map(source => <li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.title}</a></li>)}</ul><p>Eigener Beschreibungsentwurf; Zuordnungen und Eignung sind vor Freigabe fachlich zu prüfen.</p></details>}
          <h3>Ausgangsstellung</h3>
          <p>{e.start}</p>
          {e.end && <><h3>Endstellung dieser Variante</h3><p>{e.end}</p></>}
          {e.familyId && <div className="notice"><strong>Grundmuster: {e.familyTitle}</strong><p>Variante: {e.variantLabel}</p><p>{e.sourceNote}</p></div>}
          <h3>So geht’s</h3>
          <ol className="steps">
            {e.steps.map((s, i) => (
              <li key={i}>
                <span>{i + 1}</span>
                <p>{s}</p>
              </li>
            ))}
          </ol>
          <h3>Atmung & Tempo</h3>
          <p>{e.breathing}</p>
          <h3>Darauf achten</h3>
          <p>{e.mistakes}</p>
          <div className="notice">{e.precautions}</div>
          <details>
            <summary>Varianten</summary>
            <p>Leichter: {e.easier}</p>
            <p>Anspruchsvoller: {e.harder}</p>
          </details>
          {staff && (
            <>
              <dl className="info-list">
                <dt>Status</dt>
                <dd>{statusLabel[e.status]}</dd>
                <dt>Inhaltsversion</dt>
                <dd>{e.version}</dd>
                <dt>Fachliche Prüfung</dt>
                <dd>{e.reviewer || "Ausstehend"}</dd>
                <dt>Medienrechte</dt>
                <dd>{e.catalogMedia.length ? "Katalogmedien: Herkunft, Nutzungsnachweis und Bearbeitungen stehen direkt bei der Animation. Rechteangaben der Übungsfassung vor Freigabe prüfen." : e.license || "Offen"}</dd>
              </dl>
              <div className="form-actions">
                <button className="button secondary" onClick={onEdit}>
                  Bearbeiten & Medien
                </button>
                <select
                  aria-label="Redaktionellen Status ändern"
                  value={e.status === "demo" ? "" : e.status}
                  onChange={(v) => v.target.value && onStatus(v.target.value)}
                >
                  <option value="" disabled>
                    Status ändern
                  </option>
                  <option value="draft">Entwurf</option>
                  <option value="review">In Prüfung</option>
                  <option value="published">Freigeben</option>
                  <option value="archived">Archivieren</option>
                </select>
              </div>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}

function Training({
  plan,
  demo,
  onClose,
  onSave,
}: {
  plan: Plan;
  demo: boolean;
  onClose: () => void;
  onSave: (body: unknown) => Promise<void>;
}) {
  const [index, setIndex] = useState(0),
    [seconds, setSeconds] = useState(plan.items[0].hold || plan.items[0].pause),
    [running, setRunning] = useState(false),
    [pain, setPain] = useState(""),
    [note, setNote] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [finished, setFinished] = useState(false);
  const item = plan.items[index];
  useEffect(() => {
    if (running && seconds > 0) {
      const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
      return () => clearTimeout(t);
    }
    if (seconds === 0) setRunning(false);
  }, [running, seconds]);
  const save = async (outcome: string) => {
    setBusy(true);
    setError("");
    try {
      await onSave({
        planId: plan.id,
        planVersion: plan.version,
        exerciseId: item.exerciseId,
        outcome,
        pain: pain === "" ? null : Number(pain),
        note,
      });
      if (index === plan.items.length - 1) setFinished(true);
      else {
        setIndex(index + 1);
        setSeconds(plan.items[index + 1].hold || plan.items[index + 1].pause);
        setPain("");
        setNote("");
        setRunning(false);
      }
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal
      title={
        finished
          ? "Zeit für ein gutes Gefühl."
          : `Ihr Training · Übung ${index + 1} von ${plan.items.length}`
      }
      onClose={onClose}
      wide
    >
      {finished ? (
        <div className="training-finished">
          <div>
            <CheckCircle2 size={54} />
          </div>
          <h2>Für heute geschafft.</h2>
          <p>
            Ihr Training wurde gespeichert. Schön, dass Sie sich Zeit für
            Bewegung genommen haben.
          </p>
          <button className="button primary" onClick={onClose}>
            Zurück zu meinem Plan
          </button>
        </div>
      ) : (
        <>
          {error && <div className="alert error">{error}</div>}
          <div className="training-progress">
            <span style={{ width: `${(index / plan.items.length) * 100}%` }} />
          </div>
          <div className="training-layout">
            <div className="training-art">
              <Illustration kind={item.exerciseId} phase={running ? 1 : 0} />
              {demo && <span className="pill">Ungeprüftes Übungsbeispiel</span>}
            </div>
            <div>
              <div className="eyebrow">
                {item.exercise.region} · {item.exercise.goal}
              </div>
              <h2>{item.exercise.title}</h2>
              <p>
                {item.sets} Sätze × {item.reps} Wiederholungen · {item.side}
              </p>
              <ol className="steps">
                {item.exercise.steps.map((s, i) => (
                  <li key={i}>
                    <span>{i + 1}</span>
                    <p>{s}</p>
                  </li>
                ))}
              </ol>
              <div className="timer">
                <Timer size={23} />
                <strong>
                  {Math.floor(seconds / 60)}:
                  {String(seconds % 60).padStart(2, "0")}
                </strong>
                <span>{item.hold ? "Haltezeit" : "Pausenzeit"}</span>
                <button
                  className="icon-button"
                  aria-label={running ? "Timer pausieren" : "Timer starten"}
                  onClick={() => {
                    if (!seconds) setSeconds(item.hold || item.pause);
                    setRunning(!running);
                  }}
                >
                  {running ? <Pause /> : <Play />}
                </button>
              </div>
              <label>
                Beschwerden nach der Übung (freiwillig)
                <select value={pain} onChange={(e) => setPain(e.target.value)}>
                  <option value="">Keine Angabe</option>
                  {Array.from({ length: 11 }, (_, i) => (
                    <option key={i} value={i}>
                      {i}
                      {i === 0
                        ? " – keine"
                        : i === 10
                          ? " – stärkste vorstellbare"
                          : ""}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Ihre Rückmeldung (freiwillig)
                <textarea
                  maxLength={1000}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Wie hat sich die Bewegung angefühlt?"
                />
              </label>
              <div className="form-actions">
                <button
                  className="button secondary"
                  disabled={busy}
                  onClick={() => save("skipped")}
                >
                  <SkipForward size={16} />
                  Auslassen
                </button>
                <button
                  className="button primary"
                  disabled={busy}
                  onClick={() => save("done")}
                >
                  <Check size={17} />
                  Erledigt & weiter
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </Modal>
  );
}

function History({ data }: { data: Overview }) {
  const done = data.history.filter((h) => h.outcome === "done");
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">KLEINE SCHRITTE, SICHTBAR GEMACHT</div>
          <h1>Ihr Weg in Bewegung.</h1>
          <p>Ein persönlicher Rückblick auf Ihre Trainingseinheiten.</p>
        </div>
      </div>
      <div className="stats-grid">
        <div className="stat-card">
          <span>Absolvierte Übungen</span>
          <strong>{done.length}</strong>
          <CheckCircle2 />
        </div>
        <div className="stat-card">
          <span>Aktive Tage</span>
          <strong>
            {new Set(done.map((h) => dayKey(new Date(h.created_at)))).size}
          </strong>
          <CalendarDays />
        </div>
        <div className="stat-card">
          <span>Persönliches Tempo</span>
          <strong>Ihr eigenes.</strong>
          <Heart />
        </div>
      </div>
      <section className="panel">
        <h3>Diese Woche</h3>
        <Week history={data.history} />
      </section>
      {data.history.length ? (
        <section className="panel history-list">
          <h3>Ihre letzten Einträge</h3>
          {data.history.map((h) => (
            <div key={h.id}>
              <span className={"entry-icon " + h.outcome}>
                {h.outcome === "done" ? (
                  <Check size={18} />
                ) : (
                  <SkipForward size={18} />
                )}
              </span>
              <div>
                <strong>
                  {data.exercises.find((e) => e.id === h.exercise_id)?.title ||
                    h.exercise_id}
                </strong>
                <small>
                  {new Date(h.created_at).toLocaleString("de-DE", {
                    timeZone: "Europe/Berlin",
                  })}{" "}
                  · Planversion {h.plan_version}
                </small>
                {h.note && <p>{h.note}</p>}
              </div>
              <span>
                {h.outcome === "done" ? "Erledigt" : "Ausgelassen"}
                {h.pain !== null && <small>Beschwerden: {h.pain}/10</small>}
              </span>
            </div>
          ))}
        </section>
      ) : (
        <Empty
          title="Ihr Verlauf beginnt mit dem ersten Training"
          body="Erledigte und ausgelassene Übungen erscheinen hier, sobald Sie eine Einheit dokumentiert haben."
        />
      )}
    </>
  );
}

type Run = (fn: () => Promise<unknown>, message?: string) => Promise<void>;
function Patients({
  data,
  role,
  run,
  onSelect,
}: {
  data: Overview;
  role: string;
  run: Run;
  onSelect: (id: string) => void;
}) {
  const [newPatient, setNewPatient] = useState(false),
    [name, setName] = useState(""),
    [email, setEmail] = useState(""),
    [birthDate, setBirthDate] = useState(""),
    [invite, setInvite] = useState<{
      url: string;
      expires: string;
      qr: string;
    } | null>(null),
    [search, setSearch] = useState("");
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">PERSÖNLICH BEGLEITEN</div>
          <h1>Ihre Patienten.</h1>
          <p>Zugänge verwalten und Menschen in Bewegung bringen.</p>
        </div>
        <button className="button primary" onClick={() => setNewPatient(true)}>
          <Plus size={18} />
          Patient anlegen
        </button>
      </div>
      <label className="search-input">
        <Search size={18} />
        <input
          aria-label="Patienten durchsuchen"
          placeholder="Name oder E-Mail suchen …"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </label>
      <div className="patient-list">
        {data.patients
          .filter((p) =>
            (p.name + p.email).toLowerCase().includes(search.toLowerCase()),
          )
          .map((p) => (
            <section className="patient-row" key={p.id}>
              <span className="avatar">
                {p.name
                  .split(" ")
                  .map((x) => x[0])
                  .join("")}
              </span>
              <div className="patient-name">
                <strong>{p.name}</strong>
                <small>{p.email}</small>
                <small>Geburtsdatum: {p.birthDate ? p.birthDate.split("-").reverse().join(".") : "Nicht hinterlegt"}</small>
              </div>
              <span className={"status " + p.status}>
                {statusLabel[p.status]}
              </span>
              <button
                className="button secondary"
                onClick={() => onSelect(p.id)}
              >
                Plan ansehen <ChevronRight size={15} />
              </button>
              <button
                className="text-button"
                onClick={() =>
                  run(async () => {
                    setInvite(await api(`/patients/${p.id}/invite`, "POST"));
                  }, "Einladung erstellt")
                }
              >
                Einladung
              </button>
              <details className="access-details">
                <summary>Patientendaten</summary>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const f = new FormData(e.currentTarget);
                  run(() => api(`/patients/${p.id}/profile`, "PATCH", { birthDate: f.get("birthDate") }), "Patientendaten aktualisiert");
                }}>
                  <label>
                    Geburtsdatum (optional)
                    <input name="birthDate" type="date" min="0001-01-01" max={new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Berlin" })} defaultValue={p.birthDate || ""} />
                  </label>
                  <button className="button primary">Speichern</button>
                </form>
              </details>
              {role === "admin" && (
                <details className="access-details">
                  <summary>Zugang</summary>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const f = new FormData(e.currentTarget);
                      run(
                        () =>
                          api(`/patients/${p.id}`, "PATCH", {
                            status: f.get("status"),
                            accessUntil: f.get("until"),
                          }),
                        "Zugang aktualisiert",
                      );
                    }}
                  >
                    <label>
                      Status
                      <select name="status" defaultValue={p.status}>
                        <option value="invited">Freischaltung offen</option>
                        <option value="active">Freigeschaltet</option>
                        <option value="blocked">Gesperrt</option>
                        <option value="archived">Archiviert</option>
                      </select>
                    </label>
                    <label>
                      Gültig bis (optional)
                      <input
                        name="until"
                        type="date"
                        defaultValue={p.accessUntil || ""}
                      />
                    </label>
                    <button className="button primary">Übernehmen</button>
                  </form>
                </details>
              )}
            </section>
          ))}
      </div>
      {newPatient && (
        <Modal title="Patient anlegen" onClose={() => setNewPatient(false)}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              run(async () => {
                await api("/patients", "POST", { name, email, birthDate });
                setNewPatient(false);
                setName("");
                setEmail("");
                setBirthDate("");
              }, "Patient angelegt · Freischaltung steht noch aus");
            }}
          >
            <label>
              Name
              <input
                required
                value={name}
                maxLength={100}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <label>
              E-Mail-Adresse
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <label>
              Geburtsdatum (optional)
              <input type="date" min="0001-01-01" max={new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Berlin" })} value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
            </label>
            <p className="notice">
              Der Zugang wird erst nach Einladung und ausdrücklicher
              Freischaltung aktiv.
            </p>
            <button className="button primary full">Patient anlegen</button>
          </form>
        </Modal>
      )}
      {invite && (
        <Modal title="Persönliche Einladung" onClose={() => setInvite(null)}>
          <div className="invite-qr">
            <img src={invite.qr} alt="Einladungslink als QR-Code" />
          </div>
          <p>
            Einmal verwendbar, gültig bis{" "}
            {new Date(invite.expires).toLocaleString("de-DE", {
              timeZone: "Europe/Berlin",
            })}
            .
          </p>
          <label>
            Einladungslink
            <input
              readOnly
              value={invite.url}
              onFocus={(e) => e.target.select()}
            />
          </label>
          <button
            className="button primary full"
            onClick={() => navigator.clipboard.writeText(invite.url)}
          >
            Link kopieren
          </button>
          <p className="muted">
            Zur persönlichen Übergabe. Es wurde keine E-Mail versendet.
          </p>
        </Modal>
      )}
    </>
  );
}

function PlanEditor({
  data,
  onClose,
  onSave,
}: {
  data: Overview;
  onClose: () => void;
  onSave: (plan: unknown) => Promise<void>;
}) {
  const existing = data.plans.find((p) => p.status === "active");
  const [title, setTitle] = useState(
      existing?.title || "Mein persönlicher Übungsplan",
    ),
    [focus, setFocus] = useState(existing?.focus || ""),
    [start, setStart] = useState(existing?.start || dayKey()),
    [end, setEnd] = useState(
      existing?.end || dayKey(new Date(Date.now() + 30 * 86400000)),
    ),
    [days, setDays] = useState(existing?.days || [1, 3, 5]),
    [note, setNote] = useState(existing?.note || ""),
    [items, setItems] = useState<PlanItem[]>(existing?.items || []);
  const available = data.exercises.filter((e) =>
    ["published", "demo"].includes(e.status),
  );
  const change = (index: number, key: string, value: unknown) =>
    setItems(
      items.map((item, i) => (i === index ? { ...item, [key]: value } : item)),
    );
  return (
    <Modal
      title={`Trainingsplan · ${data.selectedPatient?.name}`}
      onClose={onClose}
      wide
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSave({
            title,
            focus,
            note,
            start,
            end,
            days,
            items: items.map(({ exercise, ...item }) => item),
          });
        }}
      >
        <div className="form-grid">
          <label>
            Planname
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>
          <label>
            Schwerpunkt
            <input value={focus} onChange={(e) => setFocus(e.target.value)} />
          </label>
          <label>
            Beginn
            <input
              required
              type="date"
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />
          </label>
          <label>
            Ende
            <input
              required
              type="date"
              min={start}
              value={end}
              onChange={(e) => setEnd(e.target.value)}
            />
          </label>
        </div>
        <fieldset className="day-picker">
          <legend>Trainingstage</legend>
          {weekdays.map((d, i) => (
            <label key={d}>
              <input
                type="checkbox"
                checked={days.includes((i + 1) % 7)}
                onChange={(e) =>
                  setDays(
                    e.target.checked
                      ? [...days, (i + 1) % 7]
                      : days.filter((v) => v !== (i + 1) % 7),
                  )
                }
              />
              {d}
            </label>
          ))}
        </fieldset>
        <label>
          Übung hinzufügen
          <select
            value=""
            onChange={(e) => {
              const exercise = available.find((x) => x.id === e.target.value)!;
              setItems([
                ...items,
                {
                  exerciseId: exercise.id,
                  exerciseVersion: exercise.version,
                  sets: 2,
                  reps: 10,
                  hold: 0,
                  pause: 30,
                  side: "Beidseits",
                  resistance: "Ohne Zusatzgewicht",
                  note: "",
                  exercise,
                },
              ]);
            }}
          >
            <option value="">Bitte auswählen …</option>
            {available
              .filter((e) => !items.some((i) => i.exerciseId === e.id))
              .map((e) => (
                <option key={e.id} value={e.id}>
                  {e.title}
                </option>
              ))}
          </select>
        </label>
        {items.map((item, index) => (
          <section key={item.exerciseId} className="plan-edit-item">
            <div className="section-title">
              <h3>
                {index + 1}. {item.exercise.title}
              </h3>
              <div>
                <button
                  type="button"
                  className="icon-button"
                  aria-label="Übung nach oben"
                  disabled={index === 0}
                  onClick={() => {
                    const copy = [...items];
                    [copy[index - 1], copy[index]] = [
                      copy[index],
                      copy[index - 1],
                    ];
                    setItems(copy);
                  }}
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="icon-button"
                  aria-label="Übung entfernen"
                  onClick={() => setItems(items.filter((_, i) => i !== index))}
                >
                  <X size={17} />
                </button>
              </div>
            </div>
            <div className="form-grid four">
              {[
                { key: "sets", label: "Sätze", max: 20, min: 1 },
                { key: "reps", label: "Wiederholungen", max: 200, min: 1 },
                { key: "hold", label: "Halten (s)", max: 600, min: 0 },
                { key: "pause", label: "Pause (s)", max: 600, min: 0 },
              ].map((f) => (
                <label key={f.key}>
                  {f.label}
                  <input
                    type="number"
                    required
                    min={f.min}
                    max={f.max}
                    value={String(item[f.key as keyof PlanItem])}
                    onChange={(e) =>
                      change(index, f.key, Number(e.target.value))
                    }
                  />
                </label>
              ))}
              <label>
                Körperseite
                <input
                  value={item.side}
                  onChange={(e) => change(index, "side", e.target.value)}
                />
              </label>
              <label>
                Widerstand
                <input
                  value={item.resistance}
                  onChange={(e) => change(index, "resistance", e.target.value)}
                />
              </label>
            </div>
            <label>
              Persönlicher Hinweis
              <input
                value={item.note}
                onChange={(e) => change(index, "note", e.target.value)}
              />
            </label>
          </section>
        ))}
        <label>
          Planhinweise
          <textarea value={note} onChange={(e) => setNote(e.target.value)} />
        </label>
        <p className="notice">
          Dosierung und Übungsauswahl müssen persönlich therapeutisch festgelegt
          werden. Änderungen erstellen eine neue Planversion.
        </p>
        <button
          className="button primary full"
          disabled={!items.length || !days.length}
        >
          Trainingsplan speichern
        </button>
      </form>
    </Modal>
  );
}

const emptyExercise: Omit<Exercise, "id" | "version" | "status"> = {
  conditionUses: [], methodTags: [], catalogMedia: [], requiresSupervision: false, brochureId: "",
  trainingTypes: ["Mobilisation"],
  joints: ["Schultergelenk"],
  strengthMuscles: [],
  sources: [],
  title: "",
  region: "Schulter",
  goal: "Mobilisation",
  position: "Im Sitzen",
  equipment: "Kein Hilfsmittel",
  subtitle: "",
  start: "",
  steps: [""],
  breathing: "",
  mistakes: "",
  precautions: "",
  easier: "",
  harder: "",
  difficulty: "Leicht",
  duration: 3,
  author: "",
  reviewer: "",
  reviewedAt: "",
  license: "",
  licenseUntil: "",
  transcript: "",
  tags: [],
  media: [],
};
function ExerciseEditor({
  initial,
  onClose,
  onSave,
}: {
  initial: Exercise | "new";
  onClose: () => void;
  onSave: (p: unknown) => Promise<void>;
}) {
  const [form, setForm] = useState(
      initial === "new" ? emptyExercise : { ...initial, demo: false },
    ),
    [sourcesText, setSourcesText] = useState(initial === "new" ? "" : initial.sources.map(source => `${source.title} | ${source.url}`).join("\n")),
    [uploading, setUploading] = useState(false),
    [error, setError] = useState("");
  const field = (key: string, value: unknown) =>
    setForm((f) => ({ ...f, [key]: value }));
  return (
    <Modal
      title={
        initial === "new"
          ? "Neue Übung anlegen"
          : "Übung bearbeiten & Medien pflegen"
      }
      onClose={onClose}
      wide
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!form.trainingTypes.length) { setError("Bitte mindestens eine Trainingsart auswählen."); return; }
          if (form.strengthMuscles.length && !form.trainingTypes.includes("Kraft")) { setError("Für Kräftigungs-Zielmuskeln bitte die Trainingsart Kraft auswählen."); return; }
          if (form.conditionUses.some(use => !use.phases.length || (rehabLibrary.conditions.find(c => c.id === use.conditionId)?.variants.length && !use.variants.length))) { setError("Bitte bei jeder Krankheitszuordnung eine passende Phase und gegebenenfalls Behandlungsvariante auswählen."); return; }
          const sources = sourcesText.split("\n").filter(line => line.trim()).map(line => { const [title, ...url] = line.split("|"); return { title: title.trim(), url: url.join("|").trim() }; });
          onSave({ ...form, sources });
        }}
      >
        {error && <div className="alert error">{error}</div>}
        <div className="form-grid">
          {[
            { key: "title", label: "Übungsname", required: true },
            { key: "subtitle", label: "Kurzbeschreibung" },
            { key: "region", label: "Körperregion", required: true },
            { key: "goal", label: "Trainingsziel", required: true },
            { key: "position", label: "Ausgangsstellung (Filter)" },
            { key: "equipment", label: "Hilfsmittel" },
          ].map((f) => (
            <label key={f.key}>
              {f.label}
              <input
                required={f.required}
                value={String(form[f.key as keyof typeof form] || "")}
                onChange={(e) => field(f.key, e.target.value)}
              />
            </label>
          ))}
          <label>
            Schwierigkeit
            <select
              value={form.difficulty}
              onChange={(e) => field("difficulty", e.target.value)}
            >
              <option>Leicht</option>
              <option>Mittel</option>
              <option>Anspruchsvoll</option>
            </select>
          </label>
          <label>
            Geschätzte Dauer (Minuten)
            <input
              type="number"
              min={1}
              max={120}
              required
              value={form.duration}
              onChange={(e) => field("duration", Number(e.target.value))}
            />
          </label>
        </div>
        <ClinicalAssignmentFields uses={form.conditionUses} onChange={uses => field("conditionUses",uses)} />
        <label className="clinical-checkbox"><input type="checkbox" checked={form.requiresSupervision} onChange={e => field("requiresSupervision",e.target.checked)}/>Nur nach persönlicher Anleitung</label>
        <label>Postisometrische Relaxation (PIR)<select value={form.methodTags.includes("PIR") ? "PIR" : ""} onChange={e => field("methodTags",e.target.value ? [...new Set([...form.methodTags,"PIR"])] : form.methodTags.filter(t => t!=="PIR"))}><option value="">Keine PIR-Technik</option><option value="PIR">PIR / angeleitete Verfahrensvariante</option></select></label>
        <div className="classification-editor">
          {[
            { key: "trainingTypes" as const, title: "Trainingsarten (Mehrfachauswahl)", options: taxonomy.trainingTypes },
            { key: "joints" as const, title: "Betroffene Gelenke (Mehrfachauswahl)", options: taxonomy.joints },
            { key: "strengthMuscles" as const, title: "Muskeln, die gekräftigt werden", options: taxonomy.muscles },
          ].map(group => (
            <fieldset key={group.key}>
              <legend>{group.title}</legend>
              <div className="classification-options">
                {group.options.map(value => <label key={value}><input type="checkbox" checked={form[group.key].includes(value)} onChange={e => field(group.key, e.target.checked ? [...form[group.key], value] : form[group.key].filter(item => item !== value))} />{value === "Kraft" ? "Kraft / Kräftigung" : value}</label>)}
              </div>
            </fieldset>
          ))}
        </div>
        <label>
          Recherchequellen (eine pro Zeile: Titel | https://…)
          <textarea value={sourcesText} onChange={e => setSourcesText(e.target.value)} />
        </label>
        <label>
          Ausgangsstellung beschreiben
          <textarea
            required
            value={form.start}
            onChange={(e) => field("start", e.target.value)}
          />
        </label>
        <label>
          Endstellung beschreiben
          <textarea value={form.end || ""} onChange={event => field("end", event.target.value)} />
        </label>
        <label>
          Durchführung (ein Schritt pro Zeile)
          <textarea
            required
            rows={4}
            value={form.steps.join("\n")}
            onChange={(e) => field("steps", e.target.value.split("\n"))}
          />
        </label>
        <div className="form-grid">
          {[
            { key: "breathing", label: "Atmung & Tempo" },
            { key: "mistakes", label: "Häufige Fehler" },
            { key: "precautions", label: "Vorsichts- und Abbruchhinweise" },
            { key: "easier", label: "Leichtere Variante" },
            { key: "harder", label: "Schwierigere Variante" },
            { key: "author", label: "Autor" },
            { key: "reviewer", label: "Fachlich geprüft durch" },
            {
              key: "license",
              label: "Rechteinhaber, Lizenzumfang, Einwilligungen",
            },
          ].map((f) => (
            <label key={f.key}>
              {f.label}
              <textarea
                value={String(form[f.key as keyof typeof form] || "")}
                onChange={(e) => field(f.key, e.target.value)}
              />
            </label>
          ))}
          <label>
            Fachliches Prüfdatum
            <input
              type="date"
              value={form.reviewedAt}
              onChange={(e) => field("reviewedAt", e.target.value)}
            />
          </label>
          <label>
            Lizenz gültig bis (optional)
            <input
              type="date"
              value={form.licenseUntil}
              onChange={(e) => field("licenseUntil", e.target.value)}
            />
          </label>
        </div>
        <label>
          Videotranskript
          <textarea
            value={form.transcript}
            onChange={(e) => field("transcript", e.target.value)}
          />
        </label>
        <label>
          Suchbegriffe (durch Komma getrennt)
          <input
            value={form.tags.join(", ")}
            onChange={(e) =>
              field(
                "tags",
                e.target.value.split(",").map((s) => s.trim()),
              )
            }
          />
        </label>
        <section className="upload-panel">
          <h3>Bilder & Video</h3>
          {initial === "new" ? (
            <p>
              Die Übung zuerst speichern. Anschließend können Sie geschützte
              Medien hochladen.
            </p>
          ) : (
            <>
              <p>
                JPEG, PNG, WebP, MP4, WebM oder VTT-Untertitel · maximal 50 MB
                (VTT: 100 KB).
              </p>
              <input
                type="file"
                aria-label="Übungsmedium hochladen"
                disabled={uploading}
                accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,.vtt"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setUploading(true);
                  setError("");
                  try {
                    const body = new FormData();
                    body.append("file", file);
                    const media = await api(
                      `/exercises/${initial.id}/media`,
                      "POST",
                      body,
                    );
                    setForm((f) => ({ ...f, media: [...f.media, media.id] }));
                  } catch (e) {
                    setError(errorMessage(e));
                  } finally {
                    setUploading(false);
                  }
                }}
              />
              <p>
                {uploading
                  ? "Datei wird geprüft …"
                  : `${form.media.length} Medien zugeordnet`}
              </p>
              <div className="media-links">
                {form.media.map((id) => (
                  <div key={id}>
                    <a
                      href={"/api/media/" + id}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Medium ansehen
                    </a>
                    <button
                      type="button"
                      className="icon-button"
                      aria-label="Medienzuordnung entfernen"
                      onClick={() =>
                        field(
                          "media",
                          form.media.filter((m) => m !== id),
                        )
                      }
                    >
                      <X size={15} />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
        <p className="notice">
          Speichern erstellt einen neuen Entwurf. Die Freigabe erfolgt nach
          vollständiger fachlicher und redaktioneller Prüfung.
        </p>
        <button className="button primary full" disabled={uploading}>
          Als Entwurf speichern
        </button>
      </form>
    </Modal>
  );
}

function Help({ practice: p, user }: { practice: Practice; user: User }) {
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">WIR SIND FÜR SIE DA</div>
          <h1>Gut zu wissen.</h1>
          <p>Ihre Praxis und die wichtigsten Antworten zur App.</p>
        </div>
      </div>
      <div className="help-grid">
        <section className="panel">
          <span className="soft-icon">
            <Heart />
          </span>
          <h2>{p.name}</h2>
          <p>{p.city}</p>
          {p.address ? (
            <p>{p.address}</p>
          ) : (
            <p className="muted">
              Die vollständige Anschrift wird von der Praxis ergänzt.
            </p>
          )}
          {p.phone && (
            <a className="button secondary" href={"tel:" + p.phone}>
              Praxis anrufen
            </a>
          )}
          {p.email && (
            <a className="text-button" href={"mailto:" + p.email}>
              {p.email}
            </a>
          )}
          {p.hours && <p>{p.hours}</p>}
        </section>
        <section className="panel faq">
          <h2>Häufige Fragen</h2>
          <details open>
            <summary>Welche Übungen soll ich machen?</summary>
            <p>
              Ihr Praxisteam stellt Ihren Plan persönlich zusammen. Halten Sie
              sich an die vereinbarte Dosierung.
            </p>
          </details>
          <details>
            <summary>Was ist bei Beschwerden?</summary>
            <p>
              Beachten Sie die individuell vereinbarten Abbruchhinweise und
              klären Sie ungewohnte Beschwerden mit Ihrer behandelnden
              Fachperson. Die App ist kein Notfallkanal.
            </p>
          </details>
          <details>
            <summary>Wer liest meine Rückmeldungen?</summary>
            <p>{p.replyInfo}</p>
          </details>
          <details>
            <summary>Wie erhalte ich einen Zugang?</summary>
            <p>
              Die Praxis erstellt eine persönliche Einladung und schaltet Ihren
              Zugang frei.
            </p>
          </details>
          <details>
            <summary>Kann ich den Plan ausdrucken?</summary>
            <p>
              Unter Ihrem Trainingsplan finden Sie „Plan als PDF“. Die Datei
              enthält Ihre persönlichen Übungen und Hinweise.
            </p>
          </details>
        </section>
      </div>
      <section className="panel legal-panel">
        <h3>Meine Daten & rechtliche Angaben</h3>
        <a
          className="button secondary"
          href={`/api/patients/${user.id}/export`}
          hidden={user.role !== "patient"}
        >
          <ArrowDownToLine size={17} />
          Meine Daten herunterladen
        </a>
        <details>
          <summary>Impressum</summary>
          <p className="preserve-lines">
            {p.imprint ||
              "Die Betreiberangaben sind vor dem Praxisbetrieb zu ergänzen."}
          </p>
        </details>
        <details>
          <summary>Datenschutzhinweise</summary>
          <p className="preserve-lines">
            {p.privacy ||
              "Die konkreten Datenschutzhinweise sind vor dem Praxisbetrieb zu ergänzen."}
          </p>
        </details>
      </section>
    </>
  );
}

function SettingsPage({ practice, run }: { practice: Practice; run: Run }) {
  const [form, setForm] = useState(practice),
    [audit, setAudit] = useState<any[] | null>(null),
    [team, setTeam] = useState<User[]>([]),
    [invite, setInvite] = useState("");
  useEffect(() => {
    api<User[]>("/team").then(setTeam);
  }, []);
  const edit = (key: string, value: unknown) =>
    setForm((f) => ({ ...f, [key]: value }));
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">PRAXISVERWALTUNG</div>
          <h1>Eine App, die zu Ihrer Praxis passt.</h1>
          <p>Praxisdaten, Begleittexte und Mitarbeiterzugänge verwalten.</p>
        </div>
      </div>
      <form
        className="panel"
        onSubmit={(e) => {
          e.preventDefault();
          run(
            () => api("/settings", "PUT", form),
            "Praxiseinstellungen gespeichert",
          );
        }}
      >
        <h2>Praxisdaten</h2>
        <div className="form-grid">
          {[
            { key: "name", label: "Praxisname" },
            { key: "city", label: "Ort" },
            { key: "address", label: "Vollständige Anschrift" },
            { key: "phone", label: "Telefon" },
            { key: "email", label: "E-Mail" },
            { key: "hours", label: "Sprech- und Öffnungszeiten" },
          ].map((f) => (
            <label key={f.key}>
              {f.label}
              <input
                value={String(form[f.key as keyof Practice])}
                onChange={(e) => edit(f.key, e.target.value)}
              />
            </label>
          ))}
        </div>
        {[
          {
            key: "message",
            label: "Persönliche Nachricht im Patientenbereich",
          },
          { key: "replyInfo", label: "Wann werden Rückmeldungen gelesen?" },
          { key: "imprint", label: "Impressum" },
          { key: "privacy", label: "Datenschutzhinweise" },
        ].map((f) => (
          <label key={f.key}>
            {f.label}
            <textarea
              value={String(form[f.key as keyof Practice])}
              onChange={(e) => edit(f.key, e.target.value)}
            />
          </label>
        ))}
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={form.catalogEnabled}
            onChange={(e) => edit("catalogEnabled", e.target.checked)}
          />
          Allgemeinen Katalog fachlich freigegebener Übungen für Patienten
          zugänglich machen
        </label>
        <button className="button primary">Einstellungen speichern</button>
      </form>
      <section className="panel">
        <h2>Praxisteam</h2>
        {team.map((u) => (
          <div key={u.id} className="team-row">
            <strong>{u.name}</strong>
            <span>{u.role === "admin" ? "Administration" : "Therapie"}</span>
            <span className="muted">
              {u.mfaEnabled
                ? "Zwei-Faktor-Anmeldung aktiv"
                : "Zwei-Faktor-Einrichtung bei Anmeldung"}
            </span>
          </div>
        ))}
        <h3>Mitarbeiter einladen</h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            run(async () => {
              const r = await api("/team", "POST", {
                name: f.get("name"),
                email: f.get("email"),
                role: f.get("role"),
              });
              setInvite(r.url);
              setTeam(await api("/team"));
            }, "Mitarbeitereinladung erstellt");
          }}
        >
          <div className="form-grid">
            <label>
              Name
              <input name="name" required />
            </label>
            <label>
              E-Mail
              <input name="email" required type="email" />
            </label>
            <label>
              Rolle
              <select name="role">
                <option value="therapist">Therapeut</option>
                <option value="admin">Administration</option>
              </select>
            </label>
          </div>
          <button className="button secondary">
            <Plus size={17} />
            Einladung erstellen
          </button>
        </form>
        {invite && (
          <label>
            Persönlicher Einladungslink
            <input readOnly value={invite} onFocus={(e) => e.target.select()} />
          </label>
        )}
      </section>
      <section className="panel">
        <div className="section-title">
          <h2>Zugriffs- und Änderungsprotokoll</h2>
          <button
            className="button secondary"
            onClick={() =>
              run(
                async () => setAudit(await api("/audit")),
                "Protokoll geladen",
              )
            }
          >
            Protokoll laden
          </button>
        </div>
        {audit && (
          <div className="audit-list">
            {audit.length ? (
              audit.map((a) => (
                <div key={a.id}>
                  <strong>{a.actor || "Praxisteam"}</strong>
                  <span>{a.action}</span>
                  <small>
                    {new Date(a.created_at).toLocaleString("de-DE", {
                      timeZone: "Europe/Berlin",
                    })}
                  </small>
                </div>
              ))
            ) : (
              <p>Noch keine protokollierten Änderungen.</p>
            )}
          </div>
        )}
      </section>
    </>
  );
}
export default App;
