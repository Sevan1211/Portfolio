import React from "react";
import { motion } from "framer-motion";
import { RetroDocument } from "../../../components/icons/RetroIcons";
import { CONTACT, IDENTITY } from "@shared/content/portfolio";
import { FactRow, GBox, PageHead } from "../../../components/win95/Win95";
import "../styles/contact-page.css";

export const ContactPage: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -6, transition: { duration: 0.12 } }}
    transition={{ duration: 0.2 }}
    className="content-wrapper"
  >
    <PageHead
      title="Contact"
      sub="A role, a project idea, or just to say hey"
    />

    <GBox label="Availability">
      <div className="ab-well avail-well">
        <span className="avail-led" aria-hidden="true" />
        <p>{IDENTITY.availability}</p>
      </div>
    </GBox>

    <GBox label="Reach Me">
      <div className="contact-facts">
        <FactRow
          label="Email"
          value={CONTACT.email}
          href={`mailto:${CONTACT.email}`}
          mono
        />
        <FactRow
          label="School Email"
          value={CONTACT.emailSchool}
          href={`mailto:${CONTACT.emailSchool}`}
          mono
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
        <FactRow label="Location" value={CONTACT.location} />
      </div>
    </GBox>

    <GBox label="Resume">
      <p className="resume-line">
        A one-page PDF version of everything in this app.
      </p>
      <a href={CONTACT.resumePath} download className="ab-btn">
        <RetroDocument size={14} />
        <span>Download Resume (PDF)</span>
      </a>
    </GBox>
  </motion.div>
);
