import * as art from './art';
import { makeCanvas, px, rng, T, type Sprite } from './sprites';

export const GRASS = 0;
export const PATH = 1;
export const PLAZA = 2;
export const WATER = 3;

export interface Entity {
  img: Sprite | Sprite[];
  x: number; // top-left, world px
  y: number;
  base: number; // y used for depth sorting
  fps?: number;
}

export interface Spot {
  id: string;
  label: string;
  /** Tile where the player interacts. */
  door: { x: number; y: number };
  /** Tile rect the player can click/tap to go there. */
  rect: { x: number; y: number; w: number; h: number };
  /** World px of the floating name label (centered, bottom edge). */
  labelAt: { x: number; y: number };
  /** Building doors open when walked into; props (sign, mailbox) need E / tap. */
  auto: boolean;
  quest: boolean;
}

export interface World {
  w: number;
  h: number;
  ground: Uint8Array;
  solid: Uint8Array;
  entities: Entity[];
  spots: Spot[];
  groundFrames: Sprite[];
  spawn: { x: number; y: number };
  isSolid(tx: number, ty: number): boolean;
}

const W = 48;
const H = 36;

interface BuildingDef {
  id: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  door: number;
  sprite: () => Sprite;
}

const BUILDINGS: BuildingDef[] = [
  { id: 'about', label: 'ABOUT ME', x: 6, y: 6, w: 7, h: 6, door: 3, sprite: art.makeHouse },
  { id: 'skills', label: 'SKILLS', x: 14, y: 7, w: 6, h: 5, door: 2, sprite: art.makeForge },
  { id: 'experience', label: 'EXPERIENCE', x: 31, y: 3, w: 7, h: 9, door: 3, sprite: art.makeOffice },
  { id: 'education', label: 'EDUCATION', x: 5, y: 22, w: 9, h: 7, door: 4, sprite: art.makeSchool },
  { id: 'certs', label: 'CERTIFICATIONS', x: 33, y: 22, w: 8, h: 6, door: 4, sprite: art.makeTrophyHall },
];

export function buildWorld(): World {
  const ground = new Uint8Array(W * H);
  const solid = new Uint8Array(W * H);
  const reserved = new Uint8Array(W * H); // tiles where no random decoration may go
  const entities: Entity[] = [];
  const spots: Spot[] = [];
  const i = (x: number, y: number) => y * W + x;

  const fill = (x0: number, y0: number, x1: number, y1: number, type: number) => {
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      ground[i(x, y)] = type;
      reserved[i(x, y)] = 1;
      if (type === WATER) solid[i(x, y)] = 1;
    }
  };
  const block = (x0: number, y0: number, x1: number, y1: number) => {
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      solid[i(x, y)] = 1;
      reserved[i(x, y)] = 1;
    }
  };
  const reserve = (x0: number, y0: number, x1: number, y1: number) => {
    for (let y = Math.max(0, y0); y <= Math.min(H - 1, y1); y++)
      for (let x = Math.max(0, x0); x <= Math.min(W - 1, x1); x++) reserved[i(x, y)] = 1;
  };
  const prop = (img: Sprite | Sprite[], tx: number, ty: number, opts: { dx?: number; fps?: number } = {}) => {
    const s = Array.isArray(img) ? img[0] : img;
    entities.push({
      img,
      x: tx * T + (opts.dx ?? Math.round((T - s.width) / 2)),
      y: (ty + 1) * T - s.height + 1,
      base: (ty + 1) * T - 1,
      fps: opts.fps,
    });
  };

  // ── roads & plaza
  fill(2, 18, 45, 19, PATH); // main street
  fill(4, 29, 43, 30, PATH); // south street
  fill(23, 23, 24, 28, PATH); // plaza → south street
  fill(23, 9, 24, 12, PATH); // plaza → pond
  fill(19, 13, 28, 22, PLAZA);

  // ── pond (north)
  fill(21, 4, 26, 8, WATER);
  for (const [x, y] of [[21, 4], [26, 4], [21, 8], [26, 8]]) {
    ground[i(x, y)] = GRASS;
    solid[i(x, y)] = 0;
  }
  reserve(20, 3, 27, 9);

  // ── buildings
  for (const b of BUILDINGS) {
    block(b.x, b.y, b.x + b.w - 1, b.y + b.h - 1);
    const door = { x: b.x + b.door, y: b.y + b.h - 1 };
    solid[i(door.x, door.y)] = 0;
    reserve(b.x - 1, b.y - 1, b.x + b.w, b.y + b.h);
    fill(door.x, door.y + 1, door.x, door.y + 1, PATH);
    // connect the doorstep down to the nearest street
    const street = door.y < 18 ? 17 : 28;
    if (door.y + 1 <= street) fill(door.x, door.y + 1, door.x, street, PATH);
    const img = b.sprite();
    entities.push({ img, x: b.x * T, y: b.y * T, base: (b.y + b.h) * T - 1 });
    spots.push({
      id: b.id,
      label: b.label,
      door,
      rect: { x: b.x, y: b.y, w: b.w, h: b.h },
      labelAt: { x: (b.x + b.w / 2) * T, y: b.y * T - 2 },
      auto: true,
      quest: true,
    });
  }

  // ── plaza props
  block(22, 14, 25, 16);
  entities.push({ img: art.makeFountain(), x: 22 * T, y: 14 * T, base: 17 * T - 2, fps: 3 });

  block(27, 15, 27, 15);
  prop(art.makeMailbox(), 27, 15);
  spots.push({
    id: 'contact',
    label: 'CONTACT',
    door: { x: 27, y: 16 },
    rect: { x: 27, y: 14, w: 1, h: 2 },
    labelAt: { x: 27.5 * T, y: 14 * T - 2 },
    auto: false,
    quest: true,
  });

  block(20, 15, 20, 15);
  prop(art.makeSign(), 20, 15);
  spots.push({
    id: 'welcome',
    label: 'WELCOME',
    door: { x: 20, y: 16 },
    rect: { x: 20, y: 15, w: 1, h: 1 },
    labelAt: { x: 20.5 * T, y: 15 * T - 6 },
    auto: false,
    quest: false,
  });

  const lamp = art.makeLamp();
  for (const [x, y] of [[19, 13], [28, 13], [19, 22], [28, 22], [5, 17], [13, 17], [30, 17], [41, 17], [17, 31], [30, 31]]) {
    block(x, y, x, y);
    prop(lamp, x, y);
  }

  const bench = art.makeBench();
  for (const x of [21, 25]) {
    block(x, 11, x + 1, 11);
    prop(bench, x, 11, { dx: 0 });
  }

  // ── forest border + scattered nature
  const r = rng(375);
  const treeVariants = Array.from({ length: 8 }, (_, k) => art.makeTree(100 + k, k % 3 === 2 ? 'pine' : 'round'));
  const bushVariants = Array.from({ length: 4 }, (_, k) => art.makeBush(200 + k));
  const rock = art.makeRock();
  const pickTree = () => treeVariants[Math.floor(r() * treeVariants.length)];

  const isBorder = (x: number, y: number) => x < 2 || y < 2 || x >= W - 2 || y >= H - 2;
  const clearAround = (x: number, y: number) => {
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
      if (reserved[i(nx, ny)] || solid[i(nx, ny)]) return false;
    }
    return true;
  };

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (isBorder(x, y)) {
        if (reserved[i(x, y)] && ground[i(x, y)] !== GRASS) continue;
        solid[i(x, y)] = 1;
        prop(pickTree(), x, y, { dx: -8 + Math.floor(r() * 5) - 2 });
        continue;
      }
      if (ground[i(x, y)] !== GRASS || !clearAround(x, y)) continue;
      const roll = r();
      const nearEdge = x < 4 || y < 4 || x >= W - 4 || y >= H - 4;
      if (roll < (nearEdge ? 0.35 : 0.07)) {
        solid[i(x, y)] = 1;
        reserved[i(x, y)] = 1;
        prop(pickTree(), x, y, { dx: -8 });
      } else if (roll < (nearEdge ? 0.4 : 0.1)) {
        solid[i(x, y)] = 1;
        reserved[i(x, y)] = 1;
        prop(bushVariants[Math.floor(r() * bushVariants.length)], x, y);
      } else if (roll < (nearEdge ? 0.42 : 0.115)) {
        solid[i(x, y)] = 1;
        reserved[i(x, y)] = 1;
        prop(rock, x, y);
      }
    }
  }

  const isSolid = (tx: number, ty: number) => tx < 0 || ty < 0 || tx >= W || ty >= H || solid[i(tx, ty)] === 1;

  return {
    w: W,
    h: H,
    ground,
    solid,
    entities,
    spots,
    groundFrames: [0, 1, 2].map((f) => renderGround(ground, f)),
    spawn: { x: 24 * T, y: 20 * T + 12 },
    isSolid,
  };
}

// ───────────────────────── ground rendering ─────────────────────────

const G = {
  grass: '#5a9e4b',
  grassDark: '#4c8a40',
  grassLight: '#6db55a',
  path: '#d8bf8a',
  pathEdge: '#b89c66',
  pebble: '#c2a673',
  plaza: '#cfc8b8',
  plazaLine: '#b3ab9a',
  water: '#3f86c8',
  waterLight: '#6fb2e6',
  sand: '#e3cf98',
  foam: '#d6eefa',
};

const FLOWERS = ['#f7f3e8', '#f28bb3', '#f6c453', '#b48cf2'];

function renderGround(ground: Uint8Array, frame: number): Sprite {
  return makeCanvas(W * T, H * T, (c) => {
    const at = (x: number, y: number) => (x < 0 || y < 0 || x >= W || y >= H ? GRASS : ground[y * W + x]);
    for (let ty = 0; ty < H; ty++) {
      for (let tx = 0; tx < W; tx++) {
        const r = rng(ty * 977 + tx * 131 + 7);
        const x = tx * T;
        const y = ty * T;
        const type = at(tx, ty);

        if (type === GRASS) {
          px(c, G.grass, x, y, T, T);
          for (let k = 0; k < 6; k++) px(c, G.grassDark, x + Math.floor(r() * 16), y + Math.floor(r() * 16));
          for (let k = 0; k < 3; k++) px(c, G.grassLight, x + Math.floor(r() * 15), y + Math.floor(r() * 15), 1, 2);
          if (r() < 0.12) {
            for (let k = 0; k < 2; k++) {
              const fx = x + 2 + Math.floor(r() * 11);
              const fy = y + 2 + Math.floor(r() * 11);
              const col = FLOWERS[Math.floor(r() * FLOWERS.length)];
              px(c, col, fx - 1, fy, 3, 1);
              px(c, col, fx, fy - 1, 1, 3);
              px(c, '#f6c453', fx, fy);
            }
          }
        } else if (type === PATH) {
          px(c, G.path, x, y, T, T);
          for (let k = 0; k < 4; k++) px(c, G.pebble, x + Math.floor(r() * 15), y + Math.floor(r() * 15), 2, 1);
          const edge = (nx: number, ny: number) => at(nx, ny) === GRASS;
          if (edge(tx, ty - 1)) px(c, G.pathEdge, x, y, T, 1);
          if (edge(tx, ty + 1)) px(c, G.pathEdge, x, y + T - 1, T, 1);
          if (edge(tx - 1, ty)) px(c, G.pathEdge, x, y, 1, T);
          if (edge(tx + 1, ty)) px(c, G.pathEdge, x + T - 1, y, 1, T);
        } else if (type === PLAZA) {
          px(c, G.plaza, x, y, T, T);
          px(c, G.plazaLine, x, y + 7, T, 1);
          px(c, G.plazaLine, x, y + 15, T, 1);
          px(c, G.plazaLine, x + (ty % 2 ? 4 : 12), y, 1, 7);
          px(c, G.plazaLine, x + (ty % 2 ? 12 : 4), y + 8, 1, 7);
          if (r() < 0.3) px(c, '#d9d3c5', x + 1 + Math.floor(r() * 10), y + 1, 3, 1);
        } else {
          px(c, G.water, x, y, T, T);
          for (let k = 0; k < 2; k++) {
            const wy = y + 3 + Math.floor(r() * 10);
            const wx = x + ((Math.floor(r() * 12) + frame * 3) % 12);
            px(c, G.waterLight, wx, wy, 4, 1);
          }
          const shore = (nx: number, ny: number) => at(nx, ny) !== WATER;
          if (shore(tx, ty - 1)) { px(c, G.sand, x, y, T, 3); px(c, G.foam, x, y + 3, T, 1); }
          if (shore(tx, ty + 1)) { px(c, G.foam, x, y + T - 4, T, 1); px(c, G.sand, x, y + T - 3, T, 3); }
          if (shore(tx - 1, ty)) { px(c, G.sand, x, y, 3, T); px(c, G.foam, x + 3, y, 1, T); }
          if (shore(tx + 1, ty)) { px(c, G.foam, x + T - 4, y, 1, T); px(c, G.sand, x + T - 3, y, 3, T); }
        }
      }
    }
  });
}
