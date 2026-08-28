import React from "react";
import { Download } from "lucide-react";
import { CONTACT } from "@shared/content/portfolio";

/**
 * The resume gets its own app, one tap from the dock. A paper glyph, the
 * filename, and one very blue button.
 */
export const ResumeApp: React.FC = () => (
  <div className="rp-resume">
    <div className="rp-resume-doc" aria-hidden="true">
      <i />
      <i />
      <i />
      <i />
      <i />
      <span className="rp-resume-badge">PDF</span>
    </div>

    <p className="rp-resume-name">Sevan-Lewis-Payne-2026-Resume.pdf</p>
    <p className="rp-resume-meta">
      One page. Print friendly. Same content as this phone.
    </p>

    <a className="rp-cta" href={CONTACT.resumePath} download>
      <Download size={18} aria-hidden="true" />
      Download PDF
    </a>

    <p className="rp-note" style={{ marginTop: 14 }}>
      <a
        href={CONTACT.resumePath}
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: "#33518c" }}
      >
        Or open it in the browser
      </a>
    </p>
  </div>
);
