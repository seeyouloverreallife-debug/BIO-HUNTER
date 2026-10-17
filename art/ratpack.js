/* BIO Hunter - Ratpack runtime bundle: Config + Core + Art (unmodified, concatenated by tools/build-ratpack.ps1). Host: src/modules/20-combat/monster/rat-pack.js */
/* ---- RatpackConfig.js ---- */
/* Bio-Hunter Ratpack Config v0.9 - IIFE, script tag, offline */
(function(root, factory) { 'use strict'; root.RatpackConfig = factory(); })(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';
  var attacks = {
    R01:{id:'R01', name:'กัดฉับ', tele:0.50, act:0.18, recover:0.42, damage:13, hits:1, minHitGap:0, parry:true, phase:1, kind:'bite', reach:43, pulseWindows:[[0,1]]},
    R02:{id:'R02', name:'กวาดหาง', tele:0.64, act:0.30, recover:0.52, damage:16, hits:1, minHitGap:0, parry:true, phase:1, kind:'tail', reach:51, pulseWindows:[[0,1]]},
    R03:{id:'R03', name:'พุ่งทะลวง', tele:0.82, act:0.32, recover:0.80, damage:24, hits:1, minHitGap:0, parry:true, phase:1, kind:'dash', reach:105, pulseWindows:[[0,1]], opening:0.80},
    R04:{id:'R04', name:'กระโจนคู่', tele:0.65, act:0.55, recover:0.68, damage:15, hits:2, minHitGap:0.26, parry:true, phase:1, kind:'double', reach:46, pulseWindows:[[0.03,0.31],[0.57,0.92]]},
    R05:{id:'R05', name:'วิ่งอ้อมกัด', tele:0.95, act:0.50, recover:0.72, damage:18, hits:1, minHitGap:0, parry:true, phase:2, kind:'flank', reach:51, pulseWindows:[[0.15,0.95]]},
    R06:{id:'R06', name:'ฝูงรุมประสาน', tele:1.05, act:0.70, recover:0.92, damage:15, hits:2, minHitGap:0.33, parry:true, phase:2, kind:'combo', reach:48, pulseWindows:[[0.02,0.39],[0.54,0.97]], opening:0.92, requiresMinion:true},
    R07:{id:'R07', name:'คลื่นโพรงถล่ม', tele:1.10, act:0.82, recover:1.10, damage:29, hits:1, minHitGap:0, parry:false, phase:3, kind:'wave', reach:88, pulseWindows:[[0.35,0.91]], opening:1.10},
    N08:{id:'N08', name:'หางกังหัน', tele:0.85, act:0.75, recover:0.85, damage:14, hits:2, minHitGap:0.35, parry:true, phase:2, kind:'spin', reach:53, pulseWindows:[[0.04,0.39],[0.58,0.98]], opening:0.85},
    T08:{id:'T08', name:'พ่นกรวยพิษ', tele:0.90, act:0.95, recover:0.80, damage:12, hits:2, minHitGap:0.45, parry:false, phase:2, kind:'toxin', reach:82, pulseWindows:[[0.10,0.43],[0.60,0.96]], status:'toxin', opening:0.80},
    Z08:{id:'Z08', name:'คำรามเน่า', tele:0.95, act:0.75, recover:0.92, damage:20, hits:1, minHitGap:0, parry:false, phase:2, kind:'roar', reach:73, pulseWindows:[[0.28,0.90]], opening:0.92},
    R09:{id:'R09', name:'กรามฉีกสามจังหวะ', tele:0.74, act:0.96, recover:0.92, damage:13, hits:3, minHitGap:0.25, parry:true, phase:2, kind:'triple', reach:53, pulseWindows:[[0.04,0.23],[0.40,0.58],[0.76,0.95]], opening:0.92},
    R10:{id:'R10', name:'มุดดินพุ่งเสย', tele:1.16, act:0.53, recover:1.15, damage:32, hits:1, minHitGap:0, parry:true, phase:3, kind:'burrow', reach:164, pulseWindows:[[0.70,0.96]], opening:1.15},
    R11:{id:'R11', name:'ปิดทางวงล้อม', tele:1.18, act:0.96, recover:1.18, damage:21, hits:2, minHitGap:0.39, parry:true, phase:3, kind:'pincer', reach:58, pulseWindows:[[0.08,0.36],[0.64,0.92]], opening:1.18, requiresMinion:true},
    N12:{id:'N12', name:'พายุหางคม', tele:1.10, act:1.13, recover:1.22, damage:12, hits:3, minHitGap:0.32, parry:true, phase:3, kind:'razor', reach:64, pulseWindows:[[0.05,0.25],[0.37,0.57],[0.73,0.94]], opening:1.22},
    T12:{id:'T12', name:'ระเบิดฝุ่นพิษ', tele:1.22, act:1.00, recover:1.18, damage:22, hits:1, minHitGap:0, parry:false, phase:3, kind:'spore', reach:98, pulseWindows:[[0.26,0.83]], status:'toxin', opening:1.18},
    Z12:{id:'Z12', name:'ทุบพื้นซาก', tele:1.25, act:0.88, recover:1.26, damage:35, hits:1, minHitGap:0, parry:false, phase:3, kind:'slam', reach:92, pulseWindows:[[0.24,0.83]], opening:1.26},
    M01:{id:'M01', name:'กระโจนกัด', tele:0.50, act:0.16, recover:0.65, damage:10, hits:1, minHitGap:0, parry:true, phase:1, kind:'minibite', reach:31, pulseWindows:[[0,1]]},
    M02:{id:'M02', name:'พุ่งตัดหน้า', tele:0.75, act:0.28, recover:0.90, damage:12, hits:1, minHitGap:0, parry:true, phase:1, kind:'minidash', reach:58, pulseWindows:[[0,1]], opening:0.90},
    // v0.9.5: persistent toxic-vomit pool (source attack does not directly hit player).
    T13:{id:'T13', name:'สำรอกบ่อพิษ', tele:1.05, act:0.34, recover:0.96, damage:6, hits:5, minHitGap:0.90, parry:false, phase:2, kind:'vomit', reach:114, pulseWindows:[], status:'toxin', opening:0.96},
  };
  var variants = {
    normal:{minionCount:3,id:'normal', name:'หนูเขี้ยวหิน', desc:'หนูใต้ดินที่ล่าเป็นฝูง ประสานการกัดและฟาดหาง', alphaHp:1480, minionHp:310, speed:100, turn:3.6, damageMultiplier:1, signature:'N08',finisher:'N12', palette:{fur:'#8e7160',light:'#bca18b',belly:'#d9bbaa',ear:'#bf8d8b',mark:'#d19d5b',eye:'#241c17'}},
    toxin:{minionCount:2,id:'toxin', name:'หนูต่อมพิษ', desc:'หนูในโพรงชื้นที่มีต่อมพิษเรืองแสงตามแนวหลัง', alphaHp:1550, minionHp:330, speed:94, turn:3.2, damageMultiplier:1, signature:'T08',finisher:'T12', palette:{fur:'#687b61',light:'#a4b18b',belly:'#b8c29c',ear:'#a28686',mark:'#9bd45b',eye:'#e4f398'}},
    zombie:{minionCount:2,id:'zombie', name:'หนูซากคืนชีพ', desc:'ฝูงซากหนูดื้อดึงที่ก้าวผิดจังหวะแต่โจมตีรุนแรง', alphaHp:1700, minionHp:360, speed:82, turn:2.8, damageMultiplier:1, signature:'Z08',finisher:'Z12', palette:{fur:'#7a7a70',light:'#b2ad9e',belly:'#c8baaf',ear:'#9c8182',mark:'#c77c6c',eye:'#d0e8bf'}}
  };
  var zones = {
    horn:{name:'โคนหัว/คริสตัลอักเสบ', anchor:{x:0.63,y:0}, hurtbox:{x:0.68,y:0,r:0.54}, partRatio:0.29},
    flank:{name:'สีข้าง/แผลติดเชื้อ', anchor:{x:-0.07,y:0.62}, hurtbox:{x:-0.05,y:0,r:0.75}, partRatio:0.49},
    hind:{name:'สะโพกและขาหลัง/ข้ออักเสบ', anchor:{x:-0.70,y:-0.24}, hurtbox:{x:-0.73,y:0,r:0.54}, partRatio:0.37}
  };
  var evolutionStages = [{level:0,id:'latent',name:'คืนชีพเริ่มต้น'},{level:1,id:'scarred',name:'รอยแผลคืนชีพ'},{level:2,id:'deceptive',name:'พุ่งหลอก'},{level:3,id:'coordinated',name:'เสียงเรียกฝูง'},{level:4,id:'apex',name:'ร่างกลายพันธุ์ขั้นสูง'}];
  var statuses = {undying:{id:'undying',name:'กายคืนชีพ',description:'เมื่อ HP ถึงศูนย์เข้าสถานะ downed แล้วฟื้นได้ซ้ำโดยไม่จำกัดครั้ง จนกว่าจะถูก soul_seal'},soul_seal:{id:'soul_seal',name:'ผนึกวิญญาณ',description:'ท่าปิดจังหวะจากโฮสต์สำหรับร่างที่ downed หรือ reanimating เท่านั้น บล็อกการคืนชีพถาวร'}};
  var defaults = {aiEnabled:true, alphaRadius:29, minionRadius:22, actorCap:4, toxinVomit:true, toxinPoolRadius:34, toxinPoolDuration:4.50, toxinPoolFirstTick:0.35, toxinPoolTick:0.90, toxinPoolCap:2, arena:{cx:480,cy:312,r:268}, maxSubstep:0.008, minionAttackConcurrency:1, startAttackCooldown:0.85, minionCooldown:1.35, applyPartBreak:true, packSeparation:3, obstacleClearance:10, obstacleSteering:true, packCoordination:true, adaptivePack:true, woundedThreshold:0.42, protectorThreatRange:148, counterOnWhiff:true, counterMaxRange:132, counterReadyCooldown:0.95, counterMinRemaining:0.24, advancedAttacks:true, undyingZombie:true, reviveDownTimeAlpha:4.0, reviveDownTimeMinion:3.0, reviveWindup:1.05, reviveHpFractionAlpha:0.33, reviveHpFractionMinion:0.42, reviveInterruptDelay:2.25, undyingEvolution:true, evolveGrantedUndying:false, graveGuard:true, graveGuardRange:165, graveGuardCooldownFactor:0.82, zombieFeintDuration:0.58, zombieFeintAttackSpacing:3, packEcho:true, burrowSurfacingFraction:0.68, burrowPathSpacing:3};
  return {version:'0.9.5', name:'Ratpack', attacks:attacks, variants:variants, zones:zones, statuses:statuses, evolutionStages:evolutionStages, defaults:defaults};
});
/* ---- RatpackCore.js ---- */
/* BIO Hunter — Ratpack Core v0.9.5. Offline, deterministic IIFE; no DOM or player HP mutation. */
(function(root,factory){'use strict';root.RatpackCore=factory(root.RatpackConfig);})(typeof globalThis!=='undefined'?globalThis:this,function(Config){
'use strict';
if(!Config)throw Error('RatpackConfig.js must load first');
var PI=Math.PI,TAU=PI*2,EPS=1e-9;
function clamp(v,a,b){return Math.max(a,Math.min(v,b));}
function finite(v,d){return Number.isFinite(v)?v:d;}
function hypot(x,y){return Math.hypot(x,y);}
function length(a,b){return hypot(a.x-b.x,a.y-b.y);}
function angle(a){return Math.atan2(Math.sin(a),Math.cos(a));}
function turn(a,b,s){return angle(a+clamp(angle(b-a),-s,s));}
function copy(v){return JSON.parse(JSON.stringify(v));}
function local(x,y,a){var c=Math.cos(a),s=Math.sin(a);return{x:x*c-y*s,y:x*s+y*c};}
function closest(px,py,ax,ay,bx,by){var dx=bx-ax,dy=by-ay,d=dx*dx+dy*dy,t=d<EPS?0:clamp(((px-ax)*dx+(py-ay)*dy)/d,0,1);return{x:ax+dx*t,y:ay+dy*t,t:t};}
function blocked(a,b,rocks,pad){for(var i=0;i<rocks.length;i++){var r=rocks[i],p=closest(r.x,r.y,a.x,a.y,b.x,b.y);if(p.t>.015&&p.t<.985&&hypot(r.x-p.x,r.y-p.y)<r.r+finite(pad,1.5))return true;}return false;}
function makeRng(seed){var state=(Number(seed)>>>0)||0x9e3779b9;return function(){state^=state<<13;state^=state>>>17;state^=state<<5;return (state>>>0)/4294967296;};}
function readWorld(w,c){w=w||{};var a=w.arena||c.arena||Config.defaults.arena,p=w.player||{},o=Array.isArray(w.obstacles)?w.obstacles:[];return{
  arena:{cx:finite(a.cx,480),cy:finite(a.cy,312),r:Math.max(80,finite(a.r,268))},
  player:{x:finite(p.x,550),y:finite(p.y,312),r:clamp(finite(p.r,14),1,120),vx:finite(p.vx,0),vy:finite(p.vy,0)},
  obstacles:o.filter(function(v){return Number.isFinite(v.x)&&Number.isFinite(v.y)&&Number.isFinite(v.r)&&v.r>0;}).map(function(v){return{x:v.x,y:v.y,r:v.r};}),tNow:finite(w.tNow,0),opening:p.opening&&p.opening.kind==='heavy_whiff'&& (typeof p.opening.token==='string'||typeof p.opening.token==='number')&&Number.isFinite(p.opening.remaining)?{kind:'heavy_whiff',token:String(p.opening.token),remaining:Math.max(0,p.opening.remaining)}:null};}
function onArena(x,y,r,a){var dx=x-a.cx,dy=y-a.cy,d=hypot(dx,dy),max=Math.max(0,a.r-r-1);return d>max?{x:a.cx+dx/(d||1)*max,y:a.cy+dy/(d||1)*max}:{x:x,y:y};}
function circle(x,y,r,a){var p=onArena(x,y,0,a);return{type:'circle',x:p.x,y:p.y,r:Math.max(0,Math.min(r,a.r-hypot(p.x-a.cx,p.y-a.cy)-1))};}
function capsule(ax,ay,bx,by,r,a){var s=onArena(ax,ay,r,a),e=onArena(bx,by,r,a);return{type:'capsule',ax:s.x,ay:s.y,bx:e.x,by:e.y,r:r};}
function shapePoint(shape,pt){return shape.type==='circle'?{x:shape.x,y:shape.y}:closest(pt.x,pt.y,shape.ax,shape.ay,shape.bx,shape.by);}
function collision(shape,pt){var a=shapePoint(shape,pt);return hypot(a.x-pt.x,a.y-pt.y)<=shape.r+pt.r+EPS;}
function lerpShape(a,b,t){var r={type:a.type,r:a.r+(b.r-a.r)*t};if(a.type==='circle'){r.x=a.x+(b.x-a.x)*t;r.y=a.y+(b.y-a.y)*t;}else{['ax','ay','bx','by'].forEach(function(k){r[k]=a[k]+(b[k]-a[k])*t;});}return r;}
/* Exact continuous circle-vs-circle with linearly-changing radii; bounded adaptive capsule sampling. */
function sweptContact(from,to,pFrom,pTo){if(!from||!to||!pFrom||!pTo||from.type!==to.type)return{hit:false};
  if(from.type==='circle'){
    var dx=from.x-pFrom.x,dy=from.y-pFrom.y,vx=(to.x-from.x)-(pTo.x-pFrom.x),vy=(to.y-from.y)-(pTo.y-pFrom.y),r=from.r+pFrom.r,vr=(to.r-from.r)+(pTo.r-pFrom.r);
    var c=dx*dx+dy*dy-r*r;if(c<=EPS)return{hit:true,x:pFrom.x,y:pFrom.y,fraction:0};
    var a=vx*vx+vy*vy-vr*vr,b=2*(dx*vx+dy*vy-r*vr),roots=[];
    if(Math.abs(a)<1e-12){if(Math.abs(b)>1e-12)roots.push(-c/b);}else{var disc=b*b-4*a*c;if(disc>=0){var sq=Math.sqrt(disc);roots.push((-b-sq)/(2*a),(-b+sq)/(2*a));}}
    roots.sort(function(x,y){return x-y;});for(var i=0;i<roots.length;i++){var t=roots[i];if(t>=-EPS&&t<=1+EPS){t=clamp(t,0,1);var s=lerpShape(from,to,t),p={x:pFrom.x+(pTo.x-pFrom.x)*t,y:pFrom.y+(pTo.y-pFrom.y)*t,r:pFrom.r+(pTo.r-pFrom.r)*t};if(collision(s,p))return{hit:true,x:p.x,y:p.y,fraction:t};}}
    return{hit:false};
  }
  var keys=['ax','ay','bx','by'],maxMotion=hypot(pTo.x-pFrom.x,pTo.y-pFrom.y);keys.forEach(function(k){maxMotion=Math.max(maxMotion,Math.abs(to[k]-from[k]));});
  maxMotion=Math.max(maxMotion,Math.abs(to.r-from.r));var radius=Math.max(.4,Math.min(from.r,to.r,pFrom.r,pTo.r)),n=clamp(Math.ceil(maxMotion/(radius*.22)),1,4096);
  for(var j=0;j<=n;j++){var t2=j/n,sp=lerpShape(from,to,t2),pt={x:pFrom.x+(pTo.x-pFrom.x)*t2,y:pFrom.y+(pTo.y-pFrom.y)*t2,r:pFrom.r+(pTo.r-pFrom.r)*t2};if(collision(sp,pt))return{hit:true,x:pt.x,y:pt.y,fraction:t2};}
  return{hit:false};
}
function pulseOf(atk,fraction){for(var i=0;i<atk.pulseWindows.length;i++){var w=atk.pulseWindows[i];if(fraction>=w[0]-EPS&&fraction<=w[1]+EPS)return i;}return -1;}
/* Shared deterministic attack-pose sampler. The returned numbers are frame data: the
 * renderer never advances a clock and attackGeometry reads the same sweep angle. */
function motionPose(a,atk,phase,progress){
  var p=clamp(finite(progress,0),0,1),r=a.r||29,k=atk?atk.kind:'idle',angle=a.attack?a.attack.angle:a.facing;
  var gait=phase==='idle'?clamp(finite(a.visualSpeed,0)/90,0,1):.22;
  var foot=Math.sin((a.animT||0)*10.5),bodyLift=gait*Math.sin((a.animT||0)*21)*.025;
  var wind=phase==='tele'?Math.sin(p*PI*.5):0,release=phase==='recover'?(1-p):0;
  var windows=atk&&atk.pulseWindows||[],pulse=0,idx=-1;
  if(phase==='act')for(var h=0;h<windows.length;h++){
    var w=windows[h],q=(p-w[0])/(w[1]-w[0]);if(q>=0&&q<=1){pulse=Math.max(pulse,Math.sin(q*PI));idx=h;}}
  var bite=k==='bite'||k==='minibite'||k==='double'||k==='triple'||k==='combo'||k==='pincer'||k==='flank';
  var tail=k==='tail'||k==='spin'||k==='razor';
  var charge=k==='dash'||k==='minidash'||k==='burrow';
  var heavy=k==='slam'||k==='spore'||k==='wave'||k==='roar'||k==='vomit';
  var strikeAngle=angle;
  if(k==='triple')strikeAngle+=p<.33?-.23:p<.67?.18:-.08;
  else if(k==='double')strikeAngle+=p<.45?-.17:.17;
  else if(k==='combo')strikeAngle+=p<.47?-.55:.55;
  else if(k==='pincer')strikeAngle+=p<.5?-.34:.34;
  else if(k==='flank')strikeAngle+=(a.attack?a.attack.side:1)*.55;
  else if(k==='tail')strikeAngle+=PI-1.18+p*2.36;
  else if(k==='spin')strikeAngle+=PI-1.8+p*TAU*1.45;
  else if(k==='razor')strikeAngle+=PI-.72+(p*3%1)*1.44;
  var anticipation=(bite?.18:tail?.23:charge?.28:heavy?.25:.1)*wind;
  var thrust=phase==='act'?pulse*(bite?.27:charge?.18:heavy?.16:.07):0;
  var headYaw=bite?angleDifference(strikeAngle,angle):0;
  var tailLocal=angleDifference(strikeAngle,angle);
  var swingAmount=tail&&phase==='act'?Math.max(.28,pulse):0;
  var jaw=k==='vomit'?(phase==='tele'?.22+.48*wind:phase==='act'?.92:.18):(bite?(phase==='tele'?.14+.35*wind:phase==='act'?.22+.72*pulse:.06):.02);
  var braced=(wind+(phase==='act'&&charge?.8:0));
  var lunge=phase==='act'?pulse*3.4:0;
  var pose={version:1,mode:phase,id:atk?atk.id:null,pulse:idx,pulseStrength:pulse,
    body:{x:-r*anticipation+r*thrust*.12,y:r*bodyLift,tilt:(bite?headYaw*.13:0),sx:1+thrust*.09,sy:1-anticipation*.23},
    head:{x:r*(.12*thrust-.05*wind),y:r*(bite?headYaw*.23:0),rotation:headYaw*.68,jaw:jaw},
    feet:{frontLeft:-.13*foot*gait-.40*braced-.32*thrust,frontRight:.13*foot*gait+.40*braced+.32*thrust,
      rearLeft:.18*foot*gait-.17*braced,rearRight:-.18*foot*gait+.17*braced,reach:lunge},
    tail:{angle:tailLocal,reach:tail&&phase==='act'?atk.reach:r*2.52,striking:!!(tail&&phase==='act'),intensity:swingAmount},
    strike:{angle:strikeAngle,localAngle:angleDifference(strikeAngle,a.facing),reach:atk?atk.reach:0,active:phase==='act'&&idx>=0,type:k},
    recovery:release,crouch:anticipation,burrow:charge&&k==='burrow',impact:heavy&&phase==='act'?pulse:0};
  return pose;
}
function angleDifference(x,y){return Math.atan2(Math.sin(x-y),Math.cos(x-y));}
function makeActor(id,role,v,c,x,y,facing){var alpha=role==='alpha',r=alpha?c.alphaRadius:c.minionRadius,hp=alpha?v.alphaHp:v.minionHp;return{
  id:id,role:role,x:x,y:y,r:r,facing:facing,hp:hp,maxHp:hp,
  parts:{horn:hp*Config.zones.horn.partRatio,flank:hp*Config.zones.flank.partRatio,hind:hp*Config.zones.hind.partRatio},broken:{horn:false,flank:false,hind:false},
  mode:'idle',visualSpeed:0,attack:null,seq:0,cooldown:alpha?.55:1.10,animT:0,flash:0,hitRegistry:{},lastHitAt:-1e9,assistParent:null,assistChild:null,
  intent:'hold',tacticalRole:role==='alpha'?'pressure':role,stuckTime:0,navigation:{rock:-1,side:role==='flanker'?-1:1,angle:0},feint:null,evolution:{stage:0,stageId:'latent',lastFeintSeq:-3},diseases:{horn:null,flank:null,hind:null},statuses:{undying:false,soul_seal:false},revival:{count:0,stage:null,remaining:0,duration:0}};}
function hurtActor(a){if(a.mode==='dead'||a.mode==='captured'||(a.attack&&a.attack.id==='R10'&&a.attack.elapsed>=Config.attacks.R10.tele&&a.attack.elapsed<Config.attacks.R10.tele+Config.attacks.R10.act*0.68))return[];return Object.keys(Config.zones).map(function(z){var q=Config.zones[z].hurtbox,p=local(q.x*a.r,q.y*a.r,a.facing);return{entityId:a.id,zone:z,x:a.x+p.x,y:a.y+p.y,r:a.r*q.r,partHp:Math.max(0,a.parts[z]),broken:a.broken[z]};});}
function diseaseActor(a){return Object.keys(Config.zones).map(function(z){var q=Config.zones[z].anchor,p=local(q.x*a.r,q.y*a.r,a.facing);return{entityId:a.id,zone:z,x:a.x+p.x,y:a.y+p.y,disease:a.diseases[z]};});}
function attackGeometry(a,atk,progress,arena){var theta=a.attack?a.attack.angle:a.facing,p=clamp(progress,0,1),kind=atk.kind,r=a.r,cx=a.x,cy=a.y,pose=motionPose(a,atk,'act',p);
  function bar(s,e,rad,ang){ang=ang===undefined?theta:ang;return capsule(cx+Math.cos(ang)*s,cy+Math.sin(ang)*s,cx+Math.cos(ang)*e,cy+Math.sin(ang)*e,rad,arena);}
  if(kind==='triple')return[bar(r*.42,atk.reach,13,pose.strike.angle)];
  if(kind==='pincer')return[bar(r*.42,atk.reach,15,pose.strike.angle)];
  if(kind==='burrow')return[circle(cx,cy,p<.68?0:(r+6)*clamp((p-.68)/.10,0,1),arena)];
  if(kind==='razor')return[bar(r*.18,atk.reach,13,pose.strike.angle)];
  if(kind==='spore')return[circle(cx,cy,22+(atk.reach-22)*clamp((p-.24)/.46,0,1),arena)];
  if(kind==='slam')return[circle(cx,cy,20+(atk.reach-20)*clamp((p-.2)/.48,0,1),arena)];
  if(kind==='vomit')return[];
  if(kind==='bite')return[bar(r*.55,atk.reach,12)];if(kind==='minibite')return[bar(r*.4,atk.reach,10)];
  if(kind==='dash'||kind==='minidash')return[circle(cx,cy,r+5,arena)];
  if(kind==='flank')return[bar(r*.5,atk.reach,12,pose.strike.angle)];
  if(kind==='double')return[bar(r*.48,atk.reach,12,pose.strike.angle)];
  if(kind==='combo')return[bar(r*.4,atk.reach,14,pose.strike.angle)];
  if(kind==='tail')return[bar(r*.15,atk.reach,11,pose.strike.angle)];
  if(kind==='spin')return[bar(r*.2,atk.reach,11,pose.strike.angle)];
  if(kind==='wave')return[circle(cx,cy,22+(atk.reach-22)*clamp((p-.26)/.5,0,1),arena)];
  if(kind==='roar')return[circle(cx,cy,20+(atk.reach-20)*clamp((p-.2)/.6,0,1),arena)];
  if(kind==='triple'||kind==='pincer')return{type:'cone',x:actor.x,y:actor.y,r:atk.reach,angle:a,spread:kind==='pincer'?.62:.48};
  if(kind==='toxin')return[-.36,0,.36].map(function(ang){return bar(18,atk.reach,15,theta+ang);});
  return[];
}
function telegraphFor(actor,atk,arena){var a=actor.attack.angle,kind=atk.kind,origin={x:actor.x,y:actor.y};
  if(kind==='vomit'){var landing=actor.attack.vomitLanding;return{type:'circle',x:landing.x,y:landing.y,r:landing.valid?landing.r:0,valid:landing.valid};}
  if(kind==='burrow'&&actor.attack.burrow){var path=actor.attack.burrow;return{type:'burrow',ax:path.sx,ay:path.sy,bx:path.ex,by:path.ey,width:actor.r*.46,landingRadius:actor.r+8,blocked:path.blocked};}
  if(kind==='wave'||kind==='roar'||kind==='spore'||kind==='slam')return{type:'circle',x:actor.x,y:actor.y,r:Math.min(atk.reach,arena.r-length(origin,{x:arena.cx,y:arena.cy})-1)};
  if(kind==='tail'||kind==='spin'||kind==='razor')return{type:'arc',x:actor.x,y:actor.y,r:atk.reach,start:a+PI-1.8,end:a+PI+1.8};
  if(kind==='triple'||kind==='pincer')return{type:'cone',x:actor.x,y:actor.y,r:atk.reach,angle:a,spread:kind==='pincer'?.62:.48};
  if(kind==='toxin')return{type:'cone',x:actor.x,y:actor.y,r:atk.reach,angle:a,spread:.57};
  var extra={double:55,flank:65,combo:53,minibite:15,minidash:56,burrow:0};var dir=a+(kind==='flank'?actor.attack.side*.65:0),far=onArena(actor.x+Math.cos(dir)*(atk.reach+(extra[kind]||0)),actor.y+Math.sin(dir)*(atk.reach+(extra[kind]||0)),18,arena);
  return{type:'lane',ax:actor.x,ay:actor.y,bx:far.x,by:far.y,width:(kind==='dash'||kind==='burrow')?actor.r+8:19};
}
function createInstance(opts){opts=opts||{};var cfg=Object.assign({},Config.defaults,opts.config||{}),v=Config.variants[opts.variant||'normal'];if(!v)throw Error('Unknown Ratpack variant: '+opts.variant);
  cfg.arena=Object.assign({},Config.defaults.arena,cfg.arena||{});cfg.maxSubstep=clamp(finite(cfg.maxSubstep,.008),.002,.012);
  var random=makeRng(opts.seed===undefined?1:opts.seed),a0=cfg.arena,
      actors=[makeActor('alpha','alpha',v,cfg,a0.cx-80,a0.cy,0),makeActor('minion1','flanker',v,cfg,a0.cx-128,a0.cy-75,.1),makeActor('minion2','interceptor',v,cfg,a0.cx-128,a0.cy+75,-.1)],
      clock=0,last=null,worldLast=readWorld(null,cfg),lastEvents=[],phaseLast=1,reportedFormation='full_pack',
      packState={formation:'full_pack',woundedId:null,protectorId:null,graveTargetId:null,graveDefenderId:null,packEchoActive:false,lastCounter:null,counterCount:0},counterTokens=[],pendingEvents=[];
  // Stable IDs: existing minion1/minion2 unchanged; Normal gains minion3.
  if(v.id==='normal'&&cfg.actorCap>=4)actors.push(makeActor('minion3','flanker',v,cfg,a0.cx-174,a0.cy,0));
  var pools=[],poolSerial=0;
  actors.forEach(function(a){a.statuses.undying=v.id==='zombie'&&cfg.undyingZombie!==false;});
  function getActor(id){for(var k=0;k<actors.length;k++)if(actors[k].id===(id||'alpha'))return actors[k];return null;}
  function evolutionEnabled(a){return a.statuses.undying&&cfg.undyingEvolution!==false&&(v.id==='zombie'||cfg.evolveGrantedUndying===true);}
  function updateEvolution(a){var stage=evolutionEnabled(a)?Math.min(4,a.revival.count):0;a.evolution.stage=stage;a.evolution.stageId=Config.evolutionStages[stage].id;}
  function living(a){return a.mode!=='dead'&&a.mode!=='captured'&&a.mode!=='downed'&&a.mode!=='reanimating'&&a.hp>0;}
  // Reusable status contract. Statuses change monster state; player status/HP stay entirely host-owned.
  function downActor(a){
    if(a.assistChild)interruptOne(getActor(a.assistChild),false);
    releaseLink(a);a.attack=null;a.feint=null;a.hitRegistry={};a.lastHitAt=-1e9;
    a.hp=0;a.mode='downed';a.cooldown=1e9;a.intent='await_reanimation';
    var delay=a.role==='alpha'?cfg.reviveDownTimeAlpha:cfg.reviveDownTimeMinion;
    a.revival.stage='downed';a.revival.remaining=Math.max(.15,finite(delay,3));a.revival.duration=a.revival.remaining;
    pendingEvents.push({type:'undying_downed',entityId:a.id,at:clock,reviveNumber:a.revival.count+1,sealWindow:a.revival.remaining+Math.max(.45,finite(cfg.reviveWindup,1.05))});
  }
  function finalDeath(a,reason){
    if(a.assistChild)interruptOne(getActor(a.assistChild),false);
    releaseLink(a);a.attack=null;a.feint=null;a.hitRegistry={};a.hp=0;a.mode='dead';a.cooldown=1e9;a.intent='dead';
    a.revival.stage=null;a.revival.remaining=0;a.revival.duration=0;
    pendingEvents.push({type:'permanent_death',entityId:a.id,at:clock,reason:reason||'ordinary'});
  }
  function updateRevival(a,ds,at,events,w){
    if(a.mode!=='downed'&&a.mode!=='reanimating')return;
    var left=ds;
    while(left>EPS&&(a.mode==='downed'||a.mode==='reanimating')){
      var used=Math.min(left,a.revival.remaining);a.revival.remaining=Math.max(0,a.revival.remaining-used);left-=used;
      if(a.revival.remaining>EPS)break;
      if(a.statuses.soul_seal||!a.statuses.undying){finalDeath(a,'sealed');break;}
      if(a.mode==='downed'){
        a.mode='reanimating';a.revival.stage='reanimating';a.revival.remaining=Math.max(.45,finite(cfg.reviveWindup,1.05));a.revival.duration=a.revival.remaining;
        events.push({type:'revive_telegraph',entityId:a.id,at:at+ds-left,remaining:a.revival.remaining});
      }else{
        a.revival.count++;a.revival.stage=null;a.revival.remaining=0;a.revival.duration=0;
        var ratio=a.role==='alpha'?cfg.reviveHpFractionAlpha:cfg.reviveHpFractionMinion;
        a.hp=Math.max(1,Math.round(a.maxHp*clamp(finite(ratio,.36),.05,1)));
        var previousStage=a.evolution.stage;updateEvolution(a);
        a.mode='idle';a.intent='resurrected';a.cooldown=1.0;a.flash=.24;repairPosition(a,w);
        if(a.evolution.stage!==previousStage)events.push({type:'mutation_stage_change',entityId:a.id,at:at+ds-left,stage:a.evolution.stage,stageId:a.evolution.stageId,count:a.revival.count});
        if(a.evolution.stage>=3&&cfg.packEcho!==false)events.push({type:'pack_rally',entityId:a.id,at:at+ds-left,stage:a.evolution.stage});
        events.push({type:'resurrected',entityId:a.id,at:at+ds-left,count:a.revival.count,hp:a.hp,maxHp:a.maxHp,mutationStage:a.evolution.stage});
      }
    }
  }
  function setStatus(id,status,value){
    var a=getActor(id);if(!a||(status!=='undying'&&status!=='soul_seal'))return false;
    var enabled=value!==false;
    if(status==='soul_seal'){
      // Host MUST validate range/line-of-sight and the player's seal action before calling.
      if(!enabled||a.mode!=='downed'&&a.mode!=='reanimating'||a.statuses.soul_seal)return false;
      a.statuses.soul_seal=true;finalDeath(a,'soul_seal');updateTactics(worldLast);return true;
    }
    a.statuses.undying=enabled;updateEvolution(a);
    if(!enabled&&(a.mode==='downed'||a.mode==='reanimating'))finalDeath(a,'undying_removed');
    updateTactics(worldLast);return true;
  }
  function phase(){var a=actors[0];return a.hp/a.maxHp<=.33?3:a.hp/a.maxHp<=.66?2:1;}
  function freeMinions(){return actors.filter(function(a){return a.role!=='alpha'&&living(a)&&a.mode==='idle'&&!a.assistParent&&a.tacticalRole!=='retreat';});}
  function allowed(a,id,force){var atk=Config.attacks[id];if(!atk||!living(a))return false;
    if(a.role!=='alpha')return id==='M01'||id==='M02';
    if(id==='T13'&&(v.id!=='toxin'||cfg.toxinVomit===false))return false;
    if(id==='M01'||id==='M02'||(id==='N08'||id==='T08'||id==='Z08'||id==='N12'||id==='T12'||id==='Z12')&&id!==(id.endsWith('12')?v.finisher:v.signature))return false;
    if(!force&&atk.phase>phase())return false;
    if(!force&&cfg.advancedAttacks===false&&(id==='R09'||id==='R10'||id==='R11'||id==='N12'||id==='T12'||id==='Z12'))return false;
    if(atk.requiresMinion&&(!cfg.packCoordination||freeMinions().length<1))return false;
    return true;
  }
  // Attack route is committed ONCE at telegraph creation, from current geometry (not predicted contact).
  // Rock/arena checks use the full body radius. If the map changes during execution,
  // the actual substep movement still blocks against current obstacles.
  function burrowRoute(a,w,atk){var dx=Math.cos(a.facing),dy=Math.sin(a.facing),p=w.player;
    var projection=(p.x-a.x)*dx+(p.y-a.y)*dy,target=clamp(projection,48,atk.reach),step=Math.max(1,finite(cfg.burrowPathSpacing,3));
    var ex=a.x,ey=a.y,travel=0,blockedBy=null;
    for(var d=step;d<=target+step/2;d+=step){var dst=Math.min(target,d),nx=a.x+dx*dst,ny=a.y+dy*dst;
      if(hypot(nx-w.arena.cx,ny-w.arena.cy)+a.r>w.arena.r-1){blockedBy='rim';break;}
      var rock=false;for(var j=0;j<w.obstacles.length;j++)if(hypot(nx-w.obstacles[j].x,ny-w.obstacles[j].y)<a.r+w.obstacles[j].r+1){rock=true;break;}
      if(rock){blockedBy='rock';break;}ex=nx;ey=ny;travel=dst;
    }
    return{sx:a.x,sy:a.y,ex:ex,ey:ey,angle:a.facing,travel:travel,blocked:!!blockedBy,blockedBy:blockedBy,progress:0,emerged:false};
  }
  // Lock the landing during telegraph, never recalculate a safe area after warning.
  // The projectile cannot place a pool behind a solid rock or beyond the ring.
  function computeVomitLanding(a,w,atk){
    var dx=w.player.x-a.x,dy=w.player.y-a.y,dist=hypot(dx,dy),ang=dist>EPS?Math.atan2(dy,dx):a.facing;
    var radius=clamp(finite(cfg.toxinPoolRadius,34),12,52),limit=Math.min(atk.reach,Math.max(40,dist));
    var result={x:a.x,y:a.y,r:radius,valid:false};
    for(var d=Math.max(a.r+radius+3,42);d<=limit+EPS;d+=2){
      var travel=Math.min(d,limit),x=a.x+Math.cos(ang)*travel,y=a.y+Math.sin(ang)*travel;
      if(hypot(x-w.arena.cx,y-w.arena.cy)+radius>w.arena.r-2)break;
      if(blocked({x:a.x,y:a.y},{x:x,y:y},w.obstacles,1.5))break;
      var ok=true;for(var q=0;q<w.obstacles.length;q++)if(hypot(x-w.obstacles[q].x,y-w.obstacles[q].y)<radius+w.obstacles[q].r+2){ok=false;break;}
      if(!ok)break;result={x:x,y:y,r:radius,valid:true};
      if(travel>=limit-EPS)break;
    }
    return result;
  }
  function spawnPool(a,atk,events,at,w){
    var p=a.attack.vomitLanding;
    // Dynamic obstacles may invalidate the telegraphed landing; do not retarget.
    if(!p||!p.valid||hypot(p.x-w.arena.cx,p.y-w.arena.cy)+p.r>w.arena.r-1||
       w.obstacles.some(function(o){return hypot(o.x-p.x,o.y-p.y)<o.r+p.r+2;})||
       blocked({x:a.x,y:a.y},p,w.obstacles,1.5)){
      events.push({type:'toxin_pool_fizzled',entityId:a.id,attackId:atk.id,at:at});return;
    }
    var cap=clamp(Math.floor(finite(cfg.toxinPoolCap,2)),1,8);
    while(pools.length>=cap){var gone=pools.shift();events.push({type:'toxin_pool_expired',poolId:gone.id,reason:'cap',at:at});}
    var duration=clamp(finite(cfg.toxinPoolDuration,4.5),1,15),delay=clamp(finite(cfg.toxinPoolFirstTick,.35),.16,.8);
    var pool={id:'toxin_pool_'+(++poolSerial),sourceId:a.id,attackId:atk.id,sequence:a.attack.seq,
      x:p.x,y:p.y,r:p.r,createdAt:at,expiresAt:at+duration,nextTick:at+delay,
      tickGap:clamp(finite(cfg.toxinPoolTick,.90),.45,2),damageBase:atk.damage,status:'toxin',ticks:0};
    pools.push(pool);events.push({type:'toxin_pool_spawn',poolId:pool.id,entityId:a.id,x:p.x,y:p.y,r:p.r,at:at,expiresAt:pool.expiresAt});
  }
  function advancePools(start,end,w,hits,events){
    for(var j=pools.length-1;j>=0;j--){var pool=pools[j];
      while(pool.nextTick<=end+EPS&&pool.nextTick<=pool.expiresAt+EPS){
        var tick=pool.nextTick;pool.nextTick+=pool.tickGap;pool.ticks++;
        // Contact at the actual pulse time, not a predicted future path or a synthetic safe-zone check.
        var elapsed=tick-clock,x=w.player.x+w.player.vx*elapsed,y=w.player.y+w.player.vy*elapsed;
        var center={x:pool.x,y:pool.y},contact={x:x,y:y};
        if(hypot(x-pool.x,y-pool.y)<=pool.r+w.player.r+EPS&&
           hypot(x-w.arena.cx,y-w.arena.cy)<=w.arena.r-w.player.r+EPS&&
           !blocked(center,contact,w.obstacles,1.5)){
          hits.push({sourceId:pool.sourceId,targetId:'player',attackId:pool.attackId,sequence:pool.sequence,
            poolId:pool.id,pulse:pool.ticks-1,damageBase:pool.damageBase,damageMultiplier:v.damageMultiplier,
            parryable:false,status:pool.status,contact:contact,at:tick});
        }
      }
      if(pool.expiresAt<=end+EPS){pools.splice(j,1);events.push({type:'toxin_pool_expired',poolId:pool.id,reason:'duration',at:pool.expiresAt});}
    }
  }
  function start(a,id,force,context){if(!a||!allowed(a,id,force))return false;if(a.attack)releaseLink(a);
    var atk=Config.attacks[id];a.seq++;a.attack={id:id,elapsed:0,angle:a.facing,seq:a.seq,side:random()<.5?-1:1,assistStarted:false,context:context||'standard'};if(id==='R10')a.attack.burrow=burrowRoute(a,worldLast,atk);if(id==='T13')a.attack.vomitLanding=computeVomitLanding(a,worldLast,atk);a.mode='tele';a.feint=null;a.hitRegistry={};a.lastHitAt=-1e9;a.cooldown=0;a.intent='attack';return true;}
  function beginFeint(a,id){if(v.id!=='zombie'||a.role!=='alpha'||a.evolution.stage<2||!cfg.undyingEvolution||id!=='R03'||a.seq-a.evolution.lastFeintSeq<Math.max(1,Math.floor(finite(cfg.zombieFeintAttackSpacing,3))))return false;
    a.feint={elapsed:0,duration:Math.max(.45,finite(cfg.zombieFeintDuration,.58)),followUp:id,angle:a.facing};a.evolution.lastFeintSeq=a.seq;a.mode='feint';a.intent='false_lunge';a.cooldown=0;return true;}
  function releaseLink(a){if(a.assistParent){var parent=getActor(a.assistParent);if(parent&&parent.assistChild===a.id)parent.assistChild=null;a.assistParent=null;}
    if(a.assistChild){var child=getActor(a.assistChild);if(child&&child.assistParent===a.id)child.assistParent=null;a.assistChild=null;}}
  function endAttack(a){releaseLink(a);a.mode='idle';a.attack=null;a.hitRegistry={};a.intent='opening';a.cooldown=(a.role==='alpha'?cfg.startAttackCooldown:cfg.minionCooldown)*(a.tacticalRole==='grave_guard'?clamp(finite(cfg.graveGuardCooldownFactor,.82),.6,1):1);}
  function interruptOne(a,cascade){if(!a)return;if(a.mode==='reanimating'){a.mode='downed';a.revival.stage='downed';a.revival.remaining=Math.max(.15,finite(cfg.reviveInterruptDelay,2.25));a.revival.duration=a.revival.remaining;a.intent='revive_interrupted';pendingEvents.push({type:'revive_interrupted',entityId:a.id,at:clock});return;}if(!living(a))return;if(cascade&&a.assistChild){var child=getActor(a.assistChild);if(child&&living(child)&&child.assistParent===a.id){interruptOne(child,false);}}
    releaseLink(a);a.attack=null;a.feint=null;a.hitRegistry={};a.lastHitAt=-1e9;a.mode='idle';a.cooldown=.48;a.intent='interrupted';}
  function inside(actor,w){var p=onArena(actor.x,actor.y,actor.r,w.arena);actor.x=p.x;actor.y=p.y;}
  function clearPosition(a,x,y,w,ignorePack){if(length({x:x,y:y},{x:w.arena.cx,y:w.arena.cy})+a.r>w.arena.r-1+EPS)return false;
    for(var j=0;j<w.obstacles.length;j++){var o=w.obstacles[j];if(hypot(x-o.x,y-o.y)<a.r+o.r+1-EPS)return false;}
    if(!ignorePack&&cfg.packSeparation!==0)for(var z=0;z<actors.length;z++){var b=actors[z];if(b!==a&&living(b)&&hypot(x-b.x,y-b.y)<a.r+b.r+finite(cfg.packSeparation,3)-EPS)return false;}return true;
  }
  function repairPosition(a,w){inside(a,w);for(var iter=0;iter<8;iter++){var pushed=false;
      for(var j=0;j<w.obstacles.length;j++){var o=w.obstacles[j],dx=a.x-o.x,dy=a.y-o.y,d=hypot(dx,dy),min=a.r+o.r+1;if(d+EPS<min){var theta=d>EPS?Math.atan2(dy,dx):a.facing;a.x=o.x+Math.cos(theta)*min;a.y=o.y+Math.sin(theta)*min;pushed=true;}}
      if(cfg.packSeparation!==0)for(var z=0;z<actors.length;z++){var b=actors[z];if(b===a||!living(b))continue;var vx=a.x-b.x,vy=a.y-b.y,di=hypot(vx,vy),gap=a.r+b.r+finite(cfg.packSeparation,3);if(di+EPS<gap){var an=di>EPS?Math.atan2(vy,vx):(z%2?PI/2:-PI/2);a.x=b.x+Math.cos(an)*gap;a.y=b.y+Math.sin(an)*gap;pushed=true;}}
      inside(a,w);if(!pushed)break;
    }
  }
  function move(a,dx,dy,w,events,noSlide,eventTime,ignorePack){var steps=Math.max(1,Math.ceil(hypot(dx,dy)/4)),sx=dx/steps,sy=dy/steps,hit=false;
    for(var j=0;j<steps;j++){
      var nx=a.x+sx,ny=a.y+sy,valid=clearPosition(a,nx,ny,w,ignorePack);
      if(!valid){hit=true;if(!noSlide){if(clearPosition(a,a.x+sx,a.y,w,ignorePack)){nx=a.x+sx;ny=a.y;}else if(clearPosition(a,a.x,a.y+sy,w,ignorePack)){nx=a.x;ny=a.y+sy;}else break;}else break;}
      a.x=nx;a.y=ny;
    }
    if(hit&&events)events.push({type:'obstacle_contact',entityId:a.id,at:finite(eventTime,clock)});return hit;
  }
  // Purely geometric pack coordination.  Tactical roles never replace stable entity IDs/roles.
  function updateTactics(w){
    var alive=actors.filter(function(a){return a.role!=='alpha'&&living(a);}),wounded=null,other=null;
    if(cfg.adaptivePack===false){
      packState.formation=alive.length>=2?'full_pack':alive.length===1?'duo':'solo';
      packState.woundedId=null;packState.protectorId=null;
      actors[0].tacticalRole=alive.length?'pressure':'solo_pressure';
      alive.forEach(function(a){a.tacticalRole=alive.length===1?'harrier':a.role;});
      actors.forEach(function(a){if(!living(a))a.tacticalRole='out';});return;
    }
    alive.forEach(function(a){if(a.hp/a.maxHp<=clamp(finite(cfg.woundedThreshold,.42),.1,.85)&&(!wounded||a.hp/a.maxHp<wounded.hp/wounded.maxHp))wounded=a;});
    if(wounded)other=alive.find(function(a){return a!==wounded;})||null;
    packState.formation=alive.length===0?'solo':alive.length===1?'duo':wounded?'shield_wounded':'full_pack';
    packState.woundedId=wounded?wounded.id:null;packState.protectorId=wounded&&other?other.id:null;
    actors[0].tacticalRole=wounded&&length(w.player,wounded)<finite(cfg.protectorThreatRange,148)?'guardian':alive.length?'pressure':'solo_pressure';
    alive.forEach(function(a){a.tacticalRole=wounded&&a===wounded?'retreat':wounded&&a===other?'screen':alive.length===1?'harrier':a.role;});
    actors.forEach(function(a){if(!living(a))a.tacticalRole='out';});
    packState.graveTargetId=null;packState.graveDefenderId=null;packState.packEchoActive=v.id==='zombie'&&cfg.packEcho!==false&&actors.some(function(a){return living(a)&&a.evolution.stage>=3;});
    if(cfg.graveGuard!==false){
      var corpses=actors.filter(function(a){return (a.mode==='downed'||a.mode==='reanimating')&&a.statuses.undying&&!a.statuses.soul_seal&&length(a,w.player)<=Math.max(70,finite(cfg.graveGuardRange,165));});
      corpses.sort(function(a,b){return length(a,w.player)-length(b,w.player)||a.id.localeCompare(b.id);});
      var corpse=corpses[0];
      if(corpse){
        var defenders=actors.filter(function(a){return living(a)&&a!==corpse;});
        defenders.sort(function(a,b){return length(a,corpse)-length(b,corpse)||a.id.localeCompare(b.id);});
        var guard=defenders[0];if(guard){packState.graveTargetId=corpse.id;packState.graveDefenderId=guard.id;guard.tacticalRole='grave_guard';packState.formation='grave_guard';}
      }
    }
  }
  function distActorPlayer(a,p){return hypot(a.x-p.x,a.y-p.y);}
  function flankGoal(a,w){if(a.tacticalRole==='grave_guard'&&packState.graveTargetId){var corpse=getActor(packState.graveTargetId),ang=Math.atan2(w.player.y-corpse.y,w.player.x-corpse.x);return onArena(corpse.x+Math.cos(ang)*48,corpse.y+Math.sin(ang)*48,a.r+3,w.arena);}
    var p=w.player,lead=actors[0],head=Math.atan2(p.y-lead.y,p.x-lead.x),side=a.id==='minion1'?-1:a.id==='minion3'?-1:1;
    var role=a.tacticalRole;
    if(role==='retreat'){
      // An injured minion moves away from the player instead of instantly despawning or healing.
      var away=Math.atan2(a.y-p.y,a.x-p.x);
      var gap=distActorPlayer(a,p);return onArena(p.x+Math.cos(away)*Math.max(125,gap+32),p.y+Math.sin(away)*Math.max(125,gap+32),a.r+3,w.arena);
    }
    if(role==='screen'&&packState.woundedId){
      var patient=getActor(packState.woundedId),toPlayer=Math.atan2(p.y-patient.y,p.x-patient.x);
      return onArena(patient.x+Math.cos(toPlayer)*39,patient.y+Math.sin(toPlayer)*39,a.r+3,w.arena);
    }
    var orbit=head+(a.id==='minion3'?PI:side*(role==='harrier'?1.72:role==='flanker'?1.35:2.04)),distance=role==='harrier'?55:role==='flanker'?54:61;
    return onArena(p.x+Math.cos(orbit)*distance,p.y+Math.sin(orbit)*distance,a.r+3,w.arena);
  }
  function alphaGoal(a,w){if(a.tacticalRole==='grave_guard'&&packState.graveTargetId){var corpse=getActor(packState.graveTargetId),ang=Math.atan2(w.player.y-corpse.y,w.player.x-corpse.x);return onArena(corpse.x+Math.cos(ang)*53,corpse.y+Math.sin(ang)*53,a.r+2,w.arena);}
    if(a.tacticalRole==='guardian'&&packState.woundedId){
      var patient=getActor(packState.woundedId),angleToPlayer=Math.atan2(w.player.y-patient.y,w.player.x-patient.x);
      return onArena(patient.x+Math.cos(angleToPlayer)*49,patient.y+Math.sin(angleToPlayer)*49,a.r+2,w.arena);
    }return{x:w.player.x,y:w.player.y};
  }
  // Reactive punish ONLY after the host explicitly confirms a missed heavy swing.
  // No inferred whiff, no predicted contact, no special instant hit.
  function reactToWhiff(w,events,at){var o=w.opening;
    if(!cfg.aiEnabled||!cfg.counterOnWhiff||!o||o.remaining<finite(cfg.counterMinRemaining,.24)||counterTokens.indexOf(o.token)!==-1)return;
    var candidates=actors.filter(function(a){return living(a)&&!a.attack&&a.cooldown<=finite(cfg.counterReadyCooldown,.95)&&length(a,w.player)<=(a.role==='alpha'?finite(cfg.counterMaxRange,132):85);});
    candidates.sort(function(a,b){var da=length(a,w.player),db=length(b,w.player);return (da<=58?0:1)-(db<=58?0:1)||(a.role==='alpha'?0:1)-(b.role==='alpha'?0:1)||da-db;});
    for(var j=0;j<candidates.length;j++){var a=candidates[j],d=length(a,w.player),id=a.role==='alpha'?(d<=58?'R01':'R03'):(d<=49?'M01':'M02');
      if(a.role!=='alpha'&&actors.some(function(b){return b!==a&&b.role!=='alpha'&&b.attack;}))continue;
      var toward=Math.atan2(w.player.y-a.y,w.player.x-a.x);a.facing=toward;
      if(start(a,id,false,'counter')){
        counterTokens.push(o.token);if(counterTokens.length>48)counterTokens.shift();
        a.intent='counter';packState.counterCount++;packState.lastCounter={token:o.token,entityId:a.id,attackId:id,at:at};
        events.push({type:'counter_start',reason:'confirmed_heavy_whiff',token:o.token,entityId:a.id,attackId:id,at:at});return;
      }
    }
  }
  function steerTarget(a,goal,w){if(cfg.obstacleSteering===false)return goal;
    var memory=a.navigation, nearest=null,nearestDist=1e9;
    for(var k=0;k<w.obstacles.length;k++){
      var o=w.obstacles[k],p=closest(o.x,o.y,a.x,a.y,goal.x,goal.y),d=hypot(o.x-p.x,o.y-p.y),safe=o.r+a.r+finite(cfg.obstacleClearance,10)+5;
      if(p.t>.01&&p.t<.99&&d<safe){var near=hypot(a.x-o.x,a.y-o.y);
        if(near<nearestDist){nearest={index:k,rock:o,safe:safe};nearestDist=near;}}
    }
    if(!nearest){memory.rock=-1;return goal;}
    var i=nearest.index,rock=nearest.rock,radius=nearest.safe,theta=Math.atan2(a.y-rock.y,a.x-rock.x);
    // Preserve a detour side while passing the same rock; avoids left/right jitter.
    if(memory.rock!==i){memory.rock=i;memory.side=a.role==='flanker'?-1:1;memory.angle=theta;}
    var side=memory.side;
    // Tangent-like walking target on an obstacle's ring. Advance angle until LOS is clear.
    var waypoint=onArena(rock.x+Math.cos(theta+side*.54)*radius,rock.y+Math.sin(theta+side*.54)*radius,a.r,w.arena);
    waypoint.detour=true;return waypoint;
  }
  function chase(a,dt,w){var p=w.player,goal=a.role==='alpha'?alphaGoal(a,w):flankGoal(a,w);
    // Do not stand inside the player's center after a committed charge: make room for the next tell.
    // Uses current geometry only (never future player position or guessed hit state).
    if(a.role==='alpha'&&a.tacticalRole!=='guardian'&&distActorPlayer(a,p)<45){
      var retreatAngle=distActorPlayer(a,p)>EPS?Math.atan2(a.y-p.y,a.x-p.x):a.facing+PI;
      goal=onArena(p.x+Math.cos(retreatAngle)*64,p.y+Math.sin(retreatAngle)*64,a.r+2,w.arena);
    }
    var desired=steerTarget(a,goal,w),dx=desired.x-a.x,dy=desired.y-a.y,d=hypot(dx,dy),look=Math.atan2(p.y-a.y,p.x-a.x),speed=v.speed*(a.role==='alpha'?1:a.tacticalRole==='retreat'?.95:1.20),stop=desired.detour?3:(a.tacticalRole==='guardian'||a.tacticalRole==='grave_guard')?14:a.role==='alpha'?57:11;
    if(a.role==='alpha'&&distActorPlayer(a,p)<45)stop=5;
    a.facing=turn(a.facing,look,v.turn*dt);a.intent=desired.detour?'navigate':a.tacticalRole;
    if(d>stop){var travel=Math.min(speed*dt,d-stop),oldX=a.x,oldY=a.y;move(a,dx/d*travel,dy/d*travel,w,null,false);var actual=hypot(a.x-oldX,a.y-oldY);a.stuckTime=actual<travel*.2?a.stuckTime+dt:0;}
    else a.stuckTime=0;
  }
  function choose(a,w){var d=length(a,w.player);if(a.role!=='alpha'){
      if(a.assistParent||d>(a.tacticalRole==='grave_guard'?95:82))return null;
      if(a.tacticalRole==='retreat'&&d>38)return null;
      var attacking=actors.filter(function(b){return b.role!=='alpha'&&b.attack;}).length;
      if(attacking>=cfg.minionAttackConcurrency)return null;
      return a.tacticalRole==='grave_guard'?'M02':(packState.packEchoActive&&actors[0].attack&&random()<.66?'M02':d>51?'M02':random()<.75?'M01':'M02');
    }
    if(d>122)return null;
    var options=[];
    if(d<58)options.push('R01','R02','R04');
    else if(d<83)options.push('R01','R02','R03','R04');
    else options.push('R03','R04');
    if(a.tacticalRole==='guardian'&&d<82)options.push('R01','R02');
    if(a.tacticalRole==='grave_guard'&&d<105)options.push('R03','R03');
    if(v.id==='zombie'&&cfg.undyingEvolution!==false&&a.evolution.stage>=2&&d>38&&d<116)options.push('R03','R03','R03');
    if(phase()>=2){if(v.id==='toxin'&&cfg.toxinVomit!==false&&d<=122&&pools.length<cfg.toxinPoolCap)options.push('T13','T13','T13');if(cfg.advancedAttacks!==false&&d<72)options.push('R09');if(d>52)options.push('R05');if(d<100)options.push(v.signature);if(allowed(a,'R06',false)&&d<99){options.push('R06');if(packState.packEchoActive)options.push('R06','R06');}}
    if(phase()===3){
      if(length(a,{x:w.arena.cx,y:w.arena.cy})<w.arena.r-110)options.push('R07');
      if(cfg.advancedAttacks!==false){
        if(d>44&&d<122)options.push('R10','R10');
        if(d<97&&allowed(a,'R11',false)){options.push('R11');if(packState.packEchoActive)options.push('R11','R11');}
        if(d<108&&length(a,{x:w.arena.cx,y:w.arena.cy})<w.arena.r-114)options.push(v.finisher,v.finisher,v.finisher);
      }
    }
    return options[Math.floor(random()*options.length)];
  }
  function arrangeAssist(a,events,t){if(!a.attack||a.attack.id!=='R06'&&a.attack.id!=='R11'||a.attack.assistStarted||a.attack.elapsed<(a.attack.id==='R11'?.42:.30)-EPS)return;
    a.attack.assistStarted=true;var possible=freeMinions();if(!possible.length)return;
    // A dedicated helper joins the visible R06 telegraph, starts an actual M02 with its own HP/hitboxes.
    var helper=possible[Math.floor(random()*possible.length)];helper.facing=Math.atan2(worldLast.player.y-helper.y,worldLast.player.x-helper.x);
    if(start(helper,'M02',true)){helper.assistParent=a.id;a.assistChild=helper.id;helper.intent='assist';events.push({type:'assist_start',entityId:helper.id,parentId:a.id,attackId:'M02',parentAttack:a.attack.id,at:t});}
  }
  function actMovement(a,atk,dt,w,events,t){var speed={dash:320,minidash:200,double:100,minibite:90,flank:130,combo:75,burrow:260,pincer:62,triple:45}[atk.kind]||0;if(!speed||a.attack.dashStopped)return;
    var an=a.attack.angle+(atk.kind==='flank'?a.attack.side*.65:0),hit=move(a,Math.cos(an)*speed*dt,Math.sin(an)*speed*dt,w,events,atk.kind==='dash'||atk.kind==='minidash'||atk.kind==='burrow',t);
    if(hit&&(atk.kind==='dash'||atk.kind==='minidash'||atk.kind==='burrow')){a.attack.dashStopped=true;events.push({type:'dash_stopped',entityId:a.id,attackId:atk.id,at:t});}
  }
  // Burrow uses a locked geometric route, then attacks ONLY in the surfaced pulse.
  // No phantom contact during travel; 1st-party swept frames remain the source of truth.
  function moveBurrow(a,atk,p1,p2,w,events,at){var path=a.attack.burrow;if(!path)return;
    var rise=clamp(finite(cfg.burrowSurfacingFraction,.68),.60,.68),old=clamp(p1/rise,0,1),next=clamp(p2/rise,0,1);
    if(next>old+EPS&&!a.attack.dashStopped){
      var tx=path.sx+(path.ex-path.sx)*next,ty=path.sy+(path.ey-path.sy)*next;
      var collided=move(a,tx-a.x,ty-a.y,w,events,true,at,true);
      if(collided){a.attack.dashStopped=true;path.ex=a.x;path.ey=a.y;path.travel=hypot(path.ex-path.sx,path.ey-path.sy);path.blocked=true;path.blockedBy='dynamic_obstacle';
        events.push({type:'burrow_route_blocked',entityId:a.id,attackId:atk.id,at:at});}
    }
    path.progress=next;
    if(p1<rise-EPS&&p2>=rise-EPS&&!path.emerged){path.emerged=true;
      events.push({type:'burrow_emerge',entityId:a.id,attackId:atk.id,x:a.x,y:a.y,at:at-(p2-rise)*atk.act});}
  }
  function step(dt,raw){if(!Number.isFinite(dt)||dt<0||dt>10)throw Error('dt must be finite seconds 0..10');var w=readWorld(raw,cfg),hits=[],boxes=[],events=pendingEvents.splice(0),frameStart=clock,consumed=0;worldLast=w;
    actors.forEach(function(a){if(living(a)&&!(a.attack&&a.attack.id==='R10'&&a.attack.elapsed>=Config.attacks.R10.tele&&a.attack.elapsed<Config.attacks.R10.tele+Config.attacks.R10.act*.68))repairPosition(a,w);});
    updateTactics(w);
    if(packState.formation!==reportedFormation){events.push({type:'formation_change',formation:packState.formation,woundedId:packState.woundedId,at:frameStart});reportedFormation=packState.formation;}
    reactToWhiff(w,events,frameStart);
    while(consumed<dt-EPS){var ds=Math.min(cfg.maxSubstep,dt-consumed),sliceStart=consumed,end=consumed+ds;
      updateTactics(w);
      for(var k=0;k<actors.length;k++){
        var a=actors[k];if(a.mode==='downed'||a.mode==='reanimating'){updateRevival(a,ds,frameStart+sliceStart,events,w);continue;}if(!living(a))continue;a.animT+=ds;a.flash=Math.max(0,a.flash-ds);
        if(a.feint){a.feint.elapsed+=ds;
          if(a.feint.elapsed+EPS>=a.feint.duration){var follow=a.feint.followUp;a.feint=null;a.mode='idle';if(start(a,follow,false,'post_feint'))events.push({type:'attack_start',entityId:a.id,attackId:follow,at:frameStart+end,context:'post_feint'});else{a.cooldown=.4;a.intent='feint_cancelled';}}continue;}
        if(!a.attack){a.cooldown=Math.max(0,a.cooldown-ds);if(cfg.aiEnabled){var motionOldX=a.x,motionOldY=a.y;chase(a,ds,w);a.visualSpeed=hypot(a.x-motionOldX,a.y-motionOldY)/ds;if(a.cooldown<=EPS){var choice=choose(a,w);if(choice){if(beginFeint(a,choice)){events.push({type:'feint_start',entityId:a.id,attackId:choice,at:frameStart+end,duration:a.feint.duration});}else if(startAttackInternal(a,choice,false))events.push({type:'attack_start',entityId:a.id,attackId:choice,at:frameStart+end});}}}else a.visualSpeed=0;continue;}
        a.visualSpeed=0;var atk=Config.attacks[a.attack.id],act=a.attack,prev=act.elapsed,finish=prev+ds,tel=atk.tele,actEnd=tel+atk.act,recEnd=actEnd+atk.recover;
        if(a.mode==='tele'&&finish>=tel-EPS){a.mode='act';events.push({type:'attack_phase',entityId:a.id,attackId:atk.id,phase:'act',at:frameStart+sliceStart+Math.max(0,tel-prev)});}
        var activeStart=Math.max(prev,tel),activeEnd=Math.min(finish,actEnd);
        if(activeEnd>activeStart+EPS){var p1=(activeStart-tel)/atk.act,p2=(activeEnd-tel)/atk.act,gs=attackGeometry(a,atk,p1,w.arena);
          var oldX=a.x,oldY=a.y,activeWorldFrom=sliceStart+(activeStart-prev),activeWorldTo=sliceStart+(activeEnd-prev);
          if(atk.kind==='burrow')moveBurrow(a,atk,p1,p2,w,events,frameStart+activeWorldTo);else actMovement(a,atk,activeEnd-activeStart,w,events,frameStart+activeWorldTo);
          if(atk.kind==='vomit'&&!act.poolSpawned&&p1<=.50+EPS&&p2>=.50-EPS){act.poolSpawned=true;spawnPool(a,atk,events,frameStart+sliceStart+Math.max(0,tel+atk.act*.5-prev),w);}
          var ge=attackGeometry(a,atk,p2,w.arena),pulse=pulseOf(atk,(p1+p2)/2),fromPlayer={x:w.player.x+w.player.vx*activeWorldFrom,y:w.player.y+w.player.vy*activeWorldFrom,r:w.player.r},toPlayer={x:w.player.x+w.player.vx*activeWorldTo,y:w.player.y+w.player.vy*activeWorldTo,r:w.player.r};
          if(pulse>=0)for(var h=0;h<ge.length;h++){
            var from=gs[h],to=ge[h];boxes.push({entityId:a.id,attackId:atk.id,sequence:act.seq,pulse:pulse,strikeAngleFrom:motionPose(a,atk,'act',p1).strike.angle,strikeAngleTo:motionPose(a,atk,'act',p2).strike.angle,damageBase:atk.damage,damageMultiplier:v.damageMultiplier,parryable:atk.parry,status:atk.status||null,from:from,to:to,activeFrom:frameStart+activeWorldFrom,activeTo:frameStart+activeWorldTo});
            var key=act.seq+':'+pulse;if(a.hitRegistry[key])continue;
            var contact=sweptContact(from,to,fromPlayer,toPlayer);
            if(contact.hit){var at=frameStart+activeWorldFrom+contact.fraction*(activeWorldTo-activeWorldFrom),source={x:oldX+(a.x-oldX)*contact.fraction,y:oldY+(a.y-oldY)*contact.fraction};
              if(at-a.lastHitAt>=atk.minHitGap-EPS&&!blocked(source,{x:contact.x,y:contact.y},w.obstacles,1.5)&&hypot(contact.x-w.arena.cx,contact.y-w.arena.cy)<=w.arena.r-toPlayer.r+1){
                a.hitRegistry[key]=true;a.lastHitAt=at;hits.push({sourceId:a.id,targetId:'player',attackId:atk.id,sequence:act.seq,pulse:pulse,strikeAngleFrom:motionPose(a,atk,'act',p1).strike.angle,strikeAngleTo:motionPose(a,atk,'act',p2).strike.angle,damageBase:atk.damage,damageMultiplier:v.damageMultiplier,parryable:atk.parry,status:atk.status||null,contact:{x:contact.x,y:contact.y},at:at});
              }
            }
          }
        }
        act.elapsed=finish;
        if(a.mode==='act'&&finish>=actEnd-EPS){a.mode='recover';a.intent='opening';events.push({type:'attack_phase',entityId:a.id,attackId:atk.id,phase:'recover',at:frameStart+sliceStart+Math.max(0,actEnd-prev)});}
        if(finish>=recEnd-EPS){events.push({type:'attack_end',entityId:a.id,attackId:atk.id,at:frameStart+sliceStart+Math.max(0,recEnd-prev)});endAttack(a);}
      }
      arrangeAssist(actors[0],events,frameStart+end);
      advancePools(frameStart+sliceStart,frameStart+end,w,hits,events);
      consumed=end;
    }
    clock+=dt;updateTactics(w);var ph=phase();if(ph!==phaseLast){events.push({type:'phase_change',phase:ph,at:clock});phaseLast=ph;}
    lastEvents=events;last=Object.assign({},snapshot(),{hazardHitboxes:copy(pools.map(function(p){return{poolId:p.id,sourceId:p.sourceId,attackId:p.attackId,type:'circle',x:p.x,y:p.y,r:p.r,damageBase:p.damageBase,status:p.status,parryable:false};})),attackHitboxes:copy(boxes),hits:copy(hits),events:copy(events),dt:dt});return copy(last);
  }
  function startAttackInternal(a,id,force){return start(a,id,force);}
  function snapshot(){var ents=actors.map(function(a){var atk=a.attack?Config.attacks[a.attack.id]:null,t=a.attack?a.attack.elapsed:0,ph=atk?(t<atk.tele?'tele':t<atk.tele+atk.act?'act':'recover'):'idle',pr=atk?(ph==='tele'?t/atk.tele:ph==='act'?(t-atk.tele)/atk.act:(t-atk.tele-atk.act)/atk.recover):0;
      return{id:a.id,role:a.role,x:a.x,y:a.y,r:a.r,facing:a.facing,hp:a.hp,maxHp:a.maxHp,mode:a.mode,intent:a.intent,burrow:a.attack&&a.attack.burrow?{stage:t<atk.tele?'windup':t<atk.tele+atk.act*.68?'submerged':t<atk.tele+atk.act?'emerging':'surfaced',progress:a.attack.burrow.progress,emerged:a.attack.burrow.emerged,start:{x:a.attack.burrow.sx,y:a.attack.burrow.sy},landing:{x:a.attack.burrow.ex,y:a.attack.burrow.ey},blocked:a.attack.burrow.blocked,blockedBy:a.attack.burrow.blockedBy}:null,feint:a.feint?{elapsed:a.feint.elapsed,duration:a.feint.duration,progress:clamp(a.feint.elapsed/a.feint.duration,0,1),followUp:a.feint.followUp,angle:a.feint.angle}:null,evolution:{enabled:evolutionEnabled(a),stage:a.evolution.stage,stageId:a.evolution.stageId,reviveCount:a.revival.count},assistParent:a.assistParent,assistChild:a.assistChild,animT:a.animT,visualSpeed:a.visualSpeed,flash:a.flash,tacticalRole:a.tacticalRole,broken:copy(a.broken),statuses:copy(a.statuses),revival:{count:a.revival.count,stage:a.revival.stage,remaining:a.revival.remaining,duration:a.revival.duration,progress:a.revival.duration>0?clamp(1-a.revival.remaining/a.revival.duration,0,1):0},hurtboxes:hurtActor(a),injectionPoints:diseaseActor(a),pose:motionPose(a,atk,ph,pr),attack:atk?{id:atk.id,name:atk.name,phase:ph,phaseProgress:clamp(pr,0,1),progress:clamp(t/(atk.tele+atk.act+atk.recover),0,1),elapsed:t,tele:atk.tele,act:atk.act,recover:atk.recover,parryable:atk.parry,angle:a.attack.angle,sequence:a.attack.seq,context:a.attack.context,vomitLanding:a.attack.vomitLanding?copy(a.attack.vomitLanding):null}:null};
    });
    var telegraphs=[];actors.forEach(function(a){if(a.mode==='feint'&&a.feint){var f=a.feint,reach=Config.attacks[f.followUp].reach,to=onArena(a.x+Math.cos(f.angle)*reach,a.y+Math.sin(f.angle)*reach,a.r+8,worldLast.arena);telegraphs.push({entityId:a.id,type:'feint',attackId:f.followUp,remaining:Math.max(0,f.duration-f.elapsed),geometry:{type:'lane',ax:a.x,ay:a.y,bx:to.x,by:to.y,width:a.r+8}});}
      if(a.mode==='tele'&&a.attack){var atk=Config.attacks[a.attack.id];telegraphs.push({entityId:a.id,attackId:atk.id,remaining:Math.max(0,atk.tele-a.attack.elapsed),geometry:telegraphFor(a,atk,worldLast.arena)});}});
    return{version:Config.version,variant:v.id,time:clock,pools:pools.map(function(p){return{id:p.id,sourceId:p.sourceId,attackId:p.attackId,x:p.x,y:p.y,r:p.r,createdAt:p.createdAt,expiresAt:p.expiresAt,remaining:Math.max(0,p.expiresAt-clock),nextTick:p.nextTick,damageBase:p.damageBase,status:p.status};}),phase:phase(),position:{x:actors[0].x,y:actors[0].y,facing:actors[0].facing},mode:actors[0].mode,attack:ents[0].attack,arena:copy(worldLast.arena),obstacles:copy(worldLast.obstacles),coordination:{livingMinions:actors.filter(function(a){return a.role!=='alpha'&&living(a);}).length,activeMinionAttacks:actors.filter(function(a){return a.role!=='alpha'&&a.attack!==null;}).length,helperId:actors[0].assistChild,formation:packState.formation,woundedId:packState.woundedId,protectorId:packState.protectorId,graveTargetId:packState.graveTargetId,graveDefenderId:packState.graveDefenderId,packEchoActive:packState.packEchoActive,counterCount:packState.counterCount,lastCounter:copy(packState.lastCounter)},sealTargets:ents.filter(function(e){return e.mode==='downed'||e.mode==='reanimating';}).map(function(e){var h=e.injectionPoints.find(function(p){return p.zone==='horn';});return{entityId:e.id,zone:'horn',x:h.x,y:h.y,r:e.r*.54,state:e.mode,remaining:e.revival.remaining};}),encounterResolved:actors.every(function(a){return a.mode==='dead'||a.mode==='captured';}),revivalTelegraphs:ents.filter(function(e){return e.mode==='reanimating';}).map(function(e){return{entityId:e.id,type:'reanimation',x:e.x,y:e.y,r:e.r+10,remaining:e.revival.remaining,progress:e.revival.progress};}),entities:ents,hurtboxes:ents.flatMap(function(e){return e.hurtboxes;}),injectionPoints:ents.flatMap(function(e){return e.injectionPoints;}),telegraphs:telegraphs};
  }
  function applyDamage(id,amount,zone){var a=getActor(id);if(!a||!living(a)||!Number.isFinite(amount)||amount<=0)return{applied:0};var damage=Math.max(0,amount);a.flash=.16;a.hp=Math.max(0,a.hp-damage);
    if(zone&&Object.prototype.hasOwnProperty.call(a.parts,zone)){a.parts[zone]=Math.max(0,a.parts[zone]-damage);if(cfg.applyPartBreak&&a.parts[zone]<=0)a.broken[zone]=true;}
    if(a.hp<=0){if(a.statuses.undying&&!a.statuses.soul_seal)downActor(a);else finalDeath(a,'ordinary');}
    updateTactics(worldLast);var ph=phase();return{entityId:a.id,applied:damage,hp:a.hp,maxHp:a.maxHp,broken:copy(a.broken),dead:a.mode==='dead',downed:a.mode==='downed',willRevive:a.mode==='downed'||a.mode==='reanimating',phase:ph};
  }
  function capture(id){var a=getActor(id);if(!a||!living(a))return false;if(a.assistChild)interruptOne(getActor(a.assistChild),false);releaseLink(a);a.mode='captured';a.attack=null;a.feint=null;a.hitRegistry={};a.cooldown=1e9;a.intent='captured';updateTactics(worldLast);return true;}
  function setDisease(id,zone,disease){var a=getActor(id);if(!a||!Config.zones[zone])return false;a.diseases[zone]=disease||null;return true;}
  function setPose(id,x,y,facing){var a=getActor(id);if(!a||![x,y,facing].every(Number.isFinite))return false;var p=onArena(x,y,a.r,worldLast.arena);a.x=p.x;a.y=p.y;a.facing=angle(facing);return true;}
  function beginAttack(id,entityId){return startAttackInternal(getActor(entityId||'alpha'),id,true);}
  function interrupt(at,entityId){if(entityId){interruptOne(getActor(entityId),true);}else actors.forEach(function(a){interruptOne(a,true);});lastEvents=[{type:'interrupted',entityId:entityId||'all',at:Number.isFinite(at)?at:clock}];last=Object.assign({},snapshot(),{attackHitboxes:[],hits:[],events:copy(lastEvents),dt:0});return copy(snapshot());}
  return{step:step,beginAttack:beginAttack,interrupt:interrupt,snapshot:function(){return copy(snapshot());},getLastFrame:function(){return copy(last||snapshot());},applyDamage:applyDamage,capture:capture,setDisease:setDisease,setPose:setPose,setStatus:setStatus,hurtboxes:function(){return copy(actors.flatMap(hurtActor));},get clock(){return clock;}};
}
return{version:Config.version,createInstance:createInstance,hurtboxes:function(instance){return instance.hurtboxes();},sweptContact:sweptContact,collision:collision,lineBlocked:blocked};
});
/* ---- RatpackArt.js ---- */
/* Ratpack v0.9.4 - SNAPSHOT-DRIVEN ANIMATION TRANSITIONS. Snapshot-only deterministic canvas painter.
 * Render pipeline: silhouette -> tail -> paws -> layered fur -> distinguishing
 * anatomy -> articulated head -> hit-linked strike accents -> status VFX.
 * No imports, browser globals, external assets, timers, mutation, or RNG.
 */
(function(root,factory){'use strict';root.RatpackArt=factory(root.RatpackConfig);})(typeof globalThis!=='undefined'?globalThis:this,function(C){
'use strict';
if(!C)throw Error('RatpackArt requires RatpackConfig');
var TAU=Math.PI*2;
function clamp(a,b,c){return Math.max(b,Math.min(c,a));}
function ell(c,x,y,rx,ry,rot,paint){c.fillStyle=paint;c.beginPath();c.ellipse(x,y,Math.max(.001,rx),Math.max(.001,ry),rot||0,0,TAU);c.fill();}
function path(c,p,paint,width){c.beginPath();c.moveTo(p[0],p[1]);for(var i=2;i<p.length;i+=2)c.lineTo(p[i],p[i+1]);c.lineWidth=width;c.lineCap='round';c.lineJoin='round';c.strokeStyle=paint;c.stroke();}
function bez(c,a,b,d,e,f,g,h,i,paint,width){c.beginPath();c.moveTo(a,b);c.bezierCurveTo(d,e,f,g,h,i);c.strokeStyle=paint;c.lineWidth=width;c.lineCap='round';c.stroke();}
function gradient(c,x1,y1,x2,y2,a,b,d){var g=c.createLinearGradient(x1,y1,x2,y2);g.addColorStop(0,a);g.addColorStop(.48,b);g.addColorStop(1,d);return g;}
function fillPath(c,pts,paint){c.beginPath();c.moveTo(pts[0],pts[1]);for(var k=2;k<pts.length;k+=2)c.lineTo(pts[k],pts[k+1]);c.closePath();c.fillStyle=paint;c.fill();}
function getArt(v){
 if(v==='toxin')return{top:'#91a58a',shade:'#293a34',deep:'#435349',tuft:'#bdc9a0',belly:'#d4d0ae',pale:'#eff6cf',ears:'#a98291',inner:'#e2abb2',tail:'#bd8d90',tip:'#f2c3a9',eyes:'#e6fc84',claws:'#e3dbc5',mark:'#a1ec70',ridges:'#637e4e'};
 if(v==='zombie')return{top:'#acaa9f',shade:'#343937',deep:'#575e5a',tuft:'#ddd7c2',belly:'#d7b9ac',pale:'#f1e4c4',ears:'#8e777d',inner:'#bb8b94',tail:'#988687',tip:'#d8c3ac',eyes:'#b8fba8',claws:'#dfdcc9',mark:'#88e4a7',ridges:'#737f76'};
 return{top:'#c3a78a',shade:'#4d332c',deep:'#7b5a4b',tuft:'#edd3aa',belly:'#e1c7a7',pale:'#fff0d5',ears:'#a97472',inner:'#e2a9a2',tail:'#b98783',tip:'#f4c2ab',eyes:'#181811',claws:'#f1dec4',mark:'#e3b46a',ridges:'#9a6f50'};
}
// All secondary motions come from the immutable snapshot. No timers or RNG here.
// Combat windups / active contacts damp these cosmetic motions to keep tells readable.
function secondary(e){
 var t=e.animT||0,p=e.pose||{},busy=e.attack&&e.attack.phase;
 var down=['dead','captured','downed','reanimating'].indexOf(e.mode)>=0;
 var speed=clamp(e.visualSpeed||0,0,180)/180;
 var k=down?0:busy?busy==='act'?.10:.24:Math.max(.20,1-speed*.68);
 var breath=Math.sin(t*2.85+(e.role==='alpha'?.3:1.1))*k;
 var sniff=Math.sin(t*8.7)*Math.sin(t*2.1)*k;
 var twitch=Math.pow(Math.max(0,Math.sin(t*3.1+.52)),12)*k;
 return {breath:breath,sniff:sniff,twitch:twitch,tail:Math.sin(t*2.1+1.2)*k,blink:(!busy&&!down&&Math.pow(Math.max(0,Math.sin(t*.77+2.1)),28)>.58)?1:0,
  down:down,activity:k,pressure:clamp(speed+.22*(busy==='tele'?1:0),0,1)};
}
// Distinct species locomotion is cosmetic only. Art reads the current frame,
// never infers an attack or writes to Core. During tele/act all gait adjustments
// are suppressed to preserve the exact combat pose and strike direction.
function inspectMotion(e,variant){
 var v=variant||e.variant||'normal',t=Number.isFinite(e.animT)?e.animT:0,attack=e.attack,
     phase=attack&&attack.phase,mode=e.mode||'idle',wound=e.broken||{},
     down=mode==='dead'||mode==='captured'||mode==='downed',
     reviving=mode==='reanimating',speed=clamp(e.visualSpeed||0,0,180),
     traveling=(mode==='idle'||mode==='chase')?clamp(speed/90,0,1):0;
 // Attack windups and active frames must never bend the authored weapon/pose.
 var allowance=(phase==='act'||phase==='tele'||phase==='recover'||e.burrow||e.feint||down)?0:1;
 if(reviving)allowance=v==='zombie'?.36:0;
 var wounded=!!(wound.hind||wound.flank||wound.horn||e.phase3),limp=wound.hind?1:wounded?.35:0;
 var freq=v==='normal'?12.6:v==='toxin'?8.1:6.6,cycle=t*freq,
     left=Math.sin(cycle),right=Math.sin(cycle+Math.PI),pulse=Math.sin(t*2.1),
     spasm=Math.pow(Math.max(0,Math.sin(t*5.3+1.4)),15);
 var m={variant:v,travel:traveling*allowance,breathe:0,torsoX:0,torsoY:0,torsoYaw:0,
     headX:0,headY:0,headYaw:0,earLeft:0,earRight:0,tailDrag:0,jawSlack:0,
     frontLeft:0,frontRight:0,rearLeft:0,rearRight:0,frontReach:0,
     spasm:0,glandPulse:0,limp:limp,down:down,reviving:reviving};
 if(v==='normal'){
  // Strong alternating shoulder action, quick head checks, ears pricked forward.
  m.torsoY=allowance*(.016*Math.sin(cycle*2)*traveling+.007*pulse);
  m.torsoYaw=allowance*.021*left*traveling;
  m.headYaw=allowance*(.045*Math.sin(t*2.4)+.018*left*traveling);
  m.headX=allowance*.030*Math.sin(t*2.4);
  m.earLeft=allowance*(-.075+.027*Math.sin(t*3.1));
  m.earRight=allowance*(.068-.026*Math.sin(t*3.3));
  m.frontLeft=allowance*traveling*.102*left;
  m.frontRight=allowance*traveling*.102*right;
  m.rearLeft=allowance*traveling*.080*right*(1-limp*.4);
  m.rearRight=allowance*traveling*.080*left*(1-limp*.4);
  m.frontReach=allowance*traveling*.027*Math.abs(left);
 }else if(v==='toxin'){
  // Fluid-filled back swings slowly sideways; rear paw takes a shorter step.
  m.torsoY=allowance*(.040*Math.sin(cycle*.5)*traveling+.015*pulse);
  m.torsoYaw=allowance*(.043*Math.sin(cycle*.5)*traveling+.018*pulse);
  m.headY=allowance*.035*Math.sin(cycle*.5+1.1);
  m.headYaw=allowance*(.034*Math.sin(t*3.4)+.019*spasm);
  m.earLeft=allowance*(.028*Math.sin(t*2.3));
  m.earRight=allowance*(-.048+.044*spasm);
  m.frontLeft=allowance*traveling*.078*left;
  m.frontRight=allowance*traveling*.070*right;
  m.rearLeft=allowance*traveling*.028*Math.max(0,right)*(1-limp*.4);
  m.rearRight=allowance*traveling*.060*left;
  m.tailDrag=allowance*.06;
  m.jawSlack=allowance*(.045+.022*spasm);
  m.spasm=allowance*spasm;
  m.glandPulse=.5+.5*Math.sin(t*3.1+.9);
 }else{
  // Delayed left hind leg, stiff torso and broken neck movement. Mutation may
  // modify how visible the stagger is but never magnify actual combat damage.
  var level=clamp((e.evolution&&e.evolution.stage)||0,0,4),jerk=Math.pow(Math.max(0,Math.sin(t*4.9+.6)),18);
  m.torsoY=allowance*(.022*Math.sin(cycle*.62)*traveling+.014*jerk);
  m.torsoYaw=allowance*(.036*Math.sin(cycle*.72)*traveling+.039*jerk);
  m.headYaw=allowance*(.035*Math.sin(t*1.9)+(.050+.008*level)*jerk);
  m.headY=allowance*(.025*Math.sin(t*1.7)+.014*jerk);
  m.earLeft=allowance*(-.11+.030*jerk);
  m.earRight=allowance*(.070-.020*Math.sin(t*1.7));
  m.frontLeft=allowance*traveling*.085*left;
  m.frontRight=allowance*traveling*.068*right;
  m.rearLeft=allowance*traveling*.021*Math.max(0,Math.sin(cycle-.95))*(1-limp*.50);
  m.rearRight=allowance*traveling*.078*left;
  m.tailDrag=allowance*.085;
  m.jawSlack=allowance*(.085+.033*jerk);
  m.spasm=allowance*jerk;
  m.glandPulse=0;
 }
 // Wounds remain legible in any species, but do not displace the hit zones.
 if(limp){m.rearLeft*=1-limp*.33;m.torsoYaw+=allowance*.014*limp*Math.sin(cycle*.7);}
 return m;
}
// Anatomy is a COSMETIC read-only layer. Combat pose, hurtboxes and position
// still belong exclusively to RatpackCore. visualState is optional host art-only
// intent (threat/stagger/collapse); it cannot cause any attack or damage.
function inspectAnatomy(e,variant){
 var v=variant||e.variant||'normal',attack=e.attack&&e.attack.phase,
     down=['dead','captured','downed'].indexOf(e.mode)>=0,
     reviving=e.mode==='reanimating',state=down?'collapse':(e.mode==='stunned'||e.mode==='stagger')?'stagger':(!attack&&e.visualState)||'neutral',
     tt=Number.isFinite(e.visualT)?e.visualT:(Number.isFinite(e.animT)?e.animT:0),
     q=clamp(Number.isFinite(e.visualProgress)?e.visualProgress:1,0,1),
     speed=clamp(e.visualSpeed||0,0,160)/160,
     wound=e.broken||{},injured=!!(wound.hind||wound.flank||e.phase3),
     active=attack==='act'||attack==='tele'||attack==='recover'||!!e.burrow||!!e.feint,
     allow=active?0:1,
     threat=(state==='threat'&&!active)?q:0,
     stagger=(state==='stagger'&&!active)?q:0,
     collapse=down||state==='collapse'?Math.max(q,down?1:0):0,
     gait=(e.mode==='chase'||e.mode==='idle')?speed:0,
     left=Math.sin(tt*(v==='normal'?11.8:v==='toxin'?7.3:5.8)),
     breathing=(Math.sin(tt*(v==='normal'?2.7:v==='toxin'?2.05:1.3)));
 // All offsets below are measured in body radii and clamped inside the drawn
 // silhouette. No offset ever enters collision or injection coordinates.
 var m={state:state,threat:threat,stagger:stagger,collapse:collapse,
   shoulderRoll:allow*gait*.032*left,
   scapulaLeft:allow*gait*.09*Math.max(0,left),
   scapulaRight:allow*gait*.09*Math.max(0,-left),
   hipRoll:allow*gait*.036*Math.sin(tt*6.4),
   ribExpansion:allow*.022*breathing,
   neckFlex:0,furLift:0,frontBrace:0,rearDrag:0,
   headDrop:0,bodySquash:1,torsoWobble:0,legSplay:0,
   tailTension:0,blinkPressure:0};
 if(v==='normal'){
  m.furLift=threat*.75;
  m.frontBrace=threat*.32;
  m.neckFlex=threat*.05;
  m.tailTension=threat*.34;
  m.shoulderRoll+=allow*.018*Math.sin(tt*2.3)*threat;
 }else if(v==='toxin'){
  m.ribExpansion+=allow*.010*Math.sin(tt*3.1);
  m.torsoWobble=allow*.045*Math.sin(tt*2.4)*(1-.55*threat);
  m.frontBrace=threat*.18;
  m.neckFlex=-threat*.055;
  m.furLift=threat*.22;
  m.rearDrag=allow*(.08+.08*(injured?1:0));
  m.tailTension=threat*.14;
 }else{
  var sp=Math.pow(Math.max(0,Math.sin(tt*4.8+.63)),17);
  m.torsoWobble=allow*.042*sp;
  m.neckFlex=-.03*allow+.095*threat;
  m.furLift=.11+.38*threat;
  m.rearDrag=allow*(.18+.12*(injured?1:0));
  m.frontBrace=threat*.26;
  m.tailTension=threat*.48;
  m.blinkPressure=.22;
 }
 m.neckFlex+=-stagger*.22;
 m.legSplay=stagger*.38+collapse*.58;
 m.headDrop=stagger*.25+collapse*.33;
 m.rearDrag+=stagger*.15+collapse*.40;
 m.bodySquash=clamp(1-stagger*.12-collapse*.25,.70,1);
 m.shoulderRoll+=stagger*.10*Math.sin(tt*8.5);
 m.hipRoll+=stagger*.15;
 m.torsoWobble+=stagger*.08;
 m.furLift*=1-collapse;
 return m;
}
function drawLimb(c,r,x,y,front,side,skin,style,an){
 // Rounded humerus/femur -> elbow/knee -> metapodial -> paw. Endpoints belong
 // to the *painting*, not the actor collider.
 var sg=side<0?-1:1;
 var shoulderX=front?.23:-.56, shoulderY=sg*(front?.45:.39),
     wristX=x/r, wristY=y/r,
     kneeX=(shoulderX+wristX)*.52-(front?.085:-.055)+an.frontBrace*(front?.07:0),
     kneeY=sg*(front?.79:.86)+an.legSplay*sg*.18;
 path(c,[r*shoulderX,r*shoulderY,r*kneeX,r*kneeY,r*wristX,r*wristY],skin.shade,Math.max(2,r*(front?.22:.24)));
 path(c,[r*shoulderX-r*.045,r*shoulderY-r*.05,r*kneeX-r*.06,r*kneeY-r*.07,r*wristX-r*.025,r*wristY-r*.03],skin.deep,Math.max(1,r*.10));
 ell(c,r*kneeX,r*kneeY,r*.15,r*.16,front?.22:-.23,skin.top);
 ell(c,r*kneeX-r*.033,r*kneeY-r*.041,r*.072,r*.082,0,'rgba(245,219,186,.18)');
}
function anatomyPlanes(c,r,e,v,skin,an,detail){
 // Shoulder blades, pelvic girdle, rib cage and soft neck: their motion is
 // readable at 28px without expanding the collision silhouette.
 c.save();
 ell(c,r*.17,-r*.34,r*(.28+an.scapulaLeft*.45),r*.31,-.35,
   gradient(c,-r*.04,-r*.72,r*.41,-r*.01,skin.tuft,skin.top,skin.deep));
 ell(c,r*.18,r*.31,r*(.30+an.scapulaRight*.45),r*.27,.29,
   'rgba(42,27,25,.17)');
 ell(c,-r*.61,-r*.19,r*.29,r*.38,.15,'rgba(255,237,209,.105)');
 ell(c,-r*.64,r*.27,r*.24,r*.28,-.2,'rgba(30,26,22,.20)');
 // Curving rib shadows follow the torso axis and tighten during collapse.
 for(var i=0;i<3;i++){
  var x=-r*.32+i*r*.19;
  bez(c,x,-r*.27,x+r*.055,-r*.15,x+r*.07,r*.19,x+r*.045,r*.28,
   i===0?'rgba(23,20,18,.27)':'rgba(15,23,20,.17)',Math.max(.7,r*.026));
 }
 // Tendons visually bridge head to shoulders; no changes to attack reach.
 bez(c,r*.18,-r*.41,r*.30,-r*.33,r*.39,-r*.23,r*.51,-r*.13,
   'rgba(253,222,192,.24)',Math.max(.8,r*.065));
 bez(c,r*.18,r*.42,r*.34,r*.36,r*.42,r*.26,r*.52,r*.17,
   'rgba(25,20,19,.23)',Math.max(.8,r*.075));
 if(an.threat>.01){
  // Arched back and raised guard hair are *not* warning geometry.
  c.globalAlpha*=.35+.35*an.threat;
  for(var j=0;j<9;j++){
   var xx=-r*.71+j*r*.16,yy=-r*(.57+.045*Math.sin(j*1.7));
   path(c,[xx,yy,xx-r*.055,yy-r*(.12+.09*an.furLift)],skin.tuft,Math.max(.8,r*.033));
  }
 }
 if(an.stagger>.01){
  ell(c,-r*.20,r*.46,r*.45,r*.14,.2,'rgba(67,35,37,'+(.08+.10*an.stagger)+')');
 }
 if(an.collapse>.01){
  ell(c,-r*.41,r*.32,r*.40,r*.17,-.10,'rgba(40,25,24,'+(.10+.12*an.collapse)+')');
 }
 c.restore();
}
function dorsalQuills(c,r,v,m,skin,detail){
 // Silhouette ornaments keyed to the family: recognizable at normal gameplay scale.
 if(!detail)return;
 c.save();c.lineCap='round';
 if(v==='normal'){
  for(var j=0;j<10;j++){
   var x=-r*.75+j*r*.15,y=-r*(.65+.06*Math.sin(j*2.8));
   var sway=m.breath*r*.013;
   path(c,[x,y,x+r*.085,y-r*(.16+(j%3)*.035)+sway],j%2?skin.ridges:skin.tuft,Math.max(.85,r*.050));
  }
 }else if(v==='toxin'){
  for(var i=0;i<7;i++){
   var px=-r*.68+i*r*.21,py=-r*.61+(i%2)*r*.035,glow=.42+.18*m.breath;
   bez(c,px,py,px+r*.05,py-r*.12,px+r*.13,py-r*.21,px+r*.16,py-r*.24,'rgba(154,237,120,'+glow+')',Math.max(1,r*.052));
  }
 }else{
  for(var n=0;n<8;n++){
   var ax=-r*.76+n*r*.19,ay=-r*(.58+.025*(n%3));
   path(c,[ax,ay,ax+r*.08,ay-r*(.07+(n%2)*.05)],n%3?'#9aa99b':'#d1c7b3',Math.max(1,r*.054));
  }
 }
 c.restore();
}
function livingSurface(c,r,e,v,m,skin,detail,style){
 // Shoulder / rib movement breathes through already-rendered color planes.
 // Highlights are subtle; telegraph colors remain exclusively the combat system's.
 var k=clamp(m.breath,-1,1);
 c.save();
 ell(c,-r*.18,-r*.34,r*.54,r*.10,-.10,'rgba(255,244,204,'+(.055+.02*k)+')');
 if(v==='normal'){
  // Hard bony ridgeline, rough side guard fur, and a recognizable amber nape.
  for(var i=0;i<6;i++){
   var x=-r*.49+i*r*.21;
   path(c,[x,r*.44,x-r*.06,r*.54+(i%2)*r*.03],i%2?'#93664d':'#d5a779',Math.max(.8,r*.055));
  }
  path(c,[r*.14,-r*.29,r*.33,-r*.33,r*.45,-r*.20],'rgba(255,228,174,.45)',Math.max(1,r*.045));
 }else if(v==='toxin'){
  var glow=.60+.28*style.glandPulse;
  // Animated vascular lines connect the raised fluid reservoirs.
  for(var b=0;b<3;b++){
   var bx=-r*.58+b*r*.29;
   bez(c,bx,-r*.12,bx+r*.12,r*.01,bx+r*.13,r*.20,bx+r*.30,r*.34,
      'rgba(175,250,114,'+(.35*glow)+')',Math.max(1,r*.052));
  }
  ell(c,-r*.11,r*.32,r*.085,r*.067,0,'rgba(195,255,116,'+(.26*glow)+')');
  if(detail){ell(c,-r*.27,-r*.28,r*(.085+.018*style.glandPulse),r*.060,0,'rgba(192,255,153,'+(.16+.23*style.glandPulse)+')');}
 }else{
  // Sinew below fractured hide and stitch-like pale bone fragments.
  ell(c,-r*.57,-r*.02,r*.15,r*.28,.18,'rgba(75,37,39,.58)');
  for(var q=0;q<4;q++){
   var xx=-r*.64+q*r*.11;
   path(c,[xx,-r*.13,xx+r*.12,-r*.04],q%2?'#b5bba6':'#cfaa96',Math.max(.7,r*.031));
  }
 }
 c.restore();
}
function affectFace(c,r,e,v,m){
 if(m.down){
   // Eyelid layer communicates that this corpse is not currently attacking.
   for(var d=-1;d<=1;d+=2){
     path(c,[r*.61,d*r*.24,r*.82,d*r*.25],'rgba(41,35,31,.85)',Math.max(1.2,r*.055));
   }
 }
 if(m.blink&&!m.down){
   for(var side=-1;side<=1;side+=2){
    path(c,[r*.61,side*r*.245,r*.83,side*r*.245],'#38332b',Math.max(1.1,r*.065));
   }
 }
 if(v==='zombie'){
  // One collapsed, asymmetric eye socket; thicker on high mutation stages.
  var stage=(e.evolution&&e.evolution.stage)||0;
  ell(c,r*.76,r*.256,r*(.10+stage*.008),r*.026,-.25,'rgba(63,45,47,.75)');
 }
}
function roundedEar(c,x,y,r,angle,skin,variant){
 c.save();c.translate(x,y);c.rotate(angle);ell(c,1.3,1.8,r*.52,r*.68,0,'rgba(10,12,9,.30)');
 ell(c,0,0,r*.59,r*.70,0,skin.ears);ell(c,-r*.08,-r*.1,r*.40,r*.49,-.24,skin.inner);
 ell(c,-r*.17,-r*.24,r*.20,r*.23,0,'rgba(255,213,205,.40)');
 if(variant==='zombie'){path(c,[-r*.3,r*.07,r*.03,r*.26,r*.29,r*.02],'#5f4c55',Math.max(1,r*.055));}
 c.restore();
}
function drawPaw(c,r,x,y,angle,p,front,skin){
 c.save();c.translate(x,y);c.rotate(angle);
 var px=front?.08*r:-.10*r,spread=front?.34:.39;
 ell(c,-r*.02,0,r*.28,r*.37,-.13,skin.shade);
 ell(c,px,-r*.03,r*.27,r*.32,.16,gradient(c,-r*.25,-r*.31,r*.25,r*.27,skin.top,skin.deep,skin.shade));
 for(var t=-1;t<=1;t++){
   var y0=t*r*spread*.62,x0=px+r*(.14+(1-Math.abs(t))*.055);
   ell(c,x0,y0,r*.13,r*.085,.11,skin.deep);
   bez(c,x0+r*.055,y0-r*.028,x0+r*.10,y0-r*.07,x0+r*.13,y0-r*.016,x0+r*.16,y0+r*.005,skin.claws,Math.max(.8,r*.037));
 }
 c.restore();
}
function drawTail(c,r,t,pose,skin,v,detail){
 var tail=pose.tail||{},move=Math.sin(t*2.1+1.2)*r*.17+(pose.crouch?.17*r:0),sx=-r*.78,ex,ey;
 if(tail.striking){ex=Math.cos(tail.angle)*tail.reach;ey=Math.sin(tail.angle)*tail.reach;}
 else{ex=-r*2.47;ey=r*.19+move;}
 var c1x=tail.striking?-r*1.12:-r*1.33,c1y=tail.striking?ey*.11:move*.7;
 var c2x=tail.striking?ex*.72:-r*1.83,c2y=tail.striking?ey*.86:r*.64+move;
 bez(c,sx+1.5,2.8,c1x,c1y+2.8,c2x,c2y+2.8,ex,ey+2.8,'rgba(9,11,10,.32)',r*.23);
 bez(c,sx,0,c1x,c1y,c2x,c2y,ex,ey,skin.shade,r*.24);
 bez(c,sx,0,c1x,c1y,c2x,c2y,ex,ey,skin.tail,r*.172);
 bez(c,sx,-r*.038,c1x,c1y-r*.03,c2x,c2y-r*.02,ex,ey,skin.tip,r*.052);
 if(detail){ // anatomical tail banding follows a fixed Bezier, not random noise
  for(var j=1;j<11;j++){
    var u=j/12,w=1-u,px=w*w*w*sx+3*w*w*u*c1x+3*w*u*u*c2x+u*u*u*ex;
    var py=3*w*w*u*c1y+3*w*u*u*c2y+u*u*u*ey;
    var dx=3*w*w*(c1x-sx)+6*w*u*(c2x-c1x)+3*u*u*(ex-c2x),dy=3*w*w*c1y+6*w*u*(c2y-c1y)+3*u*u*(ey-c2y),den=Math.hypot(dx,dy)||1;
    var nx=-dy/den,ny=dx/den,rr=r*(.103-u*.055);
    path(c,[px-nx*rr,py-ny*rr,px+nx*rr,py+ny*rr],'rgba(93,50,56,.37)',Math.max(.7,r*.028));
  }
 }
}
function furOutline(c,r,t,skin,v){
 var back=skin.deep;
 // Small tufted silhouette above the body; stays within actor art footprint.
 var verts=[];
 for(var i=0;i<=14;i++){
  var theta=Math.PI*.61+(Math.PI*1.78)*(i/14),x=-r*.13+Math.cos(theta)*r*.92,y=Math.sin(theta)*r*.79;
  verts.push(x,y);
 }
 c.save();c.lineJoin='round';c.strokeStyle=back;c.lineWidth=r*.07;
 c.beginPath();c.moveTo(verts[0],verts[1]);for(var j=2;j<verts.length;j+=2)c.lineTo(verts[j],verts[j+1]);c.stroke();
 c.restore();
}
function coat(c,r,t,skin,v,role,detail){
 // Shaded shoulder / rump planes, anatomically directional, readable at 1x.
 ell(c,-r*.16,r*.10,r*.94,r*.79,-.025,skin.shade);
 ell(c,-r*.17,-r*.05,r*.88,r*.77,-.045,gradient(c,-r*.48,-r*.85,r*.22,r*.75,skin.top,skin.deep,skin.shade));
 ell(c,-r*.06,-r*.27,r*.63,r*.42,-.18,'rgba(255,232,200,.085)');
 ell(c,-r*.61,r*.30,r*.31,r*.28,-.20,skin.deep);
 ell(c,r*.19,-r*.15,r*.36,r*.42,-.15,'rgba(244,225,193,.14)');
 // Directional hair hatch and interleaved dorsal tufts, always deterministic.
 var count=detail?(role==='alpha'?22:14):7;
 for(var k=0;k<count;k++){
  var x=-r*.78+(k%11)*r*.142,row=(k/11)|0;
  var y=-r*.23+row*r*.36+Math.sin(k*2.3)*r*.14;
  var shape=1-Math.pow((x+r*.10)/(r*.94),2)-Math.pow((y+r*.05)/(r*.75),2);
  if(shape<.07)continue;
  bez(c,x,y,x+r*.10,y-r*.05,x+r*.18,y-r*.055,x+r*.23,y-r*.03,k%3?'rgba(30,18,12,.26)':'rgba(255,227,191,.28)',Math.max(.70,r*.022));
 }
 if(v==='normal'){
  // Amber spine and irregular dorsal streaks: different from toxin/zombie.
  for(var a=0;a<5;a++){
   var bx=-r*.54+a*r*.235,by=-r*.28+Math.sin(a*1.4)*r*.06;
   bez(c,bx,by,bx+r*.09,by-r*.12,bx+r*.13,by-r*.06,bx+r*.22,by-r*.16,skin.ridges,r*.075);
   ell(c,bx+r*.16,by-r*.15,r*.042,r*.055,-.2,skin.mark);
  }
  if(role==='alpha')path(c,[-r*.54,r*.18,-r*.43,r*.05,-r*.35,r*.21,-r*.17,r*.12],skin.mark,r*.046);
 }else if(v==='toxin'){
  // Enlarged toxin reservoirs on upper dorsal surface. Luminous center and membrane.
  for(var n=0;n<4;n++){
   var x0=-r*.64+n*r*.31,y0=-r*.28+Math.cos(n*1.8)*r*.13,sz=r*(n===1?.17:.135);
   ell(c,x0+1,y0+1,sz*1.23,sz*.90,0,skin.shade);
   ell(c,x0,y0,sz,sz*.78,0,'#456846');
   ell(c,x0-r*.025,y0-r*.022,sz*.73,sz*.57,0,gradient(c,x0-sz,y0-sz,x0+sz,y0+sz,'#e3ffb1','#9eec63','#5c9d48'));
   ell(c,x0-sz*.35,y0-sz*.28,sz*.20,sz*.16,0,'#f1ffcf');
  }
  bez(c,-r*.64,r*.16,-r*.28,r*.07,r*.04,r*.39,r*.31,r*.16,'#5d9a57',r*.09);
  if(detail)for(var sp=0;sp<3;sp++){
   ell(c,-r*.52+sp*r*.42,r*.43,r*.055,r*.045,0,'#d6ff8d');
  }
 }else{
  // Zombie split skin and pale rib ridges; intensity follows evolution snapshot elsewhere.
  ell(c,-r*.30,-r*.17,r*.30,r*.27,.2,skin.deep);
  for(var rib=0;rib<4;rib++){
   var xr=-r*.48+rib*r*.17;
   bez(c,xr,-r*.25,xr+r*.03,-r*.11,xr+r*.09,r*.13,xr+r*.13,r*.17,rib%2?'#c4c1ad':'#a6aa9b',Math.max(1.2,r*.07));
  }
  path(c,[-r*.66,r*.27,-r*.47,r*.15,-r*.31,r*.30,-r*.15,r*.23],'#422d30',Math.max(1.4,r*.07));
  path(c,[-r*.54,r*.30,-r*.42,r*.19,-r*.27,r*.34],'#cf8374',Math.max(.8,r*.034));
  if(detail){for(var sk=0;sk<3;sk++){
   ell(c,-r*.4+sk*r*.21,r*.47,r*.055,r*.045,0,'#5d7770');
  }}
 }
}
function earsAndHead(c,r,pose,skin,v,role,detail,m,e,style,an){
 var h=pose.head||{},hx=h.x||0,hy=h.y||0,hr=h.rotation||0;
 // Ears attached behind articulated skull, so they travel with bites.
 c.save();c.translate(hx+style.headX*r-an.headDrop*r*.10,hy+style.headY*r+an.headDrop*r*.12);c.rotate(hr+style.headYaw+an.neckFlex);
 roundedEar(c,r*.41,-r*.60,r*.49,-.36-m.twitch*.19+style.earLeft,skin,v);
 roundedEar(c,r*.40,r*.59,r*.50,.30+m.twitch*.12+style.earRight,skin,v);
 ell(c,r*.54,r*.06,r*.54,r*.50,0,skin.shade);
 // Pronounced jaw adductors and cheek pads make the skull feel weight-bearing.
 ell(c,r*.48,-r*.22,r*.27,r*.19,-.28,'rgba(255,228,190,.16)');
 ell(c,r*.51,r*.25,r*.25,r*.17,.20,'rgba(44,29,25,.22)');
 ell(c,r*.58,-r*.04,r*.53,r*.48,-.12,gradient(c,r*.36,-r*.52,r*.97,r*.50,skin.tuft,skin.top,skin.deep));
 // Heavy eyebrow ridges and projecting muzzle form a rat, not a round face.
 ell(c,r*.83,-r*.12,r*.35,r*.28,.10,skin.deep);
 ell(c,r*.83,r*.13,r*.35,r*.27,-.10,skin.deep);
 ell(c,r*.87,-r*.12,r*.29,r*.225,.10,skin.belly);
 ell(c,r*.87,r*.13,r*.29,r*.225,-.10,skin.belly);
 // Tapered nose bridge; pointed pink snout at +X.
 fillPath(c,[r*.75,-r*.19,r*1.21,-r*.105,r*1.31,0,r*1.21,r*.11,r*.74,r*.20],gradient(c,r*.67,-r*.2,r*1.34,r*.20,skin.tuft,skin.belly,skin.deep));
 ell(c,r*1.29,0,r*.125,r*.091,0,skin.ears);
 ell(c,r*1.29,-r*.034,r*.067,r*.037,-.15,skin.tip);
 // Eye sockets, irises, catchlights. Zombie: asymmetric pale cataract + sickly glow.
 var eyeColor=v==='normal'?'#211c15':(v==='toxin'?'#ecfb91':'#9ff3a0');
 for(var z=-1;z<=1;z+=2){
  var ey=z*r*.245,ex=r*.73;
  ell(c,ex,ey,r*.14,r*.105,-z*.28,skin.shade);
  ell(c,ex+r*.013,ey-r*.008,r*.105,r*.088,-z*.28,eyeColor);
  ell(c,ex+r*.046,ey,r*.044,r*.060,-z*.28,v==='normal'?'#15170f':'#243b30');
  ell(c,ex-r*.016,ey-r*.042,r*.028,r*.027,0,'#ffffea');
  bez(c,ex-r*.155,ey-z*r*.070,ex-r*.055,ey-z*r*.126,ex+r*.10,ey-z*r*.10,ex+r*.18,ey-z*r*.035,skin.shade,Math.max(.8,r*.065));
 }
 var jaw=clamp(Math.max(h.jaw||0,style.jawSlack,an.threat*.39),0,1.5);
 if(jaw>.08){
  ell(c,r*1.10,0,r*.225,r*(.07+jaw*.14),0,'#3a2222');
  ell(c,r*1.09,r*.018,r*.12,r*.045,0,'#a75561');
  path(c,[r*1.01,-jaw*r*.112,r*1.23,-jaw*r*.115,r*1.19,-jaw*r*.026],skin.claws,Math.max(1,r*.050));
  path(c,[r*1.01,jaw*r*.108,r*1.23,jaw*r*.10,r*1.19,jaw*r*.023],skin.claws,Math.max(1,r*.050));
 }else{
  bez(c,r*1.13,-r*.04,r*1.17,0,r*1.17,0,r*1.13,r*.045,'#5a3533',Math.max(.8,r*.031));
  // Short exposed incisors for clear identification at game scale.
  fillPath(c,[r*1.18,r*.018,r*1.27,r*.037,r*1.25,r*.10,r*1.19,r*.07],skin.claws);
 }
 // Whiskers are fine, taper-like colored lines on both sides, including a follicle.
 for(var n=0;n<3;n++)for(var dir=-1;dir<=1;dir+=2){
  var yy=dir*(r*.09+n*r*.06);
  bez(c,r*1.02,yy,r*1.17,dir*r*(.25+n*.06)+m.sniff*r*.04,r*1.42,dir*r*(.38+n*.105)+m.sniff*r*.08,r*(1.61-n*.08),dir*r*(.49+n*.12)+m.sniff*r*.10,n===0?'rgba(255,237,211,.74)':'rgba(210,193,165,.59)',Math.max(.55,r*.021));
 }
 affectFace(c,r,e,v,m);
 if(an.threat>.1&&!e.attack){
  // Snarl / cheek tension only while not executing a combat attack.
  bez(c,r*.56,-r*.36,r*.73,-r*.41,r*.94,-r*.27,r*1.04,-r*.17,skin.shade,Math.max(1,r*.066));
  ell(c,r*.67,-r*.26,r*.09,r*.04,-.27,'rgba(24,13,14,.30)');
 }
 if(v==='toxin'){
  ell(c,r*.47,-r*.45,r*.12,r*.10,0,'#5d945a');ell(c,r*.47,-r*.45,r*.066,r*.055,0,'#dcffa3');
 } else if(v==='zombie'){
  path(c,[r*.50,r*.08,r*.68,r*.15,r*.81,r*.09],'#744345',r*.057);
  if(detail)path(c,[r*.78,-r*.05,r*.90,-r*.02,r*.96,r*.03],'#6a484b',r*.039);
 }
 c.restore();
}
function drawFurSpikes(c,r,skin,v,detail){
 if(!detail)return;
 c.save();c.strokeStyle=skin.tuft;c.lineWidth=Math.max(1,r*.027);c.lineCap='round';
 for(var j=0;j<10;j++){
  var x=-r*.74+j*r*.155,y=-r*(.57+.07*Math.sin(j*2));
  c.beginPath();c.moveTo(x,y);c.lineTo(x+r*.06,y-r*.07);c.stroke();
 }
 c.restore();
}
function mutationMarkings(c,r,e,skin){
 if(e.variant!=='zombie')return;
 var stage=(e.evolution&&e.evolution.enabled)?e.evolution.stage:0;
 if(stage<1)return;
 for(var sc=0;sc<Math.min(stage,4);sc++){
  var xx=-r*.67+sc*r*.25;
  path(c,[xx,r*.22,xx+r*.10,r*.37,xx+r*.22,r*.22],sc>=2?'#bfd8b3':'#daaaa2',Math.max(1.2,r*.05));
 }
 if(stage>=2){
  ell(c,-r*.46,-r*.34,r*.15,r*.09,.18,'rgba(130,237,167,.38)');
  ell(c,-r*.48,-r*.36,r*.075,r*.043,0,'#c1f6ac');
 }
 if(stage>=4){
  for(var p=0;p<4;p++){
   var a=.85+p*.57;
   bez(c,-r*.08,r*.12,Math.cos(a)*r*.66,Math.sin(a)*r*.64,Math.cos(a)*r*.86,Math.sin(a)*r*.82,Math.cos(a)*r*.96,Math.sin(a)*r*.92,'rgba(181,235,192,.42)',Math.max(.8,r*.036));
  }
 }
}
function addWounds(c,r,e,v,skin){
 var b=e.broken||{};
 if(b.horn){path(c,[r*.60,-r*.33,r*.73,-r*.04,r*.93,r*.09],'#5d292b',Math.max(1.3,r*.07));path(c,[r*.65,-r*.24,r*.80,-r*.04],'#e3a5a0',Math.max(.7,r*.025));}
 if(b.flank){ell(c,-r*.17,r*.57,r*.25,r*.13,-.25,'#663b3a');path(c,[-r*.37,r*.56,-r*.12,r*.58,r*.04,r*.43],'#d28d79',Math.max(1,r*.05));}
 if(b.hind){path(c,[-r*.83,r*.49,-r*.64,r*.65,-r*.51,r*.60],'#6b3035',Math.max(1,r*.065));}
 if(e.phase3){
  ell(c,-r*.13,r*.19,r*.74,r*.60,0,'rgba(114,25,27,.15)');
  path(c,[-r*.36,-r*.30,-r*.19,-r*.20,-r*.06,-r*.29],'#652d2d',Math.max(.9,r*.052));
  path(c,[-r*.58,r*.42,-r*.44,r*.29,-r*.31,r*.40],'#d78e85',Math.max(.8,r*.032));
 }
}
function strikeAccent(c,r,e,pose,skin){
 if(!pose.strike||!pose.strike.active)return;
 var s=pose.strike,intensity=clamp(pose.pulseStrength||.2,0,1);
 if(['bite','minibite','double','triple','combo','pincer','flank'].indexOf(s.type)>=0){
  c.save();c.rotate(s.localAngle||0);c.globalAlpha*=.20+intensity*.55;
  path(c,[r*1.08,-r*.25,r*1.35,-r*.36,s.reach,-r*.17],skin.claws,1.3+intensity*1.5);
  path(c,[r*1.08,r*.25,r*1.35,r*.36,s.reach,r*.17],skin.claws,1.3+intensity*1.5);
  c.restore();
 }
}
function eliteFx(c,r,e,v){
 var at=e.attack;if(!at||at.phase!=='act')return;
 var id=at.id,q=at.phaseProgress||0;
 c.save();
 if(id==='R10'){
  c.globalAlpha*=.44; c.strokeStyle='#deb48b';c.lineWidth=3;c.beginPath();c.arc(-r*.12,0,r*(.76+.34*q),0,TAU);c.stroke();
  ell(c,-r*.60,-r*.54,r*.25,r*.17,0,'#b99b78');ell(c,-r*.60,r*.54,r*.25,r*.17,0,'#ae8b68');
 }else if(id==='N12'){
  c.globalAlpha*=.42;c.strokeStyle='#efc99c';c.lineWidth=2.5;c.beginPath();c.arc(-r*.12,0,r*1.31,Math.PI*.38,Math.PI*1.56);c.stroke();
 }else if(id==='T12'||id==='Z12'){
  var to=id==='T12',rad=22+((to?98:92)-22)*clamp((q-(to?.24:.2))/(to?.46:.48),0,1);
  c.globalAlpha*=.42;c.strokeStyle=to?'#b2ff73':'#b892a3';c.lineWidth=3.2;c.beginPath();c.arc(0,0,rad,0,TAU);c.stroke();
 }
 c.restore();
}

// Optional RENDER-ONLY adapter: previous/core snapshots stay immutable; draw()
// remains stateless. Host calls transition.decorate(coreSnapshot) before Art.draw.
// The adapter NEVER interpolates world coordinates, attack geometry, authored
// strike/jaw/head/feet pose, telegraphs or any combat-authoritative field.
function createTransitionLayer(options){
 options=options||{};
 var durations={locomotion:.19,threat:.30,stagger:.12,collapse:.34,recovery:.24};
 Object.keys(durations).forEach(function(k){if(Number.isFinite(options[k]))durations[k]=clamp(options[k],.001,2);});
 var records=Object.create(null),lastTime=null;
 function ease(x){x=clamp(x,0,1);return x*x*(3-2*x);}
 function blend(a,b,x){var out={};Object.keys(b).forEach(function(key){
   var v=b[key],p=a&&a[key];out[key]=typeof v==='number'&&Number.isFinite(p)?p+(v-p)*x:v;
 });return out;}
 function identity(e){return [e.mode||'idle',e.visualState||'neutral',e.attack?(e.attack.id+':'+e.attack.phase):'none',e.burrow?e.burrow.stage:'-',e.feint?'feint':'-'].join('|');}
 function transitionDuration(e){if(['dead','captured','downed','reanimating'].indexOf(e.mode)>=0)return durations.collapse;
  if(e.mode==='stunned'||e.mode==='stagger'||e.visualState==='stagger')return durations.stagger;
  if(e.visualState==='threat')return durations.threat;
  if(e.attack)return .001; // critical: no interpolation during attack, especially tele/act
  if(e.mode==='recover')return durations.recovery;
  return durations.locomotion;}
 function decorate(snap,dt){
  if(!snap||!Array.isArray(snap.entities))return snap;
  var time=Number.isFinite(snap.time)?snap.time:null;
  var delta=Number.isFinite(dt)?Math.max(0,dt):(time!==null&&lastTime!==null?Math.max(0,time-lastTime):0);
  delta=Math.min(delta,.5); // supports replay, frame step and dt up to .12; no Date.now
  if(time!==null)lastTime=time;
  var seen=Object.create(null),next=snap.entities.map(function(e){
   var id=String(e.id),v=snap.variant||e.variant||'normal';seen[id]=true;
   var motion=inspectMotion(e,v),anatomy=inspectAnatomy(e,v),key=identity(e),s=records[id];
   if(!s){s={key:key,elapsed:0,duration:0,displayM:motion,displayA:anatomy,fromM:motion,fromA:anatomy};records[id]=s;}
   var entering=s.key!==key;
   if(entering){s.fromM=s.displayM;s.fromA=s.displayA;s.key=key;s.duration=transitionDuration(e);s.elapsed=Math.min(s.duration,delta);}
   else if(s.duration>0){s.elapsed=Math.min(s.duration,s.elapsed+delta);}
   var lock=!!(e.attack&&e.attack.phase)||!!e.burrow||!!e.feint;
   var fraction=lock?1:(s.duration?ease(s.elapsed/s.duration):1);
   var bm=blend(s.fromM,motion,fraction),ba=blend(s.fromA,anatomy,fraction);
   if(lock){bm=motion;ba=anatomy;s.duration=0;}
   s.displayM=bm;s.displayA=ba;
   var out={};for(var k in e)if(Object.prototype.hasOwnProperty.call(e,k))out[k]=e[k];
   out.visualBlend={motion:bm,anatomy:ba,weight:fraction,transitioning:!lock&&fraction<1,
    fromKey:entering?'previous':s.key,toKey:key};
   return out;
  });
  Object.keys(records).forEach(function(id){if(!seen[id])delete records[id];});
  var view={};for(var p in snap)if(Object.prototype.hasOwnProperty.call(snap,p))view[p]=snap[p];view.entities=next;
  return view;
 }
 return {decorate:decorate,reset:function(){records=Object.create(null);lastTime=null;},
  inspect:function(id){var s=records[String(id)];return s?{state:s.key,elapsed:s.elapsed,duration:s.duration,transitioning:s.duration>s.elapsed}:null;}};
}

function drawRat(ctx,entity,v,quality){
 var r=entity.r||29,skin=getArt(v),pose=entity.pose||{},body=pose.body||{},feet=pose.feet||{};
 var t=entity.animT||0,detail=quality!=='low',m=secondary(entity),style=(entity.visualBlend&&entity.visualBlend.motion)||inspectMotion(entity,v),an=(entity.visualBlend&&entity.visualBlend.anatomy)||inspectAnatomy(entity,v),idle=entity.mode==='idle',dead=['dead','captured','downed','reanimating'].indexOf(entity.mode)>=0;
 ctx.save();ctx.translate(entity.x,entity.y);ctx.rotate(entity.facing||0);
 // Deterministic burrow render: no attack geometry emitted from this painter.
 if(entity.burrow){var b=entity.burrow;
  if(b.stage==='windup'){ctx.translate(-r*.12,0);ctx.scale(1,.90);}
  if(b.stage==='submerged'){ctx.globalAlpha*=.18;ctx.scale(.5,.38);}
  if(b.stage==='emerging'){var p=clamp(((entity.attack?entity.attack.phaseProgress:0)-.68)/.12,.18,1);ctx.globalAlpha*=p;ctx.scale(.6+.4*p,.6+.4*p);}
 }
 if(dead){var fall=clamp(an.collapse,0,1);ctx.rotate((-.28-an.collapse*.09)*fall);ctx.globalAlpha*=1-(1-(entity.mode==='downed'?.69:.78))*fall;}
 // Low collapse lowers the body visually only, never changes world position.
 if(an.collapse>0){ctx.translate(-r*.055*an.collapse,r*.15*an.collapse);ctx.scale(1-an.collapse*.06,1-an.collapse*.11);}
 // Shadow anchors body to scene; no fake shadow attacking outside hitbox.
 ell(ctx,-r*.04,r*.32+m.breath*r*.018,r*1.10,r*.55,-.07,'rgba(3,10,8,.35)');
 // Tail extends behind body and is anatomically banded in the enhanced painter.
 ctx.save();ctx.translate(0,style.tailDrag*r);drawTail(ctx,r,t,pose,skin,v,detail);ctx.restore();
 // Four separate articulated legs, with claws and contrasting wrist planes.
 // Hind first, forelegs last: joints are attached to shoulders and hips.
 // During authored combat tele/act, offsets remain exactly as the old painter.
 var l1x=-r*.59+style.rearLeft*r-r*an.rearDrag*.12,l2x=-r*.59+style.rearRight*r;
 var f1x=r*.35+style.frontLeft*r+r*an.frontBrace*.13,f2x=r*.35+style.frontRight*r+r*an.frontBrace*.13;
 var sy=r*an.legSplay*.22;
 drawLimb(ctx,r,l1x,-r*.65-sy,false,-1,skin,style,an);
 drawLimb(ctx,r,l2x,r*.69+sy,false,1,skin,style,an);
 drawLimb(ctx,r,f1x,-r*.65-sy,true,-1,skin,style,an);
 drawLimb(ctx,r,f2x,r*.68+sy,true,1,skin,style,an);
 drawPaw(ctx,r,l1x,-r*.65-sy,feet.rearLeft||0,pose,false,skin);
 drawPaw(ctx,r,l2x,r*.69+sy,feet.rearRight||0,pose,false,skin);
 drawPaw(ctx,r,f1x,-r*.65-sy,feet.frontLeft||0,pose,true,skin);
 drawPaw(ctx,r,f2x,r*.68+sy,feet.frontRight||0,pose,true,skin);
 ctx.save();ctx.translate((body.x||0)+style.torsoX*r,(body.y||0)+style.torsoY*r);ctx.rotate((body.tilt||0)+style.torsoYaw+an.hipRoll*.25+an.torsoWobble);ctx.scale((body.sx||1)*(1+m.breath*.012)*an.bodySquash,(body.sy||1)*(1+m.breath*.019)*(1+an.ribExpansion));
 furOutline(ctx,r,t,skin,v);coat(ctx,r,t,skin,v,entity.role,detail);
 anatomyPlanes(ctx,r,entity,v,skin,an,detail);
 livingSurface(ctx,r,entity,v,m,skin,detail,style);drawFurSpikes(ctx,r,skin,v,detail);
 dorsalQuills(ctx,r,v,m,skin,detail);mutationMarkings(ctx,r,entity,skin);addWounds(ctx,r,entity,v,skin);
 ctx.restore();
 earsAndHead(ctx,r,pose,skin,v,entity.role,detail,m,entity,style,an);
 strikeAccent(ctx,r,entity,pose,skin);
 eliteFx(ctx,r,entity,v);
 if(entity.feint){ctx.save();ctx.strokeStyle='rgba(101,209,245,.82)';ctx.lineWidth=2;ctx.setLineDash([3,5]);ctx.beginPath();ctx.arc(0,0,r*1.25,-Math.PI/2,-Math.PI/2+TAU*(entity.feint.progress||0));ctx.stroke();ctx.setLineDash([]);ctx.restore();}
 if(entity.attack&&entity.attack.phase==='tele'){
  var tell=entity.attack,pr=clamp(tell.phaseProgress||0,0,1),tox=v==='toxin';
  ctx.strokeStyle=tox?'rgba(171,239,111,.85)':'rgba(255,180,98,.84)';ctx.lineWidth=2.4;
  ctx.beginPath();ctx.arc(0,0,r*1.20,-Math.PI/2,-Math.PI/2+TAU*pr);ctx.stroke();
  if(['R10','R11','T12','Z12'].indexOf(tell.id)>=0){
   ctx.save();ctx.setLineDash([4,5]);ctx.strokeStyle=tox?'rgba(154,226,99,.7)':'rgba(250,203,133,.74)';ctx.lineWidth=1.5;
   ctx.beginPath();ctx.arc(0,0,r*1.33,0,TAU);ctx.stroke();ctx.restore();
  }
 }
 // Transparent flash silhouette reflects existing hit flash only.
 if(entity.flash>0){ctx.save();ctx.globalAlpha*=clamp(entity.flash*2.6,0,.68);ell(ctx,-r*.04,0,r*.90,r*.74,0,'#fff0d4');ctx.restore();}
 ctx.restore();
}
function drawToxinPools(ctx,snapshot){
 var pools=snapshot.pools||[],now=snapshot.time||0;
 pools.forEach(function(p){
  var pulse=.5+.5*Math.sin((now-p.createdAt)*6.8),fade=clamp(p.remaining/.65,0,1),r=p.r;
  ctx.save();ctx.translate(p.x,p.y);ctx.globalAlpha=fade;
  var halo=ctx.createRadialGradient(0,0,4,0,0,r+6);
  halo.addColorStop(0,'rgba(85,204,54,.82)');halo.addColorStop(.72,'rgba(68,170,35,.67)');halo.addColorStop(1,'rgba(40,98,35,0)');
  ctx.fillStyle=halo;ctx.beginPath();ctx.arc(0,0,r+6,0,TAU);ctx.fill();
  ctx.strokeStyle='rgba(173,241,87,'+(.48+.3*pulse)+')';ctx.lineWidth=1.8;
  ctx.beginPath();for(var n=0;n<=20;n++){var ang=TAU*n/20,rr=r*(.91+.042*Math.sin(n*2.5+p.createdAt));
    if(n===0)ctx.moveTo(Math.cos(ang)*rr,Math.sin(ang)*rr);else ctx.lineTo(Math.cos(ang)*rr,Math.sin(ang)*rr);}ctx.closePath();ctx.stroke();
  for(var k=0;k<5;k++){var theta=k*2.39996+p.createdAt*.6,dist=r*(.2+.12*(k%3)),bubble=2.5+(k%3)*1.7+pulse*.8;
    ctx.fillStyle=k%2?'rgba(208,243,134,.57)':'rgba(27,88,24,.65)';
    ctx.beginPath();ctx.arc(Math.cos(theta)*dist,Math.sin(theta)*dist,bubble,0,TAU);ctx.fill();}
  ctx.restore();
 });
}
function drawTelegraphs(ctx,snapshot){
 var list=snapshot.telegraphs||[];ctx.save();for(var i=0;i<list.length;i++){
  var t=list[i],g=t.geometry;if(!g)continue;
  var sp=t.attackId==='T08'||t.attackId==='T12'||t.attackId==='T13';
  var clr=t.type==='feint'?'rgba(95,210,244,.84)':sp?'rgba(165,246,109,.80)':'rgba(255,165,93,.83)';
  var wash=t.type==='feint'?'rgba(66,177,216,.12)':sp?'rgba(114,230,99,.17)':'rgba(232,108,47,.19)';
  ctx.strokeStyle=clr;ctx.fillStyle=wash;ctx.lineWidth=2;
  if(g.type==='burrow'){
   ctx.save();ctx.strokeStyle=wash;ctx.lineWidth=g.width*2.3;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(g.ax,g.ay);ctx.lineTo(g.bx,g.by);ctx.stroke();
   ctx.setLineDash([6,5]);ctx.strokeStyle=clr;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(g.ax,g.ay);ctx.lineTo(g.bx,g.by);ctx.stroke();ctx.setLineDash([]);
   ctx.beginPath();ctx.arc(g.bx,g.by,g.landingRadius,0,TAU);ctx.fill();ctx.stroke();ctx.restore();
  }else if(g.type==='circle'){ctx.beginPath();ctx.arc(g.x,g.y,g.r,0,TAU);ctx.fill();ctx.stroke();}
  else if(g.type==='arc'){ctx.beginPath();ctx.arc(g.x,g.y,g.r,g.start,g.end);ctx.stroke();ctx.beginPath();ctx.arc(g.x,g.y,g.r-13,g.start,g.end);ctx.stroke();}
  else if(g.type==='cone'){ctx.beginPath();ctx.moveTo(g.x,g.y);ctx.arc(g.x,g.y,g.r,g.angle-g.spread,g.angle+g.spread);ctx.closePath();ctx.fill();ctx.stroke();}
  else if(g.type==='lane'){ctx.save();ctx.lineCap='round';ctx.lineWidth=g.width*2;ctx.strokeStyle=wash;ctx.beginPath();ctx.moveTo(g.ax,g.ay);ctx.lineTo(g.bx,g.by);ctx.stroke();ctx.lineWidth=2;ctx.strokeStyle=clr;ctx.beginPath();ctx.moveTo(g.ax,g.ay);ctx.lineTo(g.bx,g.by);ctx.stroke();ctx.restore();}
 }ctx.restore();
}
function draw(ctx,snapshot,opts){
 opts=opts||{};if(!ctx||!snapshot||!Array.isArray(snapshot.entities))return;
 ctx.save();drawToxinPools(ctx,snapshot);if(opts.telegraphs!==false)drawTelegraphs(ctx,snapshot);
 var co=snapshot.coordination||{},find=function(id){return snapshot.entities.find(function(e){return e.id===id;});};
 if(co.helperId){var leader=find('alpha'),partner=find(co.helperId);if(leader&&partner&&leader.attack&&partner.attack){ctx.save();ctx.strokeStyle='rgba(236,208,145,.45)';ctx.setLineDash([5,7]);ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(leader.x,leader.y);ctx.lineTo(partner.x,partner.y);ctx.stroke();ctx.restore();}}
 if(co.graveTargetId&&co.graveDefenderId){var corpse=find(co.graveTargetId),defender=find(co.graveDefenderId);if(corpse&&defender){ctx.save();ctx.strokeStyle='rgba(170,228,186,.7)';ctx.lineWidth=2;ctx.setLineDash([3,6]);ctx.beginPath();ctx.arc(corpse.x,corpse.y,corpse.r+11,0,TAU);ctx.stroke();ctx.beginPath();ctx.moveTo(corpse.x,corpse.y);ctx.lineTo(defender.x,defender.y);ctx.stroke();ctx.restore();}}
 if(co.formation==='shield_wounded'){var patient=find(co.woundedId),guard=find(co.protectorId);if(patient&&guard&&patient.hp>0){ctx.save();ctx.strokeStyle='rgba(150,205,235,.56)';ctx.lineWidth=1.6;ctx.setLineDash([4,6]);ctx.beginPath();ctx.arc(patient.x,patient.y,patient.r+9,0,TAU);ctx.stroke();ctx.beginPath();ctx.moveTo(guard.x,guard.y);ctx.lineTo(patient.x,patient.y);ctx.stroke();ctx.restore();}}
 if(co.lastCounter&&snapshot.time-co.lastCounter.at<.75){var counter=find(co.lastCounter.entityId);if(counter&&counter.hp>0){ctx.save();ctx.strokeStyle='rgba(238,224,148,.80)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(counter.x,counter.y,counter.r+11,0,TAU);ctx.stroke();ctx.restore();}}
 (snapshot.entities||[]).forEach(function(e){if(!e.burrow)return;var b=e.burrow;
  if(b.stage==='submerged'||b.stage==='emerging'){
   var dx=b.landing.x-b.start.x,dy=b.landing.y-b.start.y,n=Math.floor(Math.hypot(dx,dy)/12),p=clamp(b.progress,0,1);
   ctx.save();for(var j=0;j<=n;j++){var t=(j+.5)/(n+1);if(t>p)break;var xx=b.start.x+dx*t,yy=b.start.y+dy*t;
     ell(ctx,xx,yy,3+(j%3),1.8+(j%2),j*.8,'rgba(181,148,99,.46)');
   }ctx.strokeStyle='rgba(224,192,128,.42)';ctx.lineWidth=1.7;ctx.beginPath();ctx.arc(e.x,e.y,e.r*(b.stage==='emerging'?1.10:.68),0,TAU);ctx.stroke();ctx.restore();
  }
 });
 var list=snapshot.entities.slice().sort(function(a,b){return a.y-b.y;});
 list.forEach(function(e){var copy={};for(var k in e)if(Object.prototype.hasOwnProperty.call(e,k))copy[k]=e[k];
  copy.variant=snapshot.variant;copy.phase3=e.id==='alpha'&&snapshot.phase===3;
  drawRat(ctx,copy,snapshot.variant,opts.quality||'high');
  if(snapshot.variant==='toxin'&&e.attack&&e.attack.id==='T13'&&e.attack.phase==='act'){
    var dest=(snapshot.telegraphs||[]).find(function(t){return t.entityId===e.id&&t.attackId==='T13';});
    // Snapshot attack does not carry private landing; animate a small front-mouth spray,
    // while the exact committed landing and pool are supplied by Core telegraph/pools.
    var f=(e.attack.phaseProgress||0),startX=e.x+Math.cos(e.attack.angle)*e.r*.83,startY=e.y+Math.sin(e.attack.angle)*e.r*.83;
    ctx.save();ctx.lineCap='round';ctx.strokeStyle='rgba(139,239,75,.72)';ctx.lineWidth=4+2*Math.sin(f*Math.PI);
    ctx.beginPath();ctx.moveTo(startX,startY);ctx.lineTo(startX+Math.cos(e.attack.angle)*(12+f*15),startY+Math.sin(e.attack.angle)*(12+f*15));ctx.stroke();
    ctx.restore();
  }
  if(e.mode==='downed'||e.mode==='reanimating'){
   ctx.save();ctx.setLineDash([3,5]);ctx.strokeStyle='rgba(178,239,163,.72)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(e.x,e.y,e.r+6,0,TAU);ctx.stroke();ctx.restore();
  }
 });
 (snapshot.revivalTelegraphs||[]).forEach(function(r){ctx.save();ctx.strokeStyle='rgba(146,246,159,.82)';ctx.fillStyle='rgba(108,206,127,.12)';ctx.lineWidth=2.5;
  ctx.beginPath();ctx.arc(r.x,r.y,r.r,0,TAU);ctx.fill();ctx.stroke();ctx.strokeStyle='#e0ffd4';ctx.lineWidth=3.2;
  ctx.beginPath();ctx.arc(r.x,r.y,r.r+5,-Math.PI/2,-Math.PI/2+TAU*(r.progress||0));ctx.stroke();ctx.restore();});
 ctx.restore();
}
function drawQuestIcon(ctx,variant,size){
 size=size||128;var v=getArt(variant),s=size/128;
 ctx.save();ctx.clearRect(0,0,size,size);ctx.scale(s,s);
 var bg=variant==='normal'?['#624939','#1c2826']:variant==='toxin'?['#3d654f','#162a26']:['#536660','#1a2429'];
 ctx.fillStyle=gradient(ctx,0,0,128,128,bg[0],bg[0],bg[1]);ctx.fillRect(0,0,128,128);
 // Cutout framed trophy portrait: independent of gameplay and no text/fonts.
 ell(ctx,66,74,65,58,-.20,'rgba(5,12,11,.28)');
 for(var m=0;m<7;m++){
  ell(ctx,(m*37+14)%128,98+(m%3)*7,17+(m%2)*5,6,.2,'rgba(151,144,104,.14)');
 }
 ctx.save();ctx.beginPath();ctx.arc(64,64,57,0,TAU);if(ctx.clip)ctx.clip();
 // Big portrait, oriented diagonally upward with intentionally cropped tail.
 drawRat(ctx,{x:60,y:64,r:35,facing:-.54,animT:1.35,mode:'idle',variant:variant,role:'alpha',broken:{},phase3:false},variant,'high');
 ctx.restore();
 ctx.strokeStyle=variant==='toxin'?'#b6d58c':variant==='zombie'?'#b3c5b9':'#ddbd86';ctx.lineWidth=3;
 ctx.beginPath();ctx.arc(64,64,57,0,TAU);ctx.stroke();
 ctx.strokeStyle='rgba(255,237,194,.33)';ctx.lineWidth=1;
 ctx.beginPath();ctx.arc(64,64,52,0,TAU);ctx.stroke();
 // Variant emblem in upper-left, independent from quest icon layout.
 ell(ctx,18,18,11,11,0,'rgba(17,33,27,.76)');
 if(variant==='toxin'){
  ell(ctx,18,18,5,7,0,'#a5f38d');ell(ctx,17,16,2,3,0,'#e1ffb2');
 }else if(variant==='zombie'){
  path(ctx,[13,20,18,12,23,20,18,25,13,20],'#b4e4b8',2.1);
 }else{
  path(ctx,[13,13,21,13,17,19,23,21,16,24,12,19,13,13],'#f0d19a',2);
 }
 ctx.restore();
}
return {version:C.version,styleVersion:'0.9.5',draw:draw,drawTelegraphs:drawTelegraphs,drawQuestIcon:drawQuestIcon,inspectMotion:inspectMotion,inspectAnatomy:inspectAnatomy,createTransitionLayer:createTransitionLayer};
});
