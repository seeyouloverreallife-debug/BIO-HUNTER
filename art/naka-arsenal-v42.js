/* Naka 4.2: two physical attacks and two observed-pressure evasions.
   Same bones for rendering, damage, forecasts and swept collision. No dodge immunity. */
(function(root){'use strict';
 const C=root.NakaCore,A=root.NakaAnimationV26,B=root.NakaBehaviorV27,L=root.NakaLocomotionV29,M=root.NakaMotionV39,H=root.NakaPursuitV38,cfg=root.NakaConfigV28;
 if(!root.NakaContinuousV41)throw Error('Arsenal 4.2 requires continuous pursuit 4.1');
 const ids=new Set(['crescent_fang','tail_reap']),copy=p=>({x:p.x,y:p.y}),smooth=x=>{x=C.clamp(x,0,1);return x*x*(3-2*x);};
 cfg.attacks.push(
  {id:'crescent_fang',windup:.48,active:.30,recovery:.48,range:165,damage:15,arsenalV42:true,shape:'curved-head-capsule',counterplay:'Read the curved fang path and dodge outside it; aim locks before windup.'},
  {id:'tail_reap',windup:.60,active:.32,recovery:.58,range:225,damage:16,arsenalV42:true,shape:'rear-tail-capsules',counterplay:'Leave the marked tail sweep and punish the recovery.'}
 );
 Object.assign(B.ATTACK_FAMILY,{crescent_fang:'head',tail_reap:'tail'});
 Object.assign(B.ENVELOPES,{crescent_fang:[65,165],tail_reap:[35,225]});
 const prepare0=M.prepare,angle0=M.headAngle,drive0=root.NakaAttackV34.headDrive;
 M.prepare=function(a,v,base){return ids.has(a.id)?{...a,motionVariant:v,motionStartHeading:Math.atan2(base[0].y-base[1].y,base[0].x-base[1].x),motionHeadV39:a.id==='crescent_fang'}:prepare0(a,v,base);};
 function coordinates(a,t,distance){
  const reach=C.clamp(distance-20,48,145),side=a.crescentSide42||1,w=a.windup,act=a.active;
  if(t<w){const u=smooth(t/w);return {x:-9*u,y:12*side*u,angle:Math.atan2(58,reach*.5+9),load:u,extension:0};}
  const u=smooth((t-w)/act),v=1-u;
  return {x:v*v*-9+2*v*u*reach*.5+u*u*reach,y:side*(v*v*12+2*v*u*70),angle:Math.atan2(side*(2*v*58-2*u*70),2*v*(reach*.5+9)+2*u*reach*.5),load:0,extension:u};
 }
 function headAt(base,a,t,aim,target){const q=coordinates(a,t,C.dist(base[0],target));return {x:base[0].x+Math.cos(aim)*q.x-Math.sin(aim)*q.y,y:base[0].y+Math.sin(aim)*q.x+Math.cos(aim)*q.y};}
 M.headAngle=function(chain,a,t,aim){
  if(a.id!=='crescent_fang')return angle0(chain,a,t,aim);
  // The curve's tangent is deterministic from the committed attack distance.
  const q=coordinates(a,t,a.crescentDistance42||110),bone=Math.atan2(chain[0].y-chain[1].y,chain[0].x-chain[1].x),goal=aim+q.angle;
  if(t<a.windup)return a.motionStartHeading+C.wrapAngle(goal-a.motionStartHeading)*smooth(t/a.windup);
  if(t<a.windup+a.active)return goal;
  return goal+C.wrapAngle(bone-goal)*smooth((t-a.windup-a.active)/a.recovery);
 };
 root.NakaAttackV34.headDrive=function(a,t){if(a.id!=='crescent_fang')return drive0(a,t);return {...coordinates(a,t,a.crescentDistance42||110),beat:root.NakaAttackV34.beat(a,t)};};
 // Keep the committed distance in both live and manual specs for matching head aim.
 function prepare(a,target,base){const heading=Math.atan2(base[0].y-base[1].y,base[0].x-base[1].x),toward=Math.atan2(target.y-base[0].y,target.x-base[0].x);return ids.has(a.id)?{...a,crescentDistance42:C.dist(base[0],target),crescentSide42:C.wrapAngle(toward-heading)<0?-1:1}:a;}
 const cache=new Map(),HZ=240;
 function plan(base,a,aim,target){
  const key=JSON.stringify([base,a.id,a.windup,a.active,a.recovery,aim,target,a.motionVariant]);
  if(cache.has(key)){const p=cache.get(key);cache.delete(key);cache.set(key,p);return p;}
  const states=[L.create(base,{variant:a.motionVariant||'marsh',spacing:18,maxBendRadians:.68})],duration=A.duration(a);
  for(let i=1;i<=Math.ceil(duration*HZ);i++)states.push(L.advance(states.at(-1),{head:headAt(base,a,Math.min(duration,i/HZ),aim,target),dt:1/HZ,speed:0}));
  const p={states,duration};cache.set(key,p);while(cache.size>12)cache.delete(cache.keys().next().value);return p;
 }
 function tailPose(base,a,t){
  let envelope;if(t<a.windup)envelope=-.5*smooth(t/a.windup);else if(t<a.windup+a.active)envelope=-.5+1.5*smooth((t-a.windup)/a.active);else envelope=1-smooth((t-a.windup-a.active)/a.recovery);
  const out=base.slice(0,18).map(copy);let angle=Math.atan2(base[17].y-base[16].y,base[17].x-base[16].x),oldAngle=angle;
  for(let i=18;i<base.length;i++){
   const original=Math.atan2(base[i].y-base[i-1].y,base[i].x-base[i-1].x),bend=C.wrapAngle(original-oldAngle),offset=.30*envelope*Math.sin((i-17)/9*Math.PI*.8);
   angle+=C.clamp(bend+offset,-.68,.68);out.push({x:out[i-1].x+18*Math.cos(angle),y:out[i-1].y+18*Math.sin(angle)});oldAngle=original;
  }return out;
 }
 function geometry(id,chain,aim,t,a){
  if(!A.isActive(A.phaseAt(a,t)))return null;
  if(id==='tail_reap')return {kind:'capsules',points:chain.slice(18).map(copy),radius:14};
  const angle=M.headAngle(chain,a,t,aim),h=chain[0];return {kind:'capsule',a:copy(h),b:{x:h.x+Math.cos(angle)*34,y:h.y+Math.sin(angle)*34},radius:20};
 }
 const sample0=A.samplePose;
 A.samplePose=function(base,a,t,o={}){
  if(!ids.has(a.id))return sample0(base,a,t,o);
  const aim=o.aim||0,target=o.center||base[0],stage=A.phaseAt(a,t),active=A.isActive(stage);let chain;
  if(a.id==='tail_reap')chain=tailPose(base,a,t);
  else {const p=plan(base,a,aim,target),time=C.clamp(t,0,p.duration),i=Math.min(Math.floor(time*HZ),p.states.length-1);chain=L.advance(p.states[i],{head:headAt(base,a,time,aim,target),dt:1/HZ,speed:0}).chain.map(copy);}
  return {chain,stage,active,rootTravel:0,zone:null,hitbox:active?C.attackCollisionGeometry(a.id,chain,aim,t,a):null,telegraph:{committed:true,stage,warning:stage.includes('windup'),aim,center:copy(target)}};
 };
 function evadeHead(p,now){
  const u=smooth((now-p.startedAt-.12)/(p.duration-.12)),v=1-u;
  const x=3*v*v*u*p.c1.x+3*v*u*u*p.c2.x+u*u*u*p.end.x,y=3*v*v*u*p.c1.y+3*v*u*u*p.c2.y+u*u*u*p.end.y;
  return {x:p.head.x+Math.cos(p.heading)*x-Math.sin(p.heading)*y,y:p.head.y+Math.sin(p.heading)*x+Math.cos(p.heading)*y};
 }
 function evadePlan(o){
  const distance=C.dist(o.head,o.player),id=distance<58?'withdraw_s':'slip_side',scale=C.clamp(o.evasionScale??(o.tailBroken?.72:1),.20,1),candidates=[];
  for(const side of [-1,1]){
   const p={id,side,startedAt:o.now,duration:id==='withdraw_s'?.90:.82,head:copy(o.head),heading:o.heading,c1:{x:id==='withdraw_s'?-20:25,y:0},c2:{x:id==='withdraw_s'?-65:15,y:side*(id==='withdraw_s'?28:66)},end:{x:id==='withdraw_s'?-68:-6,y:side*(id==='withdraw_s'?42:80)}};
   for(const k of ['c1','c2','end']){p[k].x*=scale;p[k].y*=scale;}
   let safe=true,cost=0;
   // A cubic stays within its control-point convex hull; all controls must be in bounds.
   for(const q of [p.c1,p.c2,p.end]){const world={x:p.head.x+Math.cos(p.heading)*q.x-Math.sin(p.heading)*q.y,y:p.head.y+Math.sin(p.heading)*q.x+Math.cos(p.heading)*q.y};if(C.dist(world,root.NakaReapproachV40.bound(world,o))>1e-6)safe=false;}
   for(let i=0;i<=24;i++){const q=evadeHead(p,o.now+p.duration*i/24);if(C.dist(q,root.NakaReapproachV40.bound(q,o))>1e-6){safe=false;break;}
    for(const n of (o.spine||[]).slice(9))cost+=Math.max(0,28-C.dist(q,n));}
   const end=evadeHead(p,o.now+p.duration);cost-=C.dist(end,o.player)*.05;
   if(safe)candidates.push({...p,cost});
  }return candidates.sort((a,b)=>a.cost-b.cost||a.side-b.side)[0]||null;
 }
 function threatened(o){const t=o.threat;if(!t?.winding||t.age<.10||t.age>=t.windup||t.shot||!Number.isFinite(t.facing))return false;
  const d=C.dist(o.head,o.player),angle=Math.atan2(o.head.y-o.player.y,o.head.x-o.player.x);
  return d<=Math.min(175,t.range+24)&&Math.abs(C.wrapAngle(angle-t.facing))<=Math.min(1.7,t.arc+.25);
 }
 const decide0=B.decide,commit0=B.committed,cancel0=H.cancel;
 function evadeDecision(state,o){const p=state.evade42;state.mode='evade-'+p.id;state.lastReason='observed melee windup: committed grounded evade';
  return {state,intent:{kind:'move',mode:state.mode,evade42:p,target:evadeHead(p,p.startedAt+p.duration),reason:state.lastReason},ranked:[]};
 }
 B.decide=function(previous,o){
  let state={...(previous||B.createState())};
  if(o.busy)return decide0(state,o);
  if(state.evade42){if(o.now<state.evade42.startedAt+state.evade42.duration)return evadeDecision(state,o);state.evade42=null;}
  const d=decide0(state,o);state=d.state;const p=state.pursuit,rest=o.now<(p?.restUntil||0),counter=d.intent.kind==='attack'&&(d.intent.finishV40||d.intent.id===o.reactive||d.intent.id===o.escapeFollowup);
  if(rest||counter||o.headBroken)return d;
  if(p?.active&&o.now>=state.nextAttackAt&&o.now>=(state.nextEvadeAt42??2)&&threatened(o)){
   const e=evadePlan(o);if(e){state.evade42=e;state.nextEvadeAt42=o.now+({dusk:4.8,marsh:5.8,ancient:6.8}[o.variant.id]);state.nextAttackAt=o.now+e.duration+.18;state.pursuit={...p,until:p.until+e.duration};return evadeDecision(state,o);}
  }
  if(!p?.active||o.now<state.nextAttackAt||o.now-p.startedAt<.32)return d;
  const distance=C.dist(o.head,o.player),facing=Math.abs(C.wrapAngle(Math.atan2(o.player.y-o.head.y,o.player.x-o.head.x)-o.heading));
  const nearTail=(o.spine||[]).slice(18).some(n=>C.dist(n,o.player)<75),speed=Math.hypot(o.observedVelocity?.x||0,o.observedVelocity?.y||0);
  let id=nearTail&&facing>.9?'tail_reap':distance>=80&&distance<=160&&facing<1.12&&(facing>.30||speed>75)?'crescent_fang':null;
  if(!id||o.now-(state.lastArsenal42?.[id]??-100)<7||!B.attackLegal(id,o,state).ok)return d;
  state.mode='pursuit-strike';state.lastReason=id==='crescent_fang'?'curve across observed flank':'clear close tail pressure';state.lastAction='attack';
  return {...d,state,intent:{kind:'attack',id,pursuit:true,target:H.attackTarget(o,id),mode:state.mode,reason:state.lastReason}};
 };
 B.committed=function(old,id,now){const state=commit0(old,id,now);state.evade42=null;if(ids.has(id))state.lastArsenal42={...(old.lastArsenal42||{}),[id]:now};return state;};
 H.cancel=function(old,now,variant){return {...cancel0(old,now,variant),evade42:null};};
 function cancelMovement(state){return {...state,evade42:null};}
 root.NakaArsenalV42={version:'4.2.0',ids,prepare,geometry,evadeHead,evadePlan,threatened,cancelMovement,cacheSize:()=>cache.size};
})(typeof globalThis!=='undefined'?globalThis:this);
