import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface SectionHeaderProps {
  id?: string;
  headingId?: string;
  eyebrow?: string;
  heading?: string;
  title?: string;
  subheading?: string;
  viewAllHref?: string;
  viewAllText?: string;
  viewAllLabel?: string;
  className?: string;
}

export default function SectionHeader({
  id,
  headingId,
  eyebrow,
  heading,
  title,
  subheading,
  viewAllHref,
  viewAllText,
  viewAllLabel,
  className = "",
}: SectionHeaderProps) {
  const displayHeading = heading || title || "";
  const effectiveId = headingId || id;
  const linkLabel = viewAllLabel || viewAllText || "View all";

  return (
    <div
      className={`flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6 sm:mb-8 ${className}`}
    >
      <div className="max-w-[65ch]">
        {eyebrow && (
          <span className="block text-caption font-semibold tracking-wider text-brand-navy dark:text-primary uppercase mb-1">
            {eyebrow}
          </span>
        )}
        <h2
          id={effectiveId}
          className="text-h2 font-bold text-ink dark:text-foreground tracking-tight"
        >
          {displayHeading}
        </h2>
        {subheading && (
          <p className="text-body text-ink-2 dark:text-muted-foreground mt-1.5 leading-relaxed">
            {subheading}
          </p>
        )}
      </div>

      {viewAllHref && (
        <div className="shrink-0">
          <Link
            href={viewAllHref}
            className="inline-flex items-center gap-1.5 text-small font-semibold text-brand-navy hover:text-brand-red dark:text-primary dark:hover:text-brand-red transition-colors group"
          >
            <span>{linkLabel}</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      )}
    </div>
  );
}
