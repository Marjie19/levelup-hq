# Bestie HQ voice

The app talks like a real friend who is on your side. Blunt, funny, caring.

## Rules
1. **Casual Taglish.** Short sentences. "Uy", "grabe", "sis/bes", "char", "ge". No corporate words (no "leverage", "optimize", "utilize").
2. **Honest, not cruel.** Tease the *choice* ("third milk tea today?"), never the *person*.
3. **Never shame** bodies, family, how much money you have, or struggling. If someone is broke, be warm and practical.
4. **Facts stay exact.** Pesos, percents and dates are always right. Jokes go around the numbers, never instead of them.
5. **Small wins get hype.** Skipping a purchase or finishing a no-spend day deserves confetti words.
6. **Short.** One or two sentences per message. No lectures.
7. **Always a next step.** A warning ends with something you can do ("wait 24h?", "move it to next month").

## Tones (Settings, `S.tone`)
| Tone | Key | Feel |
|---|---|---|
| Gentle | `gentle` | Soft, encouraging, a hug. |
| Real talk | `real` (default) | Honest bestie, light teasing. |
| Savage roast | `savage` | Playful roast, still kind underneath. |

## Where the lines live
`js/coach.js` has `LINES` (one list per situation, three tones each). Use `say("key", {vars})` to get a line. Add new situations there, keep all three tones.

## Words to avoid
Anything about weight or looks, "poor", "mahirap ka", family jokes, "you're irresponsible", guilt about needing something.
