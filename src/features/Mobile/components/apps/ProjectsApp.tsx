import React, { useState } from "react";
import { PROJECTS, type ProjectEntry } from "@shared/content/portfolio";

export const ProjectsApp: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = PROJECTS.find((project) => project.id === selectedId);

  if (selected) {
    return (
      <ProjectDetail project={selected} onBack={() => setSelectedId(null)} />
    );
  }

  return (
    <>
      <p className="rp-project-intro">
        Four systems that best show how I work across data, product, and
        software engineering.
      </p>
      <div className="rp-project-list">
        {PROJECTS.map((project) => (
          <button
            type="button"
            className="rp-project-row"
            key={project.id}
            onClick={() => setSelectedId(project.id)}
          >
            <ProjectBadge project={project} />
            <span className="rp-project-copy">
              <strong>{project.title}</strong>
              <span>{project.subtitle}</span>
              <small>{project.status}</small>
            </span>
            <span className="rp-chevron" aria-hidden="true">
              ›
            </span>
          </button>
        ))}
      </div>
    </>
  );
};

const ProjectDetail: React.FC<{
  project: ProjectEntry;
  onBack: () => void;
}> = ({ project, onBack }) => (
  <article className="rp-project-detail">
    <button type="button" className="rp-project-back" onClick={onBack}>
      <span aria-hidden="true">‹</span> All projects
    </button>
    <header className="rp-project-hero">
      <ProjectBadge project={project} large />
      <div>
        <h3>{project.title}</h3>
        <p>{project.subtitle}</p>
      </div>
    </header>

    <div className="rp-group">
      <div className="rp-row">
        <span className="rp-rowlabel">Status</span>
        <span className="rp-rowvalue">{project.status}</span>
      </div>
      <div className="rp-row">
        <span className="rp-rowlabel">Role</span>
        <span className="rp-rowvalue">{project.role}</span>
      </div>
    </div>

    <p className="rp-grouplabel">Overview</p>
    <div className="rp-group">
      <p className="rp-textrow">{project.description}</p>
      <ul className="rp-bullets">
        {project.highlights.map((highlight) => (
          <li key={highlight}>{highlight}</li>
        ))}
      </ul>
      <div className="rp-tags">
        {project.tech.map((tech) => (
          <span className="rp-tag" key={tech}>
            {tech}
          </span>
        ))}
      </div>
    </div>

    {project.links.length > 0 ? (
      <>
        <p className="rp-grouplabel">Open</p>
        <div className="rp-group">
          {project.links.map((link) => (
            <a
              className="rp-row"
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              key={link.href}
            >
              <span className="rp-rowlabel">{link.label}</span>
              <span className="rp-rowvalue">Open ↗</span>
            </a>
          ))}
        </div>
      </>
    ) : (
      <p className="rp-note">
        Private/local project. Architecture and measured results shown here are
        the public-safe summary.
      </p>
    )}
  </article>
);

const ProjectBadge: React.FC<{ project: ProjectEntry; large?: boolean }> = ({
  project,
  large,
}) => (
  <span
    className={
      large ? "rp-project-badge rp-project-badge--large" : "rp-project-badge"
    }
    style={{ backgroundColor: project.accent }}
    aria-hidden="true"
  >
    {project.monogram}
  </span>
);
