/* Game rules: XP, levels, Dean's List */
"use strict";

const QUEST_XP = {cert:120, hackathon:150, project:100, org:80};
const QUEST_LABEL = {cert:"Certificate", hackathon:"Hackathon", project:"Project", org:"Org / role"};
const TITLES = ["Freshie","Explorer","Grinder","Achiever","Scholar","Trailblazer","Visionary","Legend"];
const PER_LEVEL = 500;
function termKeys(){ const k=[]; for(let y=1;y<=S.years;y++) for(let t=1;t<=S.tpy;t++) k.push(y+"-"+t); return k; }
function hasGpa(k){ return typeof S.gpas[k] === "number"; }
function isDean(k){ return hasGpa(k) && S.gpas[k] >= S.cutoff; }
function termXp(k){ return hasGpa(k) ? Math.round(S.gpas[k]*100) + (isDean(k)?150:0) : 0; }
function totalXp(){
  let xp = 0;
  termKeys().forEach(k => xp += termXp(k));
  S.quests.forEach(q => { if(q.done) xp += QUEST_XP[q.kind]||80; });
  S.goals.forEach(g => { if(g.done) xp += 200; });
  S.wishes.forEach(w => { if(w.saved >= w.price && w.price>0) xp += 50; });
  return xp;
}
function levelOf(xp){ return Math.floor(xp/PER_LEVEL)+1; }
function titleOf(l){ return TITLES[Math.min(TITLES.length-1, Math.floor((l-1)/2))]; }
let prevLevel = null;
