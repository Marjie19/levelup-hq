# SPOILERS (secret, Marjie: do not read if you want the surprise!)

Nothing else in the repo describes the twist. Code for it lives in `js/secret.js`.

## The twist
Your companion's "secret diary" slowly reveals that the companion was never a separate creature. It is made out of everything YOU did: grades, saved pesos, late-night study sessions. The treats were always yours. The last page is a letter signed by future-you on graduation day.

## How it unlocks
Five diary pages, unlocked by hidden growth points (`growth()`): 150, 500, 1000, 1800, 2800. Page 4 hints it, page 5 is the reveal (with confetti). Read state is saved in `S.diary.read` (a number).

## To change the text
Edit `DIARY` in `js/secret.js`. `{pet}` becomes the companion name and `{you}` your name.
