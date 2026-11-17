/* Header: your companion, how they feel, your Treats. Also the 3 stats shown in Journey. */
"use strict";

let prevGrowth = null, lastStages = {};
function pomFor(cls){ return pomSvg(cls); }

function renderHeader(){
  const p = activePet(), st = stageOf(p), s = petStats(p), mood = moodOf(p), happy = Math.round((s.hunger + s.joy) / 2);
  $("#hi").textContent = "Hi, " + (S.name || "Player") + "!";
  $("#stageLine").textContent = p.name + " · " + st.label;
  $("#xpbar").style.width = happy + "%";
  $("#xpbarWrap").setAttribute("aria-valuenow", happy);
  $("#xpline").textContent = p.name + " is " + MOOD_TEXT[mood] + ".";
  $("#treatPill").innerHTML = '🍪 <b class="num">' + treats() + '</b>';
  $("#topPom").innerHTML = avatarHtml();
  $("#brandPom").innerHTML = petSvg(p, {cls:"pom"});
  // Little hop when you earn something
  const g = growth();
  if(prevGrowth !== null && g > prevGrowth){ const el = $("#topPom"); el.classList.remove("hop"); void el.offsetWidth; el.classList.add("hop"); }
  prevGrowth = g;
  // A companion grew up
  S.pets.forEach(x => {
    const id = stageOf(x).id;
    if(lastStages[x.id] && lastStages[x.id] !== id) setTimeout(() => { toast(x.name + " grew into a " + stageOf(x).label.toLowerCase() + "!"); confetti($("#topPom"), 40); }, 900);
    lastStages[x.id] = id;
  });
}

function statsHtml(){
  const keys = termKeys();
  return '<div class="stats">' +
    '<div class="stat s-plum"><b class="num">'+keys.filter(hasGpa).length+'<small>/'+keys.length+'</small></b><span>Terms cleared</span></div>' +
    '<div class="stat s-apri"><b class="num">'+keys.filter(isDean).length+'</b><span>Dean\'s List</span></div>' +
    '<div class="stat s-good"><b class="num">'+S.quests.filter(q=>q.done).length+'</b><span>Quests done</span></div></div>';
}
