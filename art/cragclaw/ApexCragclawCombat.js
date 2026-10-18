/* ApexCragclaw Combat Fairness adapter v0.5. Pure UMD/IIFE; no DOM, Date or Math.random. */
(function(root,factory){'use strict';root.ApexCragclawCombat=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
function distance(ax,ay,bx,by){var x=bx-ax,y=by-ay;return Math.sqrt(x*x+y*y);}
function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
// Sweeps BOTH moving circles by transforming to relative coordinates.
function sweptCircles(ax0,ay0,ax1,ay1,ar,bx0,by0,bx1,by1,br){
  var sx=ax0-bx0,sy=ay0-by0, vx=(ax1-ax0)-(bx1-bx0),vy=(ay1-ay0)-(by1-by0),r=ar+br;
  var A=vx*vx+vy*vy,B=2*(sx*vx+sy*vy),C=sx*sx+sy*sy-r*r;
  if(C<=0)return {hit:true,t:0}; if(A<=1e-12)return {hit:false,t:null};
  var d=B*B-4*A*C;if(d<0)return {hit:false,t:null};var t=(-B-Math.sqrt(d))/(2*A);
  return {hit:t>=0&&t<=1,t:t};
}
function stoneOccluded(ax,ay,bx,by,obstacles,clearance){
  for(var i=0;i<obstacles.length;i++){var o=obstacles[i];if(sweptCircles(ax,ay,bx,by,0,o.x,o.y,o.x,o.y,o.r+(clearance||0)).hit)return true;}
  return false;
}
function isInsideArena(x,y,r,arena){return distance(x,y,arena.cx,arena.cy)<=arena.r-r+1e-7;}
function hitboxPulseIndex(a,t){if(!a)return -1;var meta=a;var p=(t-meta.tele)/meta.act;if(p<0||p>1)return -1;
  for(var i=0;i<meta.pulseWindows.length;i++){var w=meta.pulseWindows[i];if(p>=w[0]-1e-8&&p<=w[1]+1e-8)return i;}return -1;
}
function makeAdapter(instance,options){
  options=options||{};
  var stepMax=Math.min(0.008,Math.max(0.001,options.maxSubstep||0.004));
  var serial=0, previousId=null,previousLocal=0, taken={},lastContactTime=-Infinity, hazardLast={},lastHazardContact=-Infinity;
  function reset(){serial++;previousId=null;previousLocal=0;taken={};lastContactTime=-Infinity;} // crystal ticks persist across forced attacks
  function attackKey(frame){return frame.attack&&frame.attack.id||null;}
  function step(dt,world){
    if(!world||!world.player)throw new Error('ApexCragclawCombat requires world.player');
    var p=world.player,arena=world.arena||{cx:480,cy:312,r:268},obstacles=world.obstacles||[];
    var duration=Math.max(0,Math.min(0.12,Number(dt)||0));
    var px=+p.x,py=+p.y,pr=Number(p.r)||14,vx=Number(p.vx)||0,vy=Number(p.vy)||0;
    var old=instance.getLastFrame();var elapsed=0, contacts=[], events=[];
    var totalSteps=Math.ceil(duration/stepMax),sub=totalSteps?duration/totalSteps:0;
    for(var i=0;i<totalSteps;i++){
      var sx=px+vx*elapsed,sy=py+vy*elapsed,ex=px+vx*(elapsed+sub),ey=py+vy*(elapsed+sub);
      var subWorld={player:{x:sx,y:sy,r:pr,vx:vx,vy:vy,action:p.action,actionSerial:p.actionSerial},arena:arena,obstacles:obstacles,tNow:(world.tNow||0)+elapsed};
      var frame=instance.step(sub,subWorld),id=attackKey(frame),t=frame.attack?frame.attack.t:0;
      if(frame.events&&frame.events.length)events.push.apply(events,frame.events);
      // Refresh attack identity after tele resets, including repeated use of same id.
      if(id!==previousId||(id&&t+1e-7<previousLocal)){serial++;taken={};lastContactTime=-Infinity;}
      var live=instance.getState().attack, pulse=hitboxPulseIndex(live&&instance.getState().config.attacks[live.id],t);
      if(id&&pulse>=0&&frame.attackHitboxes.length){
        var startBoxes=(old&&old.attack&&old.attack.id===id&&old.attack.phase==='act')?old.attackHitboxes:[];
        for(var b=0;b<frame.attackHitboxes.length;b++){
          var box=frame.attackHitboxes[b], prior=startBoxes.filter(function(a){return a.id===box.id&&a.tag===box.tag;})[0]||box;
          var result=sweptCircles(prior.x,prior.y,box.x,box.y,box.r,sx,sy,ex,ey,pr);
          if(!result.hit)continue;
          var frac=result.t===null?0:result.t;
          var hx=prior.x+(box.x-prior.x)*frac,hy=prior.y+(box.y-prior.y)*frac;
          var tx=sx+(ex-sx)*frac,ty=sy+(ey-sy)*frac;
          if(!isInsideArena(tx,ty,pr,arena))continue;
          if(stoneOccluded(hx,hy,tx,ty,obstacles,options.stoneClearance===undefined?0:options.stoneClearance))continue;
          var globalTime=(world.tNow||0)+elapsed+sub*frac;
          var cooldown=frame.attack.minHitGap||0;
          var key=serial+':'+pulse;
          if(taken[key]||globalTime+1e-6<lastContactTime+cooldown)continue;
          taken[key]=true;lastContactTime=globalTime;
          // Parry window is optional host input. The adapter reports eligibility only.
          var parry=world.parryWindow || p.parryWindow || null;
          var eligible=!!(frame.attack.parry&&parry&&globalTime+1e-8>=parry.start&&globalTime<=parry.end+1e-8);
          contacts.push({attackId:id,attackSerial:serial,pulse:pulse+1,tag:box.tag,x:tx,y:ty,time:globalTime,
             damage:box.damage,parryable:!!frame.attack.parry,parryCandidate:eligible,kind:eligible?'parry_candidate':'hit_candidate',
             hostMustResolve:true});
          break;
        }
      }
      // Persistent crystal territory: host resolves all damage; hazards cannot be parried.
      // Newly spawned fields are inactive during their windup. All contacts use current-frame geometry.
      var hs=frame.hazards||[];
      for(var q=0;q<hs.length;q++){
        var h=hs[q];if(!h.active || !isInsideArena(h.x,h.y,h.r,arena))continue;
        var swept=sweptCircles(h.x,h.y,h.x,h.y,h.r,sx,sy,ex,ey,pr);
        if(!swept.hit)continue;
        var u=swept.t===null?0:swept.t;
        var txh=sx+(ex-sx)*u,tyh=sy+(ey-sy)*u;
        if(!isInsideArena(txh,tyh,pr,arena))continue;
        if(stoneOccluded(h.x,h.y,txh,tyh,obstacles,options.stoneClearance===undefined?0:options.stoneClearance))continue;
        var ht=(world.tNow||0)+elapsed+sub*u;
        if(hazardLast[h.id]!==undefined && ht-hazardLast[h.id]+1e-7<h.tickGap)continue;
        if(ht-lastHazardContact+1e-7<(instance.getState().config.defaults.crystalGlobalHitGap||0.65))continue;
        hazardLast[h.id]=ht;lastHazardContact=ht;
        contacts.push({attackId:h.sourceId,attackSerial:h.id,pulse:0,tag:'crystal_field',hazardId:h.id,
          x:txh,y:tyh,time:ht,damage:h.damage,parryable:false,parryCandidate:false,kind:'hit_candidate',hostMustResolve:true});
        break; // at most one persistent-field hit per substep
      }
      old=frame;previousId=id;previousLocal=t;elapsed+=sub;
    }
    // Prune cooldown records for crystals that have expired; bound memory over long fights.
    var alive=instance.getState().hazards||[];var ids={};
    for(var j=0;j<alive.length;j++)ids[alive[j].id]=true;
    for(var key in hazardLast)if(!ids[key])delete hazardLast[key];
    var result=old||instance.getLastFrame();
    // Shallow clone to preserve the unmodified core snapshot. No player health mutations.
    var out=Object.assign({},result,{events:events,contacts:contacts,contactMode:'host_resolves',contactSubstep:stepMax});
    return out;
  }
  return {step:step,beginAttack:function(id,w){reset();return instance.beginAttack(id,w);},interrupt:function(){reset();return instance.interrupt();},resetContacts:reset,snapshot:instance.snapshot,getLastFrame:instance.getLastFrame,getInstance:function(){return instance;}};
}
return {version:'1.0',createAdapter:makeAdapter,sweptCircles:sweptCircles,stoneOccluded:stoneOccluded,isInsideArena:isInsideArena};
});
