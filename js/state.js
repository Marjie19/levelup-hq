/* State: your data and its default shape */
"use strict";

const uid8 = () => Math.random().toString(36).slice(2,10);
const DEFAULT_GOALS = [
  ["Land my first job",23],["Start masters or law school",23],["Buy my own car",24],
  ["Move into my own condo",24],["Build my dream house",28],["Hit ₱1M net worth",28]
];
function fresh(){
  return {v:1,setup:false,name:"",age:20,years:4,tpy:3,cutoff:3.5,scale:"4",minUnits:12,worst:null,gpas:{},deanFlags:{},quests:starterQuests(),questsSeeded:true,
    tasks:[],classes:[],courses:[],docs:[],projects:[],
    journey:{tpl:"tri4",stops:buildStops("tri4")},customStops:null,theme:"plain",petAt:null,
    pets:[{id:uid8(),name:"Pom",species:"pom",m:"#f7a94f",a:"#d9772a",s:"#f3c9a1",acc:"none",hunger:80,joy:80,t:Date.now(),care:0,g0:0}],activePet:null,
    room:"cozy",owned:{acc:["none"],room:["cozy"]},treatsSpent:0,bonusTreats:0,studyTreats:0,lastGift:"",
    calc:{term:"",courses:[1,2,3,4].map(()=>({id:uid8(),name:"",units:3,grade:null}))},
    goals:DEFAULT_GOALS.map(([title,age])=>({id:uid8(),title,age,done:false})),
    budget:3000,expenses:[],wishes:[],tone:"real",catLimits:{},dayCap:0,challenge:null,streakFrom:"",waits:[],jar:0,jarGoal:0,skipped:0,reminders:[],remind:{notify:false,feed:true,budget:true,evening:false,eveningAt:"20:00"},remindLog:{},welcomed:false,tipsOff:{},look:{mode:"auto",accent:"apricot"},profile:{school:"",program:"",photo:"",avatar:"pet"},updated:0};
}
let S = fresh();
const LS_KEY = "levelup-hq-v1";
// Data saved before journeys existed only has years and terms per year, so build the matching stops from those.
function migrateJourney(d){
  const years = d.years || 4, per = d.tpy || 3;
  const tpl = years === 4 && per === 3 ? "tri4" : years === 4 && per === 2 ? "sem4" : "custom";
  const stops = buildFrom({years:years, per:per, unit:"Term", short:"T"});
  if(tpl === "custom") S.customStops = stops;
  S.journey = {tpl:tpl, stops:stops};
}
// Before companions, the app had one pet picked on the Journey sheet. It becomes the first companion.
function migratePets(d){
  const map = {pom:"pom", cat:"cat", bunny:"bunny", panda:"bear", chick:"pom"};
  const old = d.pet || {type:"pom", name:"Pom"};
  S.pets[0].species = map[old.type] || "pom";
  S.pets[0].name = String(old.name || "Pom").slice(0,14);
}
try{ const raw = localStorage.getItem(LS_KEY); if(raw){ const d = JSON.parse(raw); S = Object.assign(fresh(), d); if(!d.questsSeeded){ S.quests = (d.quests && d.quests.length) ? d.quests : starterQuests(); S.questsSeeded = true; } if(!d.journey || !d.journey.stops) migrateJourney(d); if(!d.pets) migratePets(d); } }catch(e){}
