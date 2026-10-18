(function(root,factory){'use strict';root.CragclawConfig=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
var attacks={
  C01:{id:'C01',name:'ก้ามหนีบฉับไว',tele:0.52,act:0.16,recover:0.36,damage:14,hits:1,minHitGap:0,parry:true,phase:1,kind:'snap',reach:54,opening:0.36,pulseWindows:[[0.08,0.92]]},
  C02:{id:'C02',name:'ก้ามบดทุบพื้น',tele:0.92,act:0.24,recover:0.98,damage:28,hits:1,minHitGap:0,parry:true,phase:1,kind:'slam',reach:68,opening:0.98,pulseWindows:[[0.24,0.84]]},
  C03:{id:'C03',name:'ปาดก้ามกวาดด้านหน้า',tele:0.72,act:0.34,recover:0.62,damage:18,hits:1,minHitGap:0,parry:true,phase:1,kind:'sweep',reach:82,opening:0.62,pulseWindows:[[0.14,0.88]]},
  C04:{id:'C04',name:'พุ่งปะทะด้านข้าง',tele:0.84,act:0.42,recover:0.88,damage:24,hits:1,minHitGap:0,parry:true,phase:1,kind:'rush',reach:138,opening:0.88,pulseWindows:[[0.05,0.96]]},
  C05:{id:'C05',name:'หมุนกระดองปัดรอบตัว',tele:0.86,act:0.60,recover:0.70,damage:16,hits:2,minHitGap:0.28,parry:true,phase:2,kind:'spin',reach:74,opening:0.70,pulseWindows:[[0.08,0.34],[0.58,0.92]]},
  C06:{id:'C06',name:'ผลึกแหลมผุดจากพื้น',tele:1.05,act:0.68,recover:0.76,damage:22,hits:2,minHitGap:0.34,parry:false,phase:2,kind:'crystal',reach:144,opening:0.76,pulseWindows:[[0.18,0.46],[0.62,0.95]]},
  C07:{id:'C07',name:'ก้ามฝังค้าง',tele:1.08,act:0.28,recover:1.24,damage:32,hits:1,minHitGap:0,parry:true,phase:3,kind:'embed',reach:96,opening:1.24,pulseWindows:[[0.20,0.82]]},
  C08:{id:'C08',name:'กระแทกเปลือกผลึก',tele:1.18,act:0.74,recover:1.10,damage:34,hits:1,minHitGap:0,parry:false,phase:3,kind:'burst',reach:110,opening:1.10,pulseWindows:[[0.26,0.88]]}
};
var variants={
  stone:{id:'stone',name:'Cragclaw ปูเกราะผลึก',desc:'ปูยักษ์กระดองหินผลึก ก้ามหนึ่งหนัก ก้ามหนึ่งไว เด่นเรื่องคุมพื้นที่และสวนกลับ',baseHp:2800,speed:88,turn:2.45,damageMultiplier:1.0,r:33,palette:{shell:'#4e6f7d',shellLight:'#7392a0',under:'#d4c6ac',claw:'#87a9ba',crystal:'#6de2ff',crystalHot:'#b8fbff',eye:'#ffd36a',shadow:'#253740'}}
};
var zones={
  horn:{name:'หัว/โคนผลึกหลัก',anchor:{x:0.62,y:0},hurtbox:{x:0.56,y:0,r:0.48},partRatio:0.30},
  flank:{name:'ก้ามและสีข้าง',anchor:{x:0.0,y:0.68},hurtbox:{x:0.0,y:0,r:0.78},partRatio:0.52},
  hind:{name:'ท้ายกระดอง/ขาหลัง',anchor:{x:-0.65,y:0},hurtbox:{x:-0.66,y:0,r:0.52},partRatio:0.34}
};
var defaults={
  aiEnabled:true,
  arena:{cx:480,cy:312,r:268},
  maxSubstep:0.008,
  obstacleClearance:12,
  idleRadius:170,
  startAttackCooldown:0.74,
  attackBiasClose:['C01','C02','C03'],
  attackBiasMid:['C02','C03','C04','C06'],
  attackBiasFar:['C04','C06'],
  phaseHpFractions:[0.66,0.33],
  crystalSpawnCount:3,
  crystalSpawnRadius:108,
  poolTickGap:0.30,
  sideRushSpeed:240,
  walkBobAmp:1.0,
  shellGuardArc:1.82,
  clawBreakStagger:0.42,
  stoneImpactStagger:1.05,
  crusherClawHp:530,
  pincerClawHp:390,
  brokenClawDamageScale:0.48,
  brokenClawReachScale:0.72,
  strafeCycleSeconds:2.6,
  strafePreferredDistance:125,
  strafeDeadZone:18,
  strafeLateralFactor:0.78,
  strafeApproachFactor:0.70,
  damagedClawVisualPulse:0.38,
  clawFractureStages:[0.67,0.34],
  reactiveCounter:true,
  counterMaxRange:154,
  counterCooldown:4.2,
  shellHp:780,
  shellBreakStagger:1.10,
  crystalField:true,
  crystalFieldDuration:3.20,
  crystalFieldWindup:0.48,
  crystalFieldRadius:18,
  crystalFieldDamage:6,
  crystalFieldTickGap:0.96,
  crystalGlobalHitGap:0.65,
  crystalFieldCap:6
};
return {version:'0.7',name:'Cragclaw',attacks:attacks,variants:variants,zones:zones,defaults:defaults};
});
