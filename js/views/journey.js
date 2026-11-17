/* Journey tab: stats, the map (your stops, then life goals), side quests, and the pet that walks along the road */
"use strict";

const XS = [50, 72, 78, 62, 38, 22, 28];
function themeOf(){ return THEMES.find(t => t.id === S.theme) || THEMES[0]; }
function stopIndex(id){ return S.journey.stops.findIndex(s => s.id === id); }
function nowStopId(){ const s = S.journey.stops.find(x => !stopDone(x)); return s ? s.id : null; }
// Where the pet should stand: the first stop you have not finished, or the last stop if you finished everything.
function petTargetId(){ const n = nowStopId(), st = S.journey.stops; return n || (st.length ? st[st.length-1].id : null); }
function petHtml(){
  const p = PETS.find(x => x.id === S.pet.type) || PETS[0];
  return p.emoji ? '<span class="petemo avatar">'+p.emoji+'</span>' : pomFor("avatar");
}
function journeyName(){
  const t = TEMPLATES.find(x => x.id === S.journey.tpl);
  return t ? (t.sub.length > 30 ? t.name : t.name + ", " + t.sub) : "My own journey";
}

function renderJourney(){
  const stops = S.journey.stops, nowId = nowStopId(), th = themeOf();
  const termsLeft = termKeys().filter(k => !hasGpa(k)).length;
  let html = statsHtml() + segHtml("journey", [["map","Map"],["quests","Side quests"]]);
  html += '<div class="panes" data-show="'+pane.journey+'">';

  html += '<section class="card pane" data-pane-id="map"><div class="cardhead"><div><h2>Road to graduation</h2><p class="hint" style="margin:2px 0 0">'+esc(journeyName())+'</p></div>' +
    '<button type="button" class="btn ghost sm" id="customizeJourney">Customize</button></div>' +
    '<div class="map theme-'+th.id+'" id="map"><svg class="trail" id="trail"></svg>';
  let i = 0, termN = 0, lastGroup = "";
  stops.forEach(s => {
    const x = XS[i % XS.length], here = s.id === nowId; i++;
    if(s.group && s.group !== lastGroup){ html += '<div class="world"><span>'+esc(s.group)+'</span></div>'; lastGroup = s.group; }
    const decor = th.decor.length && i % 2 === 0 ? '<span class="decor" aria-hidden="true" style="'+(x < 50 ? "right:6%" : "left:6%")+';--d:'+(i%5)*.6+'s">'+th.decor[i % th.decor.length]+'</span>' : "";
    const sid = ' data-sid="'+esc(s.id)+'"';
    if(s.kind === "term"){
      termN++;
      let st = "st-lock", inner = esc(s.short || "T"+termN), chip = "";
      if(hasGpa(s.id)){ st = isDean(s.id) ? "st-dean" : "st-done"; inner = S.gpas[s.id].toFixed(2); chip = isDean(s.id) ? '<span class="chip dean">Dean\'s List</span>' : '<span class="chip ok">+' + termXp(s.id) + ' XP</span>'; }
      else if(here){ st = "st-now"; chip = '<span class="chip now">You are here</span>'; }
      html += '<div class="stop">'+decor+'<button type="button" class="node '+st+'" style="--x:'+x+'%"'+sid+' data-term="'+esc(s.id)+'" aria-label="'+esc(s.label)+'">' +
        '<span class="dot num">'+inner+'</span><span class="cap">'+esc(s.label)+'</span>'+chip+'</button></div>';
    } else if(s.kind === "grad"){
      const allDone = termsLeft === 0;
      html += '<div class="stop" style="height:136px">'+decor+'<button type="button" class="node st-grad" style="--x:50%"'+sid+' data-grad="1"><span class="dot">Grad</span><span class="cap">'+esc(s.label)+'</span>' +
        (allDone ? '<span class="chip ok">Unlocked!</span>' : '<span class="chip now">'+termsLeft+' terms to go</span>') + '</button></div>';
    } else {
      const chip = s.done ? '<span class="chip ok">+'+(s.xp||0)+' XP</span>' : here ? '<span class="chip now">You are here</span>' : '<span class="chip">'+(s.xp||0)+' XP</span>';
      html += '<div class="stop">'+decor+'<button type="button" class="node '+(s.done?"st-miledone":"st-mile")+'" style="--x:'+x+'%"'+sid+' data-mile="'+esc(s.id)+'" aria-label="'+esc(s.label)+'">' +
        '<span class="dot">'+(s.done ? "✓" : esc(s.icon || "⭐"))+'</span><span class="cap">'+esc(s.label)+'</span>'+chip+'</button></div>';
    }
  });
  html += '<div class="world"><span>Life quest</span></div>';
  const goals = S.goals.slice().sort((a,b)=>a.age-b.age);
  goals.forEach((g,j) => {
    const x = XS[(i+j) % XS.length];
    html += '<div class="stop"><button type="button" class="node '+(g.done?"st-goaldone":"st-goal")+'" style="--x:'+x+'%" data-goal="'+g.id+'"><span class="dot num">'+(g.done?"✓":g.age)+'</span><span class="cap">'+esc(g.title)+'</span>'+(g.done?'<span class="chip ok">+200 XP</span>':'<span class="chip">by age '+g.age+'</span>')+'</button></div>';
  });
  html += '<button type="button" class="btn ghost addgoal" id="addGoal">+ Add a life goal</button><div class="pet" id="pet" aria-hidden="true">'+petHtml()+'</div></div></section>';

  // side quests
  html += '<section class="card pane" data-pane-id="quests"><div class="cardhead"><h2>Side quests</h2><span class="headbtns"><button type="button" class="round" id="xpHelp" aria-label="How XP works">?</button><button type="button" class="btn acc sm" id="addQuest">+ Quest</button></span></div>';
  if(!S.quests.length) html += '<div class="empty">'+pomFor("pom")+'<p>No side quests yet. Add the cert, hackathon or project you\'re working on to start earning XP.</p></div>';
  else {
    html += '<ul class="list">';
    S.quests.slice().sort((a,b)=>a.done-b.done).forEach(q => {
      html += '<li class="row'+(q.done?" done":"")+'"><button type="button" class="check" aria-pressed="'+q.done+'" data-qtoggle="'+q.id+'" aria-label="Mark done">'+(q.done?"✓":"")+'</button>' +
        '<div class="grow"><div class="t">'+esc(q.title)+'</div><div class="s">'+QUEST_LABEL[q.kind]+(q.done?", completed":", in progress")+'</div></div>' +
        '<span class="pill xp">+'+(QUEST_XP[q.kind]||80)+' XP</span><button type="button" class="x" data-qdel="'+q.id+'" aria-label="Delete">×</button></li>';
    });
    html += '</ul>';
  }
  html += '</section></div>';
  $("#view").innerHTML = html;
  requestAnimationFrame(afterJourneyDraw);
}

// ----- trail -----
function drawTrail(){
  const map = $("#map"), svg = $("#trail"); if(!map||!svg) return;
  const box = map.getBoundingClientRect();
  const pts = [...map.querySelectorAll(".node .dot")].map(d => { const r=d.getBoundingClientRect(); return {x:r.left-box.left+r.width/2, y:r.top-box.top+r.height/2, done:!!d.closest(".st-done,.st-dean,.st-goaldone,.st-miledone")}; });
  svg.setAttribute("viewBox","0 0 "+box.width+" "+box.height);
  let solid="", dash="";
  for(let i=1;i<pts.length;i++){
    const a=pts[i-1], b=pts[i], my=(a.y+b.y)/2;
    const seg = "M"+a.x+" "+a.y+" C"+a.x+" "+my+" "+b.x+" "+my+" "+b.x+" "+b.y+" ";
    if(a.done && b.done) solid += seg; else dash += seg;
  }
  svg.innerHTML = '<path d="'+dash+'" fill="none" stroke="var(--line)" stroke-width="6" stroke-dasharray="2 12" stroke-linecap="round"/>' +
                  '<path d="'+solid+'" fill="none" stroke="var(--good)" stroke-width="6" stroke-linecap="round" opacity=".55"/>';
}

// ----- the pet -----
let petAnim = 0;
function dotCenter(id){
  const map = $("#map"), d = map && map.querySelector('[data-sid="'+id+'"] .dot'); if(!d) return null;
  const b = map.getBoundingClientRect(), r = d.getBoundingClientRect();
  return {x:r.left-b.left+r.width/2, y:r.top-b.top+r.height/2, w:b.width};
}
// The pet stands beside the dot, on whichever side has more room
function petSpot(c){ return {x: c.x + (c.x > c.w/2 ? -1 : 1) * 54 - 20, y: c.y - 18}; }
function setPet(x, y){ const p = $("#pet"); if(p) p.style.transform = "translate("+x.toFixed(1)+"px,"+y.toFixed(1)+"px)"; }
function placePet(){
  const c = dotCenter(S.petAt || petTargetId()); if(!c) return;
  const s = petSpot(c); setPet(s.x, s.y);
}
function afterJourneyDraw(){
  drawTrail();
  const target = petTargetId(); if(!target) return;
  if(!S.petAt || stopIndex(S.petAt) < 0){ S.petAt = target; save(); return placePet(); }
  if(S.petAt === target) return placePet();
  walkPet(S.petAt, target);
}
// The pet walks along the trail from one stop to the next
function walkPet(fromId, toId){
  const a = dotCenter(fromId), b = dotCenter(toId);
  const forward = stopIndex(toId) > stopIndex(fromId);
  const arrive = () => {
    S.petAt = toId; save(); placePet();
    const s = S.journey.stops[stopIndex(toId)];
    if(forward && s) toast(S.pet.name + " reached " + s.label + "!");
  };
  const calm = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  if(!a || !b || calm || document.hidden) return arrive();
  cancelAnimationFrame(petAnim);
  const start = petSpot(a), end = petSpot(b), my = (a.y + b.y) / 2;
  const dist = Math.hypot(b.x - a.x, b.y - a.y), dur = Math.min(1800, 700 + dist * 1.1);
  const node = $('#map [data-sid="'+toId+'"]'); if(node) node.scrollIntoView({block:"center", behavior:"smooth"});
  setPet(start.x, start.y);
  const t0 = performance.now();
  (function step(now){
    if(!$("#pet")) return;
    const p = Math.min(1, (now - t0) / dur), t = p < .5 ? 2*p*p : 1 - Math.pow(-2*p + 2, 2) / 2, u = 1 - t;
    // same curve as the trail: from the old dot, down to the middle, then to the new dot
    const cx = u*u*u*a.x + 3*u*u*t*a.x + 3*u*t*t*b.x + t*t*t*b.x;
    const cy = u*u*u*a.y + 3*u*u*t*my + 3*u*t*t*my + t*t*t*b.y;
    const off = (start.x - a.x) + ((end.x - b.x) - (start.x - a.x)) * t;   // slides from the old side offset to the new one
    const hop = Math.abs(Math.sin(p * Math.PI * Math.max(2, dist / 45))) * 8;
    setPet(cx + off, cy - 18 - hop);
    if(p < 1) petAnim = requestAnimationFrame(step); else arrive();
  })(t0);
}
window.addEventListener("resize", () => requestAnimationFrame(() => { drawTrail(); placePet(); }));
