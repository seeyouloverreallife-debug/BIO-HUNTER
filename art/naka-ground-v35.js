/* Naka v3.5: ground-relative following, distance-driven undulation and planted rest.
   Procedural contact approximation, not a physical friction simulator.
   The same final world-space spine is authoritative for rendering and hurtboxes. */
(function(root){'use strict';
 const C=root.NakaCore,L=root.NakaLocomotionV29,A=root.NakaAnimationV26;
 if(!C||!L||!root.NakaAttackV34)throw Error('Naka ground v3.5 requires attack v3.4');
 const create0=L.create,copy=p=>({x:p.x,y:p.y}),clamp=C.clamp,wrap=C.wrapAngle;
 const smooth=x=>{x=clamp(x,0,1);return x*x*(3-2*x);};
 const PROFILE={marsh:{amplitude:3.2,waveLength:142,lag:.56},dusk:{amplitude:4.0,waveLength:128,lag:.62},ancient:{amplitude:2.0,waveLength:165,lag:.50}};
 function create(chain,options={}){return {...create0(chain,options),grounded:true,contacts:chain.map(()=>0),lastTravel:0};}
 function reseed(state,chain){const clean=create(chain,{variant:state.variant,spacing:state.spacing,maxBendRadians:state.maxBendRadians});return {...clean,frames:state.frames,distance:state.distance,wavePhase:state.wavePhase,transition:'planted-reset'};}
 function advance(state,{head,dt,speed=0,mode='travel'}={}){
  if(!head||!Number.isFinite(head.x)||!Number.isFinite(head.y)||!Number.isFinite(dt)||dt<0||dt>.12||!Number.isFinite(speed)||speed<0)throw Error('finite head, dt [0,.12] and speed required');
  if(!['travel','idle','recover'].includes(mode))throw Error('invalid mode');
  const from=state.chain[0],travel=C.dist(head,from);
  if(travel>85)throw Error('ground locomotion reset required');
  // No head translation => no world-space body motion. Wave and contacts are distance-driven.
  if(travel<1e-8||dt===0)return {...state,frames:state.frames+1,lastTravel:0};
  const steps=Math.max(1,Math.ceil(travel/2)),spacing=state.spacing,bend=state.maxBendRadians,p=PROFILE[state.variant];
  let chain=state.chain.map(copy),phase=state.wavePhase,contacts=[];
  for(let sub=1;sub<=steps;sub++){
   const h={x:from.x+(head.x-from.x)*sub/steps,y:from.y+(head.y-from.y)*sub/steps};
   const nextPhase=phase+travel/steps/p.waveLength*Math.PI*2,out=[h];let prior=null;
   for(let i=1;i<chain.length;i++){
    const tangent=Math.atan2(chain[i].y-chain[i-1].y,chain[i].x-chain[i-1].x);
    const contact=Math.pow(.5+.5*Math.cos(nextPhase-i*p.lag),4),free=1-.88*contact;
    const taper=Math.pow(Math.max(0,Math.sin(Math.PI*i/(chain.length-1))),1.2);
    const wave=(Math.sin(nextPhase-i*p.lag)-Math.sin(phase-i*p.lag))*p.amplitude*taper*free;
    const desired={x:chain[i].x-Math.sin(tangent)*wave,y:chain[i].y+Math.cos(tangent)*wave};
    let theta=Math.atan2(desired.y-out[i-1].y,desired.x-out[i-1].x);
    if(prior!==null)theta=prior+clamp(wrap(theta-prior),-bend,bend);
    out.push({x:out[i-1].x+Math.cos(theta)*spacing,y:out[i-1].y+Math.sin(theta)*spacing});prior=theta;contacts[i]=contact;
   }
   chain=out;phase=nextPhase;
  }
  return {...state,chain,trail:chain.map(copy),wavePhase:phase,distance:state.distance+travel,frames:state.frames+1,envelope:1,contacts,lastTravel:travel,transition:'ground-follow'};
 }
 L.create=create;L.reseed=reseed;L.advance=advance;
 // Keep part of the forward/coil progress. Do not rewind the creature to its starting footprint.
 const sample0=A.samplePose;
 const HEAD=new Set(['bite','side_fang','double_fang','lunge','marsh_dive','shadow_breach']);
 A.samplePose=function(base,a,t,o={}){
  const retention=HEAD.has(a.id)?.62:A.COILS.includes(a.id)?.30:null;
  const rec=A.timeline(a).find(b=>b.phase==='recovery');let sampledTime=t;
  if(retention!==null&&rec&&t>=rec.start){const progress=smooth((t-rec.start)/rec.duration);sampledTime=rec.start+rec.duration*retention*progress;}
  const f=sample0(base,a,sampledTime,o);f.stage=A.phaseAt(a,t);f.active=A.isActive(f.stage);
  if(!f.active)f.hitbox=null;
  if(f.telegraph)f.telegraph={...f.telegraph,stage:f.stage,warning:!f.active&&f.stage!=='recovery'&&f.stage!=='done'};
  return f;
 };
 root.NakaGroundV35={version:'3.5.0',create,reseed,advance,profiles:PROFILE};
})(typeof globalThis!=='undefined'?globalThis:this);
