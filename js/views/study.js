/* Study tab: Focus mode (lock in with your companion) and Cards (flashcards + quiz games).
   Free, on-device, works offline. Studying earns Treats, with a daily limit so it stays fair. */
"use strict";

const FOCUS_PRESETS = [15, 25, 50];
const STUDY_DAILY_CAP = 30;
const LEITNER = [0, 1, 2, 4, 8, 16];   // days until a card comes back, by box
const RING = 2 * Math.PI * 90;
let fTick = 0, wake = null, hiddenAt = 0, customMin = 30;

const FOCUS_SAYS = {
  start:{gentle:["Okay, we've got this. One step at a time.","Deep breath. Let's begin."], real:["Phone down, bes. Let's lock in.","Okay, go. I'm studying with you."], savage:["Phone face down. Yes, you. Now.","Lock in. The group chat will survive."]},
  left:{gentle:["Welcome back. Let's pick it up again.","It's okay, just come back."], real:["You left for {s}s. Balik na tayo.","Left for {s}s. Uy, focus."], savage:["{s} seconds away. The phone won again, huh?","Back after {s}s. Was it worth it?"]},
  done:{gentle:["You did it. Proud of you.","Nice work. Rest a little."], real:["Ayos! Session done. Take a break.","Locked in the whole time. Respect."], savage:["Done. Who even are you right now.","Focused the whole time? Suspicious. Proud."]},
  quit:{gentle:["That's okay. We can try a shorter one.","Rest, then try again."], real:["Okay, break muna. Try a shorter one next.","No stress. Try 15 min next time."], savage:["Giving up already? Try 15. I believe in you, barely.","Okay quitter. Kidding. Try again later."]}
};
const fsay = (k, v) => { const l = (FOCUS_SAYS[k][S.tone] || FOCUS_SAYS[k].real); return l[Math.floor(Math.random() * l.length)].replace("{s}", v || 0); };

// ---------- the numbers ----------
function dayStat(d){ return S.study.days[d] || (S.study.days[d] = {min:0, cards:0}); }
function studyStreak(){
  let n = 0, d = new Date(); const key = x => x.getFullYear() + "-" + String(x.getMonth()+1).padStart(2,"0") + "-" + String(x.getDate()).padStart(2,"0");
  if(!S.study.days[key(d)] || (S.study.days[key(d)].min + S.study.days[key(d)].cards) <= 0) d.setDate(d.getDate() - 1);   // today does not break a streak until it is over
  for(;;){ const s = S.study.days[key(d)]; if(!s || (s.min + s.cards) <= 0) break; n++; d.setDate(d.getDate() - 1); }
  return n;
}
function studyEarn(n){
  const d = today(), got = S.study.earned[d] || 0, add = Math.max(0, Math.min(n, STUDY_DAILY_CAP - got));
  S.study.earned[d] = got + add; S.studyTreats = (S.studyTreats || 0) + add; save(); return add;
}
const shuffle = a => { a = a.slice(); for(let i = a.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; } return a; };

// ---------- focus mode ----------
async function keepAwake(on){
  try{ if(on && "wakeLock" in navigator){ if(!wake) wake = await navigator.wakeLock.request("screen"); } else if(wake){ await wake.release(); wake = null; } }catch(e){ wake = null; }
}
function beep(){
  try{ const A = window.AudioContext || window.webkitAudioContext; if(!A) return; const c = new A();
    [0, .25, .5].forEach(t => { const o = c.createOscillator(), g = c.createGain(); o.frequency.value = 660; o.connect(g); g.connect(c.destination); g.gain.setValueAtTime(.0001, c.currentTime + t); g.gain.exponentialRampToValueAtTime(.25, c.currentTime + t + .03); g.gain.exponentialRampToValueAtTime(.0001, c.currentTime + t + .2); o.start(c.currentTime + t); o.stop(c.currentTime + t + .22); });
    setTimeout(() => c.close(), 1200); }catch(e){}
  if(navigator.vibrate) navigator.vibrate([200, 100, 200]);
}
function startFocus(min){
  min = Math.max(5, Math.min(180, Math.round(min) || 25));
  S.focus = {start:Date.now(), end:Date.now() + min * 60000, min:min, left:0}; save(); showFocus(); toast(fsay("start"));
}
function showFocus(){
  const f = S.focus; if(!f || $("#focusRoom")) return;
  const p = activePet(), el = document.createElement("div");
  el.id = "focusRoom"; el.className = "focusroom"; el.setAttribute("role", "dialog"); el.setAttribute("aria-label", "Focus mode");
  el.innerHTML = '<div class="fhead">Locked in 🔒</div><div class="fmid"><svg class="fring" viewBox="0 0 200 200" aria-hidden="true"><circle class="rtrack" cx="100" cy="100" r="90"/><circle class="rfill" id="fFill" cx="100" cy="100" r="90" stroke-dasharray="'+RING.toFixed(1)+'" stroke-dashoffset="0"/></svg>' +
    '<div class="ftime"><b class="num" id="fTime">--:--</b><span id="fSub"></span></div></div>' +
    '<div class="fpet">'+petSvg(p, {cls:"big", full:true, mood:"happy"})+'<span class="fbook" aria-hidden="true">📖</span></div>' +
    '<p class="hand fsay" id="fSay">'+esc(fsay("start"))+'</p>' +
    '<div class="acts" style="justify-content:center"><button type="button" class="btn ghost" id="fMore">+5 min</button><button type="button" class="btn ghost" id="fQuit">Give up</button></div>';
  document.body.appendChild(el); document.body.classList.add("infocus"); keepAwake(true);
  el.querySelector("#fMore").onclick = () => { S.focus.end += 5 * 60000; S.focus.min += 5; save(); tickFocus(); };
  el.querySelector("#fQuit").onclick = e => { if(e.target.dataset.armed) return endFocus(false); e.target.dataset.armed = "1"; e.target.textContent = "Tap again to quit"; };
  clearInterval(fTick); fTick = setInterval(tickFocus, 500); tickFocus();
}
function tickFocus(){
  const f = S.focus; if(!f){ clearInterval(fTick); return; }
  const rem = Math.max(0, f.end - Date.now()), total = f.min * 60000, m = Math.floor(rem / 60000), s = Math.floor(rem % 60000 / 1000);
  const t = $("#fTime"); if(t) t.textContent = String(m).padStart(2,"0") + ":" + String(s).padStart(2,"0");
  const fill = $("#fFill"); if(fill) fill.style.strokeDashoffset = (RING * (1 - rem / total)).toFixed(1);
  const sub = $("#fSub"); if(sub) sub.textContent = f.left ? f.left + (f.left === 1 ? " distraction" : " distractions") : "no distractions yet";
  if(rem <= 0) endFocus(true);
}
function endFocus(done){
  const f = S.focus; clearInterval(fTick); const room = $("#focusRoom"); if(room) room.remove(); document.body.classList.remove("infocus"); keepAwake(false);
  S.focus = null; if(!f){ save(); return; }
  if(done){
    const min = f.min, earn = studyEarn(Math.max(0, Math.floor(min / 5) - f.left));
    dayStat(today()).min += min; const p = activePet(); const st = petStats(p); setStats(p, st.hunger, st.joy + 6); p.care = (p.care || 0) + 1;
    save(); beep(); if(typeof fireReminder === "function") try{ fireReminder("Focus session done! " + min + " min"); }catch(e){}
    renderAll(); confetti(null, 50);
    modal('<div class="welcome"><div class="wart" aria-hidden="true">🎉</div><h3>'+min+' minutes locked in!</h3><p class="hand">'+esc(fsay("done"))+'</p>' +
      '<p class="num" style="margin:0"><b>'+(earn ? "+" + earn + " 🍪" : "Daily treat limit reached, still great work")+'</b>'+(f.left ? ' · '+f.left+' distraction'+(f.left===1?"":"s") : ' · zero distractions')+'</p>' +
      '<div class="acts" style="justify-content:center"><button type="button" class="btn acc" id="cancel">Nice</button></div></div>', m => { m.querySelector("#cancel").onclick = closeModal; });
  } else { save(); renderAll(); toast(fsay("quit")); }
}
document.addEventListener("visibilitychange", () => {
  if(!S.focus) return;
  if(document.visibilityState === "hidden"){ hiddenAt = Date.now(); }
  else { keepAwake(true); if(hiddenAt){ const secs = Math.round((Date.now() - hiddenAt) / 1000); hiddenAt = 0; if(secs >= 3 && S.focus){ S.focus.left++; save(); const say = $("#fSay"); const msg = fsay("left", secs); if(say) say.textContent = msg; toast(msg); tickFocus(); } } }
});
window.addEventListener("load", () => { if(S.focus){ if(S.focus.end <= Date.now()) endFocus(true); else showFocus(); } });

// ---------- decks ----------
function dueCount(d){ const n = Date.now(); return d.cards.filter(c => c.due <= n).length; }
function norm(s){ return String(s).toLowerCase().replace(/[.,!?;:'"]/g, "").replace(/\s+/g, " ").trim(); }
function lev(a, b){ const m = a.length, n = b.length, d = []; for(let i = 0; i <= m; i++){ d[i] = [i]; } for(let j = 1; j <= n; j++) d[0][j] = j;
  for(let i = 1; i <= m; i++) for(let j = 1; j <= n; j++) d[i][j] = Math.min(d[i-1][j] + 1, d[i][j-1] + 1, d[i-1][j-1] + (a[i-1] === b[j-1] ? 0 : 1)); return d[m][n]; }
function sameAnswer(typed, answer){ const a = norm(typed), b = norm(answer); if(!a) return false; if(a === b) return true; const allow = b.length >= 9 ? 2 : b.length >= 5 ? 1 : 0; return lev(a, b) <= allow; }
function grade(card, right){
  const box = right ? Math.min(5, (card.box || 1) + 1) : 1;
  card.box = box; card.due = Date.now() + LEITNER[box] * 86400000 - (right ? 0 : Date.now() - Date.now());
}
function studyHtml(){
  const k = pane.study, day = dayStat(today());
  let html = '<nav class="snav" aria-label="Study sections">' + [["focus","Focus"],["cards","Cards"]].map(p => '<button type="button" data-pane="study:'+p[0]+'" aria-selected="'+(k===p[0])+'">'+p[1]+'</button>').join("") + '</nav>';
  html += '<section class="card"><div class="stats" style="margin:0"><div class="stat s-plum"><b class="num">'+day.min+'<small> min</small></b><span>Focused today</span></div><div class="stat s-apri"><b class="num">'+day.cards+'</b><span>Cards today</span></div><div class="stat s-good"><b class="num">'+studyStreak()+'</b><span>Day streak 🔥</span></div></div></section>';
  if(k === "focus"){
    html += '<section class="card"><div class="cardhead"><h2>Lock in</h2></div><p class="hint" style="margin:0 0 10px">Put your phone down. Your companion studies with you, and the screen stays on. Earn treats for every 5 minutes.</p>' +
      '<div class="chips" role="group" aria-label="Session length">' + FOCUS_PRESETS.map(m => '<button type="button" class="chipbtn" data-fstart="'+m+'">'+m+' min</button>').join("") + '</div>' +
      '<div class="field" style="margin-top:12px"><label for="fCustom">Or pick your own (5 to 180)</label><div class="namerow"><input class="inp num" id="fCustom" type="number" inputmode="numeric" min="5" max="180" value="'+customMin+'"><button type="button" class="btn acc" id="fGo">Start</button></div></div></section>';
  } else {
    html += '<section class="card"><div class="cardhead"><h2>Your decks</h2><button type="button" class="btn acc sm" id="addDeck">+ Deck</button></div>';
    if(!S.decks.length) html += '<div class="empty">'+pomFor("pom")+'<p>Make a deck for your next quiz. Add terms and answers, then study with flip cards, multiple choice, typing or a speed round.</p></div>';
    else html += '<ul class="list">' + S.decks.map(d => '<li class="deck"><div class="dtop"><b>'+esc(d.title)+'</b><span class="hint num">'+d.cards.length+' cards'+(dueCount(d) ? ', '+dueCount(d)+' due' : '')+'</span></div>' +
      '<div class="acts" style="justify-content:flex-start"><button type="button" class="btn acc sm" data-dstudy="'+esc(d.id)+'"'+(d.cards.length?'':' disabled')+'>Study</button><button type="button" class="btn ghost sm" data-dedit="'+esc(d.id)+'">Edit</button><button type="button" class="btn ghost sm" data-ddel="'+esc(d.id)+'">Delete</button></div></li>').join("") + '</ul>';
    html += '</section>';
  }
  return html;
}
function renderStudy(){ $("#view").innerHTML = studyHtml(); }

function openDeck(id){
  const d = id ? S.decks.find(x => x.id === id) : null, cards = d ? d.cards.map(c => ({id:c.id, front:c.front, back:c.back, box:c.box, due:c.due})) : [{id:uid8(), front:"", back:"", box:1, due:0}];
  const rows = () => cards.map((c,i) => '<div class="crd" data-i="'+i+'"><input class="inp" data-f="front" maxlength="120" placeholder="Term or question" value="'+esc(c.front)+'" aria-label="Card '+(i+1)+' front"><input class="inp" data-f="back" maxlength="160" placeholder="Answer" value="'+esc(c.back)+'" aria-label="Card '+(i+1)+' answer"><button type="button" class="x" data-del="'+i+'" aria-label="Remove card">×</button></div>').join("");
  modal('<h3>'+(d ? "Edit deck" : "New deck")+'</h3><form id="deckForm" class="sheetform"><div class="field"><label for="dkTitle">Deck name</label><input class="inp" id="dkTitle" maxlength="50" value="'+esc(d ? d.title : "")+'" placeholder="e.g. Marketing Midterm" required></div>' +
    '<div class="field"><label>Cards (<span id="dkCount"></span>)</label><div id="dkCards"></div><div class="eadd" style="margin-top:6px"><button type="button" class="btn ghost sm" id="dkAdd">+ Card</button><button type="button" class="btn ghost sm" id="dkBulk">Paste a list</button></div></div>' +
    '<p class="hint" id="dkMsg" style="margin:0"></p><div class="acts"><button type="button" class="btn ghost" id="cancel">Cancel</button><button class="btn acc" type="submit">Save deck</button></div></form>', m => {
      const box = m.querySelector("#dkCards"), draw = () => { box.innerHTML = rows(); m.querySelector("#dkCount").textContent = cards.length + " of 200"; };
      m.querySelector("#cancel").onclick = closeModal;
      m.querySelector("#dkAdd").onclick = () => { if(cards.length < 200){ cards.push({id:uid8(), front:"", back:"", box:1, due:0}); draw(); const l = box.querySelectorAll('[data-f="front"]'); l[l.length-1].focus(); } };
      m.querySelector("#dkBulk").onclick = () => {
        box.insertAdjacentHTML("beforebegin", '<div class="field" id="bulkBox"><label for="bulkText">One card per line: term - answer (or term, answer, or a tab)</label><textarea class="inp" id="bulkText" rows="5" placeholder="Mitosis - cell division&#10;Supply - how much is offered"></textarea><button type="button" class="btn acc sm" id="bulkGo" style="width:fit-content;margin-top:6px">Add these</button></div>');
        m.querySelector("#bulkGo").onclick = () => {
          m.querySelector("#bulkText").value.split(/\r?\n/).forEach(line => { const x = line.split(/\t| - | – |,|:/); if(x.length >= 2 && x[0].trim() && cards.length < 200) cards.push({id:uid8(), front:x[0].trim().slice(0,120), back:x.slice(1).join(" ").trim().slice(0,160), box:1, due:0}); });
          const b = m.querySelector("#bulkBox"); if(b) b.remove(); const first = cards[0]; if(cards.length > 1 && !first.front && !first.back) cards.shift(); draw();
        };
      };
      box.addEventListener("input", e => { const row = e.target.closest("[data-i]"); if(row && e.target.dataset.f) cards[+row.dataset.i][e.target.dataset.f] = e.target.value; });
      box.addEventListener("click", e => { const b = e.target.closest("[data-del]"); if(b){ cards.splice(+b.dataset.del, 1); draw(); } });
      m.querySelector("#deckForm").onsubmit = e => { e.preventDefault();
        const clean = cards.filter(c => c.front.trim() && c.back.trim()).map(c => ({id:c.id, front:c.front.trim(), back:c.back.trim(), box:c.box || 1, due:c.due || 0}));
        if(!clean.length) return m.querySelector("#dkMsg").textContent = "Add at least one card with a term and an answer.";
        if(!d && S.decks.length >= 20) return m.querySelector("#dkMsg").textContent = "You have 20 decks. Delete one first.";
        const title = m.querySelector("#dkTitle").value.trim();
        if(d){ d.title = title; d.cards = clean; } else S.decks.push({id:uid8(), title:title, cards:clean});
        save(); closeModal(); renderAll(); toast("Deck saved");
      };
      draw();
    }, "wide noclose");
}

// ---------- study sessions ----------
function openModes(id){
  const d = S.decks.find(x => x.id === id); if(!d) return;
  const modes = [["flip","🃏","Flip cards","See the term, flip, mark if you knew it. Cards come back on a schedule."],["mc","🔘","Multiple choice","Pick the right answer. Needs at least 2 cards."],["type","⌨️","Type it","Type the answer from memory. Small typos are okay."],["speed","⚡","Speed round","60 seconds, build a combo."]];
  modal('<h3>'+esc(d.title)+'</h3><p class="muted" style="margin:0">'+d.cards.length+' cards. Pick how to study.</p><div class="tplgrid">' + modes.map(x => '<button type="button" class="tpl" data-mode="'+x[0]+'"><span class="emo" aria-hidden="true">'+x[1]+'</span><span class="tplt"><b>'+x[2]+'</b><span>'+x[3]+'</span></span></button>').join("") + '</div><div class="acts"><button type="button" class="btn ghost" id="cancel">Close</button></div>', m => {
    m.querySelector("#cancel").onclick = closeModal;
    m.querySelector(".tplgrid").addEventListener("click", e => { const b = e.target.closest("[data-mode]"); if(!b) return; if(b.dataset.mode !== "flip" && b.dataset.mode !== "type" && d.cards.length < 2) return toast("Add at least 2 cards for this mode"); runSession(d, b.dataset.mode); });
  });
}
function runSession(d, mode, only){
  let pool = only ? d.cards.filter(c => only.indexOf(c.id) >= 0) : d.cards.slice();
  let queue;
  if(mode === "flip"){ const due = shuffle(pool.filter(c => c.due <= Date.now())); queue = (due.length ? due : shuffle(pool)).slice(0, 20); }
  else if(mode === "speed") queue = shuffle(pool).concat(shuffle(pool));
  else queue = shuffle(pool).slice(0, 15);
  const st = {i:0, right:0, wrong:0, missed:[], combo:0, best:0, over:false, t0:Date.now(), left:60};
  let timer = 0;
  modal('<div id="sess"></div>', m => {
    const box = m.querySelector("#sess");
    const finish = () => {
      clearInterval(timer); st.over = true;
      const total = st.right + st.wrong, acc = total ? Math.round(st.right / total * 100) : 0;
      const earn = studyEarn(Math.min(8, Math.floor(st.right / 4) + (mode === "speed" ? Math.floor(st.best / 3) : 0)));
      dayStat(today()).cards += total; const p = activePet(), s0 = petStats(p); setStats(p, s0.hunger, s0.joy + 3); save(); renderHeader();
      if(total && st.wrong === 0 && total >= 5) confetti(box, 40);
      const missed = st.missed.filter((x,i,a) => a.indexOf(x) === i);
      box.innerHTML = '<div class="welcome"><div class="wart" aria-hidden="true">'+(acc >= 80 ? "🌟" : acc >= 50 ? "💪" : "📚")+'</div><h3>'+st.right+' of '+total+' right</h3><p class="hand">'+esc(acc >= 80 ? "Grabe, ang galing!" : acc >= 50 ? "Getting there. One more round?" : "Okay lang. That's how it sticks.")+'</p>' +
        '<p class="num" style="margin:0"><b>'+(earn ? "+" + earn + " 🍪" : "Daily treat limit reached")+'</b>'+(mode === "speed" ? ' · best combo x'+st.best : '')+'</p>' +
        (missed.length ? '<div class="missed"><b>Review these</b><ul>'+missed.slice(0,6).map(id => { const c = d.cards.find(x => x.id === id); return c ? '<li>'+esc(c.front)+' → '+esc(c.back)+'</li>' : ""; }).join("")+'</ul></div>' : '') +
        '<div class="acts" style="justify-content:center">'+(missed.length ? '<button type="button" class="btn acc" id="sRetry">Practice missed</button>' : '')+'<button type="button" class="btn ghost" id="cancel">Done</button></div></div>';
      box.querySelector("#cancel").onclick = () => { closeModal(); renderAll(); };
      const r = box.querySelector("#sRetry"); if(r) r.onclick = () => runSession(d, mode === "speed" ? "mc" : mode, missed);
    };
    const bar = () => '<div class="mbar" style="margin:0 0 10px"><i style="width:'+(mode === "speed" ? st.left / 60 * 100 : Math.min(100, st.i / queue.length * 100))+'%"></i></div>';
    const head = () => '<div class="shead"><span class="num">'+(mode === "speed" ? "⏱️ " + st.left + "s" : (st.i + 1) + " / " + queue.length)+'</span>'+(st.combo >= 2 ? '<span class="combo" key="'+st.combo+'">🔥 x'+st.combo+'</span>' : '<span></span>')+'<button type="button" class="x" id="sQuit" aria-label="Stop">×</button></div>';
    const next = () => { st.i++; if(st.i >= queue.length || (mode === "speed" && st.left <= 0)) finish(); else draw(); };
    const mark = (card, right) => { if(right){ st.right++; st.combo++; st.best = Math.max(st.best, st.combo); } else { st.wrong++; st.combo = 0; st.missed.push(card.id); } grade(card, right); save(); };
    const draw = () => {
      const c = queue[st.i]; if(!c) return finish();
      if(mode === "flip"){
        box.innerHTML = head() + bar() + '<button type="button" class="fcard" id="fc" aria-label="Flip the card"><span class="inner"><span class="face front">'+esc(c.front)+'</span><span class="face back">'+esc(c.back)+'</span></span></button><p class="hint" style="text-align:center">Tap the card to flip</p>' +
          '<div class="acts" style="justify-content:center" id="fAct" hidden><button type="button" class="btn ghost" id="fNo">Still learning</button><button type="button" class="btn acc" id="fYes">Got it</button></div>';
        const fc = box.querySelector("#fc"); fc.onclick = () => { fc.classList.toggle("flipped"); box.querySelector("#fAct").hidden = false; };
        box.querySelector("#fNo").onclick = () => { mark(c, false); next(); }; box.querySelector("#fYes").onclick = () => { mark(c, true); next(); };
      } else if(mode === "type"){
        box.innerHTML = head() + bar() + '<div class="qcard">'+esc(c.front)+'</div><form id="tForm" class="sheetform"><input class="inp" id="tIn" autocomplete="off" autocapitalize="off" placeholder="Type the answer" aria-label="Your answer"><div class="acts" style="justify-content:center"><button class="btn acc" type="submit">Check</button></div></form><div id="tRes"></div>';
        const inp = box.querySelector("#tIn"); inp.focus();
        box.querySelector("#tForm").onsubmit = e => { e.preventDefault(); if(box.querySelector("#tRes").innerHTML) return;
          const ok = sameAnswer(inp.value, c.back); box.querySelector("#tRes").innerHTML = '<p class="res '+(ok?"yes":"no")+'">'+(ok ? "✓ Correct!" : "✗ The answer: " + esc(c.back))+'</p><div class="acts" style="justify-content:center">'+(ok ? '' : '<button type="button" class="btn ghost sm" id="tOk">I was right</button>')+'<button type="button" class="btn acc" id="tNext">Next</button></div>';
          let counted = false; const count = r => { if(!counted){ counted = true; mark(c, r); } };
          count(ok); const o2 = box.querySelector("#tOk"); if(o2) o2.onclick = () => { st.wrong--; st.missed.pop(); st.right++; o2.remove(); };
          box.querySelector("#tNext").onclick = next; };
      } else {
        const others = shuffle(d.cards.filter(x => x.id !== c.id && norm(x.back) !== norm(c.back))).slice(0, 3), opts = shuffle(others.concat([c]));
        box.innerHTML = head() + bar() + '<div class="qcard">'+esc(c.front)+'</div><div class="opts">'+opts.map(o => '<button type="button" class="opt" data-id="'+esc(o.id)+'">'+esc(o.back)+'</button>').join("")+'</div>';
        box.querySelector(".opts").onclick = e => { const b = e.target.closest(".opt"); if(!b || b.dataset.done) return; const ok = b.dataset.id === c.id;
          box.querySelectorAll(".opt").forEach(x => { x.dataset.done = "1"; if(x.dataset.id === c.id) x.classList.add("good"); }); if(!ok) b.classList.add("bad");
          mark(c, ok); setTimeout(() => { if(!st.over) next(); }, ok ? 650 : 1300); };
      }
      box.querySelector("#sQuit").onclick = () => { if(confirm("Stop this session? Your score so far is kept.")) finish(); };
    };
    if(mode === "speed"){ timer = setInterval(() => { if(st.over){ clearInterval(timer); return; } st.left--; const h = box.querySelector(".shead .num"); if(h) h.textContent = "⏱️ " + st.left + "s"; if(st.left <= 0) finish(); }, 1000); }
    draw();
  }, "wide noclose");
}

// ---------- clicks ----------
document.addEventListener("click", e => {
  const b = e.target.closest("button"); if(!b) return; const d = b.dataset;
  if(d.fstart) return startFocus(+d.fstart);
  if(b.id === "fGo"){ const v = parseInt($("#fCustom").value, 10); customMin = v >= 5 && v <= 180 ? v : 25; return startFocus(customMin); }
  if(b.id === "addDeck") return openDeck(null);
  if(d.dstudy) return openModes(d.dstudy);
  if(d.dedit) return openDeck(d.dedit);
  if(d.ddel){ if(b.dataset.armed){ S.decks = S.decks.filter(x => x.id !== d.ddel); save(); renderAll(); } else { b.dataset.armed = "1"; b.textContent = "Tap again"; } }
});
