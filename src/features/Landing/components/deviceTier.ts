// Capability tiering for the 3D scene.
//
// Capable machines keep every quality setting; only genuinely weak hardware
// trades pixels for a stable frame rate - a stutter is far more visible than
// a slightly lower render resolution. The tier is resolved once at module
// load, and `AdaptiveQuality` in CubicleScene can still step DPR down at
// runtime if a device underperforms its tier.

export type DeviceTier = "low" | "medium" | "high";

interface QualitySettings {
  maxDpr: number;
  antialias: boolean;
  anisotropy: number;
  shadowMapSize: number;
}

const detectTier = (): DeviceTier => {
  if (typeof navigator === "undefined") return "medium";

  const cores = navigator.hardwareConcurrency ?? 4;
  // Chromium-only; treated as "unknown" elsewhere rather than assumed bad.
  const memory = (navigator as Navigator & { deviceMemory?: number })
    .deviceMemory;

  if (cores <= 4 || (memory !== undefined && memory <= 4)) return "low";
  if (cores >= 8 && (memory === undefined || memory >= 8)) return "high";
  return "medium";
};

export const DEVICE_TIER: DeviceTier = detectTier();

const TIER_SETTINGS: Record<DeviceTier, QualitySettings> = {
  low: { maxDpr: 1, antialias: false, anisotropy: 4, shadowMapSize: 1024 },
  medium: { maxDpr: 1.5, antialias: true, anisotropy: 8, shadowMapSize: 2048 },
  high: { maxDpr: 1.75, antialias: true, anisotropy: 16, shadowMapSize: 2048 },
};

export const QUALITY: QualitySettings = TIER_SETTINGS[DEVICE_TIER];
