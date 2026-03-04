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
        <p className="feature-desc">React.js, Node.js, Tailwind CSS, Spring Boot, REST API, Azure, Maven, pandas</p>
      </div>
      <div className="feature-card">
        <div className="feature-icon-wrapper">
          <RetroGear size={24} />
        </div>
        <h4 className="feature-title">Developer Tools & More</h4>
        <p className="feature-desc">Git, ServiceNow, Docker, Power BI, Metabase, dbt, Snowflake, Fivetran, Linux</p>
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
          <p className="exp-role">Data Engineering & Analytics Intern</p>
          <div className="exp-meta">
            <span><RetroCalendar size={13} /> August 2025 - Present</span>
            <span><RetroPin size={13} /> Omaha, NE</span>
          </div>
          <ul className="exp-bullets">
            <li>Designed and developed 15+ interactive dashboards in Metabase and Power BI - tracking revenue, invoicing, technician utilization, inventory, and pending jobs - adopted by 20+ stakeholders across all departments.</li>
            <li>Built silver and gold transformation layers in dbt on top of Snowflake, converting raw operational data into clean, analytics-ready models that power company-wide reporting and forecasting.</li>
            <li>Monitored and maintained the FieldServio ETL pipeline daily, proactively identifying and resolving schema drift and data quality issues to ensure reliable ingestion into Snowflake.</li>
            <li>Architected a HubSpot-to-Snowflake data pipeline using Fivetran, centralizing CRM data alongside operational datasets for unified sales and business analytics.</li>
            <li>Developed demand forecasting and revenue prediction models using Python and pandas, enabling data-driven resource planning and financial projections.</li>
            <li>Collaborated cross-functionally with operations, sales, and leadership teams to translate business requirements into scalable data solutions and self-service analytics.</li>
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
          <p className="exp-role">Software Engineering Intern</p>
          <div className="exp-meta">
            <span><RetroCalendar size={13} /> Summers 2024 & 2025</span>
            <span><RetroPin size={13} /> Omaha, NE</span>
          </div>
          <ul className="exp-bullets">
            <li>Developed frontend features for a commercial credit card platform using React, TypeScript, and CSS - building settings, payments, and account management pages used by enterprise clients.</li>
            <li>Integrated REST APIs in JavaScript to connect frontend components with backend services, ensuring reliable data flow and responsive user interactions.</li>
            <li>Identified and remediated all known security vulnerabilities across the frontend and Java/Kotlin backend using Snyk, hardening the application's security posture.</li>
            <li>Implemented ADA accessibility standards across the platform, improving compliance and usability for users with disabilities.</li>
            <li>Wrote comprehensive unit tests with Jest and participated in code reviews via GitLab, maintaining high code quality in a 7-member agile team using ServiceNow for sprint planning, backlog refinement, and standups.</li>
            <li>Increased team velocity by 20% as a returning intern; demoed completed features to the CTO and stakeholders, incorporating feedback into subsequent iterations.</li>
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
            <span><RetroCalendar size={13} /> August 2025 - Present</span>
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
