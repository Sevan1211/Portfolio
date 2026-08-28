import React from "react";
import { EXPERIENCE } from "@shared/content/portfolio";

/**
 * The condensed recruiter cut of each role, one grouped table per employer.
 */
export const ExperienceApp: React.FC = () => (
  <>
    {EXPERIENCE.map((entry) => (
      <React.Fragment key={entry.id}>
        <p className="rp-grouplabel">{entry.dates}</p>
        <div className="rp-group">
          <p className="rp-textrow">
            <strong>{entry.company}</strong>
            <br />
            {entry.role} · {entry.location}
          </p>
          <ul className="rp-bullets">
            {entry.summary.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <div className="rp-tags">
            {entry.tech.slice(0, 6).map((t) => (
              <span className="rp-tag" key={t}>
                {t}
              </span>
            ))}
          </div>
        </div>
      </React.Fragment>
    ))}
  </>
);
