// Offline play. Each deployment owns only the caches under its registration scope.
const VERSION = 'bh-18.10.31-naka50-claw1';
const CACHE_PREFIX = 'bio-hunter:' + self.registration.scope + ':';
const CACHE_NAME = CACHE_PREFIX + VERSION;
const CORE = ['./', 'index.html', 'art/art.js', 'art/mossplate.js', 'art/ui.js', 'art/visual.lazy.js', 'art/naka-runtime.js', 'art/naka-attack-v34.js', 'art/naka-ground-v35.js', 'art/naka-wrap-v37.js', 'art/naka-pursuit-v38.js', 'art/naka-motion-v39.js', 'art/naka-reapproach-v40.js', 'art/naka-continuous-v41.js', 'art/naka-arsenal-v42.js', 'art/naka-riposte-v43.js', 'art/naka-hunt-v44.js', 'art/naka-guard-v47.js', 'art/naka-tactics-v48.js', 'art/naka-pressure-v49.js', 'art/naka-followthrough-v50.js', 'art/naka-art.js', 'art/ratpack.js', 'art/cragclaw/CragclawConfig.js', 'art/cragclaw/CragclawCore.js', 'art/cragclaw/CragclawArt.js', 'art/cragclaw/CragclawCombat.js', 'art/cragclaw/ApexCragclawConfig.js', 'art/cragclaw/ApexCragclawCore.js', 'art/cragclaw/ApexCragclawArt.js', 'art/cragclaw/ApexCragclawCombat.js', 'art/cragclaw/CragclawDuoPack.js', 'art/visual/wardenm_lance.png', 'art/visual/wardenm_blades.png', 'art/visual/wardenm_fangs.png', 'art/visual/wardenm_maul.png', 'art/visual/wardenm_platemaul.png', 'art/visual/wardenm_coilwhip.png', 'art/visual/wardenw_lance.png', 'art/visual/wardenw_blades.png', 'art/visual/wardenw_fangs.png', 'art/visual/wardenw_maul.png', 'art/visual/wardenw_platemaul.png', 'art/visual/wardenw_coilwhip.png', 'art/npc/bran.png', 'art/npc/mira.png', 'art/npc/noi.png', 'art/npc/ta.png', 'art/npc/pim.png', 'art/npc/ren.png', 'art/npc/kaew.png', 'art/npc/kid.png', 'art/npc/warden.png', 'art/visual/fld_bush_a.webp', 'art/visual/fld_bush_b.webp', 'art/visual/fld_bush_c.webp', 'art/visual/fld_campfire.webp', 'art/visual/fld_tent.webp', 'art/visual/fld_tree_a.webp', 'art/visual/fld_tree_b.webp', 'art/visual/fld_tree_c.webp', 'art/visual/fx_fire.webp', 'art/visual/vil3_base_dirt_a.webp', 'art/visual/vil3_base_dirt_b.webp', 'art/visual/vil3_base_shadow.webp', 'art/visual/vil3_base_stone.webp', 'art/visual/vil3_banner_bad.webp', 'art/visual/vil3_banner_good.webp', 'art/visual/vil3_barrel.webp', 'art/visual/vil3_camp_tent_a.webp', 'art/visual/vil3_camp_tent_b.webp', 'art/visual/vil3_campfire_big.webp', 'art/visual/vil3_cliff_left.webp', 'art/visual/vil3_clothesline.webp', 'art/visual/vil3_crates.webp', 'art/visual/vil3_fence_h.webp', 'art/visual/vil3_fence_v.webp', 'art/visual/vil3_flowers_a.webp', 'art/visual/vil3_flowers_b.webp', 'art/visual/vil3_flowers_c.webp', 'art/visual/vil3_garden_plot.webp', 'art/visual/vil3_garden_plot_bloom.webp', 'art/visual/vil3_ground_tile.webp', 'art/visual/vil3_haystack.webp', 'art/visual/vil3_lamp.webp', 'art/visual/vil3_path_edge.webp', 'art/visual/vil3_path_tile.webp', 'art/visual/vil3_signpost.webp', 'art/visual/vil3_spore_patch.webp', 'art/visual/vil3_stump_log.webp', 'art/visual/vil3_treeline_bottom.webp', 'art/visual/vil3_treeline_top.webp', 'art/visual/vil3_vines_wall.webp', 'art/visual/vil3_well.webp', 'art/visual/fx_impact.webp', 'art/visual/fx_spore.webp', 'art/visual/rock_a.webp', 'art/visual/rock_b.webp', 'art/visual/rock_c.webp', 'art/visual/rock_d.webp', 'art/visual/warden_sheet.webp', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png', 'icons/apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys
    .filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
    .map(key => caches.delete(key)))).then(() => self.clients.claim()));
});

async function cached(request) {
  try { return await (await caches.open(CACHE_NAME)).match(request); } catch (error) { return undefined; }
}
async function store(request, response) {
  if (!response.ok) return;
  // Cache writes finish within respondWith's lifetime. Quota failures still serve the network response.
  try { await (await caches.open(CACHE_NAME)).put(request, response.clone()); } catch (error) {}
}
async function navigation(request) {
  let response;
  try {
    response = await fetch(request);
    if (response.ok) { await store(request, response); return response; }
  } catch (error) {}
  return (await cached(request)) || (await cached('index.html')) || response || Response.error();
}
async function asset(request) {
  const hit = await cached(request);
  if (hit) return hit;
  const response = await fetch(request);
  await store(request, response);
  return response;
}
self.addEventListener('fetch', e => {
  const request = e.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== location.origin) return;
  e.respondWith(request.mode === 'navigate' ? navigation(request) : asset(request));
});
