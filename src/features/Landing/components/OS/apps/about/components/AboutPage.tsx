import React from "react";
import { motion } from "framer-motion";
import { RetroInfo, RetroBulb } from "../../../components/icons/RetroIcons";
import { ABOUT, CONTACT, EDUCATION, IDENTITY } from "@shared/content/portfolio";
import profilePhoto from "@shared/assets/images/OS/picofme.jpeg";
import { GBox, FactRow } from "../../../components/win95/Win95";
import "../styles/about-page.css";

export const AboutPage: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -6, transition: { duration: 0.12 } }}
    transition={{ duration: 0.2 }}
    className="content-wrapper"
  >
    {/* ID-card profile header - the one place the name appears */}
    <div className="profile-card">
      <div className="profile-photo-well">
        <img src={profilePhoto} alt={IDENTITY.name} width="400" height="400" />
      </div>
      <div className="profile-id">
        <h2 className="profile-name">{IDENTITY.name}</h2>
        <div className="profile-title">{IDENTITY.title}</div>
        <div className="profile-facts">
          <FactRow label="Location" value={IDENTITY.location} />
          <FactRow
            label="Education"
            value={`${EDUCATION.degreeShort} · ${EDUCATION.schoolShort}`}
          />
          <FactRow
            label="GitHub"
            value={CONTACT.githubLabel}
            href={CONTACT.github}
            mono
          />
          <FactRow
            label="LinkedIn"
            value={CONTACT.linkedinLabel}
            href={CONTACT.linkedin}
            mono
          />
        </div>
      </div>
    </div>

    <GBox label="Summary">
      <div className="ab-well summary-well">
        <RetroInfo size={17} className="summary-icon" />
        <p>{IDENTITY.narrative}</p>
      </div>
    </GBox>

    <GBox label={ABOUT.heading}>
      {ABOUT.intro.map((paragraph) => (
        <p className="ab-p" key={paragraph}>
          {paragraph}
        </p>
      ))}
      <div className="ab-rule ab-rule--inset" aria-hidden="true" />
      {ABOUT.personal.map((paragraph) => (
        <p className="ab-p" key={paragraph}>
          {paragraph}
        </p>
      ))}
    </GBox>

    <GBox label="How I Work">
      <div className="tip-row">
        <RetroBulb size={18} className="tip-icon" />
        <p>{ABOUT.philosophy}</p>
      </div>
    </GBox>
  </motion.div>
);
