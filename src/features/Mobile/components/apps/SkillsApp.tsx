import React from "react";
import { LANGUAGES, SKILL_GROUPS } from "@shared/content/portfolio";

/** Skills are intentionally separate from Experience so both scan cleanly. */
export const SkillsApp: React.FC = () => (
  <>
    <p className="rp-grouplabel">Languages</p>
    <div className="rp-group">
      <div className="rp-tags rp-tags--roomy">
        {LANGUAGES.map((language) => (
          <span className="rp-tag" key={language}>
            {language}
          </span>
        ))}
      </div>
    </div>

    {SKILL_GROUPS.map((group) => (
      <React.Fragment key={group.id}>
        <p className="rp-grouplabel">{group.label}</p>
        <div className="rp-group">
          <div className="rp-tags rp-tags--roomy">
            {group.items.map((skill) => (
              <span className="rp-tag" key={skill}>
                {skill}
              </span>
            ))}
          </div>
        </div>
      </React.Fragment>
    ))}
  </>
);
