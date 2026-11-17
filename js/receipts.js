/* Receipt photos: take or pick a photo, keep it on this device, and read the total/date/store from it.
   The photo never leaves the phone. Reading it uses Tesseract (a free reader) that loads from a CDN the first time you use it. */
"use strict";

// ----- storage: photos live in IndexedDB (localStorage is too small for pictures) -----
const rcpt = (function(){
  let dbp;
  function db(){
    return dbp || (dbp = new Promise((res, rej) => {
      const r = indexedDB.open("levelup-hq", 1);
      r.onupgradeneeded = () => r.result.createObjectStore("receipts");
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    }));
  }
  function tx(mode, fn){
    return db().then(d => new Promise((res, rej) => {
      const t = d.transaction("receipts", mode), q = fn(t.objectStore("receipts"));
      t.oncomplete = () => res(q && q.result);
      t.onerror = () => rej(t.error);
    }));
  }
  return {put:(id, blob) => tx("readwrite", s => s.put(blob, id)), get:id => tx("readonly", s => s.get(id)), del:id => tx("readwrite", s => s.delete(id))};
})();

let pendingPic = null;   // the photo in the open "Add an expense" sheet
function savePendingPic(id){
  if(!pendingPic) return;
  const blob = pendingPic; pendingPic = null;
  rcpt.put(id, blob).catch(() => {
    const x = S.expenses.find(e => e.id === id); if(x){ x.pic = false; save(); renderAll(); }
    toast("Couldn't save the photo on this device");
  });
}

// ----- reading the text -----
const MONTHS = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];
const CAT_WORDS = {
  Food:["restaurant","cafe","coffee","jollibee","mcdonald","mcdo","kfc","starbucks","7-eleven","7 eleven","seven eleven","bakery","milk tea","pizza","burger","grill","kitchen","food","chowking","mang inasal"],
  Commute:["grab","angkas","lrt","mrt","beep","petron","shell","caltex","phoenix","parking","toll","fuel","gasoline","taxi"],
  School:["national book store","bookstore","xerox","photocopy","printing","school","notebook","stationery","supplies"],
  Fun:["cinema","movie","ticket","arcade","game","concert"]
};
function numberOf(str){ return parseFloat(str.replace(/,/g, "")); }

// Pure function: turns the text from a receipt into {amount, conf, date, merchant, cat}
function parseReceipt(text, now){
  const today = now ? new Date(now) : new Date();
  const lines = String(text || "").split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const numRe = /\d{1,3}(?:,\d{3})+\.\d{2}|\d+\.\d{2}/g;
  const nums = l => (l.match(numRe) || []).map(numberOf);
  const totalRe = /grand\s*total|total\s*due|amount\s*due|total\s*amount|amt\.?\s*due|net\s*total|total\s*sales?|balance\s*due|\btotal\b/i;
  const skipRe = /sub\s*-?\s*total|total\s*(items?|qty|quantity|pcs|discount|vat|tax)|vatable|vat\s*amt|change/i;

  const cands = [];
  lines.forEach((l, i) => {
    if(!totalRe.test(l) || skipRe.test(l)) return;
    const n = nums(l);
    if(n.length) cands.push(n[n.length - 1]);
    else if(lines[i+1]){ const n2 = nums(lines[i+1]); if(n2.length) cands.push(n2[0]); }
  });
  let amount = null, conf = "low";
  if(cands.length){ amount = Math.max.apply(null, cands); conf = "ok"; }
  else {
    const all = [].concat.apply([], lines.map(nums)).filter(n => n > 0 && n < 100000);
    if(all.length) amount = Math.max.apply(null, all);   // the biggest number is usually the total, but it could be the cash given
  }

  // date
  let date = null;
  const full = lines.join(" ");
  let m;
  const valid = (y, mo, d) => {
    if(y < 100) y += 2000;
    const dt = new Date(y, mo - 1, d);
    if(dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) return null;
    if(y < 2015 || dt > new Date(today.getTime() + 86400000)) return null;
    return y + "-" + String(mo).padStart(2, "0") + "-" + String(d).padStart(2, "0");
  };
  if((m = full.match(/\b(20\d{2})[\/\-.](\d{1,2})[\/\-.](\d{1,2})\b/))) date = valid(+m[1], +m[2], +m[3]);
  if(!date && (m = full.match(/\b(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})\b/))){
    const a = +m[1], b = +m[2], y = +m[3];
    date = a > 12 ? valid(y, b, a) : valid(y, a, b);   // Philippine receipts are usually month/day/year
  }
  if(!date && (m = full.match(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+(\d{1,2}),?\s+(\d{4})\b/i))) date = valid(+m[3], MONTHS.indexOf(m[1].toLowerCase()) + 1, +m[2]);

  // store name: the first line that looks like words
  let merchant = "";
  const nameLine = lines.find(l => { const k = (l.match(/[A-Za-z]/g) || []).length; return k >= 3 && k / l.length >= 0.5; });
  if(nameLine){
    merchant = nameLine.replace(/[^A-Za-z0-9&'.\- ]/g, " ").replace(/\s+/g, " ").trim().slice(0, 40);
    if(merchant === merchant.toUpperCase()) merchant = merchant.toLowerCase().replace(/\b[a-z]/g, c => c.toUpperCase());
  }

  const low = full.toLowerCase();
  let cat = null;
  Object.keys(CAT_WORDS).some(k => CAT_WORDS[k].some(w => low.indexOf(w) >= 0) && (cat = k));
  return {amount, conf, date, merchant, cat};
}

let tessLoad = null;
function loadTesseract(){
  if(window.Tesseract) return Promise.resolve();
  return tessLoad || (tessLoad = new Promise((res, rej) => {
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js";
    // The browser refuses the file if it ever differs from this fingerprint (protects against a tampered CDN copy).
    s.integrity = "sha384-GJqSu7vueQ9qN0E9yLPb3Wtpd7OrgK8KmYzC8T1IysG1bcvxvIO4qtYR/D3A991F";
    s.crossOrigin = "anonymous";
    s.onload = res;
    s.onerror = () => { tessLoad = null; rej(new Error("reader failed to load")); };
    document.head.appendChild(s);
  }));
}

// ----- photo helpers -----
function fileToCanvas(file, max){
  return new Promise((res, rej) => {
    const url = URL.createObjectURL(file), img = new Image();
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
      const c = document.createElement("canvas");
      c.width = Math.round(img.naturalWidth * k); c.height = Math.round(img.naturalHeight * k);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url); res(c);
    };
    img.onerror = () => { URL.revokeObjectURL(url); rej(new Error("bad image")); };
    img.src = url;
  });
}
// Grayscale + stretched contrast makes receipt text easier to read
function grayCanvas(src){
  const c = document.createElement("canvas"); c.width = src.width; c.height = src.height;
  const ctx = c.getContext("2d"); ctx.drawImage(src, 0, 0);
  const d = ctx.getImageData(0, 0, c.width, c.height), p = d.data;
  let lo = 255, hi = 0;
  for(let i = 0; i < p.length; i += 4){ const g = (p[i]*.3 + p[i+1]*.59 + p[i+2]*.11) | 0; p[i] = g; if(g < lo) lo = g; if(g > hi) hi = g; }
  const span = Math.max(1, hi - lo);
  for(let i = 0; i < p.length; i += 4){ const v = Math.max(0, Math.min(255, ((p[i] - lo) / span) * 255 * 1.1)); p[i] = p[i+1] = p[i+2] = v; }
  ctx.putImageData(d, 0, 0);
  return c;
}

// ----- the "Add an expense" sheet: wire up the photo buttons -----
function snapHtml(){
  return '<div class="snap"><div class="snapbtns"><button type="button" class="btn ghost sm" id="snapCam">📷 Take photo</button><button type="button" class="btn ghost sm" id="snapPick">🖼️ Choose photo</button></div>' +
    '<input type="file" id="fCam" accept="image/*" capture="environment" hidden><input type="file" id="fPick" accept="image/*" hidden>' +
    '<div class="snapprev" id="snapPrev" hidden><img id="snapImg" alt="Receipt photo"><div class="snapinfo"><span id="snapMsg" role="status"></span><div class="mbar"><i id="snapBar" style="width:0%"></i></div></div>' +
    '<button type="button" class="x" id="snapRemove" aria-label="Remove photo">×</button></div>' +
    '<p class="hint" id="snapHint" style="margin:0">Snap your receipt and the app fills in the amount for you. You always get to check it.</p></div>';
}
function wireSnap(m){
  pendingPic = null;
  const q = s => m.querySelector(s);
  m.querySelector("#snapCam").onclick = () => q("#fCam").click();
  m.querySelector("#snapPick").onclick = () => q("#fPick").click();
  q("#fCam").onchange = q("#fPick").onchange = e => { const f = e.target.files && e.target.files[0]; e.target.value = ""; if(f) handleSnapFile(f, m); };
  q("#snapRemove").onclick = () => { pendingPic = null; q("#snapPrev").hidden = true; q("#snapHint").hidden = false; };
}
async function handleSnapFile(file, m){
  const q = s => m.querySelector(s);
  const alive = () => document.body.contains(q("#snapMsg"));
  const say = (t, pct) => { if(!alive()) return; q("#snapMsg").textContent = t; q("#snapBar").style.width = pct + "%"; };
  q("#snapPrev").hidden = false; q("#snapHint").hidden = true;
  say("Preparing photo…", 4);
  let canvas;
  try{ canvas = await fileToCanvas(file, 1500); }
  catch(err){ say("Couldn't open that photo. Try another one.", 0); return; }
  const blob = await new Promise(r => canvas.toBlob(r, "image/jpeg", 0.78));
  if(!alive()) return;
  pendingPic = blob; q("#snapImg").src = URL.createObjectURL(blob);
  try{
    say("Loading the reader (only the first time)…", 8);
    await loadTesseract();
    say("Reading your receipt…", 12);
    const res = await Tesseract.recognize(grayCanvas(canvas), "eng", {logger: l => { if(l.status === "recognizing text") say("Reading your receipt… " + Math.round(l.progress*100) + "%", 12 + l.progress*88); }});
    if(!alive()) return;
    const r = parseReceipt(res.data.text);
    fillFromReceipt(m, r);
  }catch(err){
    say("Photo saved. Couldn't read it automatically (reading needs internet the first time). Type the amount in.", 0);
  }
}
function fillFromReceipt(m, r){
  const q = s => m.querySelector(s), flash = el => { el.classList.remove("autofill"); void el.offsetWidth; el.classList.add("autofill"); };
  const say = (t, pct) => { q("#snapMsg").textContent = t; q("#snapBar").style.width = pct + "%"; };
  if(r.amount){ const a = q("#eAmt"); a.value = r.amount; flash(a); }
  if(r.date){ const d = q("#eDate"); d.value = r.date; flash(d); }
  if(r.merchant && !q("#eNote").value.trim()){ const n = q("#eNote"); n.value = r.merchant; flash(n); }
  if(r.cat){ pickedCat = r.cat; m.querySelectorAll("[data-cat]").forEach(c => c.setAttribute("aria-pressed", c.dataset.cat === pickedCat)); }
  if(r.amount) say("Found " + peso(r.amount) + (r.conf === "low" ? ". Not sure about this one, please check it." : ". Please check it before saving."), 100);
  else say("Photo saved, but I couldn't find the total. Type the amount in.", 100);
}

// ----- view a saved receipt -----
function openReceipt(id){
  rcpt.get(id).then(blob => {
    if(!blob) return toast("That photo isn't on this device");
    const url = URL.createObjectURL(blob), e = S.expenses.find(x => x.id === id);
    modal('<h3>Receipt'+(e ? ": " + esc(e.note || e.cat) : "")+'</h3><img class="rimg" src="'+url+'" alt="Receipt photo">' +
      '<div class="acts"><button type="button" class="btn ghost" id="delPic" style="margin-right:auto;color:var(--warn)">Delete photo</button><button type="button" class="btn acc" id="cancel">Close</button></div>', m => {
        m.querySelector("#cancel").onclick = () => { URL.revokeObjectURL(url); closeModal(); };
        let armed = false;
        m.querySelector("#delPic").onclick = ev => {
          if(!armed){ armed = true; ev.target.textContent = "Tap again to delete"; return; }
          rcpt.del(id).catch(() => {}); if(e) e.pic = false; save(); URL.revokeObjectURL(url); closeModal(); renderAll(); toast("Photo deleted");
        };
      });
  }).catch(() => toast("Couldn't open the photo"));
}
