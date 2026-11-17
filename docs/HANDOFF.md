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
- Git repo set up on branch `main` with the first commit. This project commits with the personal Gmail (set in this repo's git config only; other projects still use the Benilde email). Not on GitHub yet.

## Next
1. Marjie checks the new layout on her iPhone and laptop and says what still feels off.
2. Create a GitHub repo on the personal account and push `main` to it.
3. Make it installable on the iPhone home screen.

## Known bugs / notes
- Data from the old artifact version doesn't carry over (different storage). Re-enter it once.
- Data doesn't sync between laptop and phone yet (Phase 3).
- The Dean's List cutoff default (3.50) is a placeholder. Set the real one from the Benilde handbook.
- If the page looks unstyled or old after an update, hard-refresh (Ctrl+Shift+R) because the browser may be caching old CSS.
- Which view is showing (Map/Quests, Spending/Wishlist) isn't saved. It resets to Map/Spending on reload.
