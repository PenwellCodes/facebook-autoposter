function redactSecrets(value) {
  const SENSITIVE_KEYS = new Set([
    "client_secret",
    "access_token",
    "refresh_token",
    "authorization",
    "cookie",
    "x-hub-signature",
    "x-hub-signature-256",
    "apiKey",
    "key"
  ]);

  const seen = new WeakSet();

  function walk(v) {
    if (!v || typeof v !== "object") return v;
    if (seen.has(v)) return "[Circular]";
    seen.add(v);

    if (Array.isArray(v)) return v.map(walk);

    const out = {};
    for (const [k, child] of Object.entries(v)) {
      if (SENSITIVE_KEYS.has(String(k).toLowerCase())) {
        out[k] = "[REDACTED]";
      } else {
        out[k] = walk(child);
      }
    }
    return out;
  }

  return walk(value);
}

export function errorHandler(err, req, res, next) {
  // Avoid logging huge objects that may contain secrets (e.g. axios error.config.params.client_secret)
  const safeLog = {
    name: err?.name,
    message: err?.message,
    stack: err?.stack,
    status: err?.response?.status,
    data: err?.response?.data,
    url: err?.config?.url,
    method: err?.config?.method
  };

  console.error(redactSecrets(safeLog));

  const statusCode =
    err?.statusCode ||
    (res.statusCode && res.statusCode !== 200 ? res.statusCode : 500);

  res.status(statusCode).json({
    message: err?.message || "Server error"
  });
}