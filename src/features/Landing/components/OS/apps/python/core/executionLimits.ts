/** Judge-style resource limits for code executed in the browser. */
export const EXECUTION_TIME_LIMIT_MS = 3_000;
export const PACKAGE_SETUP_LIMIT_MS = 45_000;
export const PYODIDE_BOOT_LIMIT_MS = 45_000;
export const OUTPUT_CHARACTER_LIMIT = 16_000;
export const OUTPUT_BATCH_CHARACTER_LIMIT = 2_000;
export const OUTPUT_BATCH_LINE_LIMIT = 64;

export interface OutputBudgetResult {
  acceptedText: string;
  nextUsed: number;
  exceeded: boolean;
}

/**
 * Takes only the portion of an output chunk that fits inside the run's
 * remaining character budget. Keeping this pure makes the worker guard easy
 * to verify without booting Pyodide in a test process.
 */
export function takeOutputWithinBudget(
  used: number,
  text: string,
  limit = OUTPUT_CHARACTER_LIMIT,
): OutputBudgetResult {
  const safeUsed = Math.max(0, used);
  const remaining = Math.max(0, limit - safeUsed);
  const acceptedText = text.slice(0, remaining);

  return {
    acceptedText,
    nextUsed: safeUsed + acceptedText.length,
    exceeded: text.length > remaining,
  };
}

export const executionLimitLabel = `${EXECUTION_TIME_LIMIT_MS / 1000}s`;
export const outputLimitLabel = `${Math.round(OUTPUT_CHARACTER_LIMIT / 1000)}k chars`;
