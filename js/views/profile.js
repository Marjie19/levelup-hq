/* Profile page: one place to customize everything. Everything saves as you change it. */
"use strict";

const ACCENTS = [["apricot","Apricot","#f28f2c"],["rose","Rose","#e8627f"],["mint","Mint","#2fae83"],["sky","Sky","#3b8fd9"],["grape","Grape","#9a63e0"]];
const MODES = [["auto","Auto"],["light","Light"],["dark","Dark"]];

// Looks (light/dark + accent color) are applied to the page itself
function applyLook(){
  const l = S.look || {}, r = document.documentElement;
  if(l.mode === "light" || l.mode === "dark") r.setAttribute("data-theme", l.mode); else r.removeAttribute("data-theme");
  if(l.accent && l.accent !== "apricot") r.setAttribute("data-accent", l.accent); else r.removeAttribute("data-accent");
}

// Shrinks a chosen photo to a small square so it fits in localStorage
function shrinkPhoto(file, done){
  const img = new Image(), url = URL.createObjectURL(file);
  img.onload = () => {
    const n = 160, c = document.createElement("canvas"); c.width = c.height = n;
    const s = Math.min(img.width, img.height), ctx = c.getContext("2d");
    ctx.drawImage(img, (img.width - s)/2, (img.height - s)/2, s, s, 0, 0, n, n);
    URL.revokeObjectURL(url);
    done(c.toDataURL("image/jpeg", .8));
  };
  img.onerror = () => { URL.revokeObjectURL(url); done(null); };
  img.src = url;
}

// The avatar shown in the header and here: the chosen photo, or your companion
function avatarHtml(){
  const pr = S.profile || {};
  if(pr.avatar === "photo" && /^data:image\/jpeg;base64,[A-Za-z0-9+\/=]+$/.test(pr.photo || "")) return '<img class="avimg" alt="" src="'+pr.photo+'">';
  return petSvg(activePet(), {cls:"pom"});
}

function renderProfile(){
  const pr = S.profile || {}, l = S.look || {mode:"auto", accent:"apricot"};
  const seg = (name, list, cur) => '<div class="chips" role="group" aria-label="'+name+'">' + list.map(x => '<button type="button" class="chipbtn" data-'+name+'="'+x[0]+'" aria-pressed="'+(cur===x[0])+'">'+x[1]+'</button>').join("") + '</div>';
  $("#view").innerHTML =
    '<div class="stack">' +
    '<section class="card profhead"><div class="avbig">'+avatarHtml()+'</div><div class="grow"><h2>'+esc(S.name || "Your profile")+'</h2><p class="hand">'+esc([pr.program, pr.school].filter(Boolean).join(" · ") || "Tell me about you!")+'</p></div></section>' +

    '<section class="card"><div class="cardhead"><h2>About you</h2></div><div class="sheetform" id="profAbout">' +
      '<div class="field"><label for="pName">What should we call you?</label><input class="inp" id="pName" maxlength="30" value="'+esc(S.name)+'" placeholder="Your name"></div>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap"><div class="field"><label for="pSchool">School</label><input class="inp" id="pSchool" maxlength="60" value="'+esc(pr.school||"")+'" placeholder="Your school"></div>' +
      '<div class="field"><label for="pProg">Program</label><input class="inp" id="pProg" maxlength="60" value="'+esc(pr.program||"")+'" placeholder="BS Information Systems"></div></div>' +
      '<div class="field" style="max-width:140px"><label for="pAge">Age</label><input class="inp num" id="pAge" type="number" inputmode="numeric" min="10" max="99" value="'+S.age+'"></div>' +
      '<div class="field"><label>Your picture</label>' + seg("avatar", [["pet","My companion"],["photo","My photo"]], pr.avatar === "photo" && pr.photo ? "photo" : "pet") +
      '<div class="acts" style="justify-content:flex-start"><label class="btn ghost sm" for="pPhoto" style="cursor:pointer">📷 Choose photo</label><input id="pPhoto" type="file" accept="image/*" hidden>'+(pr.photo?'<button type="button" class="btn ghost sm" id="pPhotoDel">Remove photo</button>':'')+'</div></div>' +
    '</div></section>' +

    '<section class="card"><div class="cardhead"><h2>Grading rules</h2></div><form class="sheetform" id="profRules" onsubmit="return false">' + ruleFields() + '</form></section>' +

    '<section class="card"><div class="cardhead"><h2>Look</h2></div><div class="sheetform">' +
      '<div class="field"><label>Light or dark</label>' + seg("mode", MODES, l.mode || "auto") + '</div>' +
      '<div class="field"><label>Accent color</label><div class="chips swatches" role="group" aria-label="accent">' + ACCENTS.map(a => '<button type="button" class="swatch" data-accent="'+a[0]+'" style="--sw:'+a[2]+'" aria-pressed="'+((l.accent||"apricot")===a[0])+'" aria-label="'+a[1]+'"></button>').join("") + '</div></div>' +
      '<button type="button" class="btn ghost" id="profStyle" style="align-self:flex-start">🎀 Companion styles</button>' +
    '</div></section>' +

    '<section class="card"><div class="cardhead"><h2>Voice &amp; reminders</h2></div><div class="sheetform">' +
      '<div class="field"><label for="pTone">How should I talk to you?</label><select class="inp" id="pTone">' + TONES.map(t => '<option value="'+t[0]+'"'+(S.tone===t[0]?" selected":"")+'>'+t[1]+'</option>').join("") + '</select></div>' +
      '<button type="button" class="btn ghost" id="remindBtn" style="align-self:flex-start">🔔 Reminders</button></div></section>' +

    '<section class="card"><div class="cardhead"><h2>Backup &amp; restore</h2></div><div class="sheetform">' +
      '<p class="hint" style="margin:0">Your data lives only on this device. Save a backup file to move it between Safari, the installed app and your laptop. Receipt photos are not in the backup.</p>' +
      '<div class="acts" style="justify-content:flex-start"><button type="button" class="btn acc" id="bkSave">⬇ Save backup</button><label class="btn ghost" for="bkFile" style="cursor:pointer">⬆ Restore backup</label><input id="bkFile" type="file" accept=".json,application/json" hidden></div>' +
      '<p class="hint" id="bkMsg" style="margin:0" role="status"></p>' + installTip() +
      '<button type="button" class="btn ghost" id="replayWelcome" style="align-self:flex-start">👋 Replay the welcome</button>' +
      '<button type="button" class="btn ghost" id="profReset" style="align-self:flex-start;color:var(--warn)">Reset everything</button>' +
    '</div></section></div>';
}

function profileSave(){ save(); renderHeader(); }
function profileMsg(t){ const m = $("#bkMsg"); if(m) m.textContent = t; toast(t); }

// Turns old or partial saved data into the current shape (same steps as start-up)
function restoreData(d){
  S = Object.assign(fresh(), d);
  if(!d.journey || !d.journey.stops) migrateJourney(d);
  if(!d.pets || !d.pets.length){ S.pets = fresh().pets; if(!d.pets) migratePets(d); }
  S.setup = true;
}

document.addEventListener("click", e => {
  const b = e.target.closest("button"); if(!b || currentTab() !== "profile") return;
  if(b.dataset.avatar){ S.profile = S.profile || {}; if(b.dataset.avatar === "photo" && !S.profile.photo){ $("#pPhoto").click(); return; } S.profile.avatar = b.dataset.avatar; profileSave(); renderProfile(); return; }
  if(b.dataset.mode){ S.look = Object.assign({mode:"auto", accent:"apricot"}, S.look, {mode:b.dataset.mode}); applyLook(); profileSave(); renderProfile(); return; }
  if(b.dataset.accent){ S.look = Object.assign({mode:"auto", accent:"apricot"}, S.look, {accent:b.dataset.accent}); applyLook(); profileSave(); renderProfile(); return; }
  if(b.id === "pPhotoDel"){ S.profile.photo = ""; S.profile.avatar = "pet"; profileSave(); renderProfile(); return; }
  if(b.id === "profStyle") return openStyle();
  if(b.id === "bkSave"){
    const blob = new Blob([JSON.stringify(S)], {type:"application/json"}), a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = "bestie-hq-backup-" + today() + ".json"; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000); profileMsg("Backup saved to your downloads"); return;
  }
  if(b.id === "profReset"){
    if(!b.dataset.armed){ b.dataset.armed = "1"; b.textContent = "Tap again to erase all data"; return; }
    S = fresh(); save(); applyLook(); location.hash = "home"; renderAll(); openSetup(); return;
  }
});

document.addEventListener("input", e => {
  const t = e.target; if(currentTab() !== "profile") return;
  S.profile = S.profile || {};
  if(t.id === "pName") S.name = t.value.trim().slice(0,30);
  else if(t.id === "pSchool") S.profile.school = t.value.trim().slice(0,60);
  else if(t.id === "pProg") S.profile.program = t.value.trim().slice(0,60);
  else if(t.id === "pAge"){ const a = parseFloat(t.value); if(a >= 10 && a <= 99) S.age = Math.round(a); else return; }
  else return;
  profileSave();
  const h = $(".profhead"); if(h){ h.querySelector("h2").textContent = S.name || "Your profile"; h.querySelector(".hand").textContent = [S.profile.program, S.profile.school].filter(Boolean).join(" · ") || "Tell me about you!"; }
});

document.addEventListener("change", e => {
  const t = e.target; if(currentTab() !== "profile") return;
  if(t.id === "pTone"){ if(TONES.some(x => x[0] === t.value)){ S.tone = t.value; profileSave(); toast("Okay, " + t.options[t.selectedIndex].text + " it is"); } }
  else if(t.closest("#profRules")){ setTimeout(() => { readRules($("#profRules")); profileSave(); renderProfile(); toast("Rules saved"); }, 0); }  // wait so events.js can fill the new scale's defaults first
  else if(t.id === "pPhoto" && t.files[0]){
    shrinkPhoto(t.files[0], url => { if(!url) return toast("Could not read that photo"); S.profile = S.profile || {}; S.profile.photo = url; S.profile.avatar = "photo"; profileSave(); renderProfile(); toast("Looking good!"); });
  }
  else if(t.id === "bkFile" && t.files[0]){
    const f = t.files[0], r = new FileReader();
    r.onload = () => {
      try{
        const d = JSON.parse(r.result);
        if(!d || typeof d !== "object" || Array.isArray(d) || !("setup" in d || "journey" in d || "pets" in d)) throw 0;
        if(!confirm("Replace the data on this device with this backup?")) return;
        restoreData(d); save(); applyLook(); renderAll(); profileMsg("Backup restored");
      }catch(err){ profileMsg("That file is not a Bestie HQ backup"); }
    };
    r.readAsText(f);
  }
});
