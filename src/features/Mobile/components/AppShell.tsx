import React, { useEffect, useId, useRef } from "react";
import { StatusBar } from "./StatusBar";

interface AppShellProps {
  title: string;
  onHome: () => void;
  battery: number;
  /** Dark chrome for the apps that want a black interior (Snake, Stats). */
  dark?: boolean;
  children: React.ReactNode;
}

/**
 * Every app lives in the same chrome: status bar, blue-steel navigation bar,
 * scrollable pinstripe body, and a round home button standing in for the
 * hardware one.
 */
export const AppShell: React.FC<AppShellProps> = ({
  title,
  onHome,
  battery,
  dark,
  children,
}) => {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const titleId = useId();

  useEffect(() => titleRef.current?.focus(), []);

  return (
    <div
      className="rp-applayer"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <StatusBar battery={battery} />
      <div className="rp-navbar">
        <h2
          ref={titleRef}
          id={titleId}
          tabIndex={-1}
          className="rp-navtitle"
          style={{ margin: 0 }}
        >
          {title}
        </h2>
      </div>
      <div className={dark ? "rp-appbody rp-appbody--dark" : "rp-appbody"}>
        <div className="rp-appcontent">{children}</div>
      </div>
      <div className="rp-homestrip">
        <button
          type="button"
          className="rp-homebtn"
          aria-label="Home"
          onClick={onHome}
        >
          <b aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};
