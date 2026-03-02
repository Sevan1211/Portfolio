/**
 * Returns `true` when the user is on an actual mobile/tablet device.
 *
 * Uses device capabilities (coarse pointer, touch points, user-agent) rather
 * than viewport width so that resizing a desktop browser window never
 * accidentally triggers the mobile layout.
 *
 * The value is computed once at module load and never changes.
 */

const IS_MOBILE = typeof window !== 'undefined' && detectMobileDevice();

export const useIsMobile = (): boolean => IS_MOBILE;

function detectMobileDevice(): boolean {
  // 1. Primary input is a coarse pointer (finger) — most reliable signal
  if (window.matchMedia('(pointer: coarse)').matches) {
    return true;
  }

  // 2. Device reports touch capability AND small screen
  //    (some laptops have touch screens, so we also check screen width)
  if (navigator.maxTouchPoints > 0 && window.screen.width <= 1024) {
    return true;
  }

  // 3. User-agent fallback for older browsers
  if (/Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    return true;
  }

  return false;
}
