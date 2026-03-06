import React from 'react';
import { motion } from 'framer-motion';
import {
  RetroUser,
  RetroAward,
} from '../../../components/icons/RetroIcons';
import profilePhoto from '@shared/assets/images/OS/picofme.jpeg';
import awardPhoto from '@shared/assets/images/OS/awardwinning.jpeg';
import '../styles/about-page.css';

export const AboutPage: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
    className="content-wrapper"
  >
    <div className="hero-section">
      <h2 className="section-title">Welcome</h2>
      <p className="tagline">Software Engineer · Data Engineer · Problem Solver</p>
    </div>

    {/* About Me + Photo */}
    <div className="about-me-row">
      <div className="about-me-section">
        <div className="section-header">
          <RetroUser size={24} />
          <h3>About Me</h3>
        </div>
        <p>
          Hey, I'm Sevan Lewis-Payne. I'm a software engineer and data engineer
          based in Omaha, NE. I'm currently pursuing a double major in{' '}
          <strong>Computer Science</strong> and{' '}
          <strong>Artificial Intelligence</strong> at the University of Nebraska
          Omaha, graduating in May 2027.
        </p>
        <p>
          I love breaking problems down to their core, figuring out how all the
          pieces fit together, and building toward the best solution. Whether
          it's a data pipeline in Snowflake, a full-stack web app, or a 3D
          scene running in the browser, I enjoy the process of going from idea
          to something real.
        </p>
        <p>
          My journey into tech started early. I was programming LEGO robots as
          a kid, and from there I just kept going. In high school I took every
          tech class I could find: AP Computer Science, Information Security,
          Game Programming, Robotics, and more. That's when I knew technology
          was my future.
        </p>
        <p>
          When I'm not writing code, you'll find me on the golf course, gaming
          with friends, or traveling. I've been lucky enough to visit multiple
          countries and I'm always planning the next trip.
        </p>
      </div>

      <div className="profile-photo-card">
        <div className="profile-photo-frame">
          <img src={profilePhoto} alt="Sevan Lewis-Payne" className="profile-photo" />
        </div>
        <div className="profile-photo-label">Sevan Lewis-Payne</div>
      </div>
    </div>

    {/* Awards + Photo */}
    <div className="about-me-row">
      <div className="profile-photo-card">
        <div className="profile-photo-frame">
          <img src={awardPhoto} alt="Rising Star Intern Award" className="profile-photo" />
        </div>
        <div className="profile-photo-label">Rising Star Intern Award, Fall 2025</div>
      </div>

      <div className="about-me-section">
        <div className="section-header">
          <RetroAward size={24} />
          <h3>Awards & Honors</h3>
        </div>
        <p>
          <strong>Rising Star Intern Award</strong> (University of Nebraska
          Omaha, Fall 2025). I received this for my work during my Summer 2025
          internship at First National Bank.
        </p>
        <p>
          <strong>Buffett Scholarship.</strong> I was awarded a full-ride
          scholarship to the University of Nebraska Omaha, covering tuition,
          room, board, and more through graduation.
        </p>
      </div>
    </div>

  </motion.div>
);
