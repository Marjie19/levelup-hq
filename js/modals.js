/* Pop-up sheets: term GPA, goals, setup, settings, budget */
"use strict";

function modal(html, onReady, cls){
  const m = $("#modal");
  m.innerHTML = '<div class="scrim" id="scrim"><div class="sheet'+(cls?" "+cls:"")+'" role="dialog" aria-modal="true">'+html+'</div></div>';
  m.querySelector("#scrim").addEventListener("click", e => { if(e.target.id==="scrim" && S.setup) closeModal(); });
  const f = m.querySelector("input,select,button"); if(f) f.focus();
  if(onReady) onReady(m);
}
function closeModal(){ $("#modal").innerHTML = ""; }
document.addEventListener("keydown", e => { if(e.key==="Escape" && S.setup) closeModal(); });

function openTerm(k){
  const [y,t] = k.split("-");
  const cur = hasGpa(k) ? S.gpas[k] : "";
  modal('<h3>'+esc(termLabel(k))+'</h3><p class="muted" style="margin:0">Enter your term GPA ('+SCALE_RANGE[S.scale][0].toFixed(2)+' to '+SCALE_RANGE[S.scale][1].toFixed(2)+'). Dean\'s List counts at '+S.cutoff.toFixed(2)+(isFive()?' or lower':' and up')+'.</p>' +
    '<form id="termForm" class="sheetform"><div class="field"><label for="gpaIn">Term GPA</label><input class="inp num" id="gpaIn" type="number" inputmode="decimal" min="'+SCALE_RANGE[S.scale][0]+'" max="'+SCALE_RANGE[S.scale][1]+'" step="0.001" value="'+cur+'" required></div>' +
    '<p id="gpaErr" class="muted" style="margin:0;color:var(--warn)" hidden>GPA must be between '+SCALE_RANGE[S.scale][0]+' and '+SCALE_RANGE[S.scale][1]+'.</p>' +
    '<div class="acts">'+(cur!==""?'<button type="button" class="btn ghost" id="clearTerm">Clear</button>':'')+'<button type="button" class="btn ghost" id="cancel">Cancel</button><button class="btn acc" type="submit">Save</button></div></form>', m => {
      m.querySelector("#cancel").onclick = closeModal;
      const c = m.querySelector("#clearTerm"); if(c) c.onclick = () => { delete S.gpas[k]; delete S.deanFlags[k]; save(); closeModal(); renderAll(); };
      m.querySelector("#termForm").onsubmit = e => { e.preventDefault();
        const v = parseFloat(m.querySelector("#gpaIn").value);
        if(isNaN(v) || v<SCALE_RANGE[S.scale][0] || v>SCALE_RANGE[S.scale][1]){ m.querySelector("#gpaErr").hidden=false; return; }
        const before = totalXp(); S.gpas[k] = Math.round(v*1000)/1000; delete S.deanFlags[k]; save(); closeModal(); renderAll();
        const gained = totalXp()-before; toast((isDean(k)?"Dean's List! ":"Term cleared! ") + (gained>0?"+"+gained+" XP":""));
      };
    });
}
function openGoal(id){
  const g = id ? S.goals.find(x=>x.id===id) : {title:"",age:Math.max(S.age+1,21),done:false};
  modal('<h3>'+(id?"Life goal":"New life goal")+'</h3><form id="goalForm" class="sheetform">' +
    '<div class="field"><label for="gTitle">Goal</label><input class="inp" id="gTitle" maxlength="70" value="'+esc(g.title)+'" required></div>' +
    '<div class="field"><label for="gAge">By what age?</label><input class="inp num" id="gAge" type="number" min="1" max="120" value="'+g.age+'" required></div>' +
    (id?'<label style="display:flex;gap:8px;align-items:center;font-weight:700"><input type="checkbox" id="gDone" '+(g.done?"checked":"")+' style="width:20px;height:20px"> Achieved it! (+200 XP)</label>':'') +
    '<div class="acts">'+(id?'<button type="button" class="btn ghost" id="gDel">Delete</button>':'')+'<button type="button" class="btn ghost" id="cancel">Cancel</button><button class="btn acc" type="submit">Save</button></div></form>', m => {
      m.querySelector("#cancel").onclick = closeModal;
      const d = m.querySelector("#gDel"); if(d) d.onclick = () => { S.goals = S.goals.filter(x=>x.id!==id); save(); closeModal(); renderAll(); };
      m.querySelector("#goalForm").onsubmit = e => { e.preventDefault();
        const title = m.querySelector("#gTitle").value.trim(), age = parseInt(m.querySelector("#gAge").value,10);
        if(!title || isNaN(age)) return;
        const wasDone = g.done;
        if(id){ g.title=title; g.age=age; g.done = m.querySelector("#gDone").checked; }
        else S.goals.push({id:uid8(),title,age,done:false});
        save(); closeModal(); renderAll();
        if(id && g.done && !wasDone) toast("Life goal achieved! +200 XP");
      };
    });
}
function openSetup(){
  modal('<div style="display:flex;gap:12px;align-items:center">'+pomFor("pom")+'<h3>Welcome to LevelUp HQ</h3></div>' +
    '<p class="muted" style="margin:0">Set up your journey. You can change all of this later in Settings.</p>' +
    '<form id="setupForm" class="sheetform">' + setupFields(true) +
    '<div class="acts"><button class="btn acc" type="submit">Start my journey</button></div></form>', m => {
      m.querySelector("#setupForm").onsubmit = e => { e.preventDefault(); readSetup(m); S.setup = true; save(); closeModal(); renderAll(); toast("Let's go, " + (S.name||"Player") + "!"); };
    });
}
function setupFields(first){
  const tpl = first
    ? '<div class="field"><label for="sTpl">Your journey</label><select class="inp" id="sTpl">' + TEMPLATES.map(t => '<option value="'+t.id+'"'+(t.id===S.journey.tpl?" selected":"")+'>'+esc(t.name)+", "+esc(t.sub)+'</option>').join("") + '</select><span class="muted" style="font-size:.78rem">You can change it or build your own later, in the Journey tab.</span></div>'
    : '<p class="hint" style="margin:0">To change your journey, theme or pet, tap Customize in the Journey tab.</p>';
  return '<div class="field"><label for="sName">What should we call you?</label><input class="inp" id="sName" maxlength="30" value="'+esc(S.name)+'" placeholder="Your name"></div>' +
    '<div class="field"><label for="sAge">Your age</label><input class="inp num" id="sAge" type="number" min="10" max="99" value="'+S.age+'"></div>' +
    tpl + ruleFields();
}
function readSetup(m){
  const n = v => parseFloat(m.querySelector(v).value);
  S.name = m.querySelector("#sName").value.trim();
  const a = n("#sAge");
  if(a>=10 && a<=99) S.age = Math.round(a);
  const t = m.querySelector("#sTpl"); if(t && t.value !== S.journey.tpl) applyTemplate(t.value);
  readRules(m);
}
function openSettings(){
  modal('<h3>Settings</h3><p class="hint" style="margin:0">Your data is saved on this device only.</p>' + installTip() + '<form id="setForm" class="sheetform">' + setupFields(false) +
    '<div class="acts"><button type="button" class="btn ghost" id="reset" style="margin-right:auto;color:var(--warn)">Reset everything</button><button type="button" class="btn ghost" id="cancel">Cancel</button><button class="btn acc" type="submit">Save</button></div></form>', m => {
      m.querySelector("#cancel").onclick = closeModal;
      let armed = false;
      m.querySelector("#reset").onclick = e => { if(!armed){ armed = true; e.target.textContent = "Tap again to erase all data"; return; } S = fresh(); save(); closeModal(); renderAll(); openSetup(); };
      m.querySelector("#setForm").onsubmit = e => { e.preventDefault(); readSetup(m); save(); closeModal(); renderAll(); };
    });
}
function openBudget(){
  modal('<h3>Monthly budget</h3><form id="bForm" class="sheetform"><div class="field"><label for="bIn">Budget for the month (₱)</label><input class="inp num" id="bIn" type="number" inputmode="decimal" min="0" step="1" value="'+S.budget+'" required></div><div class="acts"><button type="button" class="btn ghost" id="cancel">Cancel</button><button class="btn acc" type="submit">Save</button></div></form>', m => {
    m.querySelector("#cancel").onclick = closeModal;
    m.querySelector("#bForm").onsubmit = e => { e.preventDefault(); const v=parseFloat(m.querySelector("#bIn").value); if(v>=0){ S.budget=v; save(); } closeModal(); renderAll(); };
  });
}
function openQuest(){
  modal('<h3>New side quest</h3><form id="questForm" class="sheetform">' +
    '<div class="field"><label for="qTitle">Quest</label><input class="inp" id="qTitle" maxlength="80" placeholder="e.g. Google Data Analytics cert" required></div>' +
    '<div class="field"><label for="qKind">Type</label><select class="inp" id="qKind"><option value="cert">Certificate (+120 XP)</option><option value="hackathon">Hackathon (+150 XP)</option><option value="project">Project (+100 XP)</option><option value="org">Org / role (+80 XP)</option></select></div>' +
    '<div class="acts"><button type="button" class="btn ghost" id="cancel">Cancel</button><button class="btn acc" type="submit">Add quest</button></div></form>', m => {
      m.querySelector("#cancel").onclick = closeModal;
    });
}
function openExpense(){
  modal('<h3>Add an expense</h3><form id="expForm" class="sheetform">' +
    '<div class="chips" role="group" aria-label="Category">' + CATS.map(c=>'<button type="button" class="chipbtn" data-cat="'+c+'" aria-pressed="'+(c===pickedCat)+'">'+c+'</button>').join("") + '</div>' +
    '<div class="field"><label for="eAmt">Amount (₱)</label><input class="inp num" id="eAmt" type="number" inputmode="decimal" min="0.01" step="0.01" placeholder="150" required></div>' +
    '<div class="field"><label for="eNote">What for?</label><input class="inp" id="eNote" maxlength="60" placeholder="Lunch at Taft"></div>' +
    '<div class="field"><label for="eDate">Date</label><input class="inp" id="eDate" type="date" value="'+today()+'" required></div>' +
    '<p class="hint" style="margin:0">Coming in Phase 2: snap a receipt and this fills itself in.</p>' +
    '<div class="acts"><button type="button" class="btn ghost" id="cancel">Cancel</button><button class="btn acc" type="submit">Add expense</button></div></form>', m => {
      m.querySelector("#cancel").onclick = closeModal;
      m.querySelector("#eAmt").focus();
    });
}
function openWish(){
  modal('<h3>New wish</h3><form id="wishForm" class="sheetform">' +
    '<div class="field"><label for="wName">Item</label><input class="inp" id="wName" maxlength="60" placeholder="e.g. Kate Spade bag" required></div>' +
    '<div class="field"><label for="wPrice">Price (₱)</label><input class="inp num" id="wPrice" type="number" inputmode="decimal" min="1" step="0.01" required></div>' +
    '<div class="acts"><button type="button" class="btn ghost" id="cancel">Cancel</button><button class="btn acc" type="submit">Add wish</button></div></form>', m => {
      m.querySelector("#cancel").onclick = closeModal;
    });
}
function openXpHelp(){
  modal('<div style="display:flex;gap:12px;align-items:center">'+pomFor("pom")+'<h3>How XP works</h3></div>' +
    '<ul class="xplist"><li><b>Each term</b> gives GPA × 100 XP</li><li><b>Dean\'s List</b> adds +150</li><li><b>Side quests</b> give +80 to +150</li><li><b>Life goals</b> give +200</li><li><b>Wishlist goals</b> give +50</li></ul>' +
    '<p class="muted" style="margin:0">Every '+PER_LEVEL+' XP is a new level.</p><div class="acts"><button type="button" class="btn acc" id="cancel">Got it</button></div>', m => {
      m.querySelector("#cancel").onclick = closeModal;
    });
}

// Shows how to install the app, unless it is already installed
function installTip(){
  const installed = (window.matchMedia && matchMedia("(display-mode: standalone)").matches) || navigator.standalone;
  if(installed) return '<p class="tip">You are using the installed app. Your data lives in this app only.</p>';
  return '<p class="tip"><b>Install on your phone:</b> open this page in Safari, tap the Share button, then <b>Add to Home Screen</b>. The installed app keeps its own data, separate from Safari.</p>';
}

// Dean's List rule fields. Used by Setup, Settings and the rules sheet.
function worstOptions(scale, selected){
  const steps = GRADE_STEPS[scale];
  return '<option value="">No limit</option>' + steps.map(g => '<option value="'+g+'"'+(selected===g?" selected":"")+'>'+(scale==="5"?g.toFixed(2):g.toFixed(1))+'</option>').join("");
}
function ruleFields(){
  return '<div class="field"><label for="sScale">Grading scale</label><select class="inp" id="sScale">' +
      '<option value="4"'+(isFive()?"":" selected")+'>4.0 scale (4.0 is the best)</option>' +
      '<option value="5"'+(isFive()?" selected":"")+'>1.0 to 5.0 scale (1.0 is the best)</option></select></div>' +
    '<div style="display:flex;gap:8px;flex-wrap:wrap"><div class="field"><label for="sCut">Dean\'s List GPA cutoff</label><input class="inp num" id="sCut" type="number" inputmode="decimal" step="0.01" min="'+SCALE_RANGE[S.scale][0]+'" max="'+SCALE_RANGE[S.scale][1]+'" value="'+S.cutoff+'"></div>' +
    '<div class="field"><label for="sUnits">Minimum units</label><input class="inp num" id="sUnits" type="number" inputmode="decimal" min="0" max="40" step="0.5" value="'+S.minUnits+'"></div></div>' +
    '<div class="field"><label for="sWorst">Worst grade allowed</label><select class="inp" id="sWorst">'+worstOptions(S.scale, S.worst)+'</select>' +
    '<span class="muted" style="font-size:.78rem">Many schools drop you from the list if any grade is worse than this. Check your student handbook for the exact rules.</span></div>';
}
// Turns grades from one scale into the other (4.0 and 1.0 line up with 1.0 and 4.0, so it is 5 minus the grade)
function convertScale(){
  const flip = g => Math.round((5 - g)*1000)/1000;
  Object.keys(S.gpas).forEach(k => { S.gpas[k] = flip(S.gpas[k]); });
  S.calc.courses.forEach(c => { if(typeof c.grade === "number") c.grade = flip(c.grade); });
}
function readRules(m){
  const num = v => parseFloat(m.querySelector(v).value);
  const sc = m.querySelector("#sScale").value === "5" ? "5" : "4";
  if(sc !== S.scale){ convertScale(); S.scale = sc; }
  const c = num("#sCut");
  if(c >= SCALE_RANGE[sc][0] && c <= SCALE_RANGE[sc][1]) S.cutoff = c;
  const u = num("#sUnits");
  if(u >= 0 && u <= 40) S.minUnits = Math.round(u*2)/2;
  const w = m.querySelector("#sWorst").value;
  S.worst = w === "" ? null : parseFloat(w);
}
function openRules(){
  modal('<h3>Dean\'s List rules</h3><p class="muted" style="margin:0">Every school is different. Set yours here.</p><form id="rulesForm" class="sheetform">' + ruleFields() +
    '<div class="acts"><button type="button" class="btn ghost" id="cancel">Cancel</button><button class="btn acc" type="submit">Save rules</button></div></form>', m => {
      m.querySelector("#cancel").onclick = closeModal;
      m.querySelector("#rulesForm").onsubmit = e => { e.preventDefault(); readRules(m); save(); closeModal(); renderAll(); toast("Rules saved"); };
    });
}
