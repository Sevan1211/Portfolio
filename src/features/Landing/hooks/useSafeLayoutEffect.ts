import { useEffect, useLayoutEffect } from 'react';

/**
 * Resolves to `useLayoutEffect` in the browser and falls back to `useEffect`
 * when rendering in environments where the layout effect is not available
 * (e.g. during SSR or static pre-rendering).
 */
export const useSafeLayoutEffect = typeof window !== 'undefined'
  ? useLayoutEffect
  : useEffect;
