/* Money tab: spending (budget + list) and wishlist */
"use strict";

const CATS = ["Food","Commute","School","Fun","Others"];
let pickedCat = "Food", pickedKind = "";
function renderMoney(){
  if(!S.streakFrom){ S.streakFrom = today(); save(); }
  const month = today().slice(0,7);
  const mine = S.expenses.filter(e => e.date.slice(0,7) === month).sort((a,b)=> b.date.localeCompare(a.date) || b.ts-a.ts);
  const spent = mine.reduce((s,e)=>s+e.amt,0);
  const left = S.budget - spent, pct = S.budget>0 ? Math.min(100, spent/S.budget*100) : 0;
  const monthName = new Date().toLocaleString("en-PH",{month:"long"});

  let html = segHtml("money", [["spend","Spending"],["wish","Jar & wishes"]]) + '<div class="panes" data-show="'+pane.money+'">';

  // spending
  html += '<div class="pane stack" data-pane-id="spend"><section class="card hero-money"><div class="cardhead"><h2>'+monthName+' spending</h2><button type="button" class="chipbtn" id="editBudget">Budget <span class="num">'+peso(S.budget)+'</span></button></div>' +
    '<div class="big num">'+peso(spent)+'</div><div class="mbar'+(left<0?" hot":"")+'"><i style="width:'+pct+'%"></i></div>' +
    '<div class="num leftline">'+(left>=0 ? '<b>'+peso(left)+'</b> left this month' : '<b style="color:var(--warn)">'+peso(-left)+' over budget</b>')+'</div><div class="cats">';
  CATS.forEach(c => { const v = mine.filter(e=>e.cat===c).reduce((s,e)=>s+e.amt,0); const w = spent>0 ? v/spent*100 : 0;
    const lim = limitOf(c), hot = lim && v > lim, ww = lim ? Math.min(100, v/lim*100) : w;
    html += '<div class="cat"><span>'+c+'</span><span class="track"><i style="width:'+ww+'%'+(hot?";background:var(--warn)":"")+'"></i></span><span class="num" style="text-align:right">'+peso(v)+(lim?'<small class="of"> / '+peso(lim)+'</small>':'')+'</span></div>'; });
  html += '</div></section>' + renderCoach();

  html += '<section class="card"><div class="cardhead"><h2>This month</h2><span class="hint num">'+mine.length+(mine.length===1?' entry':' entries')+'</span></div>';
  if(!mine.length) html += '<div class="empty">'+pomFor("pom")+'<p>Nothing logged yet this month. Tap <b>+ Expense</b> to add your first one.</p></div>';
  else { html += '<ul class="list">'; mine.slice(0,30).forEach(e => {
      html += '<li class="row"><span class="catdot c-'+e.cat.toLowerCase()+'" aria-hidden="true">'+e.cat[0]+'</span><div class="grow"><div class="t">'+esc(e.note||e.cat)+'</div><div class="s">'+e.cat+', '+new Date(e.date+"T00:00").toLocaleDateString("en-PH",{month:"short",day:"numeric"})+'</div></div><b class="num">'+peso(e.amt)+'</b>'+(e.pic?'<button type="button" class="x pic" data-epic="'+e.id+'" aria-label="View receipt photo">📷</button>':'')+'<button type="button" class="x" data-edel="'+e.id+'" aria-label="Delete">×</button></li>'; });
    html += '</ul>'; }
  html += '</section></div>';

  // wishlist
  html += '<div class="pane stack" data-pane-id="wish">' + renderJar() + renderWaits() + '<section class="card"><div class="cardhead"><h2>Wishlist</h2><button type="button" class="btn acc sm" id="addWish">+ Wish</button></div>';
  if(!S.wishes.length) html += '<div class="empty">'+pomFor("pom")+'<p>Add something you want to buy, then track your savings toward it.</p></div>';
  else { html += '<div class="stack">'; S.wishes.forEach(w => {
      const p = w.price>0 ? Math.min(100, w.saved/w.price*100) : 0, got = w.saved >= w.price && w.price>0;
      html += '<div class="wish'+(got?" got":"")+'"><div class="head"><b>'+esc(w.name)+'</b><button type="button" class="x" data-wdel="'+w.id+'" aria-label="Delete">×</button></div>' +
        '<div class="num" style="font-size:.88rem">'+peso(w.saved)+' of '+peso(w.price)+(got?', <b style="color:var(--good)">goal reached! '+tx(50)+'</b>':', '+peso(w.price-w.saved)+' to go')+'</div>' +
        '<div class="mbar" style="margin:2px 0"><i style="width:'+p+'%"></i></div>' +
        (got?'':'<form data-wadd="'+w.id+'"><input class="inp num" type="number" inputmode="decimal" min="0.01" step="0.01" placeholder="₱ saved today" aria-label="Amount saved for '+esc(w.name)+'" required><button class="btn" type="submit">Add</button></form>') + '</div>'; });
    html += '</div>'; }
  html += '</section></div></div>';

  html += '<button type="button" class="fab'+(pane.money==="wish"?" on-wish":"")+'" id="addExpense"><span aria-hidden="true">+</span> Expense</button>';
  $("#view").innerHTML = html;
  checkChallenge();
}
