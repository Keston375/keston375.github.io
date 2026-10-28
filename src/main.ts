import '@fontsource/press-start-2p';
import '@fontsource/vt323';
import './style.css';

import { profile } from './data/profile';
import { makeCharacter } from './game/character';
import { Game } from './game/game';
import { buildWorld } from './game/world';
import { renderClassic } from './ui/classic';
import { QUESTS, sections, type SectionId } from './ui/sections';

const $ = <T extends HTMLElement>(sel: string) => document.querySelector(sel) as T;

const canvas = $<HTMLCanvasElement>('#game');
const hud = $('#hud');
const title = $('#title');
const panel = $('#panel');
const toast = $('#toast');
const classic = $('#classic');
const coarse = matchMedia('(pointer: coarse)').matches;

// ───────────── analytics (Google Analytics tag lives in index.html)

declare global {
  interface Window { gtag?: (...args: unknown[]) => void }
}
const track = (event: string, params: Record<string, unknown> = {}) => window.gtag?.('event', event, params);

document.addEventListener('click', (e) => {
  const link = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href]');
  if (!link) return;
  const href = link.getAttribute('href')!;
  const where = link.closest('#classic') ? 'classic' : 'game';
  if (href.endsWith('.pdf')) track('cv_download', { from: where });
  else if (href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('http')) {
    track('contact_click', { method: link.textContent?.trim(), from: where });
  }
});

// ───────────── visited quests (persisted)

const STORE = 'keston-town:visited';
const visited = new Set<string>(JSON.parse(localStorage.getItem(STORE) ?? '[]'));
const markVisited = (id: string) => {
  if (visited.has(id)) return;
  const before = QUESTS.filter((q) => visited.has(q)).length;
  visited.add(id);
  localStorage.setItem(STORE, JSON.stringify([...visited]));
  renderQuestLog();
  const after = QUESTS.filter((q) => visited.has(q)).length;
  if (QUESTS.includes(id as SectionId) && after === QUESTS.length && before < QUESTS.length) {
    track('all_quests_complete');
    showToast('🏆 Achievement unlocked: <strong>Town Explorer</strong> — thanks for visiting every place!');
  }
};

// ───────────── dialog panel

const panelTitle = panel.querySelector('#panel-title')!;
const panelIcon = panel.querySelector('.panel-icon')!;
const panelBody = panel.querySelector<HTMLElement>('.panel-body')!;
const panelClose = panel.querySelector<HTMLButtonElement>('.panel-close')!;

function openPanel(id: SectionId) {
  const s = sections[id];
  panelTitle.textContent = s.title;
  panelIcon.textContent = s.icon;
  panelBody.innerHTML = s.render({ classic: false });
  panelBody.scrollTop = 0;
  panel.hidden = false;
  game.setPaused(true);
  markVisited(id);
  track('section_open', { section: id, from: 'game' });
  panelClose.focus();
}

function closePanel() {
  if (panel.hidden) return;
  panel.hidden = true;
  game.setPaused(false);
  canvas.focus();
}

panelClose.addEventListener('click', closePanel);
panel.addEventListener('pointerdown', (e) => {
  if (e.target === panel) closePanel();
});

// ───────────── HUD

function renderHud() {
  hud.innerHTML = `
    <header class="hud-top">
      <div class="brand">
        <span class="brand-title">KESTON TOWN</span>
        <span class="brand-sub">${profile.name} · ${profile.titles[0]}</span>
      </div>
      <nav class="hud-actions">
        <a class="pbtn small" href="${profile.resume}" download>⬇ CV</a>
        <button class="pbtn small alt" type="button" data-action="classic">Classic view</button>
      </nav>
    </header>
    <aside class="quest" aria-label="Quest log">
      <button class="quest-toggle" type="button" aria-expanded="${!coarse}"></button>
      <ol class="quest-list"${coarse ? ' hidden' : ''}></ol>
    </aside>
    <p class="hint">${coarse ? 'Tap anywhere to walk · tap a building to enter' : 'WASD / arrows to move · click to walk · E to interact'}</p>`;

  const toggle = hud.querySelector<HTMLButtonElement>('.quest-toggle')!;
  const list = hud.querySelector<HTMLElement>('.quest-list')!;
  toggle.addEventListener('click', () => {
    list.hidden = !list.hidden;
    toggle.setAttribute('aria-expanded', String(!list.hidden));
  });
  list.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-goto]');
    if (!btn) return;
    game.walkTo(btn.dataset.goto!);
    if (coarse) {
      list.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
  renderQuestLog();
}

function renderQuestLog() {
  const toggle = hud.querySelector('.quest-toggle');
  const list = hud.querySelector('.quest-list');
  if (!toggle || !list) return;
  const done = QUESTS.filter((q) => visited.has(q)).length;
  toggle.innerHTML = `📜 QUESTS <span class="count">${done}/${QUESTS.length}</span>`;
  list.innerHTML = QUESTS.map((id) => {
    const ok = visited.has(id);
    return `<li><button type="button" data-goto="${id}" class="${ok ? 'done' : ''}">
      <span class="box" aria-hidden="true">${ok ? '✔' : ''}</span>
      <span>${sections[id].quest}</span>
      <span class="sr-only">${ok ? '(visited)' : ''}</span>
    </button></li>`;
  }).join('');
}

let toastTimer = 0;
function showToast(html: string) {
  toast.innerHTML = html;
  toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => (toast.hidden = true), 5000);
}

// ───────────── classic view

function showClassic(show: boolean) {
  if (show) {
    if (!classic.innerHTML) classic.innerHTML = renderClassic();
    track('classic_view');
    classic.hidden = false;
    closePanel();
    game.setSleeping(true);
    document.body.classList.add('is-classic');
    if (location.hash !== '#classic') history.replaceState(null, '', '#classic');
    classic.scrollTop = 0;
  } else {
    classic.hidden = true;
    game.setSleeping(false);
    document.body.classList.remove('is-classic');
    history.replaceState(null, '', location.pathname);
    if (game.mode === 'title') $('#start').focus();
  }
}

document.addEventListener('click', (e) => {
  const action = (e.target as HTMLElement).closest<HTMLElement>('[data-action]')?.dataset.action;
  if (action === 'classic') showClassic(true);
  if (action === 'play') showClassic(false);
});

// ───────────── title screen

function startGame() {
  if (game.mode === 'play') return;
  title.classList.add('leaving');
  setTimeout(() => (title.hidden = true), 400);
  hud.hidden = false;
  renderHud();
  game.start();
  track('game_start', { device: coarse ? 'touch' : 'desktop' });
  canvas.focus();
  if (!visited.has('welcome')) setTimeout(() => openPanel('welcome'), 450);
}

function typewriter(el: HTMLElement, words: string[]) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    el.textContent = words[0];
    return;
  }
  let w = 0;
  let i = 0;
  let deleting = false;
  const tick = () => {
    const word = words[w];
    i += deleting ? -1 : 1;
    el.textContent = word.slice(0, i);
    let delay = deleting ? 40 : 90;
    if (!deleting && i === word.length) { deleting = true; delay = 1600; }
    else if (deleting && i === 0) { deleting = false; w = (w + 1) % words.length; delay = 300; }
    setTimeout(tick, delay);
  };
  tick();
}

// ───────────── keyboard shortcuts

addEventListener('keydown', (e) => {
  if (!classic.hidden) return;
  if (e.key === 'Escape') closePanel();
  else if (game.mode === 'title' && (e.key === 'Enter' || e.key === ' ') && document.activeElement?.id !== 'title-classic') {
    e.preventDefault();
    startGame();
  }
});

// ───────────── boot

canvas.tabIndex = 0;
await document.fonts.load('10px "Press Start 2P"').catch(() => undefined);

const world = buildWorld();
const game = new Game(canvas, world, makeCharacter(), {
  onEnter: (id) => openPanel(id as SectionId),
  isVisited: (id) => visited.has(id),
});

$('#start').addEventListener('click', startGame);
$('#title-classic').addEventListener('click', () => showClassic(true));
typewriter($('#typer'), profile.titles);

if (location.hash === '#classic') showClassic(true);
