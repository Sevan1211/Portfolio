import React from "react";
import { ABOUT, CONTACT, EDUCATION, IDENTITY } from "@shared/content/portfolio";
import profilePhoto from "@shared/assets/images/OS/picofme.jpeg";
import type { AppId } from "../HomeScreen";

interface AboutAppProps {
  onOpenApp: (id: AppId) => void;
}

/**
 * About Me as an old-school contacts card: photo, name, three glossy actions,
 * then grouped tables. The professional story lives here; the off-the-clock
 * story lives in Notes.
 */
export const AboutApp: React.FC<AboutAppProps> = ({ onOpenApp }) => (
  <>
    <div className="rp-contactcard">
      <img
        src={profilePhoto}
        alt={IDENTITY.name}
        className="rp-avatar"
        width="64"
        height="64"
      />
      <div>
        <h3 className="rp-contactname">{IDENTITY.name}</h3>
        <p className="rp-contactrole">{IDENTITY.title}</p>
      </div>
    </div>

    <div className="rp-actionrow">
      <a className="rp-action" href={`mailto:${CONTACT.email}`}>
        Email
      </a>
      <a
        className="rp-action"
        href={CONTACT.linkedin}
        target="_blank"
        rel="noopener noreferrer"
      >
        LinkedIn
      </a>
      <button
        type="button"
        className="rp-action"
        onClick={() => onOpenApp("resume")}
      >
        Resume
      </button>
    </div>

    <div className="rp-group">
      <div className="rp-row">
        <span className="rp-rowlabel">Availability</span>
        <span
          className="rp-rowvalue"
          style={{ color: "#2e7d1e", fontWeight: 700 }}
        >
          <span className="rp-avail-dot" aria-hidden="true" />
          {IDENTITY.availabilityShort}
        </span>
      </div>
      <div className="rp-row">
        <span className="rp-rowlabel">Location</span>
        <span className="rp-rowvalue">{IDENTITY.locationNote}</span>
      </div>
      <div className="rp-row rp-row--stacked">
        <span className="rp-rowlabel">Focus</span>
        <span className="rp-rowvalue">{IDENTITY.tagline}</span>
      </div>
    </div>

    <p className="rp-grouplabel">About</p>
    <div className="rp-group">
      {ABOUT.intro.map((paragraph) => (
        <p className="rp-textrow" key={paragraph}>
          {paragraph}
        </p>
      ))}
      <p className="rp-textrow">{ABOUT.philosophy}</p>
    </div>

    <p className="rp-grouplabel">Education</p>
    <div className="rp-group">
      <p className="rp-textrow">
        <strong>{EDUCATION.degree}</strong>
        <br />
        {EDUCATION.minor}
        <br />
        {EDUCATION.school} · {EDUCATION.graduation}
      </p>
      {EDUCATION.awards.map((award) => (
        <p className="rp-textrow" key={award.name}>
          <strong>{award.name}</strong>
          <br />
          {award.detail}
        </p>
      ))}
    </div>
  </>
);
