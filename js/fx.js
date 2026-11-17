/* Little celebrations: confetti */
"use strict";

// Confetti bursts out of a spot on the screen (an element, or the middle of the screen)
function confetti(el, count){
  if(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const r = el && el.getBoundingClientRect ? el.getBoundingClientRect() : {left:innerWidth/2, top:innerHeight/2.5, width:0, height:0};
  const x = r.left + r.width / 2, y = r.top + r.height / 2, colors = ["#f28f2c","#7458d6","#ff8fa3","#4fd39a","#f2c94c","#6fb7f0"];
  for(let i = 0; i < (count || 28); i++){
    const c = document.createElement("i"), a = Math.random() * Math.PI * 2, d = 70 + Math.random() * 130;
    c.className = "confetti"; c.style.left = x + "px"; c.style.top = y + "px"; c.style.background = colors[i % colors.length];
    c.style.setProperty("--dx", (Math.cos(a) * d).toFixed(0) + "px");
    c.style.setProperty("--dy", (Math.sin(a) * d + 90).toFixed(0) + "px");
    c.style.setProperty("--rot", (Math.random() * 720 - 360).toFixed(0) + "deg");
    document.body.appendChild(c);
    setTimeout(() => c.remove(), 1300);
  }
}
