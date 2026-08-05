/* ===== dashboard.js ===== */
function initDashboardPage(){
  if(!requireLogin())return;
  document.getElementById('dashGreeting').textContent='Hello, '+(currentUser?currentUser.name.split(' ')[0]:'Contributor')+'.';
  const mine=DB.projects.filter(p=>currentUser&&(p.ownerId===currentUser.id||(p.members||[]).includes(currentUser.id)));
  const box=document.getElementById('dashMyProjects');
  box.innerHTML=mine.length?mine.map(p=>{
    const cat=catInfo(p.category);
    return '<div class="mini-proj" style="cursor:pointer" onclick="location.href=\'project-detail.html?id='+p.id+'\'"><div class="ic-box" style="color:'+cat.color+'">'+ICONS[cat.icon]+'</div><div style="flex:1"><div style="font-weight:600;font-size:13.5px">'+p.title+'</div><div style="font-size:11.5px;color:var(--faint);font-family:var(--font-mono)">'+p.category+' · '+p.progress+'% complete</div></div></div>';
  }).join(''):'<div class="empty-state">'+ICONS.rocket+'<p>No projects yet — start one and it will show up here.</p></div>';
  const aBox=document.getElementById('dashAnnouncements');
  aBox.innerHTML=DB.announcements.length?DB.announcements.slice(0,4).map(a=>'<div class="announce-item"><h5>'+a.title+'</h5><p>'+a.content+'</p><div class="t">'+fmtDate(a.createdAt)+'</div></div>').join(''):'<div class="empty-state" style="padding:var(--s5) 0"><p>No announcements yet.</p></div>';
}
initPage('dashboard', initDashboardPage);
