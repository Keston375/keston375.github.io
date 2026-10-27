import { makeCanvas, mirror, outline, px, type Ctx, type Sprite } from './sprites';

export type Dir = 'down' | 'up' | 'left' | 'right';
export type CharacterSprites = Record<Dir, Sprite[]> & { shadow: Sprite };

// Frame 0 = idle, 1 and 2 = walking steps. Walk cycle plays [1, 0, 2, 0].
export const WALK_CYCLE = [1, 0, 2, 0];

const P = {
  hair: '#3b2418',
  hairHi: '#5b3a26',
  skin: '#f2c79a',
  skinSh: '#d9a274',
  eye: '#1a1423',
  blush: '#ec9f8f',
  shirt: '#2fa36b',
  shirtSh: '#22805a',
  shirtHi: '#4cc487',
  pants: '#3a3f66',
  shoe: '#2a1f1d',
};

function front(c: Ctx, f: number, back: boolean) {
  // legs (a raised leg is one pixel shorter)
  const leg = (x: number, raised: boolean) => {
    px(c, P.pants, x, 13, 2, raised ? 1 : 2);
    px(c, P.shoe, x, raised ? 14 : 15, 2, 1);
  };
  px(c, P.pants, 5, 13, 6, 1);
  leg(5, f === 1);
  leg(9, f === 2);

  // torso + arms (arms swing opposite to legs)
  px(c, P.shirt, 4, 9, 8, 4);
  px(c, P.shirtSh, 4, 12, 8, 1);
  if (!back) px(c, P.shirtHi, 6, 9, 4, 1);
  const armL = f === 2 ? 1 : 0;
  const armR = f === 1 ? 1 : 0;
  px(c, P.shirtSh, 3, 9, 1, 3 + armL);
  px(c, P.skin, 3, 12 + armL, 1, 1);
  px(c, P.shirtSh, 12, 9, 1, 3 + armR);
  px(c, P.skin, 12, 12 + armR, 1, 1);

  // head
  px(c, P.skin, 5, 3, 6, 6);
  px(c, P.skinSh, 5, 8, 6, 1);
  px(c, P.hair, 4, 1, 8, 3);
  px(c, P.hairHi, 6, 1, 3, 1);
  if (back) {
    px(c, P.hair, 4, 1, 8, 7);
    px(c, P.hairHi, 6, 2, 3, 1);
    px(c, P.skinSh, 6, 8, 4, 1);
  } else {
    px(c, P.hair, 4, 4, 1, 3);
    px(c, P.hair, 11, 4, 1, 3);
    px(c, P.hair, 5, 4, 2, 1);
    px(c, P.eye, 6, 5, 1, 2);
    px(c, P.eye, 9, 5, 1, 2);
    px(c, P.blush, 5, 7, 1, 1);
    px(c, P.blush, 10, 7, 1, 1);
  }
}

function side(c: Ctx, f: number) {
  // legs
  if (f === 0) {
    px(c, P.pants, 6, 13, 4, 2);
    px(c, P.shoe, 6, 15, 5, 1);
  } else {
    px(c, P.pants, 6, 13, 4, 1);
    px(c, P.pants, 5, 14, 2, 1);
    px(c, P.shoe, 4, 15, 3, 1);
    px(c, P.pants, 9, 14, 2, 1);
    px(c, P.shoe, 9, 15, 3, 1);
  }

  // torso
  px(c, P.shirt, 6, 9, 5, 4);
  px(c, P.shirtSh, 6, 12, 5, 1);

  // arm
  if (f === 0) {
    px(c, P.shirtSh, 8, 9, 2, 3);
    px(c, P.skin, 8, 12, 2, 1);
  } else if (f === 1) {
    px(c, P.shirtSh, 9, 9, 2, 2);
    px(c, P.skin, 11, 11, 1, 1);
  } else {
    px(c, P.shirtSh, 6, 9, 2, 2);
    px(c, P.skin, 5, 11, 1, 1);
  }

  // head
  px(c, P.skin, 6, 3, 6, 6);
  px(c, P.skinSh, 6, 8, 6, 1);
  px(c, P.hair, 5, 1, 7, 3);
  px(c, P.hairHi, 7, 1, 3, 1);
  px(c, P.hair, 5, 4, 3, 4);
  px(c, P.skinSh, 7, 5, 1, 2);
  px(c, P.eye, 10, 5, 1, 2);
  px(c, P.skin, 12, 6, 1, 1);
}

export function makeCharacter(): CharacterSprites {
  const frames = (draw: (c: Ctx, f: number) => void) =>
    [0, 1, 2].map((f) => outline(makeCanvas(16, 17, (c) => draw(c, f))));
  const right = frames(side);
  const shadowSprite = makeCanvas(12, 4, (c) => {
    px(c, 'rgba(0,0,0,0.25)', 2, 0, 8, 4);
    px(c, 'rgba(0,0,0,0.25)', 0, 1, 12, 2);
  });
  return {
    down: frames((c, f) => front(c, f, false)),
    up: frames((c, f) => front(c, f, true)),
    right,
    left: right.map(mirror),
    shadow: shadowSprite,
  };
}
