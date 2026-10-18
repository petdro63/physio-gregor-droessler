import fs from "node:fs";
import path from "node:path";
import express from "express";

const loadDotEnv = () => {
  const envPath = path.resolve(".env");
  if (!fs.existsSync(envPath)) return;

  for (const rawLine of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const equalsIndex = line.indexOf("=");
    if (equalsIndex === -1) continue;

    const key = line.slice(0, equalsIndex).trim();
    let value = line.slice(equalsIndex + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    if (!Object.prototype.hasOwnProperty.call(process.env, key)) {
      process.env[key] = value;
    }
  }
};

loadDotEnv();
if (process.argv.includes("--production")) process.env.NODE_ENV = "production";
const { createApp } = await import("./app.mjs");
const runtime = createApp();
const { app } = runtime;
const production = process.env.NODE_ENV === "production";
if (production) {
  app.use(express.static(path.resolve("dist"), { index: false }));
  app.get("/{*path}", (req, res) =>
    res
      .set("Cache-Control", "no-store")
      .sendFile(path.resolve("dist/index.html")),
  );
} else {
  const { createServer } = await import("vite");
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);
}
const host = process.env.HOST || "127.0.0.1",
  port = Number(process.env.PORT || 3180);
const server = app.listen(port, host, () =>
  console.log(
    `Physio Gregor Drößler: http://localhost:${port} (${production ? "production" : "local preview"})`,
  ),
);
process.on("SIGTERM", () =>
  server.close(() => {
    runtime.close();
    process.exit(0);
  }),
);
