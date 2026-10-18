import fs from "node:fs";
const version = process.argv[2];
if (!/^\d+\.\d+\.\d+(-[a-z0-9.-]+)?$/.test(version || ""))
  throw new Error("Aufruf: npm run release -- 0.1.1-dev");
const date = new Intl.DateTimeFormat("sv-SE", {
  timeZone: "Europe/Berlin",
}).format(new Date());
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
const old = pkg.version;
pkg.version = version;
fs.writeFileSync("package.json", JSON.stringify(pkg, null, 2) + "\n");
const lock = JSON.parse(fs.readFileSync("package-lock.json", "utf8"));
lock.version = version;
lock.packages[""].version = version;
fs.writeFileSync("package-lock.json", JSON.stringify(lock, null, 2) + "\n");
fs.writeFileSync(
  "server/version.mjs",
  `export const VERSION = '${version}';\nexport const VERSION_DATE = '${date}';\nexport const TIME_ZONE = 'Europe/Berlin';\n`,
);
const sw = fs
  .readFileSync("public/sw.js", "utf8")
  .replace("physio-offline-" + old, "physio-offline-" + version);
fs.writeFileSync("public/sw.js", sw);
const readme = fs
  .readFileSync("README.md", "utf8")
  .replace(`**${old}**`, `**${version}**`)
  .replace(
    /Versionsdatum \*\*\d{2}\.\d{2}\.\d{4}\*\*/,
    `Versionsdatum **${date.split("-").reverse().join(".")}**`,
  );
fs.writeFileSync("README.md", readme);
