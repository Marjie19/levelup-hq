# Roadmap

Marjie's big wishlist (Nov 17, 2026) and the decisions she made. Work top to bottom. Tick a box when a phase is built, tested and pushed. HANDOFF.md says where we stopped.

## Decisions (Marjie said these, do not re-ask)
- **Companions replace XP.** No XP or levels shown anywhere. Studying, grades, quests and tasks earn **Treats**. Treats buy food, toys and outfits. Companions grow and bond. Never die: if ignored they get sleepy or sad.
- **Up to 3 companions.** You get one at the start and unlock the 2nd and 3rd as you grow. Each is a **person, animal or other** and is customizable (name, colors, accessory).
- **Look = student notebook / scrapbook + cozy storybook, mixed.** Paper texture, sticky notes, washi tape, stamps, handwritten notes, a little tilt, plus soft illustrated scenes. Must not look like generic AI UI.
- **Plot twist is a secret from Marjie.** Spoilers live only in `docs/SPOILERS.md`. Do not describe the twist in chat, HANDOFF or this file.
- **Keep going when tokens run out.** A scheduled job continues the work on the `auto-build` branch (never the live `main`). Marjie merges when she wants.
- **FREE ONLY (Marjie, Nov 17).** Nothing may cost money. No paid APIs, no paid hosting, no domain, no App Store. Only use free tiers and tell Marjie if a free tier has a catch. Concretely:
  - **Helper chat (phase G):** the default is a free, offline handbook helper (searches her handbook, the app's tips and FAQs, no server). Optional "bring your own free key": the user pastes their own free Google AI Studio (Gemini) key in Profile; the key stays on their device and is never in the repo. No shared server and no key of Marjie's.
  - **Login, sync, friends, shared savings (phases L and S):** only with a free Supabase (or Firebase Spark) project that Marjie creates herself. Wait for her to say she made it and give the URL and public key. Until then build everything that works without it (local-first, clean data shapes). Never add a paid plan.
  - **Gmail / Docs / Calendar:** no Google sign-in (OAuth). Use paste-a-link, copy/paste, Web Share, and .ics files instead.
  - **Reminders when the app is closed:** use .ics calendar files (free). No push server for now.
  - Skip: custom domain, App Store, paid AI, paid hosting.
- Audience: Filipino college students, not tied to one school. 4.0-highest and 1.0-highest grading both supported.
- Build in small steps, test at 390px and desktop, commit after each step, update HANDOFF.

## New asks from Marjie (Nov 17, later). Do these right after the phase in progress
- [x] **NAME. Done: the app is now "Bestie HQ".** (Marjie had no preference; she can still change it.) Original ask: pick a catchier, cuter app name (priority). Show 3 to 5 options and let Marjie choose. Change the shown name everywhere (title, header, manifest, share tags, README, docs). Keep the repo name and URL so the installed app and links keep working.
- [x] **M. Money coach + "real friend" voice.** (done Nov 17 on branch auto-build) Help save more and spend less: spending limits per category, a daily or weekly cap, no-spend streaks and challenges, an impulse-buy wait list ("wait 24 hours, still want it?"), "need or want?" check, savings jar, simple insights ("food is 45% of your spending"), warnings before you go over budget. The app talks like a real, blunt, caring friend: casual Taglish, funny, honest, teasing, no corporate filter, never cruel and no shaming about bodies, family or money struggles. Add a Tone setting (Gentle / Real talk / Savage roast, default Real talk). Write `docs/VOICE.md` with the voice rules and apply it to all app text.
- [x] **N. Reminders.** (done Nov 17 on branch auto-build, steps 1 and 2; step 3 Web Push is future) Real notifications for tasks, deadlines, quizzes, budget and "feed your companion". Honest limits: browsers only show reminders when the app can run; on iPhone it needs the installed app (iOS 16.4+) and true background push needs a small server. Plan: (1) in-app reminders and notifications while the app is open, (2) "Add to phone calendar" (.ics) so the phone itself reminds even offline, (3) Web Push later with login and a server.
- [x] **P. Profile page.** (done Nov 17 on branch auto-build) One easy place to customize everything: name, picture (their companion or a photo), school and program, grading rules, theme colors, light/dark, tone, reminders, companion styles, backup and restore.

## Built so far
- Journey map, templates, custom journey (max 30 stops), themes, walking pet
- Dean's List calculator with editable school rules
- Money with budget, expenses, wishlist, receipt photo with auto-read
- Installable app (offline), live on GitHub Pages
- Companions: up to 3 (person, animal or other), customizable, feed/play/cuddle, Treats instead of XP, shop for outfits and rooms, Home tab

## Phases to build
- [x] **A. Companions replace XP.** (done Nov 17, live on main) Up to 3, person/animal/other, customize, care (feed, play, cuddle), Treats, growth stages, unlock 2nd and 3rd as you grow. Remove XP/level wording everywhere.
- [x] **B. Humanized look.** (done Nov 17, live on main) Notebook paper + tape + sticky-note header + highlighter tabs + stamps, Gaegu/Nunito/Caveat fonts, tab settle animation, confetti, more motion. The new nav (Home, Journey, Study, Money, School) happens in phases E and F when Study and School exist. Still to polish later: companion room storybook scenes, more hand-drawn details.
- [x] **C. Welcome + short instructions.** (done Nov 17 on branch auto-build) First-open story welcome, a short tip on every screen (2 to 3 lines, dismissible, "?" to reopen).
- [x] **D. Starter side quests.** (done Nov 17 on branch auto-build) At least 5 ready-made, optional, editable and removable.
- [x] **E. School hub.** (done Nov 17, live on main) New School tab with Grades (Dean's List calculator), Planner (tasks with deadlines, class schedule, Today card on Home, phone-calendar .ics per task), Absences (per-subject counter with friend-voice warnings, shows the rule found in the handbook), Handbook (paste text or .txt, update, search, rules spotted), Projects (links that open in one tap, status, deadlines, notes). All free and on-device.
- [x] **F. Study tools.** (done Nov 17, live on main) New Study tab: Focus mode (full-screen timer, screen stays on, companion studies with you, distraction counter when you leave the app, beep and vibrate at the end, resumes after reload, +1 treat per 5 min, minus 1 per distraction) and Cards (decks with paste-a-list, Flip cards with spaced repetition, Multiple choice, Type it with typo forgiveness, 60-second Speed round with combos, review missed cards). Daily treat cap 30.
- [ ] **G. Helper chat ("Ask"), FREE.** Offline helper that answers from the handbook, school rules, the user's own data (GPA, budget, absences) and app tips. Optional "bring your own free key" (Gemini free tier) saved only on the user's device. No server, no keys in the repo.
- [ ] **L. Login + sync (prerequisite for friends).** Sign up and log in so Marjie's laptop and phone share the same data, and so friends can be invited. Needs a backend (Supabase or Firebase). Marjie must create the project (free) and give the project URL and the public key; the app must use row-level security so people only see their own data. Add a short privacy note. Local-only use must keep working without an account.
- [ ] **S. Friends and shared savings.** (1) Invite friends with a link; collaborate on shared things (shared goals, study groups, shared project boards). (2) A savings thingy: set a goal, save toward it alone or **with others**, everyone's progress in one place, nudges and cheers in the friend voice. The app only tracks pledges and progress. It never moves real money. Share only what each person chooses (goal progress, not their budget or expenses). Invite links expire and can be turned off. Needs phase L.
- [ ] **H. Plot twist + extras.** The secret twist. More customizing (accent colors, light/dark, fonts, card style, companion rooms). More animations.

## Future (note only, do not build yet)
- (Registration, login and sync moved up into phase L above because friends and shared savings need them.)
- **Sync with other apps**: Google Docs, Gmail, Google Calendar. Needs sign-in with Google (OAuth) and a server. Read-only first.
- Backup and restore button (also moves data between Safari and the installed app).
- Self-host the receipt reader files (about 10 MB) so it works offline.
- Sharing: let classmates join, collect feedback, PM portfolio story.

## Idea parking lot
- (add new feature ideas here)
