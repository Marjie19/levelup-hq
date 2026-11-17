# Handoff

**Auto-build note (Nov 17, 2026):** work is on branch `auto-build`, not live until Marjie merges it into `main`. Merge it when you like (it already includes everything from `main` up to Phase B).

**Done on auto-build: Phase M, Money coach + real-friend voice.** Code in `js/coach.js` (new), `js/views/money.js`, `js/modals.js`, `js/events.js`, `js/state.js`. Voice rules in `docs/VOICE.md`. What it does: Tone setting (Gentle / Real talk / Savage roast, default Real talk) in Settings; per-category monthly limits and a daily cap (Limits button, warnings before and after you pass them, red bars); no-spend streak plus 3/5/7/14-day challenge that pays bonus treats; need-or-want chips on every expense with a nudge to wait 24h; Wait list (24h, then Still want it / Skip, skipping earns treats and counts toward the 'skipped' total); Savings jar with goal; insights (top category %, wants share, biggest day, month-end projection). Money's second tab is now 'Jar & wishes'. New data keys (all default safely for old saves): tone, catLimits, dayCap, challenge, streakFrom, waits, jar, jarGoal, skipped, and expense.kind. sw.js cache is v4 and lists coach.js. Tested at 390px and 1280px, light and dark, no app errors (the preview pane cannot register the service worker, so that one console line is the pane, not the app). Not yet applied: the friend voice on Home, Journey and Grades text (only the Money coach uses it so far).

**Done on auto-build: Phase P, Profile page.** `js/views/profile.js` (new), route `#profile` (not a nav tab: the header gear button and nothing else opens it). One page, autosaves on every change: name, school, program, age, picture (companion or a photo shrunk to 160px and kept in `S.profile.photo`), grading rules (reuses `ruleFields`/`readRules`), Light/Auto/Dark, five accent colors (`data-accent` on `<html>`, CSS at the end of styles.css), companion styles shortcut, tone, reminders, Save backup (.json download) and Restore backup (checks the file, asks to confirm, migrates old shapes via `restoreData`), install tip, reset. New data keys: `look {mode, accent}`, `profile {school, program, photo, avatar}`. `applyLook()` runs at start-up. The header avatar shows the photo if chosen. sw.js cache v6. Tested at 390px and 1280px, light and dark, no app errors. Notes: the old Settings sheet (`openSettings`) is no longer reachable but its field helpers are still used by first-time Setup; backup does not include receipt photos (IndexedDB); a restored backup from before this phase resets look to defaults. Not tested on a real iPhone (photo picker / file download behave differently in Safari).

**Next on auto-build:** Phase C (Welcome + tips), then D to H.

**Also done on auto-build: Phase N, Reminders.** `js/reminders.js` (new). Settings has a 🔔 Reminders button. Own reminders (task / deadline / quiz / other with date and time), each with 📅 to download a .ics file so the phone calendar reminds even when the app is closed, plus 'All to calendar'. Automatic reminders (toggles): feed a sad companion (once a day after 9am), budget 80% and 100%, evening nudge to log spending (off by default, time is editable). A checker runs every 30 seconds and when you return to the app; it shows a toast and, if notifications are allowed, a system notification through the service worker. Honest limits are written inside the sheet (iPhone needs the installed app, iOS 16.4+; true background push needs a server, still future). Data keys: reminders, remind, remindLog. sw.js cache v5. Tested at 390px: add, fire, done, delete, .ics text; notifications permission was 'denied' in the preview pane so the system-notification path is NOT tested on a real device. Taglish friend-voice lines live in `LINES` (rFeed, rEvening, rBudget, rDue).

---

**App name: Bestie HQ** (renamed Nov 17 from LevelUp HQ; Marjie had no preference, so the recommended name was used). The repo, web link, localStorage key and cache names keep the old levelup-hq spelling on purpose so nothing breaks.

**If `git push` hangs** (it waits on a hidden Git Credential Manager login window), push with the GitHub CLI login: `git -c credential.helper= -c "credential.helper=!\"C:/Program Files/GitHub CLI/gh.exe\" auth git-credential" push origin <branch>`.

**Last updated:** Nov 17, 2026 (auto-build)

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

- **Humanized look (Phase B, Nov 17).** Tokens at the top of css/styles.css (paper cream, ink brown, --note sticky yellow, --hl highlighter), fonts Gaegu (headings), Nunito (body), Caveat (--hand notes). The block at the END of css/styles.css ("Bestie look") restyles everything: paper cards with washi tape and tiny tilt, sticky-note header, highlighter on the open tab, dashed stamps, inked buttons. `#view.enter` settle animation only when the tab changes (app.js lastTab). js/fx.js has confetti(el,count) (Dean's List pass, companion grows up, new companion). `.note` and `.hand` classes are ready for tips and friend-voice text. Tab 'Dean's List' is now labeled 'Grades'.
- **Companions replace XP (Phase A, Nov 17).** No XP or levels anywhere: `growth()` (old XP total) is hidden, and rewards show as Treats ("+12 🍪", tx(xp) = xp/10). New Home tab (#home) is the default screen: room, speech bubble, Feed / Play / Style / Edit, cuddle by tapping, daily gift (+5), 3 meters. Up to 3 companions (person, animal or other: 13 drawn species, colors, outfits, rooms), 2nd unlocks at growth 1000 and 3rd at 3000 (SLOT_AT). Stages Baby, Kid, Teen, Grown (STAGES). They never die: low fullness or joy just makes them sad. Code: js/pets.js, js/petsheets.js, js/views/home.js. Old saved pet (S.pet) migrates to the first companion. New data: S.pets, S.activePet, S.room, S.owned, S.treatsSpent, S.bonusTreats, S.studyTreats, S.lastGift. Treats = floor(growth/10) + bonus + study - spent. Setup now ends by opening the companion maker (mode "first").

## Plan agreed with Marjie (Nov 17)
Audience: Filipino college students, not tied to one school. Build order:
1. Install on phone (done, needs iPhone test).
2. **Dean's List calculator tab** (DONE Nov 17). New tab "Dean's List" (#deans). Enter courses (name, units, grade), live GPA ring with count-up, rule checklist (GPA cutoff, min units, worst grade allowed), "so close" hints, XP preview, and "Save to term" which fills that term on the Journey (with its Dean's List flag). Rules sheet ("Edit rules", also in Settings/Setup): scale (4.0 or 1.0-5.0), cutoff, min units, worst grade. Switching scale converts saved GPAs with 5 minus the grade, so XP stays the same. Data: S.scale, S.minUnits, S.worst, S.deanFlags, S.calc. Code: js/views/deans.js; helpers in js/game.js (pointsOf, meetsCutoff, isDean, termLabel) and js/modals.js (ruleFields, readRules, openRules).
3. **Journey templates + custom journey (DONE Nov 17).** Journey is now a list of stops (S.journey = {tpl, stops}). Stop kinds: "term" (log a GPA, stored under the stop id), "mile" (tick off for XP), "grad" (finish line, auto). Templates (js/templates.js): College 2 semesters, College 3 trimesters, 5-year + board exam, Senior High. "My own journey" editor (js/journeyedit.js): add, remove, reorder, rename, icon, XP, section; max 30 stops (MAX_STOPS). Switching templates never deletes GPAs; the custom stops are kept in S.customStops so you can switch back. Old saved data (years + terms per year) migrates automatically (migrateJourney in js/state.js). Also built: map themes (Plain, Forest, Space, Candy, Beach), pet choice + name (Pom drawing or emoji pets), and the pet walks along the trail to the next stop when you finish one (S.petAt remembers where it stood). Not built: confetti, drag-to-reorder.
   Marjie's words: "up to 30" was read as max 30 stops in the custom journey. Ask her if she meant something else.
4. **Receipt photo in Money (DONE Nov 17).** "Add an expense" has Take photo / Choose photo. The photo is resized, saved in IndexedDB (js/receipts.js) and linked to the expense (e.pic). The reader (Tesseract.js 5.1.1 from jsDelivr, loads on first use, needs internet that first time) fills the amount, date, store name and category. It is a guess: the sheet says "check it before saving". Tap the camera icon on an expense to view or delete the photo. Photos are on this device only (not in any backup, none exists yet). Security: the reader script has an integrity hash (SRI, sha384) so a tampered CDN copy is refused. Not covered: the reader's worker, WASM core and English language data still load from CDNs without a hash. Full fix = host them in this repo (about 10 MB) and set workerPath/corePath/langPath.

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
1. Marjie tries the live app on her iPhone (Add to Home Screen, Dean's List tab, Journey templates, receipt photo with the real camera) and says what feels off.
2. Still on the master list, waiting for Marjie's go: projects hub, AI helper, handbook + school rules (see the master build list).
3. Run Lighthouse on the live site.

## Known bugs / notes
- Data from the old artifact version doesn't carry over (different storage). Re-enter it once.
- Data doesn't sync between laptop and phone yet (Phase 3).
- The Dean's List defaults (cutoff 3.50, min 12 units, no worst-grade limit) are placeholders. Each person sets their school's real rules. Grade lists are fixed steps (4.0 scale: 4.0 to 0.0 in halves; 1.0-5.0 scale: 1.0 to 3.0 in quarters, then 4.0, 5.0).
- The service worker (sw.js, cache v2) now revalidates every file, so updates show right away. Before that fix, GitHub's 10-minute cache could serve a mix of old and new files for one visit.
- If the page looks unstyled or old after an update, hard-refresh (Ctrl+Shift+R) because the browser may be caching old CSS.
- The installed home-screen app has its own storage, separate from Safari. Data entered in Safari does not appear in the installed app. A Backup / Restore button would fix this (not built).
- Which view is showing (Map/Quests, Spending/Wishlist) isn't saved. It resets to Map/Spending on reload.
