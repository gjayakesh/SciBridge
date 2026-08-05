/* ===== about.js ===== */
function initAboutPage(){
  document.getElementById('aboutCategories').innerHTML=CATEGORIES.map(function(c){return '<div style="display:flex;align-items:center;gap:8px;padding:8px 0;font-family:var(--font-mono);font-size:12.5px;color:var(--dim)"><span style="color:'+c.color+';display:inline-flex;width:16px;height:16px">'+ICONS[c.icon]+'</span>'+c.name+'</div>'}).join('');
}
initPage('about', initAboutPage);
