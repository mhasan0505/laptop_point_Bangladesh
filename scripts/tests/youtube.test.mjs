import test from "node:test";
import assert from "node:assert/strict";
import {
  parseYoutubeId,
  parseYoutubeStart,
  youtubeEmbedUrl,
  youtubeThumbnail,
} from "../../lib/youtube.ts";

test("parseYoutubeId - valid URL formats", () => {
  const expectedId = "dQw4w9WgXcQ";

  // Watch URL
  assert.equal(parseYoutubeId("https://www.youtube.com/watch?v=dQw4w9WgXcQ"), expectedId);
  assert.equal(parseYoutubeId("https://youtube.com/watch?v=dQw4w9WgXcQ&t=10s"), expectedId);
  assert.equal(parseYoutubeId("http://m.youtube.com/watch?v=dQw4w9WgXcQ"), expectedId);

  // Short URL (youtu.be)
  assert.equal(parseYoutubeId("https://youtu.be/dQw4w9WgXcQ"), expectedId);
  assert.equal(parseYoutubeId("http://youtu.be/dQw4w9WgXcQ?t=45"), expectedId);

  // Shorts
  assert.equal(parseYoutubeId("https://www.youtube.com/shorts/dQw4w9WgXcQ"), expectedId);
  assert.equal(parseYoutubeId("https://youtube.com/shorts/dQw4w9WgXcQ"), expectedId);

  // Embed
  assert.equal(parseYoutubeId("https://www.youtube.com/embed/dQw4w9WgXcQ"), expectedId);
  assert.equal(parseYoutubeId("https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"), expectedId);

  // Bare 11-char ID
  assert.equal(parseYoutubeId("dQw4w9WgXcQ"), expectedId);
  assert.equal(parseYoutubeId("  dQw4w9WgXcQ  "), expectedId);
});

test("parseYoutubeId - invalid URLs and hosts", () => {
  // Invalid hosts
  assert.equal(parseYoutubeId("https://vimeo.com/123456789"), null);
  assert.equal(parseYoutubeId("https://example.com/watch?v=dQw4w9WgXcQ"), null);
  assert.equal(parseYoutubeId("https://fakeyoutube.com/watch?v=dQw4w9WgXcQ"), null);
  assert.equal(parseYoutubeId("https://dailymotion.com/video/x7tgad0"), null);

  // Bad IDs and non-strings
  assert.equal(parseYoutubeId(""), null);
  assert.equal(parseYoutubeId("   "), null);
  assert.equal(parseYoutubeId(null), null);
  assert.equal(parseYoutubeId(undefined), null);
  assert.equal(parseYoutubeId("short"), null);
  assert.equal(parseYoutubeId("thisiswaytoolongtobeanyoutubeid12345"), null);
  assert.equal(parseYoutubeId("https://www.youtube.com/watch?v="), null);
  assert.equal(parseYoutubeId("https://www.youtube.com/"), null);
});

test("parseYoutubeStart - start offsets", () => {
  // Plain seconds
  assert.equal(parseYoutubeStart("https://youtu.be/dQw4w9WgXcQ?t=90"), 90);
  assert.equal(parseYoutubeStart("https://youtube.com/watch?v=dQw4w9WgXcQ&start=45"), 45);
  assert.equal(parseYoutubeStart("https://youtube.com/watch?v=dQw4w9WgXcQ&t=120s"), 120);

  // Complex mm:ss or hh:mm:ss format
  assert.equal(parseYoutubeStart("https://youtu.be/dQw4w9WgXcQ?t=1m30s"), 90);
  assert.equal(parseYoutubeStart("https://youtu.be/dQw4w9WgXcQ?t=2m"), 120);
  assert.equal(parseYoutubeStart("https://youtu.be/dQw4w9WgXcQ?t=1h2m3s"), 3723);

  // Missing or invalid
  assert.equal(parseYoutubeStart("https://youtu.be/dQw4w9WgXcQ"), 0);
  assert.equal(parseYoutubeStart(""), 0);
  assert.equal(parseYoutubeStart(null), 0);
});

test("youtubeEmbedUrl - embed generator", () => {
  assert.equal(
    youtubeEmbedUrl("dQw4w9WgXcQ"),
    "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0&modestbranding=1&autoplay=1"
  );

  assert.equal(
    youtubeEmbedUrl("dQw4w9WgXcQ", 90),
    "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0&modestbranding=1&autoplay=1&start=90"
  );
});

test("youtubeThumbnail - thumbnail generator", () => {
  assert.equal(
    youtubeThumbnail("dQw4w9WgXcQ"),
    "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg"
  );
});
