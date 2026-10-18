/* Bio-Hunter Cragclaw DuoPack registry v1.4 | plain IIFE / offline | optional integration helper */
(function(root,factory){'use strict';root.CragclawDuoPack=factory(root);})(typeof globalThis!=='undefined'?globalThis:this,function(root){
  'use strict';
  var definitions={
    cragclaw:{id:'cragclaw',name:'Cragclaw',nameTH:'ปูเกราะผลึก',version:'0.7',tier:'T3',config:'CragclawConfig',core:'CragclawCore',art:'CragclawArt',combat:'CragclawCombat'},
    apex_cragclaw:{id:'apex_cragclaw',name:'Apex Cragclaw',nameTH:'ราชันก้ามล่าผลึก',version:'1.0',tier:'T3+',config:'ApexCragclawConfig',core:'ApexCragclawCore',art:'ApexCragclawArt',combat:'ApexCragclawCombat'}
  };
  function descriptor(id){var entry=definitions[id];if(!entry)throw new Error('Unknown monster ID: '+id);return Object.assign({},entry);}
  function check(id){var e=descriptor(id),miss=[];for(var k of ['config','core','art','combat'])if(!root[e[k]])miss.push(e[k]);return {id:id,loaded:miss.length===0,missing:miss};}
  function createEncounter(id,opts){
    opts=opts||{};var e=descriptor(id),present=check(id);
    if(!present.loaded)throw new Error('Cragclaw DuoPack: missing '+present.missing.join(', ')+' for '+id);
    var config=root[e.config],core=root[e.core],art=root[e.art],combat=root[e.combat];
    var input={config:config,seed:opts.seed===undefined?1:opts.seed};
    // The two characters have distinct variants and never use the old difficulty toggle.
    if(id==='cragclaw')input.variant='stone'; else input.variant='apex';
    var instance=core.createInstance(input),adapter=combat.createAdapter(instance);
    return {
      id:id,entry:e,instance:instance,adapter:adapter,
      step:function(dt,world){return adapter.step(dt,world);},
      draw:function(ctx,frame,drawOpts){return art.draw(ctx,frame||instance.snapshot(),drawOpts||{});},
      drawQuestIcon:function(ctx,size){return art.drawQuestIcon(ctx,size,id==='cragclaw'?'stone':'apex');},
      snapshot:function(){return instance.snapshot();},
      interrupt:function(){return instance.interrupt();},
      beginAttack:function(attackId,world){return adapter.beginAttack?adapter.beginAttack(attackId,world):instance.beginAttack(attackId,world);},
      damagePart:function(part,amount){return instance.damagePart(part,amount);},
      damageShell:function(amount){return instance.damageShell(amount);},
      applyDamage:function(amount){return instance.applyDamage(amount);}
    };
  }
  return {version:'1.4',ids:['cragclaw','apex_cragclaw'],definitions:definitions,descriptor:descriptor,check:check,createEncounter:createEncounter};
});
