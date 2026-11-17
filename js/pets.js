/* Companions: the art (drawn in code so every color can change), care rules, stages and Treats.
   A companion is {id, name, species, m, a, s, acc, hunger, joy, t, care, g0}.
   m = main color (fur, hair, body). a = accent (ears, shirt). s = skin (people only). */
"use strict";

// ---------- choices ----------
const KINDS = [{id:"person", label:"Person", emoji:"🧑"}, {id:"animal", label:"Animal", emoji:"🐾"}, {id:"other", label:"Something else", emoji:"✨"}];
const MAIN_COLORS = ["#f7a94f","#f3dfc1","#a9744d","#b9b4c7","#4a4458","#f6a5c0","#8ec5f0","#9fe0c0","#c7b3f5"];
const ACCENT_COLORS = ["#d9772a","#ff8fa3","#6a4bd6","#3aa6a0","#f2c94c","#e5635b","#3c4a8a","#ffffff"];
const HAIR_COLORS = ["#2b2430","#6b4226","#9a3f2b","#e8c46a","#f08fb7","#5b8fd9","#8a6bd6"];
const SKIN_COLORS = ["#ffe0c7","#f3c9a1","#d9a374","#a9744d","#7a4a2e","#5a3622"];

const FOODS = [
  {id:"fruit", emoji:"🍎", name:"Fruit", cost:2, hunger:20, joy:0},
  {id:"rice", emoji:"🍙", name:"Rice ball", cost:4, hunger:40, joy:0},
  {id:"tea", emoji:"🧋", name:"Milk tea", cost:6, hunger:20, joy:20},
  {id:"cake", emoji:"🍰", name:"Cake slice", cost:8, hunger:30, joy:35},
  {id:"feast", emoji:"🍱", name:"Feast", cost:12, hunger:70, joy:20}
];
const ACCS = [
  {id:"none", name:"Nothing", emoji:"🚫", cost:0}, {id:"bow", name:"Bow", emoji:"🎀", cost:8}, {id:"flower", name:"Flower", emoji:"🌸", cost:8},
  {id:"scarf", name:"Scarf", emoji:"🧣", cost:12}, {id:"glasses", name:"Glasses", emoji:"👓", cost:14}, {id:"cap", name:"Cap", emoji:"🧢", cost:14},
  {id:"headphones", name:"Headphones", emoji:"🎧", cost:18}, {id:"partyhat", name:"Party hat", emoji:"🥳", cost:20}, {id:"crown", name:"Crown", emoji:"👑", cost:40}
];
const ROOMS = [
  {id:"cozy", name:"Cozy room", emoji:"🛋️", cost:0}, {id:"garden", name:"Garden", emoji:"🌳", cost:20}, {id:"beach", name:"Beach", emoji:"🏖️", cost:25},
  {id:"library", name:"Library", emoji:"📚", cost:25}, {id:"space", name:"Space", emoji:"🪐", cost:30}
];
// A companion grows with everything you do (grades, quests, care). Growth points decide the stage.
const STAGES = [{id:"baby", label:"Baby", at:0, scale:.72}, {id:"kid", label:"Kid", at:250, scale:.84}, {id:"teen", label:"Teen", at:800, scale:.94}, {id:"grown", label:"Grown", at:1800, scale:1}];
// More companions unlock as your total growth rises: the 1st at the start, then these.
const SLOT_AT = [0, 1000, 3000];
const MAX_PETS = 3;
const NAME_IDEAS = ["Mochi","Pudding","Biscuit","Tofu","Nori","Pip","Luna","Kiko","Bean","Miso","Sesame","Ube","Pandan","Sunny","Clover","Toast","Boba","Maya","Kuya Bo","Ate Lin"];

// ---------- the art ----------
function face(mood, x, ey, sp, my, ink){
  const k = ink || "#2a1a10";
  let eyes;
  if(mood === "sleepy") eyes = '<path class="eyes-shut" d="M'+(x-sp-4)+' '+ey+' q4 3.5 8 0 M'+(x+sp-4)+' '+ey+' q4 3.5 8 0" stroke="'+k+'" stroke-width="2.4" fill="none" stroke-linecap="round"/>';
  else eyes = '<g class="eyes-open"><circle cx="'+(x-sp)+'" cy="'+ey+'" r="3.6" fill="'+k+'"/><circle cx="'+(x+sp)+'" cy="'+ey+'" r="3.6" fill="'+k+'"/>' +
    '<circle cx="'+(x-sp+1.1)+'" cy="'+(ey-1.2)+'" r="1.1" fill="#fff"/><circle cx="'+(x+sp+1.1)+'" cy="'+(ey-1.2)+'" r="1.1" fill="#fff"/></g>';
  const brows = mood === "sad" ? '<path d="M'+(x-sp-4)+' '+(ey-7)+' l7 2.5 M'+(x+sp+4)+' '+(ey-7)+' l-7 2.5" stroke="'+k+'" stroke-width="2" stroke-linecap="round" fill="none"/>' : "";
  let mouth;
  if(mood === "happy") mouth = '<path d="M'+(x-5.5)+' '+my+' q5.5 8 11 0z" fill="#e8626f" stroke="'+k+'" stroke-width="2" stroke-linejoin="round"/>';
  else if(mood === "sad") mouth = '<path d="M'+(x-4.5)+' '+(my+3)+' q4.5 -5 9 0" fill="none" stroke="'+k+'" stroke-width="2.2" stroke-linecap="round"/>';
  else mouth = '<path d="M'+(x-5)+' '+my+' q5 4.5 10 0" fill="none" stroke="'+k+'" stroke-width="2.2" stroke-linecap="round"/>';
  const blush = mood !== "sad" ? '<ellipse cx="'+(x-sp-6)+'" cy="'+(my-3)+'" rx="3.6" ry="2.4" fill="#ff8fa3" opacity=".5"/><ellipse cx="'+(x+sp+6)+'" cy="'+(my-3)+'" rx="3.6" ry="2.4" fill="#ff8fa3" opacity=".5"/>' : "";
  return blush + eyes + brows + mouth;
}
const circ = (x, y, r, f) => '<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+f+'"/>';
const elli = (x, y, rx, ry, f) => '<ellipse cx="'+x+'" cy="'+y+'" rx="'+rx+'" ry="'+ry+'" fill="'+f+'"/>';
const tri = (a, b, c, f) => '<path d="M'+a+' L'+b+' L'+c+'Z" fill="'+f+'"/>';

// head = where hats and glasses go: x,y = centre of head, r = radius, ey = eye height, sp = eye spacing
const SPECIES = {
  pom:{kind:"animal", label:"Pom", draw:(c, mood) => ({head:{x:50,y:54,r:31,ey:50,sp:12},
    svg:[[19,46,14.6],[81,46,14.6],[25,71,14.6],[75,71,14.6],[50,83,14.6],[33,27,12.5],[67,27,12.5]].map(p => circ(p[0],p[1],p[2],c.m)).join("") +
      tri("23 31","31 6","46 25",c.a) + tri("54 25","69 6","77 31",c.a) + circ(50,54,31,c.m) + elli(50,65,19,15.6,"#ffe3c2") + face(mood,50,50,12,66) + elli(50,61,5,3.6,"#2a1a10")})},
  cat:{kind:"animal", label:"Cat", draw:(c, mood) => ({head:{x:50,y:56,r:30,ey:54,sp:12},
    svg:elli(50,90,24,13,c.m) + tri("22 44","27 12","47 30",c.m) + tri("78 44","73 12","53 30",c.m) + tri("28 38","30 20","41 31",c.a) + tri("72 38","70 20","59 31",c.a) +
      circ(50,56,30,c.m) + elli(50,67,13,8.5,"#fff7ee") + '<path d="M18 62 l-10 -2 M18 68 l-10 3 M82 62 l10 -2 M82 68 l10 3" stroke="#2a1a10" stroke-width="1.4" stroke-linecap="round"/>' + face(mood,50,54,12,70) + tri("46 61","54 61","50 66","#ff8fa3")})},
  bunny:{kind:"animal", label:"Bunny", draw:(c, mood) => ({head:{x:50,y:62,r:26,ey:60,sp:11},
    svg:elli(50,91,22,11,c.m) + elli(36,26,8.5,23,c.m) + elli(64,26,8.5,23,c.m) + elli(36,28,4.2,17,c.a) + elli(64,28,4.2,17,c.a) +
      circ(50,62,26,c.m) + elli(50,70,11,8,"#fff7ee") + face(mood,50,60,11,73) + elli(50,66,3.4,2.4,"#ff8fa3")})},
  bear:{kind:"animal", label:"Bear", draw:(c, mood) => ({head:{x:50,y:56,r:30,ey:52,sp:13},
    svg:elli(50,90,25,13,c.m) + circ(26,29,11,c.m) + circ(74,29,11,c.m) + circ(26,29,5.5,c.a) + circ(74,29,5.5,c.a) + circ(50,56,30,c.m) +
      elli(50,66,14,10.5,"#ffe8cf") + face(mood,50,52,13,72) + elli(50,62,4.4,3.2,"#2a1a10")})},
  fox:{kind:"animal", label:"Fox", draw:(c, mood) => ({head:{x:50,y:57,r:29,ey:54,sp:12},
    svg:elli(50,91,23,12,c.m) + tri("20 46","24 10","46 32",c.m) + tri("80 46","76 10","54 32",c.m) + tri("26 38","27 20","39 31",c.a) + tri("74 38","73 20","61 31",c.a) +
      circ(50,57,29,c.m) + tri("21 62","50 86","50 62","#fff7ee") + tri("79 62","50 86","50 62","#fff7ee") + face(mood,50,54,12,71) + elli(50,66,3.6,2.8,"#2a1a10")})},

  "person-short":{kind:"person", label:"Short hair", draw:(c, mood) => person(c, mood, '<path d="M27 48 q-1 -30 23 -30 q24 0 23 30 q-8 -14 -23 -14 q-15 0 -23 14z" fill="'+c.m+'"/>')},
  "person-long":{kind:"person", label:"Long hair", draw:(c, mood) => person(c, mood, '<path d="M26 52 q-2 -34 24 -34 q26 0 24 34 v28 q-6 4 -12 0 v-26 h-24 v26 q-6 4 -12 0z" fill="'+c.m+'"/>', '<path d="M28 46 q-1 -26 22 -26 q23 0 22 26 q-12 -12 -22 -12 q-10 0 -22 12z" fill="'+c.m+'"/>')},
  "person-bun":{kind:"person", label:"Bun", draw:(c, mood) => person(c, mood, circ(50,17,9,c.m) + '<path d="M27 48 q-1 -30 23 -30 q24 0 23 30 q-8 -14 -23 -14 q-15 0 -23 14z" fill="'+c.m+'"/>')},
  "person-curly":{kind:"person", label:"Curly", draw:(c, mood) => person(c, mood, [[30,42,10],[38,28,11],[52,23,11],[65,28,11],[72,42,10],[28,56,8],[72,56,8]].map(p => circ(p[0],p[1],p[2],c.m)).join(""))},

  blob:{kind:"other", label:"Jelly", draw:(c, mood) => ({head:{x:50,y:62,r:31,ey:64,sp:12},
    svg:'<path d="M12 84 q-2 -42 38 -46 q40 4 38 46 q-1 10 -13 10 h-50 q-12 0 -13 -10z" fill="'+c.m+'"/>' + elli(34,52,9,5,"#ffffff").replace('/>',' opacity=".4"/>') + face(mood,50,66,13,79)})},
  robot:{kind:"other", label:"Robot", draw:(c, mood) => ({head:{x:50,y:48,r:27,ey:50,sp:11},
    svg:'<rect x="30" y="74" width="40" height="22" rx="8" fill="'+c.m+'"/><rect x="43" y="68" width="14" height="8" fill="#8d879c"/><path d="M50 22 v-10" stroke="#8d879c" stroke-width="3"/>' + circ(50,10,4.5,c.a) +
      '<rect x="20" y="42" width="8" height="16" rx="3" fill="#8d879c"/><rect x="72" y="42" width="8" height="16" rx="3" fill="#8d879c"/><rect x="24" y="22" width="52" height="46" rx="13" fill="'+c.m+'"/><rect x="30" y="30" width="40" height="30" rx="9" fill="#2b2640"/>' +
      face(mood,50,44,11,54,"#7ff0e0").replace(/#ff8fa3/g,"#7ff0e0")})},
  ghost:{kind:"other", label:"Ghost", draw:(c, mood) => ({head:{x:50,y:40,r:28,ey:46,sp:11},
    svg:'<path d="M20 92 v-44 q0 -32 30 -32 q30 0 30 32 v44 q-7.5 -9 -15 0 q-7.5 -9 -15 0 q-7.5 -9 -15 0 q-7.5 -9 -15 0z" fill="'+c.m+'" stroke="#00000022" stroke-width="1.5"/>' + face(mood,50,46,11,59)})},
  sprout:{kind:"other", label:"Sprout", draw:(c, mood) => ({head:{x:50,y:57,r:26,ey:55,sp:10},
    svg:'<path d="M28 78 h44 l-6 18 h-32z" fill="'+c.a+'"/><rect x="25" y="74" width="50" height="8" rx="3" fill="'+c.a+'"/>' + '<path d="M50 32 q-2 -14 -16 -16 q0 14 16 16z M50 32 q2 -16 18 -16 q0 14 -18 16z" fill="#4fae6e"/>' +
      circ(50,57,26,c.m) + face(mood,50,55,10,68)})}
};
function person(c, mood, hairBack, hairFront){
  return {head:{x:50,y:50,r:22,ey:50,sp:9},
    svg:'<path d="M18 100 q0 -24 32 -24 q32 0 32 24z" fill="'+c.a+'"/><rect x="44" y="64" width="12" height="14" rx="4" fill="'+c.s+'"/>' + (hairFront ? hairBack : "") +
      circ(50,50,22,c.s) + (hairFront ? hairFront : hairBack) + face(mood,50,52,9,62)};
}
function speciesDefaults(id){
  const k = SPECIES[id].kind;
  if(k === "person") return {m:HAIR_COLORS[1], a:ACCENT_COLORS[2], s:SKIN_COLORS[1]};
  if(id === "robot") return {m:"#c9c4d6", a:ACCENT_COLORS[5], s:SKIN_COLORS[1]};
  if(id === "sprout") return {m:"#9fe0c0", a:ACCENT_COLORS[0], s:SKIN_COLORS[1]};
  if(id === "ghost") return {m:"#f5f2fb", a:ACCENT_COLORS[1], s:SKIN_COLORS[1]};
  return {m:MAIN_COLORS[0], a:ACCENT_COLORS[0], s:SKIN_COLORS[1]};
}

// hats, glasses, scarves: drawn over the head using its position
const ACC_ART = {
  bow:h => '<g transform="translate('+(h.x+h.r*.62)+' '+(h.y-h.r*.74)+')"><path d="M0 0 l-10 -7 v14z M0 0 l10 -7 v14z" fill="#ff6f91"/><circle r="3" fill="#e04a73"/></g>',
  flower:h => '<g transform="translate('+(h.x-h.r*.66)+' '+(h.y-h.r*.7)+')">' + [0,72,144,216,288].map(a => '<circle cx="'+(Math.cos(a*Math.PI/180)*5).toFixed(1)+'" cy="'+(Math.sin(a*Math.PI/180)*5).toFixed(1)+'" r="3.4" fill="#ff9ec1"/>').join("") + '<circle r="2.6" fill="#ffd54a"/></g>',
  scarf:h => '<path d="M'+(h.x-h.r*.78)+' '+(h.y+h.r*.92)+' q'+(h.r*.78)+' 9 '+(h.r*1.56)+' 0 v8 q-'+(h.r*.78)+' 9 -'+(h.r*1.56)+' 0z" fill="#e5635b"/><rect x="'+(h.x+h.r*.3)+'" y="'+(h.y+h.r*.95)+'" width="7" height="16" rx="3" fill="#cf4b43"/>',
  glasses:h => '<g fill="#ffffff30" stroke="#2a1a10" stroke-width="2"><circle cx="'+(h.x-h.sp)+'" cy="'+h.ey+'" r="6.6"/><circle cx="'+(h.x+h.sp)+'" cy="'+h.ey+'" r="6.6"/><path d="M'+(h.x-h.sp+6.6)+' '+h.ey+' h'+(2*h.sp-13.2)+'" fill="none"/></g>',
  cap:h => '<path d="M'+(h.x-h.r*.86)+' '+(h.y-h.r*.3)+' q'+(h.r*.86)+' -'+(h.r*1.25)+' '+(h.r*1.72)+' 0z" fill="#3c6fd1"/><rect x="'+(h.x-h.r*.9)+'" y="'+(h.y-h.r*.36)+'" width="'+(h.r*1.8)+'" height="5" rx="2.5" fill="#2e57a8"/><path d="M'+(h.x+h.r*.2)+' '+(h.y-h.r*.34)+' h'+(h.r*.95)+' q4 0 4 4 h-'+(h.r*.95)+'z" fill="#2e57a8"/>',
  headphones:h => '<path d="M'+(h.x-h.r*.96)+' '+(h.y+2)+' q0 -'+(h.r*1.3)+' '+(h.r*.96)+' -'+(h.r*1.3)+' q'+(h.r*.96)+' 0 '+(h.r*.96)+' '+(h.r*1.3)+'" stroke="#5b5470" stroke-width="4.5" fill="none" stroke-linecap="round"/><rect x="'+(h.x-h.r*1.1)+'" y="'+(h.y-4)+'" width="9" height="16" rx="4" fill="#7c6bd6"/><rect x="'+(h.x+h.r*1.1-9)+'" y="'+(h.y-4)+'" width="9" height="16" rx="4" fill="#7c6bd6"/>',
  partyhat:h => '<g transform="translate('+h.x+' '+(h.y-h.r*.9)+') rotate(8)"><path d="M0 -22 l-12 22 h24z" fill="#ffb84a"/><path d="M-6 -10 l12 0 M-9 -3 l18 0" stroke="#fff" stroke-width="2.4"/><circle cy="-23" r="3.2" fill="#ff6f91"/></g>',
  crown:h => '<path d="M'+(h.x-13)+' '+(h.y-h.r*.78)+' l2 -14 l8 8 l3 -11 l3 11 l8 -8 l2 14z" fill="#ffd54a" stroke="#d9a400" stroke-width="1.5" stroke-linejoin="round"/>'
};

// ---------- the companion's state ----------
function newPet(species, name, over){
  const d = speciesDefaults(species);
  return Object.assign({id:uid8(), name:name || NAME_IDEAS[Math.floor(Math.random()*NAME_IDEAS.length)], species:species, m:d.m, a:d.a, s:d.s, acc:"none",
    hunger:80, joy:80, t:Date.now(), care:0, g0:S ? growth() : 0}, over || {});
}
function activePet(){ return S.pets.find(p => p.id === S.activePet) || S.pets[0]; }
function petStats(p){
  const hrs = Math.max(0, (Date.now() - p.t) / 3600000);
  return {hunger: Math.max(10, p.hunger - hrs*2.5), joy: Math.max(10, p.joy - hrs*1.5)};
}
function setStats(p, hunger, joy){ p.hunger = Math.max(0, Math.min(100, hunger)); p.joy = Math.max(0, Math.min(100, joy)); p.t = Date.now(); }
function moodOf(p){
  const s = petStats(p);
  if(s.hunger < 25 || s.joy < 25) return "sad";
  if(s.hunger > 60 && s.joy > 60) return "happy";
  return "ok";
}
const MOOD_TEXT = {happy:"feeling great", ok:"doing okay", sad:"could use some love", sleepy:"sleepy"};
function petPoints(p){ return Math.max(0, growth() - p.g0) + (p.care || 0) * 3; }
function stageOf(p){ const pts = petPoints(p); let s = STAGES[0]; STAGES.forEach(x => { if(pts >= x.at) s = x; }); return s; }
function nextStage(p){ const i = STAGES.indexOf(stageOf(p)); return STAGES[i+1] || null; }
function slotsUnlocked(){ const g = growth(); return SLOT_AT.filter(x => g >= x).length; }

// one drawn companion. o.cls adds classes, o.mood forces a mood, o.full draws at full size (no baby scaling)
function petSvg(p, o){
  o = o || {};
  const sp = SPECIES[p.species] || SPECIES.pom, mood = o.mood || moodOf(p), sc = o.full ? 1 : stageOf(p).scale;
  const hex = (c, d) => /^#[0-9a-f]{6}$/i.test(c) ? c : d;   // only real colors reach the drawing
  const art = sp.draw({m:hex(p.m,"#f7a94f"), a:hex(p.a,"#d9772a"), s:hex(p.s,"#f3c9a1")}, mood), acc = ACC_ART[p.acc];
  return '<svg class="pet-svg '+(o.cls||"")+' mood-'+mood+'" viewBox="0 0 100 100" role="img" aria-label="'+esc(p.name)+'">' +
    '<g transform="translate(50 96) scale('+sc+') translate(-50 -96)">' + art.svg + (acc ? acc(art.head) : "") + '</g></svg>';
}

// ---------- Treats (the currency that replaces XP) ----------
function treatsEarned(){ return Math.floor(growth() / 10) + (S.bonusTreats || 0) + (S.studyTreats || 0); }
function treats(){ return Math.max(0, treatsEarned() - (S.treatsSpent || 0)); }
function spendTreats(n){ if(treats() < n) return false; S.treatsSpent = (S.treatsSpent || 0) + n; return true; }
function giveTreats(n){ S.bonusTreats = (S.bonusTreats || 0) + n; }
// How an old XP number reads now: "+12 🍪"
function tx(xp){ return "+" + Math.max(1, Math.round(xp / 10)) + " 🍪"; }

// ---------- care ----------
function feedPet(p, food){
  if(!spendTreats(food.cost)) return false;
  const s = petStats(p);
  setStats(p, s.hunger + food.hunger, s.joy + food.joy); p.care = (p.care || 0) + 1; save();
  return true;
}
function playWith(p){
  const s = petStats(p);
  setStats(p, s.hunger - 4, s.joy + 14); p.care = (p.care || 0) + 1; p.lastPlay = Date.now(); save();
}
function cuddle(p){ const s = petStats(p); setStats(p, s.hunger, s.joy + 1.5); }
