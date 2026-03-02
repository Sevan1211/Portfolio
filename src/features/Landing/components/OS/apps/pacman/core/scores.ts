/* ══════════════════════════════════════
   Pac-Man – High Score Manager
   ══════════════════════════════════════
   Persists top 10 scores in localStorage.
*/

import { HighScore } from './types';

const STORAGE_KEY = 'pacman-high-scores';
const MAX_SCORES = 10;

export function getHighScores(): HighScore[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as HighScore[];
  } catch {
    return [];
  }
}

export function getTopScore(): number {
  const scores = getHighScores();
  return scores.length > 0 ? scores[0]!.score : 0;
}

export function saveScore(score: number, level: number): HighScore[] {
  const scores = getHighScores();
  const entry: HighScore = {
    score,
    level,
    date: new Date().toISOString(),
  };
  scores.push(entry);
  scores.sort((a, b) => b.score - a.score);
  const trimmed = scores.slice(0, MAX_SCORES);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // Storage full or unavailable — silently fail
  }

  return trimmed;
}

export function isHighScore(score: number): boolean {
  const scores = getHighScores();
  if (scores.length < MAX_SCORES) return score > 0;
  const lowest = scores[scores.length - 1];
  return lowest ? score > lowest.score : score > 0;
}
