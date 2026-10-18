/* Naka 3.9: continuous head-led poses for ordinary strikes and dive attacks.
   Fixed world-space bones; one cached trajectory for live frames and forecasts.
   The head pivots independently of the first neck bone, then blends back on recovery. */
(function(root){'use strict';
 const C=root.NakaCore,A=root.NakaAnimationV26,L=root.NakaLocomotionV29,old=A.samplePose;
 if(!root.NakaPursuitV38)throw Error('Motion 3.9 requires pursuit 3.8');
 const HEAD=new Set(['bite','side_fang','double_fang','lunge','marsh_dive','shadow_breach','head_tail_combo']);
 const cache=new Map(),HZ=240,copy=p=>({x:p.x,y:p.y});
 const smooth=x=>{x=C.clamp(x,0,1);return x*x*(3-2*x);};
 function prepare(a,variant,base){return HEAD.has(a.id)?{...a,motionHeadV39:true,motionVariant:variant,motionStartHeading:Math.atan2(base[0].y-base[1].y,base[0].x-base[1].x)}:a;}
 function headAt(base,a,t,aim,target){
  const timeline=A.timeline(a),rec=timeline.find(b=>b.phase==='recovery');let local=t;
  if(a.id!=='head_tail_combo'&&rec&&t>=rec.start)local=timeline.filter(b=>A.isActive(b.phase)).at(-1).end-1e-7;
  const d=root.NakaAttackV34.headDrive(a,local),stage=d.beat.st.phase,dist=C.dist(base[0],target);
  const reach=a.id==='shadow_breach'?Math.min(250,dist):a.id==='marsh_dive'?C.clamp(dist-28,70,190):a.id==='lunge'?C.clamp(dist-28,70,170):a.id==='side_fang'?34:a.id==='double_fang'?28:a.id==='head_tail_combo'?30:26;
  const r=reach*(stage.startsWith('second-')?.9:1),forward=r*d.extension-12*d.load,lateral=(a.id==='side_fang'?8:3)*d.load;
  return {x:base[0].x+Math.cos(aim)*forward-Math.sin(aim)*lateral,y:base[0].y+Math.sin(aim)*forward+Math.cos(aim)*lateral};
 }
 function planFor(base,a,aim,target){
  const id=JSON.stringify([base,a.id,a.windup,a.active,a.recovery,a.escapeWindow,a.secondWindup,a.secondActive,a.motionVariant,aim,target]);
  if(cache.has(id)){const p=cache.get(id);cache.delete(id);cache.set(id,p);return p;}
  const states=[L.create(base,{variant:a.motionVariant||a.pursuitVariant||'marsh',spacing:18,maxBendRadians:.68})],duration=A.duration(a);
  for(let i=1;i<=Math.ceil(duration*HZ);i++)states.push(L.advance(states.at(-1),{head:headAt(base,a,Math.min(duration,i/HZ),aim,target),dt:1/HZ,speed:0}));
  const plan={states,duration};cache.set(id,plan);while(cache.size>12)cache.delete(cache.keys().next().value);return plan;
 }
 function headAngle(chain,a,t,aim){
  const bone=Math.atan2(chain[0].y-chain[1].y,chain[0].x-chain[1].x),timeline=A.timeline(a),rec=timeline.find(b=>b.phase==='recovery');
  if(t<a.windup){const start=a.motionStartHeading??bone;return start+C.wrapAngle(aim-start)*smooth(t/Math.max(.01,a.windup));}
  let weight=smooth(t/Math.max(.01,a.windup));
  if(a.id==='head_tail_combo'){
   const gap=timeline.find(b=>b.phase==='escape-window');
   if(gap&&t>=gap.start)weight=1-smooth((t-gap.start)/gap.duration);
  }else if(rec&&t>=rec.start)weight=1-smooth((t-rec.start)/rec.duration);
  return bone+C.wrapAngle(aim-bone)*weight;
 }
 A.samplePose=function(base,a,t,o={}){
  if(!a.motionHeadV39)return old(base,a,t,o);
  const aim=o.aim||0,target=o.center||base[0],plan=planFor(base,a,aim,target),time=C.clamp(t,0,plan.duration),i=Math.min(Math.floor(time*HZ),plan.states.length-1);
  let chain=L.advance(plan.states[i],{head:headAt(base,a,time,aim,target),dt:1/HZ,speed:0}).chain.map(copy);
  if(a.id==='head_tail_combo')chain=C.solveSpineConstraints(root.NakaAttackV34.tail(chain,a,t,o.side||1,o.constraints||{spacing:18,maxBendRadians:.68}),{spacing:18,maxBendRadians:.68});
  const stage=A.phaseAt(a,t),active=A.isActive(stage),zone=o.zone||C.pressureZone(a.id,base[0],target);
  return {chain,stage,active,rootTravel:0,zone,hitbox:active?C.attackCollisionGeometry(a.id,chain,aim,t,a,zone):null,telegraph:{committed:true,stage,warning:stage.includes('windup'),aim,center:copy(target)}};
 };
 root.NakaMotionV39={version:'3.9.0',HEAD,prepare,headAt,headAngle,planFor,cacheSize:()=>cache.size};
})(typeof globalThis!=='undefined'?globalThis:this);
