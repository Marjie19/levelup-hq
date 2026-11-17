/* App start + tab routing */
"use strict";

function currentTab(){
  const h = location.hash.slice(1);
  if(h === "deans"){ pane.school = "grades"; return "school"; }     // old links still work
  if(h === "planner"){ pane.school = "planner"; return "school"; }
  return ["home","journey","study","school","money","profile"].includes(h) ? h : "home";
}
let lastTab = null;
function renderAll(){
  renderHeader();
  const tab = currentTab();
  $("#view").classList.toggle("enter", tab !== lastTab); lastTab = tab;   // pages settle in only when you switch tabs
  document.querySelectorAll(".tab").forEach(t => t.setAttribute("aria-selected", t.dataset.tab===tab));
  if(tab==="home") renderHome(); else if(tab==="journey") renderJourney(); else if(tab==="school") renderSchool(); else if(tab==="study") renderStudy(); else if(tab==="money") renderMoney(); else if(tab==="profile") renderProfile();;
  mountTip(tab);
}
window.addEventListener("hashchange", () => { renderAll(); window.scrollTo(0,0); });
applyLook();
renderAll();
initStorage();
