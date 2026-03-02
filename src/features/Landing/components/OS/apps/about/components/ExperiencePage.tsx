import React from 'react';
import { motion } from 'framer-motion';
import {
  RetroBuilding,
  RetroCalendar,
  RetroPin,
  RetroCode,
  RetroLayers,
  RetroGear,
} from '../../../components/icons/RetroIcons';
import '../styles/experience-page.css';

export const ExperiencePage: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
    className="content-wrapper"
  >
    <div className="hero-section">
      <h2 className="section-title">Experience</h2>
      <p className="tagline">Where I've worked & what I've built</p>
    </div>

    <h3 className="subsection-title">Skills & Technologies</h3>
    <div className="feature-grid">
      <div className="feature-card">
        <div className="feature-icon-wrapper">
          <RetroCode size={24} />
        </div>
        <h4 className="feature-title">Languages</h4>
        <p className="feature-desc">Python, Java, Kotlin, JavaScript, C, CSS, HTML, MSSQL, PostgreSQL, Go</p>
      </div>
      <div className="feature-card">
        <div className="feature-icon-wrapper">
          <RetroLayers size={24} />
        </div>
        <h4 className="feature-title">Libraries / Frameworks</h4>
        <p className="feature-desc">React.js, Node.js, Tailwind CSS, Spring Boot, REST API, Azure, Maven</p>
      </div>
      <div className="feature-card">
        <div className="feature-icon-wrapper">
          <RetroGear size={24} />
        </div>
        <h4 className="feature-title">Developer Tools & More</h4>
        <p className="feature-desc">Git, ServiceNow, npm, Microsoft Office, Docker, Power BI, dbt, Snowflake, Linux</p>
      </div>
    </div>

    <h3 className="subsection-title">Work History</h3>
    <div className="exp-timeline">
      {/* Rasmussen Air and Gas Energy */}
      <div className="exp-card">
        <div className="exp-dot" />
        <div className="exp-panel">
          <div className="section-header">
            <RetroBuilding size={24} />
            <h3>Rasmussen Air and Gas Energy</h3>
          </div>
          <p className="exp-role">Data Visualization and Automation Intern</p>
          <div className="exp-meta">
            <span><RetroCalendar size={13} /> August 2025 — Present</span>
            <span><RetroPin size={13} /> Omaha, Ne</span>
          </div>
          <ul className="exp-bullets">
            <li>Engineered Power BI dashboards connected to Snowflake and SQL data models, providing real-time KPI tracking and operational insights that improved reporting efficiency by 40%.</li>
            <li>Built automated data pipelines in n8n with API integrations, reducing manual reporting by 20+ hours per month and ensuring accurate, timely data delivery across teams.</li>
            <li>Applied Python (Pandas, NumPy) to clean, transform, and analyze large datasets, increasing data reliability and enabling proactive business decisions.</li>
            <li>Collaborated with stakeholders to define metrics and deliver data-driven visualizations that enhanced transparency, performance monitoring, and executive decision-making.</li>
          </ul>
        </div>
      </div>

      {/* First National Bank */}
      <div className="exp-card">
        <div className="exp-dot" />
        <div className="exp-panel">
          <div className="section-header">
            <RetroBuilding size={24} />
            <h3>First National Bank</h3>
          </div>
          <p className="exp-role">Software Engineer Summer Intern</p>
          <div className="exp-meta">
            <span><RetroCalendar size={13} /> May 2024 — August 2025</span>
            <span><RetroPin size={13} /> Omaha, NE</span>
          </div>
          <ul className="exp-bullets">
            <li>Modernized legacy HTML pages by building responsive, ADA-compliant interfaces with React.js, JavaScript, and CSS, enhancing accessibility and usability across devices.</li>
            <li>Collaborated in a 7-member agile team using ServiceNow, GitLab, and story points to deliver production-ready features through sprint planning, retrospectives, and daily standups.</li>
            <li>Wrote unit tests with Jest, integrated REST APIs via Docker environments, and followed the company’s internal UI library to ensure consistent and testable code.</li>
            <li>Presented completed features to the CTO and stakeholders, receiving positive feedback; updates reached over 100,000 users and improved team capacity by 20%.</li>
          </ul>
        </div>
      </div>

      {/* University of Nebraska Omaha */}
      <div className="exp-card">
        <div className="exp-dot" />
        <div className="exp-panel">
          <div className="section-header">
            <RetroBuilding size={24} />
            <h3>University of Nebraska Omaha</h3>
          </div>
          <p className="exp-role">Information Technology Operations Specialist</p>
          <div className="exp-meta">
            <span><RetroCalendar size={13} /> August 2025 — Present</span>
            <span><RetroPin size={13} /> Omaha, NE</span>
          </div>
          <ul className="exp-bullets">
            <li>Provide technical support to faculty and students by diagnosing and resolving hardware, software, and connectivity issues.</li>
            <li>Troubleshoot and maintain classroom technology, including projectors, displays, and audiovisual systems.</li>
            <li>Assist with device setup, configuration, and basic hardware repairs across Windows and macOS environments</li>
            <li>Communicate technical solutions clearly and effectively to users with varying levels of technical experience</li>
          </ul>
        </div>
      </div>
    </div>
  </motion.div>
);
