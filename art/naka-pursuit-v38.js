/* Naka 3.8: short pursuit bursts, observed-motion interception, two attack commits,
   then an enforced opening. Attack aims still lock before windup; no damage changes. */
(function(root){'use strict';
 const B=root.NakaBehaviorV27,C=root.NakaCore,A=root.NakaAnimationV26,L=root.NakaLocomotionV29;
 if(!B||!root.NakaWrapV37)throw Error('Pursuit 3.8 requires Naka 3.7');
 const profiles={marsh:{speed:246,accel:540,brake:580,turn:3.9,burst:4.2,rest:1.05,cooldown:4.8},dusk:{speed:282,accel:620,brake:660,turn:4.6,burst:4.0,rest:.95,cooldown:4.4},ancient:{speed:222,accel:460,brake:560,turn:3.15,burst:4.4,rest:1.3,cooldown:5.2}};
 const fast={bite:[.26,.13,.26],side_fang:[.29,.14,.29],lunge:[.38,.19,.34],double_fang:[.30,.13,.32],tail_sweep:[.36,.22,.32],tail_hook:[.39,.23,.35]};
 const decide0=B.decide,committed0=B.committed,recovered0=B.recovered,create0=B.createState;
 const fresh=()=>({active:false,startedAt:0,until:0,restUntil:0,nextAt:1.2,strikes:0});
 B.createState=function(seed){return {...create0(seed),pursuit:fresh()};};
 function prepare(a,variant){if(!fast[a.id])return a;const q=fast[a.id],mul=variant==='ancient'?1.15:variant==='dusk'?.92:1;
  const spec={...a,windup:Math.max(.24,q[0]*mul),active:q[1],recovery:q[2]*mul,pursuitV38:true,pursuitHead:B.ATTACK_FAMILY[a.id]==='head',pursuitVariant:variant};
  if(a.id==='double_fang')Object.assign(spec,{escapeWindow:.18,secondWindup:Math.max(.24,.26*mul),secondActive:.13});
  return spec;
 }
 function bounded(p,o){const a=o.arena||{width:960,height:620};let q={x:C.clamp(p.x,45,a.width-45),y:C.clamp(p.y,45,a.height-45)};
  if(Number.isFinite(a.radius)&&Number.isFinite(a.centerX)&&Number.isFinite(a.centerY)){const dx=q.x-a.centerX,dy=q.y-a.centerY,d=Math.hypot(dx,dy);if(d>a.radius)q={x:a.centerX+dx/d*a.radius,y:a.centerY+dy/d*a.radius};}return q;
 }
 function intercept(o,state){const v=o.observedVelocity||{x:0,y:0},length=Math.hypot(v.x,v.y),factor=length>220?220/length:1;
  const leadTime=.32,lead={x:v.x*factor*leadTime,y:v.y*factor*leadTime},h=o.head,p=o.player,d=C.dist(h,p),ux=d?(p.x-h.x)/d:1,uy=d?(p.y-h.y)/d:0;
  const facing=Math.abs(C.wrapAngle(Math.atan2(p.y-h.y,p.x-h.x)-(o.heading||0)));
  if(d<115&&facing>1.1)return bounded(p,o);
  const cut=d>160?22*state.circleSide:0;
  return bounded({x:p.x+lead.x-ux*44-uy*cut,y:p.y+lead.y-uy*44+ux*cut},o);
 }
 function attackTarget(o,id){const v=o.observedVelocity||{x:0,y:0},speed=Math.hypot(v.x,v.y),scale=speed>220?220/speed:1;
  const lead=id==='lunge'?.20:.12;
  return bounded({x:o.player.x+v.x*scale*lead,y:o.player.y+v.y*scale*lead},o);
 }
 function rest(state,o,p){const d=C.dist(o.head,o.player),ux=d?(o.head.x-o.player.x)/d:1,uy=d?(o.head.y-o.player.y)/d:0;
  state.mode='pursuit-rest';state.nextAttackAt=Math.max(state.nextAttackAt,p.restUntil);
  return {state,intent:{kind:'move',mode:'pursuit-rest',target:bounded({x:o.head.x+ux*36,y:o.head.y+uy*36},o),speedFactor:.12,reason:'pursuit exhausted: guaranteed counter opening'},ranked:[]};
 }
 B.decide=function(previous,o){
  let state={...(previous||B.createState()),pursuit:{...(previous?.pursuit||fresh())},history:[...(previous?.history||[])]};
  const p=state.pursuit,profile=profiles[o.variant.id],d=C.dist(o.head,o.player);
  if(o.busy)return decide0(state,o);
  if(p.active&&(o.now>=p.until||p.strikes>=2||o.headBroken)){
   p.active=false;p.restUntil=o.now+profile.rest;p.nextAt=p.restUntil+profile.cooldown;
  }
  if(o.now<p.restUntil)return rest(state,o,p);
  if(!p.active&&o.now>=p.nextAt&&o.now>=state.nextAttackAt&&d>=105&&d<=420&&!o.headBroken){
   Object.assign(p,{active:true,startedAt:o.now,until:o.now+profile.burst,strikes:0});state.setupUntil=0;
  }
  if(!p.active)return decide0(state,o);
  const heading=Math.atan2(o.player.y-o.head.y,o.player.x-o.head.x),facing=Math.abs(C.wrapAngle(heading-(o.heading||0)));
  const reach={lunge:180,bite:78,side_fang:90,double_fang:82,tail_sweep:150,tail_hook:150};
  const tailNear=o.spine&&o.spine.slice(18).some(q=>C.dist(q,o.player)<110);
  const ranked=B.attackScores(o,state).filter(q=>fast[q.id]&&d<=reach[q.id]&&(B.ATTACK_FAMILY[q.id]!=='tail'||p.strikes>0&&tailNear));
  ranked.sort((a,b)=>{
   const score=q=>q.score+(q.id==='lunge'&&d>=120?5:0)+(q.id==='double_fang'&&p.strikes>0?3:0)+(q.family==='tail'&&facing>1.2?7:0);
   return score(b)-score(a)||a.id.localeCompare(b.id);
  });
  if(o.now-p.startedAt>=.32&&o.now>=state.nextAttackAt&&ranked.length&&(facing<.8||ranked[0].family==='tail')){
   const best=ranked[0];state.mode='pursuit-strike';state.lastReason='pursuit commit '+best.id;state.lastAction='attack';state.lastScores=ranked.slice(0,6);state.decisionCount++;
   return {state,intent:{kind:'attack',id:best.id,pursuit:true,target:attackTarget(o,best.id),mode:'pursuit-strike',reason:state.lastReason},ranked};
  }
  const target=intercept(o,state);state.mode='pursuit';state.lastAction='move';state.lastTarget=target;state.lastReason='cut off observed retreat';
  return {state,intent:{kind:'move',mode:'pursuit',pursuit:true,target,speedFactor:1.3,reason:state.lastReason},ranked};
 };
 B.committed=function(old,id,now){const state=committed0(old,id,now),p={...(old.pursuit||fresh())};if(p.active)p.strikes++;return {...state,pursuit:p};};
 B.recovered=function(old,now,variant){const state=recovered0(old,now,variant),p={...(old.pursuit||fresh())},profile=profiles[variant];
  if(p.active){if(p.strikes>=2||now>=p.until){p.active=false;p.restUntil=now+profile.rest;p.nextAt=p.restUntil+profile.cooldown;state.nextAttackAt=p.restUntil;state.mode='pursuit-rest';}
   else {state.nextAttackAt=now+.12;state.setupUntil=0;state.mode='pursuit';}}
  return {...state,pursuit:p};
 };
 function cancel(old,now,variant){const profile=profiles[variant],p={...(old.pursuit||fresh()),active:false,restUntil:now+profile.rest,nextAt:now+profile.rest+profile.cooldown};return {...old,pursuit:p,nextAttackAt:Math.max(old.nextAttackAt,p.restUntil)};}
 // Sequential world-space head pulls avoid the old FABRIK solver changing branches
 // on a nearly straight neck. Both manual forecasts and live frames use this cache.
 const pose0=A.samplePose,poseCache=new Map(),HZ=240,copy=p=>({x:p.x,y:p.y});
 const smooth=x=>{x=C.clamp(x,0,1);return x*x*(3-2*x);};
 function headAt(base,a,t,aim,target){
  const timeline=A.timeline(a),recovery=timeline.find(b=>b.phase==='recovery');let local=t;
  if(recovery&&t>=recovery.start)local=timeline.filter(b=>A.isActive(b.phase)).at(-1).end-1e-7;
  const drive=root.NakaAttackV34.headDrive(a,local),name=drive.beat.st.phase;
  const reach=a.id==='lunge'?C.clamp(C.dist(base[0],target)-28,70,170):a.id==='side_fang'?34:a.id==='double_fang'?28:26;
  const second=name.startsWith('second-')||a.id==='double_fang'&&name==='recovery',extension=reach*(second?.9:1);
  const x=extension*drive.extension-12*drive.load,y=(a.id==='side_fang'?8:3)*drive.load;
  return {x:base[0].x+Math.cos(aim)*x-Math.sin(aim)*y,y:base[0].y+Math.sin(aim)*x+Math.cos(aim)*y};
 }
 function posePlan(base,a,aim,target){const id=JSON.stringify([base,a.id,a.windup,a.active,a.recovery,a.escapeWindow,a.secondWindup,a.secondActive,a.pursuitVariant,aim,target]);
  if(poseCache.has(id)){const p=poseCache.get(id);poseCache.delete(id);poseCache.set(id,p);return p;}
  const states=[L.create(base,{variant:a.pursuitVariant||'marsh',spacing:18,maxBendRadians:.68})],duration=A.duration(a);
  for(let i=1;i<=Math.ceil(duration*HZ);i++)states.push(L.advance(states.at(-1),{head:headAt(base,a,Math.min(duration,i/HZ),aim,target),dt:1/HZ,speed:0}));
  const plan={states,duration};poseCache.set(id,plan);while(poseCache.size>8)poseCache.delete(poseCache.keys().next().value);return plan;
 }
 A.samplePose=function(base,a,t,o={}){
  if(!a.pursuitV38||!a.pursuitHead)return pose0(base,a,t,o);
  const aim=o.aim||0,target=o.center||base[0],plan=posePlan(base,a,aim,target),time=C.clamp(t,0,plan.duration),i=Math.min(Math.floor(time*HZ),plan.states.length-1);
  const state=plan.states[i],chain=L.advance(state,{head:headAt(base,a,time,aim,target),dt:1/HZ,speed:0}).chain.map(copy),stage=A.phaseAt(a,t),active=A.isActive(stage);
  return {chain,stage,active,rootTravel:0,zone:null,hitbox:active?C.attackCollisionGeometry(a.id,chain,aim,t,a,null):null,telegraph:{committed:true,stage,warning:stage.includes('windup'),aim,center:copy(target)}};
 };
 root.NakaPursuitV38={version:'3.8.0',profiles,prepare,intercept,attackTarget,cancel,poseCacheSize:()=>poseCache.size};
})(typeof globalThis!=='undefined'?globalThis:this);
