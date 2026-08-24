import React from 'react';
import { motion } from 'framer-motion';
import {
  RetroCalendar,
  RetroPin,
  RetroAward,
} from '../../../components/icons/RetroIcons';
import { EDUCATION } from '@shared/content/portfolio';
import awardPhoto from '@shared/assets/images/OS/awardwinning.jpeg';
import { GBox, PageHead } from '../../../components/win95/Win95';
import '../styles/education-page.css';

export const EducationPage: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -6, transition: { duration: 0.12 } }}
    transition={{ duration: 0.2 }}
    className="content-wrapper"
  >
    <PageHead title="Education" sub="Degree, honors & coursework" />

    <GBox label={EDUCATION.school}>
      <p className="edu-degree">{EDUCATION.degree}</p>
      <p className="edu-minor">{EDUCATION.minor}</p>
      <div className="exp-when edu-when">
        <span>
          <RetroCalendar size={12} /> {EDUCATION.graduation}
        </span>
        <span>
          <RetroPin size={12} /> {EDUCATION.location}
        </span>
      </div>
    </GBox>

    <GBox label="Awards & Honors">
      <div className="award-row">
        <div className="award-list">
          {EDUCATION.awards.map((award) => (
            <div className="award-entry" key={award.name}>
              <div className="award-entry-head">
                <RetroAward size={15} className="award-icon" />
                <h4>{award.name}</h4>
              </div>
              <p>{award.detail}</p>
            </div>
          ))}
        </div>
        <div className="award-photo-well">
          <img src={awardPhoto} alt="Rising Star Intern Award ceremony" />
          <span className="award-photo-caption">Rising Star Intern Award</span>
        </div>
      </div>
    </GBox>

    <GBox label="Coursework">
      <div className="course-sub">Completed</div>
      <div className="ab-chip-row">
        {EDUCATION.coursework.map((course) => (
          <span key={course} className="ab-chip">
            {course}
          </span>
        ))}
      </div>

      <div className="course-sub course-sub--progress">
        In progress · Fall 2026
      </div>
      <div className="ab-chip-row">
        {EDUCATION.inProgress.map((course) => (
          <span key={course} className="ab-chip ab-chip--progress">
            {course}
          </span>
        ))}
      </div>
    </GBox>
  </motion.div>
);
