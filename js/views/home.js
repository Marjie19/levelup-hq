/* Home: your companion's room. Cuddle, feed, play, change style, and meet your other companions. */
"use strict";

let petFx = "";   // a one-time animation for the next draw ("eat" or "play")
const SAYS = {
  happy:["Ready to study together?","You're doing great today!","I love this room.","Tell me about your day!"],
  ok:["A snack would be nice.","Want to play for a bit?","I'm here if you need me."],
  sad:["My tummy is rumbling...","I missed you. Can we hang out?","A little love would help."]
};
function say(p){ const a = SAYS[moodOf(p)]; return a[Math.floor(Date.now()/60000) % a.length]; }

function slotHtml(i){
  const p = S.pets[i];
  if(p) return '<button type="button" class="slot'+(p.id === activePet().id ? " on" : "")+'" data-pick="'+p.id+'" aria-label="Switch to '+esc(p.name)+'">'+petSvg(p,{cls:"slotpet"})+'<span>'+esc(p.name)+'</span></button>';
  if(i < slotsUnlocked()) return '<button type="button" class="slot new" id="adopt"><span class="plus" aria-hidden="true">+</span><span>New friend!</span></button>';
  return '<div class="slot locked"><span class="lockic" aria-hidden="true">🔒</span><span>Keep growing</span></div>';
}

function renderHome(){
  const p = activePet(), st = stageOf(p), s = petStats(p), mood = moodOf(p), nx = nextStage(p);
  const growPct = nx ? Math.min(100, (petPoints(p) - st.at) / (nx.at - st.at) * 100) : 100;
  const gift = S.lastGift !== today();
  const nextSlot = SLOT_AT[S.pets.length], g = growth();
  let html = '<section class="room room-'+S.room+'" id="room">' +
    '<div class="roomtop"><span></span>' + (gift ? '<button type="button" class="btn acc sm giftbtn" id="giftBtn">🎁 Daily gift</button>' : '') + '</div>' +
    '<div class="bubble" id="bubble">'+esc(say(p))+'</div>' +
    '<button type="button" class="petstage" id="petBtn" aria-label="Cuddle '+esc(p.name)+'">'+petSvg(p,{cls:"big "+petFx})+'</button><div class="shadow"></div>' +
    '<div class="nameplate"><b>'+esc(p.name)+'</b><span id="plate">'+st.label+', '+MOOD_TEXT[mood]+'</span></div></section>';
  petFx = "";
  html += '<section class="meters" aria-label="How your companion feels">' +
    '<div class="meter"><span>Fullness</span><div class="mbar2"><i id="mHun" class="hun" style="width:'+s.hunger.toFixed(0)+'%"></i></div></div>' +
    '<div class="meter"><span>Happy</span><div class="mbar2"><i id="mJoy" class="joy" style="width:'+s.joy.toFixed(0)+'%"></i></div></div>' +
    '<div class="meter"><span>Growing</span><div class="mbar2"><i class="gro" style="width:'+growPct.toFixed(0)+'%"></i></div></div></section>';
  html += '<div class="acts3"><button type="button" class="act" id="feedBtn"><span aria-hidden="true">🍙</span>Feed</button><button type="button" class="act" id="playBtn"><span aria-hidden="true">🎾</span>Play</button>' +
    '<button type="button" class="act" id="styleBtn"><span aria-hidden="true">🎀</span>Style</button><button type="button" class="act" id="editPetBtn"><span aria-hidden="true">✏️</span>Edit</button></div>';
  html += '<section class="card"><div class="cardhead"><h2>Your companions</h2><span class="hint num">'+S.pets.length+' of '+MAX_PETS+'</span></div><div class="slots">' + [0,1,2].map(slotHtml).join("") + '</div>' +
    (nextSlot !== undefined && g < nextSlot ? '<p class="hint" style="margin:10px 0 0">Next friend arrives as you grow: '+Math.round(g/nextSlot*100)+'% there. Grades, quests and studying all help.</p>' : "") + '</section>';
  $("#view").innerHTML = html;
}

// ----- interactions that do not redraw the page -----
function updateMeters(){
  const p = activePet(), s = petStats(p), h = $("#mHun"), j = $("#mJoy"); if(!h) return;
  h.style.width = s.hunger.toFixed(0) + "%"; j.style.width = s.joy.toFixed(0) + "%";
  $("#plate").textContent = stageOf(p).label + ", " + MOOD_TEXT[moodOf(p)];
}
function cuddleTap(e){
  const p = activePet(); cuddle(p); save();
  const room = $("#room"), r = room.getBoundingClientRect(), h = document.createElement("span");
  h.className = "floaty"; h.textContent = ["💗","✨","💕","⭐"][Math.floor(Math.random()*4)];
  h.style.left = (e.clientX ? e.clientX - r.left : r.width/2) + "px"; h.style.top = (e.clientY ? e.clientY - r.top : r.height/2) + "px";
  room.appendChild(h); setTimeout(() => h.remove(), 1000);
  const svg = $("#petBtn .pet-svg"); svg.classList.remove("wiggle"); void svg.getBoundingClientRect(); svg.classList.add("wiggle");
  updateMeters();
}
function playTap(){
  const p = activePet(), wait = 120000 - (Date.now() - (p.lastPlay || 0));
  if(wait > 0) return toast(p.name + " needs a short rest. Try again in " + Math.ceil(wait/60000) + " min.");
  playWith(p); petFx = "play"; renderAll(); toast(p.name + " had so much fun!");
}
function claimGift(){ S.lastGift = today(); giveTreats(5); save(); renderAll(); toast("Daily gift! +5 🍪"); }
