import React from 'react';
import { motion } from 'framer-motion';
import { LANGUAGES, SKILL_GROUPS } from '@shared/content/portfolio';
import { GBox, PageHead } from '../../../components/win95/Win95';
import '../styles/skills-page.css';

export const SkillsPage: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -6, transition: { duration: 0.12 } }}
    transition={{ duration: 0.2 }}
    className="content-wrapper"
  >
    <PageHead title="Skills" sub="Grouped by what I build with them" />

    <GBox label="Languages">
      <div className="ab-chip-row">
        {LANGUAGES.map((language) => (
          <span key={language} className="ab-chip ab-chip--mono">
            {language}
          </span>
        ))}
      </div>
    </GBox>

    <div className="skill-grid">
      {SKILL_GROUPS.map((group) => (
        <GBox label={group.label} className="skill-gbox" key={group.id}>
          <p className="skill-blurb">{group.blurb}</p>
          <div className="ab-chip-row">
            {group.items.map((item) => (
              <span key={item} className="ab-chip">
                {item}
              </span>
            ))}
          </div>
        </GBox>
      ))}
    </div>
  </motion.div>
);
