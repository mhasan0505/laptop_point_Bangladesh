/**
 * Lightweight HTML sanitizer to prevent XSS attacks.
 * Strips dangerous tags and attributes while preserving safe formatting.
 */

const DANGEROUS_TAGS = /<(script|iframe|object|embed|form|input|textarea|select|button|link|style|meta|base|video|audio|source|track|canvas|applet|frame|frameset|noframes|noscript|marquee|blink|bgsound|xml)[^>]*>[\s\S]*?<\/\1>|<(script|iframe|object|embed|form|input|textarea|select|button|link|style|meta|base|video|audio|source|track|canvas|applet|frame|frameset|noframes|noscript|marquee|blink|bgsound|xml)(\s[^>]*)?\/?>/gi;

const DANGEROUS_ATTRS = /on\w+\s*=\s*["'][^"']*["']|on\w+\s*=\s*[^\s>]*/gi;

const JAVASCRIPT_PROTOCOL = /href\s*=\s*["']?\s*javascript:[^"'>\s]*/gi;

export function sanitizeHtml(html: string): string {
  if (!html) return "";

  let sanitized = html;

  // Remove dangerous tags and their content
  sanitized = sanitized.replace(DANGEROUS_TAGS, "");

  // Remove event handler attributes
  sanitized = sanitized.replace(DANGEROUS_ATTRS, "");

  // Remove javascript: protocol in hrefs
  sanitized = sanitized.replace(JAVASCRIPT_PROTOCOL, 'href="#"');

  return sanitized;
}
