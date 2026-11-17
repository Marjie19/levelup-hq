/* Small helpers used everywhere */
"use strict";

const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const peso = n => "₱" + (Math.round(n*100)/100).toLocaleString("en-PH",{minimumFractionDigits:0,maximumFractionDigits:2});
const today = () => { const d=new Date(); return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"); };
let toastT;
function toast(msg){ const t=$("#toast"); t.textContent=msg; t.hidden=false; clearTimeout(toastT); toastT=setTimeout(()=>t.hidden=true,2600); }
function pomSvg(cls){ return petSvg(activePet(), {cls:cls}); }

// Which half of a tab is showing on phone (laptop shows both side by side)
const pane = {journey:"map", money:"spend"};
function segHtml(group, opts){
  return '<div class="seg" role="tablist" aria-label="Switch view">' + opts.map(([k,label]) =>
    '<button type="button" role="tab" data-pane="'+group+':'+k+'" aria-selected="'+(pane[group]===k)+'">'+label+'</button>').join("") + '</div>';
}
