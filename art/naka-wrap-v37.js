/* Naka 3.7: player wrap is a committed head route + grounded body following.
   No whole-body morph, no mid-attack retarget, no damage authority in warnings.
   Arc-length pose cache is bounded; rendering, preview and live collision share it. */
(function(root){'use strict';
 const C=root.NakaCore,L=root.NakaLocomotionV29,A=root.NakaAnimationV26;
 if(!C||!root.NakaGroundV35)throw Error('Player wrap 3.7 requires ground 3.5');
 const copy=p=>({x:p.x,y:p.y}),clamp=C.clamp,wrap=C.wrapAngle;
 const smooth=u=>{u=clamp(u,0,1);return u*u*(3-2*u);};
 const PROFILES={marsh:{speed:152,radius:39},dusk:{speed:175,radius:37},ancient:{speed:128,radius:46}};
 const cache=new Map();
 function bezier(a,b,c,d,u){const v=1-u;return {x:v*v*v*a.x+3*v*v*u*b.x+3*v*u*u*c.x+u*u*u*d.x,y:v*v*v*a.y+3*v*v*u*b.y+3*v*u*u*c.y+u*u*u*d.y};}
 function addCurve(out,a,b,c,d,count=80){for(let i=1;i<=count;i++)out.push(bezier(a,b,c,d,i/count));}
 function route(base,target,heading,variant,side,entryAngle=.65){
  const h=base[0],profile=PROFILES[variant]||PROFILES.marsh,radius=profile.radius;
  const safe=root.NakaReapproachV40?.entryFor(base,target,heading,radius+12,side);
  const bearing=Math.atan2(h.y-target.y,h.x-target.x),start=safe?safe.start:bearing+side*entryAngle,sweep=5.55;
  const at=(a,r=radius)=>({x:target.x+Math.cos(a)*r,y:target.y+Math.sin(a)*r});
  const p=at(start,radius+12),tangent=start+side*Math.PI/2+side*Math.atan(12/(sweep*(radius+12))),join=clamp(C.dist(h,p)*.52,22,72);
  const out=safe?safe.points:[copy(h)];
  if(!safe)addCurve(out,h,{x:h.x+Math.cos(heading)*join,y:h.y+Math.sin(heading)*join},{x:p.x-Math.cos(tangent)*join,y:p.y-Math.sin(tangent)*join},p);
  for(let i=1;i<=240;i++)out.push(at(start+side*sweep*i/240,radius+12*(1-smooth(i/240))));
  const holdIndex=out.length-1;
  for(let i=1;i<=32;i++)out.push(at(start+side*(sweep+.38*i/32)));
  const squeezeIndex=out.length-1,endAngle=start+side*(sweep+.38),end=out[squeezeIndex],exitHeading=endAngle+side*Math.PI/2;
  const exit={x:end.x+Math.cos(exitHeading)*180+Math.cos(endAngle)*70,y:end.y+Math.sin(exitHeading)*180+Math.sin(endAngle)*70};
  addCurve(out,end,{x:end.x+Math.cos(exitHeading)*52,y:end.y+Math.sin(exitHeading)*52},{x:exit.x-Math.cos(exitHeading)*60,y:exit.y-Math.sin(exitHeading)*60},exit,80);
  const lengths=[0];for(let i=1;i<out.length;i++)lengths.push(lengths[i-1]+C.dist(out[i],out[i-1]));
  return {points:out,lengths,holdDistance:lengths[holdIndex],squeezeDistance:lengths[squeezeIndex],length:lengths.at(-1),radius,side,variant,safeEntry:!!safe};
 }
 function pointAt(plan,distance){distance=clamp(distance,0,plan.length);let lo=0,hi=plan.lengths.length-1;
  while(lo+1<hi){const mid=(lo+hi)>>1;if(plan.lengths[mid]<distance)lo=mid;else hi=mid;}
  const a=plan.points[lo],b=plan.points[hi],span=plan.lengths[hi]-plan.lengths[lo],u=span?(distance-plan.lengths[lo])/span:0;
  return {x:a.x+(b.x-a.x)*u,y:a.y+(b.y-a.y)*u};
 }
 function pathScore(plan,base){let cost=0;
  // Prefer the side whose head route stays clear of the braced posterior.
  for(let i=2;i<plan.points.length-55;i+=5)for(let j=9;j<base.length;j+=2){const d=C.dist(plan.points[i],base[j]);if(d<30)cost+=(30-d)*(30-d);}
  const first=plan.points[1],last=base[1];if(C.dist(first,last)<16)cost+=500;
  // Avoid a tight entry hook that would make the constrained neck snap outward.
  for(let i=1;i<plan.points.length-1;i++){
   const a=plan.points[i-1],b=plan.points[i],c=plan.points[i+1],span=(C.dist(a,b)+C.dist(b,c))*.5;
   const turn=Math.abs(wrap(Math.atan2(c.y-b.y,c.x-b.x)-Math.atan2(b.y-a.y,b.x-a.x)));
   const curvature=turn/Math.max(.01,span);cost+=Math.pow(Math.max(0,curvature-1/(plan.safeEntry?32:38)),2)*span*2e6;
  }
  cost+=plan.holdDistance*.02;
  return cost;
 }
 function key(base,target,heading,variant){return variant+'|'+heading+'|'+target.x+','+target.y+'|'+base.map(p=>p.x+','+p.y).join(';');}
 function planFor(base,target,heading,variant='marsh'){
  const id=key(base,target,heading,variant);if(cache.has(id)){const p=cache.get(id);cache.delete(id);cache.set(id,p);return p;}
  let plan=null,best=Infinity;
  for(const side of [1,-1])for(const entry of root.NakaReapproachV40?[.65]:[.42,.65,.9]){const candidate=route(base,target,heading,variant,side,entry),score=pathScore(candidate,base);if(score<best){best=score;plan=candidate;}}
  plan.base=base.map(copy);plan.trail=base.slice().reverse().map(copy).concat(plan.points.slice(1));
  plan.trailLengths=[0];for(let i=1;i<plan.trail.length;i++)plan.trailLengths.push(plan.trailLengths[i-1]+C.dist(plan.trail[i],plan.trail[i-1]));
  plan.baseLength=C.chainLength(base);
  plan.windup=.24+plan.holdDistance/(PROFILES[variant]||PROFILES.marsh).speed*1.5;
  plan.recovery=Math.max(1.15,(plan.length-plan.squeezeDistance)/(PROFILES[variant]||PROFILES.marsh).speed*1.5);
  cache.set(id,plan);while(cache.size>8)cache.delete(cache.keys().next().value);
  return plan;
 }
 function prepare(base,a,target,heading,variant='marsh'){
  if(a.id!=='half_coil')return a;
  const plan=planFor(base,target,heading,variant);
  return {...a,windup:Math.max(a.windup,plan.windup),active:.78,recovery:plan.recovery,wrapConstrict37:true,wrapTarget:copy(target),wrapRadius:plan.radius,halfCoilVariant:variant};
 }
 function poseAtDistance(plan,d){d=clamp(d,0,plan.length);if(d<1e-9)return plan.base.map(copy);
  // Each joint walks back along the actual head trail by one rigid bone.
  // Circle/segment intersections preserve length without cutting across the coil.
  const trail=plan.trail,out=[pointAt(plan,d)];let index=1;
  while(index<plan.trailLengths.length-1&&plan.trailLengths[index]<plan.baseLength+d)index++;
  let cursor=copy(out[0]);
  for(let bone=1;bone<plan.base.length;bone++){
   const center=out[bone-1];let found=null;
   while(index>0){const end=trail[index-1];
    if(C.dist(center,end)>=18-1e-9){const vx=end.x-cursor.x,vy=end.y-cursor.y,dx=cursor.x-center.x,dy=cursor.y-center.y;
     const aa=vx*vx+vy*vy,bb=2*(dx*vx+dy*vy),cc=dx*dx+dy*dy-324;
     const u=aa>1e-14?clamp((-bb+Math.sqrt(Math.max(0,bb*bb-4*aa*cc)))/(2*aa),0,1):0;
     found={x:cursor.x+vx*u,y:cursor.y+vy*u};cursor=found;break;
    }cursor=copy(end);index--;
   }
   if(!found){const a=trail[0],b=trail[1],angle=Math.atan2(a.y-b.y,a.x-b.x);found={x:center.x+Math.cos(angle)*18,y:center.y+Math.sin(angle)*18};}
   out.push(found);
  }
  return C.solveSpineConstraints(out,{spacing:18,maxBendRadians:.68});
 }
 const prior=A.samplePose;
 A.samplePose=function(base,a,t,o={}){
  if(a.id!=='half_coil')return prior(base,a,t,o);
  const heading=o.aim||0,target=o.center||base[0],plan=planFor(base,target,heading,a.halfCoilVariant||'marsh');
  const stage=A.phaseAt(a,t),active=A.isActive(stage);let distance=0;
  if(t<a.windup)distance=plan.holdDistance*smooth((t-.24)/Math.max(.01,a.windup-.24));
  else if(t<a.windup+a.active)distance=plan.holdDistance+(plan.squeezeDistance-plan.holdDistance)*smooth((t-a.windup)/a.active);
  else distance=plan.squeezeDistance+(plan.length-plan.squeezeDistance)*smooth((t-a.windup-a.active)/a.recovery);
  const chain=poseAtDistance(plan,distance),hitbox=active?C.attackCollisionGeometry(a.id,chain,heading,t,a,null):null;
  return {chain,stage,active,rootTravel:distance,zone:null,hitbox,telegraph:{committed:true,stage,warning:stage==='windup',aim:heading,center:copy(target)}};
 };
 root.NakaWrapV37={version:'3.7.0',prepare,planFor,pointAt,poseAtDistance,cacheSize:()=>cache.size};
})(typeof globalThis!=='undefined'?globalThis:this);
