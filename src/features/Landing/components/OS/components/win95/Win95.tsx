import React from 'react';

/* ══════════════════════════════════════════════════════════
   Win95 primitives shared by every About-app page.

   PageHead - compact left-aligned page title over an etched rule.
   GBox     - an etched group box with a legend label, the core
              layout unit of the whole app.
   ══════════════════════════════════════════════════════════ */

export const PageHead: React.FC<{ title: string; sub?: string }> = ({
  title,
  sub,
}) => (
  <header className="ab-page-head">
    <h2 className="ab-page-head-title">{title}</h2>
    {sub ? <p className="ab-page-head-sub">{sub}</p> : null}
    <div className="ab-rule" aria-hidden="true" />
  </header>
);

export const GBox: React.FC<{
  label: string;
  className?: string;
  children: React.ReactNode;
}> = ({ label, className, children }) => (
  <section className={`ab-gbox${className ? ` ${className}` : ''}`}>
    <span className="ab-gbox-label">{label}</span>
    {children}
  </section>
);

/** Dotted-leader fact row (profile card, contact list). */
export const FactRow: React.FC<{
  label: string;
  value: string;
  href?: string;
  mono?: boolean;
}> = ({ label, value, href, mono }) => (
  <div className="ab-fact">
    <span className="ab-fact-label">{label}</span>
    <span className="ab-fact-dots" aria-hidden="true" />
    {href ? (
      <a
        className={`ab-fact-value ab-fact-value--link${mono ? ' ab-fact-value--mono' : ''}`}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
      >
        {value}
      </a>
    ) : (
      <span className={`ab-fact-value${mono ? ' ab-fact-value--mono' : ''}`}>
        {value}
      </span>
    )}
  </div>
);
