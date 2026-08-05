/* ===== profile.js ===== */
function renderProfile(){
  const u=currentUser;
  if(!u)return;
  document.getElementById('profAvatar').textContent=initials(u.name);
  document.getElementById('profName').textContent=u.name;
  document.getElementById('profMeta').textContent=(u.field||u.role)+(u.institution?' · '+u.institution:'')+(u.country?' · '+u.country:'');
  const badges=['<span class="badge-status active">'+u.role+'</span>'];
  if(u.role==='mentor'&&u.mentorRating){badges.push('<span class="mentor-rating">'+ICONS.star+' '+u.mentorRating+'</span>')}
  document.getElementById('profBadges').innerHTML=badges.join('');
  document.getElementById('profBio').textContent=u.bio||'No bio added yet.';
  document.getElementById('profEducation').innerHTML=(u.education||'—')+'<br>'+(u.institution||'—')+'<br>'+(u.field||'—');
  document.getElementById('profSkills').innerHTML=(u.skills||[]).map(function(s){return '<span class="tag">'+s+'</span>'}).join('')||'<div class="hint">No skills added.</div>';
  document.getElementById('profInterests').innerHTML=(u.interests||[]).map(function(s){return '<span class="tag">'+s+'</span>'}).join('')||'<div class="hint">No interests added.</div>';
  document.getElementById('profDocs').innerHTML=
    (u.resumeFileName?'<div class="pd-doc-row">'+ICONS.file+' '+u.resumeFileName+'</div>':'')+
    (u.certFileNames||[]).map(function(c){return '<div class="pd-doc-row">'+ICONS.file+' '+c+'</div>'}).join('')
    ||'<div class="hint">No documents uploaded.</div>';
  const myProjects=DB.projects.filter(function(p){return p.ownerId===u.id||(p.members||[]).indexOf(u.id)>-1});
  document.getElementById('profProjects').innerHTML=myProjects.length?myProjects.map(function(p){
    const cat=catInfo(p.category);
    return '<div class="mini-proj" style="cursor:pointer" onclick="location.href=\'project-detail.html?id='+p.id+'\'"><div class="ic-box" style="color:'+cat.color+'">'+ICONS[cat.icon]+'</div><div style="flex:1"><div style="font-weight:600;font-size:13.5px">'+p.title+'</div><div style="font-size:11px;color:var(--faint);font-family:var(--font-mono)">'+p.category+' · '+p.status+'</div></div></div>';
  }).join(''):'<div class="empty-state">'+ICONS.rocket+'<p>No projects yet.</p></div>';
  const achievements=['Early Adopter'];
  if(myProjects.some(function(p){return p.status==='published'}))achievements.push('First Project Published');
  if(u.role==='mentor')achievements.push('Mentor Verified');
  document.getElementById('profAchievements').innerHTML=achievements.map(function(a){return '<span class="achievement-badge">'+ICONS.award+' '+a+'</span>'}).join('');
}
function initProfilePage(){
  if(!requireLogin())return;
  renderProfile();
}
initPage('profile', initProfilePage);
