import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { VERSION, VERSION_DATE } from "./version.mjs";
export async function makePlanPdf(plan, patient, practice, demo, db, mediaDir) {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  let page, y;
  const clean = (s) =>
    String(s || "").replace(/[^\x20-\x7e\xa0-\xff\u20ac]/g, "-");
  const add = () => {
    page = doc.addPage([595.28, 841.89]);
    y = 785;
    line(practice.name, 17, true);
    line(`${patient.name} | ${plan.title}`, 11);
    line(`Planversion ${plan.version} | ${plan.start} bis ${plan.end}`, 9);
    if (demo)
      line("DEMONSTRATION - nicht zur Behandlung freigegeben", 10, true);
    y -= 16;
  };
  function line(s, size = 11, heavy = false) {
    const f = heavy ? bold : font;
    let current = "";
    for (const word of clean(s).split(/\s+/)) {
      if (f.widthOfTextAtSize(current + " " + word, size) > 485 && current) {
        draw(current, size, f);
        current = word;
      } else current += (current ? " " : "") + word;
    }
    if (current) draw(current, size, f);
  }
  function draw(s, size, f) {
    if (y < 65) add();
    page.drawText(s, { x: 50, y, size, font: f, color: rgb(0.1, 0.22, 0.19) });
    y -= size + 7;
  }
  add();
  for (const [index, item] of plan.items.entries()) {
    if (y < 290) add();
    const e = item.exercise;
    line(`${index + 1}. ${e.title}`, 14, true);
    line(
      `${item.sets} Saetze x ${item.reps} Wiederholungen | Halten: ${item.hold}s | Pause: ${item.pause}s`,
      10,
    );
    const first = e.media
      .map((id) => db.prepare("SELECT * FROM media WHERE id=?").get(id))
      .find((m) => m?.kind === "image");
    const imageBuffer = first
      ? fs.readFileSync(path.join(mediaDir, first.filename))
      : demo && e.demo
        ? await sharp(
            Buffer.from(
              '<svg xmlns="http://www.w3.org/2000/svg" width="480" height="180"><rect width="480" height="180" fill="#edf4ee"/><circle cx="240" cy="40" r="16" fill="#215e50"/><path d="M240 60v50m0-40-55 30m55-30 55 30m-55 10-30 55m30-55 30 55" stroke="#215e50" stroke-width="10" stroke-linecap="round" fill="none"/></svg>',
            ),
          )
            .png()
            .toBuffer()
        : null;
    if (imageBuffer) {
      const png = await sharp(imageBuffer)
        .resize({ width: 480, height: 180, fit: "inside" })
        .png()
        .toBuffer();
      const image = await doc.embedPng(png);
      const dims = image.scaleToFit(240, 95);
      page.drawImage(image, {
        x: 50,
        y: y - dims.height,
        width: dims.width,
        height: dims.height,
      });
      y -= dims.height + 12;
    }
    line(e.start, 10);
    e.steps.forEach((s, i) => line(`${i + 1}) ${s}`, 10));
    if (item.note) line(`Persoenlicher Hinweis: ${item.note}`, 10);
    line(e.precautions, 9);
    y -= 18;
  }
  for (const [i, p] of doc.getPages().entries())
    p.drawText(
      clean(
        `Physio Gregor Droessler | ${VERSION} | ${VERSION_DATE} | Seite ${i + 1}`,
      ),
      { x: 50, y: 30, size: 8, font },
    );
  return doc.save();
}
