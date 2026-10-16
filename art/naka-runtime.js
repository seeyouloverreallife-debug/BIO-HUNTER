/* BIO Hunter - Naka (snake) runtime bundle: core + animation v2.6 + behavior v2.7 + adapter v2.8 + config + locomotion v2.9 + creature v3.0 + reactions v3.1 + telegraph v3.2 + readability v3.3.
   Source: Naka_Lab_v3.3/production/Naka_Runtime_v3.3 (unmodified, concatenated by tools/build-naka-runtime.ps1). Host: src/modules/20-combat/monster/naka-boss.js */
/* ---- naka-core.js ---- */
(function(root,factory){const m=factory();if(typeof module==='object'&&module.exports)module.exports=m;root.NakaCore=m;})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const angleTo=(a,b)=>Math.atan2(b.y-a.y,b.x-a.x);
const wrapAngle=a=>Math.atan2(Math.sin(a),Math.cos(a));
function makeSnake(x=510,y=310,count=27,spacing=18){return Array.from({length:count},(_,i)=>({x:x-i*spacing,y:y+Math.sin(i*.50)*11}));}
function follow(chain,head,spacing=18){chain[0]={x:head.x,y:head.y};for(let i=1;i<chain.length;i++){let dx=chain[i].x-chain[i-1].x,dy=chain[i].y-chain[i-1].y,len=Math.hypot(dx,dy)||1;chain[i]={x:chain[i-1].x+dx/len*spacing,y:chain[i-1].y+dy/len*spacing};}return chain;}
function phases(atk,t){if(t<atk.windup)return 'windup';if(t<atk.windup+atk.active)return 'active';if(t<atk.windup+atk.active+atk.recovery)return 'recovery';return 'done';}
// v0.7: recent flank/rear attack evidence; events only count if the player struck.
function recordPressure(events,now,angle,damage=1){return [...events.filter(e=>now-e.t<=5),{t:now,angle:wrapAngle(angle),damage}].slice(-12);}
function reactiveResponse(events,now,opts={}){
 const recent=events.filter(e=>now-e.t<=4.2);
 const rear=recent.filter(e=>Math.abs(e.angle)>2.0);
 const flank=recent.filter(e=>Math.abs(e.angle)>0.85);
 if(opts.tailBroken||opts.counterCooldown>0||opts.busy||opts.distance>170)return null;
 if(rear.length>=2)return 'head_tail_combo';
 if(flank.length>=2)return 'counter_whip';
 return null;
}
// Combo is composed of two independently telegraphed strikes, with guaranteed gap.
function comboWindow(t,opts={}){
 const a=opts.attack||{windup:.68,active:.22,recovery:1.0};
 const secondStart=a.windup+a.active+.32;
 if(t<a.windup)return 'head-windup';
 if(t<a.windup+a.active)return 'head-active';
 if(t<secondStart)return 'escape-window';
 if(t<secondStart+.62)return 'tail-windup';
 if(t<secondStart+.62+.25)return 'tail-active';
 if(t<secondStart+.62+.25+a.recovery)return 'recovery';
 return 'done';
}
function chooseAttack(o){const {distance,headingDifference=0,tailAvailable=true,coilAvailable=true,waterAvailable=true,cooldowns={},flankOpportunity=false,halfCoilAvailable=false,reactive=null,expandedAttacks=false}=o;
 const ready=id=>(cooldowns[id]||0)<=0;
 if(reactive&&ready(reactive))return reactive;
 if(distance>195&&distance<260&&waterAvailable&&ready('marsh_dive'))return 'marsh_dive';
  if(expandedAttacks&&distance<105&&Math.abs(headingDifference)>.75&&Math.abs(headingDifference)<2&&ready('side_fang'))return 'side_fang';
 if(expandedAttacks&&distance>105&&distance<175&&tailAvailable&&ready('tail_hook'))return 'tail_hook';
 if(expandedAttacks&&distance<105&&ready('double_fang')&&ready('bite'))return 'double_fang';
 if(expandedAttacks&&distance<140&&coilAvailable&&ready('constrict_pulse')&&ready('coil_trap'))return 'constrict_pulse';
 if(distance>90&&distance<185&&halfCoilAvailable&&flankOpportunity&&ready('half_coil'))return 'half_coil';
 if(distance>140&&distance<=235&&ready('lunge'))return 'lunge';
 if(distance<145&&Math.abs(headingDifference)>2.1&&tailAvailable&&ready('tail_sweep'))return 'tail_sweep';
 if(distance<120&&coilAvailable&&ready('coil_trap'))return 'coil_trap';
 if(distance<110&&Math.abs(headingDifference)<1.15&&ready('bite'))return 'bite';
 if(distance<145&&ready('body_slam'))return 'body_slam';return null;
}
// v1.0: inputs are recent observed actions, not privileged future intent.
function combatPhase(hp,maxHp=850){const ratio=hp/maxHp;return ratio>.66?'stalking':ratio>.32?'encirclement':'swamp_dominion';}
function observePlayer(memory,now,event){const arr=(memory||[]).filter(e=>now-e.t<=9);return [...arr,{...event,t:now}].slice(-40);}
function playerPattern(memory,now){const recent=(memory||[]).filter(e=>now-e.t<=7);
 const count=k=>recent.filter(e=>e.type===k).length;
 const dodge=count('dodge'),strikes=count('strike'),retreat=count('retreat'),side=count('flank');
 return dodge>=3?'dodge_habit':retreat>=3?'retreat_habit':side>=3||strikes>=4?'flank_pressure':'neutral';}
function chooseTacticalAttack(o){const {phase='stalking',pattern='neutral',distance=200,cooldowns={},tailBroken=false,headBroken=false,history=[]}=o;
 const ready=id=>(cooldowns[id]||0)<=0&&history.slice(-2).every(x=>x!==id);
 // These are preferences, not unavoidable scripted attacks.
 const picks=[];
 if(phase==='stalking')picks.push(distance>135?'lunge':'bite','side_fang');
 if(phase==='encirclement')picks.push(pattern==='retreat_habit'?'half_coil':'tail_hook','coil_trap','body_slam');
 if(phase==='swamp_dominion')picks.push(pattern==='dodge_habit'?'double_fang':'constrict_pulse','marsh_dive','half_coil');
 if(pattern==='flank_pressure')picks.unshift('side_fang','counter_whip');
 return picks.find(id=>ready(id)&&!(tailBroken&&['tail_hook','counter_whip','tail_sweep'].includes(id))&&!(headBroken&&['lunge','marsh_dive'].includes(id))&&!(distance<80&&id==='marsh_dive')&&!(distance>220&&['bite','side_fang','coil_trap','constrict_pulse'].includes(id)))||null;}
// v1.2: signatures are exclusive; phase-locked to a committed target and telegraphed.
function signatureLegal(variant,id,context={}){
 const limits={double_coil:[55,160],shadow_breach:[145,250],titan_bodywave:[65,190]};
 const allowed={marsh:'double_coil',dusk:'shadow_breach',ancient:'titan_bodywave'};
 if(allowed[variant.id]!==id||!limits[id])return false;
 const [min,max]=limits[id],d=context.distance??0;
 if(d<min||d>max||(context.cooldowns?.[id]||0)>0)return false;
 if(id==='double_coil'&&context.tailBroken)return false;
 if(id==='shadow_breach'&&context.headBroken)return false;
 return !(context.recent||[]).slice(-2).includes(id);
}
function signatureContact(id,chain,player,aim,t,atk){
 if(phases(atk,t)!=='active')return false;
 if(id==='double_coil')return !!bodyContact(player,chain,29,2,chain.length-2);
 if(id==='titan_bodywave')return !!bodyContact(player,chain,38,3,Math.min(chain.length-1,20));
 if(id==='shadow_breach')return dist(chain[0],player)<=47&&Math.abs(wrapAngle(angleTo(chain[0],player)-aim))<1.20;
 return false;
}
function variantStats(variants,id){const v=variants[id];if(!v)throw new Error('Unknown variant: '+id);return v;}
function variantAttack(base,variant){return {...base,damage:Math.max(1,Math.round(base.damage*variant.damageMultiplier)),windup:+(base.windup*variant.windupMultiplier).toFixed(3),recovery:+(base.recovery*variant.cooldownMultiplier).toFixed(3)};}
function variantChoice(variant,context){const {distance=0,cooldowns={},tailBroken=false,headBroken=false,phase='stalking',recent=[]}=context;
 const deniedTail=['tail_hook','tail_sweep','counter_whip','head_tail_combo'];const deniedHead=['lunge','marsh_dive'];
 const maxRange={half_coil:185,coil_trap:150,constrict_pulse:160,marsh_dive:250,lunge:225,double_fang:117,side_fang:120,tail_hook:175,tail_sweep:155,body_slam:135};
 const minRange={marsh_dive:155,lunge:115,tail_hook:65,tail_sweep:40,half_coil:75};
 const legal=id=>!((cooldowns[id]||0)>0||tailBroken&&deniedTail.includes(id)||headBroken&&deniedHead.includes(id)||distance>(maxRange[id]||0)||distance<(minRange[id]||0)||recent.slice(-2).includes(id));
 if((phase==='swamp_dominion'||context.pressureMode&&phase==='encirclement')&&signatureLegal(variant,variant.signature,context))return variant.signature;
 const list=variant.id==='dusk'&&phase==='stalking'?['marsh_dive','lunge','double_fang']:variant.id==='ancient'&&phase==='swamp_dominion'?['tail_hook','body_slam','tail_sweep']:variant.preferred;
 return (list||[]).find(legal)||null;
}
// A deterministic target region is committed before the active window. The player
// must leave this region; dodging has meaning and the boss does not retarget.
function pressureZone(id,origin,target){
 const p={x:target.x,y:target.y};
 if(id==='double_coil')return {shape:'ring',x:p.x,y:p.y,inner:0,outer:115,gapAngle:Math.atan2(p.y-origin.y,p.x-origin.x)+Math.PI,gapWidth:.85};
 if(id==='shadow_breach')return {shape:'disc',x:p.x,y:p.y,radius:54};
 if(id==='titan_bodywave')return {shape:'lane',x:origin.x,y:origin.y,angle:Math.atan2(p.y-origin.y,p.x-origin.x),length:180,width:62};
 return null;
}
function pressureContains(zone,p){
 if(!zone)return false;const dx=p.x-zone.x,dy=p.y-zone.y,d=Math.hypot(dx,dy);
 if(zone.shape==='disc')return d<=zone.radius;
 if(zone.shape==='ring')return d>=zone.inner&&d<=zone.outer&&Math.abs(wrapAngle(Math.atan2(dy,dx)-zone.gapAngle))>zone.gapWidth/2;
 if(zone.shape==='lane'){const f=dx*Math.cos(zone.angle)+dy*Math.sin(zone.angle),side=Math.abs(-dx*Math.sin(zone.angle)+dy*Math.cos(zone.angle));return f>=0&&f<=zone.length&&side<=zone.width/2;}
 return false;
}
// v1.5: post-escape pressure uses OBSERVED movement, not future input.
function escapeIntercept(zone,escaped,velocity,arena={width:960,height:620}){
 if(!zone||!escaped)return null;
 const mag=Math.hypot(velocity?.x||0,velocity?.y||0);
 if(mag<45)return null;
 const lead=Math.min(95,mag*.32), ux=velocity.x/mag,uy=velocity.y/mag;
 return {x:clamp(escaped.x+ux*lead,44,arena.width-44),y:clamp(escaped.y+uy*lead,44,arena.height-44)};
}
function pressureFollowup(state,context){
 const {elapsed=0,phase='stalking',cooldowns={},tailBroken=false,distance=999}=context||{};
 if(!state||state.chainCount>=2||elapsed<state.readyAt||elapsed>state.expiresAt||phase==='stalking')return null;
 const options=state.variant==='marsh'?['half_coil','side_fang']:state.variant==='dusk'?['side_fang','lunge']:['tail_hook','body_slam'];
 const id=options.find(k=>(cooldowns[k]||0)<=0&&(!tailBroken||k!=='tail_hook')&&distance<230);
 return id?{id,target:state.target,chainCount:state.chainCount+1}:null;
}
function pressureStateFromEscape(variant,zone,player,velocity,elapsed,chainCount=0){
 const target=escapeIntercept(zone,player,velocity);
 if(!target||chainCount>=2)return null;
 return {variant,target,readyAt:elapsed+.8,expiresAt:elapsed+3.0,chainCount};
}
function planCombo(phase,pattern,parts={}){
 if(phase==='stalking')return null;
 if(phase==='encirclement'&&pattern==='retreat_habit')return ['half_coil','bite'];
 if(phase==='swamp_dominion'&&pattern==='dodge_habit')return ['double_fang','tail_hook'];
 if(phase==='swamp_dominion'&&!parts.tailBroken)return ['half_coil','constrict_pulse'];
 return null;
}
function nextComboStep(queue,cooldowns,readyGap){if(!readyGap||!queue?.length)return null;const [id,...rest]=queue;if((cooldowns[id]||0)>0)return null;return {id,rest};}
function hitCheck(id,snake,target,aim){const h=snake[0],dx=target.x-h.x,dy=target.y-h.y,d=Math.hypot(dx,dy),delta=Math.abs(wrapAngle(Math.atan2(dy,dx)-aim));
 if(id==='side_fang'||id==='double_fang')return d<118&&delta<0.72;
 if(id==='tail_hook')return !!tailSweepContact(target,snake,31,12);
 if(id==='constrict_pulse')return !!bodyContact(target,snake,29,3,snake.length-3);
 if(id==='bite')return d<105&&delta<0.60;
 if(id==='lunge'||id==='marsh_dive')return d<225&&delta<0.37;
 if(id==='counter_whip')return !!tailSweepContact(target,snake,30,10);
 if(id==='head_tail_combo')return d<95&&delta<0.65;
 if(id==='tail_sweep')return !!tailSweepContact(target,snake,25,8);
 if(id==='body_slam')return snake.slice(2,10).some(n=>dist(target,n)<37);
 if(id==='half_coil')return !!bodyContact(target,snake,28,4,snake.length-3);
 if(id==='coil_trap')return d>63&&d<117&&delta>0.70; // ring centered on locked player coordinate
 return false;}
function coilPose(chain,center,aim,progress,spacing=18,sweep=4.92){
 // Segment-based coil: a fixed arclength, open gap, and head-to-tail ordering.
 const blend=clamp(progress,0,1),n=chain.length;
 const delta=sweep/(n-1),radius=spacing/(2*Math.sin(delta/2));
 const target=chain.map((_,i)=>{const theta=aim+.68+i*delta;return {x:center.x+Math.cos(theta)*radius,y:center.y+Math.sin(theta)*radius};});
 if(blend===0)return chain.map(p=>({...p}));
 if(blend===1)return target;
 const pose=chain.map((pt,i)=>({x:pt.x+(target[i].x-pt.x)*blend,y:pt.y+(target[i].y-pt.y)*blend}));
 return follow(pose,{...pose[0]},spacing);
}
function halfCoilPose(chain,center,aim,progress,spacing=18){return coilPose(chain,center,aim,progress,spacing,2.75);}
function flankTarget(head,player,velocity,side=1,options={}){
 const heading=Math.atan2(velocity.y,velocity.x);const moving=Math.hypot(velocity.x,velocity.y)>25;const dir=moving?heading:angleTo(head,player);
 const offset=options.offset??95,lead=options.lead??45;
 return {x:player.x+Math.cos(dir)*lead-Math.sin(dir)*side*offset,y:player.y+Math.sin(dir)*lead+Math.cos(dir)*side*offset};
}
function chooseFlankSide(head,player,velocity){const d=angleTo(head,player);const vx=velocity.x,vy=velocity.y;return (Math.cos(d)*vy-Math.sin(d)*vx)>=0?-1:1;}
function tailSweepContact(point,chain,radius=25,segments=8){return bodyContact(point,chain,radius,Math.max(0,chain.length-1-segments),chain.length-1);}
function closestPointOnSegment(p,a,b){const dx=b.x-a.x,dy=b.y-a.y,den=dx*dx+dy*dy||1;const t=clamp(((p.x-a.x)*dx+(p.y-a.y)*dy)/den,0,1);return {x:a.x+dx*t,y:a.y+dy*t};}
function bodyContact(point,chain,radius=20,from=0,to=chain.length-1){
 let found=null;
 for(let i=Math.max(0,from);i<Math.min(to,chain.length-1);i++){
   const closest=closestPointOnSegment(point,chain[i],chain[i+1]);const d=dist(point,closest);
   if(d<radius&&(!found||d<found.distance))found={index:i,closest,distance:d,penetration:radius-d};
 }
 return found;
}
function resolveBodyCollision(point,chain,playerRadius=11,bodyRadius=13){
 // Only called during active coil. Segment capsule separation preserves the ring's physical gap.
 let pos={...point},collided=false;
 for(let pass=0;pass<3;pass++){
   const hit=bodyContact(pos,chain,playerRadius+bodyRadius);
   if(!hit)break;
   collided=true;
   let dx=pos.x-hit.closest.x,dy=pos.y-hit.closest.y,d=Math.hypot(dx,dy);
   if(d<.0001){const a=chain[hit.index],b=chain[hit.index+1];dx=-(b.y-a.y);dy=b.x-a.x;d=Math.hypot(dx,dy)||1;}
   pos={x:pos.x+dx/d*(hit.penetration+.2),y:pos.y+dy/d*(hit.penetration+.2)};
 }
 return {point:pos,collided};
}
function chainLength(chain){let sum=0;for(let i=1;i<chain.length;i++)sum+=dist(chain[i],chain[i-1]);return sum;}
function spineSpacingError(chain,spacing=18){let max=0;for(let i=1;i<chain.length;i++)max=Math.max(max,Math.abs(dist(chain[i],chain[i-1])-spacing));return max;}
// v2.5: single authoritative 2D spine constraint pass AFTER procedural deformation.
// Pure (never mutates caller's rig), fixed head anchor, constant bone length,
// local angular limit. Both rendering and collision use the resulting coordinates.
function solveSpineConstraints(chain,options={}){
 if(!Array.isArray(chain)||!chain.length)return [];
 const spacing=options.spacing??18,maxBend=options.maxBendRadians??0.68;
 if(!(spacing>0)||!(maxBend>0&&maxBend<=Math.PI))throw new RangeError('invalid spine constraints');
 if(!chain.every(p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y)))throw new RangeError('non-finite rig node');
 const result=[{x:chain[0].x,y:chain[0].y}];
 let previousAngle=options.fallbackAngle??Math.atan2(chain[0].y-(chain[1]?.y??chain[0].y),chain[0].x-(chain[1]?.x??chain[0].x));
 for(let i=1;i<chain.length;i++){
  const parent=result[i-1],dx=chain[i].x-parent.x,dy=chain[i].y-parent.y;
  // On coincident nodes, retain the previous tangent; never create NaNs.
  const wanted=Math.hypot(dx,dy)>1e-8?Math.atan2(dy,dx):previousAngle;
  const theta=i===1?wanted:previousAngle+clamp(wrapAngle(wanted-previousAngle),-maxBend,maxBend);
  result.push({x:parent.x+Math.cos(theta)*spacing,y:parent.y+Math.sin(theta)*spacing});
  previousAngle=theta;
 }
 return result;
}
// Diagnostic only: no mutation and no hidden tolerance relaxation.
function spineIntegrity(chain,spacing=18){
 let maxSpacingError=0,maxBendRadians=0,stretchedJoint=-1,bendJoint=-1,nonFinite=0;
 for(let i=0;i<chain.length;i++){
  if(!Number.isFinite(chain[i].x)||!Number.isFinite(chain[i].y)){nonFinite++;continue;}
  if(i>0){const e=Math.abs(dist(chain[i],chain[i-1])-spacing);
   if(e>maxSpacingError){maxSpacingError=e;stretchedJoint=i;}}
  if(i>1){const a=angleTo(chain[i-2],chain[i-1]),b=angleTo(chain[i-1],chain[i]);
   const bend=Math.abs(wrapAngle(b-a));if(bend>maxBendRadians){maxBendRadians=bend;bendJoint=i;}}
 }
 return {maxSpacingError,maxBendRadians,stretchedJoint,bendJoint,nonFinite,totalLength:chainLength(chain)};
}
function coilClosure(t,attack){if(!attack||!['coil_trap','half_coil','constrict_pulse','double_coil'].includes(attack.id))return 0;const total=attack.windup+attack.active+attack.recovery;
 if(t<attack.windup)return clamp((t/attack.windup)*0.92,0,0.92);
 if(t<attack.windup+attack.active)return 1;
 return clamp(1-(t-attack.windup-attack.active)/attack.recovery,0,1);
}
function strikePart(point,chain,partState,reach=38){const head=chain[0],tail=chain[chain.length-1];let zone=null;
 if(!partState.headBroken&&dist(point,head)<reach)zone='head';
 else if(!partState.tailBroken&&dist(point,tail)<reach)zone='tail';
 else if(chain.slice(2,-2).some(n=>dist(point,n)<reach))zone='body';
 return zone;
}
function applyPartHit(state,zone,damage=20){if(!zone)return {state,event:null};const next={...state};
 next.hp=Math.max(0,next.hp-damage);let event='hit';
 if(zone==='head'&&!next.headBroken){next.headDurability=Math.max(0,next.headDurability-damage);if(next.headDurability===0){next.headBroken=true;event='head-break';}}
 if(zone==='tail'&&!next.tailBroken){next.tailDurability=Math.max(0,next.tailDurability-damage);if(next.tailDurability===0){next.tailBroken=true;event='tail-break';}}
 return {state:next,event};}
// v0.5: acceleration-limited, turn-rate-limited pursuit, with inertial heading.
function steerSerpent(motion, target, dt, options={}){
 const rate=options.turnRate??1.8, accel=options.acceleration??175, drag=options.drag??110;
 const topSpeed=options.speed??118, desired=CARDINAL_SAFE(target,motion);
 const heading=motion.heading??0, angular=wrapAngle(desired-heading);
 const nextHeading=heading+clamp(angular,-rate*dt,rate*dt);
 const previousSpeed=motion.speed??0;
 const speed=clamp(previousSpeed+(options.brake? -drag:accel)*dt,0,topSpeed);
 return {heading:nextHeading,speed,x:motion.x+Math.cos(nextHeading)*speed*dt,y:motion.y+Math.sin(nextHeading)*speed*dt};
}

// v2.1: strike poses use a continuous anticipation → thrust → follow-through profile.
function strikePose(chain,id,t,attack,opts={}){
 const base=chain.map(p=>({...p}));let pose=base.map(p=>({...p}));
 const window=id==='head_tail_combo'?comboWindow(t,{attack}):id==='double_fang'?doubleFangPhase(t,attack):phases(attack,t);
 const isHead=id==='head_tail_combo'?window==='head-active'||window==='head-windup':['bite','side_fang','double_fang'].includes(id);
 const isTail=['tail_sweep','counter_whip','tail_hook'].includes(id)||(id==='head_tail_combo'&&(window.startsWith('tail-')||window==='recovery'));
 let zone=null;
 if(isHead){
  const wind=attack.windup;
  const active=attack.active;
  const recover=attack.recovery??0.8;
  const secondStart=attack.windup+attack.active+(attack.escapeWindow??.34);
  let local=t,reach=id==='side_fang'?26:id==='double_fang'?19:17;
  if(id==='double_fang'&&(window.startsWith('second-')||window==='recovery')){local=t-secondStart;}
  const total=wind+active+recover;
  const p=clamp(local/Math.max(total,0.001),0,1);
  const windP=clamp(local/Math.max(wind,0.001),0,1);
  const activeP=clamp((local-wind)/Math.max(active,0.001),0,1);
  const recoverP=clamp((local-wind-active)/Math.max(recover,0.001),0,1);
  let forward=0, lateral=0;
  if(local<wind){forward=-6*Math.sin(windP*Math.PI*0.5);} 
  else if(local<wind+active){forward=-6+(reach+6)*Math.sin(activeP*Math.PI*0.92);}
  else {forward=(-6+(reach+6)*Math.sin(Math.PI*.92))*(1-recoverP);}
  if(id==='side_fang') lateral=Math.sin(Math.min(1,p)*Math.PI)*(opts.side??1)*8;
  const aim=opts.aim??0,dx=Math.cos(aim),dy=Math.sin(aim),nx=-Math.sin(aim),ny=Math.cos(aim);
  const neckLag=[1,.82,.64,.48,.32,.18];
  for(let i=0;i<Math.min(neckLag.length,pose.length);i++){
    const k=neckLag[i];
    pose[i]={x:base[i].x+dx*forward*k+nx*lateral*k,y:base[i].y+dy*forward*k+ny*lateral*k};
  }
  // pull the front body into an S-neck during anticipation and absorb recoil afterward.
  for(let i=2;i<Math.min(10,pose.length);i++){
    const k=(10-i)/8,curve=(local<wind?-10*windP:(local<wind+active?-10+16*(activeP*activeP*(3-2*activeP)):6*(1-recoverP)))*k;
    pose[i].x+=nx*curve;pose[i].y+=ny*curve;
  }
  zone={type:'head',active:window==='head-active'||window==='active'};
 }
 if(isTail){
  const start=id==='head_tail_combo'?attack.windup+attack.active+.32:0;
  const wind=id==='head_tail_combo'?.62:attack.windup,active=id==='head_tail_combo'?.25:attack.active,recover=attack.recovery??0.85;
  const local=t-start;const sign=opts.side??1;
  const windP=clamp(local/Math.max(wind,0.001),0,1),swingP=clamp((local-wind)/Math.max(active,0.001),0,1),recoverP=clamp((local-wind-active)/Math.max(recover,0.001),0,1);
  let theta=0;
  if(local<wind)theta=-.42*windP*sign;
  else if(local<wind+active)theta=(-.42+(id==='tail_hook'?1.65:1.25)*swingP)*sign;
  else theta=((id==='tail_hook'?1.23:.88)*(1-recoverP))*sign;
  const pivotIndex=Math.max(0,base.length-10),pivot=base[pivotIndex];
  for(let i=pivotIndex+1;i<base.length;i++){
    const k=(i-pivotIndex)/(base.length-1-pivotIndex),a=theta*k,dx=base[i].x-pivot.x,dy=base[i].y-pivot.y;
    pose[i]={x:pivot.x+dx*Math.cos(a)-dy*Math.sin(a),y:pivot.y+dx*Math.sin(a)+dy*Math.cos(a)};
  }
  zone={type:'tail',active:window==='tail-active'||window==='active'};
 }
 return {chain:pose,zone,window};
}
function strikeContact(id,chain,player,aim,t,atk){
 const state=id==='head_tail_combo'?comboWindow(t,{attack:atk}):phases(atk,t);
 if(id==='head_tail_combo'){
  if(state==='head-active')return hitCheck('bite',chain,player,aim);
  if(state==='tail-active')return !!tailSweepContact(player,chain,30,10);
  return false;
 }
 if(state!=='active')return false;
 if(id==='tail_sweep'||id==='counter_whip'||id==='tail_hook')return !!tailSweepContact(player,chain,id==='tail_hook'?31:id==='counter_whip'?30:25,id==='tail_hook'?12:id==='counter_whip'?10:8);
 return hitCheck(id,chain,player,aim);
}


// v2.3: geometry shared by contact tests and on-canvas debug outlines.
function attackHitGeometry(id,chain,aim,t,atk){
 const ph=id==='double_fang'?doubleFangPhase(t,atk):id==='head_tail_combo'?comboWindow(t,{attack:atk}):phases(atk,t);
 const active=ph==='active'||ph==='first-active'||ph==='second-active'||ph==='head-active'||ph==='tail-active';
 if(!active)return null;
 const tail=id==='tail_sweep'||id==='counter_whip'||id==='tail_hook'||id==='head_tail_combo'&&ph==='tail-active';
 if(tail){const start=Math.max(0,chain.length-(id==='tail_hook'?12:10));return {kind:'capsules',points:chain.slice(start).map(p=>({...p})),radius:id==='tail_sweep'?25:30};}
 if(['bite','side_fang','double_fang','head_tail_combo'].includes(id)){
   const h=chain[0];return {kind:'capsule',a:{x:h.x,y:h.y},b:{x:h.x+Math.cos(aim)*31,y:h.y+Math.sin(aim)*31},radius:id==='side_fang'?23:21};
 }
 return null;
}
function pointSegmentDistance(p,a,b){const dx=b.x-a.x,dy=b.y-a.y;const t=clamp(((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy||1),0,1);return Math.hypot(p.x-a.x-t*dx,p.y-a.y-t*dy);}
function animationHitContact(id,chain,player,aim,t,atk,playerRadius=11){
 const shape=attackHitGeometry(id,chain,aim,t,atk);if(!shape)return false;
 if(shape.kind==='capsule')return pointSegmentDistance(player,shape.a,shape.b)<=shape.radius+playerRadius;
 return shape.points.slice(1).some((p,i)=>pointSegmentDistance(player,shape.points[i],p)<=shape.radius+playerRadius);
}
// v2.4: one authoritative collision shape for each attack and its debug overlay.
// Signature hazards remain committed world-space zones; their warning geometry is
// distinct from the articulated body, and this distinction is made explicit in UI.
function attackCollisionGeometry(id,chain,aim,t,atk,zone=null){
 const existing=attackHitGeometry(id,chain,aim,t,atk);
 if(existing)return existing;
 if(phases(atk,t)!=='active')return null;
 if(id==='lunge'||id==='marsh_dive'){
  const h=chain[0];return {kind:'capsule',a:{...h},b:{x:h.x+Math.cos(aim)*34,y:h.y+Math.sin(aim)*34},radius:22};
 }
 if(id==='body_slam')return {kind:'capsules',points:chain.slice(2,12).map(q=>({...q})),radius:27};
 if(id==='coil_trap'||id==='half_coil')return {kind:'capsules',points:chain.slice(1,-1).map(q=>({...q})),radius:13};
 if(id==='constrict_pulse')return {kind:'capsules',points:chain.slice(2,-2).map(q=>({...q})),radius:20};
 if(id==='double_coil'&&zone)return {kind:'ring-hazard',...zone};
 if(id==='shadow_breach'&&zone)return {kind:'disc-hazard',...zone};
 if(id==='titan_bodywave'&&zone){
  const f=clamp((t-atk.windup)/atk.active,0,1)*zone.length;
  return {kind:'wave-band',x:zone.x,y:zone.y,angle:zone.angle,start:Math.max(0,f-20),end:Math.min(zone.length,f+20),width:zone.width};
 }
 return null;
}
function attackShapeContains(shape,p,playerRadius=11){
 if(!shape)return false;
 if(shape.kind==='capsule')return pointSegmentDistance(p,shape.a,shape.b)<=shape.radius+playerRadius;
 if(shape.kind==='capsules')return shape.points.length>1&&shape.points.slice(1).some((q,i)=>pointSegmentDistance(p,shape.points[i],q)<=shape.radius+playerRadius);
 // Locked hazard boundaries represent the player's center. This preserves the
 // telegraphed safe wedge and avoids hidden radius expansion into it.
 if(shape.kind==='disc-hazard')return dist(shape,p)<=shape.radius;
 if(shape.kind==='ring-hazard')return pressureContains(shape,p);
 if(shape.kind==='wave-band'){
  const dx=p.x-shape.x,dy=p.y-shape.y,f=dx*Math.cos(shape.angle)+dy*Math.sin(shape.angle),side=Math.abs(-dx*Math.sin(shape.angle)+dy*Math.cos(shape.angle));
  return f>=shape.start&&f<=shape.end&&side<=shape.width/2;
 }
 return false;
}
function sweptAttackContact(id,oldChain,newChain,oldPlayer,newPlayer,aim,oldT,newT,atk,zone=null,playerRadius=11){
 if(!oldChain?.length||oldChain.length!==newChain?.length||!oldPlayer||!newPlayer||newT<oldT)return {hit:false,samples:0};
 let motion=dist(oldPlayer,newPlayer);
 for(let i=0;i<oldChain.length;i++)motion=Math.max(motion,dist(oldChain[i],newChain[i]));
 // The maximum interpolation distance is <= 5 world units per substep unless
 // one update exceeds the 96-sample safeguard. Large frames should be subdivided.
 const count=Math.min(96,Math.max(2,Math.ceil(motion/5),Math.ceil((newT-oldT)/.012)));
 for(let i=0;i<=count;i++){
  const alpha=i/count,t=oldT+(newT-oldT)*alpha;
  const point={x:oldPlayer.x+(newPlayer.x-oldPlayer.x)*alpha,y:oldPlayer.y+(newPlayer.y-oldPlayer.y)*alpha};
  const chain=oldChain.map((n,k)=>({x:n.x+(newChain[k].x-n.x)*alpha,y:n.y+(newChain[k].y-n.y)*alpha}));
  const shape=attackCollisionGeometry(id,chain,aim,t,atk,zone);
  if(attackShapeContains(shape,point,playerRadius))return {hit:true,point,time:t,kind:shape.kind,samples:i+1};
 }
 return {hit:false,samples:count+1};
}
function doubleFangPhase(t,attack){
 const firstEnd=attack.windup+attack.active;
 const secondWindStart=firstEnd+(attack.escapeWindow??.34);
 const secondActiveStart=secondWindStart+(attack.secondWindup??.47);
 const secondActiveEnd=secondActiveStart+(attack.secondActive??.20);
 if(t<attack.windup)return 'first-windup';
 if(t<firstEnd)return 'first-active';
 if(t<secondWindStart)return 'escape-window';
 if(t<secondActiveStart)return 'second-windup';
 if(t<secondActiveEnd)return 'second-active';
 if(t<secondActiveEnd+attack.recovery)return 'recovery';
 return 'done';
}
function doubleFangContact(chain,player,aim,t,atk){
 const state=doubleFangPhase(t,atk);
 return (state==='first-active'||state==='second-active')&&hitCheck('double_fang',chain,player,aim);
}
function CARDINAL_SAFE(target,motion){return Math.atan2(target.y-motion.y,target.x-motion.x);}
// Predictive intercept uses only previous observed displacement and an upper prediction horizon.
function interceptionTarget(head,player,velocity,options={}){
 const lookahead=clamp(dist(head,player)/(options.travelSpeed??150),0,options.maxLead??.85);
 const damp=options.leadFactor??.72;
 return {x:player.x+clamp(velocity.x,-220,220)*lookahead*damp,
         y:player.y+clamp(velocity.y,-220,220)*lookahead*damp};
}
function crossingIntent(head,player,velocity,options={}){
 const target=interceptionTarget(head,player,velocity,options);
 return {target,intercept:dist(target,player)>20&&dist(head,player)>95};
}
return {solveSpineConstraints,spineIntegrity,attackCollisionGeometry,attackShapeContains,sweptAttackContact,attackHitGeometry,animationHitContact,escapeIntercept,pressureFollowup,pressureStateFromEscape,pressureZone,pressureContains,signatureLegal,signatureContact,variantStats,variantAttack,variantChoice,combatPhase,observePlayer,playerPattern,chooseTacticalAttack,planCombo,nextComboStep,clamp,dist,angleTo,wrapAngle,recordPressure,reactiveResponse,comboWindow,makeSnake,follow,phases,chooseAttack,hitCheck,coilPose,halfCoilPose,flankTarget,chooseFlankSide,tailSweepContact,bodyContact,resolveBodyCollision,chainLength,spineSpacingError,coilClosure,strikePart,applyPartHit,steerSerpent,interceptionTarget,crossingIntent,strikePose,strikeContact,doubleFangPhase,doubleFangContact};});
;
/* ---- naka-animation-v26.js ---- */
/* BIO Hunter Naka animation production v2.6. Pure 2D top-down motion / collision sampler.
 * Consumes existing v2.5 rig, C.solveSpineConstraints and C.attackCollisionGeometry;
 * exports have local-space coordinates; no main game access. */
(function(root,factory){const m=factory(typeof module==='object'&&module.exports?require('./naka-core.js'):root.NakaCore);if(typeof module==='object'&&module.exports)module.exports=m;root.NakaAnimationV26=m;})(typeof globalThis!=='undefined'?globalThis:this,function(C){'use strict';
const eps=1e-9, clamp=C.clamp;
const COILS=new Set(['coil_trap','half_coil','constrict_pulse','double_coil']);
const STRIKES=new Set(['bite','tail_sweep','side_fang','double_fang','tail_hook','counter_whip','head_tail_combo']);
const translate=(chain,x,y)=>chain.map(p=>({x:p.x+x,y:p.y+y}));
const smooth=x=>{x=clamp(x,0,1);return x*x*(3-2*x);};
function timeline(a){
 const w=a.windup,act=a.active,rec=a.recovery;
 if(a.id==='double_fang')return stages([['first-windup',w],['first-active',act],['escape-window',a.escapeWindow??.34],['second-windup',a.secondWindup??.47],['second-active',a.secondActive??.2],['recovery',rec]]);
 if(a.id==='head_tail_combo')return stages([['head-windup',w],['head-active',act],['escape-window',.32],['tail-windup',.62],['tail-active',.25],['recovery',rec]]);
 return stages([['windup',w],['active',act],['recovery',rec]]);
}
function stages(parts){let t=0;return parts.map(([phase,duration])=>{if(!(duration>=0))throw Error('Bad stage duration');const start=t;t+=duration;return {phase,start:+start.toFixed(9),end:+t.toFixed(9),duration};});}
function duration(a){return timeline(a).at(-1).end;}
function phaseAt(a,t){return timeline(a).find(s=>t<s.end-eps)?.phase||'done';}
function isActive(phase){return phase==='active'||phase==='first-active'||phase==='second-active'||phase==='head-active'||phase==='tail-active';}
function travel(a,t){
 const profile={lunge:[14,108,34],marsh_dive:[10,92,26],shadow_breach:[12,98,28],bite:[6,14,5],side_fang:[7,19,7],double_fang:[6,15,5],head_tail_combo:[7,16,6]}[a.id];
 if(!profile)return 0;
 const [back,reach,follow]=profile,win=a.windup,act=a.active;
 if(a.id==='double_fang'){
  const first=win+act,gap=a.escapeWindow??.34,secondStart=first+gap,secondWind=a.secondWindup??.47,secondActive=a.secondActive??.2;
  if(t<win)return -back*smooth(t/win);
  if(t<first)return -back+(reach+back)*smooth((t-win)/act);
  if(t<secondStart)return reach+(follow-reach)*smooth((t-first)/gap);
  if(t<secondStart+secondWind)return follow+(-back*.7-follow)*smooth((t-secondStart)/secondWind);
  if(t<secondStart+secondWind+secondActive)return -back*.7+(reach*.9+back*.7)*smooth((t-secondStart-secondWind)/secondActive);
  return reach*.9+(follow-reach*.9)*smooth((t-secondStart-secondWind-secondActive)/a.recovery);
 }
 if(t<win)return -back*smooth(t/win);
 if(t<win+act)return -back+(reach+back)*smooth((t-win)/act);
 if(a.id==='head_tail_combo')return reach+(follow-reach)*smooth((t-win-act)/Math.max(.32, duration(a)-win-act));
 return reach+(follow-reach)*smooth((t-win-act)/a.recovery);
}
function interpolateCoil(from,to,p,spacing){
 // Interpolate anatomical CURVATURE (not raw joint positions) so every intermediate
 // rig is valid. A one-pass solver on interpolated Cartesian points can bifurcate
 // when a coil intersects itself and makes far-tail bones teleport >100u/frame.
 const alpha=smooth(p),head={x:from[0].x+(to[0].x-from[0].x)*alpha,y:from[0].y+(to[0].y-from[0].y)*alpha};
 const result=[head];
 let lastFrom=Math.atan2(from[1].y-from[0].y,from[1].x-from[0].x);
 let lastTo=Math.atan2(to[1].y-to[0].y,to[1].x-to[0].x);
 let theta=lastFrom+C.wrapAngle(lastTo-lastFrom)*alpha;
 result.push({x:head.x+Math.cos(theta)*spacing,y:head.y+Math.sin(theta)*spacing});
 for(let i=2;i<from.length;i++){
  const source=Math.atan2(from[i].y-from[i-1].y,from[i].x-from[i-1].x);
  const dest=Math.atan2(to[i].y-to[i-1].y,to[i].x-to[i-1].x);
  const bendFrom=C.wrapAngle(source-lastFrom),bendTo=C.wrapAngle(dest-lastTo);
  theta+=(1-alpha)*bendFrom+alpha*bendTo;
  const prev=result[i-1];result.push({x:prev.x+Math.cos(theta)*spacing,y:prev.y+Math.sin(theta)*spacing});
  lastFrom=source;lastTo=dest;
 }
 return result;
}
function refZone(a,head,target){return C.pressureZone(a.id,head,target);}
function samplePose(baseChain,a,t,opts={}){
 if(!a?.id||!baseChain?.length)throw Error('Attack and base rig required');
 const aim=opts.aim??0,side=opts.side??1,spacing=opts.constraints?.spacing??18;
 const center=opts.center||{x:baseChain[0].x+Math.cos(aim)*90,y:baseChain[0].y+Math.sin(aim)*90};
 // World runtime owns root movement; clip baking opts into deterministic root track.
 const rootTravel=travel(a,t),work=opts.includeRootMotion?translate(baseChain,Math.cos(aim)*rootTravel,Math.sin(aim)*rootTravel):baseChain.map(p=>({...p}));
 let posed=work,stage=phaseAt(a,t);
 if(COILS.has(a.id)){
  const progress=C.coilClosure(t,a);
  const sweep=a.id==='double_coil'?5.43:a.id==='constrict_pulse'?5.25:4.92;
  const zone=opts.zone||refZone(a,work[0],center);
  const coilAim=a.id==='double_coil'&&zone?zone.gapAngle-.68-(sweep+2*Math.PI)/2:aim;
  const target=a.id==='half_coil'?C.halfCoilPose(work,center,aim,1,spacing):C.coilPose(work,center,coilAim,1,spacing,sweep);
  posed=interpolateCoil(work,target,progress,spacing);
 }else if(STRIKES.has(a.id))posed=C.strikePose(work,a.id,t,a,{aim,side}).chain;
 else if(a.id==='body_slam'){
  const u=t<a.windup?smooth(t/a.windup):t<a.windup+a.active?1:1-smooth((t-a.windup-a.active)/a.recovery);
  const wave=t<a.windup?-8*u:t<a.windup+a.active?-8+39*smooth((t-a.windup)/a.active):31*(1-smooth((t-a.windup-a.active)/a.recovery));
  const nx=-Math.sin(aim)*side,ny=Math.cos(aim)*side;
  posed=work.map((p,i)=>{const k=Math.max(0,1-Math.abs(i-7)/8);return {x:p.x+nx*k*wave,y:p.y+ny*k*wave};});
 }else if(a.id==='titan_bodywave'){
  const gate=t<a.windup?smooth(t/a.windup):t<a.windup+a.active?1:1-smooth((t-a.windup-a.active)/a.recovery);
  const nx=-Math.sin(aim),ny=Math.cos(aim);
  posed=work.map((p,i)=>{const k=i<3||i>22?0:Math.sin((i-3)*.62-t*6)*20*gate;return {x:p.x+nx*k,y:p.y+ny*k};});
 }else if(['lunge','marsh_dive','shadow_breach'].includes(a.id)){
  const anticipation=t<a.windup?smooth(t/a.windup):t<a.windup+a.active?1:1-smooth((t-a.windup-a.active)/a.recovery);
  const ux=Math.cos(aim),uy=Math.sin(aim),nx=-uy,ny=ux;
  const sway=a.id==='marsh_dive'?6:a.id==='shadow_breach'?11:8;
  posed=work.map((p,i)=>{const k=Math.max(0,1-i/12);const f=(i<7?1-i/7:0)*6*anticipation;const s=Math.sin(i*.52)*sway*k*anticipation;return {x:p.x-ux*f+nx*s,y:p.y-uy*f+ny*s};});
 }
 let chain=C.solveSpineConstraints(posed,opts.constraints||{spacing,maxBendRadians:.68});
 if(opts.transitionFrom&&t<.12)chain=blendTransition(opts.transitionFrom,chain,t/.12,opts.constraints||{spacing,maxBendRadians:.68});
 const zone=opts.zone||refZone(a,baseChain[0],center);
 // Warning and collider are deliberately distinct. Damage comes only from this live shape.
 const hitbox=C.attackCollisionGeometry(a.id,chain,aim,t,a,zone);
 return {chain,stage,active:isActive(stage),rootTravel,zone,hitbox,telegraph:{committed:true,stage,warning:!isActive(stage)&&stage!=='recovery'&&stage!=='done',aim,center:{...center}}};
}
function blendTransition(from,to,alpha,constraints){if(from.length!==to.length)throw Error('Mismatched rig');const q=smooth(alpha);return C.solveSpineConstraints(from.map((p,i)=>({x:p.x+(to[i].x-p.x)*q,y:p.y+(to[i].y-p.y)*q})),constraints);}
return {COILS:[...COILS],STRIKES:[...STRIKES],timeline,duration,phaseAt,isActive,travel,samplePose,blendTransition};
});
;
/* ---- naka-behavior-v27.js ---- */
/* BIO Hunter Naka v2.7 — standalone deterministic creature decision controller.
 * This module never applies damage, alters attack animation, predicts future player input,
 * or writes to the host game. Each committed attack is returned as an intent and
 * must pass through the existing v2.6 telegraph/animation/collision runtime.
 */
(function(root,factory){const m=factory();if(typeof module==='object'&&module.exports)module.exports=m;root.NakaBehaviorV27=m;})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
const PI=Math.PI,TAU=PI*2;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const finite=n=>typeof n==='number'&&Number.isFinite(n);
const wrapAngle=a=>Math.atan2(Math.sin(a),Math.cos(a));
const round=n=>Math.round(n*100)/100;
const ATTACK_FAMILY={bite:'head',side_fang:'head',double_fang:'head',lunge:'head',marsh_dive:'head',shadow_breach:'head',tail_sweep:'tail',tail_hook:'tail',counter_whip:'tail',head_tail_combo:'tail',body_slam:'body',titan_bodywave:'body',coil_trap:'coil',half_coil:'coil',constrict_pulse:'coil',double_coil:'coil'};
// Narrower *approach* envelopes than animation ranges. A candidate is never legal
// solely because its damage geometry reaches farther than its clearly marked intent.
const ENVELOPES={bite:[0,106],side_fang:[0,116],double_fang:[0,112],lunge:[120,220],marsh_dive:[160,245],shadow_breach:[145,230],tail_sweep:[45,150],tail_hook:[66,169],counter_whip:[40,159],head_tail_combo:[40,156],body_slam:[25,132],titan_bodywave:[65,183],coil_trap:[35,146],half_coil:[80,180],constrict_pulse:[38,154],double_coil:[60,155]};
const PROFILES={
 marsh:{name:'territorial-constrictor', preferredDistance:132,comfort:[100,165],observeDuration:0.85,setupDuration:.65,commitPause:0.52,moveSpeedFactor:0.85,modeWeights:{circle:1.6,herd:1.8,bait:0.2,guard:0.4,pursue:0.7},attackWeights:{coil:2.9,head:0.7,tail:0.9,body:1.0},signatureBonus:3.0,angleOffset:1.08},
 dusk:{name:'mobile-ambusher',preferredDistance:173,comfort:[135,220],observeDuration:0.52,setupDuration:.16,commitPause:0.36,moveSpeedFactor:1.03,modeWeights:{circle:1.8,herd:0.2,bait:1.8,guard:0.1,pursue:1.6},attackWeights:{coil:0.35,head:2.5,tail:0.5,body:0.5},signatureBonus:2.3,angleOffset:1.30},
 ancient:{name:'territorial-heavy-guardian',preferredDistance:123,comfort:[80,160],observeDuration:1.04,setupDuration:.82,commitPause:0.92,moveSpeedFactor:0.7,modeWeights:{circle:0.75,herd:0.55,bait:0.1,guard:2.8,pursue:0.95},attackWeights:{coil:0.55,head:0.4,tail:2.6,body:2.8},signatureBonus:3.2,angleOffset:0.55}
};
function createState(seed=173){return {schema:'biohunter.naka.behavior.v2.7',seed:(seed>>>0)||173,mode:'observe',modeStartedAt:0,modeUntil:0,thinkingAt:0,nextAttackAt:0,setupUntil:0,lastAttackAt:-1e8,latestAttack:null,history:[],decisionCount:0,circleSide:1,lastReason:'initial observation',lastScores:[],lastAction:'move',lastTarget:null};}
function nextSeed(seed){return (Math.imul(1664525,seed)+1013904223)>>>0;}
function requireSnapshot(o){if(!o||!o.variant||!PROFILES[o.variant.id])throw new Error('known variant required');if(!o.head||!o.player||!finite(o.now)||!finite(o.head.x)||!finite(o.head.y)||!finite(o.player.x)||!finite(o.player.y))throw new Error('finite world-space observation required');if(!o.attacks||typeof o.attacks!=='object')throw new Error('attack registry required');}
function attackLegal(id,o,state){const spec=o.attacks[id],family=ATTACK_FAMILY[id],env=ENVELOPES[id],d=distance(o.head,o.player);
 if(!spec||!family||!env)return {ok:false,reason:'unknown-attack'};
 if(spec.exclusiveVariant&&spec.exclusiveVariant!==o.variant.id)return {ok:false,reason:'variant-locked'};
 if((o.cooldowns?.[id]??0)>0)return {ok:false,reason:'cooldown'};
 if(o.tailBroken&&family==='tail')return {ok:false,reason:'tail-broken'};
 if(o.headBroken&&['lunge','marsh_dive','shadow_breach'].includes(id))return {ok:false,reason:'head-broken'};
 if(d<env[0]||d>Math.min(env[1],spec.range||env[1]))return {ok:false,reason:'out-of-envelope'};
 if(o.now<(state?.nextAttackAt??0))return {ok:false,reason:'post-attack-pause'};
 if((state?.history||[]).slice(-2).some(h=>h.id===id))return {ok:false,reason:'recent-repeat'};
 if(o.phase==='stalking'&&spec.exclusiveVariant)return {ok:false,reason:'signature-phase-lock'};
 const diff=Math.abs(wrapAngle(Math.atan2(o.player.y-o.head.y,o.player.x-o.head.x)-(o.heading??0)));
 if(family==='head'&&diff>1.65&&d>45)return {ok:false,reason:'cannot-face-target'};
 // Counter actions still need to wind up; only actual observed hits unlock a counter.
 if(['counter_whip','head_tail_combo'].includes(id)&&id!==o.reactive)return {ok:false,reason:'counter-needs-evidence'};
 return {ok:true,reason:'legal'};
}
function attackScores(o,state){requireSnapshot(o);const profile=PROFILES[o.variant.id],d=distance(o.head,o.player),pattern=o.pattern||'neutral';
 const scores=[];for(const spec of Object.values(o.attacks)){const id=spec.id,family=ATTACK_FAMILY[id],leg=attackLegal(id,o,state);if(!leg.ok)continue;
 const range=ENVELOPES[id],ideal=(range[0]+range[1])*.5,span=Math.max(50,range[1]-range[0]);
 let score=3+(profile.attackWeights[family]||0)+2*(1-Math.min(1,Math.abs(d-ideal)/span));
 if(id===o.variant.signature)score+=profile.signatureBonus;
 if(id===o.reactive)score+=5.4;
 if(id===o.escapeFollowup)score+=3.4;
 if(id===o.comboNext)score+=2.4;
 if(pattern==='dodge_habit'&&['double_fang','half_coil','tail_hook'].includes(id))score+=1.2;
 if(pattern==='retreat_habit'&&['lunge','marsh_dive','tail_hook','half_coil'].includes(id))score+=1.8;
 if(pattern==='flank_pressure'&&['side_fang','tail_sweep','body_slam'].includes(id))score+=1.7;
 if(o.phase==='swamp_dominion'&&id===o.variant.signature)score+=1.3;
 if(o.phase==='encirclement'&&family==='coil')score+=.6;
 const recentFamily=state.history.slice(-2).map(h=>ATTACK_FAMILY[h.id]);
 if(recentFamily[0]===family||recentFamily[1]===family)score-=1.7;
 // All deterministic tie breakers depend on an encounter seed, never wall clock or input futures.
 const jitter=((nextSeed((state.seed^(id.length*101+id.charCodeAt(0)))>>>0)%997)/997-.5)*0.28;
 scores.push({id,score:round(score+jitter),family,reason:'range+profile+observed-pattern'});
 }
 return scores.sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id));}
function bounded(p,arena){const w=arena?.width??960,h=arena?.height??620;return {x:clamp(p.x,45,w-45),y:clamp(p.y,45,h-45)};}
function moveTarget(mode,o,state){const profile=PROFILES[o.variant.id],v=o.observedVelocity||{x:0,y:0},vel={x:clamp(v.x||0,-220,220),y:clamp(v.y||0,-220,220)},p=o.player,h=o.head;
 const a=Math.atan2(p.y-h.y,p.x-h.x),r=profile.preferredDistance,side=state.circleSide;
 const dir={x:Math.cos(a),y:Math.sin(a)},normal={x:-dir.y*side,y:dir.x*side};
 const lead={x:clamp(p.x+vel.x*.24,45,(o.arena?.width??960)-45),y:clamp(p.y+vel.y*.24,45,(o.arena?.height??620)-45)};
 let target;
 if(mode==='circle')target={x:p.x-dir.x*r+normal.x*r*.85,y:p.y-dir.y*r+normal.y*r*.85};
 else if(mode==='herd')target={x:lead.x-dir.x*r*.67+normal.x*r*.70,y:lead.y-dir.y*r*.67+normal.y*r*.70};
 else if(mode==='bait')target={x:p.x-dir.x*(r*1.25)+normal.x*58,y:p.y-dir.y*(r*1.25)+normal.y*58};
 else if(mode==='guard')target={x:p.x-dir.x*(r*.74)+normal.x*26,y:p.y-dir.y*(r*.74)+normal.y*26};
 else if(mode==='withdraw')target={x:h.x-dir.x*105+normal.x*32,y:h.y-dir.y*105+normal.y*32};
 else if(mode==='observe')target={x:h.x,y:h.y};
 else target={x:lead.x-dir.x*Math.min(65,r*.3),y:lead.y-dir.y*Math.min(65,r*.3)};
 return bounded(target,o.arena);
}
function chooseMode(o,state){const profile=PROFILES[o.variant.id],d=distance(o.head,o.player),pattern=o.pattern||'neutral',now=o.now;
 if(now<state.nextAttackAt)return {mode:'withdraw',duration:Math.min(.9,Math.max(.18,state.nextAttackAt-now)),reason:'vulnerable post-attack recovery'};
 if(state.decisionCount===0&&now<profile.observeDuration)return {mode:'observe',duration:profile.observeDuration-now,reason:'initial read of player motion'};
 if(d>260)return {mode:'pursue',duration:.68,reason:'target outside attack envelopes'};
 if(d<65)return {mode:o.variant.id==='ancient'?'guard':'withdraw',duration:.48,reason:'reposition from collision range'};
 if(o.variant.id==='marsh'){
  if(pattern==='retreat_habit')return {mode:'herd',duration:1.05,reason:'push escaping target into coil approach'};
  return {mode:d>190?'pursue': 'circle',duration:1.1,reason:'constrictor circles before committing'};
 }
 if(o.variant.id==='dusk'){
  if(d<115)return {mode:'withdraw',duration:.63,reason:'ambusher resets spacing'};
  return {mode:pattern==='dodge_habit'?'bait':'circle',duration:.75,reason:pattern==='dodge_habit'?'bait observed habitual dodge':'ambusher seeks blind-side angle'};
 }
 return {mode:d>175?'pursue':'guard',duration:1.3,reason:'guardian holds territory and punishes approach'};
}
function decide(previous,o){requireSnapshot(o);const state={...(previous||createState()),history:[...((previous?.history)||[])],lastScores:[...((previous?.lastScores)||[])]},profile=PROFILES[o.variant.id];
 if(o.busy)return {state,intent:{kind:'busy',mode:state.mode,reason:'committed attack animation cannot retarget'},ranked:[]};
 const scores=attackScores(o,state);
 const d=distance(o.head,o.player);
 // Territory controllers deliberately close to their preferred family envelope
 // rather than burning far-range attacks as soon as they become technically legal.
 const mustClose=(o.variant.id==='marsh'&&d>180)||(o.variant.id==='ancient'&&d>173);
 // Brief readable positioning between attacks. Reactive punishment still requires
 // a normal windup but can skip this optional feint once recovery is over.
 if(!mustClose&&scores.length&&o.now>=profile.observeDuration&&state.setupUntil===0){
  state.setupUntil=o.now+profile.setupDuration;
  state.modeUntil=0;
 }
 const observedCounter=scores.some(s=>s.id===o.reactive||s.id===o.escapeFollowup);
 const canAttack=!mustClose&&o.now>=state.nextAttackAt&&o.now>=profile.observeDuration&&
  (o.now>=state.setupUntil||observedCounter)&&scores.length>0;
 // No hidden probabilistic misses. Both pressure and counterplay remain deterministic.
 if(canAttack){const best=scores[0];state.lastScores=scores.slice(0,6);state.lastReason='attack '+best.id+' — '+best.reason;state.lastAction='attack';state.decisionCount++;
  return {state,intent:{kind:'attack',id:best.id,mode:state.mode,reason:state.lastReason,topScore:best.score},ranked:scores};}
 const needsPlan=o.now>=state.modeUntil||!state.lastTarget;
 if(needsPlan){const choose=chooseMode(o,state);state.mode=choose.mode;state.modeStartedAt=o.now;state.modeUntil=o.now+Math.max(.2,choose.duration);state.thinkingAt=o.now+.26;state.lastReason=choose.reason;state.decisionCount++;const changed=nextSeed(state.seed);state.seed=changed;
  if(changed%5===0)state.circleSide*=-1;
 }
 const target=moveTarget(state.mode,o,state);state.lastTarget=target;state.lastScores=scores.slice(0,6);state.lastAction='move';
 return {state,intent:{kind:'move',mode:state.mode,target,reason:state.lastReason,speedFactor:state.mode==='observe'?.15:state.mode==='guard'?.65:profile.moveSpeedFactor},ranked:scores};
}
function committed(old,id,now){const state={...old,history:[...(old.history||[]),{id,t:now}].slice(-7),lastAttackAt:now,setupUntil:0,latestAttack:id,lastAction:'attack',lastReason:'committed '+id};return state;}
function recovered(old,now,variant){const p=PROFILES[variant]||PROFILES.marsh;return {...old,nextAttackAt:now+p.commitPause,setupUntil:now+p.commitPause+p.setupDuration,mode:variant==='ancient'?'guard':'withdraw',modeStartedAt:now,modeUntil:now+p.commitPause,thinkingAt:now,lastReason:'post attack opening'};}
function snapshot(state){return {schema:state.schema,mode:state.mode,reason:state.lastReason,nextAttackAt:round(state.nextAttackAt),recent:state.history.map(h=>h.id),scores:state.lastScores.map(s=>({...s})),decisionCount:state.decisionCount};}
return {PROFILES,ATTACK_FAMILY,ENVELOPES,createState,attackLegal,attackScores,moveTarget,decide,committed,recovered,snapshot};});
;
/* ---- naka-integration-v28.js ---- */
/* BIO Hunter Naka v2.8 — Standalone monster integration adapter.
 * Reads the v2.7 behavior and v2.6 animation/collision modules, never host gameplay.
 * 2D world coordinates: +X right, +Y down, angles radians, time seconds.
 * Damage, hit immunity, projectile effects, movement steering are deliberately host-owned.
 */
(function(root,factory){
 const isNode=typeof module==='object'&&!!module.exports;
 const api=factory(isNode?require('./naka-core.js'):root.NakaCore,
                   isNode?require('./naka-animation-v26.js'):root.NakaAnimationV26,
                   isNode?require('./naka-behavior-v27.js'):root.NakaBehaviorV27);
 if(isNode)module.exports=api;
 root.NakaIntegrationV28=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(C,A,B){'use strict';
 if(!C||!A||!B)throw Error('Naka v2.8 adapter requires NakaCore, NakaAnimationV26, NakaBehaviorV27');
 const SCHEMA='biohunter.naka.integration.frame.v2.8';
 const point=p=>({x:p.x,y:p.y});
 const validPoint=p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y);
 const assertPoint=(p,label)=>{if(!validPoint(p))throw Error(label+' must have finite x,y');};
 const cloneChain=nodes=>nodes.map(point);
 const finite=(n,label)=>{if(!Number.isFinite(n))throw Error(label+' must be finite');return n;};
 function validateConfig(config){
  if(!config||!config.variants||!Array.isArray(config.attacks)||!config.rig||config.rig.nodes!==27||!config.rig.constraints||config.rig.constraints.spacing!==18)
   throw Error('v2.7 Naka config with variants, 16 attacks and rig constraints required');
  if(config.attacks.length!==16||new Set(config.attacks.map(a=>a.id)).size!==16)throw Error('Expected 16 unique attacks');
  for(const k of ['marsh','dusk','ancient'])if(!config.variants[k])throw Error('Missing variant '+k);
  return config;
 }
 function validateChain(chain){
  if(!Array.isArray(chain)||chain.length!==27||chain.some(x=>!validPoint(x)))throw Error('chain must contain exactly 27 finite world-space nodes');
  return cloneChain(chain);
 }
 function hurtboxes(chain){
  validateChain(chain);
  const caps=[];
  const segment=(i,r1,r2,part)=>({type:'capsule',part,fromIndex:i,toIndex:i+1,a:point(chain[i]),b:point(chain[i+1]),radiusA:r1,radiusB:r2});
  caps.push(segment(0,19,19,'head'));
  for(let i=1;i<23;i++)caps.push(segment(i,17,17,'trunk'));
  for(let i=23;i<26;i++){
   const r=i=>17-(i-23)*(14/3);
   caps.push(segment(i,r(i),r(i+1),'tail'));
  }
  return caps;
 }
 // v2.8 boundary synchronization: v2.6 timeline rounds stage boundaries while
 // legacy collision phase checks use unrounded sums. Avoid 1-ULP false positives /
 // missing shapes at exact active/recovery transitions without mutating v2.6 source.
 function alignCollisionStage(pose,atk,t,aim,zone){
  if(!pose.active){pose.hitbox=null;return pose;}
  if(!pose.hitbox){
   pose.hitbox=C.attackCollisionGeometry(atk.id,pose.chain,aim,t+1e-7,atk,zone)
    ||C.attackCollisionGeometry(atk.id,pose.chain,aim,t-1e-7,atk,zone);
  }
  return pose;
 }
 function createInstance({config,variant='marsh',seed=173}={}){
  validateConfig(config);
  if(!config.variants[variant])throw Error('Unknown Naka variant '+variant);
  const attackMap=Object.fromEntries(config.attacks.map(a=>[a.id,a]));
  const variantMeta={...config.variants[variant],id:variant};
  const constraints={spacing:18,maxBendRadians:.68,...config.rig.constraints};
  let brain=B.createState(seed),active=null,lastTime=-Infinity,lastFrame=null,queuedEvent=null,serial=0;
  function snapshot(){return {schema:'biohunter.naka.integration.state.v2.8',variant,active:active?{id:active.id,startedAt:active.startedAt,aim:active.aim,target:point(active.target),sequence:active.sequence}:null,lastTime:Number.isFinite(lastTime)?lastTime:null,brain:B.snapshot(brain)};}
  function beginAttack(id,{now,chain,heading=0,target,tailBroken=false,headBroken=false}={}){
   finite(now,'now');finite(heading,'heading');if(now<lastTime)throw Error('non-monotonic time');
   if(active)throw Error('attack already in progress');
   const raw=attackMap[id];if(!raw)throw Error('Unknown attack '+id);
   if(raw.exclusiveVariant&&raw.exclusiveVariant!==variant)throw Error('Attack variant lock: '+id);
   if(tailBroken&&B.ATTACK_FAMILY[id]==='tail')throw Error('Tail broken: '+id);
   if(headBroken&&['lunge','marsh_dive','shadow_breach'].includes(id))throw Error('Head broken: '+id);
   const base=C.solveSpineConstraints(validateChain(chain),constraints);
   assertPoint(target,'target');
   const atk=C.variantAttack(raw,variantMeta);
   const zone=C.pressureZone(id,base[0],target);
   active={id,atk,startedAt:now,aim:heading,target:point(target),base,zone,sequence:++serial};
   brain=B.committed(brain,id,now);
   queuedEvent={type:'attack_started',id,time:now,sequence:serial,target:point(target),aim:heading};
   return snapshot();
  }
  function poseAt(a,t){
   const pose=A.samplePose(a.base,a.atk,t,{aim:a.aim,center:a.target,zone:a.zone,includeRootMotion:true,transitionFrom:a.base,constraints});
   return alignCollisionStage(pose,a.atk,t,a.aim,a.zone);
  }
  function interrupt(now){
   finite(now,'now');if(now<lastTime)throw Error('non-monotonic time');
   if(!active)return false;
   const id=active.id,sequence=active.sequence;active=null;
   brain=B.recovered(brain,now,variant);
   queuedEvent={type:'attack_interrupted',id,time:now,sequence};
   return true;
  }
  function step(o){
   if(!o)throw Error('observation required');
   const now=finite(o.now,'now');if(now<lastTime)throw Error('non-monotonic time');
   const chain=validateChain(o.chain);assertPoint(o.player,'player');
   const heading=finite(o.heading,'heading');
   const arena=o.arena||{width:960,height:620};
   if(!Number.isFinite(arena.width)||!Number.isFinite(arena.height)||arena.width<100||arena.height<100)throw Error('finite positive arena required');
   const events=queuedEvent?[queuedEvent]:[];queuedEvent=null;
   let intent={kind:'busy',reason:'active attack'},pose,attack=null;
   if(active&&now>=active.startedAt+A.duration(active.atk)){
    const old=active;const doneAt=old.startedAt+A.duration(old.atk);
    brain=B.recovered(brain,doneAt,variant);
    events.push({type:'attack_finished',id:old.id,time:doneAt,sequence:old.sequence});
    active=null;
    // No new attack in same update; the host integrates final root/rig pose before next tick.
    const final=poseAt(old,A.duration(old.atk));
    pose={...final,hitbox:null,active:false,stage:'done'};
    intent={kind:'recovery',reason:'animation completed; post-attack pause'};
   }else if(active){pose=poseAt(active,now-active.startedAt);}
   else {
    if(o.observedVelocity!==undefined)assertPoint(o.observedVelocity,'observedVelocity');
    const observation={now,variant:variantMeta,attacks:attackMap,head:chain[0],player:point(o.player),heading,
      observedVelocity:o.observedVelocity||{x:0,y:0},arena,phase:o.phase||'stalking',pattern:o.pattern||'neutral',
      cooldowns:o.cooldowns||{},tailBroken:!!o.tailBroken,headBroken:!!o.headBroken,
      reactive:o.reactive||null,escapeFollowup:o.escapeFollowup||null,comboNext:o.comboNext||null};
    const decision=B.decide(brain,observation);brain=decision.state;intent={...decision.intent};
    if(intent.kind==='attack'){
     beginAttack(intent.id,{now,chain,heading,target:o.player,tailBroken:o.tailBroken,headBroken:o.headBroken});
     events.push(queuedEvent);queuedEvent=null;
     pose=poseAt(active,0);
    }else pose={chain:C.solveSpineConstraints(chain,constraints),hitbox:null,stage:'idle',active:false,rootTravel:0,telegraph:null};
   }
   if(active){attack={id:active.id,sequence:active.sequence,elapsed:Math.max(0,now-active.startedAt),duration:A.duration(active.atk),phase:pose.stage,
      aim:active.aim,target:point(active.target),zone:active.zone?{...active.zone}:null,attackSpec:{...active.atk},rootTravel:pose.rootTravel};}
   const output={schema:SCHEMA,variant,at:now,kind:active?'attack':intent.kind,behavior:{mode:brain.mode,reason:brain.lastReason},intent,
     attack,stage:pose.stage,active:!!pose.active,telegraph:pose.telegraph||null,
     nodes:cloneChain(pose.chain),hurtboxes:hurtboxes(pose.chain),hitbox:pose.active?pose.hitbox:null,
     events,collisionAuthority:'naka-core.js.attackCollisionGeometry',
     rootMotionPolicy:'root travel is already baked into nodes; do not reapply'};
   lastTime=now;lastFrame=output;return output;
  }
  function getLastFrame(){return lastFrame?JSON.parse(JSON.stringify(lastFrame)):null;}
  return {variant,step,beginAttack,interrupt,snapshot,getLastFrame};
 }
 function sweptContact(previous,current,previousPlayer,currentPlayer,playerRadius=11){
  if(!previous?.attack||!current?.attack||previous.variant!==current.variant||previous.attack.sequence!==current.attack.sequence||previous.attack.id!==current.attack.id)
   return {hit:false,samples:0,reason:'different attack or missing prior frame'};
  return sweptContactWithSpec(previous,current,previousPlayer,currentPlayer,current.attack.attackSpec,current.attack.zone,playerRadius);
 }
 function sweptContactWithSpec(previous,current,previousPlayer,currentPlayer,attackSpec,zone=null,playerRadius=11){
  if(!previous?.attack||!current?.attack||previous.variant!==current.variant||previous.attack.sequence!==current.attack.sequence||previous.attack.id!==current.attack.id)
   return {hit:false,samples:0,reason:'different attack or missing prior frame'};
  if(!attackSpec||attackSpec.id!==current.attack.id)throw Error('matching variant-adjusted attackSpec required');
  if(current.at<previous.at)throw Error('frames must be monotonic');
  assertPoint(previousPlayer,'previousPlayer');assertPoint(currentPlayer,'currentPlayer');
  return C.sweptAttackContact(attackSpec.id,previous.nodes,current.nodes,previousPlayer,currentPlayer,current.attack.aim,
    previous.attack.elapsed,current.attack.elapsed,attackSpec,zone,playerRadius);
 }
 function sampleManual({config,variant,id,chain,target,heading=0,elapsed=0}){
  validateConfig(config);validateChain(chain);assertPoint(target,'target');finite(elapsed,'elapsed');finite(heading,'heading');
  const v=config.variants[variant],raw=config.attacks.find(a=>a.id===id);
  if(!v||!raw||raw.exclusiveVariant&&raw.exclusiveVariant!==variant)throw Error('Invalid variant/attack pairing');
  const atk=C.variantAttack(raw,{...v,id:variant});
  const base=C.solveSpineConstraints(cloneChain(chain),{spacing:18,maxBendRadians:.68,...config.rig.constraints});
  const zone=C.pressureZone(id,base[0],target);
  const t=Math.max(0,Math.min(elapsed,A.duration(atk)));
  const pose=alignCollisionStage(A.samplePose(base,atk,t,{aim:heading,center:target,zone,includeRootMotion:true,transitionFrom:base,constraints:config.rig.constraints}),atk,t,heading,zone);
  return {stage:pose.stage,active:pose.active,nodes:pose.chain,hitbox:pose.active?pose.hitbox:null,hurtboxes:hurtboxes(pose.chain),telegraph:pose.telegraph,duration:A.duration(atk),attackSpec:atk};
 }
 return {SCHEMA,createInstance,validateConfig,validateChain,hurtboxes,sweptContact,sweptContactWithSpec,sampleManual};
});
;
/* ---- naka-config-browser-v28.js ---- */
/* Generated from naka-config.json; offline browser compatibility */
(function(r){r.NakaConfigV28={"schema":"biohunter.naka.lab.v2.7","sourceReference":"Mossplate v1.2; mechanics independently designed","camera":"2d-topdown","forward":"+X","notIntegratedIntoGame":true,"rig":{"type":"length-and-bend-constrained-serpentine-follow-and-coil","nodes":27,"spacing":18,"headRadius":19,"bodyRadius":17,"tailRadius":3,"maxTurnRate":2.65,"nominalSpineLength":468,"coilCenterPolicy":"player-position-at-windup","coilRadius":95.26,"constraints":{"spacing":18,"maxBendRadians":0.68,"headAnchor":"preserve-source-head","application":"after pose deformation, before swept collision and rendering","coordinates":"world-space (2D top-down)","solver":"deterministic head-to-tail forward kinematic projection"}},"combat":{"hp":850,"playerHp":120,"playerSpeed":220,"playerDodgeSpeed":580,"playerDodgeDuration":0.25,"playerDodgeIframes":0.23,"monsterSpeed":121,"arena":[960,620],"coilBodyCollision":{"activeOnly":true,"playerRadius":11,"bodyCapsuleRadius":13,"escapeGapRadians":1.36},"halfCoilSweepRadians":2.75},"attacks":[{"id":"bite","windup":0.42,"active":0.16,"recovery":0.58,"range":104,"damage":12,"shape":"front","counterplay":"Dodge sideways during forward jaw lift"},{"id":"tail_sweep","windup":0.72,"active":0.29,"recovery":0.88,"range":155,"damage":16,"shape":"rear","counterplay":"Move toward the head or dodge past the tail"},{"id":"coil_trap","windup":1.15,"active":0.55,"recovery":1.3,"range":150,"damage":23,"shape":"ring","counterplay":"Leave the visibly open ring gap before closure"},{"id":"lunge","windup":0.88,"active":0.22,"recovery":1,"range":225,"damage":19,"shape":"front","counterplay":"Sidestep the committed direction"},{"id":"body_slam","windup":0.78,"active":0.28,"recovery":0.92,"range":135,"damage":16,"shape":"side","counterplay":"Back away from flank indicator"},{"id":"marsh_dive","windup":1.1,"active":0.3,"recovery":1.25,"range":250,"damage":17,"shape":"front","counterplay":"Follow bubbles; move away before resurfacing"},{"id":"half_coil","windup":1.05,"active":0.65,"recovery":1.3,"range":185,"damage":19,"shape":"half-ring-segment-capsules","counterplay":"Wide open side; escape around free flank before ring closes; punish recovery"},{"id":"counter_whip","windup":0.7,"active":0.27,"recovery":1.05,"range":165,"damage":17,"shape":"tail-capsules","counterplay":"Retreat toward head; counter after full tail recovery"},{"id":"head_tail_combo","windup":0.68,"active":0.22,"recovery":1.89,"range":165,"damage":14,"shape":"head-then-tail","counterplay":"Sidestep head, reposition through 0.32s escape window before tail telegraph"},{"id":"side_fang","windup":0.63,"active":0.22,"recovery":0.85,"range":120,"damage":15,"shape":"offset-head-bite","counterplay":"Step outside the marked 55-degree flank. Direction locks at windup."},{"id":"double_fang","windup":0.6,"active":0.2,"recovery":1.3,"range":117,"damage":11,"shape":"two-bites","secondWindup":0.47,"secondActive":0.2,"escapeWindow":0.34,"counterplay":"Dodge first bite, change side in the 0.34s gap; second bite has a fresh warning."},{"id":"tail_hook","windup":0.84,"active":0.34,"recovery":1.1,"range":175,"damage":18,"shape":"curved-tail-swipe","counterplay":"Tail curls first; leave distal-tail arc or enter toward head to punish."},{"id":"constrict_pulse","windup":1.34,"active":0.34,"recovery":1.44,"range":160,"damage":21,"shape":"coil-capsules-pulse","counterplay":"A bright opening remains in the ring; roll through gap before pulse; break during recovery."},{"id":"double_coil","windup":1.42,"active":0.38,"recovery":1.55,"range":160,"damage":21,"shape":"ring","counterplay":"Escape outward through the open gap; strike after uncoil","exclusiveVariant":"marsh"},{"id":"shadow_breach","windup":1.02,"active":0.26,"recovery":1.22,"range":230,"damage":21,"shape":"front","counterplay":"See bubbles at locked breach target; evade sideways","exclusiveVariant":"dusk"},{"id":"titan_bodywave","windup":1.2,"active":0.48,"recovery":1.6,"range":185,"damage":26,"shape":"side","counterplay":"Clear the winding broad body path or dodge through first wave","exclusiveVariant":"ancient"}],"parts":{"headDurability":100,"tailDurability":80,"playerAttackDamage":24,"playerAttackRange":76,"playerAttackArcRadians":1.25,"attackCooldown":0.42},"version":"2.7","aiMovement":{"steering":"acceleration-limited heading interpolation","maxTurnRateRadPerSecond":1.7,"accelerationUnitsPerSecond2":185,"topSpeedUnitsPerSecond":122,"predictionHorizonSeconds":0.85,"leadFactor":0.72,"playerVelocityObservedNotFutureInput":true,"flanking":"side-offset target with bounded steering, periodically re-evaluated side"},"reactiveAI":{"memorySeconds":4.2,"rearThreshold":2,"flankThreshold":2,"counterCooldown":5.5,"minTelegraphSeconds":0.6,"comboEscapeWindowSeconds":0.32,"noInstantRetarget":true},"strikeAnimation":{"headJabUnits":17,"tailArcRadians":1.25,"tailPivotJointFromEnd":10,"collisionAfterPose":true,"comboSeparateHitWindows":true},"newAttackDesign":{"side_fang":"flank locked head turn","double_fang":"two hit windows with second separately telegraphed","tail_hook":"tail arcs across retreat lane","constrict_pulse":"narrow coiling pulse around locked target"},"adaptiveAI":{"patterns":["dodge_habit","retreat_habit","flank_pressure","neutral"],"observationSeconds":7,"phaseHpBoundaries":[0.66,0.32],"phaseRules":"stalking / encirclement / swamp_dominion","comboEscapeBetweenAttacksSeconds":0.55,"attacksAreCommittedAtWindup":true,"aiDoesNotReadFutureInputs":true,"noRepeatedRecentAttackPreference":true},"variants":{"marsh":{"name":"Marsh Naka","title":"บึงรัดเหยื่อ","color":"#79955b","mark":"#c5c584","belly":"#a7b780","eye":"#f4d77c","hp":850,"speed":122,"turnRate":1.7,"headDurability":100,"tailDurability":80,"damageMultiplier":1,"cooldownMultiplier":1,"windupMultiplier":1,"signature":"double_coil","preferred":["double_coil","half_coil","coil_trap","constrict_pulse"],"fallback":"body_slam","description":"Balanced constrictor: controls routes with coils. Escape through the visible gap.","silhouette":"layered-coil bands"},"dusk":{"name":"Dusk Naka","title":"เงาลุ่มน้ำ","color":"#4c6788","mark":"#9ab8c3","belly":"#678c9c","eye":"#e8a7a0","hp":730,"speed":144,"turnRate":2.05,"headDurability":80,"tailDurability":65,"damageMultiplier":0.92,"cooldownMultiplier":0.91,"windupMultiplier":1,"signature":"shadow_breach","preferred":["shadow_breach","marsh_dive","lunge","double_fang"],"fallback":"side_fang","description":"Fast ambusher: bait its committed lunge; lower armor and shorter recovery.","silhouette":"streamlined narrow head and fins"},"ancient":{"name":"Ancient Naka","title":"อสรพิษบรรพกาล","color":"#98794c","mark":"#d6be80","belly":"#b6a17a","eye":"#f0dc9d","hp":1120,"speed":99,"turnRate":1.32,"headDurability":135,"tailDurability":110,"damageMultiplier":1.13,"cooldownMultiplier":1.15,"windupMultiplier":1.13,"signature":"titan_bodywave","preferred":["titan_bodywave","tail_hook","tail_sweep","body_slam"],"fallback":"half_coil","description":"Heavy territorial guardian: stronger tail pressure, longer readable windups.","silhouette":"heavy plated dorsal ridges"}},"variantRules":{"switchPolicy":"reset encounter when variant changed","headAndTailBreak":"part durability taken from active variant","aiPolicy":"prefer signature attack only when in legal range and cooldown available; fallback original tactical AI","notIntegratedIntoGame":true,"signatureAttacks":"Exclusive per-variant attacks; telegraphed and no instant damage"},"signaturePressureV14":{"coverage":"phase 2+ signature prioritized when legal; approach distance for Dusk; fixed-target pressure zones","escape":"disc/ring with a gap/telegraphed lane; dodge i-frame available","noRetargetDuringWindup":true},"visualRework":{"focus":"living-silhouette-and-motion","bodyRendering":"continuous ribbon mesh with tapered width profile","headDesign":"distinct python skull, jawline, eyes, nostrils and optional tongue flick","microMotion":["idle breathing","head scanning","traveling S-curve slither"],"variantSilhouette":{"marsh":"banded dorsal arcs and broader constrictor mid-body","dusk":"streamlined narrow head with side crests","ancient":"heavier dorsal ridges and thicker trunk"},"gameplayNote":"visual-only rework; core combat logic preserved in sandbox"},"artAssetManifest":"assets/asset-manifest.json","artPassV18":{"overlapPolicy":"tail-to-head, opaque asset tiles, length 1.84x spacing","poses":["idle","slither","coil","strike","recover"],"note":"Runtime pose selection, progressive deformation; not final production frames"},"animationInspector":{"states":["idle","slither","coil","strike","recover"],"duration":4,"scrubStep":0.01,"visualOnly":true,"variants":["marsh","dusk","ancient"]},"continuousBodyV20":{"spline":"centripetal-inspired Catmull-Rom sampled 5x per joint interval","surface":"single tapered ribbon, no tiled trunk sprites","pattern":"distance along spline","occlusion":"localized crossing shadow; approximate visual depth","combatGeometry":"unchanged spine capsules; requires human hitbox review"},"combatAnimationV21":{"goal":"continuous attack motion from anticipation to recovery","travelCurve":"smooth anticipation -> thrust -> follow-through","headAttacks":["bite","side_fang","double_fang","head_tail_combo","lunge","marsh_dive","shadow_breach"],"lungeTravelUses":"displacement delta from profile, not fixed active-frame velocity","renderNote":"visual pose now bends front-body into S-neck during anticipation and recoil"},"impactReadabilityV22":{"attackFamilies":["head","tail","coil"],"visualTelegraph":"attack-specific line, arc, or target circle","impactFX":"damage-triggered, non-damaging, 0.26s","hitWindows":"unchanged from v2.1"},"animationHitboxV23":{"head":"active-frame capsule from animated logical head","tail":"capsule chain following animated tail joints","debug":"toggle cyan hitboxes in combat canvas","caveat":"signature hazards and non-contact areas preserve legacy targeting"},"collisionAuditV24":{"substeps":"max 5 world units per substep or 12 ms, up to 96 interpolation samples per update","sharedGeometry":"single attackCollisionGeometry + attackShapeContains for debug and gameplay","active":"damage only within attack active windows including their trailing boundary","singleHit":"one registered hit or dodged contact per active window","fixed":["lunge and marsh_dive deal collision damage","body_slam contact","coil_trap/half_coil body contact","constrict_pulse over entire active window","double_coil closure and safe-gap alignment","shadow_breach locked disc through active window","titan_bodywave moving lane wave through active window"],"signatureGeometry":"world-space telegraphed hazard, not always actual articulated snake contact","coilBodyPush":"resolved after swept damage so separation cannot erase collision","limitations":["maximum 96 interpolation samples per step","visual sprite head may not exactly match logical capsule","browser playtesting still required"]},"spineIntegrityV25":{"designScope":"sandbox only (no main game modifications)","rigNodes":27,"enforcedRestSegmentLength":18,"maximumLocalBendRadians":0.68,"visualCollisionPolicy":"attack visuals, hurtbox, and debug use constrained live rig; idle preview is visual-only","phasePreservation":"all 16 v2.4 attacks, cooldowns and AI untouched","renderPolicy":"attack phases draw authoritative constrained chain; combat rig checksum in HUD","knownLimitations":["one-pass kinematic projection, not momentum-aware IK","body surface spline may still deviate slightly from centerline capsule","hazard effects world-space independent from skin","requires browser frame/hand QA"]},"attackAnimationProductionV26":{"authoring":"single 16-attack procedural animation sampler, includes every legal variant retimed by variantAttack","rig":"27 joint 2D top-down unchanged from v2.5","timeline":"6 phases for two-hit attacks; fixed phase end of head_tail_combo; immutable direction during committed attack","rootMotion":"explicit channel, applied by runtime to head; baked in local-space clip","collision":"same constrained joints feed runtime damage checks, debug overlay and exported hitbox","transitions":"0.12 second eased entry from live attack start rig; only during harmless windup","limitations":["frame-level 60Hz reference export; moving targets require live procedural sample","signature world-space hazards are effects, not physical body skin","real browser/mobile playtests pending"],"manifest":"assets/clips-v26/manifest.json","hurtboxProfile":"assets/hurtbox-profile-v26.json"},"behaviorControllerV27":{"module":"naka-behavior-v27.js","scope":"offline sandbox; no main-game changes","arbitration":"scored legal choices with deterministic tie breaks, observes velocity/history only; decisions commit at telegraph","modes":["observe","pursue","circle","herd","bait","guard","withdraw"],"profileDifferences":{"marsh":"constrictor / herding / coil range","dusk":"mobile ambusher / lateral positioning / rushes","ancient":"territorial heavy / guarding / tail-body strikes"},"limits":["not trained AI","no predictive future input","attacks and contact remain v2.6","browser + real device manual QA required"],"inspection":"Behavior Inspector with legacy A/B and decision snapshots"}};})(typeof globalThis!=="undefined"?globalThis:this);
;
/* ---- naka-locomotion-v29.js ---- */
/* BIO Hunter / Naka v2.9: deterministic top-down living spine locomotion.
 * Uses past head positions only. Never edits the host game or original Naka Core.
 * Output rig is authoritative for drawing AND hurtboxes; no visual-only offsets.
 */
(function(root,factory){const api=factory(typeof module==='object'&&module.exports?require('./naka-core.js'):root.NakaCore);if(typeof module==='object'&&module.exports)module.exports=api;root.NakaLocomotionV29=api;})(typeof globalThis!=='undefined'?globalThis:this,function(C){'use strict';
 const copy=p=>({x:p.x,y:p.y}),clamp=C.clamp;
 const PROFILES=Object.freeze({
  marsh:Object.freeze({amplitude:5.2,waveLength:112,bodyLag:.68,referenceSpeed:122,accelerationTime:.23}),
  dusk:Object.freeze({amplitude:7.5,waveLength:96,bodyLag:.81,referenceSpeed:144,accelerationTime:.17}),
  ancient:Object.freeze({amplitude:3.0,waveLength:148,bodyLag:.51,referenceSpeed:99,accelerationTime:.34})
 });
 const assertRig=chain=>{if(!Array.isArray(chain)||chain.length!==27||chain.some(p=>!p||!Number.isFinite(p.x)||!Number.isFinite(p.y)))throw Error('Naka locomotion requires 27 finite 2D joints');};
 const point=p=>{if(!p||!Number.isFinite(p.x)||!Number.isFinite(p.y))throw Error('finite head point required');return copy(p);};
 function cleanTrail(chain){return chain.map(copy);}
 function create(chain,{variant='marsh',spacing=18,maxBendRadians=.68}={}){
  assertRig(chain);if(!PROFILES[variant])throw Error('Unknown Naka variant '+variant);
  if(!(spacing>0)||!(maxBendRadians>0&&maxBendRadians<=Math.PI))throw Error('invalid rig constraints');
  const pose=C.solveSpineConstraints(chain,{spacing,maxBendRadians});
  return {variant,spacing,maxBendRadians,chain:pose,trail:cleanTrail(pose),wavePhase:0,envelope:0,distance:0,frames:0,transition:'ready'};
 }
 function trimTrail(trail,minLength){let len=0;const out=[trail[0]];
  for(let i=1;i<trail.length;i++){
   const lenSeg=C.dist(trail[i-1],trail[i]);if(lenSeg<1e-7)continue;
   if(len+lenSeg>minLength){const k=(minLength-len)/lenSeg;out.push({x:trail[i-1].x+(trail[i].x-trail[i-1].x)*k,y:trail[i-1].y+(trail[i].y-trail[i-1].y)*k});break;}
   out.push(trail[i]);len+=lenSeg;
  }
  return out;
 }
 function compressTrail(arr,gap=4){
  const result=[arr[0]];
  for(let i=1;i<arr.length-1;i++)if(C.dist(result[result.length-1],arr[i])>=gap)result.push(arr[i]);
  if(C.dist(result[result.length-1],arr[arr.length-1])>1e-8)result.push(arr[arr.length-1]);
  return result;
 }
 function sampledSpine(trail,count,spacing){const out=[copy(trail[0])];let cursor=0,used=0;
  for(let i=1;i<count;i++){
   const at=i*spacing;
   while(cursor<trail.length-2&&used+C.dist(trail[cursor],trail[cursor+1])<at-1e-8){used+=C.dist(trail[cursor],trail[cursor+1]);cursor++;}
   const a=trail[cursor],b=trail[Math.min(cursor+1,trail.length-1)],span=C.dist(a,b);const k=span?clamp((at-used)/span,0,1):0;
   out.push({x:a.x+(b.x-a.x)*k,y:a.y+(b.y-a.y)*k});
  }
  return out;
 }
 // A teleport is a world-space reset, not a single enormous locomotion update.
 function reseed(state,posedChain){assertRig(posedChain);
  const pose=C.solveSpineConstraints(posedChain,{spacing:state.spacing,maxBendRadians:state.maxBendRadians});
  return {...state,chain:pose,trail:cleanTrail(pose),envelope:0,transition:'attack-return'};
 }
 function advance(state,{head,dt,speed=0,mode='travel'}={}){
  const h=point(head);if(!Number.isFinite(dt)||dt<0||dt>.12)throw Error('dt must be finite seconds in [0, 0.12]; substep large host ticks');
  if(!Number.isFinite(speed)||speed<0)throw Error('speed must be finite and nonnegative');
  const allowed=['travel','idle','recover'];if(!allowed.includes(mode))throw Error('unknown movement mode');
  if(C.dist(h,state.chain[0])>85)throw Error('locomotion teleport detected: call reseed() first');
  const travel=C.dist(h,state.trail[0]),segments=Math.max(1,Math.ceil(travel/5));const newTrail=[];
  if(travel>1e-8)for(let i=segments;i>=1;i--){const u=i/segments;newTrail.push({x:state.trail[0].x+(h.x-state.trail[0].x)*u,y:state.trail[0].y+(h.y-state.trail[0].y)*u});}
  newTrail.push(...state.trail);newTrail[0]=h;
  const trail=compressTrail(trimTrail(newTrail,(state.chain.length-1)*state.spacing+state.spacing*2));
  const base=sampledSpine(trail,state.chain.length,state.spacing),profile=PROFILES[state.variant];
  const desired=mode==='idle'?0:clamp(speed/profile.referenceSpeed,0,1.35);
  const envelope=dt===0?state.envelope:state.envelope+(desired-state.envelope)*clamp(dt/profile.accelerationTime,0,1);
  const phase=state.wavePhase+(travel/profile.waveLength)*Math.PI*2;
  // Lateral travelling wave is carried by actual root movement, not elapsed wall time.
  // Local offsets taper to zero at head/tail. Projection fixes joint lengths/bend.
  const displaced=base.map((p,i)=>{
   if(i===0)return p;
   const before=base[Math.max(0,i-1)],after=base[Math.min(base.length-1,i+1)];
   const dx=after.x-before.x,dy=after.y-before.y,mag=Math.hypot(dx,dy)||1;
   const taper=Math.pow(Math.max(0,Math.sin(Math.PI*i/(base.length-1))),1.18);
   const sway=profile.amplitude*envelope*taper*Math.sin(phase-i*profile.bodyLag);
   return {x:p.x-dy/mag*sway,y:p.y+dx/mag*sway};
  });
  // Angular-rate limiting avoids discrete IK flips when a polyline segment moves
  // past a joint. This also makes recovery from tightly coiled poses continuous.
  const desiredPose=C.solveSpineConstraints(displaced,{spacing:state.spacing,maxBendRadians:state.maxBendRadians});
  const chain=[h];let lastAngle=null;
  for(let i=1;i<desiredPose.length;i++){
   const prevAngle=Math.atan2(state.chain[i].y-state.chain[i-1].y,state.chain[i].x-state.chain[i-1].x);
   const targetAngle=Math.atan2(desiredPose[i].y-desiredPose[i-1].y,desiredPose[i].x-desiredPose[i-1].x);
   const maxRate=1.7*dt;
   let theta=prevAngle+clamp(C.wrapAngle(targetAngle-prevAngle),-maxRate,maxRate);
   if(lastAngle!==null)theta=lastAngle+clamp(C.wrapAngle(theta-lastAngle),-state.maxBendRadians,state.maxBendRadians);
   const p=chain[i-1];chain.push({x:p.x+Math.cos(theta)*state.spacing,y:p.y+Math.sin(theta)*state.spacing});
   lastAngle=theta;
  }
  return {...state,chain,trail,wavePhase:phase,envelope,distance:state.distance+travel,frames:state.frames+1,transition:'ready'};
 }
 function inspect(state){const m=C.spineIntegrity(state.chain,state.spacing);return {variant:state.variant,frames:state.frames,distance:+state.distance.toFixed(3),wavePhase:+state.wavePhase.toFixed(3),movementEnvelope:+state.envelope.toFixed(3),trailPoints:state.trail.length,spacingError:m.maxSpacingError,maxBendRadians:m.maxBendRadians,transition:state.transition};}
 return {PROFILES,create,advance,reseed,inspect};
});
;
/* ---- naka-creature-v30.js ---- */
/* BIO Hunter Naka v3.0: deterministic creature expressions + restrained neck articulation.
 * Add-on to v2.9; same authoritative 27-node rig goes to draw AND hurtboxes.
 * Combat, damage, locomotion path, 16 attack clips and host game are unchanged.
 */
(function(root,factory){const node=typeof module==='object'&&!!module.exports;
 const api=factory(node?require('./naka-core.js'):root.NakaCore);
 if(node)module.exports=api;root.NakaCreatureV30=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(C){'use strict';
 if(!C)throw Error('NakaCreatureV30 requires NakaCore');
 const clamp=C.clamp,wrap=C.wrapAngle,copy=p=>({x:p.x,y:p.y});
 const PROFILES=Object.freeze({
  marsh:Object.freeze({breathPeriod:3.55,breath:0.043,scanPeriod:4.8,scan:0.041,attention:0.070,headYaw:0.11,pain:0.048,settle:0.27}),
  dusk:Object.freeze({breathPeriod:2.5,breath:0.022,scanPeriod:2.75,scan:0.064,attention:0.105,headYaw:0.16,pain:0.058,settle:0.19}),
  ancient:Object.freeze({breathPeriod:4.75,breath:0.055,scanPeriod:6.2,scan:0.023,attention:0.044,headYaw:0.07,pain:0.026,settle:0.43})
 });
 const WEIGHTS=[0,0.95,0.82,0.25,-0.74,-0.9,-0.42,0.04];
 function rig(chain){if(!Array.isArray(chain)||chain.length!==27||chain.some(p=>!p||!Number.isFinite(p.x)||!Number.isFinite(p.y)))throw Error('27 finite nodes required');return chain;}
 function create(chain,{variant='marsh',spacing=18,maxBendRadians=.68}={}){
  rig(chain);if(!PROFILES[variant])throw Error('unknown variant');
  if(!(spacing>0)||!(maxBendRadians>0&&maxBendRadians<=Math.PI))throw Error('invalid constraints');
  return {variant,spacing,maxBendRadians,time:0,attention:0,neckBias:0,headShock:0,trunkShock:0,tailShock:0,shockAge:99,breathPhase:0,frames:0,mode:'idle',chain:chain.map(copy),cues:Object.freeze({headYaw:0,breath:0,tongue:0,blink:0,pain:0,eyeAlert:0}),lastHit:null};
 }
 function hit(state,{part,amount=24}={}){
  if(!['head','trunk','tail'].includes(part))throw Error('part must be head, trunk or tail');
  if(!Number.isFinite(amount)||amount<0)throw Error('amount must be finite nonnegative');
  const shock=clamp(amount/50,0,1);
  return {...state,[part+'Shock']:Math.max(state[part+'Shock'],shock),shockAge:0,lastHit:part};
 }
 function neckArticulation(chain,delta,spacing,maxBendRadians,tailTwitch=0){
  if(Math.abs(delta)<1e-8)return chain.map(copy);
  const out=[copy(chain[0])];
  for(let i=1;i<chain.length;i++){
   const a=chain[i-1],b=chain[i],theta=Math.atan2(b.y-a.y,b.x-a.x)+(WEIGHTS[i]||0)*delta+(i>=22?Math.sin((i-21)*.65)*tailTwitch:0);
   const prev=out[i-1];out.push({x:prev.x+Math.cos(theta)*spacing,y:prev.y+Math.sin(theta)*spacing});
  }
  return C.solveSpineConstraints(out,{spacing,maxBendRadians});
 }
 function advance(state,{chain,target,dt,speed=0,mode='idle',headBroken=false,tailBroken=false}={}){
  rig(chain);if(!Number.isFinite(dt)||dt<0||dt>.12)throw Error('dt must be finite in [0,.12]');
  if(!Number.isFinite(speed)||speed<0)throw Error('finite nonnegative speed required');
  if(!['idle','travel','recover','attack'].includes(mode))throw Error('unknown creature mode');
  if(!target||!Number.isFinite(target.x)||!Number.isFinite(target.y))throw Error('finite target required');
  const p=PROFILES[state.variant],time=state.time+dt,forward=Math.atan2(chain[0].y-chain[1].y,chain[0].x-chain[1].x);
  const bearing=Math.atan2(target.y-chain[0].y,target.x-chain[0].x);
  const dist=Math.hypot(target.x-chain[0].x,target.y-chain[0].y);
  const focus=clamp(1-dist/450,0,1)*(headBroken?0.45:1);
  const aim=clamp(wrap(bearing-forward),-1,1);
  const desired=aim*focus;
  const attention=state.attention+(desired-state.attention)*(dt===0?0:1-Math.exp(-dt/(p.settle*(mode==='recover'?1.6:1))));
  const headShock=state.headShock*Math.exp(-dt*3.7),trunkShock=state.trunkShock*Math.exp(-dt*3.0),tailShock=state.tailShock*Math.exp(-dt*2.6);
  const shockAge=state.shockAge+dt;
  const pulse=Math.sin(time*2*Math.PI/p.breathPeriod);
  const travelFade=1-clamp(speed/200,0,.8);
  const scan=Math.sin(time*2*Math.PI/p.scanPeriod)*(mode==='travel'?.36:1);
  const painRecoil=Math.sin(shockAge*18)*headShock;
  const desiredBias=clamp((scan*p.scan+attention*p.attention+painRecoil*p.pain)*travelFade,-.13,.13);
  // The attack chain MUST be bitwise unchanged. A damaging hit never shifts strike collision.
  const neckBias=mode==='attack'?0:state.neckBias+(desiredBias-state.neckBias)*(dt===0?0:1-Math.exp(-dt/.14));
  const tailTwitch=tailShock*Math.sin(shockAge*16)*.045*(tailBroken?.4:1);
  const posed=mode==='attack'?chain.map(copy):neckArticulation(chain,neckBias,state.spacing,state.maxBendRadians,tailTwitch);
  const breath=clamp(p.breath*pulse*(mode==='attack'?.25:travelFade),-.08,.08);
  const blinkCenter=Math.sin(time*(state.variant==='dusk'?3.65:2.45)+.5);
  const blink=Math.max(0,(blinkCenter-.972)/.028);
  const tongueValue=Math.sin(time*(state.variant==='dusk'?8.0:5.2)+(state.variant==='ancient'?1.4:0));
  const tongue=mode==='attack'?0:clamp((tongueValue-.68)/.32,0,1)*(0.5+focus*.5);
  const cues=Object.freeze({headYaw:mode==='attack'?0:clamp(attention*p.headYaw+scan*.45*p.scan+painRecoil*.035,-.18,.18),
   breath,tongue,blink,pain:clamp(Math.max(headShock,trunkShock,tailShock),0,1),eyeAlert:focus,headWound:!!headBroken,tailWound:!!tailBroken,
   headPain:headShock,tailPain:tailShock,trunkPain:trunkShock});
  return {...state,time,attention,neckBias,headShock,trunkShock,tailShock,shockAge,breathPhase:pulse,frames:state.frames+1,mode,chain:posed,cues};
 }
 function inspect(state){return {variant:state.variant,frames:state.frames,mode:state.mode,neckBias:+state.neckBias.toFixed(6),attention:+state.attention.toFixed(5),shock:+Math.max(state.headShock,state.trunkShock,state.tailShock).toFixed(5),lastHit:state.lastHit,headYaw:state.cues.headYaw,breathing:state.cues.breath,blink:state.cues.blink,tongue:state.cues.tongue};}
 return {PROFILES,create,hit,advance,inspect,neckArticulation};
});
;
/* ---- naka-reactions-v31.js ---- */
/* BIO Hunter — Naka v3.1 Advanced Creature Reactions.
 * Independent and deterministic cosmetic reaction layer. Never owns combat authority.
 * Input: authoritative locomotion/v3.0 rig. Output: shared 27-node render/hurtbox rig.
 * During attacks the complete pose is passed through unchanged, with cues only.
 */
(function(root,factory){const node=typeof module==='object'&&!!module.exports;
 const api=factory(node?require('./naka-core.js'):root.NakaCore);
 if(node)module.exports=api;root.NakaReactionsV31=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(C){'use strict';
 if(!C)throw Error('NakaReactionsV31 requires NakaCore');
 const clamp=C.clamp,wrap=C.wrapAngle,clone=p=>({x:p.x,y:p.y});
 const PROFILES=Object.freeze({
  marsh:Object.freeze({recoil:.061,stagger:.036,turn:.045,fatigue:.014,recovery:.54,heavyThreshold:32,turnThreshold:1.65,exertionRecovery:1.65}),
  dusk:Object.freeze({recoil:.083,stagger:.044,turn:.069,fatigue:.009,recovery:.36,heavyThreshold:30,turnThreshold:2.05,exertionRecovery:1.14}),
  ancient:Object.freeze({recoil:.035,stagger:.029,turn:.029,fatigue:.020,recovery:.72,heavyThreshold:40,turnThreshold:1.20,exertionRecovery:2.12})
 });
 function checkChain(chain){if(!Array.isArray(chain)||chain.length!==27||chain.some(p=>!p||!Number.isFinite(p.x)||!Number.isFinite(p.y)))throw Error('27 finite nodes required');return chain;}
 function heading(chain){return Math.atan2(chain[0].y-chain[1].y,chain[0].x-chain[1].x);}
 function create(chain,{variant='marsh',spacing=18,maxBendRadians=.68}={}){
  checkChain(chain);if(!PROFILES[variant])throw Error('unknown variant');
  if(!Number.isFinite(spacing)||spacing<=0||!Number.isFinite(maxBendRadians)||maxBendRadians<=0||maxBendRadians>Math.PI)throw Error('invalid rig constraints');
  return {variant,spacing,maxBendRadians,frames:0,time:0,mode:'idle',heading:heading(chain),turnImpulse:0,turnCooldown:0,hitImpulse:0,hitAge:99,hitPart:null,staggerImpulse:0,fatigue:0,exertion:0,recoveryAge:99,event:'none',eventCount:0,
   chain:chain.map(clone),cues:Object.freeze({reaction:'none',flinch:0,stagger:0,turnLean:0,fatigue:0,breathWeight:0,eyesNarrow:0,speedAdvisory:1})};
 }
 function hit(state,{part,amount=24,heavy=false}={}){
  if(!['head','trunk','tail'].includes(part))throw Error('part must be head, trunk or tail');
  if(!Number.isFinite(amount)||amount<0)throw Error('amount must be finite and nonnegative');
  if(amount===0)return state;
  const p=PROFILES[state.variant],isHeavy=heavy||amount>=p.heavyThreshold;
  const strength=clamp(amount/50,0,1);
  return {...state,hitImpulse:Math.max(state.hitImpulse,strength),hitAge:0,hitPart:part,staggerImpulse:isHeavy?Math.max(state.staggerImpulse,.32+strength*.58):state.staggerImpulse,
   event:isHeavy?'stagger':'flinch',eventCount:state.eventCount+1};
 }
 function turn(state,{direction=1,strength=1}={}){
  if(!Number.isFinite(direction)||!Number.isFinite(strength)||strength<0)throw Error('invalid turn impulse');
  const impulse=clamp(direction,-1,1)*clamp(strength,0,1);
  return {...state,turnImpulse:clamp(state.turnImpulse+impulse,-1,1),turnCooldown:.12,event:'quick_turn',eventCount:state.eventCount+1};
 }
 function vertexWeight(i,part){
  const center=part==='head'?3:part==='tail'?23:13,spread=part==='trunk'?7:5;
  return Math.exp(-Math.pow((i-center)/spread,2));
 }
 // All joints retain exact original spacing, and the solver enforces max bend.
 // Root never moves. Nothing touches strike poses or their active hitboxes.
 function applyPose(chain,state,amplitude){
  if(amplitude<1e-10)return chain.map(clone);
  const p=PROFILES[state.variant],out=[clone(chain[0])],hitEnvelope=Math.sin(Math.PI*clamp(state.hitAge/.49,0,1));
  for(let i=1;i<chain.length;i++){
   const baseA=chain[i-1],baseB=chain[i];let angle=Math.atan2(baseB.y-baseA.y,baseB.x-baseA.x);
   const recoil=state.hitImpulse*hitEnvelope*Math.sin(state.hitAge*15)*p.recoil*vertexWeight(i,state.hitPart||'trunk');
   const wobble=state.staggerImpulse*Math.sin(state.hitAge*11)*p.stagger*vertexWeight(i,'trunk');
   const lean=state.turnImpulse*p.turn*Math.exp(-Math.pow((i-5)/9,2));
   const tired=state.fatigue*p.fatigue*Math.sin(state.time*2.05-i*.34)*Math.exp(-Math.pow((i-12)/12,2));
   angle+=recoil+wobble+lean+tired;
   const prev=out[i-1];out.push({x:prev.x+Math.cos(angle)*state.spacing,y:prev.y+Math.sin(angle)*state.spacing});
  }
  return C.solveSpineConstraints(out,{spacing:state.spacing,maxBendRadians:state.maxBendRadians});
 }
 function advance(state,{chain,dt,speed=0,mode='idle',hpFraction=1,exertion=0}={}){
  checkChain(chain);
  if(!Number.isFinite(dt)||dt<0||dt>.12)throw Error('dt must be finite in [0, .12]');
  if(!Number.isFinite(speed)||speed<0)throw Error('speed must be finite nonnegative');
  if(!['idle','travel','recover','attack'].includes(mode))throw Error('invalid mode');
  if(!Number.isFinite(hpFraction)||hpFraction<0||hpFraction>1)throw Error('hpFraction must be in [0, 1]');
  if(!Number.isFinite(exertion)||exertion<0||exertion>1)throw Error('exertion must be in [0, 1]');
  const p=PROFILES[state.variant],currentHeading=heading(chain);
  const change=wrap(currentHeading-state.heading),rate=dt?change/dt:0;
  const autoTurn=mode!=='attack'&&speed>16&&Math.abs(rate)>p.turnThreshold&&state.turnCooldown<=0;
  const autoImpulse=autoTurn?clamp(rate/5.5,-.8,.8):0;
  const turnImpulse=clamp(state.turnImpulse*Math.exp(-dt/(p.recovery*.55))+autoImpulse,-1,1);
  const turnCooldown=autoTurn?.16:Math.max(0,state.turnCooldown-dt);
  const hitAge=state.hitAge+dt;
  const hitImpulse=state.hitImpulse*Math.exp(-dt/(p.recovery*.58));
  const staggerImpulse=state.staggerImpulse*Math.exp(-dt/(p.recovery*.47));
  const exertionTarget=mode==='attack'?1:Math.max(exertion,clamp(speed/205,0,1)*.7);
  const exertionBlend=1-Math.exp(-dt/(exertionTarget>state.exertion?.33:p.exertionRecovery));
  const nextExertion=state.exertion+(exertionTarget-state.exertion)*exertionBlend;
  // Fatigue is advisory, never automatically changes game movement speed or damage.
  const fatigueTarget=clamp((1-hpFraction)*.72+nextExertion*.38,0,1);
  const fatigue=state.fatigue+(fatigueTarget-state.fatigue)*(1-Math.exp(-dt/.68));
  const flinch=clamp(hitImpulse*Math.sin(Math.PI*clamp(hitAge/.49,0,1)),0,1);
  const stagger=clamp(staggerImpulse,0,1);
  const active=mode==='attack';
  const reaction=active?'attack_locked':stagger>.10?'stagger':flinch>.045?'flinch':Math.abs(turnImpulse)>.18?'quick_turn':fatigue>.52?'fatigued':'none';
  const next={...state,time:state.time+dt,frames:state.frames+1,mode,heading:currentHeading,turnImpulse,turnCooldown,hitImpulse,hitAge,staggerImpulse,fatigue,exertion:nextExertion,recoveryAge:active?0:state.recoveryAge+dt,event:autoTurn?'quick_turn':state.event,eventCount:state.eventCount+(autoTurn?1:0)};
  const cues=Object.freeze({reaction,flinch,stagger,turnLean:active?0:turnImpulse,fatigue,breathWeight:fatigue*.35,eyesNarrow:clamp(stagger*.45+fatigue*.18,0,.7),speedAdvisory:clamp(1-fatigue*.17,.83,1),lastHit:state.hitPart});
  next.cues=cues;
  // NEVER change attack geometry — invariant shared by all previous production packs.
  const amplitude=flinch+stagger+Math.abs(turnImpulse)+fatigue;
  next.chain=active?chain.map(clone):applyPose(chain,next,amplitude);
  return next;
 }
 function inspect(s){return {variant:s.variant,frames:s.frames,mode:s.mode,reaction:s.cues.reaction,stagger:+s.cues.stagger.toFixed(4),turn:+s.cues.turnLean.toFixed(4),fatigue:+s.cues.fatigue.toFixed(4),flinch:+s.cues.flinch.toFixed(4),lastHit:s.hitPart,eventCount:s.eventCount};}
 return {PROFILES,create,hit,turn,advance,inspect};
});
;
/* ---- naka-telegraph-v32.js ---- */
/* BIO Hunter — Naka v3.2 Attack Personality & Dynamic Telegraph
 * Read-only combat presentation. Deterministic cues from V2.6 authoritative timeline.
 * Never changes pose, active hitbox, targeting, timing, damage or AI decision.
 */
(function(root,factory){const node=typeof module==='object'&&!!module.exports;
 const api=factory(node?require('./naka-animation-v26.js'):root.NakaAnimationV26);
 if(node)module.exports=api;root.NakaTelegraphV32=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(A){'use strict';
 if(!A)throw Error('NakaTelegraphV32 requires NakaAnimationV26');
 const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
 const smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
 const PROFILES=Object.freeze({
  marsh:Object.freeze({name:'Constrictor',rhythm:'slow tightening coil',color:'#83e6ac',pulseHz:2.1,bodyLean:.76,eyeNarrow:.30,crest:0,plate:0}),
  dusk:Object.freeze({name:'Ambusher',rhythm:'quick feint and lateral flash',color:'#a9aeff',pulseHz:5.6,bodyLean:.31,eyeNarrow:.68,crest:1,plate:0}),
  ancient:Object.freeze({name:'Guardian',rhythm:'heavy charge and dorsal plate rise',color:'#f3c47f',pulseHz:1.35,bodyLean:.45,eyeNarrow:.50,crest:0,plate:1})
 });
 const TAIL=new Set(['tail_sweep','tail_hook','counter_whip']);
 const COIL=new Set(['coil_trap','half_coil','constrict_pulse','double_coil']);
 const HEAVY=new Set(['body_slam','titan_bodywave']);
 function assertRig(rig){if(!Array.isArray(rig)||rig.length!==27||rig.some(p=>!p||!Number.isFinite(p.x)||!Number.isFinite(p.y)))throw Error('27 finite rig nodes required');}
 function family(id,stage){if(id==='head_tail_combo')return stage.startsWith('tail-')?'tail':'head';if(TAIL.has(id))return 'tail';if(COIL.has(id))return 'coil';if(HEAVY.has(id))return 'body';return 'head';}
 function findStage(attack,t){const stages=A.timeline(attack),len=A.duration(attack),time=clamp(t,0,len);return {stages,time,len,current:stages.find(s=>time<s.end-1e-9)||null};}
 function cue({attack,variant='marsh',time=0,rig,aim=0,target,side=1}={}){
  if(!attack?.id||!Number.isFinite(attack.windup)||!Number.isFinite(attack.active)||!Number.isFinite(attack.recovery))throw Error('attack timing required');
  if(!PROFILES[variant])throw Error('unsupported Naka variant');
  assertRig(rig);
  if(!Number.isFinite(time)||!Number.isFinite(aim)||!Number.isFinite(side))throw Error('invalid time or direction');
  if(!target||!Number.isFinite(target.x)||!Number.isFinite(target.y))throw Error('locked target required');
  const {stages,time:t,len,current}=findStage(attack,time),phase=current?.phase||'done',familyId=family(attack.id,phase);
  const warning=phase.includes('windup'),active=A.isActive(phase),escape=phase==='escape-window';
  const progress=current?clamp((t-current.start)/Math.max(current.duration,1e-9)):1;
  const nextActive=stages.find(s=>A.isActive(s.phase)&&s.start>=t-1e-9);
  const secondsToImpact=warning&&nextActive?Math.max(0,nextActive.start-t):null;
  const p=PROFILES[variant],h=rig[0],tail=rig[26],base=familyId==='tail'?rig[21]:familyId==='body'?rig[9]:h;
  const buildup=warning?smooth(progress):0,release=active?1:0;
  // Signal pulse cannot control combat. Every visual is fully derived from authoritative stage.
  const pulse=warning?(.72+.28*Math.sin(2*Math.PI*p.pulseHz*t)):active?1:0;
  const strength=clamp((buildup*.78+release)*pulse,0,1),width=Math.max(22,Math.min(140,Number.isFinite(attack.range)?attack.range:90));
  const forward={x:Math.cos(aim),y:Math.sin(aim)},perp={x:-forward.y,y:forward.x};
  const primitives=[];
  if(warning||active){
   if(familyId==='coil'){
    primitives.push({kind:'ring',x:target.x,y:target.y,radius:40+(1-buildup)*width*.34,intensity:strength});
    primitives.push({kind:'body-band',from:5,to:24,thickness:11+strength*8,intensity:strength*.75});
   }else if(familyId==='tail'){
    primitives.push({kind:'tail-trail',from:17,to:26,offset:side*24,intensity:strength});
    primitives.push({kind:'arc',x:tail.x,y:tail.y,radius:Math.min(100,width*.75),start:aim-1.1,end:aim+1.1,intensity:strength});
   }else if(familyId==='body'){
    primitives.push({kind:'body-band',from:2,to:18,thickness:14+strength*10,intensity:strength});
    primitives.push({kind:'ring',x:rig[9].x,y:rig[9].y,radius:30+strength*25,intensity:strength*.75});
   }else{
    primitives.push({kind:'aim-line',x:h.x,y:h.y,x2:h.x+forward.x*width,y2:h.y+forward.y*width,intensity:strength});
    primitives.push({kind:'arc',x:h.x+forward.x*width,y:h.y+forward.y*width,radius:15+strength*10,start:0,end:Math.PI*2,intensity:strength});
   }
   if(variant==='marsh')primitives.push({kind:'body-band',from:4,to:17,thickness:6+strength*7,intensity:strength*.55});
   if(variant==='dusk')primitives.push({kind:'slash-mark',x:base.x+perp.x*17,y:base.y+perp.y*17,x2:base.x-perp.x*17+forward.x*11,y2:base.y-perp.y*17+forward.y*11,intensity:strength});
   if(variant==='ancient')primitives.push({kind:'body-band',from:2,to:13,thickness:9+strength*9,intensity:strength*.6});
  }
  return {
   schema:'biohunter.naka.telegraph.frame.v3.2',variant,attack:attack.id,personality:p.name,rhythm:p.rhythm,color:p.color,
   time:t,duration:len,phase,phaseProgress:progress,warning,active,escape,damageEnabled:active,
   secondsToImpact,warningProgress:warning?progress:null,lockedAim:aim,lockedTarget:{x:target.x,y:target.y},
   family:familyId,animation:{headDip:variant==='ancient'?.9*buildup:variant==='dusk'?.3*buildup:.6*buildup,
    jawTension:strength,neckFan:variant==='marsh'?strength*.92:strength*.24,
    eyeFocus:strength*(1+p.eyeNarrow)/2,crestFlare:p.crest*strength,plateRise:p.plate*strength,
    bodyBrace:strength*p.bodyLean,tailRattle:variant==='dusk'?strength*.75:strength*.2},
   primitives,combatAuthority:false
  };
 }
 function idle({variant='marsh',time=0,mode='observe',rig,target}={}){
  if(!PROFILES[variant])throw Error('unsupported variant');assertRig(rig);
  if(!Number.isFinite(time))throw Error('invalid time');
  const x=clamp((Math.sin(time*(variant==='dusk'?2.8:1.2))+1)/2,0,1);
  return {variant,mode,visualOnly:true,eyeFocus:mode==='observe'?.45:.75,neckFan:variant==='marsh'&&mode==='herd'?.28*x:0,
   crestFlare:variant==='dusk'&&mode==='bait'?.23*x:0,plateRise:variant==='ancient'&&mode==='guard'?.34*x:0,
   targetDirection:target&&Number.isFinite(target.x)&&Number.isFinite(target.y)?Math.atan2(target.y-rig[0].y,target.x-rig[0].x):null};
 }
 return {PROFILES,family,cue,idle};
});
;
/* ---- naka-readability-v33.js ---- */
/* BIO Hunter — Naka v3.3 Combat Readability Layer.
 * Pure presentation plan from the authoritative v2.6 timeline / v3.2 telegraph.
 * This module cannot control damage, targeting, motion, hitboxes or behavior AI.
 */
(function(root,factory){
 const node=typeof module==='object'&&!!module.exports;
 const api=factory(node?require('./naka-telegraph-v32.js'):root.NakaTelegraphV32,
                   node?require('./naka-core.js'):root.NakaCore);
 if(node)module.exports=api;root.NakaReadabilityV33=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(T,C){'use strict';
 if(!T||!C)throw Error('NakaReadabilityV33 requires v3.2 telegraph and NakaCore');
 const clamp=(v,min=0,max=1)=>Math.min(max,Math.max(min,v));
 const smooth=t=>{t=clamp(t);return t*t*(3-2*t);};
 const VARIANT={
  marsh:{label:'COIL / CONSTRICT',color:'#b6efbd',body:'coiling brace',tempo:'gradual'},
  dusk:{label:'FANG / AMBUSH',color:'#bfc1ff',body:'neck snap',tempo:'quick'},
  ancient:{label:'PLATE / HEAVY',color:'#ffe0aa',body:'heavy body load',tempo:'deliberate'}
 };
 const clone=p=>({x:p.x,y:p.y});
 const toPoint=p=>({x:p.x,y:p.y});
 function plan({attack,variant='marsh',time=0,rig,aim=0,target,side=1,zone=null,reducedMotion=false}={}){
  // T.cue performs full validation and reads the authoritative attack timeline.
  const base=T.cue({attack,variant,time,rig,aim,target,side});
  if(zone!==null&&(typeof zone!=='object'||!['ring','disc','lane'].includes(zone.shape)))throw Error('invalid committed hazard zone');
  if(typeof reducedMotion!=='boolean')throw Error('reducedMotion must be boolean');
  const active=base.active,warning=base.warning,engaged=active||warning,p=VARIANT[variant];
  const progress=warning?smooth(base.warningProgress):active?1:0;
  // Held, legible pose; reduced-motion removes pulsing without removing danger status.
  const intensity=engaged?clamp((warning?.34+.66*progress:1),.25,1):0;
  const alpha=engaged?(active?.90:.43+.29*progress):0;
  let gesture=null;
  if(engaged){
   let start,end,kind;
   if(base.family==='tail'){kind='TAIL_LOAD';start=17;end=26;}
   else if(base.family==='coil'){kind='COIL_BRACE';start=4;end=19;}
   else if(base.family==='body'){kind='BODY_BRACE';start=3;end=15;}
   else {kind='NECK_AIM';start=0;end=5;}
   gesture={kind,indices:[start,end],nodes:rig.slice(start,end+1).map(toPoint),intensity,
     thickness:variant==='ancient'?7:variant==='marsh'?6:4.5};
  }
  // Do not invent a closed risk ring for Double Coil: only committed zones may
  // carry the shape's safe gap / orientation into the visual layer.
  // A generic coil gesture is ON BODY only; it never indicates the danger region.
  const settleStrength=base.phase==='recovery'&&!reducedMotion?Math.max(0,1-base.phaseProgress*4):0;
  const settle=settleStrength>0?{kind:'SAFE_RECOVERY',nodes:rig.slice(0,6).map(toPoint),opacity:+(.17*settleStrength).toFixed(5)}:null;
  let hazard=null;
  if(engaged&&zone){
   const expected=C.pressureZone(attack.id,rig[0],target);
   if(!expected||zone.shape!==expected.shape)throw Error('zone shape does not match attack');
   const z=structuredZone(zone);
   hazard={...z,kind:'COMMITTED_HAZARD',opacity:active?.60:.32+.13*progress};
  }
  const elements=(gesture?1:0)+(hazard?1:0)+(engaged?1:0)+(settle?1:0);
  const label=active?'IMPACT':warning?(base.phase.includes('tail')?'TAIL WINDUP':base.phase.includes('second')?'SECOND WINDUP':'WINDUP'):base.escape?'ESCAPE WINDOW':base.phase==='recovery'?'RECOVERY':'IDLE';
  return {schema:'biohunter.naka.readability.frame.v3.3',variant,attack:attack.id,
   phase:base.phase,warning,active,escape:base.escape,progress:base.phaseProgress,
   label,personality:p.label,tempo:p.tempo,bodyCue:p.body,family:base.family,
   color:active?'#ff927b':p.color,alpha,intensity,gesture,hazard,settle,
   emphasis:active?'impact':warning?'preparation':base.escape?'safe-gap':'none',
   timeToImpact:base.secondsToImpact,stageTime:base.time,
   reducedMotion,flashing:false,elementCount:elements,combatAuthority:false,
   // Expose copies for inspector only. Underlying attack rig / zones are not edited.
   lockedTarget:clone(target),lockedAim:aim};
 }
 function structuredZone(z){
  // Explicit, whitelisted fields; no unintended properties exposed to rendering.
  if(z.shape==='ring'){
   for(const k of ['x','y','inner','outer','gapAngle','gapWidth'])if(!Number.isFinite(z[k]))throw Error('invalid ring '+k);
   if(z.outer<=0||z.inner<0||z.inner>=z.outer||z.gapWidth<=0||z.gapWidth>=Math.PI*2)throw Error('unsafe ring dimensions');
   return {shape:'ring',x:z.x,y:z.y,inner:z.inner,outer:z.outer,gapAngle:z.gapAngle,gapWidth:z.gapWidth};
  }
  if(z.shape==='disc'){
   for(const k of ['x','y','radius'])if(!Number.isFinite(z[k]))throw Error('invalid disc '+k);
   if(z.radius<=0)throw Error('invalid disc radius');
   return {shape:'disc',x:z.x,y:z.y,radius:z.radius};
  }
  for(const k of ['x','y','angle','length','width'])if(!Number.isFinite(z[k]))throw Error('invalid lane '+k);
  if(z.length<=0||z.width<=0)throw Error('invalid lane dimensions');
  return {shape:'lane',x:z.x,y:z.y,angle:z.angle,length:z.length,width:z.width};
 }
 return {plan,VARIANT,structuredZone};
});
;
