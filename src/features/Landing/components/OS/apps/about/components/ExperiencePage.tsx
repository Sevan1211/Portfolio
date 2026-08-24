import React from 'react';
import { motion } from 'framer-motion';
import {
  RetroCalendar,
  RetroPin,
} from '../../../components/icons/RetroIcons';
import { EXPERIENCE } from '@shared/content/portfolio';
import { GBox, PageHead } from '../../../components/win95/Win95';
import '../styles/experience-page.css';

export const ExperiencePage: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -6, transition: { duration: 0.12 } }}
    transition={{ duration: 0.2 }}
    className="content-wrapper"
  >
    <PageHead
      title="Experience"
      sub="Two production internships and a campus IT role"
    />

    {EXPERIENCE.map((entry) => (
      <GBox label={entry.company} key={entry.id}>
        <div className="exp-head">
          <span className="exp-role">{entry.role}</span>
          {entry.dates.includes('Present') && (
            <span className="ab-chip ab-chip--current">Current</span>
          )}
          <span className="exp-when">
            <span>
              <RetroCalendar size={12} /> {entry.dates}
            </span>
            <span>
              <RetroPin size={12} /> {entry.location}
            </span>
          </span>
        </div>

        <ul className="exp-bullets">
          {entry.bullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>

        <div className="ab-rule ab-rule--inset" aria-hidden="true" />
        <div className="ab-chip-row">
          {entry.tech.map((tech) => (
            <span className="ab-chip" key={tech}>
              {tech}
            </span>
          ))}
        </div>
      </GBox>
    ))}
  </motion.div>
);
