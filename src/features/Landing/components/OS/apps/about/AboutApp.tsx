import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import {
  RetroUser,
  RetroBuilding,
  RetroBriefcase,
  RetroMail,
  RetroSparkle,
} from '../../components/icons/RetroIcons';
import { AboutPage } from './components/AboutPage';
import { ExperiencePage } from './components/ExperiencePage';
import { ProjectsPage } from './components/ProjectsPage';
import { ContactPage } from './components/ContactPage';
import './styles/index.css';

type TabId = 'about' | 'experience' | 'projects' | 'contact';

const TABS: { id: TabId; label: string; Icon: React.FC<{ className?: string }> }[] = [
  { id: 'about', label: 'About', Icon: RetroUser },
  { id: 'experience', label: 'Experience', Icon: RetroBuilding },
  { id: 'projects', label: 'Projects', Icon: RetroBriefcase },
  { id: 'contact', label: 'Contact', Icon: RetroMail },
];

const PAGE_MAP: Record<TabId, React.ReactNode> = {
  about: <AboutPage />,
  experience: <ExperiencePage />,
  projects: <ProjectsPage />,
  contact: <ContactPage />,
};

export const AboutApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('about');

  return (
    <div className="about-app">
      <div className="about-shell">
        <div className="about-layout">
          {/* Sidebar */}
          <div className="about-sidebar">
            <div className="nav-menu">
              {TABS.map(({ id, label, Icon }) => (
                <div
                  key={id}
                  className={`nav-item ${activeTab === id ? 'active' : ''}`}
                  onClick={() => setActiveTab(id)}
                >
                  <Icon className="nav-item-icon" />
                  <span>{label}</span>
                </div>
              ))}
            </div>

            <div className="sidebar-widget">
              <div className="widget-title">
                <RetroSparkle size={14} />
                <span>Portfolio OS</span>
              </div>
              <p>v1.0 Retro Edition</p>
            </div>
          </div>

          {/* Content */}
          <div className="about-content">
            <div className="crt-overlay" />
            <AnimatePresence mode="wait">
              {PAGE_MAP[activeTab]}
            </AnimatePresence>
          </div>
        </div>

        {/* Status bar */}
        <div className="about-statusbar">
          <div className="status-segment">
            <div className="status-led" />
            <span>ONLINE</span>
          </div>
          <div className="status-segment">
            <span>MEM: 64MB OK</span>
          </div>
          <div className="status-segment" style={{ marginLeft: 'auto' }}>
            <span>MODE: PORTFOLIO</span>
          </div>
        </div>
      </div>
    </div>
  );
};
