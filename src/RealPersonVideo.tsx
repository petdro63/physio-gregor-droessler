import { useState } from "react";
import { ExternalLink, Play, ShieldCheck, UserRound } from "lucide-react";

// Original publisher's public player only. No video, thumbnail, or personal
// patient information is copied to or requested from the external provider.
export const REAL_PERSON_EXAMPLE = {
  exerciseId: "knie-strecken",
  title: "Knie im Sitzen strecken – mit einer realen Person",
  publisher: "Cambridge University Hospitals NHS Foundation Trust",
  sourceUrl:
    "https://www.cuh.nhs.uk/our-services/physiotherapy-outpatients/outpatient-physio-resources/resources/knee/early-knee-exercises/",
  watchUrl: "https://www.youtube.com/watch?v=AmpUL3sOz5g&t=192s",
  embedUrl:
    "https://www.youtube-nocookie.com/embed/AmpUL3sOz5g?start=192&end=204&rel=0&hl=de&cc_load_policy=1",
};

export function RealPersonVideo() {
  const [loaded, setLoaded] = useState(false);
  return (
    <section
      className="real-person-example"
      aria-label="Videobeispiel mit echter Person"
    >
      <div className="real-person-badge">
        <UserRound size={15} /> Mit einer realen Person gefilmt
      </div>
      {loaded ? (
        <div className="external-video-frame">
          <iframe
            src={REAL_PERSON_EXAMPLE.embedUrl}
            title={REAL_PERSON_EXAMPLE.title}
            allow="fullscreen; picture-in-picture; encrypted-media"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
      ) : (
        <div className="external-video-placeholder">
          <span className="external-person-icon">
            <UserRound size={38} />
          </span>
          <h3>So sieht eine echte Übungsaufnahme aus.</h3>
          <p>
            Ein kurzes Beispiel zur Kniestreckung im Sitzen aus einem
            Originalvideo der Cambridge University Hospitals.
          </p>
          <button className="button primary" onClick={() => setLoaded(true)}>
            <Play size={17} /> Beispielvideo laden
          </button>
          <small>
            <ShieldCheck size={13} /> Erst nach dem Klick wird eine Verbindung
            zu YouTube hergestellt. Dabei werden technische Daten wie Ihre
            IP-Adresse übertragen.
          </small>
        </div>
      )}
      <div className="external-video-caption">
        <strong>{REAL_PERSON_EXAMPLE.title}</strong>
        <span>Originalvideo auf Englisch · Ausschnitt ab 3:12 Minuten</span>
        <a
          href={REAL_PERSON_EXAMPLE.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Quelle: Cambridge University Hospitals <ExternalLink size={12} />
        </a>
        <a
          href={REAL_PERSON_EXAMPLE.watchUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Original auf YouTube öffnen <ExternalLink size={12} />
        </a>
        {loaded && (
          <button className="text-button" onClick={() => setLoaded(false)}>
            Externen Player schließen
          </button>
        )}
      </div>
    </section>
  );
}
