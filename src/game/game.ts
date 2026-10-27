import { WALK_CYCLE, type CharacterSprites, type Dir } from './character';
import { T } from './sprites';
import type { Spot, World } from './world';

export interface GameHooks {
  onEnter(spotId: string): void;
  isVisited(spotId: string): boolean;
}

const SPEED = 78; // world px per second
const KEYMAP: Record<string, [number, number]> = {
  ArrowUp: [0, -1], KeyW: [0, -1],
  ArrowDown: [0, 1], KeyS: [0, 1],
  ArrowLeft: [-1, 0], KeyA: [-1, 0],
  ArrowRight: [1, 0], KeyD: [1, 0],
};
const STEPS = [[1, 0], [-1, 0], [0, 1], [0, -1]];

interface LabelHit { id: string; x: number; y: number; w: number; h: number }

export class Game {
  mode: 'title' | 'play' = 'title';
  private paused = false;
  private sleeping = false;
  private ctx: CanvasRenderingContext2D;
  private zoom = 4;
  private dpr = 1;
  private cam = { x: 0, y: 0 };
  private player: { x: number; y: number; dir: Dir; moving: boolean; anim: number };
  private keys = new Set<string>();
  private path: { x: number; y: number }[] = [];
  private goal: { x: number; y: number; spot: string | null } | null = null;
  private onSpot: string | null = null;
  private labelHits: LabelHit[] = [];
  private time = 0;
  private last = 0;
  private coarse = matchMedia('(pointer: coarse)').matches;

  constructor(
    private canvas: HTMLCanvasElement,
    private world: World,
    private hero: CharacterSprites,
    private hooks: GameHooks,
  ) {
    this.ctx = canvas.getContext('2d')!;
    this.player = { x: world.spawn.x, y: world.spawn.y, dir: 'down', moving: false, anim: 0 };
    this.resize();
    this.snapCamera();
    addEventListener('resize', () => this.resize());
    addEventListener('keydown', (e) => this.onKey(e, true));
    addEventListener('keyup', (e) => this.onKey(e, false));
    addEventListener('blur', () => this.keys.clear());
    canvas.addEventListener('pointerdown', (e) => this.onPointer(e));
    requestAnimationFrame((t) => this.frame(t));
  }

  // ───────────── public API

  start() {
    this.mode = 'play';
  }

  setPaused(paused: boolean) {
    this.paused = paused;
    this.keys.clear();
  }

  /** Stop rendering entirely (e.g. while the classic view covers the screen). */
  setSleeping(sleeping: boolean) {
    this.sleeping = sleeping;
    this.keys.clear();
  }

  /** Walk to a spot's door; opens it on arrival. */
  walkTo(id: string) {
    const spot = this.world.spots.find((s) => s.id === id);
    if (!spot) return;
    const here = this.playerTile();
    if (here.x === spot.door.x && here.y === spot.door.y) {
      this.enter(spot);
      return;
    }
    this.setPath(spot.door, spot.id);
  }

  // ───────────── input

  private onKey(e: KeyboardEvent, down: boolean) {
    if (!down) {
      this.keys.delete(e.code);
      return;
    }
    if (this.mode !== 'play' || this.paused || this.sleeping) return;
    const target = e.target as HTMLElement | null;
    if (KEYMAP[e.code]) {
      this.keys.add(e.code);
      this.path = [];
      this.goal = null;
      e.preventDefault();
    } else if ((e.code === 'KeyE' || e.code === 'Enter' || e.code === 'Space') && !target?.closest?.('button, a')) {
      e.preventDefault();
      this.interact();
    }
  }

  private onPointer(e: PointerEvent) {
    if (this.mode !== 'play' || this.paused) return;
    const sx = e.clientX * this.dpr;
    const sy = e.clientY * this.dpr;
    const label = this.labelHits.find((l) => sx >= l.x && sx <= l.x + l.w && sy >= l.y && sy <= l.y + l.h);
    if (label) {
      this.walkTo(label.id);
      return;
    }
    const tx = Math.floor((sx / this.zoom + this.cam.x) / T);
    const ty = Math.floor((sy / this.zoom + this.cam.y) / T);
    const spot = this.world.spots.find(
      (s) =>
        (tx >= s.rect.x && tx < s.rect.x + s.rect.w && ty >= s.rect.y && ty < s.rect.y + s.rect.h) ||
        (tx === s.door.x && ty === s.door.y),
    );
    if (spot) {
      this.walkTo(spot.id);
      return;
    }
    const target = this.world.isSolid(tx, ty) ? this.nearestOpen(tx, ty) : { x: tx, y: ty };
    if (target) this.setPath(target, null);
  }

  private interact() {
    const here = this.playerTile();
    const near = this.world.spots.find(
      (s) => Math.abs(s.door.x - here.x) <= 1 && Math.abs(s.door.y - here.y) <= 1,
    );
    if (near) this.walkTo(near.id);
  }

  private enter(spot: Spot) {
    this.path = [];
    this.goal = null;
    this.keys.clear();
    this.onSpot = spot.id;
    this.player.dir = 'up';
    this.hooks.onEnter(spot.id);
  }

  // ───────────── movement

  private playerTile() {
    return { x: Math.floor(this.player.x / T), y: Math.floor((this.player.y - 2) / T) };
  }

  private blocked(x: number, y: number) {
    const l = x - 5, r = x + 5, t = y - 4, b = y + 2;
    for (let ty = Math.floor(t / T); ty <= Math.floor((b - 0.01) / T); ty++)
      for (let tx = Math.floor(l / T); tx <= Math.floor((r - 0.01) / T); tx++)
        if (this.world.isSolid(tx, ty)) return true;
    return false;
  }

  private moveCollide(dx: number, dy: number) {
    const p = this.player;
    if (dx) {
      if (!this.blocked(p.x + dx, p.y)) p.x += dx;
      else if (!dy) this.slide(0, dx);
    }
    if (dy) {
      if (!this.blocked(p.x, p.y + dy)) p.y += dy;
      else if (!dx) this.slide(dy, 0);
    }
  }

  /** Corner assist: nudge sideways when a door/gap is just slightly off. */
  private slide(dy: number, dx: number) {
    const p = this.player;
    const amount = Math.abs(dx || dy);
    for (let k = 1; k <= 7; k++) {
      for (const s of [1, -1]) {
        if (dy && !this.blocked(p.x + s * k, p.y + dy) && !this.blocked(p.x + s * k, p.y)) {
          p.x += s * Math.min(amount, k);
          return;
        }
        if (dx && !this.blocked(p.x + dx, p.y + s * k) && !this.blocked(p.x, p.y + s * k)) {
          p.y += s * Math.min(amount, k);
          return;
        }
      }
    }
  }

  private face(dx: number, dy: number) {
    if (Math.abs(dx) > Math.abs(dy)) this.player.dir = dx > 0 ? 'right' : 'left';
    else if (dy) this.player.dir = dy > 0 ? 'down' : 'up';
  }

  private nearestOpen(tx: number, ty: number) {
    for (let r = 1; r <= 4; r++) {
      let best: { x: number; y: number } | null = null;
      let bestD = Infinity;
      for (let y = ty - r; y <= ty + r; y++)
        for (let x = tx - r; x <= tx + r; x++) {
          if (this.world.isSolid(x, y)) continue;
          const d = (x - tx) ** 2 + (y - ty) ** 2;
          if (d < bestD) { bestD = d; best = { x, y }; }
        }
      if (best) return best;
    }
    return null;
  }

  /** Breadth-first search over walkable tiles. */
  private setPath(target: { x: number; y: number }, spot: string | null) {
    const { w, h } = this.world;
    const start = this.playerTile();
    const si = start.y * w + start.x;
    const ti = target.y * w + target.x;
    const prev = new Int32Array(w * h).fill(-1);
    prev[si] = si;
    const queue = [si];
    for (let head = 0; head < queue.length; head++) {
      const cur = queue[head];
      if (cur === ti) break;
      const cx = cur % w;
      const cy = (cur / w) | 0;
      for (const [dx, dy] of STEPS) {
        const nx = cx + dx;
        const ny = cy + dy;
        if (this.world.isSolid(nx, ny)) continue;
        const ni = ny * w + nx;
        if (prev[ni] !== -1) continue;
        prev[ni] = cur;
        queue.push(ni);
      }
    }
    if (prev[ti] === -1) return;
    const tiles: { x: number; y: number }[] = [];
    for (let k = ti; k !== si; k = prev[k]) tiles.push(this.tileCenter(k % w, (k / w) | 0));
    tiles.push(this.tileCenter(start.x, start.y));
    this.path = tiles.reverse();
    this.goal = { ...target, spot };
  }

  private tileCenter(tx: number, ty: number) {
    return { x: tx * T + T / 2, y: ty * T + 12 };
  }

  private update(dt: number) {
    const p = this.player;
    let vx = 0;
    let vy = 0;
    for (const k of this.keys) {
      const d = KEYMAP[k];
      if (d) { vx += d[0]; vy += d[1]; }
    }

    if (vx || vy) {
      const len = Math.hypot(vx, vy);
      this.moveCollide((vx / len) * SPEED * dt, (vy / len) * SPEED * dt);
      this.face(vx, vy);
      p.moving = true;
    } else if (this.path.length) {
      let step = SPEED * dt;
      while (step > 0 && this.path.length) {
        const t = this.path[0];
        const dx = t.x - p.x;
        const dy = t.y - p.y;
        const d = Math.hypot(dx, dy);
        if (d > 0) this.face(dx, dy);
        if (d <= step) {
          p.x = t.x;
          p.y = t.y;
          step -= d;
          this.path.shift();
        } else {
          p.x += (dx / d) * step;
          p.y += (dy / d) * step;
          step = 0;
        }
      }
      p.moving = true;
      if (!this.path.length && this.goal) {
        const spot = this.world.spots.find((s) => s.id === this.goal!.spot);
        this.goal = null;
        if (spot && !spot.auto) this.enter(spot);
      }
    } else {
      p.moving = false;
    }
    p.anim = p.moving ? p.anim + dt : 0;

    // Building doors open as soon as you step in.
    const here = this.playerTile();
    const spot = this.world.spots.find((s) => s.auto && s.door.x === here.x && s.door.y === here.y);
    if (spot) {
      if (this.onSpot !== spot.id) this.enter(spot);
    } else if (!this.world.spots.some((s) => s.door.x === here.x && s.door.y === here.y)) {
      this.onSpot = null;
    }
  }

  // ───────────── rendering

  private resize() {
    this.dpr = Math.min(devicePixelRatio || 1, 3);
    const w = Math.floor(innerWidth * this.dpr);
    const h = Math.floor(innerHeight * this.dpr);
    this.canvas.width = w;
    this.canvas.height = h;
    this.zoom = Math.max(1, Math.floor(Math.min(w / (T * 18), h / (T * 13))));
    this.ctx.imageSmoothingEnabled = false;
  }

  private cameraTarget() {
    const vw = this.canvas.width / this.zoom;
    const vh = this.canvas.height / this.zoom;
    const ww = this.world.w * T;
    const wh = this.world.h * T;
    let cx: number;
    let cy: number;
    if (this.mode === 'title') {
      cx = ww / 2 + Math.sin(this.time * 0.12) * ww * 0.28;
      cy = wh / 2 + Math.sin(this.time * 0.09) * wh * 0.22;
    } else {
      cx = this.player.x;
      cy = this.player.y - 8;
    }
    const clamp = (v: number, view: number, world: number) =>
      world <= view ? (world - view) / 2 : Math.min(Math.max(v - view / 2, 0), world - view);
    return { x: clamp(cx, vw, ww), y: clamp(cy, vh, wh) };
  }

  private snapCamera() {
    this.cam = this.cameraTarget();
  }

  private frame(t: number) {
    const dt = Math.min(0.05, (t - this.last) / 1000 || 0);
    this.last = t;
    if (!this.sleeping) {
      this.time += dt;
      if (this.mode === 'play' && !this.paused) this.update(dt);
      const target = this.cameraTarget();
      const k = this.mode === 'title' ? 1 : 1 - Math.exp(-dt * 9);
      this.cam.x += (target.x - this.cam.x) * k;
      this.cam.y += (target.y - this.cam.y) * k;
      this.render();
    }
    requestAnimationFrame((n) => this.frame(n));
  }

  private render() {
    const { ctx, canvas, zoom, cam } = this;
    const vw = canvas.width / zoom;
    const vh = canvas.height / zoom;
    const ox = Math.round(cam.x * zoom);
    const oy = Math.round(cam.y * zoom);

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#1d3a26';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(zoom, 0, 0, zoom, -ox, -oy);
    ctx.imageSmoothingEnabled = false;

    const frames = this.world.groundFrames;
    ctx.drawImage(frames[Math.floor(this.time * 2.5) % frames.length], 0, 0);

    // destination marker
    if (this.goal && this.path.length) {
      const pulse = Math.floor(this.time * 6) % 2;
      const gx = this.goal.x * T;
      const gy = this.goal.y * T;
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.fillRect(gx + 3 - pulse, gy + 3 - pulse, 3, 1);
      ctx.fillRect(gx + 3 - pulse, gy + 3 - pulse, 1, 3);
      ctx.fillRect(gx + 10 + pulse, gy + 3 - pulse, 3, 1);
      ctx.fillRect(gx + 12 + pulse, gy + 3 - pulse, 1, 3);
      ctx.fillRect(gx + 3 - pulse, gy + 12 + pulse, 3, 1);
      ctx.fillRect(gx + 3 - pulse, gy + 10 + pulse, 1, 3);
      ctx.fillRect(gx + 10 + pulse, gy + 12 + pulse, 3, 1);
      ctx.fillRect(gx + 12 + pulse, gy + 10 + pulse, 1, 3);
    }

    // depth-sorted sprites
    const p = this.player;
    const pxr = Math.round(p.x);
    const pyr = Math.round(p.y);
    type Draw = { base: number; draw: () => void };
    const list: Draw[] = [];
    for (const e of this.world.entities) {
      const img = Array.isArray(e.img) ? e.img[Math.floor(this.time * (e.fps ?? 1)) % e.img.length] : e.img;
      if (e.x > cam.x + vw || e.y > cam.y + vh || e.x + img.width < cam.x || e.y + img.height < cam.y) continue;
      list.push({ base: e.base, draw: () => ctx.drawImage(img, e.x, e.y) });
    }
    list.push({
      base: pyr,
      draw: () => {
        const frame = p.moving ? WALK_CYCLE[Math.floor(p.anim * 8) % WALK_CYCLE.length] : 0;
        ctx.drawImage(this.hero.shadow, pxr - 6, pyr - 2);
        ctx.drawImage(this.hero[p.dir][frame], pxr - 8, pyr - 16);
      },
    });
    list.sort((a, b) => a.base - b.base);
    for (const d of list) d.draw();

    // bobbing arrows over unvisited doors
    const bob = Math.round(Math.sin(this.time * 5) * 1.5);
    for (const s of this.world.spots) {
      if (!s.auto || this.hooks.isVisited(s.id)) continue;
      const ax = s.door.x * T + 8;
      const ay = s.door.y * T - 12 + bob;
      ctx.fillStyle = '#1a1423';
      ctx.fillRect(ax - 5, ay - 1, 10, 3);
      ctx.fillRect(ax - 3, ay + 2, 6, 2);
      ctx.fillRect(ax - 1, ay + 4, 2, 2);
      ctx.fillStyle = '#f6c453';
      ctx.fillRect(ax - 4, ay, 8, 2);
      ctx.fillRect(ax - 2, ay + 2, 4, 1);
      ctx.fillRect(ax - 1, ay + 3, 2, 1);
    }

    // screen-space UI: labels + prompt
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const cssZoom = zoom / this.dpr;
    const fs = Math.round(this.dpr * Math.min(12, Math.max(8, cssZoom * 2.2)));
    ctx.font = `${fs}px "Press Start 2P", monospace`;
    ctx.textBaseline = 'top';
    this.labelHits = [];
    for (const s of this.world.spots) {
      const visited = this.hooks.isVisited(s.id);
      const text = s.label;
      const tw = ctx.measureText(text).width;
      const pad = Math.round(fs * 0.6);
      const bw = Math.round(tw + pad * 2);
      const bh = Math.round(fs + pad * 1.6);
      const bx = Math.round(s.labelAt.x * zoom - ox - bw / 2);
      const by = Math.round(s.labelAt.y * zoom - oy - bh);
      const b = Math.max(1, Math.round(this.dpr * 2));
      ctx.fillStyle = '#1a1423';
      ctx.fillRect(bx - b, by, bw + b * 2, bh);
      ctx.fillRect(bx, by - b, bw, bh + b * 2);
      ctx.fillStyle = visited ? '#2f7d55' : '#2b2745';
      ctx.fillRect(bx, by, bw, bh);
      ctx.fillStyle = visited ? '#d7f5e3' : '#f6c453';
      ctx.fillText(text, bx + pad, by + Math.round((bh - fs) / 2) + 1);
      this.labelHits.push({ id: s.id, x: bx, y: by, w: bw, h: bh });
    }

    if (this.mode === 'play' && !this.paused) {
      const here = this.playerTile();
      const near = this.world.spots.find((s) =>
        s.auto ? s.door.x === here.x && s.door.y === here.y : Math.abs(s.door.x - here.x) <= 1 && Math.abs(s.door.y - here.y) <= 1,
      );
      if (near && !p.moving) {
        const text = this.coarse ? 'TAP TO OPEN' : 'PRESS E';
        const tw = ctx.measureText(text).width;
        const pad = Math.round(fs * 0.5);
        const bx = Math.round(pxr * zoom - ox - tw / 2 - pad);
        const by = Math.round((pyr - 30) * zoom - oy) + bob * this.dpr;
        ctx.fillStyle = 'rgba(26,20,35,0.85)';
        ctx.fillRect(bx, by, tw + pad * 2, fs + pad * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fillText(text, bx + pad, by + pad + 1);
        this.labelHits.push({ id: near.id, x: bx, y: by, w: tw + pad * 2, h: fs + pad * 2 });
      }
    }
  }
}
