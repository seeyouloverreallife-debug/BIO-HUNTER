/* Naka 4.7: three physical counter styles and contextual species preferences.
   Guard poses are non-damaging; the head pulls the planted spine along its route. */
(function(root){'use strict';
 const C=root.NakaCore,B=root.NakaBehaviorV27,L=root.NakaLocomotionV29,H=root.NakaPursuitV38,R=root.NakaArsenalV42,A=root.NakaAnimationV26,M=root.NakaMotionV39;
 if(!root.NakaHuntV44)throw Error('Guard 4.7 requires hunt 4.4');
 const copy=p=>({x:p.x,y:p.y}),smooth=x=>{x=C.clamp(x,0,1);return x*x*(3-2*x);},cache=new Map(),HZ=240;
 function phase(g,now){const t=now-g.startedAt;return t<g.windup?'coil-load':t<g.windup+g.hold?'coil-guard':t<g.windup+g.hold+g.recovery?'coil-release':'done';}
 function headAt(g,time){
  const t=C.clamp(time-g.startedAt,0,g.windup+g.hold+g.recovery),u=smooth(t/g.windup),angle=g.startAngle+g.side*g.sweep*u,radius=g.radius-(g.radius-g.innerRadius)*u;
  const p={x:g.center.x+radius*Math.cos(angle),y:g.center.y+radius*Math.sin(angle)};
  if(t<=g.windup+g.hold)return p;
  const exit=smooth((t-g.windup-g.hold)/.60),direction=angle+Math.atan2(g.side*g.innerRadius*g.sweep,-(g.radius-g.innerRadius));return {x:p.x+Math.cos(direction)*70*exit,y:p.y+Math.sin(direction)*70*exit};
 }
 function prepare(o){
  const radius=90,innerRadius=8,sweep=13.2,windup={marsh:2.0,dusk:1.85,ancient:2.2}[o.variant.id],plans=[];
  for(const side of [-1,1]){
   const startAngle=o.heading-Math.atan2(side*radius*sweep,-(radius-innerRadius));
   const g={startedAt:o.now,base:o.spine.map(copy),variant:o.variant.id,heading:o.heading,side,radius,innerRadius,sweep,startAngle,windup,hold:1.05,recovery:.95,center:{x:o.head.x-radius*Math.cos(startAngle),y:o.head.y-radius*Math.sin(startAngle)}};let cost=0,safe=true;
   for(let i=0;i<=60;i++){const p=headAt(g,o.now+(g.windup+g.hold+g.recovery)*i/60);if(C.dist(p,root.NakaReapproachV40.bound(p,o))>1e-6){safe=false;break;}cost+=Math.max(0,55-C.dist(p,o.player));}
   if(safe)plans.push({...g,cost});
  }return plans.sort((a,b)=>a.cost-b.cost||a.side-b.side)[0]||null;
 }
 function planFor(g){const key=JSON.stringify([g.base,g.variant,g.heading,g.side,g.center,g.radius,g.innerRadius,g.sweep,g.windup,g.hold,g.recovery]);if(cache.has(key)){const p=cache.get(key);cache.delete(key);cache.set(key,p);return p;}
  const duration=g.windup+g.hold+g.recovery,states=[g.base.map(copy)],trail=g.base.slice().reverse().map(copy);
  for(let i=1;i<=Math.ceil(duration*HZ);i++){
   const h=headAt(g,g.startedAt+Math.min(duration,i/HZ));
   if(C.dist(h,trail.at(-1))<1e-8){states.push(states.at(-1));continue;}
   trail.push(h);const chain=[copy(h)];let cursor=trail.length-1,near=h;
   for(let joint=1;joint<g.base.length;joint++){
    const anchor=chain.at(-1);while(cursor>0&&C.dist(anchor,trail[cursor-1])<18){near=trail[--cursor];}
    const far=trail[Math.max(0,cursor-1)],dx=far.x-near.x,dy=far.y-near.y,px=near.x-anchor.x,py=near.y-anchor.y,aa=dx*dx+dy*dy,bb=2*(px*dx+py*dy),cc=px*px+py*py-324;
    const u=aa?C.clamp((-bb+Math.sqrt(Math.max(0,bb*bb-4*aa*cc)))/(2*aa),0,1):0;
    near={x:near.x+dx*u,y:near.y+dy*u};chain.push(copy(near));
   }
   states.push(C.solveSpineConstraints(chain,{spacing:18,maxBendRadians:.68}));
  }
  const p={duration,states};cache.set(key,p);while(cache.size>8)cache.delete(cache.keys().next().value);return p;
 }
 function sample(g,now){const p=planFor(g),t=C.clamp(now-g.startedAt,0,p.duration),i=Math.min(Math.floor(t*HZ),p.states.length-1),u=t*HZ-i,a=p.states[i],b=p.states[Math.min(i+1,p.states.length-1)],chain=a.map((q,j)=>({x:q.x+(b[j].x-q.x)*u,y:q.y+(b[j].y-q.y)*u}));chain[0]=headAt(g,g.startedAt+t);return C.solveSpineConstraints(chain,{spacing:18,maxBendRadians:.68});}
 function damageMultiplier(g,now,part,hit={}){return !g||phase(g,now)!=='coil-guard'||part==='horn'||hit.yank||hit.lanceBurst?1:.55;}
 function receiveHit(old,{now,amount,part,heavy=false,yank=false,lanceBurst=false,attacker=null}){
  const g=old.guard45;if(!g||!(amount>0)||phase(g,now)==='done')return {state:old,result:'none'};
  if(phase(g,now)!=='coil-guard')return {state:old,result:'none'};
  if(g.hitAt!==undefined)return {state:old,result:'already-triggered'};
  const holdEnd=g.startedAt+g.windup+g.hold,extra=Math.max(0,now+.15-holdEnd);
  const counterTarget46=attacker&&Number.isFinite(attacker.x)&&Number.isFinite(attacker.y)?copy(attacker):null;
  return {state:{...old,guard45:{...g,hold:g.hold+extra,hitAt:now,counterUntil:now+.15,counterTarget46}},result:'armed'};
 }
 function choose(state,o){
  if(o.headBroken)return null;
  return o.variant.id==='marsh'?'constrict_pulse':o.variant.id==='ancient'&&!o.tailBroken?'tail_reap':'bite';
 }
 function guardDecision(state,o,g){state.mode=phase(g,o.now);state.lastReason=g.hitAt!==undefined?'confirmed guarded hit: prepare counter':'visible defensive coil';state.lastAction='guard';return {state,intent:{kind:'move',mode:state.mode,guard45:g,target:headAt(g,o.now),reason:state.lastReason},ranked:[]};}
 const decide0=B.decide,commit0=B.committed,cancel0=H.cancel,cancelMove0=R.cancelMovement;
 B.decide=function(previous,o){let state={...(previous||B.createState())},g=state.guard45;
  if(o.busy)return decide0(state,o);
  if(g){
   if(o.headBroken){state.guard45=null;state.guardRecoverUntil45=o.now+.5;state.nextAttackAt=Math.max(state.nextAttackAt,o.now+.5);g=null;}
   else if(phase(g,o.now)==='done'){state.guard45=null;g=null;}
   else {
    if(g.hitAt!==undefined&&o.now>=g.hitAt&&o.now<=g.counterUntil&&phase(g,o.now)==='coil-guard'){
     const id=choose(state,o);if(id){state.mode='coil-counter';state.lastReason='guarded hit -> immediate fang';return {state,intent:{kind:'attack',id,pursuit:true,guardCounter45:true,target:copy(g.counterTarget46||o.player),mode:'coil-counter',reason:state.lastReason},ranked:[]};}
    }return guardDecision(state,o,g);
   }
  }
  if(o.now<(state.guardRecoverUntil45||0)){state.mode='coil-broken';return {state,intent:{kind:'move',mode:state.mode,target:copy(o.head),speedFactor:0,reason:'broken coil opening'},ranked:[]};}
  const d=decide0(state,o),p=d.state.pursuit,it=d.intent,threat=o.threat,visible=threat?.winding&&threat.age>=.12&&!threat.shot&&C.dist(o.head,o.player)<=(threat.range||0)+35&&Math.abs(C.wrapAngle(Math.atan2(o.head.y-o.player.y,o.head.x-o.player.x)-threat.facing))<=(threat.arc||0)+.35;
  const pressure=(o.guardPressure45||0)>=2,ready=o.now>=(d.state.nextGuardAt45??5.5)&&o.now>=(previous?.nextAttackAt||0),special=it.riposte43||it.finishV40||it.kind==='attack'&&(it.id===o.reactive||it.id===o.escapeFollowup);
  if(!ready||special||o.headBroken||previous?.evade42||d.state.riposte43&&!it.evade42||!p?.active||p.strikes>=2||o.now<(p.restUntil||0)||C.dist(o.head,o.player)>185||!(pressure||visible&&threat.heavy))return d;
  const planned=prepare(o);if(!planned)return d;
  state={...d.state,guard45:planned,nextGuardAt45:o.now+12,evade42:null,riposte43:null,nextEvadeAt42:previous?.nextEvadeAt42,nextAttackAt:o.now+planned.windup+.12,pursuit:{...p,until:p.until+planned.windup+planned.hold+planned.recovery}};
  return guardDecision(state,o,planned);
 };
 B.committed=function(old,id,now){return {...commit0(old,id,now),guard45:null};};
 H.cancel=function(old,now,variant){return {...cancel0(old,now,variant),guard45:null};};
 R.cancelMovement=function(old,now){const state=cancelMove0(old);return {...state,guard45:null,nextAttackAt:old.guard45?Math.max(state.nextAttackAt,(Number.isFinite(now)?now:old.guard45.startedAt)+.70):state.nextAttackAt};};
 const profiles={marsh:{style:'coil-close',active:.38,recovery:.78,reach:80},dusk:{style:'snap-retreat',active:.18,recovery:.62,reach:155},ancient:{style:'rear-rebuff',active:.38,recovery:.88,reach:60}};
 function prepareCounter(a,variant,base,target){
  const p=profiles[variant],start=Math.atan2(base[0].y-base[1].y,base[0].x-base[1].x),toward=Math.atan2(target.y-base[0].y,target.x-base[0].x),side=C.wrapAngle(toward-start)<0?-1:1,tailAngle=Math.atan2(base[26].y-base[14].y,base[26].x-base[14].x),tailTarget=Math.atan2(target.y-base[14].y,target.x-base[14].x);
  return {...a,coilCounter46:true,guardCounter45:true,counterStyle47:variant==='ancient'&&a.id==='bite'?'braced-fang':p.style,counterSide47:side,tailSide47:C.wrapAngle(tailTarget-tailAngle)<0?-1:1,windup:0,active:p.active,recovery:p.recovery,motionVariant:variant,motionHeadV39:true,motionStartHeading:start,coilReach46:C.clamp(C.dist(base[0],target)-20,25,p.reach)};
 }
 function counterHead(base,a,t,aim){
  const u=smooth(t/a.active),v=smooth((t-a.active)/a.recovery),side=a.counterSide47;let x=a.coilReach46*u,y=0;
  if(a.counterStyle47==='rear-rebuff')return copy(base[0]);
  if(t<=a.active){if(a.counterStyle47==='coil-close')y=side*36*Math.sin(Math.PI*u);}
  else if(a.counterStyle47==='snap-retreat'){x=a.coilReach46+20*Math.sin(Math.PI*v)-70*v;y=side*65*v;}
  else x=a.coilReach46-12*v;
  return {x:base[0].x+Math.cos(aim)*x-Math.sin(aim)*y,y:base[0].y+Math.sin(aim)*x+Math.cos(aim)*y};
 }
 function rearPose(base,a,t){
  const envelope=t<=a.active?smooth(t/a.active):1-smooth((t-a.active)/a.recovery),out=base.slice(0,15).map(copy);let prior=Math.atan2(base[14].y-base[13].y,base[14].x-base[13].x);
  for(let i=15;i<base.length;i++){const angle=Math.atan2(base[i].y-base[i-1].y,base[i].x-base[i-1].x),wanted=angle+a.tailSide47*.80*envelope*smooth((i-14)/12),th=prior+C.clamp(C.wrapAngle(wanted-prior),-.68,.68);out.push({x:out[i-1].x+18*Math.cos(th),y:out[i-1].y+18*Math.sin(th)});prior=th;}return out;
 }
 const counterCache=new Map();
 function counterPlan(base,a,aim){const key=JSON.stringify([base,aim,a.motionVariant,a.counterStyle47,a.counterSide47,a.coilReach46,a.active,a.recovery]);if(counterCache.has(key))return counterCache.get(key);
  const states=[L.create(base,{variant:a.motionVariant,spacing:18,maxBendRadians:.68})],duration=A.duration(a);
  for(let i=1;i<=Math.ceil(duration*HZ);i++)states.push(L.advance(states.at(-1),{head:counterHead(base,a,Math.min(duration,i/HZ),aim),dt:1/HZ,speed:0}));
  const p={states,duration};counterCache.set(key,p);while(counterCache.size>8)counterCache.delete(counterCache.keys().next().value);return p;
 }
 const angle0=M.headAngle;
 M.headAngle=function(chain,a,t,aim){if(!a.coilCounter46)return angle0(chain,a,t,aim);const start=a.motionStartHeading;if(a.counterStyle47==='rear-rebuff')return start;const turn=smooth(t/(a.motionVariant==='dusk'?.07:.10)),strike=start+C.wrapAngle(aim-start)*turn,bone=Math.atan2(chain[0].y-chain[1].y,chain[0].x-chain[1].x);return t<=a.active?strike:strike+C.wrapAngle(bone-strike)*smooth((t-a.active)/a.recovery);};
 function geometry(id,chain,aim,t,a){if(!A.isActive(A.phaseAt(a,t)))return null;
  if(a.counterStyle47==='coil-close')return {kind:'capsules',points:chain.slice(3,23).map(copy),radius:13};
  if(a.counterStyle47==='rear-rebuff')return {kind:'capsules',points:chain.slice(14).map(copy),radius:16};
  const h=chain[0],angle=M.headAngle(chain,a,t,aim);return {kind:'capsule',a:copy(h),b:{x:h.x+Math.cos(angle)*30,y:h.y+Math.sin(angle)*30},radius:19};
 }
 const geometry0=C.attackCollisionGeometry,sample0=A.samplePose,swept0=C.sweptAttackContact;
 C.attackCollisionGeometry=function(id,ch,aim,t,a,z){return a?.coilCounter46?geometry(id,ch,aim,t,a):geometry0(id,ch,aim,t,a,z);};
 A.samplePose=function(base,a,t,o={}){if(!a.coilCounter46)return sample0(base,a,t,o);let chain;if(a.counterStyle47==='rear-rebuff')chain=rearPose(base,a,t);else{const p=counterPlan(base,a,o.aim||0),time=C.clamp(t,0,p.duration),i=Math.min(Math.floor(time*HZ),p.states.length-1);chain=L.advance(p.states[i],{head:counterHead(base,a,time,o.aim||0),dt:1/HZ,speed:0}).chain.map(copy);}const stage=A.phaseAt(a,t),active=A.isActive(stage);return {chain,stage,active,rootTravel:0,zone:null,hitbox:active?geometry(a.id,chain,o.aim||0,t,a):null,telegraph:null};};
 C.sweptAttackContact=function(id,oldCh,newCh,oldP,newP,aim,oldT,newT,a,z,rr=11){
  if(!a?.coilCounter46)return swept0(id,oldCh,newCh,oldP,newP,aim,oldT,newT,a,z,rr);
  if(newT<oldT)return {hit:false,samples:0};let motion=C.dist(oldP,newP);for(let j=0;j<oldCh.length;j++)motion=Math.max(motion,C.dist(oldCh[j],newCh[j]));const count=Math.min(96,Math.max(2,Math.ceil(motion/3),Math.ceil((newT-oldT)/.006)));
  for(let i=0;i<=count;i++){const u=i/count,t=oldT+(newT-oldT)*u,ch=oldCh.map((p,j)=>({x:p.x+(newCh[j].x-p.x)*u,y:p.y+(newCh[j].y-p.y)*u})),point={x:oldP.x+(newP.x-oldP.x)*u,y:oldP.y+(newP.y-oldP.y)*u},shape=geometry(id,ch,aim,t,a);if(C.attackShapeContains(shape,point,rr))return {hit:true,point,time:t,kind:shape.kind,samples:i+1};}return {hit:false,samples:count+1};
 };
 const scores0=B.attackScores;
 function preference(id,o){
  if(id===o.reactive||id===o.escapeFollowup||id===o.comboNext)return 0;
  const d=C.dist(o.head,o.player),v=o.observedVelocity||{x:0,y:0},speed=Math.hypot(v.x,v.y),facing=Math.abs(C.wrapAngle(Math.atan2(o.player.y-o.head.y,o.player.x-o.head.x)-o.heading)),nearTail=(o.spine||[]).slice(14).some(p=>C.dist(p,o.player)<90);
  if(o.variant.id==='marsh'&&d<=165&&speed<100&&['half_coil','constrict_pulse','coil_trap'].includes(id))return 4.5;
  if(o.variant.id==='dusk'&&speed>80&&['lunge','side_fang','double_fang'].includes(id))return 4;
  if(o.variant.id==='ancient'&&nearTail&&facing>.9&&['tail_reap','tail_hook','tail_sweep'].includes(id))return 5;
  if(o.variant.id==='ancient'&&d<110&&id==='body_slam')return 3;
  return 0;
 }
 B.attackScores=function(o,state){return scores0(o,state).map(q=>({...q,score:q.score+preference(q.id,o),reason:q.reason+'+species-context'})).sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id));};
 const speciesDecide0=B.decide;
 B.decide=function(previous,o){
  const d=speciesDecide0(previous,o),it=d.intent,state=d.state,p=state.pursuit;
  if(o.variant.id!=='marsh'||!Number.isFinite(state.lastWrapAt40)||o.busy||o.headBroken||!p?.active||p.strikes>=2||o.now<(p.restUntil||0)||o.now<state.nextAttackAt||o.now-p.startedAt<.60||o.now<(state.nextSpeciesMove47||0))return d;
  if(it.guard45||it.guardCounter45||it.evade42||it.riposte43||it.reapproachV40||it.finishV40||it.huntRead44||state.riposte43||o.comboNext||it.id===o.reactive||it.id===o.escapeFollowup)return d;
  const distance=C.dist(o.head,o.player),speed=Math.hypot(o.observedVelocity?.x||0,o.observedVelocity?.y||0);
  if(distance<90||distance>165||speed>=65||!B.attackLegal('constrict_pulse',o,state).ok)return d;
  return {...d,state:{...state,nextSpeciesMove47:o.now+10,mode:'marsh-route-close',lastAction:'attack',lastReason:'stationary close prey: close its route'},intent:{kind:'attack',id:'constrict_pulse',pursuit:true,target:H.attackTarget(o,'constrict_pulse'),speciesMove47:'marsh-route-close',mode:'marsh-route-close',reason:'close a nearby stationary target route'}};
 };
 root.NakaGuardV47=root.NakaGuardV46=root.NakaGuardV45={version:'4.7.0',profiles,prepare,phase,headAt,sample,damageMultiplier,receiveHit,choose,prepareCounter,geometry,counterHead,rearPose,preference,cacheSize:()=>cache.size,counterCacheSize:()=>counterCache.size};
})(typeof globalThis!=='undefined'?globalThis:this);
