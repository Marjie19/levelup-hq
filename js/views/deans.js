/* Dean's List tab: enter courses, see your GPA live, check your school's rules, save the result to a term */
"use strict";

const RING_R = 54, RING_C = 2 * Math.PI * RING_R;
let calcWasPass = false;

function fmtGrade(g){ return isFive() ? g.toFixed(2) : (Math.round(g*100)/100).toString().replace(/^(\d)$/, "$1.0"); }
// How full the ring is for a GPA (0 to 1). On the 1.0-5.0 scale lower is better, so it flips.
function fillOf(g){ return Math.max(0, Math.min(1, pointsOf(g) / 4)); }

function gradeOptions(sel){
  const list = GRADE_STEPS[S.scale].slice();
  if(typeof sel === "number" && !list.includes(sel)){ list.push(sel); list.sort((a,b) => isFive() ? a-b : b-a); }
  return '<option value="">Pick</option>' + list.map(g => '<option value="'+g+'"'+(sel===g?" selected":"")+'>'+fmtGrade(g)+'</option>').join("");
}

function calcResult(){
  const rows = S.calc.courses.filter(c => typeof c.grade === "number" && c.units > 0);
  const units = rows.reduce((s,c) => s + c.units, 0);
  const gpa = units > 0 ? rows.reduce((s,c) => s + c.grade * c.units, 0) / units : null;
  const shown = gpa === null ? null : Math.round(gpa*100)/100;   // schools round to 2 decimals
  const grades = rows.map(c => c.grade);
  const worst = grades.length ? (isFive() ? Math.max.apply(null, grades) : Math.min.apply(null, grades)) : null;
  const gpaOk = shown !== null && meetsCutoff(shown);
  const unitsOk = S.minUnits <= 0 || units >= S.minUnits;
  const worstOk = S.worst === null || worst === null || (isFive() ? worst <= S.worst : worst >= S.worst);
  return {rows, units, gpa, shown, worst, gpaOk, unitsOk, worstOk, pass: shown !== null && gpaOk && unitsOk && worstOk};
}

function courseRows(){
  if(!S.calc.courses.length) return '<div class="empty">'+pomFor("pom")+'<p>No courses yet. Tap <b>+ Add course</b> to start.</p></div>';
  return '<ul class="list">' + S.calc.courses.map((c,i) =>
    '<li class="crow" data-cid="'+c.id+'">' +
      '<input class="inp cname" data-c="name" maxlength="40" placeholder="Course '+(i+1)+'" aria-label="Course '+(i+1)+' name" value="'+esc(c.name)+'">' +
      '<div class="field cu"><label>Units</label><input class="inp num" data-c="units" type="number" inputmode="decimal" min="0.5" max="40" step="0.5" aria-label="Course '+(i+1)+' units" value="'+(c.units||"")+'"></div>' +
      '<div class="field cg"><label>Grade</label><select class="inp" data-c="grade" aria-label="Course '+(i+1)+' grade">'+gradeOptions(c.grade)+'</select></div>' +
      '<button type="button" class="x cdel" data-cdel="'+c.id+'" aria-label="Remove course '+(i+1)+'">×</button></li>').join("") + '</ul>';
}

function renderDeans(){
  const keys = termKeys();
  if(!keys.includes(S.calc.term)) S.calc.term = keys.find(k => !hasGpa(k)) || keys[0];
  const cf = fillOf(S.cutoff), th = cf * 2 * Math.PI - Math.PI / 2;
  const tick = '<line class="rtick" x1="'+(70+44*Math.cos(th)).toFixed(1)+'" y1="'+(70+44*Math.sin(th)).toFixed(1)+'" x2="'+(70+64*Math.cos(th)).toFixed(1)+'" y2="'+(70+64*Math.sin(th)).toFixed(1)+'"/>';
  const termOpts = keys.map(k => '<option value="'+k+'"'+(k===S.calc.term?" selected":"")+'>'+termLabel(k)+(hasGpa(k)?" (saved: "+S.gpas[k].toFixed(2)+")":"")+'</option>').join("");
  const html = '<div class="calcgrid">' +
    '<section class="card result" id="result" aria-label="Your result">' +
      '<div class="ringbox"><svg class="ring" viewBox="0 0 140 140" aria-hidden="true"><circle class="rtrack" cx="70" cy="70" r="'+RING_R+'"/>' +
        '<circle class="rfill" id="rfill" cx="70" cy="70" r="'+RING_R+'" stroke-dasharray="'+RING_C.toFixed(2)+'" stroke-dashoffset="'+RING_C.toFixed(2)+'"/>'+tick+'</svg>' +
        '<div class="rnum"><b class="num" id="rgpa">-</b><span>Term GPA</span></div></div>' +
      '<div class="rtext"><div class="rstatus" id="rstatus" role="status" aria-live="polite"></div><ul class="checks" id="rchecks"></ul></div>' +
      '<div class="rsave"><div class="field"><label for="calcTerm">Save to</label><select class="inp" id="calcTerm">'+termOpts+'</select></div>' +
        '<button type="button" class="btn acc" id="saveTerm">Save to term</button></div>' +
      '<p class="hint num rxp" id="rxp"></p>' +
      '<div class="rrules"><span class="pill">'+(isFive()?"1.0-5.0 scale":"4.0 scale")+'</span><span class="pill">Cutoff '+S.cutoff.toFixed(2)+(isFive()?" or lower":"")+'</span>' +
        (S.minUnits>0?'<span class="pill">Min '+S.minUnits+' units</span>':'') + (S.worst!==null?'<span class="pill">Worst grade '+fmtGrade(S.worst)+'</span>':'') +
        '<button type="button" class="btn ghost sm" id="editRules">Edit rules</button></div>' +
    '</section>' +
    '<section class="card coursecard"><div class="cardhead"><h2>Your courses</h2><button type="button" class="btn ghost sm" id="clearCalc">Clear grades</button></div>' +
      courseRows() +
      '<div class="cfoot"><button type="button" class="btn ghost" id="addCourse">+ Add course</button><span class="hint num" id="ctotals"></span></div></section></div>';
  $("#view").innerHTML = html;
  calcWasPass = false;
  updateCalc(true);
}

// Updates the result card in place (called on every keystroke, so it never redraws the inputs)
function updateCalc(first){
  const gEl = $("#rgpa"); if(!gEl) return;
  const r = calcResult(), five = isFive();
  $("#rfill").style.strokeDashoffset = (RING_C * (1 - (r.gpa === null ? 0 : fillOf(r.gpa)))).toFixed(2);
  const card = $("#result");
  card.classList.toggle("pass", r.pass);
  if(r.pass && !calcWasPass && !first){ card.classList.remove("pop"); void card.offsetWidth; card.classList.add("pop"); }
  calcWasPass = r.pass;

  tweenNumber(gEl, r.shown, first);

  let msg;
  if(r.shown === null) msg = "Pick a grade for each course to see your GPA.";
  else if(r.pass) msg = "You made the Dean's List!";
  else if(!r.gpaOk){ const d = Math.abs(S.cutoff - r.shown); msg = (d <= 0.25 ? "So close! " : "Not yet. ") + d.toFixed(2) + " GPA points to go."; }
  else if(!r.unitsOk) msg = "Not yet. You need " + (S.minUnits - r.units) + " more units.";
  else msg = "Not yet. One grade is worse than your limit.";
  const st = $("#rstatus"); if(st.textContent !== msg){ st.textContent = msg; st.classList.remove("swap"); void st.offsetWidth; st.classList.add("swap"); }

  const ck = (ok, text, val) => '<li class="ck '+(ok?"ok":"no")+'"><span class="ckmark" aria-hidden="true">'+(ok?"✓":"✗")+'</span><span class="sr">'+(ok?"Met: ":"Not met: ")+'</span><span class="cktxt">'+text+'</span><b class="num">'+val+'</b></li>';
  let list = ck(r.gpaOk, "GPA " + S.cutoff.toFixed(2) + (five ? " or lower" : " or higher"), r.shown === null ? "-" : r.shown.toFixed(2));
  if(S.minUnits > 0) list += ck(r.unitsOk, "At least " + S.minUnits + " units", r.units);
  if(S.worst !== null) list += ck(r.worstOk, "No grade " + (five ? "worse than " : "below ") + fmtGrade(S.worst), r.worst === null ? "-" : fmtGrade(r.worst));
  $("#rchecks").innerHTML = list;

  $("#ctotals").textContent = r.units + " units, " + S.calc.courses.length + (S.calc.courses.length === 1 ? " course" : " courses");
  $("#rxp").textContent = r.shown === null ? "" : "Saving this term is worth +" + (Math.round(pointsOf(r.gpa)*100) + (r.pass ? 150 : 0)) + " XP";
  $("#saveTerm").disabled = r.shown === null;
}

// Counts the GPA number up or down to its new value
let tweenId = 0;
function tweenNumber(el, to, instant){
  cancelAnimationFrame(tweenId);
  const calm = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  if(to === null){ el.textContent = "-"; el.dataset.v = ""; return; }
  const shown = parseFloat(el.textContent);
  const from = isNaN(shown) ? to : shown;   // start from what is on screen, even if a count was cut short
  el.dataset.v = to;
  if(instant || calm || document.hidden || from === to){ el.textContent = to.toFixed(2); return; }
  const t0 = performance.now(), dur = 350;
  (function step(now){
    const p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3);
    el.textContent = (from + (to - from) * e).toFixed(2);
    if(p < 1) tweenId = requestAnimationFrame(step);
  })(t0);
}

function addCourse(){
  S.calc.courses.push({id:uid8(), name:"", units:3, grade:null});
  save(); renderDeans();
  const names = document.querySelectorAll(".cname"); if(names.length) names[names.length-1].focus();
}
function delCourse(id){ S.calc.courses = S.calc.courses.filter(c => c.id !== id); save(); renderDeans(); }
function clearCalc(){ S.calc.courses.forEach(c => { c.grade = null; }); save(); renderDeans(); toast("Grades cleared"); }

function saveCalcToTerm(){
  const r = calcResult(); if(r.shown === null) return toast("Pick at least one grade first");
  const k = S.calc.term, before = totalXp();
  S.gpas[k] = Math.round(r.gpa*1000)/1000;
  S.deanFlags[k] = r.pass;
  save(); renderAll();
  const gained = totalXp() - before;
  toast("Saved to " + termLabel(k) + (r.pass ? ". Dean's List!" : ".") + (gained > 0 ? " +" + gained + " XP" : ""));
}
