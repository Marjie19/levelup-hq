/* Welcome story + a short tip on every screen. Tips can be closed; the ? button in the header brings them back. */
"use strict";

const TIPS = {
  home:["Say hi to your companion","Tap them to cuddle. Feed and play to fill the meters. Treats 🍪 come from grades, quests and the daily gift."],
  journey:["Your road to graduation","Tap a stop to log your term GPA or tick off a milestone. Use Customize to pick another template or build your own."],
  deans:["Dean's List calculator","Add your courses and grades to see your GPA live. Set your school's rules with Edit rules, then save the result to a term."],
  money:["Money, bestie edition","Log what you spend with + Expense. Set a budget and limits, and use the wait list before buying something you only kinda want."],
  school:["Everything school in one place","Grades is your Dean's List calculator. Planner keeps tasks and classes, Absences counts what you can still miss, Handbook finds your school rules, Projects keeps all your links."],
  planner:["Planner is coming","Tasks, deadlines and your class schedule will live here. For now, reminders are in Profile."],
  profile:["Make it yours","Everything saves as you type. Pick your picture, colors and voice. Save a backup file now and then."]
};
const WELCOME = [
  {art:"🏡", h:"Welcome to Bestie HQ!", p:"A cozy little corner for school life. Your grades, your money and your plans, all in one notebook."},
  {art:"🐶", h:"Meet your companion", p:"A buddy who grows as you do. Study, finish quests and keep your budget, and you earn Treats to take care of them. They never die, they just get sleepy if you ghost them."},
  {art:"📒", h:"Your own notebook", p:"Track your road to graduation, find out if the Dean's List is in reach, and learn where your money goes. Quick setup next, then it's all yours."}
];
let welcomeAt = 0;

function openWelcome(){
  const w = WELCOME[welcomeAt], last = welcomeAt === WELCOME.length - 1;
  modal('<div class="welcome"><div class="wart" aria-hidden="true">'+w.art+'</div><h3>'+esc(w.h)+'</h3><p class="hand">'+esc(w.p)+'</p>' +
    '<div class="dots" aria-hidden="true">'+WELCOME.map((_,i)=>'<i'+(i===welcomeAt?' class="on"':'')+'></i>').join("")+'</div>' +
    '<div class="acts">'+(last?'':'<button type="button" class="btn ghost" id="wSkip">Skip</button>')+'<button type="button" class="btn acc" id="wNext">'+(last?"Let's set up":"Next")+'</button></div></div>', m => {
      m.querySelector("#wNext").onclick = () => { if(last) finishWelcome(); else { welcomeAt++; openWelcome(); } };
      const s = m.querySelector("#wSkip"); if(s) s.onclick = finishWelcome;
    });
}
function finishWelcome(){ S.welcomed = true; save(); closeModal(); welcomeAt = 0; if(!S.setup) openSetup(); }

// Puts the tip for the current screen at the top, unless it was closed
function mountTip(tab){
  const old = $("#tip"); if(old) old.remove();
  const t = TIPS[tab]; if(!t || (S.tipsOff || {})[tab]) return;
  const el = document.createElement("aside");
  el.className = "note tipnote"; el.id = "tip";
  el.innerHTML = '<b class="hand">'+esc(t[0])+'</b><p>'+esc(t[1])+'</p><button type="button" class="x" id="tipClose" aria-label="Close tip">×</button>';
  $("#view").prepend(el);
}
document.addEventListener("click", e => {
  const b = e.target.closest("button"); if(!b) return;
  if(b.id === "tipClose"){ S.tipsOff = S.tipsOff || {}; S.tipsOff[currentTab()] = true; save(); const t = $("#tip"); if(t) t.remove(); }
  else if(b.id === "tipsBtn"){ if(S.tipsOff) delete S.tipsOff[currentTab()]; save(); mountTip(currentTab()); const t = $("#tip"); if(t) t.scrollIntoView({block:"nearest"}); else toast("No tip for this screen"); }
  else if(b.id === "replayWelcome"){ welcomeAt = 0; openWelcome(); }
});
