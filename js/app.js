/* App start + tab routing */
"use strict";

function currentTab(){ const h = location.hash.slice(1); return ["home","journey","deans","money","planner"].includes(h) ? h : "home"; }
function renderAll(){
  renderHeader();
  const tab = currentTab();
  document.querySelectorAll(".tab").forEach(t => t.setAttribute("aria-selected", t.dataset.tab===tab));
  if(tab==="home") renderHome(); else if(tab==="journey") renderJourney(); else if(tab==="deans") renderDeans(); else if(tab==="money") renderMoney(); else renderPlanner();
}
window.addEventListener("hashchange", renderAll);
renderAll();
initStorage();
