# Keston Town — keston.xyz

My portfolio as a small explorable pixel-art town. Walk into buildings to read about me,
my experience, education, skills and certifications. There's also a plain "classic view" (`/#classic`).

- **Content:** edit `src/data/profile.ts`. Both the game and the classic view render from it.
- **Art:** everything is drawn in code (`src/game/art.ts`, `src/game/character.ts`), no image assets.
- **Map layout:** `src/game/world.ts`.

```bash
npm install
npm run dev      # local dev server
npm run build    # production build into dist/
```

Pushing to `main` builds and deploys to GitHub Pages via `.github/workflows/deploy.yml`.
