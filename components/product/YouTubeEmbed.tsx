"use client";

import { parseYoutubeId, parseYoutubeStart, youtubeEmbedUrl, youtubeThumbnail } from "@/lib/youtube";
import { Play } from "lucide-react";
import { useState } from "react";

/**
 * Click-to-play YouTube player. Nothing is requested from YouTube until the
 * visitor presses play (faster pages, no tracking cookies on load), and it
 * uses the privacy-enhanced youtube-nocookie domain.
 */
export default function YouTubeEmbed({
  url,
  title,
  className = "",
}: {
  url: string;
  title: string;
  className?: string;
}) {
  const [playing, setPlaying] = useState(false);
  const id = parseYoutubeId(url);
  if (!id) return null;

  return (
    <div
      className={`relative aspect-video w-full overflow-hidden rounded-xl bg-black ${className}`}
    >
      {playing ? (
        <iframe
          src={youtubeEmbedUrl(id, parseYoutubeStart(url))}
          title={`${title} video`}
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={`Play video: ${title}`}
          className="group absolute inset-0 flex h-full w-full items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={youtubeThumbnail(id)}
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover opacity-90 transition-opacity group-hover:opacity-100"
          />
          <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-[#dc0303] text-white shadow-lg transition-transform group-hover:scale-105">
            <Play className="ml-1 h-7 w-7 fill-current" aria-hidden="true" />
          </span>
        </button>
      )}
    </div>
  );
}
