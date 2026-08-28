import React, { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, FolderClosed, User } from "lucide-react";
import type { AppId } from "./HomeScreen";

interface LockScreenProps {
  /** Unlock the phone; optionally straight into an app. */
  onUnlock: (target?: AppId) => void;
  /** Status bar element, rendered at the top of the lock layer. */
  statusBar?: React.ReactNode;
}

const UNLOCK_RATIO = 0.72;
const TAP_SLOP_PX = 8;
const KNOB_SIZE = 44;

/**
 * The 2007 hello: clock band, a couple of lock-screen notifications carrying
 * the recruiter signals, and a slide-to-unlock control that actually slides.
 * The knob is a real button: Enter, Space, or a plain tap also unlock.
 */
export const LockScreen: React.FC<LockScreenProps> = ({
  onUnlock,
  statusBar,
}) => {
  const [time, setTime] = useState(getTime());
  const [dateStr, setDateStr] = useState(getDate());
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);

  const trackRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const maxXRef = useRef(1);

  useEffect(() => {
    const id = setInterval(() => {
      setTime(getTime());
      setDateStr(getDate());
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      const track = trackRef.current;
      if (!track) return;
      maxXRef.current = Math.max(1, track.clientWidth - 8 - KNOB_SIZE);
      startXRef.current = e.clientX;
      setDragging(true);
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    [],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      if (!dragging) return;
      const next = Math.min(
        maxXRef.current,
        Math.max(0, e.clientX - startXRef.current),
      );
      setDragX(next);
    },
    [dragging],
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      if (!dragging) return;
      setDragging(false);
      const travelled = e.clientX - startXRef.current;
      if (
        dragX >= maxXRef.current * UNLOCK_RATIO ||
        Math.abs(travelled) < TAP_SLOP_PX
      ) {
        onUnlock();
      } else {
        setDragX(0);
      }
    },
    [dragging, dragX, onUnlock],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onUnlock();
      }
    },
    [onUnlock],
  );

  return (
    <div className="rp-lock">
      {statusBar}
      <div className="rp-lock-clockband">
        <div className="rp-lock-time">{time}</div>
        <div className="rp-lock-date">{dateStr}</div>
      </div>

      <div className="rp-lock-ntfs">
        <button
          type="button"
          className="rp-ntf"
          onClick={() => onUnlock("about")}
        >
          <span
            className="rp-ntf-icon"
            style={{ background: "linear-gradient(180deg, #7ade6a, #2f9e20)" }}
          >
            <User size={18} aria-hidden="true" />
          </span>
          <span>
            <span className="rp-ntf-title">Sevan Lewis-Payne</span>
            <span className="rp-ntf-body" style={{ display: "block" }}>
              Data &amp; software engineer. Tap to meet me.
            </span>
          </span>
        </button>
        <button
          type="button"
          className="rp-ntf"
          onClick={() => onUnlock("projects")}
        >
          <span
            className="rp-ntf-icon"
            style={{
              background: "linear-gradient(180deg, #f4f5f7, #c9cdd6)",
              color: "#d0342c",
            }}
          >
            <FolderClosed size={18} aria-hidden="true" />
          </span>
          <span>
            <span className="rp-ntf-title">Available May 2027</span>
            <span className="rp-ntf-body" style={{ display: "block" }}>
              View featured systems and tools.
            </span>
          </span>
        </button>
      </div>

      <div className="rp-slideband">
        <div className="rp-slidetrack" ref={trackRef}>
          <button
            type="button"
            className="rp-slideknob"
            aria-label="Slide or press Enter to unlock"
            style={{
              transform: `translateX(${dragX}px)`,
              transition: dragging ? "none" : "transform 0.25s ease",
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={() => {
              setDragging(false);
              setDragX(0);
            }}
            onKeyDown={handleKeyDown}
          >
            <ArrowRight size={20} aria-hidden="true" />
          </button>
          <span
            className="rp-slidetext"
            style={{ opacity: dragX > 12 ? 0 : 1 }}
          >
            slide to unlock
          </span>
        </div>
      </div>
    </div>
  );
};

function getTime(): string {
  return new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function getDate(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}
