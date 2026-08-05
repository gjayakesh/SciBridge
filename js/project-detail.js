/* ===== project-detail.js ===== */
let currentProjectDetailId=null;
function renderProjectDetail(p){
  const cat=catInfo(p.category);
  document.getElementById('pdCat').innerHTML='<span class="eyebrow amber" style="margin-bottom:0">'+p.category+' · '+(p.type==='team'?'Team Project':'Individual Project')+'</span>';
  document.getElementById('pdTitle').textContent=p.title;
  document.getElementById('pdStatusBadge').textContent=p.status;
  document.getElementById('pdStatusBadge').className='badge-status '+p.status;
  document.getElementById('pdDesc').textContent=p.description||'No description yet.';
  document.getElementById('pdProgressFill').style.width=p.progress+'%';
  document.getElementById('pdProgressLabel').textContent=p.progress+'% complete';
  document.getElementById('pdSkills').innerHTML=(p.skills||[]).map(function(s){return '<span class="tag">'+s+'</span>'}).join('')||'<div class="hint">No skills listed.</div>';
  document.getElementById('pdMedia').innerHTML=renderMediaPlaceholders(3,cat.icon)+'<div class="pd-media-item">'+ICONS.file+'</div>';
  document.getElementById('pdDocs').innerHTML=(p.files&&p.files.length)?p.files.map(function(f){return '<div class="pd-doc-row">'+ICONS.file+' '+f+'</div>'}).join(''):'<div class="hint">No documents uploaded yet.</div>';
  document.getElementById('pdUpdates').innerHTML=(p.updates&&p.updates.length)?p.updates.map(function(u){return '<div class="announce-item"><p>'+u.content+'</p><div class="t">'+fmtDate(u.createdAt)+'</div></div>'}).join(''):'<div class="hint">No updates posted yet.</div>';

  const owner=userById(p.ownerId);
  const members=(p.members||[]).map(userById).filter(Boolean);
  const all=[owner].concat(members).filter(function(v,i,a){return v&&a.findIndex(function(x){return x&&x.id===v.id})===i});
  document.getElementById('pdTeam').innerHTML=all.map(function(m){return '<div class="tw-member"><div class="avatar" style="margin-left:0;width:28px;height:28px;font-size:10px">'+initials(m.name)+'</div>'+m.name+'<span class="role">'+(m.id===p.ownerId?'Lead':'Member')+'</span></div>'}).join('')||'<div class="hint">No team listed.</div>';

  const mentor=p.mentorId?userById(p.mentorId):null;
  document.getElementById('pdMentor').innerHTML=mentor?('<div style="display:flex;align-items:center;gap:10px"><div class="avatar" style="margin-left:0;width:32px;height:32px">'+initials(mentor.name)+'</div><div style="font-weight:600;font-size:13px">'+mentor.name+'</div></div>'):'<div class="hint">No mentor assigned yet.</div>';

  const isOwnerOrMember=currentUser&&(p.ownerId===currentUser.id||(p.members||[]).indexOf(currentUser.id)>-1);
  let actions='';
  if(isOwnerOrMember){
    actions='<button class="btn btn-primary" onclick="'+(p.type==='team'?"location.href='team-workspace.html?id="+p.id+"'":"location.href='individual-workspace.html?id="+p.id+"'")+'">Open Workspace</button>';
  }else if(p.type==='team'){
    actions='<button class="btn btn-primary" onclick="requestJoinTeam(\''+p.id+'\')">Request to Join</button>';
  }
  actions+='<button class="btn btn-outline" onclick="location.href=\'explore.html\'">← Back to Explore</button>';
  document.getElementById('pdActions').innerHTML=actions;

  document.getElementById('pdComments').innerHTML=(p.comments&&p.comments.length)?p.comments.map(function(c){return '<div class="pd-comment"><div class="avatar" style="margin-left:0;width:30px;height:30px;font-size:10px">'+initials(c.authorName)+'</div><div><div style="font-weight:600;font-size:12.5px">'+c.authorName+'</div><p>'+c.content+'</p></div></div>'}).join(''):'<div class="hint">No comments yet — be the first.</div>';
}
async function addProjectComment(){
  if(!currentUser){toast('Log in to comment','err');location.href='login.html';return}
  const input=document.getElementById('pdCommentInput');
  const val=input.value.trim();
  if(!val)return;
  const p=projectById(currentProjectDetailId);
  p.comments=p.comments||[];
  p.comments.push({authorName:currentUser.name,content:val});
  await saveCollection('scibridge_projects',DB.projects);
  input.value='';
  renderProjectDetail(p);
}
function initProjectDetailPage(qs){
  const id=qs.get('id');
  const p=projectById(id);
  if(!p){toast('Project not found','err');setTimeout(()=>location.href='explore.html',600);return}
  currentProjectDetailId=id;
  renderProjectDetail(p);
}
initPage('project-detail', initProjectDetailPage);
