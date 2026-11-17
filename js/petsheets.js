/* Companion sheets: make or edit a companion, feed, and the style shop (accessories and rooms) */
"use strict";

function openFeed(){
  const p = activePet();
  modal('<h3>Feed '+esc(p.name)+'</h3><p class="muted" style="margin:0">You have 🍪 <b class="num">'+treats()+'</b> treats.</p>' +
    '<div class="shop" id="shop">' + FOODS.map(f => '<button type="button" class="item'+(treats()<f.cost?" poor":"")+'" data-food="'+f.id+'"><span class="ie" aria-hidden="true">'+f.emoji+'</span><b>'+f.name+'</b><span class="ic">🍪 '+f.cost+'</span></button>').join("") + '</div>' +
    '<div class="acts"><button type="button" class="btn ghost" id="cancel">Close</button></div>', m => {
      m.querySelector("#cancel").onclick = closeModal;
      m.querySelector("#shop").addEventListener("click", e => {
        const b = e.target.closest("[data-food]"); if(!b) return;
        const f = FOODS.find(x => x.id === b.dataset.food);
        if(!feedPet(p, f)) return toast("Need " + (f.cost - treats()) + " more treats. Finish a task or study to earn some.");
        petFx = "eat"; closeModal(); renderAll(); toast(p.name + " loved the " + f.name.toLowerCase() + "!");
      });
    });
}

// Style shop: accessories for this companion, rooms for everyone
function openStyle(){
  const p = activePet();
  let tab = "acc";
  modal('<h3>Style</h3><div class="seg" id="styTabs"><button type="button" data-t="acc" aria-selected="true">Outfits</button><button type="button" data-t="room" aria-selected="false">Rooms</button></div>' +
    '<p class="muted" style="margin:0">You have 🍪 <b class="num" id="styBal"></b> treats. Tap to buy or wear.</p><div class="shop" id="styShop"></div>' +
    '<div class="acts"><button type="button" class="btn acc" id="cancel">Done</button></div>', m => {
      const draw = () => {
        m.querySelector("#styBal").textContent = treats();
        const list = tab === "acc" ? ACCS : ROOMS, owned = tab === "acc" ? S.owned.acc : S.owned.room, on = tab === "acc" ? p.acc : S.room;
        m.querySelector("#styShop").innerHTML = list.map(it => {
          const has = owned.indexOf(it.id) >= 0;
          return '<button type="button" class="item'+(it.id===on?" on":"")+(!has && treats()<it.cost?" poor":"")+'" data-id="'+it.id+'"><span class="ie" aria-hidden="true">'+it.emoji+'</span><b>'+it.name+'</b><span class="ic">'+(it.id===on?"Wearing":has?"Owned":"🍪 "+it.cost)+'</span></button>';
        }).join("");
      };
      m.querySelector("#cancel").onclick = () => { closeModal(); renderAll(); };
      m.querySelector("#styTabs").addEventListener("click", e => {
        const b = e.target.closest("[data-t]"); if(!b) return; tab = b.dataset.t;
        m.querySelectorAll("#styTabs button").forEach(x => x.setAttribute("aria-selected", x === b)); draw();
      });
      m.querySelector("#styShop").addEventListener("click", e => {
        const b = e.target.closest("[data-id]"); if(!b) return;
        const list = tab === "acc" ? ACCS : ROOMS, it = list.find(x => x.id === b.dataset.id), owned = tab === "acc" ? S.owned.acc : S.owned.room;
        if(owned.indexOf(it.id) < 0){
          if(!spendTreats(it.cost)) return toast("Need " + (it.cost - treats()) + " more treats for the " + it.name.toLowerCase() + ".");
          owned.push(it.id); toast("Bought the " + it.name.toLowerCase() + "!");
        }
        if(tab === "acc") p.acc = it.id; else S.room = it.id;
        save(); draw(); renderHeader();
      });
      draw();
    });
}

// Make a new companion, or edit one. mode: "new" (adopt a friend), "first" (your very first one), "edit"
function openMaker(mode, id){
  const base = mode === "edit" ? S.pets.find(x => x.id === id) : (mode === "first" ? S.pets[0] : null);
  const draft = base ? Object.assign({}, base) : newPet("pom");
  if(mode === "new"){ const d = speciesDefaults("pom"); draft.m = d.m; draft.a = d.a; draft.s = d.s; draft.acc = "none"; draft.name = NAME_IDEAS[Math.floor(Math.random()*NAME_IDEAS.length)]; }
  const canPickSpecies = mode !== "edit";
  let kind = SPECIES[draft.species].kind;
  const rowsFor = k => k === "person" ? [["m","Hair",HAIR_COLORS],["a","Shirt",ACCENT_COLORS],["s","Skin",SKIN_COLORS]] : [["m",k==="animal"?"Fur":"Body",MAIN_COLORS],["a","Details",ACCENT_COLORS]];
  modal('<h3>'+(mode==="new"?"Meet a new friend":mode==="first"?"Pick your companion":"Edit "+esc(base.name))+'</h3>' +
    '<div class="mkprev" id="mkPrev"></div>' +
    (canPickSpecies ? '<div class="seg" id="mkKinds">'+KINDS.map(k => '<button type="button" data-kind="'+k.id+'" aria-selected="false">'+k.emoji+' '+k.label+'</button>').join("")+'</div><div class="specs" id="mkSpecies"></div>' : '') +
    '<div id="mkColors"></div>' +
    '<div class="field"><label for="mkName">Name</label><div class="namerow"><input class="inp" id="mkName" maxlength="14" value="'+esc(draft.name)+'"><button type="button" class="btn ghost sm" id="mkDice" aria-label="Random name">🎲</button></div></div>' +
    '<div class="acts">'+(mode==="first"?'':'<button type="button" class="btn ghost" id="cancel">Cancel</button>')+'<button type="button" class="btn acc" id="mkSave">'+(mode==="new"?"Welcome them!":"Save")+'</button></div>', (m) => {
      const q = s => m.querySelector(s);
      const drawAll = () => {
        q("#mkPrev").innerHTML = petSvg(draft, {full:true, cls:"mkpet"}) + '<span class="mkname">'+esc(q("#mkName").value || draft.name)+'</span>';
        if(canPickSpecies){
          q("#mkKinds").querySelectorAll("button").forEach(b => b.setAttribute("aria-selected", b.dataset.kind === kind));
          q("#mkSpecies").innerHTML = Object.keys(SPECIES).filter(k => SPECIES[k].kind === kind).map(k => {
            const d = speciesDefaults(k);
            return '<button type="button" class="spec" data-sp="'+k+'" aria-pressed="'+(k===draft.species)+'">'+petSvg({species:k, m:d.m, a:d.a, s:d.s, acc:"none", name:SPECIES[k].label, hunger:90, joy:90, t:Date.now(), care:0, g0:0}, {full:true, mood:"happy"})+'<span>'+SPECIES[k].label+'</span></button>';
          }).join("");
        }
        q("#mkColors").innerHTML = rowsFor(kind).map(r => '<div class="swrow"><span>'+r[1]+'</span><div>'+r[2].map((c, i) =>
          '<button type="button" class="sw" data-row="'+r[0]+'" data-c="'+c+'" style="background:'+c+'" aria-pressed="'+(draft[r[0]]===c)+'" aria-label="'+r[1]+' color '+(i+1)+'"></button>').join("")+'</div></div>').join("");
      };
      if(q("#cancel")) q("#cancel").onclick = closeModal;
      q("#mkName").addEventListener("input", () => { draft.name = q("#mkName").value; q("#mkPrev .mkname").textContent = draft.name || "?"; });
      q("#mkDice").onclick = () => { draft.name = NAME_IDEAS[Math.floor(Math.random()*NAME_IDEAS.length)]; q("#mkName").value = draft.name; drawAll(); };
      m.querySelector(".sheet").addEventListener("click", e => {
        const b = e.target.closest("button"); if(!b) return;
        if(b.dataset.kind){ kind = b.dataset.kind; const first = Object.keys(SPECIES).find(k => SPECIES[k].kind === kind); const d = speciesDefaults(first); Object.assign(draft, {species:first, m:d.m, a:d.a, s:d.s}); drawAll(); }
        else if(b.dataset.sp){ const d = speciesDefaults(b.dataset.sp); Object.assign(draft, {species:b.dataset.sp, m:d.m, a:d.a, s:d.s}); drawAll(); }
        else if(b.dataset.row){ draft[b.dataset.row] = b.dataset.c; drawAll(); }
      });
      q("#mkSave").onclick = () => {
        const name = q("#mkName").value.trim().slice(0,14) || "Buddy"; draft.name = name;
        if(mode === "new"){
          if(S.pets.length >= MAX_PETS || S.pets.length >= slotsUnlocked()) return toast("Keep growing to unlock another companion.");
          draft.id = uid8(); draft.g0 = growth(); draft.care = 0; draft.hunger = 85; draft.joy = 85; draft.t = Date.now();
          S.pets.push(draft); S.activePet = draft.id;
        } else Object.assign(S.pets.find(x => x.id === draft.id), draft);
        save(); closeModal(); renderAll(); if(mode === "new") confetti(null, 50); toast(mode === "new" ? name + " joined you!" : mode === "first" ? "Meet " + name + "!" : "Saved");
      };
      drawAll();
    });
}
