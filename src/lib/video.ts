export type VideoSource =
  | { type: "none" }
  | { type: "iframe"; src: string }
  | { type: "file"; src: string };

/**
 * Turns a pasted lesson URL into something we can safely render.
 * Supports YouTube, Vimeo, Bunny Stream (iframe.mediadelivery.net), direct video files
 * (mp4/webm/m3u8) and generic https embed URLs (Jitsi recordings, Google Drive preview ...).
 */
export function parseVideo(raw: string): VideoSource {
  const url = raw.trim();
  if (!url) return { type: "none" };
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return { type: "none" };
  }
  if (u.protocol !== "https:" && u.protocol !== "http:") return { type: "none" };
  const host = u.hostname.replace(/^www\./, "");

  if (host === "youtube.com" || host === "m.youtube.com" || host === "youtu.be") {
    let id = "";
    if (host === "youtu.be") id = u.pathname.slice(1);
    else if (u.pathname.startsWith("/embed/")) id = u.pathname.split("/")[2];
    else if (u.pathname.startsWith("/shorts/")) id = u.pathname.split("/")[2];
    else id = u.searchParams.get("v") ?? "";
    if (/^[\w-]{6,20}$/.test(id)) {
      return {
        type: "iframe",
        src: `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1`,
      };
    }
    return { type: "none" };
  }

  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const id = u.pathname.split("/").filter(Boolean).pop() ?? "";
    if (/^\d+$/.test(id)) return { type: "iframe", src: `https://player.vimeo.com/video/${id}` };
    return { type: "none" };
  }

  if (/\.(mp4|webm|ogg|m3u8)(\?.*)?$/i.test(u.pathname + u.search)) {
    return { type: "file", src: url };
  }

  return { type: "iframe", src: url };
}
