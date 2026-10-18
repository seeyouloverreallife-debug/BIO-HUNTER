/* BIO Hunter Naka Attack Pass v3.4. Deterministic pose -> shared live collision.
   Loaded after naka-runtime.js. No player inputs, damage values or save access. */
(function(root){'use strict';
 const C=root.NakaCore,A=root.NakaAnimationV26,cfg=root.NakaConfigV28;
 if(!C||!A||!cfg)throw Error('Naka Attack v3.4 requires runtime v3.3');
 const oldSample=A.samplePose,clamp=C.clamp,wrap=C.wrapAngle,copy=p=>({x:p.x,y:p.y});
 const smooth=x=>{x=clamp(x,0,1);return x*x*(3-2*x);};
 const HEAD=new Set(['bite','side_fang','double_fang','head_tail_combo','lunge','marsh_dive','shadow_breach']);
 const TAIL=new Set(['tail_sweep','counter_whip','tail_hook']);
 const reach={bite:26,side_fang:34,double_fang:28,head_tail_combo:30,lunge:108,marsh_dive:120,shadow_breach:125};
 const angle=(a,b)=>Math.atan2(b.y-a.y,b.x-a.x);
 // C1 at both boundaries: old .92 -> 1 snap at active entry is removed.
 C.coilClosure=function(t,a){if(!a||!A.COILS.includes(a.id))return 0;
  if(t<a.windup)return clamp(t/a.windup,0,1);
  if(t<a.windup+a.active)return 1;
  return 1-clamp((t-a.windup-a.active)/a.recovery,0,1);
 };
 const winding={coil_trap:1.55,half_coil:1.40,constrict_pulse:1.65,double_coil:1.85};
 for(const a of cfg.attacks){if(winding[a.id])a.windup=winding[a.id]; if(a.id==='double_coil')a.recovery=2.15;}
 // Find the precise beat; double-fang uses its own second windup, never first's duration.
 function beat(a,t){const track=A.timeline(a),st=track.find(s=>t<s.end-1e-9)||track[track.length-1];
  return {track,st,p:clamp((t-st.start)/Math.max(.001,st.duration),0,1)};}
 function headDrive(a,t){const b=beat(a,t),name=b.st.phase,u=smooth(b.p),id=a.id;
  const headBeat=!name.startsWith('tail-');
  let forward=0,load=0,extension=0;
  const r=reach[id]*((name.startsWith('second-')||id==='double_fang'&&name==='recovery')?.9:1);
  if(headBeat&&name.includes('windup')){forward=-12*u;load=u;extension=0;}
  else if(headBeat&&name.includes('active')){forward=-12+(r+12)*u;load=1-u;extension=u;}
  else if(name==='escape-window'){forward=reach[id]*(1-u);extension=1-u;}
  else if(name==='recovery'&&id!=='head_tail_combo'){forward=r*(1-u);extension=1-u;}
  return {forward,load,extension,weight:clamp(load+extension,0,1),beat:b};
 }
 // FABRIK with a braced posterior: preserve every bone length and angular limit.
 // Only a taut body needs to push the brace forward. A coiled body spends its slack first.
 function neck(base,a,t,aim,side,cons,center){const d=headDrive(a,t);
  if(center&&['lunge','marsh_dive','shadow_breach'].includes(a.id)){const distance=Math.hypot(center.x-base[0].x,center.y-base[0].y); const r=a.id==='shadow_breach'?distance:clamp(distance-28,70,a.id==='lunge'?170:190); d.forward=d.forward<0?d.forward:r*d.extension-12*d.load;}if(d.weight<1e-9)return base.map(copy);
  const spacing=cons.spacing||18,bend=cons.maxBendRadians||.68;
  const pivot=['lunge','marsh_dive','shadow_breach'].includes(a.id)?17:10;
  const ux=Math.cos(aim),uy=Math.sin(aim),nx=-uy,ny=ux;
  const lateral=(a.id==='side_fang'?18:7)*side*d.load;
  const target={x:base[0].x+ux*d.forward+nx*lateral,y:base[0].y+uy*d.forward+ny*lateral};
  const dist=Math.hypot(target.x-base[pivot].x,target.y-base[pivot].y),max=pivot*spacing-1;
  const push=Math.max(0,dist-max),pushX=dist?push*(target.x-base[pivot].x)/dist:0,pushY=dist?push*(target.y-base[pivot].y)/dist:0;
  const work=base.map(p=>({x:p.x+pushX,y:p.y+pushY})),anchor=copy(work[pivot]);
  // S-shaped seed avoids a collinear backwards fold during anticipation.
  for(let i=0;i<pivot;i++){const k=Math.sin(Math.PI*i/pivot*2)*(9*d.load+1.5*d.weight);work[i].x+=nx*k;work[i].y+=ny*k;}
  const desired=angle(base[1],base[0])+wrap(aim-angle(base[1],base[0]))*smooth(d.weight);
  for(let pass=0;pass<14;pass++){
   work[0]=copy(target);
   for(let i=1;i<=pivot;i++){const th=angle(work[i-1],work[i]);work[i]={x:work[i-1].x+Math.cos(th)*spacing,y:work[i-1].y+Math.sin(th)*spacing};}
   work[pivot]=copy(anchor);let prior=angle(work[pivot+1],work[pivot]);
   for(let i=pivot-1;i>=0;i--){let th=angle(work[i+1],work[i]);
    if(i<3){const w=(3-i)/3*smooth(d.weight);th+=wrap(desired-th)*w;}
    th=prior+clamp(wrap(th-prior),-bend,bend);
    work[i]={x:work[i+1].x+Math.cos(th)*spacing,y:work[i+1].y+Math.sin(th)*spacing};prior=th;
   }
  }
  return work;
 }
 function tail(base,a,t,side,cons){const combo=a.id==='head_tail_combo',start=combo?a.windup+a.active+.32:0;
  if(t<start)return base.map(copy);
  const wind=combo?.62:a.windup,active=combo?.25:a.active,local=t-start;
  let theta;
  if(local<wind)theta=-.38*smooth(local/wind);
  else if(local<wind+active)theta=-.38+(a.id==='tail_hook'?1.68:1.35)*smooth((local-wind)/active);
  else theta=(a.id==='tail_hook'?1.30:.97)*(1-smooth((local-wind-active)/a.recovery));
  theta*=side;if(Math.abs(theta)<1e-10)return base.map(copy);
  const out=base.map(copy),pivot=16,spacing=cons.spacing||18,bend=cons.maxBendRadians||.68;
  let prior=angle(base[pivot-1],base[pivot]);
  for(let i=pivot+1;i<out.length;i++){
   const original=angle(base[i-1],base[i]),k=smooth((i-pivot)/(out.length-1-pivot));
   const wanted=original+theta*k,th=prior+clamp(wrap(wanted-prior),-bend,bend);
   out[i]={x:out[i-1].x+Math.cos(th)*spacing,y:out[i-1].y+Math.sin(th)*spacing};prior=th;
  }
  return out;
 }
 function coil(base,a,t,o,cons){
  const aim=o.aim||0,spacing=cons.spacing||18,center=o.center||base[0],zone=o.zone||C.pressureZone(a.id,base[0],center);
  const sweep=a.id==='double_coil'?5.43:a.id==='constrict_pulse'?5.25:4.92;
  const coilAim=a.id==='double_coil'&&zone?zone.gapAngle-.68-(sweep+2*Math.PI)/2:aim;
  const target=a.id==='half_coil'?C.halfCoilPose(base,center,aim,1,spacing):C.coilPose(base,center,coilAim,1,spacing,sweep);
  const recovering=t>=a.windup+a.active;
  const phase=recovering?clamp((t-a.windup-a.active)/a.recovery,0,1):clamp(t/a.windup,0,1);
  const weight=i=>{const delay=.18*i/(base.length-1),q=smooth((phase-delay)/(1-delay));return recovering?1-q:q;};
  const alpha=weight(0),out=[{x:base[0].x+(target[0].x-base[0].x)*alpha,y:base[0].y+(target[0].y-base[0].y)*alpha}];
  let from=angle(base[0],base[1]),to=angle(target[0],target[1]),theta=from+wrap(to-from)*weight(1);
  out.push({x:out[0].x+Math.cos(theta)*spacing,y:out[0].y+Math.sin(theta)*spacing});
  for(let i=2;i<base.length;i++){
   const f=angle(base[i-1],base[i]),d=angle(target[i-1],target[i]),mix=weight(i);
   theta+=(1-mix)*wrap(f-from)+mix*wrap(d-to);
   const p=out[i-1];out.push({x:p.x+Math.cos(theta)*spacing,y:p.y+Math.sin(theta)*spacing});from=f;to=d;
  }
  return out;
 }
 function sample(base,a,t,o={}){
  if(!HEAD.has(a.id)&&!TAIL.has(a.id)&&!A.COILS.includes(a.id))return oldSample(base,a,t,o);
  const aim=o.aim||0,side=o.side||1,cons=o.constraints||{spacing:18,maxBendRadians:.68};
  const stage=A.phaseAt(a,t),active=A.isActive(stage),zone=o.zone||C.pressureZone(a.id,base[0],o.center||base[0]);
  let chain=A.COILS.includes(a.id)?coil(base,a,t,o,cons):base.map(copy);
  if(HEAD.has(a.id))chain=neck(base,a,t,aim,side,cons,o.center);
  if(TAIL.has(a.id)||a.id==='head_tail_combo')chain=tail(chain,a,t,side,cons);
  const hitbox=active?C.attackCollisionGeometry(a.id,chain,aim,t,a,zone):null;
  return {chain,stage,active,rootTravel:0,zone,hitbox,telegraph:{committed:true,stage,warning:!active&&stage!=='recovery'&&stage!=='done',aim,center:{...(o.center||base[0])}}};
 }
 A.samplePose=sample;
 root.NakaAttackV34={version:'3.4.0',samplePose:sample,headDrive,tail,neck,coil,beat};
})(typeof globalThis!=='undefined'?globalThis:this);
