import React from 'react';
import { motion } from 'framer-motion';
import '../styles/projects-page.css';

/* ── Project data ── */
interface Project {
  title: string;
  subtitle: string;
  description: string;
  highlights: string[];
  tech: string[];
}

const PROJECTS: Project[] = [
  {
    title: 'PrepMe',
    subtitle: 'Interactive Coding & Learning Platform',
    description:
      'A full-stack platform with 170+ coding challenges across frontend, backend, database, and algorithm categories. Features a cloud sandbox with real Docker containers, an AI tutor ("Nova"), multi-language code execution (Python, JS, Java, C++, C), and a gamification/XP system.',
    highlights: [
      'Fullstack sandbox — Docker containers with terminal (xterm.js), Monaco editor & live preview',
      'Multi-layer security — Docker isolation, Bubblewrap, Seccomp syscall filtering',
      'Microservices architecture — React SPA, Go API, Python judge service',
    ],
    tech: [
      'React 18',
      'TypeScript',
      'Go',
      'Python',
      'FastAPI',
      'Docker',
      'PostgreSQL',
      'Redis',
      'Monaco Editor',
      'xterm.js',
      'Auth0',
      'WebSocket',
    ],
  },
  {
    title: 'CodeLive',
    subtitle: 'Live Technical Interview Platform',
    description:
      'A real-time collaborative coding interview platform with a VS Code–quality editor, live preview via in-browser transpilation, multi-file editing, and 250+ curated problems. Designed to replace whiteboard interviews with authentic development workflows.',
    highlights: [
      'Custom in-browser module system with Sucrase transpilation & double-buffered iframes',
      'Role-based access (Candidate / Interviewer) with Supabase auth & JWT validation',
      'Code-split Monaco editor (~454 KB main + ~354 KB editor chunk)',
    ],
    tech: [
      'React 19',
      'TypeScript',
      'Vite',
      'Node.js',
      'Express',
      'Supabase',
      'Monaco Editor',
      'Sucrase',
      'Tailwind CSS',
      'JSON Schema',
    ],
  },
  {
    title: 'Elmwood Exteriors',
    subtitle: 'Professional Business Website',
    description:
      'A fully responsive business website for a home exterior contracting company. Acts as a 24/7 digital storefront — showcasing services, displaying project galleries with before/after photos, and capturing leads through integrated contact and estimate request forms.',
    highlights: [
      'EmailJS integration for serverless form submissions — no backend required',
      'Interactive lightbox gallery with multi-photo project portfolios',
      'Pure CSS responsive design — all hand-crafted with media queries, flexbox & grid',
    ],
    tech: [
      'React 18',
      'JavaScript',
      'CSS3',
      'EmailJS',
      'React Slick',
      'React Lightbox',
      'Jest',
    ],
  },
];

/* ── Card component ── */
const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.35 },
  }),
};

const ProjectCard: React.FC<{ project: Project; index: number }> = ({
  project,
  index,
}) => (
  <motion.div
    className="project-card"
    custom={index}
    initial="hidden"
    animate="visible"
    variants={cardVariants}
  >
    <div className="project-card-header">
      <div>
        <h4 className="project-title">{project.title}</h4>
        <span className="project-subtitle">{project.subtitle}</span>
      </div>
    </div>

    <p className="project-desc">{project.description}</p>

    <ul className="project-highlights">
      {project.highlights.map((h) => (
        <li key={h}>{h}</li>
      ))}
    </ul>

    <div className="project-tech">
      {project.tech.map((t) => (
        <span key={t}>{t}</span>
      ))}
    </div>
  </motion.div>
);

/* ── Page ── */
export const ProjectsPage: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
    className="content-wrapper"
  >
    <div className="hero-section">
      <h2 className="section-title">Featured Projects</h2>
      <p className="tagline">Things I've built & shipped</p>
    </div>

    <div className="projects-grid">
      {PROJECTS.map((project, i) => (
        <ProjectCard key={project.title} project={project} index={i} />
      ))}
    </div>
  </motion.div>
);
