/* School hub: Grades (the Dean's List calculator), Planner (tasks + class schedule), Absences, Handbook, Projects.
   Everything is saved on this device. Nothing here costs money or needs an account. */
"use strict";

const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const SCHOOL_PARTS = [["grades","Grades"],["planner","Planner"],["absences","Absences"],["handbook","Handbook"],["projects","Projects"]];
const STATUSES = [["idea","💡 Idea"],["doing","🛠️ Doing"],["done","✅ Done"]];
let projFilter = "all";
const DOC_CAP = 300000, DOCS_TOTAL_CAP = 900000;

// ---------- small helpers ----------
function schoolNav(){
  return '<nav class="snav" aria-label="School sections">' + SCHOOL_PARTS.map(p => '<button type="button" data-pane="school:'+p[0]+'" aria-selected="'+(pane.school===p[0])+'">'+p[1]+'</button>').join("") + '</nav>';
}
function safeUrl(u){
  u = String(u || "").trim(); if(!u) return "";
  if(!/^https?:\/\//i.test(u)){ if(/^[a-z][a-z0-9+.-]*:/i.test(u)) return ""; u = "https://" + u; }   // other schemes (javascript:, data:) are refused
  try{ const x = new URL(u); return (x.protocol === "http:" || x.protocol === "https:") && x.hostname.indexOf(".") > 0 ? x.href : ""; }catch(e){ return ""; }
}
function linkIcon(u){
  if(/docs\.google|drive\.google/.test(u)) return "📄"; if(/github\.com/.test(u)) return "🐙"; if(/figma\.com/.test(u)) return "🎨"; if(/canva\.com/.test(u)) return "🖌️";
  if(/youtu/.test(u)) return "▶️"; if(/notion\.|onenote|office\.com|sharepoint/.test(u)) return "📝"; return "🔗";
}
function dueText(due){
  if(!due) return "";
  const d = due.slice(0,10), t = due.length > 10 ? due.slice(11,16) : "";
  const diff = dayNum(d) - dayNum(today());
  const when = diff === 0 ? "today" : diff === 1 ? "tomorrow" : diff === -1 ? "yesterday" : diff < 0 ? Math.abs(diff) + " days ago" : new Date(d + "T00:00").toLocaleDateString("en-PH", {month:"short", day:"numeric"});
  let tm = ""; if(t){ const h = +t.slice(0,2); tm = " " + ((h % 12) || 12) + t.slice(2) + (h < 12 ? " AM" : " PM"); }
  return "Due " + when + tm;
}
const dueDay = t => t.due ? t.due.slice(0,10) : "";

// ---------- planner ----------
function classesToday(){ const d = new Date().getDay(); return S.classes.filter(c => c.days.indexOf(d) >= 0).sort((a,b) => a.start.localeCompare(b.start)); }
function todayCardHtml(){
  const cl = classesToday(), td = today();
  const tasks = S.tasks.filter(t => !t.done && t.due && dueDay(t) <= td).sort((a,b) => a.due.localeCompare(b.due));
  const rows = cl.map(c => '<li class="trow"><span class="tdot cls" aria-hidden="true">🎒</span><div class="grow"><div class="t">'+esc(c.name)+'</div><div class="s">'+esc(c.start)+' to '+esc(c.end)+(c.room?', '+esc(c.room):'')+'</div></div></li>').join("") +
    tasks.slice(0,4).map(t => '<li class="trow"><span class="tdot '+(dueDay(t) < td ? "late" : "")+'" aria-hidden="true">'+(dueDay(t) < td ? "⚠️" : "📌")+'</span><div class="grow"><div class="t">'+esc(t.title)+'</div><div class="s">'+esc(dueText(t.due))+'</div></div></li>').join("");
  return '<section class="card"><div class="cardhead"><h2>Today</h2><button type="button" class="btn ghost sm" data-goschool="planner">Open planner</button></div>' +
    (rows ? '<ul class="list">'+rows+'</ul>' : '<div class="empty"><p>Nothing due and no classes today. Enjoy it, or get ahead on something.</p></div>') + '</section>';
}
function taskRow(t){
  const late = !t.done && t.due && dueDay(t) < today();
  return '<li class="row'+(t.done?" done":"")+'"><button type="button" class="check" aria-pressed="'+t.done+'" data-ttoggle="'+esc(t.id)+'" aria-label="Mark done">'+(t.done?"✓":"")+'</button>' +
    '<div class="grow"><div class="t">'+esc(t.title)+'</div><div class="s'+(late?" late":"")+'">'+(t.course?esc(t.course)+(t.due?", ":""):"")+esc(dueText(t.due))+'</div></div>' +
    (t.due && !t.done ? '<button type="button" class="x" data-tics="'+esc(t.id)+'" aria-label="Add to phone calendar" title="Add to phone calendar">📅</button>' : '') +
    '<button type="button" class="x" data-tdel="'+esc(t.id)+'" aria-label="Delete task">×</button></li>';
}
function plannerHtml(){
  const td = today(), open = S.tasks.filter(t => !t.done).sort((a,b) => (a.due || "9999").localeCompare(b.due || "9999"));
  const done = S.tasks.filter(t => t.done).slice(-5).reverse();
  const groups = [["Overdue", open.filter(t => t.due && dueDay(t) < td)], ["Today", open.filter(t => dueDay(t) === td)], ["Coming up", open.filter(t => dueDay(t) > td)], ["Whenever", open.filter(t => !t.due)]];
  let html = todayCardHtml() + '<section class="card"><div class="cardhead"><h2>Tasks</h2><button type="button" class="btn acc sm" id="addTask">+ Task</button></div>';
  if(!S.tasks.length) html += '<div class="empty">'+pomFor("pom")+'<p>No tasks yet. Add one and I will keep an eye on the deadline.</p></div>';
  groups.forEach(g => { if(g[1].length) html += '<h3 class="grp">'+g[0]+'</h3><ul class="list">'+g[1].map(taskRow).join("")+'</ul>'; });
  if(done.length) html += '<h3 class="grp">Done lately</h3><ul class="list">'+done.map(taskRow).join("")+'</ul>';
  html += '</section>';
  const byDay = DAYS.map((n,i) => [n, S.classes.filter(c => c.days.indexOf(i) >= 0).sort((a,b) => a.start.localeCompare(b.start))]).filter(x => x[1].length);
  html += '<section class="card"><div class="cardhead"><h2>Class schedule</h2><button type="button" class="btn acc sm" id="addClass">+ Class</button></div>';
  if(!byDay.length) html += '<div class="empty"><p>Add your classes once, and they show up on Home on the right day.</p></div>';
  byDay.forEach(x => { html += '<h3 class="grp">'+x[0]+'</h3><ul class="list">' + x[1].map(c => '<li class="row"><div class="grow"><div class="t">'+esc(c.name)+'</div><div class="s">'+esc(c.start)+' to '+esc(c.end)+(c.room?', '+esc(c.room):'')+'</div></div><button type="button" class="x" data-cdel="'+esc(c.id)+'" aria-label="Delete class">×</button></li>').join("") + '</ul>'; });
  return html + '</section>';
}
function openTask(){
  modal('<h3>New task</h3><form id="taskForm" class="sheetform"><div class="field"><label for="tkTitle">What do you need to do?</label><input class="inp" id="tkTitle" maxlength="80" placeholder="e.g. Finish the case study" required></div>' +
    '<div class="field"><label for="tkCourse">Subject (optional)</label><input class="inp" id="tkCourse" maxlength="40" list="courseNames" placeholder="e.g. Marketing"><datalist id="courseNames">'+courseNames().map(n => '<option value="'+esc(n)+'">').join("")+'</datalist></div>' +
    '<div style="display:flex;gap:8px;flex-wrap:wrap"><div class="field"><label for="tkDate">Due date</label><input class="inp" id="tkDate" type="date"></div><div class="field"><label for="tkTime">Time (optional)</label><input class="inp" id="tkTime" type="time"></div></div>' +
    '<div class="acts"><button type="button" class="btn ghost" id="cancel">Cancel</button><button class="btn acc" type="submit">Add task</button></div></form>', m => {
      m.querySelector("#cancel").onclick = closeModal;
      m.querySelector("#taskForm").onsubmit = e => { e.preventDefault();
        const title = m.querySelector("#tkTitle").value.trim(); if(!title) return;
        const d = m.querySelector("#tkDate").value, t = m.querySelector("#tkTime").value;
        S.tasks.push({id:uid8(), title:title, course:m.querySelector("#tkCourse").value.trim(), due:d ? d + (t ? "T" + t : "") : "", done:false, ts:Date.now()});
        save(); closeModal(); renderAll(); toast("Task added");
      };
    });
}
function courseNames(){ const s = {}; S.courses.forEach(c => s[c.name] = 1); S.classes.forEach(c => s[c.name] = 1); return Object.keys(s); }
function openClass(){
  const days = [];
  modal('<h3>New class</h3><form id="classForm" class="sheetform"><div class="field"><label for="clName">Subject</label><input class="inp" id="clName" maxlength="40" placeholder="e.g. Database Systems" required></div>' +
    '<div class="field"><label>Days</label><div class="chips" id="clDays">'+DAYS.map((n,i) => '<button type="button" class="chipbtn" data-day="'+i+'" aria-pressed="false">'+n+'</button>').join("")+'</div></div>' +
    '<div style="display:flex;gap:8px;flex-wrap:wrap"><div class="field"><label for="clStart">Starts</label><input class="inp" id="clStart" type="time" value="09:00" required></div><div class="field"><label for="clEnd">Ends</label><input class="inp" id="clEnd" type="time" value="10:30" required></div></div>' +
    '<div class="field"><label for="clRoom">Room (optional)</label><input class="inp" id="clRoom" maxlength="20" placeholder="e.g. G304"></div>' +
    '<div class="acts"><button type="button" class="btn ghost" id="cancel">Cancel</button><button class="btn acc" type="submit">Add class</button></div></form>', m => {
      m.querySelector("#cancel").onclick = closeModal;
      m.querySelector("#clDays").addEventListener("click", e => { const b = e.target.closest("[data-day]"); if(!b) return; const d = +b.dataset.day, i = days.indexOf(d); if(i < 0) days.push(d); else days.splice(i, 1); b.setAttribute("aria-pressed", i < 0); });
      m.querySelector("#classForm").onsubmit = e => { e.preventDefault();
        if(!days.length) return toast("Pick at least one day");
        S.classes.push({id:uid8(), name:m.querySelector("#clName").value.trim(), days:days.slice().sort(), start:m.querySelector("#clStart").value, end:m.querySelector("#clEnd").value, room:m.querySelector("#clRoom").value.trim()});
        save(); closeModal(); renderAll(); toast("Class added");
      };
    });
}
function taskToIcs(id){
  const t = S.tasks.find(x => x.id === id); if(!t || !t.due) return;
  const at = t.due.length > 10 ? t.due : t.due + "T09:00";
  downloadIcs([{id:t.id, at:at, title:"Due: " + t.title, kind:"task"}], "task");
  toast("Open the file to add it to your phone calendar");
}

// ---------- absences ----------
const ABS_LINES = {
  ok:{gentle:"Plenty left. Rest when you need to.", real:"You're chill. Just don't waste them.", savage:"Still got room. Don't get ideas."},
  one:{gentle:"Only one left. Maybe keep it for emergencies?", real:"One left, bes. Save it for a real emergency.", savage:"One absence left. Please don't spend it on a 'tired' day."},
  zero:{gentle:"No absences left. Please try to attend from now on.", real:"Zero left. Pasok na tayo, bes.", savage:"Zero left. From now on you live in that classroom."},
  over:{gentle:"Over the limit. Talk to your professor soon. It's okay to ask.", real:"Over the limit. Message your prof today, don't wait.", savage:"Over the limit. Time for the professor talk. Be brave."}
};
function absState(c){ const left = c.allowed - c.absent; return left < 0 ? "over" : left === 0 ? "zero" : left === 1 ? "one" : "ok"; }
function absencesHtml(){
  const rule = findRules(/absen|attendance/i, 1)[0];
  let html = '<section class="card"><div class="cardhead"><h2>Absences</h2><button type="button" class="btn acc sm" id="addCourse2">+ Subject</button></div>' +
    (rule ? '<div class="note" style="margin-bottom:12px"><b>From your handbook</b><br>'+esc(rule.line)+'</div>' : '<p class="hint" style="margin:0 0 10px">Add your handbook in the Handbook tab and I will show the absence rule here.</p>');
  if(!S.courses.length) html += '<div class="empty">'+pomFor("pom")+'<p>Add each subject and how many absences your school allows. Tap + each time you miss a class.</p></div>';
  else html += '<ul class="list">' + S.courses.map(c => {
    const left = c.allowed - c.absent, st = absState(c), pct = c.allowed > 0 ? Math.min(100, c.absent / c.allowed * 100) : 100;
    return '<li class="abrow '+st+'"><div class="abtop"><b>'+esc(c.name)+'</b><span class="num">'+c.absent+' of '+c.allowed+' used</span><button type="button" class="x" data-abdel="'+esc(c.id)+'" aria-label="Delete subject">×</button></div>' +
      '<div class="mbar'+(st==="over"||st==="zero"?" hot":"")+'"><i style="width:'+pct+'%"></i></div>' +
      '<div class="abbot"><span class="hint">'+esc(ABS_LINES[st][S.tone] || ABS_LINES[st].real)+'</span><span class="stepper"><button type="button" class="round" data-abm="'+esc(c.id)+'" aria-label="One less absence">−</button><button type="button" class="round" data-abp="'+esc(c.id)+'" aria-label="One more absence">+</button></span></div></li>';
  }).join("") + '</ul>';
  return html + '</section>';
}
function openSubject(){
  modal('<h3>New subject</h3><form id="subForm" class="sheetform"><div class="field"><label for="sbName">Subject</label><input class="inp" id="sbName" maxlength="40" placeholder="e.g. Database Systems" required></div>' +
    '<div class="field"><label for="sbAllowed">Absences allowed</label><input class="inp num" id="sbAllowed" type="number" inputmode="numeric" min="0" max="60" value="5" required><span class="muted" style="font-size:.78rem">Check your handbook. Many schools count by sessions per term.</span></div>' +
    '<div class="acts"><button type="button" class="btn ghost" id="cancel">Cancel</button><button class="btn acc" type="submit">Add subject</button></div></form>', m => {
      m.querySelector("#cancel").onclick = closeModal;
      m.querySelector("#subForm").onsubmit = e => { e.preventDefault();
        const a = parseInt(m.querySelector("#sbAllowed").value, 10);
        S.courses.push({id:uid8(), name:m.querySelector("#sbName").value.trim(), allowed:a >= 0 && a <= 60 ? a : 5, absent:0});
        save(); closeModal(); renderAll();
      };
    });
}

// ---------- handbook ----------
const RULE_WORDS = /dean'?s list|gpa|absen|attendance|tardy|late |probation|retention|grading|incomplete|drop|passing|failing|honors?|scholar/i;
function findRules(re, max){
  const out = [];
  S.docs.forEach(d => d.text.split(/\r?\n/).forEach(l => { const line = l.trim(); if(line.length > 25 && line.length < 400 && re.test(line) && out.length < (max || 8)) out.push({doc:d.title, line:line}); }));
  return out;
}
function searchDocs(q, max){
  const out = [], low = q.toLowerCase();
  S.docs.forEach(d => { let i = 0; const t = d.text, tl = t.toLowerCase();
    while((i = tl.indexOf(low, i)) >= 0 && out.length < (max || 6)){ out.push({doc:d.title, at:i, text:t.slice(Math.max(0, i - 90), i + q.length + 140).replace(/\s+/g, " "), q:q}); i += q.length + 140; } });
  return out;
}
const mark = (text, q) => esc(text).replace(new RegExp(esc(q).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "ig"), m => "<mark>" + m + "</mark>");
function handbookHtml(){
  const total = S.docs.reduce((s,d) => s + d.text.length, 0), rules = findRules(RULE_WORDS, 6);
  let html = '<section class="card"><div class="cardhead"><h2>Handbook</h2><button type="button" class="btn acc sm" id="addDoc">+ Add</button></div>' +
    '<p class="hint" style="margin:0 0 10px">Paste your student handbook (or any school rules) here and find things fast. It stays on this phone. Got a PDF? Open it, select all, copy, and paste it here.</p>';
  if(!S.docs.length) html += '<div class="empty">'+pomFor("pom")+'<p>No handbook yet. Add it, and update it whenever your school releases a new one.</p></div>';
  else html += '<ul class="list">' + S.docs.map(d => '<li class="row"><div class="grow"><div class="t">'+esc(d.title)+'</div><div class="s">Updated '+esc(new Date(d.ts).toLocaleDateString("en-PH",{month:"short",day:"numeric",year:"numeric"}))+', '+Math.round(d.text.length/1000)+'k characters</div></div>' +
    '<button type="button" class="btn ghost sm" data-docopen="'+esc(d.id)+'">Read</button><button type="button" class="btn ghost sm" data-docup="'+esc(d.id)+'">Update</button><button type="button" class="x" data-docdel="'+esc(d.id)+'" aria-label="Delete">×</button></li>').join("") + '</ul>' +
    '<p class="hint" style="margin:8px 0 0">Space used: '+Math.round(total/1000)+'k of '+Math.round(DOCS_TOTAL_CAP/1000)+'k characters.</p>';
  html += '</section>';
  if(S.docs.length){
    html += '<section class="card"><h2>Find something</h2><div class="field" style="margin-top:8px"><input class="inp" id="hbSearch" type="search" placeholder="Try: absences, Dean\'s List, late" aria-label="Search your handbook"></div><div id="hbResults" class="hbres"></div></section>';
    if(rules.length) html += '<section class="card"><h2>Rules I spotted</h2><ul class="rules">'+rules.map(r => '<li><span class="hint">'+esc(r.doc)+'</span><br>'+esc(r.line)+'</li>').join("")+'</ul><p class="hint" style="margin:8px 0 0">Always double-check the full text. I only copy lines that mention common rules.</p></section>';
  }
  return html;
}
function openDocEditor(id){
  const d = id ? S.docs.find(x => x.id === id) : null;
  modal('<h3>'+(d ? "Update " + esc(d.title) : "Add a handbook")+'</h3><form id="docForm" class="sheetform"><div class="field"><label for="dcTitle">Name</label><input class="inp" id="dcTitle" maxlength="60" value="'+esc(d ? d.title : "")+'" placeholder="e.g. Student Handbook 2026" required></div>' +
    '<div class="field"><label for="dcText">Paste the text here</label><textarea class="inp" id="dcText" rows="8" placeholder="Paste the handbook text..." required></textarea></div>' +
    '<div class="field"><label class="btn ghost sm" for="dcFile" style="cursor:pointer;width:fit-content">📎 Or choose a .txt file</label><input id="dcFile" type="file" accept=".txt,.md,text/plain" hidden></div>' +
    '<p class="hint" id="dcMsg" style="margin:0"></p><div class="acts"><button type="button" class="btn ghost" id="cancel">Cancel</button><button class="btn acc" type="submit">Save</button></div></form>', m => {
      m.querySelector("#cancel").onclick = closeModal;
      m.querySelector("#dcFile").onchange = e => { const f = e.target.files && e.target.files[0]; if(!f) return; const r = new FileReader(); r.onload = () => { m.querySelector("#dcText").value = String(r.result).slice(0, DOC_CAP); if(!m.querySelector("#dcTitle").value) m.querySelector("#dcTitle").value = f.name.replace(/\.\w+$/, ""); }; r.readAsText(f); };
      m.querySelector("#docForm").onsubmit = e => { e.preventDefault();
        const text = m.querySelector("#dcText").value.trim(), title = m.querySelector("#dcTitle").value.trim();
        if(text.length > DOC_CAP) return m.querySelector("#dcMsg").textContent = "That is too long for one file (limit " + Math.round(DOC_CAP/1000) + "k characters). Split it into two.";
        const others = S.docs.filter(x => !d || x.id !== d.id).reduce((s,x) => s + x.text.length, 0);
        if(others + text.length > DOCS_TOTAL_CAP) return m.querySelector("#dcMsg").textContent = "Not enough room on this phone. Delete an old handbook first.";
        if(d){ d.title = title; d.text = text; d.ts = Date.now(); } else S.docs.push({id:uid8(), title:title, text:text, ts:Date.now()});
        save(); closeModal(); renderAll(); toast(d ? "Handbook updated" : "Handbook saved");
      };
    });
}
function openDocReader(id){
  const d = S.docs.find(x => x.id === id); if(!d) return;
  modal('<h3>'+esc(d.title)+'</h3><div class="field"><input class="inp" id="rdSearch" type="search" placeholder="Search in this handbook" aria-label="Search in this handbook"></div><div class="docbox" id="rdText"></div><div class="acts"><button type="button" class="btn acc" id="cancel">Close</button></div>', m => {
    const box = m.querySelector("#rdText"), draw = q => { box.innerHTML = q ? mark(d.text, q) : esc(d.text); const f = box.querySelector("mark"); if(f) f.scrollIntoView({block:"center"}); };
    m.querySelector("#cancel").onclick = closeModal; m.querySelector("#rdSearch").addEventListener("input", e => draw(e.target.value.trim())); draw("");
  }, "wide");
}
function runHandbookSearch(q){
  const box = $("#hbResults"); if(!box) return;
  if(q.length < 2){ box.innerHTML = ""; return; }
  const r = searchDocs(q, 6);
  box.innerHTML = r.length ? r.map(x => '<div class="hit"><span class="hint">'+esc(x.doc)+'</span><div>...'+mark(x.text, x.q)+'...</div></div>').join("") : '<p class="hint">Nothing found for "'+esc(q)+'". Try a shorter word.</p>';
}

// ---------- projects ----------
function projectCard(p){
  return '<section class="card proj"><div class="cardhead"><h2>'+esc(p.title)+'</h2><button type="button" class="stk '+esc(p.status)+'" data-pst="'+esc(p.id)+'" aria-label="Change status">'+esc((STATUSES.find(s => s[0] === p.status) || STATUSES[0])[1])+'</button></div>' +
    '<p class="hint" style="margin:0 0 8px">'+(p.course ? esc(p.course) : "No subject")+(p.due ? ", " + esc(dueText(p.due).replace("Due ", "due ")) : "")+'</p>' +
    (p.notes ? '<p class="pnotes">'+esc(p.notes)+'</p>' : '') +
    (p.links.length ? '<div class="plinks">'+p.links.map(l => '<a class="plink" href="'+esc(l.url)+'" target="_blank" rel="noopener noreferrer">'+linkIcon(l.url)+' '+esc(l.label || "Open")+'</a>').join("")+'</div>' : '<p class="hint" style="margin:0">No links yet. Add your Docs, Drive, GitHub or Figma links so everything opens from here.</p>') +
    '<div class="acts" style="justify-content:flex-start;margin-top:10px"><button type="button" class="btn ghost sm" data-pedit="'+esc(p.id)+'">Edit</button><button type="button" class="btn ghost sm" data-pdel="'+esc(p.id)+'">Delete</button></div></section>';
}
function projectsHtml(){
  const list = S.projects.filter(p => projFilter === "all" || p.status === projFilter).sort((a,b) => (a.due || "9999").localeCompare(b.due || "9999"));
  let html = '<section class="card"><div class="cardhead"><h2>Projects</h2><button type="button" class="btn acc sm" id="addProj">+ Project</button></div>' +
    '<div class="chips" role="group" aria-label="Filter">' + [["all","All"]].concat(STATUSES).map(s => '<button type="button" class="chipbtn" data-pf="'+s[0]+'" aria-pressed="'+(projFilter===s[0])+'">'+s[1]+'</button>').join("") + '</div></section>';
  if(!list.length) html += '<section class="card"><div class="empty">'+pomFor("pom")+'<p>'+(S.projects.length ? "Nothing in this filter." : "Put all your school projects in one place: links, deadlines and notes. Open anything in one tap.")+'</p></div></section>';
  return html + list.map(projectCard).join("");
}
function openProject(id){
  const p = id ? S.projects.find(x => x.id === id) : null, links = p ? p.links.map(l => ({label:l.label, url:l.url})) : [{label:"", url:""}];
  const linkRows = () => links.map((l,i) => '<div class="lrow" data-li="'+i+'"><input class="inp" data-lf="label" maxlength="24" placeholder="Name (Docs)" value="'+esc(l.label)+'" aria-label="Link '+(i+1)+' name"><input class="inp" data-lf="url" inputmode="url" maxlength="300" placeholder="https://..." value="'+esc(l.url)+'" aria-label="Link '+(i+1)+' address"><button type="button" class="x" data-ldel="'+i+'" aria-label="Remove link">×</button></div>').join("");
  modal('<h3>'+(p ? "Edit project" : "New project")+'</h3><form id="projForm" class="sheetform"><div class="field"><label for="pjTitle">Project name</label><input class="inp" id="pjTitle" maxlength="60" value="'+esc(p ? p.title : "")+'" required></div>' +
    '<div style="display:flex;gap:8px;flex-wrap:wrap"><div class="field"><label for="pjCourse">Subject</label><input class="inp" id="pjCourse" maxlength="40" list="courseNames2" value="'+esc(p ? p.course : "")+'"><datalist id="courseNames2">'+courseNames().map(n => '<option value="'+esc(n)+'">').join("")+'</datalist></div>' +
    '<div class="field"><label for="pjStatus">Status</label><select class="inp" id="pjStatus">'+STATUSES.map(s => '<option value="'+s[0]+'"'+(p && p.status===s[0]?" selected":"")+'>'+s[1]+'</option>').join("")+'</select></div></div>' +
    '<div class="field"><label for="pjDue">Deadline (optional)</label><input class="inp" id="pjDue" type="date" value="'+esc(p ? p.due.slice(0,10) : "")+'"></div>' +
    '<div class="field"><label>Links (up to 8)</label><div id="pjLinks"></div><button type="button" class="btn ghost sm" id="pjAddLink" style="width:fit-content;margin-top:6px">+ Add link</button></div>' +
    '<div class="field"><label for="pjNotes">Notes</label><textarea class="inp" id="pjNotes" rows="3" maxlength="600">'+esc(p ? p.notes : "")+'</textarea></div>' +
    '<p class="hint" id="pjMsg" style="margin:0"></p><div class="acts"><button type="button" class="btn ghost" id="cancel">Cancel</button><button class="btn acc" type="submit">Save</button></div></form>', m => {
      const box = m.querySelector("#pjLinks"), draw = () => { box.innerHTML = linkRows(); m.querySelector("#pjAddLink").disabled = links.length >= 8; };
      m.querySelector("#cancel").onclick = closeModal;
      m.querySelector("#pjAddLink").onclick = () => { if(links.length < 8){ links.push({label:"", url:""}); draw(); } };
      box.addEventListener("input", e => { const row = e.target.closest("[data-li]"); if(row && e.target.dataset.lf) links[+row.dataset.li][e.target.dataset.lf] = e.target.value; });
      box.addEventListener("click", e => { const b = e.target.closest("[data-ldel]"); if(b){ links.splice(+b.dataset.ldel, 1); if(!links.length) links.push({label:"", url:""}); draw(); } });
      m.querySelector("#projForm").onsubmit = e => { e.preventDefault();
        const clean = [];
        for(const l of links){ if(!l.url.trim()) continue; const u = safeUrl(l.url); if(!u) return m.querySelector("#pjMsg").textContent = "One link isn't a web address I can open. Use one that starts with https://"; clean.push({label:l.label.trim().slice(0,24), url:u}); }
        const obj = {title:m.querySelector("#pjTitle").value.trim(), course:m.querySelector("#pjCourse").value.trim(), status:m.querySelector("#pjStatus").value, due:m.querySelector("#pjDue").value, notes:m.querySelector("#pjNotes").value.trim(), links:clean};
        if(p) Object.assign(p, obj); else S.projects.push(Object.assign({id:uid8()}, obj));
        save(); closeModal(); renderAll(); toast("Project saved");
      };
      draw();
    }, "wide");
}

// ---------- the screen ----------
function renderSchool(){
  const k = pane.school;
  if(k === "grades") renderDeans();
  else $("#view").innerHTML = ({planner:plannerHtml, absences:absencesHtml, handbook:handbookHtml, projects:projectsHtml}[k] || plannerHtml)();
  $("#view").insertAdjacentHTML("afterbegin", schoolNav());
}

document.addEventListener("click", e => {
  const b = e.target.closest("button"); if(!b) return;
  const d = b.dataset, byId = (arr, id) => arr.find(x => x.id === id);
  if(d.goschool){ pane.school = d.goschool; location.hash = "school"; renderAll(); return; }
  if(b.id === "addTask") return openTask();
  if(b.id === "addClass") return openClass();
  if(b.id === "addCourse2") return openSubject();
  if(b.id === "addDoc") return openDocEditor(null);
  if(b.id === "addProj") return openProject(null);
  if(d.ttoggle){ const t = byId(S.tasks, d.ttoggle); if(t){ t.done = !t.done; save(); renderAll(); if(t.done) toast("Done! " + tx(20)); } return; }
  if(d.tdel){ S.tasks = S.tasks.filter(x => x.id !== d.tdel); save(); renderAll(); return; }
  if(d.tics) return taskToIcs(d.tics);
  if(d.cdel){ S.classes = S.classes.filter(x => x.id !== d.cdel); save(); renderAll(); return; }
  if(d.abp || d.abm){ const c = byId(S.courses, d.abp || d.abm); if(c){ c.absent = Math.max(0, c.absent + (d.abp ? 1 : -1)); save(); renderAll(); if(d.abp){ const st = absState(c); toast(ABS_LINES[st][S.tone] || ABS_LINES[st].real); } } return; }
  if(d.abdel){ S.courses = S.courses.filter(x => x.id !== d.abdel); save(); renderAll(); return; }
  if(d.docopen) return openDocReader(d.docopen);
  if(d.docup) return openDocEditor(d.docup);
  if(d.docdel){ if(b.dataset.armed){ S.docs = S.docs.filter(x => x.id !== d.docdel); save(); renderAll(); } else { b.dataset.armed = "1"; b.textContent = "Sure?"; b.style.width = "auto"; } return; }
  if(d.pf){ projFilter = d.pf; renderAll(); return; }
  if(d.pst){ const p = byId(S.projects, d.pst); if(p){ const i = STATUSES.findIndex(s => s[0] === p.status); p.status = STATUSES[(i + 1) % STATUSES.length][0]; save(); renderAll(); if(p.status === "done"){ toast("Project done! " + tx(100)); confetti(b, 24); } } return; }
  if(d.pedit) return openProject(d.pedit);
  if(d.pdel){ if(b.dataset.armed){ S.projects = S.projects.filter(x => x.id !== d.pdel); save(); renderAll(); } else { b.dataset.armed = "1"; b.textContent = "Tap again to delete"; } return; }
});
document.addEventListener("input", e => { if(e.target.id === "hbSearch") runHandbookSearch(e.target.value.trim()); });
