/* State: your data and its default shape */
"use strict";

const uid8 = () => Math.random().toString(36).slice(2,10);
const DEFAULT_GOALS = [
  ["Land my first job",23],["Start masters or law school",23],["Buy my own car",24],
  ["Move into my own condo",24],["Build my dream house",28],["Hit ₱1M net worth",28]
];
function fresh(){
  return {v:1,setup:false,name:"",age:20,years:4,tpy:3,cutoff:3.5,scale:"4",minUnits:12,worst:null,gpas:{},deanFlags:{},quests:[],
    calc:{term:"",courses:[1,2,3,4].map(()=>({id:uid8(),name:"",units:3,grade:null}))},
    goals:DEFAULT_GOALS.map(([title,age])=>({id:uid8(),title,age,done:false})),
    budget:3000,expenses:[],wishes:[],updated:0};
}
let S = fresh();
const LS_KEY = "levelup-hq-v1";
try{ const raw = localStorage.getItem(LS_KEY); if(raw){ S = Object.assign(fresh(), JSON.parse(raw)); } }catch(e){}
