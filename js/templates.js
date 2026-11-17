/* Journey templates and the choices for customizing a journey (themes, pets, icons).
   A journey is a list of "stops". Each stop is a term (you log a GPA), a milestone (you tick it off), or the graduation finish. */
"use strict";

const MAX_STOPS = 30;

const TEMPLATES = [
  {id:"sem4", name:"College, 4 years", sub:"2 semesters a year", emoji:"🎓", years:4, per:2, unit:"Semester", short:"S"},
  {id:"tri4", name:"College, 4 years", sub:"3 trimesters a year", emoji:"📚", years:4, per:3, unit:"Trimester", short:"T"},
  {id:"board5", name:"5-year course + board exam", sub:"Engineering, Architecture, Nursing and more", emoji:"📝", years:5, per:2, unit:"Semester", short:"S",
    after:[{group:"Licensure", label:"Board exam", icon:"📝", xp:300}, {group:"Licensure", label:"Licensed!", icon:"🏅", xp:200}]},
  {id:"shs2", name:"Senior High", sub:"Grade 11 and 12", emoji:"🎒", years:2, per:2, unit:"Semester", short:"S", yearNames:["Grade 11","Grade 12"]}
];
const CUSTOM_CARD = {id:"custom", name:"My own journey", sub:"Add, remove and rename up to " + MAX_STOPS + " stops", emoji:"✏️"};

// Term ids look like "1-1" (year-term). Old saved GPAs use the same ids, so nothing is lost when a template is picked.
function buildFrom(t){
  const stops = [];
  for(let y = 1; y <= t.years; y++){
    const g = t.yearNames ? t.yearNames[y-1] : "Year " + y;
    for(let q = 1; q <= t.per; q++) stops.push({id:y+"-"+q, kind:"term", group:g, label:g+", "+t.unit+" "+q, short:t.short+q});
  }
  stops.push({id:"grad", kind:"grad", group:"", label:"Graduation day"});
  (t.after || []).forEach((a, i) => stops.push({id:"m-"+(t.id||"x")+"-"+i, kind:"mile", group:a.group, label:a.label, icon:a.icon, xp:a.xp, done:false}));
  return stops;
}
function buildStops(id){ return buildFrom(TEMPLATES.find(t => t.id === id) || TEMPLATES[1]); }

const THEMES = [
  {id:"plain", name:"Plain", emoji:"✨", decor:[]},
  {id:"forest", name:"Forest", emoji:"🌲", decor:["🌲","🍄","🦋"]},
  {id:"space", name:"Space", emoji:"🚀", decor:["⭐","🪐","🌙"]},
  {id:"candy", name:"Candy", emoji:"🍭", decor:["🍭","🧁","🍬"]},
  {id:"beach", name:"Beach", emoji:"🏖️", decor:["🐚","🌴","🌊"]}
];
// "pom" uses the drawn Pomeranian. The others use an emoji.
const PETS = [
  {id:"pom", name:"Pom", label:"Pomeranian"},
  {id:"cat", name:"Mochi", label:"Cat", emoji:"🐱"},
  {id:"bunny", name:"Bun", label:"Bunny", emoji:"🐰"},
  {id:"panda", name:"Bamboo", label:"Panda", emoji:"🐼"},
  {id:"chick", name:"Chirp", label:"Chick", emoji:"🐥"}
];
const STOP_ICONS = ["⭐","🎓","📚","💼","🏆","📝","🏅","✈️","🧪","🩺","⚖️","🏗️","💻","🎨","❤️","🚀"];
