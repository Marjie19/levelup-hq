/* Header: slim level bar, mascot, and the 3 stats (shown in Journey) */
"use strict";

let prevXp = null;
// The Pom naps between 10pm and 6am.
function isNight(){ const h = new Date().getHours(); return h >= 22 || h < 6; }
function pomFor(cls){ return pomSvg(cls + (isNight() ? " sleepy" : "")); }

function renderHeader(){
  $("#hi").textContent = "Hi, " + (S.name || "Player") + "!";
  const xp = totalXp(), lvl = levelOf(xp), into = xp % PER_LEVEL;
  $("#lvl").textContent = lvl;
  $("#ltitle").textContent = titleOf(lvl);
  $("#xpbar").style.width = (into/PER_LEVEL*100)+"%";
  $("#xpbarWrap").setAttribute("aria-valuenow", into);
  $("#xpline").textContent = into + " / " + PER_LEVEL + " XP to level " + (lvl+1);

  $("#topPom").innerHTML = pomFor("pom");
  if(!$("#brandPom").innerHTML) $("#brandPom").innerHTML = pomFor("pom");
  // Little hop when you earn XP
  if(prevXp !== null && xp > prevXp){ const p = $("#topPom"); p.classList.remove("hop"); void p.offsetWidth; p.classList.add("hop"); }
  prevXp = xp;

  if(prevLevel !== null && lvl > prevLevel) setTimeout(()=>toast("Level up! You're now Level " + lvl + " · " + titleOf(lvl)), 900);
  prevLevel = lvl;
}

function statsHtml(){
  const keys = termKeys();
  return '<div class="stats">' +
    '<div class="stat s-plum"><b class="num">'+keys.filter(hasGpa).length+'<small>/'+keys.length+'</small></b><span>Terms cleared</span></div>' +
    '<div class="stat s-apri"><b class="num">'+keys.filter(isDean).length+'</b><span>Dean\'s List</span></div>' +
    '<div class="stat s-good"><b class="num">'+S.quests.filter(q=>q.done).length+'</b><span>Quests done</span></div></div>';
}
