import React from "react";
import { SITE_INFO } from "@shared/content/portfolio";

interface SettingsAppProps {
  reduceMotion: boolean;
  systemReduceMotion: boolean;
  simplifiedGraphics: boolean;
  highContrast: boolean;
  onToggleReduceMotion: () => void;
  onToggleSimplifiedGraphics: () => void;
  onToggleHighContrast: () => void;
}

/**
 * Settings that materially change the mobile experience.
 */
export const SettingsApp: React.FC<SettingsAppProps> = ({
  reduceMotion,
  systemReduceMotion,
  simplifiedGraphics,
  highContrast,
  onToggleReduceMotion,
  onToggleSimplifiedGraphics,
  onToggleHighContrast,
}) => (
  <>
    <div className="rp-group">
      <div className="rp-row" style={{ alignItems: "center" }}>
        <span>
          <span className="rp-rowlabel">Reduce motion</span>
          {systemReduceMotion && (
            <small className="rp-setting-note">On in system settings</small>
          )}
        </span>
        <Toggle
          on={reduceMotion}
          label="Reduce motion"
          onToggle={onToggleReduceMotion}
          disabled={systemReduceMotion}
        />
      </div>
      <div className="rp-row" style={{ alignItems: "center" }}>
        <span className="rp-rowlabel">Simplified graphics</span>
        <Toggle
          on={simplifiedGraphics}
          label="Simplified graphics"
          onToggle={onToggleSimplifiedGraphics}
        />
      </div>
      <div className="rp-row" style={{ alignItems: "center" }}>
        <span className="rp-rowlabel">High contrast</span>
        <Toggle
          on={highContrast}
          label="High contrast"
          onToggle={onToggleHighContrast}
        />
      </div>
    </div>
    <p className="rp-note">
      These choices stay on this device. Your operating-system motion preference
      always takes priority.
    </p>

    <p className="rp-grouplabel">About this website</p>
    <div className="rp-group">
      <div className="rp-row">
        <span className="rp-rowlabel">Name</span>
        <span className="rp-rowvalue">sevanlewispayne.com</span>
      </div>
      <div className="rp-row">
        <span className="rp-rowlabel">Version</span>
        <span className="rp-rowvalue">7.0 (Omaha)</span>
      </div>
      <div className="rp-row">
        <span className="rp-rowlabel">Carrier</span>
        <span className="rp-rowvalue">SEVAN</span>
      </div>
      <div className="rp-row rp-row--stacked">
        <span className="rp-rowlabel">Made with</span>
        <span className="rp-rowvalue">{SITE_INFO.stack.join(", ")}</span>
      </div>
      <a
        className="rp-row"
        href={SITE_INFO.repo}
        target="_blank"
        rel="noopener noreferrer"
      >
        <span className="rp-rowlabel">Source code</span>
        <span className="rp-rowvalue">GitHub →</span>
      </a>
    </div>
  </>
);

const Toggle: React.FC<{
  on: boolean;
  label: string;
  onToggle: () => void;
  disabled?: boolean;
}> = ({ on, label, onToggle, disabled }) => (
  <button
    type="button"
    role="switch"
    aria-checked={on}
    aria-label={label}
    className={on ? "rp-toggle rp-toggle--on" : "rp-toggle"}
    onClick={onToggle}
    disabled={disabled}
  >
    <b aria-hidden="true" />
  </button>
);
