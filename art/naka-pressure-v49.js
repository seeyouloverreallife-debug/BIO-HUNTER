/* Distinct pursuit pressure. Motor limits change only on ordinary chase frames;
   attacks, committed evasions, return arcs, guard counters and openings keep authority. */
(function(root){'use strict';
 const B=root.NakaBehaviorV27,C=root.NakaCore,H=root.NakaPursuitV38,R=root.NakaArsenalV42;
 if(!root.NakaTacticsV48)throw Error('Pressure 4.9 requires pursuit tactics 4.8');
 const profiles={
  marsh:{speed:282,accel:700,brake:700,turn:4.0,burst:5.2,rest:1.05,attackGap:.10,peak:282,pulseDuration:0,pulseCooldown:0},
  dusk:{speed:300,accel:900,brake:900,turn:5.0,burst:3.8,rest:.95,attackGap:.08,peak:365,pulseDuration:.70,pulseCooldown:3.2},
  ancient:{speed:250,accel:530,brake:680,turn:2.7,burst:5.8,rest:1.30,attackGap:.18,peak:275,pulseDuration:.80,pulseCooldown:4.0}
 };
 for(const [id,p] of Object.entries(profiles))Object.assign(H.profiles[id],{speed:p.speed,accel:p.accel,brake:p.brake,turn:p.turn,burst:p.burst,rest:p.rest});
 const smooth=x=>{x=C.clamp(x,0,1);return x*x*(3-2*x);};
 function context(o){const d=C.dist(o.head,o.player),ux=d?(o.player.x-o.head.x)/d:1,uy=d?(o.player.y-o.head.y)/d:0,v=o.observedVelocity||{x:0,y:0};return {distance:d,outward:v.x*ux+v.y*uy,speed:Math.hypot(v.x,v.y),facing:Math.abs(C.wrapAngle(Math.atan2(o.player.y-o.head.y,o.player.x-o.head.x)-o.heading)),tailNear:(o.spine||[]).slice(17).some(p=>C.dist(p,o.player)<100)};}
 function trigger(variant,o,it){const q=context(o);
  if(variant==='dusk')return q.distance>=130&&q.distance<=350&&(q.outward>=60&&q.speed>=100||it.tactic48?.id==='flank-cut');
  if(variant==='ancient')return !o.tailBroken&&q.distance<=210&&q.facing>1&&q.tailNear;
  return false;
 }
 function envelope(pulse,now){if(!pulse||now<pulse.startedAt||now>=pulse.until)return 0;const age=now-pulse.startedAt,duration=pulse.until-pulse.startedAt;return smooth(age/.10)*(1-smooth((age-(duration-.20))/.20));}
 function motor(base,it,variant){if(!base||!it?.pursuit||it.reapproachV40||it.guard45||it.evade42||it.riposte43||it.kind==='attack'||!it.pressure49)return base;const p=it.pressure49,g=C.clamp(p.gain||0,0,1),spec=profiles[variant];return {...base,speed:base.speed*(1+(spec.peak/spec.speed-1)*g),accel:base.accel*(1+.18*g),minTurn:{marsh:1.55,dusk:2.1,ancient:1.1}[variant],brakeApproach49:true};}
 const decide0=B.decide,recovered0=B.recovered,committed0=B.committed,cancel0=H.cancel,cancelMove0=R.cancelMovement;
 B.decide=function(previous,o){
  const d=decide0(previous,o),it=d.intent,p=d.state.pursuit;
  if(o.busy||o.headBroken||!p?.active||o.now<(p.restUntil||0)||it.kind!=='move'||!it.pursuit||it.guard45||it.evade42||it.riposte43||it.reapproachV40||it.finishV40)return {...d,state:{...d.state,pressurePulse49:null}};
  const spec=profiles[o.variant.id];let pulse=d.state.pressurePulse49;
  if(pulse&&o.now>=pulse.until)pulse=null;
  if(!pulse&&o.now>=(d.state.nextPressureAt49||0)&&trigger(o.variant.id,o,it))pulse={startedAt:o.now,until:o.now+spec.pulseDuration,mode:o.variant.id==='dusk'?'rush-cut':'rear-drive'};
  const newly=pulse&&pulse!==d.state.pressurePulse49,gain=envelope(pulse,o.now),info={mode:pulse?.mode||{marsh:'steady-squeeze',dusk:'stalk-rush',ancient:'heavy-drive'}[o.variant.id],gain,baseSpeed:spec.speed,peakSpeed:spec.peak};
  return {...d,state:{...d.state,pressurePulse49:pulse,...(newly?{nextPressureAt49:o.now+spec.pulseCooldown}:{})},intent:{...it,pressure49:info}};
 };
 B.recovered=function(old,now,variant){const state=recovered0(old,now,variant);return state.pursuit?.active?{...state,nextAttackAt:now+profiles[variant].attackGap}:state;};
 B.committed=function(old,id,now){return {...committed0(old,id,now),pressurePulse49:null};};
 H.cancel=function(old,now,variant){return {...cancel0(old,now,variant),pressurePulse49:null};};
 R.cancelMovement=function(old,now){return {...cancelMove0(old,now),pressurePulse49:null};};
 root.NakaPressureV49={version:'4.9.0',profiles,context,trigger,envelope,motor};
})(typeof globalThis!=='undefined'?globalThis:this);
