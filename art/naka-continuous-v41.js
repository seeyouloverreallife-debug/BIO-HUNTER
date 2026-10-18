/* Naka 4.1: reacquire the current target after each short counter opening.
   Keep the 4.0 return arc and slow-target wrap, and preserve committed aims. */
(function(root){'use strict';
 const B=root.NakaBehaviorV27,H=root.NakaPursuitV38;
 if(!root.NakaReapproachV40)throw Error('Continuous pursuit 4.1 requires reapproach 4.0');
 const decide0=B.decide,recover0=B.recovered,cancel0=H.cancel;
 function readyState(state){
  const p={...state.pursuit};
  // Once engaged, the visible opening is the entire pursuit cooldown.
  if(p.startedAt>0&&!p.active)p.nextAt=p.restUntil;
  return {...state,pursuit:p,pursuitEngaged41:!!(state.pursuitEngaged41||p.strikes>0)};
 }
 B.decide=function(previous,o){
  const state=readyState(previous||B.createState()),p=state.pursuit;
  if(o.busy||o.headBroken||o.now<p.restUntil)return decide0(state,o);
  const wrapWindow=p.active&&p.strikes===0&&o.now<(state.wrapUntil40||0);
  if(p.active&&!wrapWindow||!p.active&&o.now<p.nextAt)return decide0(state,o);
  // Probe while pursuit is gated so 4.0 can select a legal wrap or counter.
  // This is a pure decision; do not consume its state when choosing to chase.
  const probe=decide0({...state,setupUntil:p.active?state.wrapSetupUntil41:state.setupUntil,pursuit:{...p,active:false,nextAt:Infinity}},o);
  const it=probe.intent;
  if(it.kind==='attack'&&(it.finishV40||!p.active&&(it.id===o.reactive||it.id===o.escapeFollowup))){
   probe.state.pursuit.nextAt=p.nextAt;
   probe.state=readyState(probe.state);return probe;
  }
  if(p.active)return decide0(state,o);
  const profile=H.profiles[o.variant.id];
  Object.assign(p,{active:true,startedAt:o.now,until:o.now+profile.burst,strikes:0});
  state.wrapSetupUntil41=Math.max(state.setupUntil,o.now);
  state.setupUntil=0;
  // No minimum separation: a nearby or retreating target is still pursued.
  return decide0(state,o);
 };
 B.recovered=function(old,now,variant){return readyState(recover0(old,now,variant));};
 H.cancel=function(old,now,variant){return readyState(cancel0(old,now,variant));};
 root.NakaContinuousV41={version:'4.1.0'};
})(typeof globalThis!=='undefined'?globalThis:this);
