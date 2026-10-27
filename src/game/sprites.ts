// Tiny toolkit for drawing pixel art into offscreen canvases.

export const T = 16; // tile size in world pixels

export type Ctx = CanvasRenderingContext2D;
export type Sprite = HTMLCanvasElement;

export function makeCanvas(w: number, h: number, draw?: (c: Ctx) => void): Sprite {
  const cv = document.createElement('canvas');
  cv.width = w;
  cv.height = h;
  const c = cv.getContext('2d')!;
  c.imageSmoothingEnabled = false;
  draw?.(c);
  return cv;
}

export function px(c: Ctx, color: string, x: number, y: number, w = 1, h = 1) {
  c.fillStyle = color;
  c.fillRect(x, y, w, h);
}

/** Pixel-perfect filled ellipse (no anti-aliasing). */
export function ellipse(c: Ctx, color: string, cx: number, cy: number, rx: number, ry: number) {
  c.fillStyle = color;
  for (let y = -ry; y <= ry; y++) {
    const half = ry === 0 ? rx : Math.round(rx * Math.sqrt(Math.max(0, 1 - (y * y) / (ry * ry))));
    if (half > 0) c.fillRect(cx - half, cy + y, half * 2, 1);
  }
}

function hex(color: string): [number, number, number] {
  const n = parseInt(color.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Adds a 1px outline around every opaque shape in the canvas. */
export function outline(cv: Sprite, color = '#1a1423'): Sprite {
  const c = cv.getContext('2d')!;
  const { width: w, height: h } = cv;
  const img = c.getImageData(0, 0, w, h);
  const d = img.data;
  const a = (x: number, y: number) => (x < 0 || y < 0 || x >= w || y >= h ? 0 : d[(y * w + x) * 4 + 3]);
  const [r, g, b] = hex(color);
  const marks: number[] = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (a(x, y) >= 128) continue;
      if (a(x - 1, y) >= 128 || a(x + 1, y) >= 128 || a(x, y - 1) >= 128 || a(x, y + 1) >= 128) {
        marks.push((y * w + x) * 4);
      }
    }
  }
  for (const i of marks) {
    d[i] = r;
    d[i + 1] = g;
    d[i + 2] = b;
    d[i + 3] = 255;
  }
  c.putImageData(img, 0, 0);
  return cv;
}

export function mirror(src: Sprite): Sprite {
  return makeCanvas(src.width, src.height, (c) => {
    c.translate(src.width, 0);
    c.scale(-1, 1);
    c.drawImage(src, 0, 0);
  });
}

/** Adds a soft ground shadow behind existing pixels. */
export function shadow(cv: Sprite, cx: number, cy: number, rx: number, ry: number, alpha = 0.22) {
  const c = cv.getContext('2d')!;
  c.save();
  c.globalCompositeOperation = 'destination-over';
  c.globalAlpha = alpha;
  ellipse(c, '#000000', cx, cy, rx, ry);
  c.restore();
}

/** Small deterministic PRNG (mulberry32) so the town looks the same on every visit. */
export function rng(seed: number) {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
