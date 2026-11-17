/* Clicks and form submits */
"use strict";

$("#settingsBtn").onclick = openSettings;
// Skip link: move focus to the content without changing the tab in the URL
$(".skip").onclick = e => { e.preventDefault(); $("#view").focus(); };
document.addEventListener("click", e => {
  const b = e.target.closest("button"); if(!b) return;
  if(b.dataset.tab){ location.hash = b.dataset.tab; return; }
  if(b.dataset.pane){ const [g,k] = b.dataset.pane.split(":"); pane[g] = k; renderAll(); return; }
  if(b.dataset.term) return openTerm(b.dataset.term);
  if(b.dataset.goal) return openGoal(b.dataset.goal);
  if(b.dataset.grad) return toast(termKeys().every(hasGpa) ? "Congrats, graduate!" : "Clear every term to unlock graduation");
  if(b.id === "addGoal") return openGoal(null);
  if(b.id === "addQuest") return openQuest();
  if(b.id === "xpHelp") return openTreatsHelp();
  if(b.id === "petBtn") return cuddleTap(e);
  if(b.id === "feedBtn") return openFeed();
  if(b.id === "playBtn") return playTap();
  if(b.id === "styleBtn") return openStyle();
  if(b.id === "editPetBtn") return openMaker("edit", activePet().id);
  if(b.id === "giftBtn") return claimGift();
  if(b.id === "adopt") return openMaker("new");
  if(b.dataset.pick){ S.activePet = b.dataset.pick; save(); renderAll(); return; }
  if(b.id === "addExpense") return openExpense();
  if(b.id === "addWish") return openWish();
  if(b.id === "editBudget") return openBudget();
  if(b.dataset.mile) return openMile(b.dataset.mile);
  if(b.id === "customizeJourney") return openJourney();
  if(b.id === "editRules") return openRules();
  if(b.id === "addCourse") return addCourse();
  if(b.id === "clearCalc") return clearCalc();
  if(b.id === "saveTerm") return saveCalcToTerm();
  if(b.dataset.cdel) return delCourse(b.dataset.cdel);
  if(b.dataset.qtoggle){ const q=S.quests.find(x=>x.id===b.dataset.qtoggle); q.done=!q.done; save(); renderAll(); if(q.done) toast("Quest complete! "+tx(QUEST_XP[q.kind]||80)); return; }
  if(b.dataset.qdel){ S.quests=S.quests.filter(x=>x.id!==b.dataset.qdel); save(); renderAll(); return; }
  if(b.dataset.epic) return openReceipt(b.dataset.epic);
  if(b.dataset.edel){ const gone=S.expenses.find(x=>x.id===b.dataset.edel); if(gone && gone.pic) rcpt.del(gone.id).catch(()=>{}); S.expenses=S.expenses.filter(x=>x.id!==b.dataset.edel); save(); renderAll(); return; }
  if(b.dataset.wdel){ S.wishes=S.wishes.filter(x=>x.id!==b.dataset.wdel); save(); renderAll(); return; }
  if(b.dataset.cat){ pickedCat=b.dataset.cat; document.querySelectorAll("[data-cat]").forEach(c=>c.setAttribute("aria-pressed", c.dataset.cat===pickedCat)); return; }
});
document.addEventListener("submit", e => {
  const f = e.target;
  if(f.id === "questForm"){ e.preventDefault(); const t=$("#qTitle").value.trim(); if(!t) return; S.quests.push({id:uid8(),title:t,kind:$("#qKind").value,done:false}); save(); closeModal(); pane.journey="quests"; renderAll(); toast("New side quest added"); }
  else if(f.id === "expForm"){ e.preventDefault(); const a=parseFloat($("#eAmt").value); if(!(a>0)) return;
    const eid=uid8();
    S.expenses.push({id:eid,pic:!!pendingPic,amt:Math.round(a*100)/100,cat:pickedCat,note:$("#eNote").value.trim(),date:$("#eDate").value||today(),ts:Date.now()});
    if(S.expenses.length>1500) S.expenses = S.expenses.slice(-1500);
    savePendingPic(eid); save(); closeModal(); pane.money="spend"; renderAll(); toast("Logged " + peso(a) + " for " + pickedCat); }
  else if(f.id === "wishForm"){ e.preventDefault(); const n=$("#wName").value.trim(), p=parseFloat($("#wPrice").value); if(!n||!(p>0)) return; S.wishes.push({id:uid8(),name:n,price:p,saved:0}); save(); closeModal(); pane.money="wish"; renderAll(); toast("Added " + n + " to your wishlist"); }
  else if(f.dataset.wadd){ e.preventDefault(); const w=S.wishes.find(x=>x.id===f.dataset.wadd); const v=parseFloat(f.querySelector("input").value); if(!(v>0)) return;
    w.saved = Math.round((w.saved+v)*100)/100; save(); renderAll(); toast(w.saved>=w.price ? "You did it! Treat yourself " + tx(50) : "Saved " + peso(v) + " toward " + w.name); }
});

// Calculator inputs update live without redrawing the page (so the keyboard stays open)
document.addEventListener("input", e => {
  const t = e.target, row = t.closest && t.closest("[data-cid]");
  if(!t.dataset || !t.dataset.c || !row) return;
  const c = S.calc.courses.find(x => x.id === row.dataset.cid); if(!c) return;
  if(t.dataset.c === "name") c.name = t.value.slice(0,40);
  else if(t.dataset.c === "units"){ const v = parseFloat(t.value); c.units = v >= 0 && v <= 40 ? v : 0; }
  else if(t.dataset.c === "grade") c.grade = t.value === "" ? null : parseFloat(t.value);
  save(); updateCalc();
});
document.addEventListener("change", e => {
  const t = e.target;
  if(t.id === "calcTerm"){ S.calc.term = t.value; save(); updateCalc(); }
  // Picking a different scale in a sheet fills in sensible defaults for it
  if(t.id === "sScale"){
    const sc = t.value === "5" ? "5" : "4", m = t.closest("form");
    m.querySelector("#sCut").value = SCALE_DEFAULT_CUTOFF[sc];
    m.querySelector("#sCut").min = SCALE_RANGE[sc][0]; m.querySelector("#sCut").max = SCALE_RANGE[sc][1];
    m.querySelector("#sWorst").innerHTML = worstOptions(sc, null);
  }
});
