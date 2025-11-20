
/* V10 TikTok Integration */

const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http,{cors:{origin:'*'}});
app.use(express.static('public'));

let players=new Map();
let topGifters=new Map();

let heistModes=["standard","cyber","stealth_ops","casino","firestorm"];
let phaseOrder=["idle","planning","action","escape"];

let state={
  phase:"idle",
  heistMode:"standard",
  players:[],
  loot:0,
  maxLoot:100,
  heat:0,
  maxHeat:100,
  successChance:50,
  escapeTimer:15,
  topGifters:[]
};

io.on("connection",socket=>{
  socket.emit("city_heist_state",state);

  socket.on("tiktok_chat",(msg)=>{
    let text=(msg.text||"").toLowerCase();
    let id=msg.userId||msg.uniqueId;
    let name=msg.displayName||msg.uniqueId||"viewer";

    if(text.includes("!join")){
      if(!players.has(id)) players.set(id,{name,role:"crew",power:1});
    }
    if(text.includes("!hack")) action(id,"hack");
    if(text.includes("!smash")) action(id,"smash");
    if(text.includes("!rush")) action(id,"rush");
    if(text.includes("!sneak")) action(id,"sneak");
  });

  socket.on("tiktok_gift",(gift)=>{
    let id=gift.userId||gift.uniqueId;
    let name=gift.displayName||gift.uniqueId||id;
    let diamonds=gift.diamondCount||1;
    if(!players.has(id)) players.set(id,{name,role:"crew",power:1});
    players.get(id).power+=diamonds;

    let g=topGifters.get(id)||{id,name,total:0};
    g.total+=diamonds;
    topGifters.set(id,g);
  });
});

function action(id,act){
  if(!players.has(id)) players.set(id,{name:id,role:"crew",power:1});
  if(act==="hack") state.loot+=5;
  if(act==="smash") state.loot+=10;
  if(act==="rush") state.heat+=8;
  if(act==="sneak") state.heat=Math.max(0,state.heat-5);
}

function tick(){
  let idx=phaseOrder.indexOf(state.phase);
  idx=(idx+1)%phaseOrder.length;
  state.phase=phaseOrder[idx];
  state.heistMode=heistModes[Math.floor(Math.random()*heistModes.length)];

  if(state.phase==="planning"){ state.loot=0; state.heat=0; }

  if(state.phase==="action"){
    let totalPower=Array.from(players.values()).reduce((a,b)=>a+b.power,0);
    state.loot=Math.min(state.maxLoot, state.loot + totalPower*2);
    state.heat=Math.min(state.maxHeat, state.heat + Math.random()*10);
  }

  if(state.phase==="escape"){
    state.escapeTimer=10;
    let success=state.loot - state.heat + Math.random()*50;
    state.successChance=Math.max(5,Math.min(95,success));
    state.result=state.successChance>50?"win":"fail";
  } else delete state.result;

  state.players=Array.from(players.values());
  state.topGifters=Array.from(topGifters.values()).sort((a,b)=>b.total-a.total).slice(0,10);

  io.emit("tiktok_update",{players:state.players,gifters:state.topGifters});
  io.emit("city_heist_state",state);
}

setInterval(tick,5000);

http.listen(3000,()=>console.log("V10 server running with TikTok integration"));
