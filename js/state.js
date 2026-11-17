/* State: your data and its default shape */
"use strict";

const uid8 = () => Math.random().toString(36).slice(2,10);
const DEFAULT_GOALS = [
  ["Land my first job",23],["Start masters or law school",23],["Buy my own car",24],
  ["Move into my own condo",24],["Build my dream house",28],["Hit ₱1M net worth",28]
];
function fresh(){
  return {v:1,setup:false,name:"",age:20,years:4,tpy:3,cutoff:3.5,scale:"4",minUnits:12,worst:null,gpas:{},deanFlags:{},quests:[],
    journey:{tpl:"tri4",stops:buildStops("tri4")},customStops:null,theme:"plain",pet:{type:"pom",name:"Pom"},petAt:null,
    calc:{term:"",courses:[1,2,3,4].map(()=>({id:uid8(),name:"",units:3,grade:null}))},
    goals:DEFAULT_GOALS.map(([title,age])=>({id:uid8(),title,age,done:false})),
    budget:3000,expenses:[],wishes:[],updated:0};
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
try{ const raw = localStorage.getItem(LS_KEY); if(raw){ const d = JSON.parse(raw); S = Object.assign(fresh(), d); if(!d.journey || !d.journey.stops) migrateJourney(d); } }catch(e){}
