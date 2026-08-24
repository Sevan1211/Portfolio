import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import {
  RetroUser,
  RetroBuilding,
  RetroBriefcase,
  RetroMail,
  RetroAward,
  RetroCode,
} from '../../components/icons/RetroIcons';
import { AboutPage } from './components/AboutPage';
import { ExperiencePage } from './components/ExperiencePage';
import { EducationPage } from './components/EducationPage';
import { SkillsPage } from './components/SkillsPage';
import { ProjectsPage } from './components/ProjectsPage';
import { ContactPage } from './components/ContactPage';
import { CONTACT, IDENTITY } from '@shared/content/portfolio';
import './styles/index.css';

type TabId =
  | 'about'
  | 'experience'
  | 'education'
  | 'skills'
  | 'projects'
  | 'contact';

const TABS: {
  id: TabId;
  label: string;
  Icon: React.FC<{ className?: string; size?: number }>;
}[] = [
  { id: 'about', label: 'About', Icon: RetroUser },
  { id: 'experience', label: 'Experience', Icon: RetroBuilding },
  { id: 'education', label: 'Education', Icon: RetroAward },
  { id: 'skills', label: 'Skills', Icon: RetroCode },
  { id: 'projects', label: 'Projects', Icon: RetroBriefcase },
  { id: 'contact', label: 'Contact', Icon: RetroMail },
];

const PAGE_MAP: Record<TabId, React.FC> = {
  about: AboutPage,
  experience: ExperiencePage,
  education: EducationPage,
  skills: SkillsPage,
  projects: ProjectsPage,
  contact: ContactPage,
};

export const AboutApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('about');
  const contentRef = useRef<HTMLDivElement>(null);
  const ActivePage = PAGE_MAP[activeTab];

  // Each tab is its own page - start it at the top instead of inheriting the
  // previous tab's scroll offset.
  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0 });
  }, [activeTab]);

  return (
    <div className="about-app w95-ui">
      <div className="about-shell">
        <div className="about-layout">
          {/* Sidebar */}
          <div className="about-sidebar">
            <div className="nav-menu" role="tablist">
              {TABS.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  className={`nav-item ${activeTab === id ? 'active' : ''}`}
                  onClick={() => setActiveTab(id)}
                  aria-selected={activeTab === id}
                  role="tab"
                  type="button"
                >
                  <Icon className="nav-item-icon" />
                  <span>{label}</span>
                </button>
              ))}
            </div>

            <div className="sidebar-sep" aria-hidden="true" />
            <a
              className="sidebar-resume"
              href={CONTACT.resumePath}
              download
            >
              Download Resume
            </a>
          </div>

          {/* Content */}
          <div className="about-content w95-scroll" ref={contentRef}>
            <div className="crt-overlay" />
            <AnimatePresence mode="wait">
              <ActivePage key={activeTab} />
            </AnimatePresence>
          </div>
        </div>

        {/* Status bar */}
        <div className="about-statusbar">
          <div className="status-segment">
            <div className="status-led" />
            <span>{IDENTITY.availabilityShort}</span>
          </div>
          <div className="status-segment">
            <span>{IDENTITY.location}</span>
          </div>
          <div className="status-segment" style={{ marginLeft: 'auto' }}>
            <span>{IDENTITY.title}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
