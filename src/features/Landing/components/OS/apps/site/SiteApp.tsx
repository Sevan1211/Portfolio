import React from "react";
import { SITE_INFO } from "@shared/content/portfolio";
import { GBox, PageHead } from "../../components/win95/Win95";
import { RetroBulb, RetroGitHub } from "../../components/icons/RetroIcons";
import { SiteDiagram } from "./SiteDiagram";
import "./styles/index.css";

/**
 * Explains how the portfolio itself is built. The copy lives in
 * SITE_INFO (shared content model) and follows the Google developer
 * documentation style guide; this component only lays it out.
 */
export const SiteApp: React.FC = () => {
  const credit = SITE_INFO.modelCredit;

  return (
    <div className="app-content site-app w95-ui w95-scroll">
      <div className="site-scroll">
        <PageHead
          title="About this site"
          sub="How the final desktop and mobile experiences work"
        />

        <p className="ab-p site-intro">{SITE_INFO.intro}</p>

        <dl className="site-status-grid" aria-label="Local build status">
          {SITE_INFO.status.map((item) => (
            <div className="site-status-card" key={item.label}>
              <dt>{item.label}</dt>
              <dd>{item.value}</dd>
            </div>
          ))}
        </dl>
        <p className="site-status-note">{SITE_INFO.statusNote}</p>

        {SITE_INFO.sections.map((section) => (
          <GBox label={section.title} key={section.id}>
            {section.id === "architecture" && <SiteDiagram />}
            {section.body.map((paragraph) => (
              <p className="ab-p" key={paragraph}>
                {paragraph}
              </p>
            ))}
            {section.id === "office" && (
              <p className="site-credit">
                {credit.prefix}{" "}
                <a
                  href={credit.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {credit.title}
                </a>{" "}
                by{" "}
                <a
                  href={credit.authorUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {credit.author}
                </a>
                , licensed{" "}
                <a
                  href={credit.licenseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {credit.license}
                </a>
                .
              </p>
            )}
          </GBox>
        ))}

        <GBox label="Try it">
          <div className="tip-row">
            <RetroBulb size={18} className="tip-icon" />
            <p>{SITE_INFO.tip}</p>
          </div>
        </GBox>

        <GBox label="Built with">
          <div className="ab-chip-row">
            {SITE_INFO.stack.map((tech) => (
              <span key={tech} className="ab-chip ab-chip--mono">
                {tech}
              </span>
            ))}
          </div>
          <a
            className="ab-btn site-repo-btn"
            href={SITE_INFO.repo}
            target="_blank"
            rel="noopener noreferrer"
          >
            <RetroGitHub size={14} />
            <span>View the source on GitHub</span>
          </a>
        </GBox>
      </div>
    </div>
  );
};
