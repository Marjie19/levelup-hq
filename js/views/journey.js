/* Journey tab: stats, the map (terms -> graduation -> life goals), side quests */
"use strict";

const XS = [50, 72, 78, 62, 38, 22, 28];
function renderJourney(){
  const keys = termKeys();
  const nowKey = keys.find(k => !hasGpa(k));
  let html = statsHtml() + segHtml("journey", [["map","Map"],["quests","Side quests"]]);
  html += '<div class="panes" data-show="'+pane.journey+'">';

  // map
  html += '<section class="card pane" data-pane-id="map"><h2>Road to graduation</h2><p class="hint" style="margin:2px 0 0">Tap a term to log your GPA</p><div class="map" id="map"><svg class="trail" id="trail"></svg>';
  let i = 0;
  for(let y=1;y<=S.years;y++){
    html += '<div class="world"><span>Year ' + y + '</span></div>';
    for(let t=1;t<=S.tpy;t++){
      const k = y+"-"+t, x = XS[i % XS.length]; i++;
      let st = "st-lock", inner = "T"+t, chip = "";
      if(hasGpa(k)){ st = isDean(k) ? "st-dean" : "st-done"; inner = S.gpas[k].toFixed(2); chip = isDean(k) ? '<span class="chip dean">Dean\'s List</span>' : '<span class="chip ok">+' + termXp(k) + ' XP</span>'; }
      else if(k === nowKey){ st = "st-now"; chip = '<span class="chip now">You are here</span>'; }
      html += '<div class="stop"><button type="button" class="node '+st+'" style="--x:'+x+'%" data-term="'+k+'" aria-label="Year '+y+' Term '+t+'">' +
        (k===nowKey ? pomFor("avatar") : "") +
        '<span class="dot num">'+inner+'</span><span class="cap">Year '+y+', Term '+t+'</span>'+chip+'</button></div>';
    }
  }
  const allDone = keys.every(hasGpa);
  html += '<div class="stop" style="height:136px"><button type="button" class="node st-grad" style="--x:50%" data-grad="1"><span class="dot">Grad</span><span class="cap">Graduation day</span>' +
    (allDone ? '<span class="chip ok">Unlocked!</span>' : '<span class="chip now">'+(keys.length - keys.filter(hasGpa).length)+' terms to go</span>') + '</button></div>';
  html += '<div class="world"><span>Life quest</span></div>';
  const goals = S.goals.slice().sort((a,b)=>a.age-b.age);
  goals.forEach((g,j) => {
    const x = XS[(i+j) % XS.length];
    html += '<div class="stop"><button type="button" class="node '+(g.done?"st-goaldone":"st-goal")+'" style="--x:'+x+'%" data-goal="'+g.id+'"><span class="dot num">'+(g.done?"✓":g.age)+'</span><span class="cap">'+esc(g.title)+'</span>'+(g.done?'<span class="chip ok">+200 XP</span>':'<span class="chip">by age '+g.age+'</span>')+'</button></div>';
  });
  html += '<button type="button" class="btn ghost addgoal" id="addGoal">+ Add a life goal</button></div></section>';

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
  requestAnimationFrame(drawTrail);
}
function drawTrail(){
  const map = $("#map"), svg = $("#trail"); if(!map||!svg) return;
  const box = map.getBoundingClientRect();
  const pts = [...map.querySelectorAll(".node .dot")].map(d => { const r=d.getBoundingClientRect(); return {x:r.left-box.left+r.width/2, y:r.top-box.top+r.height/2, done:!!d.closest(".st-done,.st-dean,.st-goaldone")}; });
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
window.addEventListener("resize", () => requestAnimationFrame(drawTrail));
