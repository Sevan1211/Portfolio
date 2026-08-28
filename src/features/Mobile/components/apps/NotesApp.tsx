import React from "react";
import { ABOUT } from "@shared/content/portfolio";

/**
 * The yellow legal pad. The off-the-clock half of the story lives here in
 * marker scrawl: LEGO robots, golf, and the next trip.
 */
export const NotesApp: React.FC = () => (
  <div className="rp-notes-paper">
    <h3>Off the clock</h3>
    {ABOUT.personal.map((paragraph) => (
      <p key={paragraph}>{paragraph}</p>
    ))}
  </div>
);
