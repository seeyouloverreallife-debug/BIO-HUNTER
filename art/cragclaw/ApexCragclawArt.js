/* BIO Hunter ApexCragclaw Art v1.4 — procedural Canvas2D, pure draw(snapshot). */
(function(root,factory){'use strict';root.ApexCragclawArt=factory(root.ApexCragclawConfig);})(typeof globalThis!=='undefined'?globalThis:this,function(Config){
'use strict';
function clamp(n,a,b){return Math.max(a,Math.min(b,n));}
function poly(ctx,pts){ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);for(var i=1;i<pts.length;i++)ctx.lineTo(pts[i][0],pts[i][1]);ctx.closePath();}
function ellipse(ctx,x,y,rx,ry,fill,stroke,lw){ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.lineWidth=lw||1;ctx.strokeStyle=stroke;ctx.stroke();}}
function withSave(ctx,fn){ctx.save();try{fn();}finally{ctx.restore();}}
function glow(ctx,x,y,r,color){var g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,'rgba(236,79,164,0)');ctx.fillStyle=g;ctx.fillRect(x-r,y-r,2*r,2*r);}
function drawCrownExit(ctx,s){var a=s.attack;if(!a||a.id!=='C09'||a.phase==='recover'||a.crownGap==null||a.crownX==null)return;withSave(ctx,function(){
  ctx.translate(a.crownX,a.crownY);ctx.rotate(a.crownGap);ctx.fillStyle='rgba(127,224,181,.30)';ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,108,-.46,.46);ctx.closePath();ctx.fill();
  ctx.fillStyle='#d9ffe8';ctx.font='bold 13px sans-serif';ctx.textAlign='center';ctx.fillText('ช่องออก',76,4);
});}
function drawHuntHalo(ctx,s){if(!s.hunt||!s.hunt.active)return;withSave(ctx,function(){
 ctx.strokeStyle=s.phase>=3?'rgba(255,78,133,.8)':'rgba(233,141,208,.5)';ctx.lineWidth=1.8;
 ctx.setLineDash([5,8]);ctx.beginPath();ctx.arc(s.x,s.y,s.r*1.45,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);
 for(var i=0;i<s.hunt.total;i++){var a=-Math.PI/2+i*Math.PI*2/s.hunt.total;ctx.fillStyle=i<s.hunt.step?'#ffb2d5':'#673c65';ctx.beginPath();ctx.arc(s.x+Math.cos(a)*s.r*1.45,s.y+Math.sin(a)*s.r*1.45,2.8,0,Math.PI*2);ctx.fill();}
 });}
function drawTelegraphs(ctx,s){var ts=s.telegraphs||[];for(var i=0;i<ts.length;i++){(function(t){withSave(ctx,function(){
  ctx.strokeStyle=t.color||'rgba(247,203,111,.68)';ctx.fillStyle=t.color||'rgba(247,203,111,.3)';ctx.globalAlpha=.38+.5*clamp(t.progress||0,0,1);ctx.lineWidth=2;ctx.setLineDash([7,5]);
  if(t.type==='circle'){ctx.beginPath();ctx.arc(t.x,t.y,t.r,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);ctx.globalAlpha*=.23;ctx.fill();}
  else if(t.type==='line'){ctx.lineWidth=t.width||20;ctx.beginPath();ctx.moveTo(t.x1,t.y1);ctx.lineTo(t.x2,t.y2);ctx.stroke();}
  else if(t.type==='arc'){ctx.beginPath();ctx.arc(t.x,t.y,t.r,t.start,t.end);ctx.stroke();}
  else if(t.type==='spike'){ctx.beginPath();ctx.arc(t.x,t.y,t.r,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);ctx.beginPath();ctx.moveTo(t.x,t.y-t.r*.8);ctx.lineTo(t.x+t.r*.7,t.y+t.r*.6);ctx.lineTo(t.x-t.r*.7,t.y+t.r*.6);ctx.closePath();ctx.fill();}
});})(ts[i]);}}
function drawCrystal(ctx,x,y,w,h,phase){withSave(ctx,function(){
  ctx.translate(x,y);var luminous=phase===3?'#ffb4da':'#ed6cae';
  glow(ctx,0,-h*.5,w*1.8,'rgba(72,203,242,.24)');
  poly(ctx,[[-w*.58,0],[-w*.43,-h*.67],[0,-h],[w*.46,-h*.61],[w*.56,0],[0,h*.10]]);ctx.fillStyle=luminous;ctx.fill();ctx.strokeStyle='#b8f7ff';ctx.lineWidth=.9;ctx.stroke();
  poly(ctx,[[0,-h],[0,h*.1],[w*.56,0],[w*.46,-h*.61]]);ctx.fillStyle='rgba(34,102,149,.52)';ctx.fill();
  ctx.strokeStyle='rgba(255,255,255,.8)';ctx.beginPath();ctx.moveTo(-w*.43,-h*.67);ctx.lineTo(0,-h);ctx.lineTo(0,h*.1);ctx.stroke();
});}
function drawLeg(ctx,x,y,side,index,phase,t,lateral,gaitWeight,limp){withSave(ctx,function(){
  // Ipsilateral leg pairs transfer weight opposite the travel direction.
  var pair=(index%2?Math.PI:0)+(side>0?Math.PI:0);
  var cycle=t*1.8+pair+index*.13;
  var drive=Math.sin(cycle)*(gaitWeight||0);
  var lift=Math.max(0,Math.cos(cycle))*(gaitWeight||0);
  var sideFactor=side*lateral;
  var damagedBias=(index>=2?limp:0);
  var toeShift=drive*5.5+sideFactor*3.8;
  var kneeX=x-9+drive*1.6, kneeY=side*(22+index*1.3)-lift*2.5;
  var toeX=x-2-index*2+toeShift, toeY=side*(33+index*2.5)-lift*4+damagedBias*side*3;
  ctx.lineCap='round';ctx.lineJoin='round';
  ctx.strokeStyle='#2b1c37';ctx.lineWidth=8;
  ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(kneeX,kneeY);ctx.lineTo(toeX,toeY);ctx.stroke();
  ctx.strokeStyle='#895577';ctx.lineWidth=5.2;
  ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(kneeX,kneeY);ctx.lineTo(toeX,toeY);ctx.stroke();
  ellipse(ctx,kneeX,kneeY,3.7,3.6,'#ba7b9f','#3c2346',1);
  ctx.strokeStyle='#e5eef0';ctx.lineWidth=1.35;
  for(var claw=-1;claw<=1;claw++){ctx.beginPath();ctx.moveTo(toeX+claw*2,toeY);ctx.lineTo(toeX+claw*3+4,toeY+side*3);ctx.stroke();}
  // Spiked chitin knees, crimson bands.
  shard(ctx,[[kneeX-7,kneeY-side*2],[kneeX-12,kneeY+side*6],[kneeX+2,kneeY+side*2]],'#7d477b','#2f213b');
  ctx.strokeStyle='#e6a1cb';ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(kneeX-3,kneeY);ctx.lineTo(toeX-2,toeY);ctx.stroke();
});}
function drawClaw(ctx,s,side,part,major,clawOpen,clawPose,m){withSave(ctx,function(){
  // ctx is already scaled by drawBody; don't apply scale twice.
  var broken=!!(part&&part.broken), fracture=(part&&part.fractureStage)||0;
  var damage=(part&&part.damageFraction)||0, pulse=(part&&part.hitPulse)||0;
  ctx.translate(16,side*22);
  ctx.rotate(clawPose&&typeof clawPose.angle==='number'?clawPose.angle:side*(.12+clawOpen*.38));
  ctx.fillStyle='#293f4f';ctx.strokeStyle='#203844';ctx.lineWidth=1.7;
  ctx.beginPath();ctx.moveTo(-1,0);ctx.lineTo(15,side*6);ctx.lineTo(25,side*4);ctx.lineTo(18,0);ctx.closePath();ctx.fill();ctx.stroke();
  if(broken){
    ellipse(ctx,17,side*4,10,8,'#526a78','#a7c8d3',1.6);
    poly(ctx,[[15,side*(-4)],[27,side*(-9)],[22,side*2],[25,side*6],[20,side*11],[14,side*7]]);
    ctx.fillStyle='#bd8e82';ctx.fill();ctx.strokeStyle='#674f48';ctx.stroke();
    ctx.strokeStyle='#8eecff';ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(16,-2);ctx.lineTo(22,side*4);ctx.lineTo(26,side*5);ctx.stroke();
    // Tiny permanent shards make silhouette more recognisable even at 1x game scale.
    poly(ctx,[[10,side*(-6)],[7,side*(-12)],[15,side*(-10)]]);ctx.fillStyle='#95ddea';ctx.fill();
    // Break shards travel outward over 0.38 s. No randomness or state mutation.
    if(pulse>0){
      var time=1-clamp(pulse/.38,0,1);
      ctx.globalAlpha=(1-time)*.92;
      for(var fragment=0;fragment<4;fragment++){
        var fx=17+fragment*3+time*(13+fragment*4);
        var fy=side*(2+fragment*3+time*(10+fragment*2));
        poly(ctx,[[fx,fy-3],[fx+3,fy],[fx,fy+4],[fx-2,fy]]);
        ctx.fillStyle=fragment%2?'#9aefff':'#d6e6dc';ctx.fill();
      }
      ctx.globalAlpha=1;
    }
  }else{
    var w=major?25:20,h=major?15:12;
    var gr=ctx.createLinearGradient(8,-12,45,14);gr.addColorStop(0,'#da9dc9');gr.addColorStop(.44,major?'#7b416f':'#86518e');gr.addColorStop(1,'#281c39');
    ellipse(ctx,28,0,w,h,gr,'#34213d',2);
    ellipse(ctx,24,-5,w*.45,h*.29,'rgba(219,249,255,.28)');
    var jaw=clawOpen*7;
    poly(ctx,[[34,-4-jaw],[58,-13-jaw],[55,-3-jaw],[39,3-jaw]]);ctx.fillStyle='#dba7d0';ctx.fill();ctx.stroke();
    poly(ctx,[[34,5+jaw],[55,13+jaw],[58,5+jaw],[40,-1+jaw]]);ctx.fillStyle='#75447a';ctx.fill();ctx.stroke();
    ctx.strokeStyle='rgba(219,251,255,.4)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(17,-7);ctx.lineTo(32,-9);ctx.stroke();
    // Persistent progressive fractures are driven solely by per-part HP, not random effects.
    if(fracture>=1){
      ctx.lineCap='round';ctx.strokeStyle='#172c3a';ctx.lineWidth=2.25;
      ctx.beginPath();ctx.moveTo(20,-11);ctx.lineTo(25,-4);ctx.lineTo(21,2);ctx.lineTo(29,10);ctx.stroke();
      ctx.strokeStyle='rgba(122,231,250,.85)';ctx.lineWidth=.95;
      ctx.beginPath();ctx.moveTo(21,-11);ctx.lineTo(26,-4);ctx.lineTo(22,2);ctx.lineTo(30,10);ctx.stroke();
    }
    if(fracture>=2){
      ctx.strokeStyle='#1a3442';ctx.lineWidth=2.2;
      ctx.beginPath();ctx.moveTo(26,-4);ctx.lineTo(37,-10);ctx.lineTo(47,-8);ctx.moveTo(22,2);ctx.lineTo(35,7);ctx.lineTo(43,13);ctx.stroke();
      ctx.fillStyle='#c8b5aa';ctx.beginPath();ctx.arc(42,10,3.4,0,Math.PI*2);ctx.fill();
    }
  }
  drawApexClawAccent(ctx,side,broken,major,fracture,s.phase);
  drawClawFlex(ctx,s,m,part,major,side,true);
  if(pulse>0){
    ctx.globalAlpha=Math.min(.52,pulse/.38*.52);
    ctx.fillStyle='#e3faff';ctx.beginPath();ctx.ellipse(28,0,28,19,0,0,Math.PI*2);ctx.fill();
    ctx.globalAlpha=1;
  }
});}
function drawFields(ctx,s){var hs=s.hazards||[];for(var i=0;i<hs.length;i++){
 var h=hs[i];withSave(ctx,function(){var active=h.active;
  ctx.globalAlpha=active?0.75:0.37;ctx.strokeStyle=active?'#87f6ff':'#cdeaff';ctx.fillStyle=active?'rgba(63,173,211,.25)':'rgba(110,230,255,.09)';ctx.lineWidth=2.4;
  ctx.setLineDash(active?[]:[4,4]);ctx.beginPath();ctx.arc(h.x,h.y,h.r,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.setLineDash([]);
  var phase=h.age/h.duration;var scale=active?1:.4+0.6*clamp(h.age/h.windup,0,1);
  poly(ctx,[[h.x,h.y-13*scale],[h.x+9*scale,h.y+6*scale],[h.x,h.y+3*scale],[h.x-8*scale,h.y+7*scale]]);
  ctx.fillStyle=active?'rgba(138,250,255,.8)':'rgba(116,212,235,.3)';ctx.fill();
  ctx.beginPath();ctx.arc(h.x,h.y,h.r*Math.max(.12,1-phase),0,Math.PI*2);ctx.stroke();
 });}}

// Appearance pass v1.1: apex silhouette is a jagged crowned hunter, not a palette swap.
function shard(ctx,pts,fill,edge){poly(ctx,pts);ctx.fillStyle=fill;ctx.fill();if(edge){ctx.strokeStyle=edge;ctx.lineWidth=1;ctx.stroke();}}
function apexCrystal(ctx,x,y,w,h,side,hot){withSave(ctx,function(){ctx.translate(x,y);ctx.scale(1,side);var grad=ctx.createLinearGradient(0,0,0,-h);grad.addColorStop(0,hot?'#a04478':'#533850');grad.addColorStop(.55,hot?'#fc6fbe':'#b86dba');grad.addColorStop(1,hot?'#ffe3f6':'#bcb0df');shard(ctx,[[-w*.62,2],[-w*.42,-h*.65],[0,-h],[w*.48,-h*.60],[w*.66,2]],grad,'#4a224b');shard(ctx,[[0,-h],[w*.48,-h*.60],[w*.66,2],[0,-h*.17]],hot?'#ca3b8a':'#673f86');ctx.strokeStyle=hot?'#ffdbf7':'#e4d0ff';ctx.lineWidth=1.15;ctx.beginPath();ctx.moveTo(-w*.38,-h*.6);ctx.lineTo(0,-h);ctx.stroke();});}
function drawApexRear(ctx,s){
 withSave(ctx,function(){
  // Broken swept-back ridge and heavy shoulders; asymmetrical dark silhouette.
  for(var side=-1;side<=1;side+=2){
   shard(ctx,[[-24,side*6],[-40,side*27],[-55,side*45],[-44,side*29],[-33,side*18]],'#311f3f','#130f25');
   shard(ctx,[[-17,side*12],[-22,side*30],[-13,side*42],[-9,side*26]],'#60385e','#20172e');
   shard(ctx,[[10,side*12],[14,side*32],[27,side*42],[23,side*23]],'#6a325d','#301d3d');
  }
 });
}
function drawApexShell(ctx,s,fracture){
 withSave(ctx,function(){
  var hot=s.phase>=3,ruined=fracture>=3;
  // Apex shell becomes a broad angular manta-/crown-shaped slab.
  shard(ctx,[[-37,-13],[-26,-28],[5,-30],[29,-16],[34,-4],[20,10],[-7,20],[-37,11]],'#37283f','#140f25');
  shard(ctx,[[-31,-15],[-17,-26],[4,-26],[15,-18],[-1,-4],[-20,-4]],'#77506c','#281c38');
  shard(ctx,[[-35,6],[-17,14],[0,21],[21,11],[10,2],[-13,1]],'#573b59','#24172d');
  shard(ctx,[[5,-25],[28,-17],[33,-5],[16,3],[-3,-5]],'#a16587','#3f244d');
  // Distinct signature: prominent seven crystal serrations along opposing flanks.
  apexCrystal(ctx,-26,-13,13,25,1,hot);
  apexCrystal(ctx,-5,-16,14,37,1,hot);
  apexCrystal(ctx,16,-12,11,25,1,hot);
  apexCrystal(ctx,-27,13,12,22,-1,hot);
  apexCrystal(ctx,-4,16,13,32,-1,hot);
  apexCrystal(ctx,17,12,9,20,-1,hot);
  ctx.strokeStyle='rgba(255,226,244,.42)';ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(-26,-18);ctx.lineTo(-16,-23);ctx.lineTo(2,-22);ctx.moveTo(11,-18);ctx.lineTo(24,-13);ctx.stroke();
  // Purple-white energy channels follow triangular shell plates.
  ctx.lineCap='round';ctx.strokeStyle=hot?'rgba(255,150,221,.98)':'rgba(217,124,190,.78)';ctx.lineWidth=ruined?1:2.3;
  ctx.beginPath();ctx.moveTo(-31,-7);ctx.lineTo(-15,-13);ctx.lineTo(-1,-3);ctx.lineTo(18,-10);ctx.moveTo(-24,11);ctx.lineTo(-12,5);ctx.lineTo(5,13);ctx.lineTo(23,6);ctx.stroke();
  ctx.strokeStyle='#f9b6e6';ctx.lineWidth=hot?2.1:1.1;ctx.beginPath();ctx.moveTo(-1,-3);ctx.lineTo(5,13);ctx.lineTo(18,-10);ctx.stroke();
  // Asymmetric central war crest with vertical ruby crystal, suppress if shattered.
  if(!ruined){apexCrystal(ctx,0,-2,13,20,1,hot);}
  else{shard(ctx,[[-6,-7],[0,-13],[7,-4],[-3,5]],'#2e263a','#8c497a');}
  for(var t=0;t<4;t++){var xx=-27+t*16;ellipse(ctx,xx,19-(t%2)*2,2.4,2.1,'#df85aa','#402640',1);}
 });
}
function drawApexFace(ctx,s){
 // Spiked angular frontal helm plus triple predatory jewel-eyes.
 shard(ctx,[[18,-10],[36,-17],[49,-13],[45,-6],[53,0],[45,6],[49,13],[35,17],[18,10]],'#352539','#1a1028');
 shard(ctx,[[24,-10],[38,-14],[43,-5],[30,-2]],'#ae6b9a','#4d2754');
 shard(ctx,[[24,10],[38,14],[43,5],[30,2]],'#8b4d86','#45274d');
 shard(ctx,[[40,-7],[57,-15],[50,-4],[55,0],[50,4],[57,15],[40,7]],'#c95e99','#632e66');
 shard(ctx,[[42,-7],[54,-14],[49,-3]],'#ffe0ee');
 for(var side=-1;side<=1;side+=2){ellipse(ctx,38,side*9,4.6,3.4,s.phase>=3?'#ffd3e8':'#ff9fce','#3d172e',1);ellipse(ctx,39,side*9,1.6,1.8,'#321326');}
 ellipse(ctx,47,0,3.5,2.4,'#ffe1ec','#4e214b',.8);
}
function drawApexClawAccent(ctx,side,broken,major,fracture,phase){
 if(broken){shard(ctx,[[10,-9],[24,-6],[29,0],[16,7]],'#a65178','#3d2343');shard(ctx,[[18,-5],[25,-13],[29,-7]],'#df9ccf');return;}
 // Weapon asymmetry: one broad reaping axe, one slim hooked harpoon.
 if(major){
  shard(ctx,[[7,-11],[22,-20],[35,-16],[46,-8],[45,6],[26,12],[11,7]],'#512b50','#24162e');
  shard(ctx,[[13,-13],[29,-19],[43,-10],[35,-3],[16,0]],'#b36a9c','#633957');
  shard(ctx,[[34,-14],[45,-23],[54,-15],[49,-4],[41,3]],'#d9559c','#4c1c4c');
  shard(ctx,[[47,-19],[57,-25],[54,-12]],'#ffd0e8','#a83979');
  shard(ctx,[[28,6],[39,14],[50,7],[41,-1]],'#7e3d7a','#371d47');
 }else{
  shard(ctx,[[12,-7],[29,-12],[44,-6],[50,1],[38,8],[19,7]],'#673b75','#2a203c');
  shard(ctx,[[22,-10],[33,-14],[43,-6],[34,-1]],'#c98fcb');
  shard(ctx,[[39,-8],[52,-18],[61,-12],[51,-3]],'#fa75bb','#87385f');
  shard(ctx,[[37,5],[48,13],[58,6],[48,0]],'#9f5b9b','#542b69');
  for(var n=0;n<3;n++){shard(ctx,[[28+n*6,5],[32+n*6,11],[35+n*6,6]],'#df8bbd');}
 }
 ctx.strokeStyle=phase>=3?'#ffd4f3':'#f0a7d8';ctx.lineWidth=1.6;
 ctx.beginPath();ctx.moveTo(16,-9);ctx.lineTo(26,-4);ctx.lineTo(37,-9);ctx.stroke();
 if(fracture>=1){ctx.strokeStyle='#29162f';ctx.lineWidth=2.6;ctx.beginPath();ctx.moveTo(23,-16);ctx.lineTo(29,-7);ctx.lineTo(25,4);ctx.stroke();}
}
// v1.3 secondary character animation. A pure function of the Core snapshot.
// No state, random numbers, delta-time integrators or changes to collision coordinates.
function secondaryMotion(s,opts){
 if(opts&&opts.reduceMotion)return {enabled:false,effort:0,settle:0,shift:0,breath:0,crest:0,leg:0,eye:0,jaw:0,shock:0};
 var t=Number.isFinite(s.tNow)?s.tNow:((s.pose&&s.pose.legCycle)||0)/1.8;
 var a=s.attack||{},dt=Math.max(0,a.t||0),phase=a.phase||'',tele=Math.max(.001,a.tele||1),act=Math.max(.001,a.act||1),rec=Math.max(.001,a.recover||1);
 var wind=clamp(dt/tele,0,1),active=clamp((dt-tele)/act,0,1),recover=clamp((dt-tele-act)/rec,0,1);
 var effort=phase==='tele'?wind*wind:(phase==='act'?Math.exp(-3.1*active):0);
 var shock=phase==='act'?Math.sin(Math.PI*clamp(active,0,1)) * Math.exp(-1.25*active):0;
 var after=phase==='recover'?Math.sin(recover*Math.PI*3.25)*Math.exp(-2.7*recover):0;
 var walk=clamp((s.pose&&s.pose.gaitWeight)||0,0,1);
 var settle=(Math.sin(t*2.3)*.32+Math.sin(t*4.6)*.1) + after*.95 - effort*.92 + shock*1.32;
 return {enabled:true,effort:effort,settle:settle,shift:(Math.sin(t*2.05)*.34 + shock*.84 - effort*.68),
  breath:Math.sin(t*2.15)*.58*(1-.35*walk),
  crest:Math.sin(t*5.35)*.65+after*2.6+shock*1.7-effort*2.1,
  leg:Math.sin(t*3.5)*.32*walk + shock*.75,
  eye:Math.sin(t*1.83)*.66,
  jaw:Math.sin(t*3.1)*.16 + effort*.26+shock*.22,
  shock:shock};
}
// Low-amplitude anatomy layers sit inside the Core's hurtboxes / claw-tip bounds.
function drawFootMotion(ctx,s,side,index,m,apex){
 if(!m.enabled)return;
 var t=Number.isFinite(s.tNow)?s.tNow:0, gait=clamp((s.pose&&s.pose.gaitWeight)||0,0,1);
 var stride=Math.sin((s.pose&&s.pose.legCycle||0)*1.8+(index%2?Math.PI:0)+(side>0?Math.PI:0));
 var x=-24+index*13-9+stride*gait*1.25,y=side*(23+index*1.3);
 withSave(ctx,function(){ctx.translate(x,y);ctx.rotate(side*(m.leg*.05+stride*gait*.055));
  ctx.strokeStyle=apex?'rgba(248,138,217,.8)':'rgba(153,232,222,.78)';ctx.lineWidth=1.4;
  ctx.beginPath();ctx.moveTo(-3,-side*3);ctx.lineTo(2,side*5);ctx.stroke();
  if(apex){shard(ctx,[[-5,side*1],[-8,side*7],[1,side*4]],'#c66b9c','#4b2850');}
  else{shard(ctx,[[-4,side*1],[-7,side*6],[0,side*4]],'#809d94','#283f47');}
 });
}
function drawShoulderMotion(ctx,s,m,apex){
 if(!m.enabled)return;
 var damaged=(s.shell&&s.shell.fractureStage)||0;
 for(var side=-1;side<=1;side+=2){withSave(ctx,function(){
   var hingeX=apex?-18:-22,hingeY=side*18;
   ctx.translate(hingeX,hingeY);ctx.rotate(side*m.settle*(apex?.035:.022));
   ctx.globalAlpha=damaged>=3?.50:1;
   if(apex){
    shard(ctx,[[-9,-side*3],[-23,side*9],[-27,side*21],[-10,side*13],[6,side*3]],'#4c2a4f','#25162f');
    shard(ctx,[[-13,side*6],[-25,side*18],[-9,side*11]],'#cb75ac','#693459');
    ctx.strokeStyle='#f3c1ec';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(-9,side*5);ctx.lineTo(-19,side*14);ctx.stroke();
   }else{
    shard(ctx,[[-5,-side*4],[-17,side*2],[-20,side*13],[-6,side*10],[6,side*1]],'#486b72','#213b43');
    shard(ctx,[[-14,side*3],[-20,side*9],[-7,side*7]],'#9fb2a8','#4a737b');
    ctx.strokeStyle='rgba(194,229,218,.77)';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(-14,side*5);ctx.lineTo(-6,side*7);ctx.stroke();
   }
  });}
}
function drawLivingFace(ctx,s,m,apex){
 if(!m.enabled)return;
 withSave(ctx,function(){
  ctx.lineCap='round';ctx.strokeStyle=apex?'#e08bb4':'#8bc2c5';ctx.lineWidth=1.35;
  var gape=m.breath*.7+m.jaw;
  for(var side=-1;side<=1;side+=2){
   ctx.beginPath();ctx.moveTo(27,side*(6.5+gape));ctx.quadraticCurveTo(34,side*(8.4+gape),37,side*(7.2+gape));ctx.stroke();
   // Tracking glint: moves within the existing eye, never relocates an eyestalk.
   ellipse(ctx,39.8+m.eye*.27,side*(apex?9:17)-.9,.85,.85,apex?'#fff3fb':'#fff4d7');
  }
  ctx.strokeStyle=apex?'#fd9fd1':'#6bb3ba';ctx.lineWidth=1.0;
  ctx.beginPath();ctx.moveTo(37,-2);ctx.quadraticCurveTo(41+m.jaw,0,37,2);ctx.stroke();
 });
}
function drawClawFlex(ctx,s,m,part,major,side,apex){
 if(!m.enabled || (part&&part.broken))return;
 // Small tendon/jaw glints are attached after the engine-owned claw pose rotation.
 var q=m.jaw*(apex?3:1.6)+m.shock*(apex?1.0:.5);
 ctx.lineCap='round';ctx.strokeStyle=apex?'#ffe3f7':'#def9f4';ctx.lineWidth=1.4;
 ctx.beginPath();ctx.moveTo(18,-5);ctx.quadraticCurveTo(30,-10-q,38,-5-q*.30);ctx.stroke();
 ellipse(ctx,14,-2,2.3,2.3,apex?'#df8ab7':'#91c6c4');
}
function drawLivingCrest(ctx,s,m,apex){
 if(!m.enabled)return;
 var ruined=(s.shell&&s.shell.fractureStage||0)>=3;
 if(ruined)return;
 var positions=apex?[[-27,-13,1.5],[-5,-17,1.9],[18,-11,1.35]]:[[-17,-17,1],[-2,-20,1.3],[13,-14,1]];
 for(var i=0;i<positions.length;i++){(function(v){withSave(ctx,function(){
  ctx.translate(v[0],v[1]);
  // Crystal pivots sit at their bases; impact creates a brief lagging recoil.
  var a=(m.crest*.023+m.shift*.025)*(i%2?-.8:1)*(apex?1.5:.62);
  ctx.rotate(a);ctx.globalAlpha=.70+.12*(1+Math.sin((s.tNow||0)*4.2+i));
  var h=(apex?13:8)*v[2];
  shard(ctx,[[-2,0],[-3,-h*.47],[0,-h],[4,-h*.37],[3,1]],apex?'#e68ec5':'#91d8e1',apex?'#ffe0f8':'#d6faff');
  ctx.strokeStyle=apex?'#fff2fa':'#ffffff';ctx.lineWidth=.95;ctx.beginPath();ctx.moveTo(0,-h);ctx.lineTo(1,-h*.28);ctx.stroke();
 });})(positions[i]);}
}
function drawInertiaTrail(ctx,s,m,apex){
 if(!m.enabled||m.shock<=.08)return;
 withSave(ctx,function(){ctx.translate(s.x,s.y);ctx.rotate(s.dir||0);
   ctx.globalAlpha=Math.min(.30,m.shock*(apex?.33:.20));
   ctx.lineWidth=apex?1.6:2.8;ctx.strokeStyle=apex?'#efa3dc':'#c9c6ad';
   for(var k=-1;k<=1;k++){
    ctx.beginPath();ctx.moveTo(-s.r*.85,-7+k*8);ctx.quadraticCurveTo(-s.r*1.20,-5+k*8,-s.r*1.45,-6+k*8);ctx.stroke();
   }
 });
}

function rigVisible(opts,id){return !opts||!opts.onlyLayer||opts.onlyLayer===id;}
function rigPart(ctx,s,opts,id,drawFn){
 var R=typeof globalThis!=='undefined'&&globalThis.CragclawRig;
 if(R)R.withBone(ctx,'apex_cragclaw',s,id,opts,drawFn);else drawFn();
}
function drawBody(ctx,s,opts){var m=secondaryMotion(s,opts),p=(Config.variants[s.variant]||Config.variants.apex).palette, pose=s.pose||{};
 withSave(ctx,function(){
   var z=s.r/33,bob=(pose.bodyBob||0)*s.r;
   ctx.translate(s.x,s.y+bob);ctx.rotate(s.dir);ctx.scale(z,z);var roll=pose.shellTilt||0;var slide=pose.lateral||0;
   if(rigVisible(opts,'shadow'))ellipse(ctx,-3,12,43,28,'rgba(0,0,0,.25)');
   for(var side=-1;side<=1;side+=2)for(var i=0;i<4;i++){
     (function(side,i){var id='leg_'+(side<0?'upper':'lower')+'_'+(i+1);
       if(rigVisible(opts,id))rigPart(ctx,s,opts,id,function(){drawLeg(ctx,-24+i*13,side*10,side,i,s.phase,pose.legCycle||0,slide,pose.gaitWeight||0,pose.limp||0);});
     })(side,i);
   }
   for(var sl=-1;sl<=1;sl+=2)for(var li=0;li<4;li++){
     (function(sl,li){var id='leg_'+(sl<0?'upper':'lower')+'_'+(li+1);
       if(rigVisible(opts,id))rigPart(ctx,s,opts,id,function(){drawFootMotion(ctx,s,sl,li,m,true);});
     })(sl,li);
   }
   // Slight weight shift makes the armor settle over the leg pair.
   var stagger=s.staggerVisual||{};ctx.translate((stagger.slide||0)+(stagger.shake||0),roll*9+slide*1.5);if(stagger.brace)ctx.rotate(stagger.brace*.08);
   if(rigVisible(opts,'shell'))rigPart(ctx,s,opts,'shell',function(){
   drawApexRear(ctx,s);
   // layered carapace
   ellipse(ctx,-5,5,36,27,'#241a32');
   var base=ctx.createLinearGradient(-42,-28,38,25);base.addColorStop(0,'#a46a8c');base.addColorStop(.30,'#694060');base.addColorStop(.64,p.shell);base.addColorStop(1,'#241b36');
   ellipse(ctx,-5,-3,39,29,base,'#23152d',2.4);
   ctx.beginPath();ctx.ellipse(-7,-11,31,15,-.1,Math.PI,Math.PI*2);ctx.strokeStyle='rgba(210,245,252,.35)';ctx.lineWidth=1.6;ctx.stroke();
   // sculpted plates
   ctx.lineWidth=2.1;ctx.strokeStyle='rgba(16,49,66,.56)';
   ctx.beginPath();ctx.moveTo(-29,-15);ctx.quadraticCurveTo(-8,-1,-23,17);ctx.moveTo(11,-22);ctx.quadraticCurveTo(6,-3,19,17);ctx.stroke();
   // facets embedded along shell ridge
   for(var j=0;j<3;j++)drawCrystal(ctx,-9+j*13,-11+(j%2)*3,8+(j===1?3:0),19+(j===1?8:0),s.phase);
   // Shell fractures remain driven by the engine state.
   var shell=s.shell||{}, fracture=shell.fractureStage||0;
   drawApexShell(ctx,s,fracture);


   if(fracture>=1){ctx.strokeStyle='rgba(98,213,237,.95)';ctx.lineWidth=2;
      ctx.beginPath();ctx.moveTo(-29,-13);ctx.lineTo(-18,-6);ctx.lineTo(-13,4);ctx.lineTo(-1,10);ctx.stroke();}
   if(fracture>=2){ctx.lineWidth=2.3;ctx.beginPath();ctx.moveTo(20,-15);ctx.lineTo(7,-5);ctx.lineTo(12,9);ctx.lineTo(3,18);ctx.stroke();
      ellipse(ctx,-19,-5,4.5,3.1,'#b6e3ee');}
   if(fracture>=3){ctx.fillStyle='rgba(20,33,41,.70)';ellipse(ctx,-5,-2,22,12,'rgba(12,39,52,.5)');
      ctx.strokeStyle='#ff9cce';ctx.lineWidth=2.2;ctx.beginPath();ctx.moveTo(-20,-9);ctx.lineTo(0,6);ctx.lineTo(16,-6);ctx.stroke();}
   // mineral cracks in phase 3
   if(s.phase>=3){ctx.strokeStyle='rgba(135,236,255,.83)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-31,7);ctx.lineTo(-19,-1);ctx.lineTo(-11,5);ctx.lineTo(2,1);ctx.stroke();}
   }); // shell layer ends before separately articulated shoulder/crest layers
   if(rigVisible(opts,'shoulders'))rigPart(ctx,s,opts,'shoulders',function(){drawShoulderMotion(ctx,s,m,true);});
   if(rigVisible(opts,'crest'))rigPart(ctx,s,opts,'crest',function(){drawLivingCrest(ctx,s,m,true);});
   if(rigVisible(opts,'face'))rigPart(ctx,s,opts,'face',function(){
   // face mouth and eyestalks
   ellipse(ctx,28,0,17,16,'#74445e','#27192c',1.5);
   ctx.strokeStyle='#283e49';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(40,-5);ctx.quadraticCurveTo(46,0,40,5);ctx.stroke();
   drawApexFace(ctx,s);
   drawLivingFace(ctx,s,m,true);
   }); // face layer
   if(rigVisible(opts,'eyes'))rigPart(ctx,s,opts,'eyes',function(){
   ctx.strokeStyle='#466779';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(31,-10);ctx.lineTo(40,-17);ctx.moveTo(31,10);ctx.lineTo(40,17);ctx.stroke();
   ellipse(ctx,40,-17,4.8,4.8,'#fae3a1','#172d3b',1);ellipse(ctx,40,17,4.8,4.8,'#fae3a1','#172d3b',1);
   ellipse(ctx,41,-17,2.0,2.2,'#142b35');ellipse(ctx,41,17,2.0,2.2,'#142b35');
   }); // eye stalks layer
   var parts=s.parts||{},cr=parts.crusher&&parts.crusher.broken,pi=parts.pincer&&parts.pincer.broken;
   if(rigVisible(opts,'crusher'))rigPart(ctx,s,opts,'crusher',function(){drawClaw(ctx,s,-1,parts.crusher||{broken:cr},true,pose.clawOpen||0.2,pose.claws&&pose.claws.crusher,m);});
   if(rigVisible(opts,'pincer'))rigPart(ctx,s,opts,'pincer',function(){drawClaw(ctx,s,1,parts.pincer||{broken:pi},false,pose.clawOpen||0.2,pose.claws&&pose.claws.pincer,m);});
   if(!opts.onlyLayer && s.mode==='stagger'){
      var intensity=clamp((s.staggerRemaining||0)/1.05,0,1);
      for(var q=0;q<5;q++){var theta=q*1.256;glow(ctx,Math.cos(theta)*40,Math.sin(theta)*34,9,'rgba(254,193,102,'+(.15*intensity)+')');}
   }
   if(!opts.onlyLayer && s.mode==='hurt'){ellipse(ctx,0,0,39,28,'rgba(255,255,255,.33)');}
 });
}

// Art v1.2: FX are deterministic functions of Core snapshots; no independent combat clocks.
function actionTiming(s){
 var a=s.attack;if(!a)return null;
 var t=Math.max(0,a.t||0),tele=Math.max(.001,a.tele||.001),act=Math.max(.001,a.act||.001);
 return {id:a.id,mode:a.phase||'tele',wind:clamp(t/tele,0,1),act:clamp((t-tele)/act,0,1),recover:clamp((t-tele-act)/Math.max(.001,a.recover||.001),0,1)};
}
function fxStar(ctx,x,y,r,color,rot){
 withSave(ctx,function(){ctx.translate(x,y);ctx.rotate(rot||0);ctx.strokeStyle=color;ctx.lineWidth=1.7;ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(-r,0);ctx.lineTo(r,0);ctx.moveTo(0,-r);ctx.lineTo(0,r);ctx.stroke();
  ctx.lineWidth=1;ctx.beginPath();ctx.arc(0,0,r*.22,0,Math.PI*2);ctx.stroke();
 });
}
function fxRing(ctx,x,y,r,color,opacity,start,end){
 withSave(ctx,function(){ctx.globalAlpha=clamp(opacity,0,1);ctx.strokeStyle=color;ctx.lineWidth=2;
  ctx.beginPath();ctx.arc(x,y,Math.max(1,r),start===undefined?0:start,end===undefined?Math.PI*2:end);ctx.stroke();
 });
}
function drawWindupFX(ctx,s,opt){
 var a=actionTiming(s);if(!a||a.mode!=='tele')return;
 var p=s.pose||{},tips=p.claws||{},charge=a.wind,who=(a.id==='C01'||a.id==='C03')?'pincer':(a.id==='C02'||a.id==='C07')?'crusher':'both';
 var names=who==='both'?['crusher','pincer']:[who];
 for(var i=0;i<names.length;i++){
  var part=s.parts&&s.parts[names[i]];
  if(part&&part.broken)continue;
  var tp=tips[names[i]]&&tips[names[i]].tip;if(!tp)continue;
  var t=s.tNow||0,osc=Math.sin(t*8+i*2);
  drawClawCharge(ctx,tp,charge,osc,i,a.id);
 }
 drawBodyCharge(ctx,s,a);
}
function drawImpactFX(ctx,s,opt){
 var a=actionTiming(s);if(!a||a.mode!=='act')return;
 var boxes=s.attackHitboxes||[];
 // Only visible contact frames produce impact art. The Core owns all hit positions.
 if(!boxes.length)return;
 for(var i=0;i<Math.min(boxes.length,8);i++){
  var b=boxes[i];if(!Number.isFinite(b.x)||!Number.isFinite(b.y)||!(b.r>0))continue;
  drawContact(ctx,b,a,i,s);
 }
}
function drawRecoveryFX(ctx,s,opt){
 var a=actionTiming(s);if(!a||a.mode!=='recover')return;
 drawRelease(ctx,s,a);
}
function drawAmbientFX(ctx,s,opt){
 if(opt&&opt.reduceEffects)return;
 var t=Number.isFinite(s.tNow)?s.tNow:0;
 var shell=s.shell||{},parts=s.parts||{};
 var broken=shell.fractureStage>=3;
 var glowAmt=.35+.28*Math.sin(t*2.7);
 withSave(ctx,function(){ctx.translate(s.x,s.y);ctx.rotate(s.dir||0);
  ctx.globalAlpha=glowAmt*(broken?.30:1);
  drawAmbientDetails(ctx,s,t);
 });
}

function drawClawCharge(ctx,tip,charge,osc,i,id){
 var alpha=.20+.70*charge,rad=8+11*charge;
 fxRing(ctx,tip.x,tip.y,rad,'#fface3',alpha,-1.1,2.2);
 withSave(ctx,function(){ctx.globalAlpha=alpha;
  for(var n=0;n<3;n++){
   var th=(n/3)*Math.PI*2+osc*.05;
   var x=tip.x+Math.cos(th)*rad,y=tip.y+Math.sin(th)*rad;
   poly(ctx,[[x,y-4],[x+3,y],[x,y+4],[x-3,y]]);ctx.fillStyle=n===1?'#ffebf9':'#ff62b5';ctx.fill();
  }
 });
}
function drawBodyCharge(ctx,s,a){
 var p=a.wind;
 if(a.id==='C01'||a.id==='C02'||a.id==='C03'||a.id==='C07')return;
 withSave(ctx,function(){ctx.translate(s.x,s.y);ctx.rotate(s.dir||0);
  // Sharp crown resonance and refracted edge lights distinguish the apex from stone compression.
  var rad=s.r*.73;
  ctx.globalAlpha=p*.55;ctx.lineWidth=1.65;ctx.strokeStyle='#ffb8e8';
  for(var k=0;k<5;k++){
   var th=-Math.PI/2+k*Math.PI*2/5;
   var x=Math.cos(th)*rad,y=Math.sin(th)*rad;
   ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x*1.12,y*1.12);ctx.stroke();
   fxStar(ctx,x*1.12,y*1.12,2.4,'#ffe0fb',th*.5);
  }
  fxRing(ctx,0,0,s.r*.55,'#e56bbf',p*.46,-2.2,2.5);
 });
}
function drawContact(ctx,b,a,i,s){
 var t=a.act,alpha=clamp(Math.sin(Math.PI*clamp(t,.01,.99))*.88,.06,.90);
 withSave(ctx,function(){ctx.globalAlpha=alpha;
  var r=Math.min(b.r*.83,32);ctx.strokeStyle='#ffb8eb';ctx.lineWidth=2.5;
  // Crystal cuts are bounded by the *real* hitbox. No extra damage or false trail.
  for(var k=0;k<3;k++){
   var th=(-.95+k*.7)+(i*.3);
   ctx.beginPath();ctx.arc(b.x,b.y,r*(.58+.08*k),th,th+1.12);ctx.stroke();
  }
  for(var j=0;j<5;j++){
   var th=j*Math.PI*2/5+t*.13;
   var px=b.x+Math.cos(th)*r*.70,py=b.y+Math.sin(th)*r*.70;
   poly(ctx,[[px,py-4],[px+2.3,py],[px,py+5],[px-2.3,py]]);
   ctx.fillStyle=j%2?'#ff83c7':'#ffe0f5';ctx.fill();
  }
  fxStar(ctx,b.x,b.y,r*.19,'#fff0fa',t*.55);
 });
}
function drawRelease(ctx,s,a){
 var fade=1-a.recover;if(fade<=0)return;
 withSave(ctx,function(){ctx.translate(s.x,s.y);ctx.rotate(s.dir||0);
  ctx.globalAlpha=.38*fade;
  for(var k=0;k<3;k++){
   var th=-.85+k*.85;
   fxStar(ctx,-s.r*.4+Math.cos(th)*s.r*.55,Math.sin(th)*s.r*.55,2.5,'#ffadd8',k*.35);
  }
 });
}
function drawAmbientDetails(ctx,s,t){
 for(var i=0;i<5;i++){
  var th=i*1.27+t*.13,x=Math.cos(th)*24-7,y=Math.sin(th)*18;
  fxStar(ctx,x,y,1.3+(i%2),'#ffc9ec',th);
 }
}

function drawHitboxes(ctx,s){withSave(ctx,function(){var claws=s.pose&&s.pose.claws||{};for(var id in claws){var tp=claws[id].tip;ctx.fillStyle=id==='crusher'?'#fd8dbd':'#ffcf75';ctx.beginPath();ctx.arc(tp.x,tp.y,3.3,0,Math.PI*2);ctx.fill();}var hb=s.attackHitboxes||[];ctx.strokeStyle='#ff7c6c';ctx.lineWidth=1.8;for(var i=0;i<hb.length;i++){ctx.beginPath();ctx.arc(hb[i].x,hb[i].y,hb[i].r,0,Math.PI*2);ctx.stroke();}var pb=s.partHurtboxes||[];for(var j=0;j<pb.length;j++){ctx.strokeStyle=pb[j].broken?'#8e8588':'#f7c979';ctx.beginPath();ctx.arc(pb[j].x,pb[j].y,pb[j].r,0,Math.PI*2);ctx.stroke();}});}
function draw(ctx,s,opts){opts=opts||{};if(!opts.onlyLayer){drawFields(ctx,s);drawHuntHalo(ctx,s);drawTelegraphs(ctx,s);drawCrownExit(ctx,s);drawInertiaTrail(ctx,s,secondaryMotion(s,opts),true);}drawBody(ctx,s,opts);if(!opts.onlyLayer && !opts.reduceEffects){drawAmbientFX(ctx,s,opts);drawWindupFX(ctx,s,opts);drawImpactFX(ctx,s,opts);drawRecoveryFX(ctx,s,opts);}if(!opts.onlyLayer && opts.showHitboxes)drawHitboxes(ctx,s);if(opts.showRig && typeof globalThis!=='undefined' && globalThis.CragclawRig)globalThis.CragclawRig.markers(ctx,'apex_cragclaw',s,{showLabels:!!opts.showRigLabels,selectedBone:opts.selectedBone});}
function drawQuestIcon(ctx,size,variant){withSave(ctx,function(){ctx.clearRect(0,0,size,size);var b=ctx.createLinearGradient(0,0,0,size);b.addColorStop(0,'#3d233d');b.addColorStop(1,'#120f1d');ctx.fillStyle=b;ctx.fillRect(0,0,size,size);var z=size/128;var s={variant:variant||'apex',x:size*.44,y:size*.55,r:size*.225,dir:-.24,phase:3,pose:{bodyBob:0,clawOpen:.45,legCycle:0},parts:{crusher:{broken:false},pincer:{broken:false}}};drawBody(ctx,s,{reduceMotion:true});ctx.strokeStyle='#e375aa';ctx.lineWidth=3*z;ctx.strokeRect(2*z,2*z,size-4*z,size-4*z);});}
return {version:'1.4-art',draw:draw,drawQuestIcon:drawQuestIcon,drawLayer:function(ctx,s,id,opts){var o=Object.assign({},opts||{},{onlyLayer:id,reduceEffects:true,showHitboxes:false});return draw(ctx,s,o);},getRigPose:function(s,opts){var R=typeof globalThis!=='undefined'&&globalThis.CragclawRig;return R?R.pose('apex_cragclaw',s,opts):null;}};
});
