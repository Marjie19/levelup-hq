# LevelUp HQ

My all-in-one student life app. It's a personal project and a portfolio piece for my resume, since I want to become a product manager.

## About me
- Marjie: BS Information Systems student at De La Salle-College of Saint Benilde.
- I'm still learning. Explain what you're doing and why, in simple words.
- I use an **iPhone 13 Pro** (Safari) and a Windows laptop. The app has to work well on both.
- Keep replies short, casual and friendly.

## How to work with me
- Use my installed skills: **project-kickoff** to plan, **grill-me** to clear up ideas, **frontend-design** for UI, and **website-launch-checklist** before we publish.
- Build in small steps. After each step, test that the page loads with no console errors, the buttons and forms work, and it looks right at 390px wide (iPhone) and on desktop.
- Suggest a git commit after each working step.
- If something breaks, ask me for a screenshot.
- End each session by updating `docs/HANDOFF.md`.

## Tech (for now)
- Plain HTML, CSS and JavaScript, with no build step. Open `index.html` in a browser to run it.
- Scripts are classic `<script>` tags loaded in order (see `index.html`), and they share global variables.
- Data is saved in the browser's `localStorage` (key `levelup-hq-v1`). Receipt photos are saved in IndexedDB. There's no login or cloud sync yet.
- It's an installable app (manifest.webmanifest + sw.js). Live at https://marjie19.github.io/levelup-hq/ (GitHub Pages, updates on every push to `main`).

## Folder map
```
index.html          page skeleton and script order
css/styles.css      all styles; color and font tokens are at the top (light + dark)
js/templates.js     journey templates, themes, pets, icons (loaded before state.js)
js/state.js         data shape (S) and defaults
js/utils.js         helpers: $, esc, peso, today, toast
js/storage.js       save/load (localStorage only for now)
js/game.js          XP, levels, Dean's List rules
js/views/*.js       one file per screen part: header, journey, deans (Dean's List calculator), money, planner
js/modals.js        pop-up sheets (term GPA, goals, setup, settings, budget)
js/journeyedit.js   journey sheets: pick template, theme and pet, edit own stops, milestones
js/receipts.js      receipt photos (saved in IndexedDB) and reading the total from them
js/events.js        click and submit handlers
js/app.js           tab routing (#journey, #money, #planner) and start-up
docs/ROADMAP.md     phases and feature ideas
docs/HANDOFF.md     what's done, what's next, known bugs
```

## Design
- Game-like and cute, with a Pomeranian mascot and plum + apricot colors. It supports dark mode, since I work at night.
- Fonts: Fredoka for headings and DM Sans for body text.
- Inputs use a 16px font size so the iPhone doesn't zoom in when you tap them.
