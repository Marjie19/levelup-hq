/* Ask: a friendly helper chat. It works offline by default: it reads your own data (grades, money, absences, tasks)
   and your handbook, and knows how the app works. Optional: paste your OWN free Gemini key in Profile for smarter
   answers. That key stays on this device (its own localStorage item, never in the backup file, never in the repo). */
"use strict";

const ASK_KEY = "bestie-ask-key";
const askKey = () => { try{ return localStorage.getItem(ASK_KEY) || ""; }catch(e){ return ""; } };
const askSetKey = v => { try{ if(v) localStorage.setItem(ASK_KEY, v); else localStorage.removeItem(ASK_KEY); }catch(e){} };
let askLog = [], askBusy = false, askOnline = false;

const ASK_CHIPS = ["How's my GPA?", "Can I still be absent?", "How much can I spend today?", "What's due soon?", "How do I earn treats?", "What does my handbook say about dean's list?"];

// How-to answers about the app itself. First match wins, so put the specific ones first.
const ASK_FAQ = [
  [/treat|cookie|🍪|earn/, "Treats 🍪 come from your grades, finished quests and tasks, projects, studying (Focus and Cards, up to 30 a day), skipping impulse buys, no-spend challenges and the daily gift on Home. Spend them on food, toys and outfits for your companion."],
  [/companion|pet|pom|feed|play|cuddle|adopt/, "Go to Home. Tap your companion to cuddle, use Feed and Play to fill the meters, and Style for outfits and rooms. They never die, they just get sleepy. You unlock a 2nd companion at 1000 growth and a 3rd at 3000."],
  [/focus|pomodoro|timer/, "Study tab, Focus. Pick minutes, start, and keep the app open. Your screen stays on and your companion studies with you. Leaving the app counts as a distraction. You get 1 treat per 5 minutes."],
  [/flash|card|quiz|deck|speed/, "Study tab, Cards. Make a deck by pasting a list (one card per line, front and back split by a dash or tab). Then play Flip cards, Multiple choice, Type it or the 60 second Speed round."],
  [/backup|restore|move.*(phone|laptop)|transfer/, "Profile, then Save backup. It downloads a .json file. On the other device open Profile and tap Restore backup. Receipt photos are not in the backup."],
  [/install|home screen|offline/, "On iPhone: open the link in Safari, tap Share, then Add to Home Screen. On a laptop: use the install icon in the address bar. After the first open it works offline."],
  [/remind|notif|calendar|ics/, "Profile, then Reminders. Add your own reminders and tap the 📅 button to get a calendar file, so your phone reminds you even when the app is closed. In-app reminders only work while the app is open."],
  [/dark|light|color|colour|theme|accent/, "Profile has Light, Auto and Dark, plus five accent colors."],
  [/tone|savage|gentle|real talk|voice/, "Profile (or the Grades card) has the tone picker: Gentle, Real talk or Savage roast. It changes how the money coach and absence counter talk to you."],
  [/handbook|add.*(rules|pdf)/, "School tab, Handbook, then + Add. Paste your handbook text (open the PDF, select all, copy, paste). It stays on your device. Then I can answer from it. Just ask."],
  [/quest/, "Journey tab, Side quests. There are starter ideas you can edit or delete, and + Quest adds your own."],
  [/journey|template|stop|milestone/, "Journey tab shows your road to graduation. Tap a stop to log a term GPA or tick a milestone. Customize switches templates or builds your own."],
  [/wait ?list|impulse|need or want/, "Money tab, Jar & wishes. Put something you kinda want on the wait list. After 24 hours choose Still want it or Skip. Skipping earns treats."],
  [/delete|erase|reset/, "Profile, bottom of the page: Reset everything. It asks you to tap twice. Save a backup first if you want to keep anything."],
  [/key|gemini|online|smarter/, "Profile has a card for a free Gemini key from Google AI Studio. Paste it there and an Ask online switch appears here. The key stays on your device."]
];

const ASK_STOP = new Set("the a an is are am my me i of to in on at do does did can what how when who why where for and or it its this that about with from have has be so then there any some tell say says".split(" "));
const askWords = q => (q.toLowerCase().match(/[a-z0-9']{3,}/g) || []).filter(w => !ASK_STOP.has(w));
const dueWhen = t => t.due ? new Date(t.due.length > 10 ? t.due : t.due + "T23:59") : null;

function askGpa(){
  const keys = termKeys(), done = keys.filter(hasGpa);
  if(!done.length){ const r = calcResult(); return r.shown !== null ? "Your calculator says " + fmtGrade(r.shown) + " this term, " + (r.pass ? "that makes the Dean's List! 🎉" : "not Dean's List yet. The cutoff is " + fmtGrade(S.cutoff) + ".") : "No grades saved yet. Open School, then Grades, add your courses and I will do the math."; }
  const avg = done.reduce((s,k) => s + S.gpas[k], 0) / done.length, last = done[done.length-1];
  return "You have " + done.length + " of " + keys.length + " terms saved. Average " + fmtGrade(Math.round(avg*100)/100) + ", last term (" + termLabel(last) + ") " + fmtGrade(S.gpas[last]) + ". Dean's List terms: " + keys.filter(isDean).length + ". Cutoff is " + fmtGrade(S.cutoff) + (isFive() ? " or lower" : "") + ".";
}
function askAbsences(){
  if(!S.courses.length) return "You have not added subjects yet. School, then Absences, then + Subject." + askRule(/absen|attendance/i);
  return S.courses.map(c => { const left = c.allowed - c.absent; return c.name + ": " + c.absent + " of " + c.allowed + " used, " + (left > 0 ? left + " left" : left === 0 ? "none left" : "over by " + (-left)); }).join(". ") + "." + askRule(/absen|attendance/i);
}
function askRule(re){ const r = findRules(re, 1)[0]; return r ? " From your handbook: \"" + r.line + "\"" : ""; }
function askMoney(){
  const m = monthSpent(), left = S.budget - m, day = new Date().getDate(), dim = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate(), daysLeft = dim - day + 1;
  let t = "This month you spent " + peso(m) + " of your " + peso(S.budget) + " budget. ";
  t += left >= 0 ? peso(left) + " left, that is about " + peso(left / daysLeft) + " a day for " + daysLeft + " days." : "You are over by " + peso(-left) + ". Pause the wants for now.";
  if(S.dayCap > 0) t += " Your daily cap is " + peso(S.dayCap) + " and you spent " + peso(todaySpent()) + " today.";
  const ins = insights()[0]; if(ins) t += " Also: " + ins + ".";
  return t;
}
function askTasks(){
  const open = S.tasks.filter(t => !t.done).map(t => ({t, d:dueWhen(t)})).sort((a,b) => (a.d || 9e15) - (b.d || 9e15));
  if(!open.length) return "No open tasks. Nice, or add some in School, then Planner.";
  return "Next up: " + open.slice(0,5).map(x => x.t.title + (x.d ? " (" + x.d.toLocaleDateString("en-PH",{month:"short",day:"numeric"}) + (x.d < new Date() ? ", late!" : "") + ")" : "")).join("; ") + ". You have " + open.length + " open in total.";
}
function askTreats(){ return "You have " + treats() + " treats 🍪. " + activePet().name + " is " + MOOD_TEXT[moodOf(activePet())] + "."; }

// Returns {text, from} using only what is on this device
function askOffline(q){
  const low = q.toLowerCase();
  const hasBook = S.docs.length > 0;
  if(/\b(gpa|grade|grades|dean|average|term)\b/.test(low) && !/handbook|rule|policy|say|require/.test(low)) return {text:askGpa(), from:"your grades"};
  if(/absen|absent|attendance|miss(ed)? class/.test(low) && !/handbook|rule|policy|say/.test(low)) return {text:askAbsences(), from:"your absences"};
  if(/spend|budget|money|allowance|afford|gastos|ipon|save/.test(low)) return {text:askMoney(), from:"your money"};
  if(/\b(due|deadline|task|tasks|todo|homework|assignment|schedule)\b/.test(low)) return {text:askTasks(), from:"your planner"};
  if(/how many|balance|my treats|do i have/.test(low) && /treat/.test(low)) return {text:askTreats(), from:"your companion"};
  // Handbook search by keywords, best line wins
  if(hasBook){
    const ws = askWords(q), hits = [];
    S.docs.forEach(d => d.text.split(/\r?\n/).forEach(l => { const line = l.trim(); if(line.length < 25 || line.length > 500) return; const ll = line.toLowerCase(); const n = ws.filter(w => ll.includes(w)).length; if(n >= Math.min(2, ws.length) && n > 0) hits.push({n, line, doc:d.title}); }));
    hits.sort((a,b) => b.n - a.n);
    if(hits.length) return {text:"Here is what I found in your handbook:\n• " + hits.slice(0,3).map(h => h.line).join("\n• "), from:"handbook: " + hits[0].doc, hits:hits.slice(0,4)};
  }
  const faq = ASK_FAQ.find(f => f[0].test(low));
  if(faq) return {text:faq[1], from:"app tips"};
  if(/^(hi|hello|hey|yo|uy)\b/.test(low)) return {text:"Hi bes! Ask me about your grades, absences, budget, tasks, your handbook, or how anything in the app works.", from:""};
  return {text:"I could not find that" + (hasBook ? " in your handbook or data." : ". Add your handbook (School, Handbook) so I can search it.") + " Try asking about your GPA, absences, budget or tasks, or tap one of the ideas below." + (askKey() ? " You can also switch on Ask online." : ""), from:"", miss:true};
}

async function askGemini(q, off){
  const key = askKey(); if(!key) throw new Error("no key");
  // Only the question and a few matching handbook lines leave the device. Nothing else from your data.
  const ctx = (off.hits || []).map(h => h.line).join("\n").slice(0, 3000) || (S.docs.length ? S.docs[0].text.slice(0, 3000) : "");
  const body = {contents:[{role:"user", parts:[{text:"You are Bestie, a warm, short-spoken helper for a Filipino college student. Answer in 3 sentences or fewer, casual English with a little Taglish. If handbook text is given, rely on it and say if it does not cover the question.\n\nHandbook excerpts:\n" + (ctx || "(none)") + "\n\nQuestion: " + q}]}], generationConfig:{maxOutputTokens:300, temperature:.6}};
  const ctl = new AbortController(), to = setTimeout(() => ctl.abort(), 20000);
  try{
    const r = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent", {method:"POST", headers:{"Content-Type":"application/json", "x-goog-api-key":key}, body:JSON.stringify(body), signal:ctl.signal});
    if(r.status === 400 || r.status === 403) throw new Error("That key was not accepted. Check it in Profile.");
    if(r.status === 429) throw new Error("The free limit is used up for now. Try again in a minute, or switch off Ask online.");
    if(!r.ok) throw new Error("Online helper had a problem (" + r.status + ").");
    const j = await r.json(), t = j.candidates && j.candidates[0] && j.candidates[0].content && j.candidates[0].content.parts && j.candidates[0].content.parts.map(p => p.text || "").join("").trim();
    if(!t) throw new Error("Online helper sent nothing back.");
    return t.slice(0, 1500);
  }catch(e){ if(e.name === "AbortError") throw new Error("Online helper took too long."); if(e instanceof TypeError) throw new Error("No internet right now."); throw e; }
  finally{ clearTimeout(to); }
}

function askBubbles(){
  if(!askLog.length) return '<div class="askrow bot"><div class="askpet">'+pomFor("pom")+'</div><div class="bub">Hi'+(S.name ? ", "+esc(S.name) : "")+'! Ask me about your grades, absences, budget or tasks. I can also search your handbook and explain the app. I work offline.</div></div>';
  return askLog.map(m => m.me ? '<div class="askrow me"><div class="bub">'+esc(m.text)+'</div></div>' :
    '<div class="askrow bot"><div class="askpet">'+pomFor("pom")+'</div><div class="bub">'+esc(m.text).replace(/\n/g, "<br>")+(m.from ? '<small>'+esc(m.from)+'</small>' : '')+'</div></div>').join("") +
    (askBusy ? '<div class="askrow bot"><div class="askpet">'+pomFor("pom")+'</div><div class="bub typing" aria-label="Thinking"><i></i><i></i><i></i></div></div>' : '');
}
function renderAsk(){
  const hasKey = !!askKey();
  $("#view").innerHTML = '<div class="stack"><section class="card askcard"><div class="cardhead"><h2>Ask Bestie</h2>' +
    (hasKey ? '<label class="askswitch"><input type="checkbox" id="askOnline"'+(askOnline?" checked":"")+'> Ask online</label>' : '') + '</div>' +
    (askOnline && hasKey ? '<p class="hint" style="margin:0 0 8px">Online is on: your question and a few matching handbook lines go to Google. Nothing else.</p>' : '') +
    '<div class="asklog" id="askLog" role="log" aria-live="polite">' + askBubbles() + '</div>' +
    '<div class="chips askchips">' + ASK_CHIPS.map(c => '<button type="button" class="chipbtn" data-askq="'+esc(c)+'">'+esc(c)+'</button>').join("") + '</div>' +
    '<form id="askForm" class="askform" autocomplete="off"><input class="inp" id="askIn" maxlength="300" placeholder="Ask me anything…" aria-label="Your question" enterkeyhint="send"><button class="btn acc" type="submit"'+(askBusy?" disabled":"")+'>Send</button></form>' +
    (askLog.length ? '<button type="button" class="btn ghost sm" id="askClear" style="align-self:flex-start">Clear chat</button>' : '') +
    '</section></div>';
  const l = $("#askLog"); if(l) l.scrollTop = l.scrollHeight;
}

async function askSend(q){
  q = q.trim().slice(0, 300); if(!q || askBusy) return;
  askLog.push({me:true, text:q}); if(askLog.length > 40) askLog = askLog.slice(-40);
  const off = askOffline(q), useNet = askOnline && askKey() && (off.miss || !off.from || /handbook/.test(off.from));
  if(!useNet){ askLog.push({text:off.text, from:off.from}); return renderAsk(); }
  askBusy = true; renderAsk();
  try{ const t = await askGemini(q, off); askLog.push({text:t, from:"online helper (Gemini)"}); }
  catch(e){ askLog.push({text:(e.message || "Online helper failed.") + " Here is what I have offline:\n" + off.text, from:off.from}); }
  askBusy = false; if(currentTab() === "ask") renderAsk();
}

document.addEventListener("click", e => {
  const b = e.target.closest("button"); if(!b) return;
  if(b.id === "askBtn"){ location.hash = currentTab() === "ask" ? "home" : "ask"; return; }
  if(currentTab() !== "ask") return;
  if(b.dataset.askq) return askSend(b.dataset.askq);
  if(b.id === "askClear"){ askLog = []; renderAsk(); }
});
document.addEventListener("submit", e => {
  if(e.target.id !== "askForm") return;
  e.preventDefault(); const i = $("#askIn"), v = i.value; i.value = ""; askSend(v);
});
document.addEventListener("change", e => {
  if(e.target.id === "askOnline"){ askOnline = e.target.checked; renderAsk(); }
});

// ----- Profile card for the optional key -----
function askKeyCard(){
  const has = !!askKey();
  return '<section class="card"><div class="cardhead"><h2>Ask helper: smarter answers</h2></div><div class="sheetform">' +
    '<p class="hint" style="margin:0">Ask works offline already. If you want smarter answers, you can paste your own <b>free</b> Google AI Studio key (aistudio.google.com, then Get API key). It stays on this device only and is not in your backup. The catch: on the free tier Google may use what you send to improve its products, so only your question and a few handbook lines are sent, and only when you switch on Ask online. The free tier also has daily limits.</p>' +
    '<div class="field"><label for="askKeyIn">Your free Gemini key</label><input class="inp" id="askKeyIn" type="password" autocomplete="off" spellcheck="false" maxlength="120" placeholder="'+(has ? "Saved on this device" : "Paste key here")+'"></div>' +
    '<div class="acts" style="justify-content:flex-start"><button type="button" class="btn acc sm" id="askKeySave">Save key</button>'+(has ? '<button type="button" class="btn ghost sm" id="askKeyDel">Remove key</button>' : '')+'</div></div></section>';
}
document.addEventListener("click", e => {
  const b = e.target.closest("button"); if(!b || currentTab() !== "profile") return;
  if(b.id === "askKeySave"){ const v = $("#askKeyIn").value.trim(); if(!/^[\w\-]{20,120}$/.test(v)) return toast("That does not look like a key"); askSetKey(v); renderProfile(); toast("Key saved on this device"); }
  else if(b.id === "askKeyDel"){ askSetKey(""); askOnline = false; renderProfile(); toast("Key removed"); }
});
