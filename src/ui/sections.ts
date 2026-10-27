import { profile } from '../data/profile';

export type SectionId = 'welcome' | 'about' | 'skills' | 'experience' | 'education' | 'certs' | 'contact';

export interface Section {
  title: string;
  icon: string;
  /** Short line shown in the quest log. */
  quest: string;
  render(opts: { classic: boolean }): string;
}

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]!);

const chips = (items: string[]) => `<ul class="chips">${items.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>`;

const bar = (name: string, level: number) => {
  const filled = Math.round(level / 10);
  const cells = Array.from({ length: 10 }, (_, k) => `<i${k < filled ? ' class="on"' : ''}></i>`).join('');
  return `<div class="stat"><span class="stat-name">${esc(name)}</span><span class="stat-bar" role="img" aria-label="${level}%">${cells}</span><span class="stat-val">${level}</span></div>`;
};

const cvButton = `<a class="pbtn" href="${profile.resume}" download>⬇ Download CV</a>`;

export const sections: Record<SectionId, Section> = {
  welcome: {
    title: 'Welcome to Keston Town',
    icon: '📜',
    quest: 'Read the welcome sign',
    render: () => `
      <p class="lead">Hi, traveller! I'm <strong>${esc(profile.name)}</strong>, a ${esc(profile.titles[0])} from ${esc(profile.location)}.</p>
      <p>This little town is my résumé. Each building holds a part of my story — walk in to read it.</p>
      <ul class="howto">
        <li><kbd>WASD</kbd> / <kbd>←↑↓→</kbd> move</li>
        <li><strong>Click / tap</strong> anywhere to walk there</li>
        <li><kbd>E</kbd> interact · <kbd>Esc</kbd> close</li>
        <li>Use the <strong>quest log</strong> to fast-travel</li>
      </ul>
      <p class="muted">In a hurry? Use <strong>Classic view</strong> at the top for a regular page.</p>`,
  },

  about: {
    title: 'About Me',
    icon: '🏠',
    quest: 'Visit my house',
    render: ({ classic }) => `
      <div class="about-head">
        ${classic ? '' : `<img class="avatar" src="${profile.photo}" alt="Portrait of ${esc(profile.name)}" width="112" height="112">`}
        <dl class="charsheet">
          <div><dt>Name</dt><dd>${esc(profile.name)}</dd></div>
          <div><dt>Class</dt><dd>${esc(profile.titles[0])}</dd></div>
          <div><dt>Level</dt><dd>${profile.yearsExperience} years XP</dd></div>
          <div><dt>Home</dt><dd>${esc(profile.location)}</dd></div>
        </dl>
      </div>
      ${profile.about.map((p) => `<p>${esc(p)}</p>`).join('')}
      <h3>Interests</h3>
      <ul class="chips">${profile.interests.map((i) => `<li><span aria-hidden="true">${i.icon}</span> ${esc(i.label)}</li>`).join('')}</ul>
      <p class="actions">${cvButton}</p>`,
  },

  experience: {
    title: 'Experience',
    icon: '💼',
    quest: 'Check in at the office',
    render: () =>
      profile.experience
        .map(
          (job, n) => `
      <article class="card">
        <header>
          <p class="kicker">Quest ${profile.experience.length - n}${job.current ? ' <span class="badge">In progress</span>' : ' · Completed'}</p>
          <h3>${esc(job.role)} <span class="at">@ ${esc(job.company)}</span></h3>
          <p class="muted">${esc(job.period)}</p>
        </header>
        ${job.project ? `<p><strong>Project:</strong> ${esc(job.project)}</p>` : ''}
        <ul>${job.summary.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>
        ${chips(job.tech)}
      </article>`,
        )
        .join(''),
  },

  education: {
    title: 'Education',
    icon: '🎓',
    quest: 'Go back to school',
    render: () =>
      profile.education
        .map(
          (e) => `
      <article class="card">
        <p class="kicker">${esc(e.period)} · ${esc(e.status)}</p>
        <h3>${esc(e.degree)}</h3>
        <p class="muted">${esc(e.school)}</p>
      </article>`,
        )
        .join(''),
  },

  certs: {
    title: 'Certifications',
    icon: '🏆',
    quest: 'See the trophy hall',
    render: () => `
      <div class="achievements">
        ${profile.certifications
          .map(
            (c) => `
        <article class="achievement">
          <span class="trophy" aria-hidden="true">🏆</span>
          <div>
            <p class="kicker">Achievement unlocked · ${esc(c.issuer)}</p>
            <h3>${esc(c.title)}</h3>
            <p>${esc(c.description)}</p>
          </div>
        </article>`,
          )
          .join('')}
      </div>`,
  },

  skills: {
    title: 'Skills & Process',
    icon: '⚒️',
    quest: 'Visit the skill forge',
    render: () => `
      <h3>Core stats</h3>
      <div class="stats">${profile.skills.map((s) => bar(s.name, s.level)).join('')}</div>
      <h3>Tech</h3>
      <div class="stats">${profile.techSkills.map((s) => bar(s.name, s.level)).join('')}</div>
      <h3>How I work</h3>
      <ol class="process">
        ${profile.process.map((p) => `<li><span class="step">${p.step}</span><div><strong>${esc(p.title)}</strong><p>${esc(p.text)}</p></div></li>`).join('')}
      </ol>`,
  },

  contact: {
    title: 'Contact',
    icon: '✉️',
    quest: 'Send me a letter',
    render: () => `
      <p class="lead">Want to team up on a quest? Send me a message!</p>
      <ul class="contact">
        <li><span>Email</span><a href="mailto:${profile.email}">${esc(profile.email)}</a></li>
        <li><span>Phone</span><a href="tel:${profile.phone.replace(/[^+\d]/g, '')}">${esc(profile.phone)}</a></li>
        <li><span>Location</span>${esc(profile.location)}</li>
      </ul>
      <p class="actions">
        <a class="pbtn" href="mailto:${profile.email}">✉ Email me</a>
        ${profile.socials.map((s) => `<a class="pbtn alt" href="${s.url}" target="_blank" rel="noopener">${esc(s.label)}</a>`).join('')}
        ${cvButton}
      </p>`,
  },
};

/** Order used by the quest log and the classic view. */
export const QUESTS: SectionId[] = ['about', 'experience', 'education', 'skills', 'certs', 'contact'];
