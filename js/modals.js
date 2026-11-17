/* Pop-up sheets: term GPA, goals, setup, settings, budget */
"use strict";

function modal(html, onReady){
  const m = $("#modal");
  m.innerHTML = '<div class="scrim" id="scrim"><div class="sheet" role="dialog" aria-modal="true">'+html+'</div></div>';
  m.querySelector("#scrim").addEventListener("click", e => { if(e.target.id==="scrim" && S.setup) closeModal(); });
  const f = m.querySelector("input,select,button"); if(f) f.focus();
  if(onReady) onReady(m);
}
function closeModal(){ $("#modal").innerHTML = ""; }
document.addEventListener("keydown", e => { if(e.key==="Escape" && S.setup) closeModal(); });

function openTerm(k){
  const [y,t] = k.split("-");
  const cur = hasGpa(k) ? S.gpas[k] : "";
  modal('<h3>Year '+y+' · Term '+t+'</h3><p class="muted" style="margin:0">Enter your term GPA (0.00 to 4.00). Dean\'s List counts at '+S.cutoff.toFixed(2)+' and up.</p>' +
    '<form id="termForm" class="sheetform"><div class="field"><label for="gpaIn">Term GPA</label><input class="inp num" id="gpaIn" type="number" inputmode="decimal" min="0" max="4" step="0.001" value="'+cur+'" required></div>' +
    '<p id="gpaErr" class="muted" style="margin:0;color:var(--warn)" hidden>GPA must be between 0 and 4.</p>' +
    '<div class="acts">'+(cur!==""?'<button type="button" class="btn ghost" id="clearTerm">Clear</button>':'')+'<button type="button" class="btn ghost" id="cancel">Cancel</button><button class="btn acc" type="submit">Save</button></div></form>', m => {
      m.querySelector("#cancel").onclick = closeModal;
      const c = m.querySelector("#clearTerm"); if(c) c.onclick = () => { delete S.gpas[k]; save(); closeModal(); renderAll(); };
      m.querySelector("#termForm").onsubmit = e => { e.preventDefault();
        const v = parseFloat(m.querySelector("#gpaIn").value);
        if(isNaN(v) || v<0 || v>4){ m.querySelector("#gpaErr").hidden=false; return; }
        const before = totalXp(); S.gpas[k] = Math.round(v*1000)/1000; save(); closeModal(); renderAll();
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
  return '<div class="field"><label for="sName">What should we call you?</label><input class="inp" id="sName" maxlength="30" value="'+esc(S.name)+'" placeholder="Your name"></div>' +
    '<div style="display:flex;gap:8px;flex-wrap:wrap"><div class="field"><label for="sYears">Years in program</label><input class="inp num" id="sYears" type="number" min="1" max="6" value="'+S.years+'"></div>' +
    '<div class="field"><label for="sTpy">Terms per year</label><input class="inp num" id="sTpy" type="number" min="1" max="4" value="'+S.tpy+'"></div>' +
    '<div class="field"><label for="sAge">Your age</label><input class="inp num" id="sAge" type="number" min="10" max="99" value="'+S.age+'"></div></div>' +
    '<div class="field"><label for="sCut">Dean\'s List GPA cutoff</label><input class="inp num" id="sCut" type="number" min="0" max="4" step="0.01" value="'+S.cutoff+'"><span class="muted" style="font-size:.78rem">Check your student handbook and set the exact cutoff for your school.</span></div>';
}
function readSetup(m){
  const n = v => parseFloat(m.querySelector(v).value);
  S.name = m.querySelector("#sName").value.trim();
  const y = n("#sYears"), t = n("#sTpy"), a = n("#sAge"), c = n("#sCut");
  if(y>=1 && y<=6) S.years = Math.round(y);
  if(t>=1 && t<=4) S.tpy = Math.round(t);
  if(a>=10 && a<=99) S.age = Math.round(a);
  if(c>=0 && c<=4) S.cutoff = c;
}
function openSettings(){
  modal('<h3>Settings</h3><p class="hint" style="margin:0">Your data is saved on this device only.</p><form id="setForm" class="sheetform">' + setupFields(false) +
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
