/* Species follow-through: one short, committed second route within a pursuit
   maneuver. Uses only visible positions/velocity, ordinary grounded steering,
   and never extends a pursuit, retargets an attack or bypasses an opening. */
(function(root){'use strict';
 const B=root.NakaBehaviorV27,C=root.NakaCore,H=root.NakaPursuitV38,R=root.NakaArsenalV42,V=root.NakaReapproachV40;
 if(!root.NakaPressureV49)throw Error('Follow-through 5.0 requires pressure 4.9');
 const profiles={marsh:{id:'escape-gate',firstLeg:.30,duration:.42},dusk:{id:'feint-cut',firstLeg:.28,duration:.34},ancient:{id:'body-screen',firstLeg:.32,duration:.48}},copy=p=>({x:p.x,y:p.y});
 function plan(source,o,pursuit){
  const variant=o.variant.id,spec=profiles[variant],d=C.dist(o.head,o.player),v=o.observedVelocity||{x:0,y:0},speed=Math.hypot(v.x,v.y),f=speed>220?220/speed:1;
  if(!source||source.variant!==variant||o.now<source.startedAt+spec.firstLeg||o.now-source.until>.20||!pursuit?.active||pursuit.strikes>=2||pursuit.until-o.now<.18||d<60||d>340||variant==='ancient'&&o.tailBroken)return null;
  const ux=(o.player.x-o.head.x)/(d||1),uy=(o.player.y-o.head.y)/(d||1),side=source.side||1;let goal;
  if(variant==='marsh'){
   const center={x:o.arena?.centerX??(o.arena?.width??960)/2,y:o.arena?.centerY??(o.arena?.height??620)/2},r=C.dist(o.player,center)||1;
   goal={x:o.player.x+v.x*f*.24+(center.x-o.player.x)/r*36,y:o.player.y+v.y*f*.24+(center.y-o.player.y)/r*36};
  }else if(variant==='dusk'){
   if(speed<55)return null;
   // Cross back from the first flank once; then keep this visible escape point.
   goal={x:o.player.x+v.x*f*.26+uy*side*28-ux*18,y:o.player.y+v.y*f*.26-ux*side*28-uy*18};
  }else{
   const facing=Math.abs(C.wrapAngle(Math.atan2(o.player.y-o.head.y,o.player.x-o.head.x)-o.heading)),near=(o.spine||[]).slice(14).some(q=>C.dist(q,o.player)<115);
   if(facing<.8||!near)return null;
   goal={x:o.head.x+Math.cos(o.heading)*90-Math.sin(o.heading)*side*75,y:o.head.y+Math.sin(o.heading)*90+Math.cos(o.heading)*side*75};
  }
  const bounded=V.bound(goal,o);
  // At the arena edge abandon a clipped route rather than drag the whole rig.
  if(C.dist(goal,bounded)>24||C.dist(o.head,bounded)<28)return null;
  return {id:spec.id,variant,side,startedAt:o.now,until:Math.min(o.now+spec.duration,pursuit.until),sourceStartedAt:source.startedAt,goal:copy(bounded),observedPlayer:copy(o.player)};
 }
 function blocked(previous,d,o){const it=d.intent,p=d.state.pursuit;return o.busy||o.headBroken||!p?.active||p.strikes>=2||o.now<(p.restUntil||0)||it.kind!=='move'||!it.pursuit||it.guard45||it.guardCounter45||it.evade42||it.riposte43||it.finishV40||d.state.riposte43||it.reapproachV40&&!!previous?.returnArc40||o.reactive||o.escapeFollowup||o.comboNext||o.threat?.winding;}
 function move(d,t){const {turnRadius,speedLimit,reapproachV40,tactic48,...intent}=d.intent;return {...d,state:{...d.state,follow50:t,link50:null,returnArc40:null,mode:'pursuit',lastTarget:copy(t.goal),lastAction:'move',lastReason:'species follow-through '+t.id},intent:{...intent,mode:'pursuit',target:copy(t.goal),pressure49:intent.pressure49||{gain:0,mode:'follow-through'},follow50:t,...(d.intent.huntRead44?{huntRead44:{...d.intent.huntRead44,target:copy(t.goal)}}:{}),reason:'committed species follow-through '+t.id}};}
 const decide0=B.decide,commit0=B.committed,cancel0=H.cancel,cancelMove0=R.cancelMovement;
 B.decide=function(previous,o){
  const d=decide0(previous,o),it=d.intent;
  if(blocked(previous,d,o)||o.tailBroken&&(previous?.follow50?.variant==='ancient'||previous?.link50?.variant==='ancient'))return {...d,state:{...d.state,follow50:null,link50:null}};
  const active=previous?.follow50;
  if(active&&o.now<active.until)return move(d,active);
  // An expired second leg cannot re-arm from the still-visible first-leg state.
  if(active)return {...d,state:{...d.state,follow50:null,link50:null}};
  const source=it.tactic48||previous?.link50,next=plan(source,o,d.state.pursuit);
  if(!next&&it.tactic48)return {...d,state:{...d.state,follow50:null,link50:it.tactic48}};
  return next?move(d,next):{...d,state:{...d.state,follow50:null,link50:null}};
 };
 B.committed=function(old,id,now){return {...commit0(old,id,now),follow50:null,link50:null};};
 H.cancel=function(old,now,variant){return {...cancel0(old,now,variant),follow50:null,link50:null};};
 R.cancelMovement=function(old,now){return {...cancelMove0(old,now),follow50:null,link50:null};};
 root.NakaFollowV50={version:'5.0.0',profiles,plan};
})(typeof globalThis!=='undefined'?globalThis:this);
