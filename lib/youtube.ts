// Client- and server-safe YouTube link helpers.

const ID_RE = /^[A-Za-z0-9_-]{11}$/;

/**
 * Extract the 11-character video id from any common YouTube URL shape
 * (watch, youtu.be, shorts, embed, live) or a bare id. Returns null otherwise.
 */
export function parseYoutubeId(input: string | null | undefined): string | null {
  const value = (input ?? "").trim();
  if (!value) return null;
  if (ID_RE.test(value)) return value;

  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\.|^m\./, "").toLowerCase();
  let id: string | null = null;

  if (host === "youtu.be") {
    id = url.pathname.split("/").filter(Boolean)[0] ?? null;
  } else if (
    host === "youtube.com" ||
    host === "youtube-nocookie.com" ||
    host === "music.youtube.com"
  ) {
    const parts = url.pathname.split("/").filter(Boolean);
    if (url.pathname === "/watch") id = url.searchParams.get("v");
    else if (["shorts", "embed", "live", "v"].includes(parts[0])) id = parts[1] ?? null;
  }

  return id && ID_RE.test(id) ? id : null;
}

/** Start offset in seconds from `t=` / `start=` (supports 90, 90s, 1m30s). */
export function parseYoutubeStart(input: string | null | undefined): number {
  try {
    const value = (input ?? "").trim();
    const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
    const raw = url.searchParams.get("t") ?? url.searchParams.get("start");
    if (!raw) return 0;
    if (/^\d+$/.test(raw)) return Number(raw);
    const m = raw.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/);
    if (!m) return 0;
    return Number(m[1] ?? 0) * 3600 + Number(m[2] ?? 0) * 60 + Number(m[3] ?? 0);
  } catch {
    return 0;
  }
}

export const youtubeEmbedUrl = (id: string, start = 0) =>
  `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1&autoplay=1${start ? `&start=${start}` : ""}`;

export const youtubeThumbnail = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
