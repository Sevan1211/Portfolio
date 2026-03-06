import React from 'react';
import { motion } from 'framer-motion';
import {
  RetroMail,
  RetroGitHub,
  RetroLinkedIn,
  RetroPin,
  RetroDocument,
} from '../../../components/icons/RetroIcons';
import '../styles/contact-page.css';

const RESUME_PATH = '/resume/Sevan-Lewis-Payne-2026-Resume.pdf';

export const ContactPage: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
    className="content-wrapper"
  >
    <div className="hero-section">
      <h2 className="section-title">Get In Touch</h2>
      <p className="tagline">Whether it's a job opportunity, a project idea, or just to say hey</p>
    </div>

    {/* Contact links */}
    <div className="contact-box">
      <h4>Contact</h4>

      <div className="contact-links">
        <a href="mailto:slewis-payne@unomaha.edu" className="contact-link" target="_blank" rel="noopener noreferrer">
          <RetroMail size={18} />
          <div className="contact-link-text">
            <span className="contact-link-label">School Email</span>
            <span className="contact-link-value">slewis-payne@unomaha.edu</span>
          </div>
        </a>

        <a href="mailto:sevan1211@icloud.com" className="contact-link" target="_blank" rel="noopener noreferrer">
          <RetroMail size={18} />
          <div className="contact-link-text">
            <span className="contact-link-label">Personal Email</span>
            <span className="contact-link-value">sevan1211@icloud.com</span>
          </div>
        </a>

        <a href="https://github.com/Sevan1211" className="contact-link" target="_blank" rel="noopener noreferrer">
          <RetroGitHub size={18} />
          <div className="contact-link-text">
            <span className="contact-link-label">GitHub</span>
            <span className="contact-link-value">github.com/Sevan1211</span>
          </div>
        </a>

        <a href="https://www.linkedin.com/in/sevan-lewis-payne" className="contact-link" target="_blank" rel="noopener noreferrer">
          <RetroLinkedIn size={18} />
          <div className="contact-link-text">
            <span className="contact-link-label">LinkedIn</span>
            <span className="contact-link-value">linkedin.com/in/sevan-lewis-payne</span>
          </div>
        </a>

        <div className="contact-link contact-link--static">
          <RetroPin size={18} />
          <div className="contact-link-text">
            <span className="contact-link-label">Location</span>
            <span className="contact-link-value">Omaha, NE (Open to Relocation)</span>
          </div>
        </div>
      </div>
    </div>

    {/* Resume download */}
    <div className="resume-box">
      <div className="resume-header">
        <RetroDocument size={22} />
        <h4>Resume</h4>
      </div>
      <p>Download a copy of my full resume.</p>
      <a href={RESUME_PATH} download className="resume-btn">
        <RetroDocument size={16} />
        <span>Download Resume (PDF)</span>
      </a>
    </div>
  </motion.div>
);
