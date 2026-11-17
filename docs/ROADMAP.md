# Roadmap

Marjie's big wishlist (Nov 17, 2026) and the decisions she made. Work top to bottom. Tick a box when a phase is built, tested and pushed. HANDOFF.md says where we stopped.

## Decisions (Marjie said these, do not re-ask)
- **Companions replace XP.** No XP or levels shown anywhere. Studying, grades, quests and tasks earn **Treats**. Treats buy food, toys and outfits. Companions grow and bond. Never die: if ignored they get sleepy or sad.
- **Up to 3 companions.** You get one at the start and unlock the 2nd and 3rd as you grow. Each is a **person, animal or other** and is customizable (name, colors, accessory).
- **Look = student notebook / scrapbook + cozy storybook, mixed.** Paper texture, sticky notes, washi tape, stamps, handwritten notes, a little tilt, plus soft illustrated scenes. Must not look like generic AI UI.
- **Plot twist is a secret from Marjie.** Spoilers live only in `docs/SPOILERS.md`. Do not describe the twist in chat, HANDOFF or this file.
- **Keep going when tokens run out.** A scheduled job continues the work on the `auto-build` branch (never the live `main`). Marjie merges when she wants.
- Audience: Filipino college students, not tied to one school. 4.0-highest and 1.0-highest grading both supported.
- Build in small steps, test at 390px and desktop, commit after each step, update HANDOFF.

## Built so far
- Journey map, templates, custom journey (max 30 stops), themes, walking pet
- Dean's List calculator with editable school rules
- Money with budget, expenses, wishlist, receipt photo with auto-read
- Installable app (offline), live on GitHub Pages

## Phases to build
- [ ] **A. Companions replace XP.** Up to 3, person/animal/other, customize, care (feed, play, cuddle), Treats, growth stages, unlock 2nd and 3rd as you grow. Remove XP/level wording everywhere.
- [ ] **B. Humanized look.** Scrapbook + storybook restyle, more animations, new nav (Home, Journey, Study, Money, School).
- [ ] **C. Welcome + short instructions.** First-open story welcome, a short tip on every screen (2 to 3 lines, dismissible, "?" to reopen).
- [ ] **D. Starter side quests.** At least 5 ready-made, optional, editable and removable.
- [ ] **E. School hub.** Planner (tasks, deadlines, class schedule), handbook (paste or upload text), allowed absences tracker, grading rules, projects hub (compile all projects and open easily).
- [ ] **F. Study tools.** Focus mode (timer, keep screen on, companion studies with you), flashcards and quiz maker (flip, multiple choice, type answer, streaks), earns Treats.
- [ ] **G. Helper chat ("Ask").** Chat that answers from the handbook and app knowledge. Optional real AI through a small server (worker file included, not deployed). API keys never go in the frontend.
- [ ] **H. Plot twist + extras.** The secret twist. More customizing (accent colors, light/dark, fonts, card style, companion rooms). More animations.

## Future (note only, do not build yet)
- **Registration and login** so Marjie's laptop and phone share the same data (Supabase or Firebase). Needs a backend decision and privacy page.
- **Sync with other apps**: Google Docs, Gmail, Google Calendar. Needs sign-in with Google (OAuth) and a server. Read-only first.
- Backup and restore button (also moves data between Safari and the installed app).
- Self-host the receipt reader files (about 10 MB) so it works offline.
- Sharing: let classmates join, collect feedback, PM portfolio story.

## Idea parking lot
- (add new feature ideas here)
