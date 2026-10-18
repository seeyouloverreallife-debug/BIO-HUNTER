/* Naka 4.3: a bounded opportunity to counter once after a visible melee evade.
   Turn the end of the evade toward its observed attacker; select and lock a
   fresh target only when the counter's own windup starts. No extra damage. */
(function(root){'use strict';
 const B=root.NakaBehaviorV27,C=root.NakaCore,H=root.NakaPursuitV38,R=root.NakaArsenalV42;
 if(!R)throw Error('Riposte 4.3 requires arsenal 4.2');
 const decide0=B.decide,commit0=B.committed,cancel0=H.cancel,cancelMove0=R.cancelMovement;
 function setupEvade(e,o){
  const p={...e,c1:{...e.c1},c2:{...e.c2},end:{...e.end}},a=e.heading;
  if(p.id==='withdraw_s')p.end.x-=12*C.clamp(o.evasionScale??1,.2,1);
  const end=R.evadeHead(p,p.startedAt+p.duration);
  const dx=o.player.x-end.x,dy=o.player.y-end.y,length=Math.hypot(dx,dy)||1,span=100*C.clamp(o.evasionScale??1,.2,1);
  const ux=(Math.cos(a)*dx+Math.sin(a)*dy)/length,uy=(-Math.sin(a)*dx+Math.cos(a)*dy)/length;
  p.c2={x:p.end.x-ux*span,y:p.end.y-uy*span};
  // The entire cubic stays in the convex hull of these four control points.
  for(const q of [p.c1,p.c2,p.end]){const world={x:p.head.x+Math.cos(a)*q.x-Math.sin(a)*q.y,y:p.head.y+Math.sin(a)*q.x+Math.cos(a)*q.y};if(C.dist(world,root.NakaReapproachV40.bound(world,o))>1e-6)return e;}
  return {...p,duration:p.duration+.10,riposteSetup43:true};
 }
 function choose(state,o){
  const d=C.dist(o.head,o.player),facing=Math.abs(C.wrapAngle(Math.atan2(o.player.y-o.head.y,o.player.x-o.head.x)-o.heading));
  const tailNear=(o.spine||[]).slice(18).some(n=>C.dist(n,o.player)<80),from=state.riposte43.source;
  let ids=tailNear&&facing>1.1?['tail_reap','tail_hook','tail_sweep']:
   d<=80?['side_fang','bite','double_fang']:from==='withdraw_s'&&d>=120?['lunge','crescent_fang']:['crescent_fang','lunge'];
  const reach={bite:78,side_fang:90,double_fang:82,lunge:180,crescent_fang:165,tail_reap:225,tail_hook:169,tail_sweep:150};
  return ids.find(id=>d<=reach[id]&&(B.ATTACK_FAMILY[id]!=='head'||facing<1.2)&&
   (!R.ids.has(id)||o.now-(state.lastArsenal42?.[id]??-100)>=7)&&B.attackLegal(id,o,state).ok)||null;
 }
 B.decide=function(previous,o){
  let before={...(previous||B.createState())},pending=before.riposte43;
  if(pending&&(o.headBroken||o.now>pending.expiresAt)){before.riposte43=null;pending=null;}
  const d=decide0(before,o),state=d.state,e=d.intent.evade42;
  if(e&&!previous?.evade42){const planned=setupEvade(e,o),extra=planned.duration-e.duration;state.evade42=planned;state.nextAttackAt+=extra;state.pursuit={...state.pursuit,until:state.pursuit.until+extra};state.riposte43={source:planned.id,readyAt:planned.startedAt+planned.duration+.18,expiresAt:planned.startedAt+planned.duration+1.25};return {...d,intent:{...d.intent,evade42:planned}};}
  if(o.busy||e||!state.riposte43)return d;
  pending=state.riposte43;
  if(C.dist(o.head,o.player)>225){state.riposte43=null;return d;}
  if(o.now<(state.pursuit?.restUntil||0)||!state.pursuit?.active){state.riposte43=null;return d;}
  if(d.intent.kind==='attack'&&(d.intent.finishV40||d.intent.id===o.reactive||d.intent.id===o.escapeFollowup)){state.riposte43=null;return d;}
  if(o.now<pending.readyAt||o.now<state.nextAttackAt)return d;
  const id=choose(state,o);
  if(!id)return d;
  state.mode='evade-counter';state.lastReason=pending.source+' -> '+id;state.lastAction='attack';
  return {...d,intent:{kind:'attack',id,pursuit:true,riposte43:true,sourceEvade43:pending.source,target:H.attackTarget(o,id),mode:'evade-counter',reason:state.lastReason}};
 };
 B.committed=function(old,id,now){return {...commit0(old,id,now),riposte43:null};};
 H.cancel=function(old,now,variant){return {...cancel0(old,now,variant),riposte43:null};};
 R.cancelMovement=function(state){return {...cancelMove0(state),riposte43:null};};
 root.NakaRiposteV43={version:'4.3.0',setupEvade,choose};
})(typeof globalThis!=='undefined'?globalThis:this);
