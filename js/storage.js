/* Storage: where your data is saved */
"use strict";

// Saves your data in this browser (localStorage).
// Phase 3 will add login + cloud sync so laptop and iPhone share the same data.
function setSync(t){ const el = document.getElementById("sync"); if(el) el.textContent = t; }
function saveLocal(){ try{ localStorage.setItem(LS_KEY, JSON.stringify(S)); }catch(e){} }
function save(){
  S.updated = Date.now();
  saveLocal();
}
function initStorage(){
  setSync("Saved on this device");
  if(!S.setup) setTimeout(()=>{ if(!S.setup && !$("#modal").innerHTML){ if(S.welcomed) openSetup(); else openWelcome(); } }, 400);
}
