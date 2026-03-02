import React, { useState } from 'react';
import profilePhoto from '@shared/assets/images/OS/picofme.jpeg';
import awardPhoto from '@shared/assets/images/OS/awardwinning.jpeg';

/* ══════════════════════════════════════════════════════════
   Mobile About App
   All portfolio sections in a single scrollable view,
   formatted for small screens. Retro iOS aesthetic.
   ══════════════════════════════════════════════════════════ */

type SectionId = 'about' | 'experience' | 'projects' | 'contact';

const TABS: { id: SectionId; label: string }[] = [
  { id: 'about', label: 'About' },
  { id: 'experience', label: 'Work' },
  { id: 'projects', label: 'Projects' },
  { id: 'contact', label: 'Contact' },
];

/* ── Project data (mirrors desktop) ── */
interface Project {
  title: string;
  subtitle: string;
  description: string;
  tech: string[];
  github: string;
}

const PROJECTS: Project[] = [
  {
    title: 'PrepMe',
    subtitle: 'Interactive Coding & Learning Platform',
    description:
      'Full-stack platform with 170+ coding challenges, cloud sandbox with Docker containers, AI tutor, and multi-language code execution.',
    tech: ['React', 'TypeScript', 'Go', 'Python', 'Docker', 'PostgreSQL'],
    github: 'https://github.com/Sevan1211/PrepMe',
  },
  {
    title: 'CodeLive',
    subtitle: 'Live Technical Interview Platform',
    description:
      'Real-time collaborative coding interview tool with Monaco editor, in-browser transpilation, and 250+ curated problems.',
    tech: ['React', 'TypeScript', 'Node.js', 'Express', 'Supabase'],
    github: 'https://github.com/UNO-CSCI4830/CodeLive',
  },
  {
    title: 'Elmwood Exteriors',
    subtitle: 'Professional Business Website',
    description:
      'Responsive business site with project gallery, lightbox, and EmailJS-powered contact & estimate forms.',
    tech: ['React', 'JavaScript', 'CSS3', 'EmailJS'],
    github: 'https://github.com/Sevan1211/Elmwood-Exterior-Website',
  },
];

export const MobileAboutApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SectionId>('about');

  return (
    <div className="m-app">
      {/* ── Navigation tabs ── */}
      <nav className="m-tab-bar">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            className={`m-tab ${activeTab === id ? 'm-tab--active' : ''}`}
            onClick={() => setActiveTab(id)}
          >
            {label}
          </button>
        ))}
      </nav>

      {/* ── Content ── */}
      <div className="m-content">
        {activeTab === 'about' && <AboutSection />}
        {activeTab === 'experience' && <ExperienceSection />}
        {activeTab === 'projects' && <ProjectsSection />}
        {activeTab === 'contact' && <ContactSection />}
      </div>

      {/* ── Desktop prompt ── */}
      <div className="m-desktop-prompt">
        💻 Visit on desktop for the full experience
      </div>
    </div>
  );
};

/* ══════════════════════════════════════
   SECTIONS
   ══════════════════════════════════════ */

/* ── About ── */
const AboutSection: React.FC = () => (
  <div className="m-section">
    <h2 className="m-title">Welcome</h2>
    <p className="m-tagline">Full-Stack Developer · Problem Solver · Carpe Diem</p>

    <div className="m-photo-card">
      <img src={profilePhoto} alt="Sevan Lewis-Payne" className="m-photo" />
      <span className="m-photo-label">Sevan Lewis-Payne</span>
    </div>

    <div className="m-card">
      <h3 className="m-card-title">About Me</h3>
      <p>
        Hey, I'm Sevan Lewis-Payne — a full-stack developer based in Omaha, NE.
        I'm pursuing a double major in <strong>Computer Science</strong> and{' '}
        <strong>Artificial Intelligence</strong> at UNO, graduating May 2027.
      </p>
      <p>
        I love breaking problems down to their core and building toward the best
        solution. Whether it's a responsive UI, a data pipeline, or a 3D scene
        in the browser — I enjoy going from idea to something real.
      </p>
      <p>
        My journey started early — programming LEGO robots as a kid, then taking
        every tech class in high school: AP CS, InfoSec, Game Programming,
        Robotics, and more. That's when I knew tech was my future.
      </p>
    </div>

    <div className="m-card">
      <h3 className="m-card-title">Awards & Honors</h3>
      <img src={awardPhoto} alt="Rising Star Intern Award" className="m-photo m-photo--award" />
      <p>
        <strong>Rising Star Intern Award</strong> — UNO, Fall 2025. Recognized
        for performing on par with full-time engineers during my summer internship
        at First National Bank.
      </p>
      <p>
        <strong>Buffett Scholarship</strong> — Full-ride covering tuition, room,
        board, and more through graduation.
      </p>
    </div>
  </div>
);

/* ── Experience ── */
const ExperienceSection: React.FC = () => (
  <div className="m-section">
    <h2 className="m-title">Experience</h2>
    <p className="m-tagline">Where I've worked & what I've built</p>

    {/* Skills */}
    <div className="m-card">
      <h3 className="m-card-title">Skills</h3>
      <div className="m-skill-row">
        <span className="m-skill-label">Languages</span>
        <p>Python, Java, Kotlin, JavaScript, C, Go, SQL, HTML, CSS</p>
      </div>
      <div className="m-skill-row">
        <span className="m-skill-label">Frameworks</span>
        <p>React, Node.js, Tailwind, Spring Boot, REST APIs, Three.js</p>
      </div>
      <div className="m-skill-row">
        <span className="m-skill-label">Tools</span>
        <p>Git, Docker, Linux, Power BI, dbt, Snowflake, npm</p>
      </div>
    </div>

    {/* Jobs */}
    <ExpCard
      company="Rasmussen Air and Gas Energy"
      role="Data Visualization & Automation Intern"
      dates="Aug 2025 — Present"
      location="Omaha, NE"
      bullets={[
        'Power BI dashboards + Snowflake data models → +40% reporting efficiency',
        'Automated pipelines in n8n → saved 20+ hrs/month',
        'Python data analysis (Pandas, NumPy) for cleaner insights',
      ]}
    />
    <ExpCard
      company="First National Bank"
      role="Software Engineer Summer Intern"
      dates="May 2024 — Aug 2025"
      location="Omaha, NE"
      bullets={[
        'Modernized legacy HTML → responsive React + ADA compliance',
        'Agile team of 7: ServiceNow, GitLab, sprints',
        'Features reached 100K+ users, +20% team capacity',
      ]}
    />
    <ExpCard
      company="University of Nebraska Omaha"
      role="IT Operations Specialist"
      dates="Aug 2025 — Present"
      location="Omaha, NE"
      bullets={[
        'Tech support for faculty/students (hardware, software, A/V)',
        'Device setup & troubleshooting across Windows & macOS',
      ]}
    />
  </div>
);

const ExpCard: React.FC<{
  company: string;
  role: string;
  dates: string;
  location: string;
  bullets: string[];
}> = ({ company, role, dates, location, bullets }) => (
  <div className="m-card">
    <h3 className="m-card-title">{company}</h3>
    <span className="m-exp-role">{role}</span>
    <span className="m-exp-meta">{dates} · {location}</span>
    <ul className="m-bullets">
      {bullets.map((b) => (
        <li key={b}>{b}</li>
      ))}
    </ul>
  </div>
);

/* ── Projects ── */
const ProjectsSection: React.FC = () => (
  <div className="m-section">
    <h2 className="m-title">Projects</h2>
    <p className="m-tagline">Things I've built & shipped</p>

    {PROJECTS.map((p) => (
      <div key={p.title} className="m-card">
        <div className="m-project-header">
          <div>
            <h3 className="m-card-title">{p.title}</h3>
            <span className="m-project-sub">{p.subtitle}</span>
          </div>
          <a
            href={p.github}
            target="_blank"
            rel="noopener noreferrer"
            className="m-github-btn"
          >
            GitHub →
          </a>
        </div>
        <p>{p.description}</p>
        <div className="m-tech-row">
          {p.tech.map((t) => (
            <span key={t} className="m-tech-tag">{t}</span>
          ))}
        </div>
      </div>
    ))}
  </div>
);

/* ── Contact ── */
const ContactSection: React.FC = () => (
  <div className="m-section">
    <h2 className="m-title">Get In Touch</h2>
    <p className="m-tagline">Whether it's a job, a project, or just to say hey</p>

    <div className="m-card">
      <ContactRow
        label="School Email"
        value="slewis-payne@unomaha.edu"
        href="mailto:slewis-payne@unomaha.edu"
      />
      <ContactRow
        label="Personal Email"
        value="sevan1211@icloud.com"
        href="mailto:sevan1211@icloud.com"
      />
      <ContactRow
        label="GitHub"
        value="github.com/Sevan1211"
        href="https://github.com/Sevan1211"
      />
      <ContactRow
        label="LinkedIn"
        value="linkedin.com/in/sevan-lewis-payne"
        href="https://www.linkedin.com/in/sevan-lewis-payne"
      />
      <ContactRow label="Location" value="Omaha, NE (Open to Relocation)" />
    </div>
  </div>
);

const ContactRow: React.FC<{ label: string; value: string; href?: string }> = ({
  label,
  value,
  href,
}) => (
  <div className="m-contact-row">
    <span className="m-contact-label">{label}</span>
    {href ? (
      <a href={href} target="_blank" rel="noopener noreferrer" className="m-contact-value">
        {value}
      </a>
    ) : (
      <span className="m-contact-value">{value}</span>
    )}
  </div>
);


