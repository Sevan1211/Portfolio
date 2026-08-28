import React from "react";
import { CONTACT, IDENTITY } from "@shared/content/portfolio";
import type { AppId } from "../HomeScreen";

interface ContactAppProps {
  onOpenApp: (id: AppId) => void;
}

/**
 * Every way to reach Sevan, grouped-table style. Whole rows are tappable,
 * era blue highlight included.
 */
export const ContactApp: React.FC<ContactAppProps> = ({ onOpenApp }) => (
  <>
    <div className="rp-group">
      <p className="rp-textrow">
        <span className="rp-avail-dot" aria-hidden="true" />
        <strong>{IDENTITY.availability}</strong>
      </p>
    </div>

    <p className="rp-grouplabel">Reach me</p>
    <div className="rp-group">
      <a className="rp-row" href={`mailto:${CONTACT.email}`}>
        <span className="rp-rowlabel">Email</span>
        <span className="rp-rowvalue">{CONTACT.email}</span>
      </a>
      <a className="rp-row" href={`mailto:${CONTACT.emailSchool}`}>
        <span className="rp-rowlabel">School email</span>
        <span className="rp-rowvalue">{CONTACT.emailSchool}</span>
      </a>
      <a
        className="rp-row"
        href={CONTACT.github}
        target="_blank"
        rel="noopener noreferrer"
      >
        <span className="rp-rowlabel">GitHub</span>
        <span className="rp-rowvalue">{CONTACT.githubLabel}</span>
      </a>
      <a
        className="rp-row"
        href={CONTACT.linkedin}
        target="_blank"
        rel="noopener noreferrer"
      >
        <span className="rp-rowlabel">LinkedIn</span>
        <span className="rp-rowvalue">{CONTACT.linkedinLabel}</span>
      </a>
      <div className="rp-row">
        <span className="rp-rowlabel">Location</span>
        <span className="rp-rowvalue">{CONTACT.location}</span>
      </div>
    </div>

    <p className="rp-grouplabel">Resume</p>
    <div className="rp-group">
      <button
        type="button"
        className="rp-row"
        onClick={() => onOpenApp("resume")}
      >
        <span className="rp-rowlabel">Download the PDF</span>
        <span className="rp-rowvalue">→</span>
      </button>
    </div>
  </>
);
