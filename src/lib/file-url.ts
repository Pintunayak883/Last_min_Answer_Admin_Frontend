export function getFileUrl(filePath: unknown): string | null {
  if (typeof filePath !== "string") return null;

  const trimmed = filePath.trim();
  if (!trimmed) return null;

  // If backend ever returns a full URL, allow it.
  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  const apiBase =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";
  const serverBase = apiBase.replace(/\/?api\/?$/i, "").replace(/\/$/, "");

  const normalized = trimmed.replace(/\\/g, "/");

  // Ensure we always point to the backend /uploads route.
  const lower = normalized.toLowerCase();
  const uploadsWithSlashIndex = lower.indexOf("/uploads/");
  const uploadsNoSlashIndex = lower.indexOf("uploads/");

  let uploadsPath: string | null = null;
  if (uploadsWithSlashIndex !== -1) {
    uploadsPath = normalized.substring(uploadsWithSlashIndex);
  } else if (uploadsNoSlashIndex !== -1) {
    uploadsPath = `/${normalized.substring(uploadsNoSlashIndex)}`;
  }

  if (!uploadsPath) return null;

  return `${serverBase}${uploadsPath}`;
}
