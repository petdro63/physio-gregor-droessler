import { UserRound, Volume2 } from "lucide-react";

export const OWN_KNEE_TRANSCRIPT =
  "Setzen Sie sich aufrecht hin. Strecken Sie ein Knie langsam nach vorn. Senken Sie das Bein anschließend kontrolliert wieder ab. Atmen Sie ruhig weiter.";
export function OwnExerciseVideo() {
  const base = "/api/demo-media/knie-strecken/";
  return (
    <section
      className="own-exercise-video"
      aria-label="Selbst erstelltes Übungsvideo auf Deutsch"
    >
      <div className="real-person-badge">
        <UserRound size={15} /> Eigene 3D-Animation · Gesichtsneutraler Avatar
      </div>
      <video
        controls
        playsInline
        preload="metadata"
        poster={base + "knie-avatar-de-poster.jpg"}
        aria-label="Knie im Sitzen strecken – eigene 3D-Animation mit deutscher Erklärung"
      >
        <source src={base + "knie-avatar-de.mp4"} type="video/mp4" />
        <track
          kind="captions"
          src={base + "knie-avatar-de.vtt"}
          srcLang="de"
          label="Deutsch"
          default
        />
        Ihr Browser unterstützt dieses Videoformat nicht.
      </video>
      <div className="own-video-caption">
        <strong>Kniestreckung im Sitzen – selbst erstellt</strong>
        <span>
          <Volume2 size={15} /> Deutsche Erklärung · 16 Sekunden
        </span>
        <p>
          Die Person ist als 3D-Figur gestaltet. Die Bewegung, Szene und Tonspur
          wurden für diese Vorschau erstellt.
        </p>
        <p className="notice">
          Demonstrationsentwurf · Vor therapeutischer Verwendung fachlich
          prüfen.
        </p>
      </div>
    </section>
  );
}
