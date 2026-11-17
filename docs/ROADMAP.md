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

## New asks from Marjie (Nov 17, later). Do these right after the phase in progress
- [x] **NAME. Done: the app is now "Bestie HQ".** (Marjie had no preference; she can still change it.) Original ask: pick a catchier, cuter app name (priority). Show 3 to 5 options and let Marjie choose. Change the shown name everywhere (title, header, manifest, share tags, README, docs). Keep the repo name and URL so the installed app and links keep working.
- [ ] **M. Money coach + "real friend" voice.** Help save more and spend less: spending limits per category, a daily or weekly cap, no-spend streaks and challenges, an impulse-buy wait list ("wait 24 hours, still want it?"), "need or want?" check, savings jar, simple insights ("food is 45% of your spending"), warnings before you go over budget. The app talks like a real, blunt, caring friend: casual Taglish, funny, honest, teasing, no corporate filter, never cruel and no shaming about bodies, family or money struggles. Add a Tone setting (Gentle / Real talk / Savage roast, default Real talk). Write `docs/VOICE.md` with the voice rules and apply it to all app text.
- [ ] **N. Reminders.** Real notifications for tasks, deadlines, quizzes, budget and "feed your companion". Honest limits: browsers only show reminders when the app can run; on iPhone it needs the installed app (iOS 16.4+) and true background push needs a small server. Plan: (1) in-app reminders and notifications while the app is open, (2) "Add to phone calendar" (.ics) so the phone itself reminds even offline, (3) Web Push later with login and a server.
- [ ] **P. Profile page.** One easy place to customize everything: name, picture (their companion or a photo), school and program, grading rules, theme colors, light/dark, tone, reminders, companion styles, backup and restore.

## Built so far
- Journey map, templates, custom journey (max 30 stops), themes, walking pet
- Dean's List calculator with editable school rules
- Money with budget, expenses, wishlist, receipt photo with auto-read
- Installable app (offline), live on GitHub Pages
- Companions: up to 3 (person, animal or other), customizable, feed/play/cuddle, Treats instead of XP, shop for outfits and rooms, Home tab

## Phases to build
- [x] **A. Companions replace XP.** (done Nov 17, live on main) Up to 3, person/animal/other, customize, care (feed, play, cuddle), Treats, growth stages, unlock 2nd and 3rd as you grow. Remove XP/level wording everywhere.
- [x] **B. Humanized look.** (done Nov 17, live on main) Notebook paper + tape + sticky-note header + highlighter tabs + stamps, Gaegu/Nunito/Caveat fonts, tab settle animation, confetti, more motion. The new nav (Home, Journey, Study, Money, School) happens in phases E and F when Study and School exist. Still to polish later: companion room storybook scenes, more hand-drawn details.
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
