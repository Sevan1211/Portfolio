import React from "react";
import { motion } from "framer-motion";
import { PROJECTS, type ProjectEntry } from "@shared/content/portfolio";
import { PageHead } from "../../../components/win95/Win95";
import "../styles/projects-page.css";

/* ── Card component ── */
const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.35 },
  }),
};

const ProjectCard: React.FC<{ project: ProjectEntry; index: number }> = ({
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
      <span
        className="project-monogram"
        style={{ background: project.accent }}
        aria-hidden="true"
      >
        {project.monogram}
      </span>
      <div>
        <h4 className="project-title">{project.title}</h4>
        <span className="project-subtitle">{project.subtitle}</span>
      </div>
      <span className="project-status">{project.status}</span>
    </div>

    <p className="project-role">{project.role}</p>
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

    {project.links.length > 0 ? (
      <div className="project-links">
        {project.links.map((link) => (
          <a
            className="project-github-link"
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            key={link.href}
          >
            {link.label} ↗
          </a>
        ))}
      </div>
    ) : (
      <p className="project-private-note">
        Private/local project · public-safe architecture summary
      </p>
    )}
  </motion.div>
);

/* ── Page ── */
export const ProjectsPage: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -6, transition: { duration: 0.12 } }}
    transition={{ duration: 0.2 }}
    className="content-wrapper"
  >
    <PageHead title="Featured Projects" sub="Things I've built & shipped" />

    <div className="projects-grid">
      {PROJECTS.map((project, i) => (
        <ProjectCard key={project.title} project={project} index={i} />
      ))}
    </div>
  </motion.div>
);
