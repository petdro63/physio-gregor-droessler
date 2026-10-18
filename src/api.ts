let csrf = "";
export function setCsrf(value: string) {
  csrf = value;
}
export async function api<T = any>(
  url: string,
  method = "GET",
  body?: unknown,
): Promise<T> {
  const isFile = body instanceof FormData;
  const res = await fetch("/api" + url, {
    method,
    credentials: "same-origin",
    cache: "no-store",
    headers: {
      ...(!isFile && body ? { "Content-Type": "application/json" } : {}),
      ...(method !== "GET" ? { "X-CSRF-Token": csrf } : {}),
    },
    body: body ? (isFile ? body : JSON.stringify(body)) : undefined,
  });
  const data = await res
    .json()
    .catch(() => ({ error: "Die Anfrage konnte nicht verarbeitet werden." }));
  if (!res.ok) throw new Error(data.error || "Die Anfrage ist fehlgeschlagen.");
  return data;
}
