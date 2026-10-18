/* BIO Hunter Cragclaw Art v1.4 — procedural Canvas2D, pure draw(snapshot). */
(function(root,factory){'use strict';root.CragclawArt=factory(root.CragclawConfig);})(typeof globalThis!=='undefined'?globalThis:this,function(Config){
'use strict';
function clamp(n,a,b){return Math.max(a,Math.min(b,n));}
function poly(ctx,pts){ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);for(var i=1;i<pts.length;i++)ctx.lineTo(pts[i][0],pts[i][1]);ctx.closePath();}
function ellipse(ctx,x,y,rx,ry,fill,stroke,lw){ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.lineWidth=lw||1;ctx.strokeStyle=stroke;ctx.stroke();}}
function withSave(ctx,fn){ctx.save();try{fn();}finally{ctx.restore();}}
function glow(ctx,x,y,r,color){var g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,'rgba(65,175,217,0)');ctx.fillStyle=g;ctx.fillRect(x-r,y-r,2*r,2*r);}
function drawTelegraphs(ctx,s){var ts=s.telegraphs||[];for(var i=0;i<ts.length;i++){(function(t){withSave(ctx,function(){
  ctx.strokeStyle=t.color||'rgba(247,203,111,.68)';ctx.fillStyle=t.color||'rgba(247,203,111,.3)';ctx.globalAlpha=.38+.5*clamp(t.progress||0,0,1);ctx.lineWidth=2;ctx.setLineDash([7,5]);
  if(t.type==='circle'){ctx.beginPath();ctx.arc(t.x,t.y,t.r,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);ctx.globalAlpha*=.23;ctx.fill();}
  else if(t.type==='line'){ctx.lineWidth=t.width||20;ctx.beginPath();ctx.moveTo(t.x1,t.y1);ctx.lineTo(t.x2,t.y2);ctx.stroke();}
  else if(t.type==='arc'){ctx.beginPath();ctx.arc(t.x,t.y,t.r,t.start,t.end);ctx.stroke();}
  else if(t.type==='spike'){ctx.beginPath();ctx.arc(t.x,t.y,t.r,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);ctx.beginPath();ctx.moveTo(t.x,t.y-t.r*.8);ctx.lineTo(t.x+t.r*.7,t.y+t.r*.6);ctx.lineTo(t.x-t.r*.7,t.y+t.r*.6);ctx.closePath();ctx.fill();}
});})(ts[i]);}}
function drawCrystal(ctx,x,y,w,h,phase){withSave(ctx,function(){
  ctx.translate(x,y);var luminous=phase===3?'#baf9ff':'#5fcbec';
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
  ctx.strokeStyle='#172f40';ctx.lineWidth=8;
  ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(kneeX,kneeY);ctx.lineTo(toeX,toeY);ctx.stroke();
  ctx.strokeStyle='#637f7e';ctx.lineWidth=5.2;
  ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(kneeX,kneeY);ctx.lineTo(toeX,toeY);ctx.stroke();
  ellipse(ctx,kneeX,kneeY,3.7,3.6,'#a8cad1','#355667',1);
  ctx.strokeStyle='#e5eef0';ctx.lineWidth=1.35;
  for(var claw=-1;claw<=1;claw++){ctx.beginPath();ctx.moveTo(toeX+claw*2,toeY);ctx.lineTo(toeX+claw*3+4,toeY+side*3);ctx.stroke();}
  // Broad slate knee shields and cool etched mineral seams.
  shard(ctx,[[kneeX-6,kneeY-side*2],[kneeX-10,kneeY+side*3],[kneeX+1,kneeY+side*5]],'#496b72','#223e48');
  ctx.strokeStyle='#a4c5ba';ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(kneeX-4,kneeY);ctx.lineTo(toeX-2,toeY);ctx.stroke();
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
    var gr=ctx.createLinearGradient(8,-12,45,14);gr.addColorStop(0,'#a6d3d7');gr.addColorStop(.44,major?'#587d94':'#7095a6');gr.addColorStop(1,'#213c4f');
    ellipse(ctx,28,0,w,h,gr,'#253d4e',2);
    ellipse(ctx,24,-5,w*.45,h*.29,'rgba(219,249,255,.28)');
    var jaw=clawOpen*7;
    poly(ctx,[[34,-4-jaw],[58,-13-jaw],[55,-3-jaw],[39,3-jaw]]);ctx.fillStyle='#b2e1e4';ctx.fill();ctx.stroke();
    poly(ctx,[[34,5+jaw],[55,13+jaw],[58,5+jaw],[40,-1+jaw]]);ctx.fillStyle='#547b95';ctx.fill();ctx.stroke();
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
  drawNormalClawAccent(ctx,side,broken,major,fracture);
  drawClawFlex(ctx,s,m,part,major,side,false);
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

// Appearance pass v1.1: deterministic materials, preserved pose and combat geometry.
function shard(ctx,pts,fill,edge){poly(ctx,pts);ctx.fillStyle=fill;ctx.fill();if(edge){ctx.strokeStyle=edge;ctx.lineWidth=1;ctx.stroke();}}
function drawNormalRear(ctx,s){
 withSave(ctx,function(){
  // Sturdy low silhouette: shale side-guards, not a vertical crystalline crown.
  for(var side=-1;side<=1;side+=2){
   shard(ctx,[[-37,side*10],[-52,side*24],[-43,side*31],[-23,side*25]],'#2a505a','#102d35');
   shard(ctx,[[-44,side*19],[-58,side*23],[-49,side*29]],'#82a7a2','#23404a');
   shard(ctx,[[4,side*16],[0,side*35],[11,side*32],[18,side*17]],'#395b66','#122e3a');
  }
 });
}
function drawNormalShell(ctx,s,fracture){
 withSave(ctx,function(){
  var damaged=fracture>=3;
  // Rounded overlapping basalt shields follow the compact crab mass.
  shard(ctx,[[-38,-10],[-26,-24],[-15,-20],[-20,-2],[-33,3]],'#314e57','#132e36');
  shard(ctx,[[-38,6],[-26,18],[-12,17],[-21,2]],'#41636a','#152f3a');
  shard(ctx,[[0,-26],[17,-21],[26,-8],[14,-1],[-2,-10]],'#3b6070','#19323c');
  shard(ctx,[[0,9],[17,4],[25,15],[12,22],[-2,18]],'#416576','#183743');
  // Thick mineral ribbing and shell ring distinguish a shielded species.
  ctx.lineCap='round';ctx.strokeStyle='rgba(10,27,34,.88)';ctx.lineWidth=4;
  ctx.beginPath();ctx.moveTo(-33,-12);ctx.quadraticCurveTo(-14,-29,9,-19);ctx.quadraticCurveTo(25,-14,27,-3);ctx.stroke();
  ctx.strokeStyle='#92afa9';ctx.lineWidth=1.7;ctx.beginPath();ctx.moveTo(-31,-14);ctx.quadraticCurveTo(-13,-28,8,-20);ctx.stroke();
  for(var side=-1;side<=1;side+=2){
    // Two inset turquoise ore seams, no free-standing crown.
    shard(ctx,[[-26,side*9],[-16,side*15],[-6,side*10],[-15,side*4]], damaged?'#5b7781':'#4d91a4','#193b48');
    ctx.strokeStyle=damaged?'#556f75':'#b5ebe2';ctx.lineWidth=1.15;
    ctx.beginPath();ctx.moveTo(-23,side*9);ctx.lineTo(-16,side*12);ctx.stroke();
  }
  // Asymmetric center ore stone, rough facet edges.
  shard(ctx,[[-10,-6],[-4,-18],[5,-19],[12,-8],[7,8],[-4,12]], damaged?'#41626e':'#4f9caa','#193e48');
  shard(ctx,[[-4,-18],[5,-19],[12,-8],[2,-4]],damaged?'#57717a':'#b1e0da');
  shard(ctx,[[-4,12],[2,-4],[7,8]],'#2e697e');
  if(!damaged){ctx.strokeStyle='#c4faf3';ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(-6,-6);ctx.lineTo(-3,-13);ctx.lineTo(3,-14);ctx.stroke();}
  ctx.strokeStyle='rgba(255,255,235,.35)';ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(-28,-20);ctx.lineTo(-20,-23);ctx.moveTo(12,-19);ctx.lineTo(19,-14);ctx.stroke();
  // Rock rivets: visible at small scale and entirely non-random.
  for(var k=0;k<6;k++){var a=-2.2+k*0.75;ellipse(ctx,-4+31*Math.cos(a),-2+22*Math.sin(a),2.4,2.2,'#7e9995','#29444e',.8);}
 });
}
function drawNormalFace(ctx,s){
 shard(ctx,[[25,-11],[39,-8],[44,0],[39,8],[25,11]],'#425f61','#1a3844');
 shard(ctx,[[33,-7],[43,0],[33,7]],'#8ba9a0');
 for(var side=-1;side<=1;side+=2){ellipse(ctx,41,side*17,5.7,5.2,'#edcb7f','#172f3b',1.2);ellipse(ctx,43,side*17,2.7,3.4,s.phase>=3?'#ff715d':'#2c3a37');ellipse(ctx,40.5,side*18.5,1.2,1.1,'#fff8dd');}
 ctx.strokeStyle='#d3d1aa';ctx.lineWidth=1.6;
 for(var side=-1;side<=1;side+=2){ctx.beginPath();ctx.moveTo(39,side*5);ctx.lineTo(47,side*7);ctx.stroke();}
}
function drawNormalClawAccent(ctx,side,broken,major,fracture){
 if(broken){shard(ctx,[[17,-8],[24,-4],[21,3],[13,7]],'#7c8880','#253c42');return;}
 // Smooth, heavy crusher; plated pincer's smaller than crusher.
 var ox=major?0:-2;
 shard(ctx,[[8+ox,-9],[17+ox,-15],[31+ox,-13],[44+ox,-5],[33+ox,1],[16+ox,-1]],major?'#667f7a':'#5e8584','#243e49');
 shard(ctx,[[12+ox,-10],[19+ox,-13],[33+ox,-11],[23+ox,-5]],'#b5cdc0');
 ctx.strokeStyle='#163440';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(21+ox,-12);ctx.lineTo(19+ox,4);ctx.moveTo(34+ox,-10);ctx.lineTo(33+ox,3);ctx.stroke();
 if(major){
   shard(ctx,[[31,-11],[39,-19],[44,-14],[41,-7]],'#4c9faf','#1e5665');
   shard(ctx,[[19,7],[27,13],[31,9],[26,4]],'#375a63','#182f3a');
 }else{shard(ctx,[[28,-11],[32,-15],[37,-12],[33,-7]],'#78c7ca','#2f6570');}
 if(fracture>=1){ctx.strokeStyle='#9cf3f0';ctx.lineWidth=1.7;ctx.beginPath();ctx.moveTo(23,-13);ctx.lineTo(28,-5);ctx.lineTo(24,3);ctx.stroke();}
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
 if(R)R.withBone(ctx,'cragclaw',s,id,opts,drawFn);else drawFn();
}
function drawBody(ctx,s,opts){var m=secondaryMotion(s,opts),p=(Config.variants[s.variant]||Config.variants.stone).palette, pose=s.pose||{};
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
       if(rigVisible(opts,id))rigPart(ctx,s,opts,id,function(){drawFootMotion(ctx,s,sl,li,m,false);});
     })(sl,li);
   }
   // Slight weight shift makes the armor settle over the leg pair.
   var stagger=s.staggerVisual||{};ctx.translate((stagger.slide||0)+(stagger.shake||0),roll*9+slide*1.5);if(stagger.brace)ctx.rotate(stagger.brace*.08);
   if(rigVisible(opts,'shell'))rigPart(ctx,s,opts,'shell',function(){
   drawNormalRear(ctx,s);
   // layered carapace
   ellipse(ctx,-5,5,36,27,'#233d4e');
   var base=ctx.createLinearGradient(-42,-28,38,25);base.addColorStop(0,'#b2c6bd');base.addColorStop(.30,'#708b86');base.addColorStop(.64,p.shell);base.addColorStop(1,'#233e46');
   ellipse(ctx,-5,-3,39,29,base,'#18343e',2.4);
   ctx.beginPath();ctx.ellipse(-7,-11,31,15,-.1,Math.PI,Math.PI*2);ctx.strokeStyle='rgba(210,245,252,.35)';ctx.lineWidth=1.6;ctx.stroke();
   // sculpted plates
   ctx.lineWidth=2.1;ctx.strokeStyle='rgba(16,49,66,.56)';
   ctx.beginPath();ctx.moveTo(-29,-15);ctx.quadraticCurveTo(-8,-1,-23,17);ctx.moveTo(11,-22);ctx.quadraticCurveTo(6,-3,19,17);ctx.stroke();
   // facets embedded along shell ridge
   for(var j=0;j<3;j++)drawCrystal(ctx,-9+j*13,-11+(j%2)*3,8+(j===1?3:0),19+(j===1?8:0),s.phase);
   // Shell fractures remain driven by the engine state.
   var shell=s.shell||{}, fracture=shell.fractureStage||0;
   drawNormalShell(ctx,s,fracture);


   if(fracture>=1){ctx.strokeStyle='rgba(98,213,237,.95)';ctx.lineWidth=2;
      ctx.beginPath();ctx.moveTo(-29,-13);ctx.lineTo(-18,-6);ctx.lineTo(-13,4);ctx.lineTo(-1,10);ctx.stroke();}
   if(fracture>=2){ctx.lineWidth=2.3;ctx.beginPath();ctx.moveTo(20,-15);ctx.lineTo(7,-5);ctx.lineTo(12,9);ctx.lineTo(3,18);ctx.stroke();
      ellipse(ctx,-19,-5,4.5,3.1,'#b6e3ee');}
   if(fracture>=3){ctx.fillStyle='rgba(20,33,41,.70)';ellipse(ctx,-5,-2,22,12,'rgba(12,39,52,.5)');
      ctx.strokeStyle='#a4f8ff';ctx.lineWidth=2.2;ctx.beginPath();ctx.moveTo(-20,-9);ctx.lineTo(0,6);ctx.lineTo(16,-6);ctx.stroke();}
   // mineral cracks in phase 3
   if(s.phase>=3){ctx.strokeStyle='rgba(135,236,255,.83)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-31,7);ctx.lineTo(-19,-1);ctx.lineTo(-11,5);ctx.lineTo(2,1);ctx.stroke();}
   }); // shell layer ends before separately articulated shoulder/crest layers
   if(rigVisible(opts,'shoulders'))rigPart(ctx,s,opts,'shoulders',function(){drawShoulderMotion(ctx,s,m,false);});
   if(rigVisible(opts,'crest'))rigPart(ctx,s,opts,'crest',function(){drawLivingCrest(ctx,s,m,false);});
   if(rigVisible(opts,'face'))rigPart(ctx,s,opts,'face',function(){
   // face mouth and eyestalks
   ellipse(ctx,28,0,17,16,'#b5b5a1','#274553',1.5);
   ctx.strokeStyle='#283e49';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(40,-5);ctx.quadraticCurveTo(46,0,40,5);ctx.stroke();
   drawNormalFace(ctx,s);
   drawLivingFace(ctx,s,m,false);
   }); // face layer
   if(rigVisible(opts,'eyes'))rigPart(ctx,s,opts,'eyes',function(){
   ctx.strokeStyle='#466779';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(31,-10);ctx.lineTo(40,-17);ctx.moveTo(31,10);ctx.lineTo(40,17);ctx.stroke();
   ellipse(ctx,40,-17,4.8,4.8,'#f6d185','#172d3b',1);ellipse(ctx,40,17,4.8,4.8,'#f6d185','#172d3b',1);
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
 var alpha=.17+.70*charge,rad=7+12*charge;
 fxRing(ctx,tip.x,tip.y,rad,'#bdf8ff',alpha,-2.2,.8);
 withSave(ctx,function(){ctx.globalAlpha=alpha;ctx.strokeStyle='#e2fcff';ctx.lineWidth=2.1;
  for(var n=0;n<3;n++){
   var th=(-1+n)*.8+osc*.06;ctx.beginPath();ctx.moveTo(tip.x+Math.cos(th)*rad,tip.y+Math.sin(th)*rad);
   ctx.lineTo(tip.x+Math.cos(th)*(rad+4+charge*4),tip.y+Math.sin(th)*(rad+4+charge*4));ctx.stroke();
  }
 });
}
function drawBodyCharge(ctx,s,a){
 if(a.id!=='C08'&&a.id!=='C06'&&a.id!=='C05'&&a.id!=='C04')return;
 var p=a.wind;
 withSave(ctx,function(){ctx.translate(s.x,s.y);ctx.rotate(s.dir||0);
  // Heavy concentric pressure rings indicate stone compression, not expanded damage range.
  for(var n=0;n<2;n++)fxRing(ctx,0,0,s.r*(.61+n*.16),n?'#80dce9':'#d2fbf1',(.18+n*.13)*p,-1.65,1.65);
  ctx.strokeStyle='#acdedd';ctx.globalAlpha=.65*p;ctx.lineWidth=3;
  for(var k=-1;k<=1;k++){ctx.beginPath();ctx.moveTo(-s.r*.4,k*10);ctx.lineTo(-s.r*.4-6*p,k*10);ctx.stroke();}
 });
}
function drawContact(ctx,b,a,i,s){
 var t=a.act,alpha=clamp(Math.sin(Math.PI*clamp(t,.01,.99))*.86,.06,.87);
 withSave(ctx,function(){ctx.globalAlpha=alpha;
  // Crushed stone fragments and a radial pressure wake stay within each actual hit circle.
  var radius=Math.min(b.r*.84,30);
  ctx.strokeStyle='#c5f5f6';ctx.lineWidth=2.4;
  for(var j=0;j<5;j++){
   var th=j*Math.PI*2/5+(i*.3),r0=radius*.29,r1=radius*(.50+.30*t);
   ctx.beginPath();ctx.moveTo(b.x+Math.cos(th)*r0,b.y+Math.sin(th)*r0);
   ctx.lineTo(b.x+Math.cos(th)*r1,b.y+Math.sin(th)*r1);ctx.stroke();
   var px=b.x+Math.cos(th)*r1,py=b.y+Math.sin(th)*r1;
   poly(ctx,[[px-2,py-3],[px+2,py-2],[px+3,py+2],[px-1,py+3]]);
   ctx.fillStyle=j%2?'#b4b7aa':'#71a8b2';ctx.fill();
  }
  ctx.strokeStyle='rgba(216,251,254,.85)';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.arc(b.x,b.y,radius*(.23+t*.46),-.8,2.1);ctx.stroke();
 });
}
function drawRelease(ctx,s,a){
 var fade=1-a.recover;if(fade<=0)return;
 withSave(ctx,function(){ctx.translate(s.x,s.y);ctx.rotate(s.dir||0);
  ctx.globalAlpha=.23*fade;ctx.strokeStyle='#9bc3bf';ctx.lineWidth=2.6;
  ctx.beginPath();ctx.arc(-7,0,s.r*.66,Math.PI*.9,Math.PI*1.9);ctx.stroke();
 });
}
function drawAmbientDetails(ctx,s,t){
 for(var i=0;i<3;i++){
  var xx=-10+i*13,yy=-16+((i%2)*3);
  fxStar(ctx,xx,yy,2.1+i*.5,'#d3f9f7',t*.08+i);
 }
}

function drawHitboxes(ctx,s){withSave(ctx,function(){var claws=s.pose&&s.pose.claws||{};for(var id in claws){var tp=claws[id].tip;ctx.fillStyle=id==='crusher'?'#62e8ff':'#ffcf75';ctx.beginPath();ctx.arc(tp.x,tp.y,3.3,0,Math.PI*2);ctx.fill();}var hb=s.attackHitboxes||[];ctx.strokeStyle='#ff7c6c';ctx.lineWidth=1.8;for(var i=0;i<hb.length;i++){ctx.beginPath();ctx.arc(hb[i].x,hb[i].y,hb[i].r,0,Math.PI*2);ctx.stroke();}var pb=s.partHurtboxes||[];for(var j=0;j<pb.length;j++){ctx.strokeStyle=pb[j].broken?'#8e8588':'#f7c979';ctx.beginPath();ctx.arc(pb[j].x,pb[j].y,pb[j].r,0,Math.PI*2);ctx.stroke();}});}
function draw(ctx,s,opts){opts=opts||{};if(!opts.onlyLayer){drawFields(ctx,s);drawTelegraphs(ctx,s);drawInertiaTrail(ctx,s,secondaryMotion(s,opts),false);}drawBody(ctx,s,opts);if(!opts.onlyLayer && !opts.reduceEffects){drawAmbientFX(ctx,s,opts);drawWindupFX(ctx,s,opts);drawImpactFX(ctx,s,opts);drawRecoveryFX(ctx,s,opts);}if(!opts.onlyLayer && opts.showHitboxes)drawHitboxes(ctx,s);if(opts.showRig && typeof globalThis!=='undefined' && globalThis.CragclawRig)globalThis.CragclawRig.markers(ctx,'cragclaw',s,{showLabels:!!opts.showRigLabels,selectedBone:opts.selectedBone});}
function drawQuestIcon(ctx,size,variant){withSave(ctx,function(){ctx.clearRect(0,0,size,size);var b=ctx.createLinearGradient(0,0,0,size);b.addColorStop(0,'#183745');b.addColorStop(1,'#0c1823');ctx.fillStyle=b;ctx.fillRect(0,0,size,size);var z=size/128;var s={variant:variant||'stone',x:size*.44,y:size*.55,r:size*.225,dir:-.24,phase:3,pose:{bodyBob:0,clawOpen:.45,legCycle:0},parts:{crusher:{broken:false},pincer:{broken:false}}};drawBody(ctx,s,{reduceMotion:true});ctx.strokeStyle='#72d8ee';ctx.lineWidth=3*z;ctx.strokeRect(2*z,2*z,size-4*z,size-4*z);});}
return {version:'1.4-art',draw:draw,drawQuestIcon:drawQuestIcon,drawLayer:function(ctx,s,id,opts){var o=Object.assign({},opts||{},{onlyLayer:id,reduceEffects:true,showHitboxes:false});return draw(ctx,s,o);},getRigPose:function(s,opts){var R=typeof globalThis!=='undefined'&&globalThis.CragclawRig;return R?R.pose('cragclaw',s,opts):null;}};
});
