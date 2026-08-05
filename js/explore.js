/* ===== explore.js ===== */
let exploreCategory='All';
function renderExploreCatStrip(){
  const all=['All'].concat(CATEGORIES.map(function(c){return c.name}));
  document.getElementById('exploreCatStrip').innerHTML=all.map(function(name){
    const c=name==='All'?null:catInfo(name);
    return '<span class="cat-pill'+(exploreCategory===name?' active-pill':'')+'" onclick="setExploreCategory(\''+name+'\')">'+(c?'<span class="d" style="background:'+c.color+'"></span>':'')+name+'</span>';
  }).join('');
}
function setExploreCategory(name){exploreCategory=name;renderExploreCatStrip();renderExploreGrid();}
function renderExploreGrid(){
  const searchEl=document.getElementById('exploreSearch');
  const q=(searchEl&&searchEl.value||'').toLowerCase();
  let list=DB.projects.filter(function(p){return p.status==='published'});
  if(exploreCategory!=='All')list=list.filter(function(p){return p.category===exploreCategory});
  if(q)list=list.filter(function(p){return p.title.toLowerCase().indexOf(q)>-1||p.category.toLowerCase().indexOf(q)>-1||(p.skills||[]).some(function(s){return s.toLowerCase().indexOf(q)>-1})});
  const box=document.getElementById('exploreGrid');
  box.innerHTML=list.length?list.map(projectCardHTML).join(''):'<div class="card empty-state" style="grid-column:1/-1;padding:var(--s8)">'+ICONS.search+'<p>No projects match — try a different search or category.</p></div>';
}
function initExplorePage(qs){
  exploreCategory=qs.get('category')||'All';
  renderExploreCatStrip();
  renderExploreGrid();
}
initPage('explore', initExplorePage);
