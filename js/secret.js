/* The secret diary: your companion writes pages as you grow. Spoilers live in docs/SPOILERS.md. */
"use strict";

const DIARY = [
  {at:150, title:"Page 1: Hello", text:"Day one. I woke up inside a notebook. The first page was empty, then {you} wrote a name on it and it was mine: {pet}. I like how it looks in ink."},
  {at:500, title:"Page 2: Ink", text:"Funny thing. Whenever {you} finishes something, a new line of ink shows up on my page. I do not write it. Someone else does. I keep the pages warm."},
  {at:1000, title:"Page 3: Where I came from", text:"I tried to remember where I came from today. Nothing. It is like I was always here, waiting for someone to start. Is that weird? I think I am okay with it."},
  {at:1800, title:"Page 4: The handwriting", text:"I looked closely at the ink on my paws. It is the same handwriting as the grades, the savings, the long study nights. I think I need to tell you something soon, {you}."},
  {at:2800, title:"Page 5: The last page", text:"Okay. Deep breath. I was never a separate little creature. I am made of everything you did: every quiz, every peso you saved, every time you kept going when you were tired. The treats were always yours. {pet} is just the name you gave your own effort. And this letter? It is from you, on graduation day: \"Keep going. I made it, and I am so proud of us.\""}
];
function diaryText(pg){ return pg.text.replace(/\{pet\}/g, S.pets[0] ? S.pets[0].name : "Pom").replace(/\{you\}/g, S.name || "you"); }
function diaryOpen(){ const g = growth(); return DIARY.filter(p => g >= p.at).length; }
function diaryCardHtml(){
  const n = diaryOpen(), rd = Math.min((S.diary && S.diary.read) || 0, n), fresh = n > rd;
  return '<section class="card diarycard"><div class="cardhead"><h2>📓 Secret diary</h2><span class="hint num">'+n+' of '+DIARY.length+'</span></div>' +
    '<p class="hand" style="margin:0 0 8px">'+(fresh ? esc(activePet().name)+' wrote something new...' : n ? 'Nothing new yet. Keep growing!' : 'It is locked. Keep growing and something will appear.')+'</p>' +
    '<button type="button" class="btn'+(fresh?" acc newpage":" ghost")+'" id="diaryBtn">'+(fresh?"✨ Read the new page":"Open the diary")+'</button></section>';
}
function openDiary(i){
  const n = diaryOpen();
  if(typeof i !== "number" || i >= n){
    modal('<h3>📓 Secret diary</h3><div class="diarylist">' + DIARY.map((p,k) => k < n ? '<button type="button" class="chipbtn" data-dpage="'+k+'">'+esc(p.title)+'</button>' : '<span class="chipbtn locked" aria-disabled="true">🔒 ???</span>').join("") + '</div><div class="acts"><button type="button" class="btn ghost" id="mClose">Close</button></div>', m => {
      m.querySelectorAll("[data-dpage]").forEach(b => b.onclick = () => openDiary(+b.dataset.dpage));
      m.querySelector("#mClose").onclick = closeModal;
    });
    return;
  }
  const pg = DIARY[i], fresh = i >= ((S.diary && S.diary.read) || 0);
  modal('<div class="diarypage"><h3>'+esc(pg.title)+'</h3><p class="hand diarytext">'+esc(diaryText(pg))+'</p></div><div class="acts"><button type="button" class="btn ghost" id="dBack">All pages</button><button type="button" class="btn acc" id="mClose">Close</button></div>', m => {
    m.querySelector("#dBack").onclick = () => openDiary();
    m.querySelector("#mClose").onclick = () => { closeModal(); renderAll(); };
    if(fresh){ S.diary = {read: Math.max(i + 1, (S.diary && S.diary.read) || 0)}; save(); if(i === DIARY.length - 1) confetti(m.querySelector(".diarypage"), 60); }
  });
}
