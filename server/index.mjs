import fs from "node:fs";
import path from "node:path";
import express from "express";
if (fs.existsSync(".env")) process.loadEnvFile(".env");
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
