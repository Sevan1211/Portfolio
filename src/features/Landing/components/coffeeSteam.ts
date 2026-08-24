// Animated steam for the coffee mug: a few soft billboard puffs that rise,
// sway, expand, and dissolve on a staggered loop. Everything is generated -
// one tiny radial-gradient texture, no assets.

import {
  CanvasTexture,
  Group,
  Sprite,
  SpriteMaterial,
  Vector3,
} from "three";

const PUFF_COUNT = 10;
const PEAK_OPACITY = 0.11;

interface Puff {
  sprite: Sprite;
  material: SpriteMaterial;
  age: number;
  lifetime: number;
  phase: number;
  drift: number;
}

export interface SteamSystem {
  group: Group;
  /** Advance the animation; call from the frame loop. */
  update(elapsedSeconds: number, deltaSeconds: number): void;
  dispose(): void;
}

function createWispTexture(): CanvasTexture {
  // A soft, vertically elongated wisp rather than a round puff - real steam
  // reads as thin ribbons, not smoke balls.
  const width = 32;
  const height = 64;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (context) {
    context.translate(width / 2, height / 2);
    context.scale(1, 2.1);
    const gradient = context.createRadialGradient(0, 0, 1, 0, 0, width * 0.42);
    gradient.addColorStop(0, "rgba(238, 242, 248, 0.5)");
    gradient.addColorStop(0.5, "rgba(238, 242, 248, 0.2)");
    gradient.addColorStop(1, "rgba(238, 242, 248, 0)");
    context.fillStyle = gradient;
    context.fillRect(-width / 2, -height / 2, width, height);
  }
  return new CanvasTexture(canvas);
}

/**
 * @param origin world-space point at the mug's rim where puffs are born
 * @param plumeHeight world-space height the steam should rise
 */
export function createSteamSystem(
  origin: Vector3,
  plumeHeight: number,
): SteamSystem {
  const texture = createWispTexture();
  const group = new Group();
  const puffBaseScale = plumeHeight * 0.19;
  const swayAmplitude = plumeHeight * 0.055;

  const puffs: Puff[] = [];
  for (let index = 0; index < PUFF_COUNT; index += 1) {
    const material = new SpriteMaterial({
      map: texture,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    const sprite = new Sprite(material);
    sprite.renderOrder = 5;
    group.add(sprite);
    puffs.push({
      sprite,
      material,
      // Stagger births across the loop so the column is continuous.
      age: -(index / PUFF_COUNT) * 2.0,
      lifetime: 1.7 + (index % 4) * 0.22,
      phase: index * 2.1,
      drift: index % 2 === 0 ? 1 : -1,
    });
  }

  const update = (elapsedSeconds: number, deltaSeconds: number) => {
    for (const puff of puffs) {
      puff.age += deltaSeconds;
      if (puff.age < 0) {
        puff.material.opacity = 0;
        continue;
      }
      let t = puff.age / puff.lifetime;
      if (t >= 1) {
        puff.age = 0;
        t = 0;
      }

      // Ease the rise so wisps decelerate near the top like real steam.
      const rise = plumeHeight * (1 - Math.pow(1 - t, 1.7));
      // A narrow wavering column: small offsets, higher frequency, plus a
      // fixed per-wisp birth offset so the column isn't a perfect line.
      const birthOffset = (((puff.phase * 7.3) % 1) - 0.5) * plumeHeight * 0.05;
      const sway =
        birthOffset +
        Math.sin(elapsedSeconds * 2.2 + puff.phase) *
          swayAmplitude *
          t *
          puff.drift;
      const swayDepth =
        Math.cos(elapsedSeconds * 1.7 + puff.phase * 1.7) *
        swayAmplitude *
        0.6 *
        t;

      puff.sprite.position.set(
        origin.x + sway,
        origin.y + rise,
        origin.z + swayDepth,
      );
      // Wisps stretch vertically as they climb and only widen slightly.
      const width = puffBaseScale * (0.7 + t * 0.5);
      const height = puffBaseScale * (1.4 + t * 1.6);
      puff.sprite.scale.set(width, height, 1);

      // Quick fade-in, then an early, gentle thin-out.
      const fade =
        t < 0.15 ? t / 0.15 : Math.pow(1 - (t - 0.15) / 0.85, 1.35);
      puff.material.opacity = PEAK_OPACITY * fade;
    }
  };

  const dispose = () => {
    for (const puff of puffs) {
      group.remove(puff.sprite);
      puff.material.dispose();
    }
    texture.dispose();
  };

  return { group, update, dispose };
}
