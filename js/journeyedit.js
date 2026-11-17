/* Journey sheets: pick a template, change the look (theme, pet), edit your own stops, tick off a milestone */
"use strict";

// Switch to a template (or back to your own journey). Your saved GPAs are never deleted:
// they are keyed by stop id, so switching back brings them right back.
function applyTemplate(id){
  const old = new Map(S.journey.stops.map(s => [s.id, s]));
  if(S.journey.tpl === "custom") S.customStops = S.journey.stops;
  let stops;
  if(id === "custom") stops = JSON.parse(JSON.stringify(S.customStops || S.journey.stops));
  else stops = buildStops(id);
  stops.forEach(s => { if(s.kind === "mile" && old.has(s.id)) s.done = !!old.get(s.id).done; });
  S.journey = {tpl:id, stops:stops};
}

function openJourney(){
  let pick = S.journey.tpl, theme = S.theme;
  const cards = TEMPLATES.concat([CUSTOM_CARD]);
  const cardHtml = c => {
    const n = c.id === "custom" ? (S.customStops || S.journey.stops).length : buildStops(c.id).length;
    return '<button type="button" class="tpl" role="radio" data-tpl="'+c.id+'" aria-checked="'+(c.id===pick)+'"><span class="emo" aria-hidden="true">'+c.emoji+'</span>' +
      '<span class="tplt"><b>'+esc(c.name)+'</b><span>'+esc(c.sub)+', '+n+' stops</span></span></button>';
  };
  modal('<h3>Your journey</h3><p class="muted" style="margin:0">Pick a ready-made journey, or build your own. Your grades are kept either way.</p>' +
    '<div class="tplgrid" role="radiogroup" aria-label="Journey">' + cards.map(cardHtml).join("") + '</div>' +
    '<h4 class="subh">Map theme</h4><div class="chips" role="radiogroup" aria-label="Map theme">' + THEMES.map(t => '<button type="button" class="chipbtn" data-theme="'+t.id+'" aria-pressed="'+(t.id===theme)+'">'+t.emoji+' '+t.name+'</button>').join("") + '</div>' +
    '<div class="acts"><button type="button" class="btn ghost" id="cancel">Cancel</button><button type="button" class="btn acc" id="saveJourney">Save</button></div>', m => {
      m.querySelector("#cancel").onclick = closeModal;
      m.querySelector(".sheet").addEventListener("click", e => {
        const b = e.target.closest("button"); if(!b) return;
        if(b.dataset.tpl){ pick = b.dataset.tpl; m.querySelectorAll("[data-tpl]").forEach(x => x.setAttribute("aria-checked", x.dataset.tpl === pick)); }
        if(b.dataset.theme){ theme = b.dataset.theme; m.querySelectorAll("[data-theme]").forEach(x => x.setAttribute("aria-pressed", x.dataset.theme === theme)); }
      });
      m.querySelector("#saveJourney").onclick = () => {
        const changed = pick !== S.journey.tpl;
        if(changed) applyTemplate(pick);
        S.theme = theme; save(); closeModal();
        if(pick === "custom" && changed){ renderAll(); openStopEditor(); return; }
        renderAll(); toast(changed ? "Journey changed" : "Theme saved");
      };
    });
  if(S.journey.tpl === "custom"){
    const acts = $("#modal .acts");
    const edit = document.createElement("button"); edit.type = "button"; edit.className = "btn ghost"; edit.textContent = "Edit my stops"; edit.style.marginRight = "auto";
    edit.onclick = () => { closeModal(); openStopEditor(); };
    acts.insertBefore(edit, acts.firstChild);
  }
}

// ----- custom journey editor -----
function openStopEditor(){
  const draft = JSON.parse(JSON.stringify(S.journey.stops));
  let focusLast = false;
  const kindOpts = k => [["term","Term (GPA)"],["mile","Milestone"],["grad","Graduation"]].map(o => '<option value="'+o[0]+'"'+(o[0]===k?" selected":"")+'>'+o[1]+'</option>').join("");
  const iconOpts = ic => STOP_ICONS.map(i => '<option'+(i===ic?" selected":"")+'>'+i+'</option>').join("");
  const rows = () => draft.map((s, i) =>
    '<li class="erow" data-i="'+i+'"><div class="emove"><button type="button" data-mv="-1" aria-label="Move up"'+(i===0?" disabled":"")+'>↑</button><button type="button" data-mv="1" aria-label="Move down"'+(i===draft.length-1?" disabled":"")+'>↓</button></div>' +
      '<input class="inp elabel" data-f="label" maxlength="40" aria-label="Stop '+(i+1)+' name" placeholder="Name" value="'+esc(s.label||"")+'">' +
      '<button type="button" class="x" data-del="1" aria-label="Remove stop '+(i+1)+'">×</button>' +
      '<select class="inp ekind" data-f="kind" aria-label="Stop '+(i+1)+' type">'+kindOpts(s.kind)+'</select>' +
      '<input class="inp egroup" data-f="group" maxlength="24" aria-label="Stop '+(i+1)+' section" placeholder="Section (like Year 1)" value="'+esc(s.group||"")+'">' +
      (s.kind === "mile" ? '<select class="inp eicon" data-f="icon" aria-label="Stop '+(i+1)+' icon">'+iconOpts(s.icon)+'</select>' +
        '<label class="exp">Treats <input class="inp num" data-f="xp" type="number" inputmode="numeric" min="0" max="100" step="1" value="'+Math.round((s.xp==null?100:s.xp)/10)+'"></label>' : '') +
    '</li>').join("");
  modal('<h3>Edit my journey</h3><p class="muted" style="margin:0">Add up to '+MAX_STOPS+' stops. Terms take a GPA. Milestones are things you tick off for treats.</p>' +
    '<p class="hint num" id="ecount"></p><ul class="elist" id="elist"></ul>' +
    '<div class="eadd"><button type="button" class="btn ghost sm" id="addTerm">+ Term</button><button type="button" class="btn ghost sm" id="addMile">+ Milestone</button></div>' +
    '<div class="acts"><button type="button" class="btn ghost" id="cancel">Cancel</button><button type="button" class="btn acc" id="saveStops">Save journey</button></div>', m => {
      const list = m.querySelector("#elist");
      const draw = () => {
        list.innerHTML = rows();
        m.querySelector("#ecount").textContent = draft.length + " of " + MAX_STOPS + " stops";
        const full = draft.length >= MAX_STOPS;
        m.querySelector("#addTerm").disabled = full; m.querySelector("#addMile").disabled = full;
        if(focusLast){ focusLast = false; const l = list.querySelectorAll(".elabel"); if(l.length){ l[l.length-1].focus(); l[l.length-1].scrollIntoView({block:"center"}); } }
      };
      const add = kind => {
        if(draft.length >= MAX_STOPS) return;
        const n = draft.filter(s => s.kind === kind).length + 1;
        draft.push(kind === "term" ? {id:uid8(), kind:"term", group:"", label:"Term "+n} : {id:uid8(), kind:"mile", group:"", label:"Milestone "+n, icon:"⭐", xp:100, done:false});
        focusLast = true; draw();
      };
      m.querySelector("#cancel").onclick = closeModal;
      m.querySelector("#addTerm").onclick = () => add("term");
      m.querySelector("#addMile").onclick = () => add("mile");
      list.addEventListener("click", e => {
        const b = e.target.closest("button"), row = e.target.closest("[data-i]"); if(!b || !row) return;
        const i = +row.dataset.i;
        if(b.dataset.del){ draft.splice(i, 1); draw(); }
        else if(b.dataset.mv){ const j = i + +b.dataset.mv; if(j >= 0 && j < draft.length){ const t = draft[i]; draft[i] = draft[j]; draft[j] = t; draw(); } }
      });
      list.addEventListener("input", e => {
        const t = e.target, row = t.closest("[data-i]"); if(!row || !t.dataset.f) return;
        const s = draft[+row.dataset.i];
        if(t.dataset.f === "xp"){ const v = parseFloat(t.value); s.xp = v >= 0 && v <= 100 ? v * 10 : 0; }   // stored as growth points (10 per treat)
        else if(t.dataset.f === "kind"){
          s.kind = t.value;
          if(s.kind === "mile"){ s.icon = s.icon || "⭐"; if(s.xp == null) s.xp = 100; s.done = !!s.done; }
          draw();
        } else s[t.dataset.f] = t.value;
      });
      m.querySelector("#saveStops").onclick = () => {
        if(!draft.length) return toast("Add at least one stop");
        const stops = draft.map((s, i) => Object.assign({}, s, {label: (s.label || "").trim() || "Stop " + (i+1), group: (s.group || "").trim()}));
        S.journey = {tpl:"custom", stops:stops}; S.customStops = stops;
        save(); closeModal(); renderAll(); toast("Journey saved");
      };
      draw();
    }, "wide");
}

// ----- tick off a milestone -----
function openMile(id){
  const s = S.journey.stops.find(x => x.id === id); if(!s) return;
  modal('<div style="display:flex;gap:12px;align-items:center"><span class="bigico" aria-hidden="true">'+esc(s.icon||"⭐")+'</span><h3>'+esc(s.label)+'</h3></div>' +
    '<p class="muted" style="margin:0">Finish it to earn '+tx(s.xp||0)+' treats.</p>' +
    '<form id="mileForm" class="sheetform"><label style="display:flex;gap:8px;align-items:center;font-weight:700"><input type="checkbox" id="mDone" '+(s.done?"checked":"")+' style="width:22px;height:22px"> I did it!</label>' +
    '<div class="acts"><button type="button" class="btn ghost" id="cancel">Cancel</button><button class="btn acc" type="submit">Save</button></div></form>', m => {
      m.querySelector("#cancel").onclick = closeModal;
      m.querySelector("#mileForm").onsubmit = e => { e.preventDefault();
        const was = !!s.done; s.done = m.querySelector("#mDone").checked; save(); closeModal(); renderAll();
        if(s.done && !was) toast(s.label + " done! " + tx(s.xp||0));
      };
    });
}
