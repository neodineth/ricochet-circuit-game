'use strict';

// Coordinates are authored on a 660 × 660 arena. The game scales them for its preview.
const arenas = [
  {name:'Ivory Ring', theme:'marble', colors:['#e8dfca','#bcb09a','#a37b4f','#594b44'], surface:'slabs', collapse:'stone', props:[]},
  {name:'Village Green', theme:'village', colors:['#819253','#4b6439','#cca571','#473326'], surface:'earth', collapse:'wood', props:[[241,374,20,'barrel'],[417,286,20,'barrel']]},
  {name:'Stone Courtyard', theme:'castle', colors:['#788593','#47545f','#c3cbd2','#27313d'], surface:'slabs', collapse:'stone', props:[[299,225,31,'stone'],[361,435,31,'stone']]},
  {name:'Closing Stockade', theme:'stockade', colors:['#8e694d','#614333','#d5a074','#402c28'], surface:'planks', collapse:'wood', props:[[234,280,24,'crate'],[426,380,24,'crate']]},
  {name:'Stone Age', theme:'cave', colors:['#978a70','#60594f','#d49965','#3f3530'], surface:'earth', collapse:'dust', props:[[245,242,34,'stone'],[415,418,34,'stone']]},
  {name:'Neon Circuit', theme:'neon', colors:['#27344e','#121c32','#53d3ed','#131a35'], surface:'grid', collapse:'pixel', props:[[216,330,24,'metal'],[444,330,24,'metal']]},
  {name:'Glacier Rift', theme:'ice', colors:['#b0cbd3','#7295aa','#e5faff','#35586d'], surface:'ice', collapse:'ice', props:[[265,215,31,'stone'],[395,445,31,'stone']]},
  {name:'Ember Foundry', theme:'forge', colors:['#62616a','#39383e','#eca767','#49251e'], surface:'plates', collapse:'ember', props:[[243,348,27,'metal'],[417,312,27,'metal']]},
  {name:'Sunken Shrine', theme:'shrine', colors:['#527c73','#37595a','#b6aa79','#233e4c'], surface:'slabs', collapse:'water', props:[[247,247,25,'stone'],[413,413,25,'stone']]},
  {name:'Orbital Dock', theme:'orbital', colors:['#6c788e','#45495e','#e1bc72','#1d2136'], surface:'plates', collapse:'pixel', props:[[205,239,22,'crate'],[455,421,22,'crate']]},
  {name:'Japanese Lantern Festival', theme:'festival', colors:['#6d555d','#423447','#f4b78e','#5b3144'], surface:'planks', collapse:'wood', props:[[229,288,21,'barrel'],[431,372,21,'barrel']]},
  {name:'Aircraft Carrier Deck', theme:'carrier', colors:['#6c8292','#445566','#e4c279','#18384a'], surface:'plates', collapse:'water', props:[[216,239,22,'crate'],[444,421,22,'crate']]},
  {name:'WWII Airfield', theme:'airfield', colors:['#817d66','#575d48','#e6cb96','#3f4336'], surface:'earth', collapse:'dust', props:[[216,375,24,'barrel'],[444,285,24,'barrel']]},
  {name:'Sri Lankan Coastal Fort', theme:'coastal', colors:['#bc9874','#896c61','#eee0aa','#365663'], surface:'slabs', collapse:'water', props:[[234,239,24,'stone'],[426,421,24,'stone']]},
  {name:'Moroccan Mosaic Court', theme:'mosaic', colors:['#627b86','#3d565e','#e0ba84','#243e47'], surface:'mosaic', collapse:'stone', props:[[218,330,23,'barrel'],[442,330,23,'barrel']]},
  {name:'Mexican Festival Plaza', theme:'plaza', colors:['#a77866','#76565d','#f0c189','#513a50'], surface:'slabs', collapse:'stone', props:[[265,215,23,'barrel'],[395,445,23,'barrel']]},
  {name:'Egyptian Sun Temple', theme:'temple', colors:['#b39a74','#7f6856','#e6c580','#654835'], surface:'slabs', collapse:'dust', props:[[235,350,30,'stone'],[425,310,30,'stone']]},
  {name:'Dutch Canal Quay', theme:'canal', colors:['#826966','#5b4d58','#deaf92','#254b5e'], surface:'brick', collapse:'water', props:[[230,280,24,'crate'],[430,380,24,'crate']]},
  {name:'Norwegian Aurora Harbor', theme:'aurora', colors:['#456572','#2b4356','#a2ddc6','#273b53'], surface:'planks', collapse:'ice', props:[[230,415,23,'crate'],[430,245,23,'crate']]},
  {name:'Greek Island Terrace', theme:'terrace', colors:['#c4c4b4','#829da3','#f1edcd','#355f77'], surface:'slabs', collapse:'stone', props:[[255,230,25,'stone'],[405,430,25,'stone']]}
];

function drawArenaFloor(ctx, arena, width, height) {
  const [light,dark,trim,border]=arena.colors;
  ctx.save();
  ctx.scale(width/660,height/660);
  const floor=ctx.createLinearGradient(0,0,640,660);
  floor.addColorStop(0,light);
  floor.addColorStop(1,dark);
  ctx.fillStyle=floor;
  ctx.fillRect(0,0,660,660);
  drawArenaSurface(ctx,arena);
  drawArenaLandmarks(ctx,arena);
  ctx.strokeStyle=border;
  ctx.lineWidth=13;
  ctx.strokeRect(7,7,646,646);
  ctx.strokeStyle=trim;
  ctx.globalAlpha=.75;
  ctx.lineWidth=2;
  ctx.strokeRect(17,17,626,626);
  ctx.restore();
}

function arenaLine(ctx, points, color, width=2) {
  ctx.beginPath();
  ctx.moveTo(...points[0]);
  for(const point of points.slice(1)) ctx.lineTo(...point);
  ctx.strokeStyle=color;
  ctx.lineWidth=width;
  ctx.stroke();
}

function arenaDisk(ctx,x,y,r,color) {
  ctx.beginPath();
  ctx.arc(x,y,r,0,Math.PI*2);
  ctx.fillStyle=color;
  ctx.fill();
}

function drawArenaSurface(ctx,{surface,colors}) {
  const [,dark,trim,border]=colors;
  ctx.save();
  ctx.globalAlpha=.22;
  if(surface==='earth'||surface==='ice'){
    for(let i=0;i<105;i++){
      const x=(i*137+43)%650,y=(i*i*71+i*29+17)%650;
      if(surface==='earth') arenaLine(ctx,[[x-5,y],[x,y-3],[x+6,y+1]],i%2?trim:border,1.5);
      else arenaLine(ctx,[[x-12,y-13],[x,y],[x-9,y+12],[x+5,y+21]],i%3?trim:border,1.4);
    }
  } else if(surface==='planks'){
    for(let y=0;y<660;y+=29){
      arenaLine(ctx,[[0,y],[660,y]],border,2);
      arenaLine(ctx,[[0,y+6],[660,y+6]],trim,1);
      for(let x=(y%3)*49;x<660;x+=171) arenaLine(ctx,[[x,y],[x,y+29]],border);
    }
  } else if(surface==='grid'||surface==='mosaic'){
    const gap=surface==='grid'?33:48;
    for(let i=0;i<=660;i+=gap){
      arenaLine(ctx,[[0,i],[660,i]],trim,1);
      arenaLine(ctx,[[i,0],[i,660]],trim,1);
    }
    if(surface==='mosaic'){
      for(let y=24;y<660;y+=48) for(let x=24;x<660;x+=48){
        arenaLine(ctx,[[x-17,y],[x,y-17],[x+17,y],[x,y+17],[x-17,y]],trim,1.5);
        arenaDisk(ctx,x,y,3,trim);
      }
    }
  } else {
    const [tileW,tileH]=surface==='brick'?[54,23]:surface==='plates'?[146,88]:[114,67];
    ctx.strokeStyle=border;
    ctx.fillStyle=trim;
    ctx.lineWidth=1.5;
    for(let row=0;row*tileH<660;row++){
      for(let x=-tileW+(row%2)*tileW/2;x<660;x+=tileW){
        const y=row*tileH;
        ctx.strokeRect(x+2,y+2,tileW-4,tileH-4);
        if(surface==='plates'){
          ctx.fillRect(x+9,y+9,3,3);
          ctx.fillRect(x+tileW-12,y+tileH-12,3,3);
        } else if(surface==='slabs'){
          arenaLine(ctx,[[x+12,y+tileH-13],[x+29,y+tileH-17],[x+47,y+tileH-28]],dark,1);
          ctx.strokeStyle=border;
        }
      }
    }
  }
  ctx.restore();
}

function drawRunway(ctx, color, carrier) {
  ctx.fillStyle=carrier?'#30465b91':'#383e318f';
  ctx.fillRect(207,18,246,624);
  ctx.save();
  ctx.globalAlpha=.58;
  arenaLine(ctx,[[215,18],[215,642]],color,2);
  arenaLine(ctx,[[445,18],[445,642]],color,2);
  for(let y=85;y<595;y+=75) ctx.fillRect(327,y,6,34);
  for(let x=239;x<422;x+=23){
    ctx.fillRect(x,51,8,24);
    ctx.fillRect(x,585,8,24);
  }
  ctx.restore();
  if(carrier){
    for(let y=100;y<=560;y+=115){
      arenaLine(ctx,[[100,y+25],[120,y],[140,y+25]],color,2);
      arenaLine(ctx,[[520,y+25],[540,y],[560,y+25]],color,2);
    }
  }
}

function drawArenaLandmarks(ctx,{theme,colors}) {
  const [light,dark,trim,border]=colors;
  ctx.save();
  ctx.globalAlpha=.64;
  ctx.fillStyle=trim;
  switch(theme){
    case 'marble':
      for(const r of [106,132,219]){
        ctx.beginPath();ctx.arc(330,330,r,0,Math.PI*2);
        ctx.strokeStyle=trim;ctx.lineWidth=r===132?5:2;ctx.stroke();
      }
      break;
    case 'castle':
      for(let x=44;x<630;x+=57){
        ctx.fillStyle=border;ctx.fillRect(x,26,29,21);ctx.fillRect(x,613,29,21);
        ctx.fillStyle=trim;ctx.fillRect(x,26,29,3);ctx.fillRect(x,631,29,3);
      }
      break;
    case 'stockade':
      for(let y=47;y<635;y+=62){
        arenaLine(ctx,[[21,y+18],[47,y-8]],trim,7);
        arenaLine(ctx,[[613,y-8],[639,y+18]],trim,7);
      }
      break;
    case 'cave':
      for(const y of [65,580]){
        for(let i=0;i<7;i++){
          const x=128+i*65;
          arenaLine(ctx,[[x-9,y+9],[x,y-4],[x+8,y+8],[x+20,y-3]],trim,3);
          arenaDisk(ctx,x,y-11,3,trim);
        }
      }
      break;
    case 'neon':
      arenaLine(ctx,[[31,220],[93,220],[154,159],[154,32]],trim,4);
      arenaLine(ctx,[[629,440],[567,440],[506,501],[506,628]],trim,4);
      arenaLine(ctx,[[262,283],[330,252],[398,283],[398,377],[330,408],[262,377],[262,283]],trim,2);
      break;
    case 'ice':
      for(const x of [104,521]) arenaLine(ctx,[[x,20],[x+33,110],[x-19,185],[x+30,273],[x+12,348],[x+45,470],[x,639]],trim,3);
      break;
    case 'forge':
      for(let x=42;x<630;x+=29){
        arenaLine(ctx,[[x,47],[x+13,24]],trim,5);
        arenaLine(ctx,[[x,638],[x+13,615]],trim,5);
      }
      for(const x of [95,565]) for(let y=110;y<620;y+=89) arenaDisk(ctx,x,y,5,trim);
      break;
    case 'shrine':
      for(const [x,y] of [[63,105],[596,550],[65,562],[595,104]]){
        ctx.strokeStyle=trim;ctx.lineWidth=3;
        ctx.strokeRect(x-19,y-19,38,38);
        ctx.strokeRect(x-12,y-12,24,24);
        arenaDisk(ctx,x,y,4,trim);
      }
      break;
    case 'orbital':
      for(const x of [77,583]){
        ctx.fillStyle=border;ctx.fillRect(x-22,42,44,576);
        for(let y=64;y<609;y+=25) arenaLine(ctx,[[x-15,y+5],[x+15,y-9]],trim,3);
      }
      ctx.strokeStyle=trim;ctx.lineWidth=3;ctx.strokeRect(256,256,148,148);
      break;
    case 'festival':
    case 'plaza': {
      const lanterns=theme==='festival';
      for(const y of [42,618]){
        ctx.beginPath();ctx.moveTo(49,y);ctx.quadraticCurveTo(330,y+36,611,y);
        ctx.strokeStyle=trim;ctx.lineWidth=2;ctx.stroke();
        for(let x=77;x<623;x+=51){
          const drop=y+18*(1-((x-330)/281)**2);
          const color=['#ff9d88','#ffd79a','#8fd3cb'][Math.floor(x/51)%3];
          if(lanterns){
            arenaDisk(ctx,x,drop+3,9,color);
            arenaLine(ctx,[[x-5,drop-6],[x+5,drop-6]],border,3);
          } else {
            ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(x-10,drop);
            ctx.lineTo(x+10,drop);ctx.lineTo(x,drop+15);ctx.closePath();ctx.fill();
          }
        }
      }
      if(lanterns){
        arenaLine(ctx,[[265,111],[395,111]],'#e98874',8);
        arenaLine(ctx,[[278,120],[382,120]],'#e98874',5);
        arenaLine(ctx,[[294,113],[289,146]],'#e98874',6);
        arenaLine(ctx,[[366,113],[371,146]],'#e98874',6);
      }
      break;
    }
    case 'carrier':
    case 'airfield':
      drawRunway(ctx,trim,theme==='carrier');
      if(theme==='airfield'){
        for(const x of [60,600]) for(const y of [80,580]){
          ctx.fillStyle=border;ctx.fillRect(x-24,y-20,48,40);
          ctx.strokeStyle=trim;ctx.lineWidth=2;ctx.strokeRect(x-21,y-16,42,32);
        }
      }
      break;
    case 'coastal':
      for(let i=0;i<8;i++){
        const x=52+i*80;
        ctx.fillStyle=border;ctx.fillRect(x-16,27,33,16);ctx.fillRect(x-16,617,33,16);
      }
      for(const x of [57,603]) for(const y of [58,602]) arenaDisk(ctx,x,y,19,trim);
      break;
    case 'mosaic':
      for(const y of [58,602]) arenaLine(ctx,[[52,y],[158,y],[187,y-12],[473,y-12],[503,y],[608,y]],trim,4);
      for(const x of [54,606]) for(const y of [58,602]) arenaDisk(ctx,x,y,12,trim);
      break;
    case 'temple':
      for(const y of [53,607]) for(let x=92;x<=568;x+=68){
        arenaLine(ctx,[[x-13,y+6],[x,y-9],[x+13,y+6],[x-13,y+6]],trim,3);
      }
      arenaDisk(ctx,330,330,42,'#eed19c55');
      for(let a=0;a<12;a++){
        const angle=a*Math.PI/6;
        arenaLine(ctx,[[330+Math.cos(angle)*53,330+Math.sin(angle)*53],[330+Math.cos(angle)*68,330+Math.sin(angle)*68]],trim,3);
      }
      break;
    case 'canal':
      for(const x of [45,615]){
        ctx.fillStyle=border;ctx.fillRect(x-20,24,40,612);
        for(let y=45;y<630;y+=46) arenaLine(ctx,[[x-12,y],[x+12,y-3]],trim,1);
      }
      break;
    case 'aurora':
      for(let i=0;i<4;i++){
        ctx.beginPath();ctx.moveTo(30,133+i*15);
        ctx.bezierCurveTo(210,23+i*15,430,258+i*15,630,100+i*15);
        ctx.strokeStyle=['#81d9aa48','#70d4b860','#92dbef55','#b2a5f44a'][i];ctx.lineWidth=8;ctx.stroke();
      }
      break;
    case 'terrace':
      for(const y of [54,606]) for(const x of [75,585]){
        ctx.fillStyle=light;ctx.fillRect(x-27,y-19,54,38);
        ctx.beginPath();ctx.arc(x,y-8,16,Math.PI,Math.PI*2);
        ctx.fillStyle=border;ctx.fill();
      }
      for(let x=120;x<580;x+=35) arenaDisk(ctx,x,31,3,trim);
      break;
  }
  ctx.restore();
}
