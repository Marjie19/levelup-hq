/* Reminders: in-app + phone notifications while the app is open, and "Add to calendar" (.ics) so the phone itself reminds you */
"use strict";

// Friend-voice lines for reminders (same rules as docs/VOICE.md)
Object.assign(LINES, {
  rFeed:{ gentle:["{pet} could use a little love today.","{pet} misses you. A quick snack?"], real:["{pet} is hungry and a little sad. Feed na, bes.","Uy, {pet} needs you. 1 minute lang."], savage:["{pet} is staring at the empty bowl. Judging you.","{pet} has been waiting. Be a better parent, char."] },
  rEvening:{ gentle:["Quick check: anything to log from today?","Before bed, want to log today's spending?"], real:["Log your gastos for today, bes. 30 seconds lang.","Wala ka pang nilog today. Anything bought?"], savage:["No expenses logged today. Either you're a monk or you forgot.","Today's gastos: unknown. Suspicious. Log it."] },
  rBudget:{ gentle:["You've used {pct}% of your budget. Just a gentle heads up.","{pct}% of the budget is used. Easy lang from here."], real:["{pct}% of your budget na. Tipid mode.","Budget alert: {pct}% used."], savage:["{pct}% of the budget gone. Bold strategy.","Budget at {pct}%. We are NOT ordering delivery."] },
  rDue:{ gentle:["Reminder: {t}","Gentle nudge: {t}"], real:["Reminder: {t}. Ge na.","Uy, {t}!"], savage:["{t}. Yes, now. Not later.","Reminder: {t}. Procrastination ends here."] }
});

const REMIND_KINDS = [["task","Task"],["deadline","Deadline"],["quiz","Quiz"],["other","Other"]];
const RK_ICON = {task:"📝", deadline:"⏰", quiz:"📚", other:"⭐"};
const pad2 = n => String(n).padStart(2, "0");
const nowLocal = () => { const d = new Date(); return d.getFullYear()+"-"+pad2(d.getMonth()+1)+"-"+pad2(d.getDate())+"T"+pad2(d.getHours())+":"+pad2(d.getMinutes()); };
const niceWhen = at => new Date(at).toLocaleString("en-PH", {month:"short", day:"numeric", hour:"numeric", minute:"2-digit"});

// ----- sending a reminder -----
function notifyOK(){ return "Notification" in window && Notification.permission === "granted"; }
function fireReminder(msg){
  toast(msg);
  if(!S.remind.notify || !notifyOK()) return;
  const opts = {body:msg, icon:"icons/icon-192.png", tag:"bestie-" + hashStr(msg)};
  try{
    if(navigator.serviceWorker && navigator.serviceWorker.ready) navigator.serviceWorker.ready.then(r => r.showNotification("Bestie HQ", opts)).catch(() => { try{ new Notification("Bestie HQ", opts); }catch(e){} });
    else new Notification("Bestie HQ", opts);
  }catch(e){}
}

// ----- the checker: runs every 30 seconds and when you come back to the app -----
function onceToday(key){ if(S.remindLog[key] === today()) return false; S.remindLog[key] = today(); return true; }
function tickReminders(){
  if(!S.setup) return;
  const r = S.remind, now = nowLocal(), hour = new Date().getHours(), msgs = [];
  S.reminders.forEach(x => { if(!x.done && !x.fired && x.at <= now){ x.fired = true; msgs.push(say("rDue", {t:(RK_ICON[x.kind]||"") + " " + x.title})); } });
  if(r.feed && hour >= 9){ const sad = S.pets.find(p => moodOf(p) === "sad"); if(sad && onceToday("feed")) msgs.push(say("rFeed", {pet:sad.name})); }
  if(r.evening && now.slice(11) >= r.eveningAt && !S.expenses.some(e => e.date === today()) && onceToday("evening")) msgs.push(say("rEvening"));
  if(r.budget && S.budget > 0){ const pct = Math.round(monthSpent() / S.budget * 100); if(pct >= 80 && onceToday("budget" + (pct >= 100 ? "100" : "80"))) msgs.push(say("rBudget", {pct:pct})); }
  if(!msgs.length) return;
  save(); msgs.forEach((m, i) => setTimeout(() => fireReminder(m), i * 2800));
  if(currentTab() === "profile" || $("#remList")) renderRemList();
}
setInterval(tickReminders, 30000);
document.addEventListener("visibilitychange", () => { if(!document.hidden) tickReminders(); });
setTimeout(tickReminders, 1500);

// ----- calendar file (.ics) so the phone reminds you even when the app is closed -----
const icsStamp = at => at.replace(/[-:]/g, "") + "00";
const icsEsc = s => String(s).replace(/[\\;,]/g, m => "\\" + m).replace(/\n/g, "\\n");
function icsFor(list){
  const out = ["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Bestie HQ//EN","CALSCALE:GREGORIAN"];
  list.forEach(x => {
    const end = new Date(new Date(x.at).getTime() + 30*60000), e = end.getFullYear()+pad2(end.getMonth()+1)+pad2(end.getDate())+"T"+pad2(end.getHours())+pad2(end.getMinutes())+"00";
    out.push("BEGIN:VEVENT","UID:"+x.id+"@bestie-hq","DTSTAMP:"+icsStamp(nowLocal()),"DTSTART:"+icsStamp(x.at),"DTEND:"+e,
      "SUMMARY:"+icsEsc((RK_ICON[x.kind]||"") + " " + x.title),"BEGIN:VALARM","ACTION:DISPLAY","DESCRIPTION:"+icsEsc(x.title),"TRIGGER:-PT15M","END:VALARM","END:VEVENT");
  });
  out.push("END:VCALENDAR");
  return out.join("\r\n");
}
function downloadIcs(list, name){
  const blob = new Blob([icsFor(list)], {type:"text/calendar"}), a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = name + ".ics"; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}

// ----- the Reminders sheet -----
function renderRemList(){
  const el = $("#remList"); if(!el) return;
  const list = S.reminders.slice().sort((a, b) => a.at.localeCompare(b.at));
  el.innerHTML = !list.length ? '<p class="hint" style="margin:0">Nothing yet. Add a task, deadline or quiz below.</p>' :
    '<ul class="list">' + list.map(x => '<li class="row"><span class="catdot" aria-hidden="true">'+(RK_ICON[x.kind]||"⭐")+'</span><div class="grow"><div class="t" style="'+(x.done?"text-decoration:line-through;opacity:.6":"")+'">'+esc(x.title)+'</div><div class="s">'+niceWhen(x.at)+(x.fired&&!x.done?" · sent":"")+'</div></div>' +
      '<button type="button" class="x" data-rical="'+x.id+'" aria-label="Add to phone calendar">📅</button><button type="button" class="x" data-rdone="'+x.id+'" aria-label="'+(x.done?"Mark not done":"Mark done")+'">'+(x.done?"↩":"✓")+'</button><button type="button" class="x" data-rdel="'+x.id+'" aria-label="Delete">×</button></li>').join("") + '</ul>';
}
function openReminders(){
  const r = S.remind, sup = "Notification" in window, perm = sup ? Notification.permission : "unsupported";
  const chk = (id, label, on) => '<label style="display:flex;gap:8px;align-items:center;font-weight:700"><input type="checkbox" id="'+id+'" '+(on?"checked":"")+' style="width:20px;height:20px"> '+label+'</label>';
  modal('<h3>Reminders</h3>' +
    '<p class="tip">Honest limits: the app can only pop up reminders while it is open or running in the background. On iPhone, install it first (Share, then Add to Home Screen, iOS 16.4 or newer). For reminders that work even when the app is closed, tap 📅 to add one to your phone\'s calendar.</p>' +
    '<div class="stack" style="gap:10px">' +
    (sup && perm !== "granted" ? '<button type="button" class="btn acc" id="askNotify">'+(perm === "denied" ? "Notifications are blocked in your browser settings" : "Turn on phone notifications")+'</button>' : '') +
    (!sup ? '<p class="hint" style="margin:0">This browser has no notifications. You will still see reminders inside the app.</p>' : '') +
    chk("rFeed", "Remind me to feed my companion", r.feed) + chk("rBudget", "Warn me when my budget is almost used", r.budget) +
    chk("rEve", "Evening nudge to log my spending", r.evening) +
    '<div class="field"><label for="rEveAt">Evening nudge time</label><input class="inp" id="rEveAt" type="time" value="'+r.eveningAt+'"></div>' +
    '<div id="remList"></div>' +
    '<form id="remForm" class="sheetform"><div class="field"><label for="rTitle">New reminder</label><input class="inp" id="rTitle" maxlength="60" placeholder="e.g. Math quiz" required></div>' +
    '<div style="display:flex;gap:8px;flex-wrap:wrap"><div class="field"><label for="rKind">Type</label><select class="inp" id="rKind">'+REMIND_KINDS.map(k => '<option value="'+k[0]+'">'+k[1]+'</option>').join("")+'</select></div>' +
    '<div class="field"><label for="rAt">When</label><input class="inp" id="rAt" type="datetime-local" value="'+nowLocal()+'" required></div></div>' +
    '<div class="acts"><button type="button" class="btn ghost" id="allIcs">All to calendar</button><button class="btn acc" type="submit">Add</button></div></form></div>' +
    '<div class="acts"><button type="button" class="btn ghost" id="cancel">Done</button></div>', m => {
      m.querySelector("#cancel").onclick = closeModal;
      renderRemList();
      const sv = () => { S.remind.feed = m.querySelector("#rFeed").checked; S.remind.budget = m.querySelector("#rBudget").checked; S.remind.evening = m.querySelector("#rEve").checked; S.remind.eveningAt = m.querySelector("#rEveAt").value || "20:00"; save(); };
      m.querySelectorAll("#rFeed,#rBudget,#rEve,#rEveAt").forEach(i => i.onchange = sv);
      const ask = m.querySelector("#askNotify");
      if(ask) ask.onclick = () => { if(perm === "denied") return toast("Allow notifications for this site in your browser settings"); Notification.requestPermission().then(p => { S.remind.notify = p === "granted"; save(); openReminders(); toast(p === "granted" ? "Notifications are on" : "No notifications. You'll still see reminders in the app"); }).catch(() => {}); };
      m.querySelector("#allIcs").onclick = () => { const l = S.reminders.filter(x => !x.done && x.at > nowLocal()); if(!l.length) return toast("No upcoming reminders to add"); downloadIcs(l, "bestie-reminders"); };
      m.querySelector("#remForm").onsubmit = e => { e.preventDefault(); const t = m.querySelector("#rTitle").value.trim(), at = m.querySelector("#rAt").value; if(!t || !at) return;
        S.reminders.push({id:uid8(), title:t, kind:m.querySelector("#rKind").value, at:at, done:false, fired:false}); save(); m.querySelector("#rTitle").value = ""; renderRemList(); toast("Reminder added"); };
    });
}
// clicks inside the sheet's list
document.addEventListener("click", e => {
  const b = e.target.closest("button"); if(!b) return;
  const ds = b.dataset;
  if(b.id === "remindBtn") return openReminders();
  if(!ds.rdel && !ds.rdone && !ds.rical) return;
  const x = S.reminders.find(v => v.id === (ds.rdel || ds.rdone || ds.rical)); if(!x) return;
  if(ds.rdel) S.reminders = S.reminders.filter(v => v !== x);
  else if(ds.rdone) x.done = !x.done;
  else { downloadIcs([x], "reminder"); return; }
  save(); renderRemList();
});
