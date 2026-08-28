import React, { useEffect, useState } from "react";

interface StatusBarProps {
  battery: number;
}

/**
 * The era status bar: carrier, time, battery. The carrier is SEVAN because
 * this phone only gets one network. The battery is a running gag owned by
 * MobileLanding; it never dies, it just gets dramatic.
 */
export const StatusBar: React.FC<StatusBarProps> = ({ battery }) => {
  const [time, setTime] = useState(formatTime());

  useEffect(() => {
    const id = setInterval(() => setTime(formatTime()), 15000);
    return () => clearInterval(id);
  }, []);

  const battClass = battery <= 15 ? "rp-batt rp-batt--low" : "rp-batt";

  return (
    <div className="rp-status">
      <span className="rp-status-side">
        <span className="rp-signal" aria-hidden="true">
          <b style={{ height: 4 }} />
          <b style={{ height: 6 }} />
          <b style={{ height: 8 }} />
          <b style={{ height: 10 }} />
        </span>
        <span>SEVAN</span>
      </span>
      <span>{time}</span>
      <span className="rp-status-side rp-status-side--right">
        <span>{battery}%</span>
        <span className={battClass} aria-hidden="true">
          <b style={{ width: `${battery}%` }} />
        </span>
      </span>
    </div>
  );
};

function formatTime(): string {
  return new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}
