import { useState } from "react";
import media from "./catalog-media.json";
import type { Exercise } from "./types";

export const catalogMediaUrl = (exercise: Exercise, asset: string, file: string) =>
  `/api/catalog-media/${encodeURIComponent(exercise.id)}/${encodeURIComponent(asset)}/${encodeURIComponent(file)}?version=${exercise.version}`;

export function LicensedMedia({ exercise }: { exercise: Exercise }) {
  const [video, setVideo] = useState(false);
  const asset = media.find(m => exercise.catalogMedia.includes(m.id));
  if (!asset) return null;
  return <section className="licensed-media panel">
    <h3>Bild und Bewegungsanimation</h3>
    <p>Allgemeine Bewegungsdarstellung der CDC. Bewegungsumfang und Zusatzgewichte sind individuell festzulegen.</p>
    <div className="licensed-media-stage">
      {video ? <video key={asset.id} controls playsInline preload="metadata" poster={catalogMediaUrl(exercise,asset.id,"start.png")}>
        <source src={catalogMediaUrl(exercise,asset.id,"video.mp4")} type="video/mp4" />
        <track kind="captions" src={catalogMediaUrl(exercise,asset.id,"captions.vtt")} srcLang="de" label="Deutsch" default />
      </video> : <div className="licensed-stills">
        <figure><img src={catalogMediaUrl(exercise,asset.id,"start.png")} alt={`${asset.title}: Ausgangsposition`} /><figcaption>Ausgangsposition</figcaption></figure>
        <figure><img src={catalogMediaUrl(exercise,asset.id,"movement.png")} alt={`${asset.title}: Bewegungsphase`} /><figcaption>Bewegungsphase</figcaption></figure>
      </div>}
    </div>
    <div className="form-actions"><button type="button" className="button secondary" aria-pressed={!video} onClick={() => setVideo(false)}>Bilder anzeigen</button><button type="button" className="button primary" aria-pressed={video} onClick={() => setVideo(true)}>Animation als Video</button></div>
    <p className="media-credit"><a href={asset.sourceUrl} target="_blank" rel="noopener noreferrer">{asset.title} – {asset.creator}</a><br />{asset.license} · <a href={asset.licenseUrl} target="_blank" rel="noopener noreferrer">Nutzungsnachweis</a><br />{asset.changes}</p>
  </section>;
}
