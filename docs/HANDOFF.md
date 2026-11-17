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
2. **Dean's List calculator tab** (DONE Nov 17). New tab "Dean's List" (#deans). Enter courses (name, units, grade), live GPA ring with count-up, rule checklist (GPA cutoff, min units, worst grade allowed), "so close" hints, XP preview, and "Save to term" which fills that term on the Journey (with its Dean's List flag). Rules sheet ("Edit rules", also in Settings/Setup): scale (4.0 or 1.0-5.0), cutoff, min units, worst grade. Switching scale converts saved GPAs with 5 minus the grade, so XP stays the same. Data: S.scale, S.minUnits, S.worst, S.deanFlags, S.calc. Code: js/views/deans.js; helpers in js/game.js (pointsOf, meetsCutoff, isDean, termLabel) and js/modals.js (ruleFields, readRules, openRules).
3. **Journey templates (WAITING for Marjie to say "build it").** Marjie wants: several ready-made Journey templates the user picks from, plus one fully custom Journey they edit themselves. Combine with the earlier ideas below (term names, map theme, pet + name, own milestones, pet walks to the next stop). Not decided yet: which templates, and what a template contains (stops, theme, pet). Ask or grill before building.
   Earlier idea list, **Customizable Journey:** program length + term names (Trimester/Semester/Term), map theme (Forest, Space, Candy, Beach), pet choice + name, own milestones (icon, color, XP), pet walks along the map to the next stop. Not now: confetti, drag-to-reorder.

## Master build list (Marjie, Nov 17). When she says "build it", build ALL of these, in small steps, grill-me first
1. **Journey templates + one fully custom journey** (see item 3 above).
2. **Projects hub:** users put all their school projects in one place and open them easily (links, files, notes, deadlines, status). Open: what counts as a "project" and how files are stored.
3. **AI helper:** a chat where students can talk to someone and ask questions, ideally aware of their handbook, grades and rules.
4. **Handbook + school rules:** users add their school handbook so the app stays up to date. It holds the grading system (GPA; 4.0-highest or 1.0-highest, already built in the Dean's List tab), allowed absences, and other rules. Absences need a tracker (count vs allowed).
Risks to settle before building:
- **AI needs a server.** An API key must never be in the frontend (the repo is public). Needs a small proxy (for example a Cloudflare Worker) that holds the key, plus rate limits and a cost plan (who pays for other students' chats).
- **Handbook storage and privacy.** PDFs can be big. Browser storage is limited (use IndexedDB). Sending handbook text to an AI is a privacy choice users should see and agree to.
- Data is per device (no login or sync yet), so projects and handbook would not move between phone and laptop until Phase 3.

## Next
1. Marjie tries Add to Home Screen on her iPhone and says if it works. Also test the Dean's List tab on the phone.
2. Journey templates + custom journey: wait for Marjie's go, then grill-me on the templates, then build in small steps. Use termLabel(k) in js/game.js for term names.
3. Run Lighthouse on the live site.

## Known bugs / notes
- Data from the old artifact version doesn't carry over (different storage). Re-enter it once.
- Data doesn't sync between laptop and phone yet (Phase 3).
- The Dean's List defaults (cutoff 3.50, min 12 units, no worst-grade limit) are placeholders. Each person sets their school's real rules. Grade lists are fixed steps (4.0 scale: 4.0 to 0.0 in halves; 1.0-5.0 scale: 1.0 to 3.0 in quarters, then 4.0, 5.0).
- The service worker (sw.js, cache v2) now revalidates every file, so updates show right away. Before that fix, GitHub's 10-minute cache could serve a mix of old and new files for one visit.
- If the page looks unstyled or old after an update, hard-refresh (Ctrl+Shift+R) because the browser may be caching old CSS.
- The installed home-screen app has its own storage, separate from Safari. Data entered in Safari does not appear in the installed app. A Backup / Restore button would fix this (not built).
- Which view is showing (Map/Quests, Spending/Wishlist) isn't saved. It resets to Map/Spending on reload.
