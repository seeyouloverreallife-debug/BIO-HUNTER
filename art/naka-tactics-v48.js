/* Species pursuit maneuvers: committed goals, ordinary grounded steering.
   No new damage, input prediction, immunity or movement of the entire rig. */
(function(root){'use strict';
 const C=root.NakaCore,B=root.NakaBehaviorV27,H=root.NakaPursuitV38,R=root.NakaArsenalV42,V=root.NakaReapproachV40;
 if(!root.NakaGuardV47)throw Error('Tactics 4.8 requires species styles 4.7');
 const copy=p=>({x:p.x,y:p.y}),profiles={marsh:{id:'gate-stop',duration:.60,cooldown:7},dusk:{id:'flank-cut',duration:.55,cooldown:5.5},ancient:{id:'rear-screen',duration:.65,cooldown:7.5}};
 function observe(old,o){
  const last=old?.tacticRead48;if(last&&o.now<=last.at)return old;
  const speed=Math.hypot(o.observedVelocity?.x||0,o.observedVelocity?.y||0),continuous=last&&o.now-last.at<=.25,stopped=speed<45;
  return {...old,tacticRead48:{at:o.now,stoppedSince:stopped?(continuous&&last.stoppedSince!==null?last.stoppedSince:o.now):null}};
 }
 function eligible(state,o){
  const p=state.pursuit,read=state.tacticRead48,speed=Math.hypot(o.observedVelocity?.x||0,o.observedVelocity?.y||0),distance=C.dist(o.head,o.player);
  if(!p?.active||p.strikes>=2||o.now<(p.restUntil||0)||o.now<(state.nextTacticAt48||0)||o.headBroken||o.now-p.startedAt<.12)return false;
  if(o.variant.id==='marsh')return Number.isFinite(state.lastWrapAt40)&&p.strikes>=1&&read?.stoppedSince!==null&&o.now-read.stoppedSince>=.40&&distance>=70&&distance<=240;
  if(o.variant.id==='dusk')return speed>=70&&distance>=105&&distance<=320;
  const facing=Math.abs(C.wrapAngle(Math.atan2(o.player.y-o.head.y,o.player.x-o.head.x)-o.heading)),tailNear=(o.spine||[]).slice(17).some(q=>C.dist(q,o.player)<90);
  return !o.tailBroken&&p.strikes>=1&&facing>1&&tailNear&&distance<=240;
 }
 function plan(state,o){
  if(!eligible(state,o))return null;const variant=o.variant.id,p=profiles[variant],distance=C.dist(o.head,o.player)||1,ux=(o.player.x-o.head.x)/distance,uy=(o.player.y-o.head.y)/distance,v=o.observedVelocity||{x:0,y:0},speed=Math.hypot(v.x,v.y),scale=speed>220?220/speed:1,candidates=[];
  for(const side of [state.circleSide||1,-(state.circleSide||1)]){
   let goal;
   if(variant==='dusk')goal={x:o.player.x+v.x*scale*.18-ux*55-uy*side*85,y:o.player.y+v.y*scale*.18-uy*55+ux*side*85};
   else if(variant==='marsh'){
    const center={x:o.arena?.centerX??(o.arena?.width??960)/2,y:o.arena?.centerY??(o.arena?.height??620)/2},r=C.dist(o.player,center)||1,dx=(center.x-o.player.x)/r,dy=(center.y-o.player.y)/r;
    goal={x:o.player.x+dx*68-uy*side*30,y:o.player.y+dy*68+ux*side*30};
   }else goal={x:o.head.x+Math.cos(o.heading)*45-Math.sin(o.heading)*side*60,y:o.head.y+Math.sin(o.heading)*45+Math.cos(o.heading)*side*60};
   const bounded=V.bound(goal,o);if(C.dist(goal,bounded)>1e-6||C.dist(o.head,goal)<32)continue;
   let cost=C.dist(o.head,goal);for(const q of (o.spine||[]).slice(8))cost+=Math.max(0,30-C.dist(q,goal))*2;
   if(variant==='ancient'){const lateral=(o.player.x-o.head.x)*-Math.sin(o.heading)+(o.player.y-o.head.y)*Math.cos(o.heading);if(lateral*side>0)cost+=80;}
   candidates.push({id:p.id,variant,side,startedAt:o.now,until:o.now+p.duration,goal:copy(goal),observedPlayer:copy(o.player),cost});
  }return candidates.sort((a,b)=>a.cost-b.cost||a.side-b.side)[0]||null;
 }
 const decide0=B.decide,commit0=B.committed,cancel0=H.cancel,cancelMove0=R.cancelMovement;
 function owned(d,o,activeTactic,claimsNewArc){const it=d.intent;return o.busy||it.guard45||it.guardCounter45||it.evade42||it.riposte43||it.reapproachV40&&!activeTactic&&!claimsNewArc||it.finishV40||d.state.riposte43||o.reactive||o.escapeFollowup||o.comboNext;}
 function move(d,t){const it=d.intent,info=it.huntRead44?{...it.huntRead44,target:copy(t.goal)}:undefined;return {...d,state:{...d.state,tactic48:t,returnArc40:null,mode:'pursuit',lastAction:'move',lastReason:'committed species pursuit '+t.id},intent:{kind:'move',mode:'pursuit',pursuit:true,target:copy(t.goal),speedFactor:1.3,tactic48:t,...(info?{huntRead44:info}:{}),reason:'observed species tactic '+t.id}};}
 B.decide=function(previous,o){
  const before=observe(previous||B.createState(),o),d=decide0(before,o),p=d.state.pursuit,t=before.tactic48;
  const claimsNewArc=o.variant.id==='ancient'&&!before.returnArc40&&d.intent.reapproachV40&&eligible(d.state,o);
  if(owned(d,o,t&&o.now<t.until,claimsNewArc)||!p?.active||p.strikes>=2||o.now<(p.restUntil||0)||o.headBroken||t?.variant==='ancient'&&o.tailBroken)return {...d,state:{...d.state,tactic48:null}};
  if(t&&o.now<t.until){
   // A newly visible melee threat may claim defense on this update.
   if(o.threat?.winding)return {...d,state:{...d.state,tactic48:null}};
   return move(d,t);
  }
  d.state={...d.state,tactic48:null};
  if(d.intent.kind!=='move'||!d.intent.pursuit||o.threat?.winding)return d;
  const next=plan(d.state,o);if(!next)return d;
  d.state={...d.state,nextTacticAt48:o.now+profiles[o.variant.id].cooldown,pursuit:{...p,until:p.until+profiles[o.variant.id].duration}};
  return move(d,next);
 };
 B.committed=function(old,id,now){return {...commit0(old,id,now),tactic48:null};};
 H.cancel=function(old,now,variant){return {...cancel0(old,now,variant),tactic48:null,tacticRead48:null};};
 R.cancelMovement=function(old,now){return {...cancelMove0(old,now),tactic48:null};};
 root.NakaTacticsV48={version:'4.8.0',profiles,observe,eligible,plan};
})(typeof globalThis!=='undefined'?globalThis:this);
