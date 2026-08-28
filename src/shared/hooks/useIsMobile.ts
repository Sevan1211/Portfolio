import { useEffect, useState } from "react";

const MOBILE_LAYOUT_QUERY = "(max-width: 1024px)";

function devOverride(): boolean | null {
  if (!import.meta.env.DEV) return null;
  const param = new URLSearchParams(window.location.search).get("mobile");
  if (param === null) return null;
  return param !== "0";
}

/**
 * Selects the layout from the actual viewport, so narrow desktop windows and
 * tablets receive the interface that fits. Dev-only ?mobile=1/0 remains a
 * deterministic visual-QA override.
 */
export const useIsMobile = (): boolean => {
  const override = typeof window === "undefined" ? null : devOverride();
  const [matches, setMatches] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia(MOBILE_LAYOUT_QUERY).matches,
  );

  useEffect(() => {
    if (override !== null) return;
    const media = window.matchMedia(MOBILE_LAYOUT_QUERY);
    const update = () => setMatches(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [override]);

  return override ?? matches;
};
