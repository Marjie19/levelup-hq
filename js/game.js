/* Game rules: growth (what used to be XP), Dean's List. Companions turn growth into stages and Treats (see pets.js). */
"use strict";

const QUEST_XP = {cert:120, hackathon:150, project:100, org:80};
const QUEST_LABEL = {cert:"Certificate", hackathon:"Hackathon", project:"Project", org:"Org / role"};
// A journey is a list of stops. Term stops hold a GPA (saved under the stop id). Milestones are ticked off. "grad" is the finish line.
function termKeys(){ return S.journey.stops.filter(s => s.kind === "term").map(s => s.id); }
function stopDone(s){ return s.kind === "term" ? hasGpa(s.id) : s.kind === "grad" ? termKeys().every(hasGpa) : !!s.done; }
function hasGpa(k){ return typeof S.gpas[k] === "number"; }
// Two grading scales: "4" (4.0 is best) and "5" (1.0 is best, 5.0 fails). Points turn either one into 0-4 for XP.
const GRADE_STEPS = {"4":[4,3.5,3,2.5,2,1.5,1,0], "5":[1,1.25,1.5,1.75,2,2.25,2.5,2.75,3,4,5]};
const SCALE_DEFAULT_CUTOFF = {"4":3.5, "5":1.5};
const SCALE_RANGE = {"4":[0,4], "5":[1,5]};
function isFive(){ return S.scale === "5"; }
function pointsOf(g){ return isFive() ? 5 - g : g; }
function meetsCutoff(g){ return isFive() ? g <= S.cutoff + 1e-9 : g >= S.cutoff - 1e-9; }
function termLabel(k){ const s = S.journey.stops.find(x => x.id === k); return s ? s.label : k; }
// A term saved from the calculator remembers its full Dean's List result (units and worst-grade rules too).
function isDean(k){ if(!hasGpa(k)) return false; return k in S.deanFlags ? !!S.deanFlags[k] : meetsCutoff(S.gpas[k]); }
function termXp(k){ return hasGpa(k) ? Math.round(pointsOf(S.gpas[k])*100) + (isDean(k)?150:0) : 0; }
function totalXp(){
  let xp = 0;
  termKeys().forEach(k => xp += termXp(k));
  S.journey.stops.forEach(s => { if(s.kind === "mile" && s.done) xp += s.xp || 0; });
  S.quests.forEach(q => { if(q.done) xp += QUEST_XP[q.kind]||80; });
  S.goals.forEach(g => { if(g.done) xp += 200; });
  xp += Math.min(S.tasks.filter(t => t.done).length, 100) * 20 + Math.min(S.projects.filter(p => p.status === "done").length, 20) * 100;
  S.wishes.forEach(w => { if(w.saved >= w.price && w.price>0) xp += 50; });
  return xp;
}
// Growth is the hidden number behind everything you do. Nobody sees it as XP any more: companions grow and you earn Treats.
function growth(){ return totalXp(); }
