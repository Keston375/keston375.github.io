import { profile } from '../data/profile';
import { QUESTS, sections } from './sections';

/** Plain, scrollable résumé page for recruiters, mobile users and search engines. */
export function renderClassic(): string {
  const year = new Date().getFullYear();
  return `
    <div class="classic-wrap">
      <header class="hero">
        <img class="hero-photo" src="${profile.photo}" alt="Portrait of ${profile.name}" width="160" height="160">
        <div>
          <p class="kicker">Hi, I'm</p>
          <h1>${profile.name}</h1>
          <p class="hero-role">${profile.titles.slice(0, 2).join(' · ')} — ${profile.location}</p>
          <p class="actions">
            <button class="pbtn" type="button" data-action="play">🎮 Play the game version</button>
            <a class="pbtn alt" href="${profile.resume}" download>⬇ Download CV</a>
            <a class="pbtn alt" href="mailto:${profile.email}">✉ Email</a>
          </p>
        </div>
      </header>
      <nav class="classic-nav" aria-label="Sections">
        ${QUESTS.map((id) => `<a href="#c-${id}">${sections[id].title}</a>`).join('')}
      </nav>
      ${QUESTS.map(
        (id) => `
      <section id="c-${id}" class="classic-section">
        <h2><span aria-hidden="true">${sections[id].icon}</span> ${sections[id].title}</h2>
        ${sections[id].render({ classic: true })}
      </section>`,
      ).join('')}
      <footer class="classic-foot">© ${year} ${profile.name} · Built as a tiny pixel town</footer>
    </div>`;
}
