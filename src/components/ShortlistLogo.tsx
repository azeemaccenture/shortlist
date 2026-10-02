type ShortlistLogoProps = {
  word?: boolean;
  animate?: boolean;
  className?: string;
};

export function ShortlistLogo({ word = true, animate = false, className }: ShortlistLogoProps) {
  const classes = ["sl-logo", word ? "sl-logo-lockup" : "sl-logo-mark-only", animate ? "sl-logo-anim" : "", className]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={classes}>
      <svg viewBox="0 0 76 58" aria-hidden="true">
        <rect className="sl-logo-bar" x="0" y="0" width="76" height="10" rx="5" fill="#9C00FC" />
        <rect className="sl-logo-bar" x="0" y="16" width="54.6" height="10" rx="5" fill="#E4D8F6" />
        <rect className="sl-logo-bar" x="0" y="32" width="36.5" height="10" rx="5" fill="#8A7896" />
        <circle className="sl-logo-dot" cx="37.8" cy="51" r="5" fill="#9C00FC" />
      </svg>
      {word ? <span className="sl-logo-word">Shortlist</span> : <span className="sr-only">Shortlist</span>}
    </span>
  );
}
