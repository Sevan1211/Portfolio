import React, { useState } from 'react';
import {
  ABOUT,
  CONTACT,
  EDUCATION,
  EXPERIENCE,
  IDENTITY,
  LANGUAGES,
  PLATFORM_STATS,
  SKILL_GROUPS,
} from '@shared/content/portfolio';
import profilePhoto from '@shared/assets/images/OS/picofme.jpeg';

/* ══════════════════════════════════════════════════════════
   Mobile About App

   Deliberately a condensed recruiter summary rather than a mirror of the
   desktop OS: identity, availability, the short form of each role, and a
   direct line to the resume. All content comes from the shared source.
   ══════════════════════════════════════════════════════════ */

type SectionId = 'about' | 'experience' | 'projects' | 'contact';

const TABS: { id: SectionId; label: string }[] = [
  { id: 'about', label: 'About' },
  { id: 'experience', label: 'Work' },
  { id: 'projects', label: 'Projects' },
  { id: 'contact', label: 'Contact' },
];

/* ── Project data (pending the projects rewrite) ── */
interface Project {
  title: string;
  subtitle: string;
  description: string;
  tech: string[];
  github?: string;
}

const PROJECTS: Project[] = [
  {
    title: 'CodeLive',
    subtitle: 'Live Technical Interview Platform',
    description:
      'Real-time collaborative coding interview tool with Monaco editor, in-browser transpilation, and a curated problem bank.',
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

      <div className="m-content">
        {activeTab === 'about' && <AboutSection />}
        {activeTab === 'experience' && <ExperienceSection />}
        {activeTab === 'projects' && <ProjectsSection />}
        {activeTab === 'contact' && <ContactSection />}
      </div>

      <a className="m-resume-bar" href={CONTACT.resumePath} download>
        Download Resume (PDF)
      </a>
    </div>
  );
};

/* ══════════════════════════════════════
   SECTIONS
   ══════════════════════════════════════ */

const AboutSection: React.FC = () => (
  <div className="m-section">
    <h2 className="m-title">{IDENTITY.name}</h2>
    <p className="m-tagline">{IDENTITY.tagline}</p>

    <div className="m-availability">
      <span className="m-availability-dot" />
      {IDENTITY.availabilityShort} · Open to relocation
    </div>

    <div className="m-photo-card">
      <img src={profilePhoto} alt={IDENTITY.name} className="m-photo" />
    </div>

    <div className="m-narrative">{IDENTITY.narrative}</div>

    <div className="m-card">
      <h3 className="m-card-title">About</h3>
      {ABOUT.intro.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
    </div>

    <div className="m-card">
      <h3 className="m-card-title">Education</h3>
      <p>
        <strong>{EDUCATION.degree}</strong>
        <br />
        {EDUCATION.school} · {EDUCATION.graduation}
      </p>
      <ul className="m-bullets">
        {EDUCATION.awards.map((award) => (
          <li key={award.name}>{award.name}</li>
        ))}
      </ul>
    </div>
  </div>
);

const ExperienceSection: React.FC = () => (
  <div className="m-section">
    <h2 className="m-title">Experience</h2>
    <p className="m-tagline">Where I&apos;ve worked &amp; what I built</p>

    <div className="m-card m-card--stats">
      <h3 className="m-card-title">Data platform at a glance</h3>
      <div className="m-stat-grid">
        {PLATFORM_STATS.map((stat) => (
          <div className="m-stat" key={stat.label}>
            <span className="m-stat-value">{stat.value}</span>
            <span className="m-stat-label">{stat.label}</span>
          </div>
        ))}
      </div>
    </div>

    {EXPERIENCE.map((entry) => (
      <div className="m-card" key={entry.id}>
        <h3 className="m-card-title">{entry.company}</h3>
        <span className="m-exp-role">{entry.role}</span>
        <span className="m-exp-meta">
          {entry.dates} · {entry.location}
        </span>
        <ul className="m-bullets">
          {entry.summary.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </div>
    ))}

    <div className="m-card">
      <h3 className="m-card-title">Skills</h3>
      <div className="m-skill-row">
        <span className="m-skill-label">Languages</span>
        <p>{LANGUAGES.join(', ')}</p>
      </div>
      {SKILL_GROUPS.map((group) => (
        <div className="m-skill-row" key={group.id}>
          <span className="m-skill-label">{group.label}</span>
          <p>{group.items.slice(0, 7).join(', ')}</p>
        </div>
      ))}
    </div>
  </div>
);

const ProjectsSection: React.FC = () => (
  <div className="m-section">
    <h2 className="m-title">Projects</h2>
    <p className="m-tagline">Things I&apos;ve built &amp; shipped</p>

    {PROJECTS.map((p) => (
      <div key={p.title} className="m-card">
        <div className="m-project-header">
          <div>
            <h3 className="m-card-title">{p.title}</h3>
            <span className="m-project-sub">{p.subtitle}</span>
          </div>
          {p.github && (
            <a
              href={p.github}
              target="_blank"
              rel="noopener noreferrer"
              className="m-github-btn"
            >
              GitHub →
            </a>
          )}
        </div>
        <p>{p.description}</p>
        <div className="m-tech-row">
          {p.tech.map((t) => (
            <span key={t} className="m-tech-tag">
              {t}
            </span>
          ))}
        </div>
      </div>
    ))}
  </div>
);

const ContactSection: React.FC = () => (
  <div className="m-section">
    <h2 className="m-title">Get In Touch</h2>
    <p className="m-tagline">A role, a project, or just to say hey</p>

    <div className="m-card m-card--availability">
      <h3 className="m-card-title">Availability</h3>
      <p>{IDENTITY.availability}</p>
    </div>

    <div className="m-card">
      <ContactRow
        label="Email"
        value={CONTACT.email}
        href={`mailto:${CONTACT.email}`}
      />
      <ContactRow
        label="GitHub"
        value={CONTACT.githubLabel}
        href={CONTACT.github}
      />
      <ContactRow
        label="LinkedIn"
        value={CONTACT.linkedinLabel}
        href={CONTACT.linkedin}
      />
      <ContactRow label="Location" value={CONTACT.location} />
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
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="m-contact-value"
      >
        {value}
      </a>
    ) : (
      <span className="m-contact-value">{value}</span>
    )}
  </div>
);
