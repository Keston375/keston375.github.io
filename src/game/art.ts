// Hand-coded pixel art for the town: nature, props and buildings.
import { ellipse, makeCanvas, outline, px, rng, shadow, type Ctx, type Sprite } from './sprites';

const STONE = '#8a8494';
const STONE_HI = '#b8b2c0';
const FRAME = '#4a3728';
const GOLD = '#f6c453';
const GOLD_SH = '#d9a520';

// ───────────────────────── nature ─────────────────────────

const LEAF = { dark: '#2d6b37', mid: '#3f8f46', light: '#5fb35a', hi: '#8bd16a' };
const TRUNK = { mid: '#7a4b2a', dark: '#5a351d' };

/** 32x40 tree. Roots sit at y=37; the trunk is centered at x=16. */
export function makeTree(seed: number, kind: 'round' | 'pine'): Sprite {
  const r = rng(seed);
  const cv = makeCanvas(32, 40, (c) => {
    px(c, TRUNK.dark, 13, 26, 6, 11);
    px(c, TRUNK.mid, 14, 26, 3, 11);
    px(c, TRUNK.dark, 12, 35, 8, 2);
    if (kind === 'round') {
      ellipse(c, LEAF.dark, 16, 16, 14, 13);
      ellipse(c, LEAF.mid, 15, 14, 12, 11);
      ellipse(c, LEAF.light, 12, 10, 7, 6);
      ellipse(c, LEAF.hi, 10, 8, 3, 2);
      for (let i = 0; i < 14; i++) {
        const x = 5 + Math.floor(r() * 21);
        const y = 5 + Math.floor(r() * 19);
        px(c, r() < 0.5 ? LEAF.light : LEAF.dark, x, y, 2, 1);
      }
      if (r() < 0.3) {
        // apples
        for (let i = 0; i < 4; i++) px(c, '#e0473a', 7 + Math.floor(r() * 18), 9 + Math.floor(r() * 14), 2, 2);
      }
    } else {
      const tiers: [number, number][] = [[3, 5], [9, 8], [15, 11], [21, 13]];
      for (const [top, hw] of tiers) {
        for (let i = 0; i < 9; i++) {
          const w = Math.max(1, Math.round((hw * (i + 1)) / 9));
          px(c, LEAF.dark, 16 - w, top + i, w * 2, 1);
          px(c, LEAF.mid, 16 - w + 1, top + i, w, 1);
        }
        px(c, LEAF.light, 14, top + 3, 2, 1);
      }
    }
  });
  outline(cv);
  shadow(cv, 16, 36, 10, 3);
  return cv;
}

export function makeBush(seed: number): Sprite {
  const r = rng(seed);
  const cv = makeCanvas(18, 16, (c) => {
    ellipse(c, LEAF.dark, 9, 9, 7, 5);
    ellipse(c, LEAF.mid, 8, 8, 5, 4);
    px(c, LEAF.light, 5, 6, 3, 1);
    if (r() < 0.5) {
      const berry = r() < 0.5 ? '#e0473a' : '#f2f2f2';
      px(c, berry, 6, 9);
      px(c, berry, 10, 7);
      px(c, berry, 12, 10);
    }
  });
  outline(cv);
  shadow(cv, 9, 14, 7, 2);
  return cv;
}

export function makeRock(): Sprite {
  const cv = makeCanvas(14, 11, (c) => {
    ellipse(c, '#7c7686', 7, 6, 5, 4);
    ellipse(c, '#a29cad', 6, 5, 3, 2);
  });
  outline(cv);
  return cv;
}

// ───────────────────────── props ─────────────────────────

export function makeMailbox(): Sprite {
  const cv = makeCanvas(16, 28, (c) => {
    px(c, '#6b4a2f', 7, 14, 3, 13);
    px(c, '#c93b3b', 3, 4, 11, 10);
    px(c, '#c93b3b', 4, 3, 9, 1);
    px(c, '#e25c5c', 4, 4, 9, 2);
    px(c, '#9e2a2a', 3, 12, 11, 2);
    px(c, '#2a1f1d', 5, 7, 7, 1);
    px(c, '#3b3f4f', 14, 3, 1, 8);
    px(c, GOLD, 14, 3, 2, 3);
  });
  outline(cv);
  shadow(cv, 8, 26, 5, 2);
  return cv;
}

export function makeSign(): Sprite {
  const cv = makeCanvas(18, 22, (c) => {
    px(c, '#6b4a2f', 4, 11, 2, 10);
    px(c, '#6b4a2f', 12, 11, 2, 10);
    px(c, '#b98a55', 1, 2, 16, 10);
    px(c, '#d4a76f', 1, 2, 16, 2);
    px(c, '#8a6238', 1, 11, 16, 1);
    px(c, '#5a3d2a', 4, 6, 10, 1);
    px(c, '#5a3d2a', 4, 8, 7, 1);
  });
  outline(cv);
  shadow(cv, 9, 20, 6, 2);
  return cv;
}

export function makeLamp(): Sprite {
  const cv = makeCanvas(14, 34, (c) => {
    px(c, '#3a3f55', 6, 9, 2, 22);
    px(c, '#3a3f55', 4, 29, 6, 3);
    px(c, '#3a3f55', 3, 4, 8, 2);
    px(c, '#ffe39a', 4, 6, 6, 4);
    px(c, '#fff6cf', 5, 6, 2, 2);
    px(c, '#3a3f55', 5, 2, 4, 2);
  });
  outline(cv);
  shadow(cv, 7, 32, 4, 1);
  return cv;
}

export function makeBench(): Sprite {
  const cv = makeCanvas(32, 18, (c) => {
    px(c, '#3a3f55', 4, 10, 2, 7);
    px(c, '#3a3f55', 26, 10, 2, 7);
    px(c, '#9c6b43', 2, 2, 28, 3);
    px(c, '#9c6b43', 2, 6, 28, 3);
    px(c, '#b9875a', 2, 10, 28, 3);
    px(c, '#7a5232', 2, 12, 28, 1);
  });
  outline(cv);
  shadow(cv, 16, 16, 13, 2);
  return cv;
}

/** 64x48 fountain, two animation frames. */
export function makeFountain(): Sprite[] {
  return [0, 1].map((f) => {
    const cv = makeCanvas(64, 48, (c) => {
      ellipse(c, '#8f8879', 32, 33, 30, 12);
      ellipse(c, '#c4bdaf', 32, 31, 30, 12);
      ellipse(c, '#3f86c8', 32, 31, 25, 8);
      ellipse(c, '#5aa7e3', 32, 30, 20, 5);
      // ripples
      const rip = f ? [[16, 31], [44, 29], [30, 35]] : [[20, 33], [40, 32], [34, 27]];
      for (const [x, y] of rip) px(c, '#cfe9f7', x, y, 4, 1);
      // pillar + top bowl
      px(c, '#c4bdaf', 28, 12, 8, 19);
      px(c, '#9e9789', 34, 12, 2, 19);
      ellipse(c, '#c4bdaf', 32, 13, 10, 3);
      ellipse(c, '#5aa7e3', 32, 12, 7, 2);
      // spray
      const drops = f
        ? [[31, 3], [27, 6], [36, 5], [23, 10], [40, 9], [21, 16], [43, 18], [22, 22], [42, 24]]
        : [[32, 2], [28, 5], [35, 6], [24, 9], [39, 10], [22, 14], [42, 15], [21, 20], [43, 21]];
      for (const [x, y] of drops) px(c, '#cfe9f7', x, y, 2, 2);
      px(c, '#8fc8ee', 31, 4, 2, 8);
    });
    return outline(cv);
  });
}

// ───────────────────────── building helpers ─────────────────────────

function windowAt(c: Ctx, x: number, y: number, w = 12, h = 12) {
  px(c, FRAME, x - 1, y - 1, w + 2, h + 2);
  px(c, '#a8dcf2', x, y, w, h);
  px(c, '#7cc0e4', x, y + h / 2, w, h / 2);
  px(c, FRAME, x + w / 2 - 1, y, 2, h);
  px(c, FRAME, x, y + h / 2 - 1, w, 2);
  px(c, '#eafaff', x + 1, y + 1, 2, 2);
  px(c, '#d9cdb8', x - 2, y + h + 1, w + 4, 2);
}

function doorAt(c: Ctx, x: number, y: number, w: number, h: number, col: string, colSh: string) {
  px(c, '#3a2a20', x - 1, y - 1, w + 2, h + 1);
  px(c, col, x, y, w, h);
  for (let i = x + 3; i < x + w - 1; i += 4) px(c, colSh, i, y, 1, h);
  px(c, GOLD, x + w - 3, y + Math.floor(h / 2), 1, 2);
}

function gableRoof(c: Ctx, x0: number, x1: number, y: number, h: number, col: string, sh: string, hi: string) {
  for (let r = 0; r < h; r++) {
    const inset = r < 4 ? 4 - r : 0;
    const left = x0 + inset;
    const width = x1 - x0 - inset * 2;
    px(c, col, left, y + r, width, 1);
    if (r % 4 === 3) px(c, sh, left, y + r, width, 1);
    if (r % 4 === 1) {
      for (let x = left + ((r >> 2) % 2 ? 3 : 0); x < left + width; x += 6) px(c, sh, x, y + r, 1, 2);
    }
  }
  px(c, hi, x0 + 4, y, x1 - x0 - 8, 1);
  px(c, sh, x0, y + h - 2, x1 - x0, 2);
}

type Pattern = 'plank' | 'plankV' | 'brick';

function wall(c: Ctx, x: number, y: number, w: number, h: number, col: string, sh: string, pattern: Pattern) {
  px(c, col, x, y, w, h);
  if (pattern === 'plank') {
    for (let yy = y + 3; yy < y + h; yy += 4) px(c, sh, x, yy, w, 1);
  } else if (pattern === 'plankV') {
    for (let xx = x + 5; xx < x + w; xx += 6) px(c, sh, xx, y, 1, h);
  } else {
    for (let row = 0; y + row * 5 < y + h; row++) {
      const yy = y + row * 5;
      px(c, sh, x, yy + 4, w, 1);
      for (let xx = x + (row % 2 ? 0 : 4); xx < x + w; xx += 8) px(c, sh, xx, yy, 1, 4);
    }
  }
}

// ───────────────────────── buildings ─────────────────────────
// Each sprite is exactly (w*16) x (h*16) to match its tile footprint.

/** About Me — cozy house. 7x6 tiles, door at tile column 3. */
export function makeHouse(): Sprite {
  const cv = makeCanvas(112, 96, (c) => {
    px(c, '#8a4a3a', 78, 4, 12, 24);
    px(c, '#a55e4a', 80, 4, 8, 24);
    px(c, '#5b2f25', 76, 2, 16, 4);
    wall(c, 4, 40, 104, 52, '#f0e0bd', '#ddcaa3', 'plank');
    px(c, '#cdb98f', 4, 40, 104, 4);
    gableRoof(c, 1, 111, 10, 34, '#c9553e', '#9c3b2c', '#e0735a');
    ellipse(c, FRAME, 56, 25, 6, 6);
    ellipse(c, '#a8dcf2', 56, 25, 4, 4);
    px(c, FRAME, 55, 21, 2, 9);
    windowAt(c, 18, 54);
    windowAt(c, 82, 54);
    for (const wx of [18, 82]) {
      px(c, '#7a4b2a', wx - 2, 69, 16, 4);
      for (let i = 0; i < 5; i++) px(c, i % 2 ? '#f28bb3' : GOLD, wx - 1 + i * 3, 67, 2, 2);
    }
    px(c, STONE, 4, 88, 104, 8);
    px(c, STONE_HI, 4, 88, 104, 1);
    doorAt(c, 50, 70, 12, 22, '#8b5a35', '#6e4426');
    px(c, STONE_HI, 46, 92, 20, 4);
  });
  return outline(cv);
}

/** Skills — the Skill Forge workshop. 6x5 tiles, door at tile column 2. */
export function makeForge(): Sprite {
  const cv = makeCanvas(96, 80, (c) => {
    px(c, '#6b6f80', 68, 2, 12, 20);
    px(c, '#ff9a3c', 70, 2, 8, 2);
    px(c, '#ffd36e', 72, 2, 4, 1);
    wall(c, 4, 30, 88, 46, '#a8784f', '#8a5e3b', 'plankV');
    gableRoof(c, 1, 95, 6, 28, '#5d7f4f', '#466b3c', '#7aa36a');
    // gear emblem on the gable
    ellipse(c, '#c9c2b4', 48, 19, 6, 6);
    for (const [dx, dy] of [[0, -8], [0, 6], [-8, 0], [6, 0]]) px(c, '#c9c2b4', 47 + dx, 18 + dy, 3, 3);
    ellipse(c, '#5d7f4f', 48, 19, 2, 2);
    windowAt(c, 66, 44);
    // anvil sign
    px(c, '#5a3d2a', 8, 42, 22, 14);
    px(c, '#3b3f4f', 11, 46, 14, 3);
    px(c, '#3b3f4f', 15, 49, 6, 2);
    px(c, '#3b3f4f', 12, 51, 12, 2);
    px(c, '#ff9a3c', 25, 45, 2, 1);
    px(c, STONE, 4, 74, 88, 6);
    doorAt(c, 34, 56, 12, 20, '#5a3d2a', '#46301f');
    px(c, STONE_HI, 30, 76, 20, 4);
  });
  return outline(cv);
}

/** Experience — the office tower. 7x9 tiles, door at tile column 3. */
export function makeOffice(): Sprite {
  const cv = makeCanvas(112, 144, (c) => {
    // rooftop details
    px(c, '#9aa3b8', 16, 2, 18, 6);
    for (let x = 18; x < 33; x += 3) px(c, '#6c7488', x, 3, 1, 4);
    px(c, '#9aa3b8', 88, 1, 2, 8);
    px(c, '#e85d5d', 87, 1, 4, 2);
    // body
    px(c, '#3d4459', 4, 8, 104, 136);
    px(c, '#5f6f91', 6, 12, 100, 90);
    px(c, '#2d3347', 2, 6, 108, 6);
    px(c, '#4b5470', 2, 6, 108, 2);
    for (let y = 18; y < 96; y += 16) {
      for (let x = 11; x < 100; x += 16) {
        px(c, '#2d3550', x - 1, y - 1, 12, 12);
        px(c, '#8fc8ee', x, y, 10, 10);
        px(c, '#6aaedc', x, y + 5, 10, 5);
        px(c, '#d6f0ff', x + 1, y + 1, 3, 1);
        if ((x + y) % 3 === 0) px(c, '#ffe39a', x, y, 10, 10); // a lit office
      }
    }
    // marquee sign band
    px(c, '#2b3047', 6, 102, 100, 10);
    for (let x = 9; x < 104; x += 6) px(c, GOLD, x, 106, 2, 2);
    // lobby
    px(c, '#4b587a', 6, 112, 100, 28);
    px(c, '#8fc8ee', 12, 118, 28, 16);
    px(c, '#8fc8ee', 72, 118, 28, 16);
    px(c, '#2d3550', 25, 118, 2, 16);
    px(c, '#2d3550', 85, 118, 2, 16);
    px(c, STONE, 4, 138, 104, 6);
    px(c, '#2d3550', 46, 112, 20, 32);
    px(c, '#8fc8ee', 48, 114, 7, 28);
    px(c, '#8fc8ee', 57, 114, 7, 28);
    px(c, '#d6f0ff', 49, 115, 2, 6);
  });
  return outline(cv);
}

/** Education — the school with a clock tower. 9x7 tiles, door at tile column 4. */
export function makeSchool(): Sprite {
  const cv = makeCanvas(144, 112, (c) => {
    wall(c, 4, 44, 136, 62, '#c96e4b', '#a5553a', 'brick');
    gableRoof(c, 1, 143, 22, 26, '#4d5f86', '#3a4a6c', '#6a7ca6');
    // clock tower
    px(c, '#d98563', 56, 14, 32, 34);
    px(c, '#b8664a', 84, 14, 4, 34);
    for (let r = 0; r < 14; r++) {
      const half = Math.round(2 + (r * 16) / 13);
      px(c, '#4d5f86', 72 - half, 1 + r, half * 2, 1);
    }
    px(c, '#6a7ca6', 70, 1, 3, 6);
    ellipse(c, '#3a2a20', 72, 30, 8, 8);
    ellipse(c, '#fff8e7', 72, 30, 6, 6);
    px(c, '#3a2a20', 72, 26, 1, 5);
    px(c, '#3a2a20', 72, 30, 4, 1);
    for (const wx of [14, 36, 96, 118]) windowAt(c, wx, 58);
    // plaque
    px(c, '#f4ecd8', 58, 62, 28, 8);
    px(c, '#3a2a20', 62, 65, 20, 1);
    px(c, STONE, 4, 104, 136, 8);
    doorAt(c, 64, 76, 16, 28, '#7a4b2a', '#5e381e');
    px(c, STONE_HI, 60, 104, 24, 8);
  });
  return outline(cv);
}

/** Certifications — the trophy hall. 8x6 tiles, door at tile column 4. */
export function makeTrophyHall(): Sprite {
  const cv = makeCanvas(128, 96, (c) => {
    // pediment
    for (let r = 0; r < 24; r++) {
      const half = Math.round(((r + 1) / 24) * 62);
      px(c, '#d9ccad', 64 - half, 12 + r, half * 2, 1);
    }
    for (let r = 6; r < 22; r++) {
      const half = Math.round(((r - 5) / 17) * 44);
      px(c, '#cbbd9a', 64 - half, 12 + r, half * 2, 1);
    }
    px(c, '#bfb08c', 2, 36, 124, 4);
    px(c, '#efe7d6', 6, 40, 116, 50);
    // columns
    for (const x of [10, 30, 88, 108]) {
      px(c, '#fffaf0', x, 40, 10, 48);
      px(c, '#d8ceb8', x + 7, 40, 3, 48);
      px(c, '#d8ceb8', x - 1, 40, 12, 3);
      px(c, '#d8ceb8', x - 1, 85, 12, 3);
    }
    // banners
    for (const x of [46, 78]) {
      px(c, '#c94b4b', x, 44, 6, 18);
      px(c, GOLD, x + 2, 50, 2, 2);
    }
    px(c, '#cfc6b4', 4, 88, 120, 8);
    doorAt(c, 64, 60, 16, 28, '#8b5a2b', '#6e4426');
    px(c, GOLD, 63, 58, 18, 2);
    px(c, '#ddd5c4', 40, 88, 48, 4);
    px(c, '#c9c0ae', 36, 92, 56, 4);
    // golden trophy on top
    px(c, GOLD, 58, 1, 12, 5);
    px(c, GOLD_SH, 58, 5, 12, 1);
    px(c, GOLD, 56, 2, 2, 3);
    px(c, GOLD, 70, 2, 2, 3);
    px(c, GOLD_SH, 63, 6, 2, 3);
    px(c, GOLD, 60, 9, 8, 2);
    px(c, '#fff3c4', 60, 2, 2, 2);
  });
  return outline(cv);
}
