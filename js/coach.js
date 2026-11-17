/* Money coach: the friend voice, limits, no-spend streaks, impulse wait list, savings jar, insights */
"use strict";

const TONES = [["gentle","Gentle"],["real","Real talk"],["savage","Savage roast"]];
const WAIT_MS = 24*60*60*1000;

// One list of lines per situation, three tones each. See docs/VOICE.md for the rules.
const LINES = {
  good:{ gentle:["You're doing okay this month. Keep going, proud of you.","Nice and steady. Your wallet says thanks."],
    real:["Okay ha, ang ganda ng pacing mo. Keep it up.","Wallet's chill today. Don't ruin it, bes."],
    savage:["Wow, restraint? Who are you and where is the real you?","Look at you being responsible. Suspicious, but I love it."] },
  pace:{ gentle:["At this pace you may pass your budget ({proj}). A tiny slowdown now helps a lot.","Heads up: you may reach {proj} by month end. You can still adjust."],
    real:["Pace check: at this speed you'll hit {proj} by month end. Slow down a bit, bes.","Math says {proj} by month end. Budget says no. Choose a side."],
    savage:["At this rate you'll spend {proj}. The budget and you are not on speaking terms, huh.","{proj} by month end? Bold of you to call it a 'budget'."] },
  b80:{ gentle:["You've used {pct}% of your budget. Maybe pick the needs first for the rest of the month?","{pct}% used. Still okay, just be a little careful."],
    real:["{pct}% of your budget gone, and the month isn't over. Tipid mode na tayo.","Uy, {pct}% na. Needs first, wants wait."],
    savage:["{pct}% gone. The month still has days, you know. Rude of you to forget.","{pct}% spent. Your future self is sending angry texts."] },
  over:{ gentle:["You went over by {over}. It happens. Let's make next week lighter, okay?","Over budget by {over}. No guilt, just a plan: pause the wants for now."],
    real:["Over budget by {over}. Okay, it happened. Pause the wants for now.","{over} over. Hindi end of the world, pero stop muna sa wants."],
    savage:["{over} over budget. Congrats on speedrunning the month.","Over by {over}. The budget didn't quit, you just ignored it."] },
  catOver:{ gentle:["{cat} passed its limit ({limit}). Maybe borrow from a category you didn't use?","{cat} is over its limit. Be gentle with yourself, then ease up there."],
    real:["{cat} is over its {limit} limit. Pause that one for a bit.","{cat}: limit {limit}, you: no limit. Rein it in, bes."],
    savage:["{cat} limit was {limit}. You treated it like a suggestion.","Your {cat} spending is having a party and nobody invited the limit."] },
  catNear:{ gentle:["{cat} is almost at its limit ({limit}).","Careful, {cat} is close to its {limit} limit."],
    real:["{cat} is almost at the limit ({limit}). Last one na?","{cat} is close to {limit}. Choose wisely."],
    savage:["{cat} is a few pesos from its limit. Don't do it. ...You're gonna do it.","{cat} almost maxed. Impressive commitment to chaos."] },
  dayOver:{ gentle:["That's over today's cap of {cap}. Tomorrow is a fresh start.","Today's cap ({cap}) is passed. Try a lighter day next."],
    real:["Today's cap was {cap}. Past that na tayo. Tomorrow, reset.","Over today's {cap} cap. Wag na dagdagan, ha."],
    savage:["Daily cap {cap}, you: lol no.","You blew past today's {cap} cap like it wasn't there."] },
  wantBig:{ gentle:["Is this a need or a want? Wants can wait a day if you like.","A want is okay sometimes. Maybe sleep on it first?"],
    real:["Want or need? If want, wait 24 hours and see if you still care.","Be honest: want or need? Wants can sit on the wait list."],
    savage:["A 'want'? Shocking. Put it on the wait list and see if it still loves you tomorrow.","Want, not need. Let it marinate for 24 hours."] },
  waitAdd:{ gentle:["Added to your wait list. Check back in 24 hours.","Good idea to pause. See you tomorrow."],
    real:["On the wait list. If you still want it tomorrow, fine.","Parked for 24 hours. Matira matibay."],
    savage:["Parked. If you forget it by tomorrow, it wasn't love.","On the wait list. Let's see how deep this love goes."] },
  waitSkip:{ gentle:["You skipped it and kept {amt}. Be proud of that.","Skipped! {amt} stayed with you."],
    real:["Skipped! Kept {amt}. Ang galing mo.","Nice, {amt} saved. Drop it in the jar?"],
    savage:["You walked away from {amt}. Who raised you so well?","Character growth: {amt} not spent."] },
  waitKeep:{ gentle:["Still wanted after a full day. Sounds like a real want.","It lasted 24 hours. Added to your wishlist."],
    real:["Still want it after 24 hours? Okay, it's a real want. In the wishlist it goes.","Passed the wait test. Save up for it."],
    savage:["Still want it after a whole day. Fine, it earned a spot on the wishlist."] },
  noSpendStart:{ gentle:["{n}-day no-spend challenge started. One day at a time.","Starting {n} days. You can do this."],
    real:["{n} days no-spend. Starts now. Walang sablay, ha.","{n}-day challenge on. Needs only."],
    savage:["{n} days without spending. Let's see how long that lasts.","{n}-day no-spend. I give it a day. Prove me wrong."] },
  noSpendDone:{ gentle:["You finished the {n}-day challenge! Treat bonus for you.","{n} days done. I'm so proud of you."],
    real:["{n} days no-spend, DONE. Sobrang galing. Bonus treats!","Challenge complete: {n} days. Bonus treats, deserve."],
    savage:["{n} days with no spending. I owe you an apology. And treats.","You actually did it. {n} days. Take your treats."] },
  noSpendBroke:{ gentle:["The streak reset. That's okay, you can start again anytime.","Streak reset. No pressure, new day."],
    real:["Streak reset. Okay lang, start ulit.","Streak's back to zero. Ge, again."],
    savage:["Streak: gone. It lasted longer than my last diet, though.","And there goes the streak. Round two?"] },
  jarAdd:{ gentle:["{amt} in the jar. Little by little, it grows.","Nice, {amt} saved."],
    real:["{amt} in the jar. Future you says thanks.","+{amt} saved. Ayos."],
    savage:["{amt} in the jar. Look at you, planning a future.","Saving {amt}. Who are you?"] },
  jarOut:{ gentle:["Took {amt} out. Hope it was worth it.","{amt} out of the jar."],
    real:["{amt} out of the jar. Sure ka na ba?","Took {amt}. Make it count."],
    savage:["{amt} out of the jar already? The jar felt that.","Withdrawing {amt}. The jar is sad but supportive."] }
};

function hashStr(s){ let h = 0; for(let i = 0; i < s.length; i++) h = (h*31 + s.charCodeAt(i)) | 0; return Math.abs(h); }
// A line for a situation in the user's tone. seed makes it stable (same line all day) instead of random.
function say(key, vars, seed){
  const set = LINES[key] || {}, list = set[S.tone] || set.real || [""];
  const i = seed ? hashStr(seed + key) % list.length : Math.floor(Math.random() * list.length);
  return String(list[i]).replace(/\{(\w+)\}/g, (_, k) => vars && vars[k] != null ? vars[k] : "");
}

// ----- numbers -----
const dayNum = d => Math.round(Date.UTC(+d.slice(0,4), +d.slice(5,7)-1, +d.slice(8,10)) / 86400000);
function monthSpent(cat){ const m = today().slice(0,7); return S.expenses.filter(e => e.date.slice(0,7) === m && (!cat || e.cat === cat)).reduce((s,e) => s + e.amt, 0); }
function todaySpent(){ return S.expenses.filter(e => e.date === today()).reduce((s,e) => s + e.amt, 0); }
function limitOf(c){ const v = S.catLimits && S.catLimits[c]; return v > 0 ? v : 0; }
function lastSpendDate(){ let m = ""; S.expenses.forEach(e => { if(e.date > m) m = e.date; }); return m; }
// Days in a row with no spending (today counts while it's still clean)
function streakDays(){
  const base = [lastSpendDate(), S.streakFrom || today()].sort().pop();
  return Math.max(0, dayNum(today()) - dayNum(base));
}
function projectedMonth(){
  const d = new Date(), day = d.getDate(), dim = new Date(d.getFullYear(), d.getMonth()+1, 0).getDate();
  return day >= 5 ? monthSpent() / day * dim : 0;     // too early in the month to guess
}

// Pays the challenge bonus once when the streak reaches the goal
function checkChallenge(){
  const c = S.challenge; if(!c || c.paid) return;
  if(streakDays() >= c.days){ c.paid = true; giveTreats(c.days * 5); save(); setTimeout(() => { toast(say("noSpendDone", {n:c.days}) + " +" + c.days*5 + " 🍪"); confetti($("#streakCard"), 36); }, 300); }
}

// The line at the top of the coach card: the most important thing right now
function coachLine(){
  const spent = monthSpent(), seed = today();
  if(!S.expenses.length && !S.budget) return "";
  if(S.budget > 0 && spent > S.budget) return {t:say("over", {over:peso(spent - S.budget)}, seed), warn:true};
  const over = CATS.find(c => limitOf(c) && monthSpent(c) > limitOf(c));
  if(over) return {t:say("catOver", {cat:over, limit:peso(limitOf(over))}, seed), warn:true};
  if(S.dayCap > 0 && todaySpent() > S.dayCap) return {t:say("dayOver", {cap:peso(S.dayCap)}, seed), warn:true};
  if(S.budget > 0 && spent / S.budget >= .8) return {t:say("b80", {pct:Math.round(spent/S.budget*100)}, seed), warn:true};
  const proj = projectedMonth();
  if(S.budget > 0 && proj > S.budget) return {t:say("pace", {proj:peso(proj)}, seed), warn:true};
  return {t:say("good", null, seed), warn:false};
}

// After an expense is saved: a warning line if it crossed a line (or null)
function afterExpense(e, before){
  const spent = monthSpent();
  if(S.budget > 0 && before <= S.budget && spent > S.budget) return say("over", {over:peso(spent - S.budget)});
  const lim = limitOf(e.cat);
  if(lim){ const c = monthSpent(e.cat), b = c - e.amt; if(b <= lim && c > lim) return say("catOver", {cat:e.cat, limit:peso(lim)}); if(b < lim*.8 && c >= lim*.8) return say("catNear", {cat:e.cat, limit:peso(lim)}); }
  if(S.dayCap > 0){ const t = todaySpent(); if(e.date === today() && t - e.amt <= S.dayCap && t > S.dayCap) return say("dayOver", {cap:peso(S.dayCap)}); }
  if(S.budget > 0 && before < S.budget*.8 && spent >= S.budget*.8) return say("b80", {pct:Math.round(spent/S.budget*100)});
  if(e.kind === "want" && S.budget > 0 && e.amt >= S.budget*.1) return say("wantBig");
  return null;
}

function insights(){
  const m = today().slice(0,7), mine = S.expenses.filter(e => e.date.slice(0,7) === m), spent = mine.reduce((s,e) => s + e.amt, 0), out = [];
  if(!mine.length) return out;
  const byCat = CATS.map(c => [c, mine.filter(e => e.cat === c).reduce((s,e) => s + e.amt, 0)]).sort((a,b) => b[1]-a[1]);
  if(byCat[0][1] > 0) out.push(byCat[0][0] + " is " + Math.round(byCat[0][1]/spent*100) + "% of your spending");
  const tagged = mine.filter(e => e.kind), wants = tagged.filter(e => e.kind === "want").reduce((s,e) => s + e.amt, 0), all = tagged.reduce((s,e) => s + e.amt, 0);
  if(all > 0) out.push("Wants are " + Math.round(wants/all*100) + "% of what you tagged");
  const byDay = {}; mine.forEach(e => { byDay[e.date] = (byDay[e.date]||0) + e.amt; });
  const top = Object.entries(byDay).sort((a,b) => b[1]-a[1])[0];
  if(top) out.push("Biggest day: " + new Date(top[0]+"T00:00").toLocaleDateString("en-PH",{month:"short",day:"numeric"}) + ", " + peso(top[1]));
  const proj = projectedMonth(); if(proj > 0) out.push("At this pace: about " + peso(proj) + " by month end");
  if(S.skipped > 0) out.push("You skipped " + peso(S.skipped) + " of impulse buys");
  return out;
}

// ----- coach card (Spending tab) -----
function renderCoach(){
  const cl = coachLine(), st = streakDays(), c = S.challenge, ins = insights();
  let h = '<section class="card coach"><div class="cardhead"><h2>Your bestie says</h2><button type="button" class="chipbtn" id="editLimits">Limits</button></div>';
  if(cl) h += '<p class="note coachsay'+(cl.warn?" warn":"")+'">'+esc(cl.t)+'</p>';
  if(S.dayCap > 0){ const t = todaySpent(), p = Math.min(100, t/S.dayCap*100); h += '<div class="num leftline">Today: <b>'+peso(t)+'</b> of '+peso(S.dayCap)+' cap</div><div class="mbar'+(t>S.dayCap?" hot":"")+'"><i style="width:'+p+'%"></i></div>'; }
  h += '<div class="streak" id="streakCard"><span class="flame" aria-hidden="true">🔥</span><div class="grow"><b class="num">'+st+'</b> no-spend '+(st===1?"day":"days")+' in a row' +
    (c && !c.paid ? '<div class="hint">Challenge: '+Math.min(st,c.days)+' of '+c.days+' days</div><div class="mbar" style="margin:4px 0 0;height:8px"><i style="width:'+Math.min(100,st/c.days*100)+'%"></i></div>' : '') + '</div>' +
    (!c || c.paid ? '<button type="button" class="btn ghost sm" id="startChallenge">Challenge</button>' : '<button type="button" class="btn ghost sm" id="stopChallenge">Stop</button>') + '</div>';
  if(ins.length) h += '<ul class="insights">' + ins.map(i => '<li>'+esc(i)+'</li>').join("") + '</ul>';
  return h + '</section>';
}

// ----- wishes pane: jar + wait list -----
function renderJar(){
  const g = S.jarGoal > 0 ? S.jarGoal : 0, p = g ? Math.min(100, S.jar/g*100) : 0;
  return '<section class="card jar"><div class="cardhead"><h2>Savings jar</h2><button type="button" class="chipbtn" id="editJar">'+(g?'Goal '+peso(g):'Set goal')+'</button></div>' +
    '<div class="big num">'+peso(S.jar)+'</div>' + (g ? '<div class="mbar"><i style="width:'+p+'%"></i></div>' : '') +
    '<form id="jarForm" class="jarform"><input class="inp num" id="jarAmt" type="number" inputmode="decimal" min="0.01" step="0.01" placeholder="₱ amount" aria-label="Amount for the jar" required>' +
    '<button class="btn" type="submit" data-jar="in">Drop in</button><button type="submit" class="btn ghost" data-jar="out">Take out</button></form></section>';
}
function waitLeft(w){ return Math.max(0, w.ts + WAIT_MS - Date.now()); }
function renderWaits(){
  let h = '<section class="card"><div class="cardhead"><h2>Wait list</h2><button type="button" class="btn acc sm" id="addWait">+ Wait</button></div>' +
    '<p class="hint" style="margin:0 0 8px">Want something? Park it here for 24 hours. Still want it tomorrow?</p>';
  if(!S.waits.length) return h + '<div class="empty"><p>Nothing waiting. Next time you feel the urge, put it here first.</p></div></section>';
  h += '<div class="stack">';
  S.waits.forEach(w => { const left = waitLeft(w), hrs = Math.floor(left/3600000), mins = Math.ceil(left%3600000/60000);
    h += '<div class="wish"><div class="head"><b>'+esc(w.name)+'</b><span class="num">'+peso(w.price)+'</span></div>' +
      (left > 0 ? '<div class="hint">⏳ '+hrs+'h '+(mins===60?59:mins)+'m left to think about it</div><div class="acts" style="margin:0"><button type="button" class="btn ghost sm" data-wskip="'+w.id+'">Never mind</button></div>'
        : '<div class="hint"><b>24 hours passed.</b> Still want it?</div><div class="acts" style="margin:0"><button type="button" class="btn ghost sm" data-wskip="'+w.id+'">Nah, skip</button><button type="button" class="btn acc sm" data-wkeep="'+w.id+'">Still want it</button></div>') + '</div>'; });
  return h + '</div></section>';
}

// ----- sheets -----
function openLimits(){
  modal('<h3>Spending limits</h3><p class="muted" style="margin:0">Leave a box empty for no limit. Limits are per month. I\'ll warn you before you pass them.</p><form id="limForm" class="sheetform">' +
    CATS.map(c => '<div class="field"><label for="lim-'+c+'">'+c+' limit (₱)</label><input class="inp num" id="lim-'+c+'" data-lim="'+c+'" type="number" inputmode="decimal" min="0" step="1" value="'+(limitOf(c)||"")+'"></div>').join("") +
    '<div class="field"><label for="dayCap">Daily cap (₱)</label><input class="inp num" id="dayCap" type="number" inputmode="decimal" min="0" step="1" value="'+(S.dayCap||"")+'"><span class="muted" style="font-size:.78rem">The most you want to spend in one day.</span></div>' +
    '<div class="acts"><button type="button" class="btn ghost" id="cancel">Cancel</button><button class="btn acc" type="submit">Save</button></div></form>', m => {
      m.querySelector("#cancel").onclick = closeModal;
      m.querySelector("#limForm").onsubmit = e => { e.preventDefault();
        S.catLimits = {}; m.querySelectorAll("[data-lim]").forEach(i => { const v = parseFloat(i.value); if(v > 0) S.catLimits[i.dataset.lim] = v; });
        const d = parseFloat(m.querySelector("#dayCap").value); S.dayCap = d > 0 ? d : 0;
        save(); closeModal(); renderAll(); toast("Limits saved"); };
    });
}
function openWait(pre){
  modal('<h3>Wait 24 hours</h3><p class="muted" style="margin:0">Add what you want. Come back after a day and decide again.</p><form id="waitForm" class="sheetform">' +
    '<div class="field"><label for="wtName">What is it?</label><input class="inp" id="wtName" maxlength="60" placeholder="e.g. Milk tea (3rd today)" value="'+esc(pre&&pre.name||"")+'" required></div>' +
    '<div class="field"><label for="wtPrice">Price (₱)</label><input class="inp num" id="wtPrice" type="number" inputmode="decimal" min="1" step="0.01" value="'+(pre&&pre.price||"")+'" required></div>' +
    '<div class="acts"><button type="button" class="btn ghost" id="cancel">Cancel</button><button class="btn acc" type="submit">Park it</button></div></form>', m => {
      m.querySelector("#cancel").onclick = closeModal;
    });
}
function openJar(){
  modal('<h3>Jar goal</h3><form id="jarGoalForm" class="sheetform"><div class="field"><label for="jgIn">How much do you want to save (₱)?</label><input class="inp num" id="jgIn" type="number" inputmode="decimal" min="0" step="1" value="'+(S.jarGoal||"")+'"></div>' +
    '<div class="acts"><button type="button" class="btn ghost" id="cancel">Cancel</button><button class="btn acc" type="submit">Save</button></div></form>', m => {
      m.querySelector("#cancel").onclick = closeModal;
      m.querySelector("#jarGoalForm").onsubmit = e => { e.preventDefault(); const v = parseFloat(m.querySelector("#jgIn").value); S.jarGoal = v > 0 ? v : 0; save(); closeModal(); renderAll(); };
    });
}
function openChallenge(){
  modal('<h3>No-spend challenge</h3><p class="muted" style="margin:0">Pick how many days in a row with zero spending. Finish it for bonus treats. Logging any expense resets your streak.</p>' +
    '<div class="chips" role="group" aria-label="Days">' + [3,5,7,14].map(n => '<button type="button" class="chipbtn" data-chal="'+n+'">'+n+' days</button>').join("") + '</div>' +
    '<div class="acts"><button type="button" class="btn ghost" id="cancel">Cancel</button></div>', m => { m.querySelector("#cancel").onclick = closeModal; });
}

// ----- clicks and submits for the coach (called from events.js) -----
function coachClick(b){
  if(b.id === "editLimits"){ openLimits(); return true; }
  if(b.id === "addWait"){ openWait(); return true; }
  if(b.id === "editJar"){ openJar(); return true; }
  if(b.id === "startChallenge"){ openChallenge(); return true; }
  if(b.id === "stopChallenge"){ S.challenge = null; save(); renderAll(); return true; }
  if(b.dataset.chal){ const n = +b.dataset.chal; S.challenge = {days:n, paid:false}; S.streakFrom = today(); save(); closeModal(); renderAll(); toast(say("noSpendStart", {n:n})); return true; }
  if(b.dataset.wskip){ const w = S.waits.find(x => x.id === b.dataset.wskip); if(!w) return true;
    const done = waitLeft(w) === 0; S.waits = S.waits.filter(x => x !== w);
    if(done){ S.skipped = (S.skipped||0) + w.price; giveTreats(5); toast(say("waitSkip", {amt:peso(w.price)}) + " +5 🍪"); confetti(b, 20); } else toast("Removed from the wait list");
    save(); renderAll(); return true; }
  if(b.dataset.wkeep){ const w = S.waits.find(x => x.id === b.dataset.wkeep); if(!w) return true;
    S.waits = S.waits.filter(x => x !== w); S.wishes.push({id:uid8(), name:w.name, price:w.price, saved:0}); save(); renderAll(); toast(say("waitKeep")); return true; }
  if(b.dataset.kind){ pickedKind = pickedKind === b.dataset.kind ? "" : b.dataset.kind;
    document.querySelectorAll("[data-kind]").forEach(c => c.setAttribute("aria-pressed", c.dataset.kind === pickedKind));
    const hint = $("#wantHint"); if(hint){ hint.hidden = pickedKind !== "want"; if(!hint.hidden) hint.querySelector("span").textContent = say("wantBig"); }
    return true; }
  if(b.id === "wantWait"){ const n = $("#eNote").value.trim(), a = parseFloat($("#eAmt").value); closeModal(); openWait({name:n, price:a > 0 ? a : ""}); return true; }
  return false;
}
function coachSubmit(f, e){
  if(f.id === "waitForm"){ e.preventDefault(); const n = $("#wtName").value.trim(), p = parseFloat($("#wtPrice").value); if(!n || !(p > 0)) return true;
    S.waits.push({id:uid8(), name:n, price:p, ts:Date.now()}); save(); closeModal(); pane.money = "wish"; renderAll(); toast(say("waitAdd")); return true; }
  if(f.id === "jarForm"){ e.preventDefault(); const v = parseFloat($("#jarAmt").value); if(!(v > 0)) return true;
    const out = e.submitter && e.submitter.dataset.jar === "out";
    if(out && v > S.jar){ toast("The jar only has " + peso(S.jar)); return true; }
    S.jar = Math.round((S.jar + (out ? -v : v))*100)/100; save(); renderAll();
    toast(say(out ? "jarOut" : "jarAdd", {amt:peso(v)})); if(!out && S.jarGoal > 0 && S.jar >= S.jarGoal && S.jar - v < S.jarGoal) confetti($("#jarForm"), 36); return true; }
  return false;
}
