/* Naka 4.4: bounded online observations -> curved interception and committed ambush.
   Reads visible positions/dodge motion only. Never changes an active attack aim. */
(function(root){'use strict';
 const C=root.NakaCore,B=root.NakaBehaviorV27,H=root.NakaPursuitV38,R=root.NakaArsenalV42;
 if(!root.NakaRiposteV43)throw Error('Hunt 4.4 requires riposte 4.3');
 const clamp=C.clamp,copy=p=>({x:p.x,y:p.y}),bound=root.NakaReapproachV40.bound;
 function capped(v,limit=220){const n=Math.hypot(v?.x||0,v?.y||0),f=n>limit?limit/n:1;return {x:(v?.x||0)*f,y:(v?.y||0)*f};}
 function fresh(){return {samples:[],dodges:[],lastAt:null,lastPosition:null,wasDodging:false,plan:null,lastPlanAt:-100};}
 function observe(previous,o){
  const old=previous.hunt44||fresh();if(old.lastAt!==null&&o.now<=old.lastAt)return previous;
  let h={...old,samples:old.samples.filter(s=>o.now-s.t<=3),dodges:old.dodges.filter(s=>o.now-s.t<=7)};
  const dt=old.lastAt===null?0:o.now-old.lastAt;
  if(old.lastPosition&&dt>0&&(C.dist(old.lastPosition,o.player)/dt>950||dt>1)){h=fresh();}
  const velocity=capped(o.observedVelocity||{x:0,y:0},o.dodging?420:220),last=h.samples.at(-1);
  if(!last||o.now-last.t>=.085){h.samples=[...h.samples,{t:o.now,x:o.player.x,y:o.player.y,vx:velocity.x,vy:velocity.y,dodge:!!o.dodging}].slice(-36);}
  if(o.dodging&&!h.wasDodging){const d=C.dist(o.head,o.player)||1,ux=(o.player.x-o.head.x)/d,uy=(o.player.y-o.head.y)/d,lateral=-uy*velocity.x+ux*velocity.y;
   if(Math.abs(lateral)>50)h.dodges=[...h.dodges,{t:o.now,side:Math.sign(lateral)}].slice(-6);
  }
  h.lastAt=o.now;h.lastPosition=copy(o.player);h.wasDodging=!!o.dodging;
  return {...previous,hunt44:h};
 }
 function read(h,o){
  const v=capped(o.observedVelocity),speed=Math.hypot(v.x,v.y),recent=(h.samples||[]).filter(s=>o.now-s.t<=.95&&!s.dodge&&Math.hypot(s.vx,s.vy)>35);
  let pattern='unknown',confidence=0,turnRate=0,coherence=0;
  if(recent.length>=6&&recent.at(-1).t-recent[0].t>=.55&&speed>35){
   let turns=[],sx=0,sy=0,path=0;
   for(let i=0;i<recent.length;i++){const q=recent[i];sx+=q.vx;sy+=q.vy;path+=Math.hypot(q.vx,q.vy);if(i){const p=recent[i-1],dt=q.t-p.t;turns.push({angle:C.wrapAngle(Math.atan2(q.vy,q.vx)-Math.atan2(p.vy,p.vx)),dt});}}
   coherence=Math.hypot(sx,sy)/(path||1);const sum=turns.reduce((a,q)=>a+q.angle,0),time=turns.reduce((a,q)=>a+q.dt,0),net=Math.abs(sum),absolute=turns.reduce((a,q)=>a+Math.abs(q.angle),0),consistent=absolute>1e-5?net/absolute:0;
   const mean={x:sx/recent.length,y:sy/recent.length},change=Math.abs(C.wrapAngle(Math.atan2(v.y,v.x)-Math.atan2(mean.y,mean.x)));
   if(change>.85){pattern='changing';confidence=.15;}
   else if(consistent>.82&&net>.16&&Math.abs(sum/(time||1))<=2.4){pattern=sum>0?'orbit-cw':'orbit-ccw';confidence=clamp(.6+.35*consistent,0,.95);turnRate=sum/(time||1);}
   else if(coherence>.94){const d=C.dist(o.head,o.player)||1,outward=((o.player.x-o.head.x)*v.x+(o.player.y-o.head.y)*v.y)/d;pattern=outward>35?'retreat-line':'straight';confidence=clamp(coherence*.92,0,.92);}
   else {pattern='weave';confidence=.4;}
  }
  const dodges=(h.dodges||[]).filter(s=>o.now-s.t<=7),bias=dodges.length>=3?dodges.reduce((n,s)=>n+s.side,0)/dodges.length:0;
  const dodgeSide=Math.abs(bias)>=.8?Math.sign(bias):0,dodgeConfidence=dodgeSide?Math.min(.95,.65+dodges.length*.05):0;
  if(speed<20){pattern='stopped';confidence=0;turnRate=0;}
  return {pattern,confidence,turnRate,coherence,dodgeSide,dodgeConfidence,speed};
 }
 function predicted(o,reading,seconds){
  const v=capped(o.observedVelocity),w=reading.confidence>=.6?reading.turnRate:0,t=seconds;
  if(Math.abs(w)<.05)return {x:o.player.x+v.x*t,y:o.player.y+v.y*t};
  return {x:o.player.x+(v.x*Math.sin(w*t)+v.y*(Math.cos(w*t)-1))/w,y:o.player.y+(v.x*(1-Math.cos(w*t))+v.y*Math.sin(w*t))/w};
 }
 function moveTarget(o,reading){
  const horizon=reading.confidence>=.6?clamp(C.dist(o.head,o.player)/420,.28,.48):.13,point=predicted(o,reading,horizon),d=C.dist(o.head,point)||1;
  const standoff=reading.pattern.startsWith('orbit-')?28:38;
  return bound({x:point.x-(point.x-o.head.x)/d*standoff,y:point.y-(point.y-o.head.y)/d*standoff},o);
 }
 function attackTarget(o,id,reading){
  const long=['lunge','crescent_fang'].includes(id),horizon=reading.confidence>=.6?(id==='lunge'?.26:long?.20:.12):.10;
  let point=predicted(o,reading,horizon);const d=C.dist(o.head,o.player)||1,ux=(o.player.x-o.head.x)/d,uy=(o.player.y-o.head.y)/d;
  if(reading.dodgeSide&&reading.dodgeConfidence>=.75){const n=reading.dodgeSide*22;point={x:point.x-uy*n,y:point.y+ux*n};}
  const dx=point.x-o.player.x,dy=point.y-o.player.y,length=Math.hypot(dx,dy),limit=long?56:34;
  if(length>limit)point={x:o.player.x+dx/length*limit,y:o.player.y+dy/length*limit};
  return bound(point,o);
 }
 function summary(reading,target,speedBoost=1){return {pattern:reading.pattern,confidence:+reading.confidence.toFixed(3),dodgeSide:reading.dodgeSide,dodgeConfidence:reading.dodgeConfidence,speedBoost,target:copy(target)};}
 const decide0=B.decide,cancel0=H.cancel;
 B.decide=function(previous,o){
  const observed=observe(previous||B.createState(),o),d=decide0(observed,o),state=d.state,h=state.hunt44,reading=read(h,o),p=state.pursuit,it=d.intent;
  // These owners retain their committed movement, counter window and guaranteed opening.
  if(o.busy||o.headBroken||!p?.active||o.now<(p.restUntil||0)||it.evade42||it.reapproachV40||it.riposte43||it.finishV40||state.riposte43)return d;
  const distance=C.dist(o.head,o.player),facing=Math.abs(C.wrapAngle(Math.atan2(o.player.y-o.head.y,o.player.x-o.head.x)-o.heading));
  const ready=o.now>=state.nextAttackAt&&o.now-p.startedAt>=.32,known=reading.confidence>=.6||reading.dodgeConfidence>=.75;
  const legal=id=>B.attackLegal(id,o,state).ok&&(!R.ids.has(id)||o.now-(state.lastArsenal42?.[id]??-100)>=7);
  let id=null;
  if(ready&&known){
   if(reading.dodgeConfidence>=.8&&distance<=82&&facing<.75&&legal('double_fang'))id='double_fang';
   else if(reading.pattern==='retreat-line'&&distance>=120&&distance<=180&&facing<.75&&legal('lunge'))id='lunge';
   else if(reading.pattern.startsWith('orbit-')&&distance>=80&&distance<=160&&facing<1.1&&legal('crescent_fang'))id='crescent_fang';
  }
  if(it.kind==='attack'&&(it.id===o.reactive||it.id===o.escapeFollowup))return d;
  if(it.kind==='attack'&&B.ATTACK_FAMILY[it.id]!=='head')return d;
  if(id||it.kind==='attack'&&it.pursuit&&known){
   id=id||it.id;const target=attackTarget(o,id,reading),info=summary(reading,target);state.mode='pursuit-strike';state.lastReason='read '+reading.pattern+(reading.dodgeSide?' / repeated dodge side':'')+' -> '+id;state.lastAction='attack';
   return {...d,intent:{...it,kind:'attack',id,pursuit:true,target,mode:'pursuit-strike',huntRead44:info,reason:state.lastReason}};
  }
  if(it.kind==='move'&&it.pursuit&&known&&reading.speed>35){
   const changed=h.plan?.pattern!==reading.pattern||h.plan?.dodgeSide!==reading.dodgeSide;
   const plan=!h.plan||o.now-h.lastPlanAt>=.16||changed?summary(reading,moveTarget(o,reading),reading.confidence>=.6?1.16:1.08):h.plan;
   state.hunt44={...h,plan,lastPlanAt:plan===h.plan?h.lastPlanAt:o.now};state.lastTarget=plan.target;state.lastReason='intercept observed '+reading.pattern;
   return {...d,intent:{...it,target:copy(plan.target),huntRead44:plan,reason:state.lastReason}};
  }
  return d;
 };
 H.cancel=function(old,now,variant){const s=cancel0(old,now,variant);return {...s,hunt44:s.hunt44?{...s.hunt44,plan:null,lastPlanAt:-100}:fresh()};};
 root.NakaHuntV44={version:'4.4.0',observe,read,predicted,moveTarget,attackTarget};
})(typeof globalThis!=='undefined'?globalThis:this);
