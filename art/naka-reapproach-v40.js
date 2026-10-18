/* Naka 4.0: committed return arcs after an overshoot, plus a conditional wrap
   opportunity AFTER the pursuit opening. No damage, root teleport or retargeting. */
(function(root){'use strict';
 const B=root.NakaBehaviorV27,C=root.NakaCore;if(!root.NakaMotionV39)throw Error('Reapproach 4.0 requires motion 3.9');
 const decide0=B.decide,commit0=B.committed,recover0=B.recovered;
 function bound(p,o){const a=o.arena||{width:960,height:620},q={x:C.clamp(p.x,45,a.width-45),y:C.clamp(p.y,45,a.height-45)};
  if(Number.isFinite(a.radius)&&Number.isFinite(a.centerX)&&Number.isFinite(a.centerY)){const dx=q.x-a.centerX,dy=q.y-a.centerY,d=Math.hypot(dx,dy);if(d>a.radius)return {x:a.centerX+dx/d*a.radius,y:a.centerY+dy/d*a.radius};}return q;
 }
 function arcFor(o){const h=o.head,heading=o.heading||0,radius=52,candidates=[];
  for(const side of [1,-1]){const center={x:h.x-Math.sin(heading)*radius*side,y:h.y+Math.cos(heading)*radius*side},start=heading-side*Math.PI/2;let cost=0;
   for(let i=1;i<=12;i++){const angle=start+side*2.4*i/12,p={x:center.x+Math.cos(angle)*radius,y:center.y+Math.sin(angle)*radius},bounded=bound(p,o);cost+=C.dist(p,bounded)*30;
    for(const q of (o.spine||[]).slice(7))cost+=Math.max(0,29-C.dist(p,q))*.25;
   }
   const desired=Math.atan2(o.player.y-h.y,o.player.x-h.x);cost+=Math.abs(C.wrapAngle(desired-(heading+side*2.4)))*8;
   candidates.push({center,radius,side,start,startedAt:o.now,until:o.now+1.35,cost});
  }
  return candidates.sort((a,b)=>a.cost-b.cost||b.side-a.side)[0];
 }
 // Circle-straight-circle entry: analytic common tangents keep the head route
 // continuous in direction and avoid a cubic cusp when the target is behind it.
 function entryFor(base,target,heading,radius,side){const h=base[0],plans=[],TAU=Math.PI*2;
  for(const firstSide of [side,-side])for(const firstRadius of [32,42,radius]){
   const center={x:h.x-Math.sin(heading)*firstRadius*firstSide,y:h.y+Math.cos(heading)*firstRadius*firstSide},dx=target.x-center.x,dy=target.y-center.y,d=Math.hypot(dx,dy),same=firstSide===side,start=heading-firstSide*Math.PI/2;
   if(d<1e-8){if(same&&Math.abs(firstRadius-radius)<1e-8)plans.push({points:[{...h}],start,score:0});continue;}
   const ratio=(same?firstRadius-radius:firstRadius+radius)/d;if(Math.abs(ratio)>1)continue;
   for(const sign of [1,-1]){const angle=Math.atan2(dy,dx)+sign*Math.acos(C.clamp(ratio,-1,1)),nx=Math.cos(angle),ny=Math.sin(angle),q1={x:center.x+nx*firstRadius,y:center.y+ny*firstRadius},q2={x:target.x+nx*radius*(same?1:-1),y:target.y+ny*radius*(same?1:-1)};
    const vx=q2.x-q1.x,vy=q2.y-q1.y,tangent=angle+firstSide*Math.PI/2;if(vx*Math.cos(tangent)+vy*Math.sin(tangent)<-1e-7)continue;
    let sweep=((firstSide*(angle-start))%TAU+TAU)%TAU;if(sweep>TAU-1e-8)sweep=0;
    const points=[{...h}],arcSteps=Math.max(1,Math.ceil(sweep/.025));if(sweep>1e-8)for(let i=1;i<=arcSteps;i++){const a=start+firstSide*sweep*i/arcSteps;points.push({x:center.x+Math.cos(a)*firstRadius,y:center.y+Math.sin(a)*firstRadius});}
    const length=Math.hypot(vx,vy),steps=Math.max(1,Math.ceil(length/2));if(length>1e-8)for(let i=1;i<=steps;i++)points.push({x:q1.x+vx*i/steps,y:q1.y+vy*i/steps});
    let score=sweep*firstRadius+length;
    for(let i=3;i<points.length;i+=5)for(const q of base.slice(8))score+=Math.max(0,28-C.dist(points[i],q))*.5;
    plans.push({points,start:Math.atan2(q2.y-target.y,q2.x-target.x),score});
   }
  }
  return plans.sort((a,b)=>a.score-b.score)[0]||null;
 }
 B.decide=function(previous,o){const d=decide0(previous,o),state=d.state,p=state.pursuit;
  if(previous?.pursuit?.active&&!p?.active&&previous.pursuit.strikes>0)state.wrapUntil40=Math.max(state.wrapUntil40||0,(p?.restUntil||o.now)+2.8);
  if(d.intent.kind==='busy')return d;
  const distance=C.dist(o.head,o.player),facing=Math.abs(C.wrapAngle(Math.atan2(o.player.y-o.head.y,o.player.x-o.head.x)-(o.heading||0)));
  if(d.intent.kind==='move'&&d.intent.pursuit&&p?.active){
   let arc=state.returnArc40;
   if(arc&&(o.now>=arc.until||o.now-arc.startedAt>.25&&facing<.65)){arc=null;state.returnArc40=null;state.nextArcAt40=o.now+.6;}
   if(!arc&&(p.strikes>0||state.pursuitEngaged41)&&distance<170&&facing>1.15&&o.now>=(state.nextArcAt40||0)){arc=arcFor(o);state.returnArc40=arc;}
   if(arc){const a=Math.atan2(o.head.y-arc.center.y,o.head.x-arc.center.x)+arc.side*.55,target=bound({x:arc.center.x+Math.cos(a)*arc.radius,y:arc.center.y+Math.sin(a)*arc.radius},o);
    state.mode='pursuit-turn';state.lastReason='grounded return arc after overshoot';state.lastTarget=target;
    return {...d,intent:{...d.intent,mode:'pursuit-turn',target,reapproachV40:true,turnRadius:arc.radius,speedLimit:145,reason:state.lastReason}};
   }
  }else state.returnArc40=null;
  // Marsh can finish with its existing wrap only when the player slows down.
  // The forced pursuit rest, ordinary setup and attack legality still apply.
  const velocity=o.observedVelocity||{x:0,y:0},slow=Math.hypot(velocity.x,velocity.y)<110;
  const wrapReady=o.variant.id==='marsh'&&!p?.active&&o.now<(state.wrapUntil40||0)&&o.now-(state.lastWrapAt40??-100)>11&&o.now>=state.nextAttackAt&&o.now>=state.setupUntil;
  const counter=d.intent.kind==='attack'&&(d.intent.id===o.reactive||d.intent.id===o.escapeFollowup);
  if(wrapReady&&!counter&&slow&&distance>=80&&distance<=180&&facing<1&&B.attackLegal('half_coil',o,state).ok&&d.intent.kind!=='busy'){
   state.mode='wrap-finish';state.lastReason='wrap slowed target after pursuit opening';state.lastAction='attack';
   return {...d,intent:{kind:'attack',id:'half_coil',target:{...o.player},mode:'wrap-finish',reason:state.lastReason,finishV40:true}};
  }
  return d;
 };
 B.committed=function(old,id,now){const state=commit0(old,id,now);state.returnArc40=null;if(id==='half_coil'){state.lastWrapAt40=now;state.wrapUntil40=0;}return state;};
 B.recovered=function(old,now,variant){const state=recover0(old,now,variant);state.returnArc40=null;if(old.pursuit?.active&&!state.pursuit?.active&&old.pursuit.strikes>0)state.wrapUntil40=Math.max(state.wrapUntil40||0,(state.pursuit?.restUntil||now)+2.8);return state;};
 const cancel0=root.NakaPursuitV38.cancel;
 root.NakaPursuitV38.cancel=function(old,now,variant){return {...cancel0(old,now,variant),returnArc40:null,wrapUntil40:0,nextArcAt40:now+.6};};
 root.NakaReapproachV40={version:'4.0.0',arcFor,entryFor,bound};
})(typeof globalThis!=='undefined'?globalThis:this);
