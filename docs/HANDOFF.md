# Handoff

**Last updated:** Nov 17, 2026

## Done
- Phase 1 MVP built and tested at iPhone width (no console errors).
- Moved from the Claude artifact into this project folder and split it into organized files (css/, js/, js/views/).
- Removed the artifact-only cloud sync. Data now saves in the browser only.
- **Phase 1.5 UI reorganize (Nov 17).** Decided with grill-me, designed with frontend-design:
  - Navigation: bottom tab bar on phone, left sidebar on laptop (900px+). Same 3 tabs: Journey, Money, Planner (soon).
  - Slim header on every tab: Pom, name, "Lv X · Title" pill, thin XP bar, gear icon for Settings. The big level card is gone.
  - The 3 stats (terms, Dean's List, quests) now sit at the top of Journey only.
  - Journey: Map | Side quests switch on phone; side by side on laptop. Add-quest is a pop-up ("+ Quest"). XP rules are behind the "?" button.
  - Money: Spending | Wishlist switch on phone; side by side on laptop. Floating "+ Expense" button opens a pop-up. "+ Wish" is a pop-up too.
  - "Saved on this device" note moved into Settings.
  - Soft & bubbly look: chunky "sticker" buttons that squish when tapped, rounder cards, dotted background, colored stat tiles, category bubbles on expenses, Pom with blush cheeks.
  - Pom moods: it sleeps (closed eyes) from 10pm to 6am, and hops when you earn XP.
  - Tested at 390px (light + dark) and 1280px. Adding a quest, adding an expense and the view switches all work, with no console errors.
- Added `.claude/launch.json` (local server on port 5500 via `py -m http.server`) so Claude can preview the app with CSS loaded.
- Git repo set up on branch `main` with the first commit. This project commits with the personal Gmail (set in this repo's git config only; other projects still use the Benilde email).
- On GitHub (public): https://github.com/Marjie19/levelup-hq. GitHub CLI (`gh`) is installed and logged in as Marjie19.
- **Live on GitHub Pages:** https://marjie19.github.io/levelup-hq/ (HTTPS forced). Every push to `main` updates it in about a minute.
- Launch checklist pass: fixed dark-mode contrast (text on plum) and the light-mode green; added meta description, share tags, Pom favicon, skip link, cute 404 page, robots.txt and sitemap.xml. N/A: privacy/terms/cookie banner (no data collected; everything stays in the browser), server validation and spam protection (no server), analytics (skipped on purpose for privacy).

- **Installable app (Nov 17):** manifest.webmanifest, sw.js (network-first, works offline), Pom icons in icons/ (made by a script, not in the repo), og:image share picture, iOS home-screen tags, and an install tip in Settings. Checked live: icons, manifest and service worker all load. NOT yet tested on a real iPhone.

## Plan agreed with Marjie (Nov 17)
Audience: Filipino college students, not tied to one school. Build order:
1. Install on phone (done, needs iPhone test).
2. **Dean's List calculator tab** (4th tab): course list with units + grade, editable rules (cutoff, scale 4.0 or 1.0-5.0, min units, no grade below X), says if you made it or how close, can save result to a term.
3. **Customizable Journey:** program length + term names (Trimester/Semester/Term), map theme (Forest, Space, Candy, Beach), pet choice + name, own milestones (icon, color, XP), pet walks along the map to the next stop. Not now: confetti, drag-to-reorder.

## Next
1. Marjie tries Add to Home Screen on her iPhone and says if it works.
2. Build the Dean's List calculator, then the customizable Journey (small steps, commit after each).
3. Run Lighthouse on the live site.

## Known bugs / notes
- Data from the old artifact version doesn't carry over (different storage). Re-enter it once.
- Data doesn't sync between laptop and phone yet (Phase 3).
- The Dean's List cutoff default (3.50) is a placeholder. Set the real one from the Benilde handbook.
- If the page looks unstyled or old after an update, hard-refresh (Ctrl+Shift+R) because the browser may be caching old CSS.
- The installed home-screen app has its own storage, separate from Safari. Data entered in Safari does not appear in the installed app. A Backup / Restore button would fix this (not built).
- Which view is showing (Map/Quests, Spending/Wishlist) isn't saved. It resets to Map/Spending on reload.
