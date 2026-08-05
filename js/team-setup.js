/* ===== team-setup.js ===== */
async function createTeamProject(){
  if(!currentUser){toast('Log in to create a team','err');location.href='login.html';return}
  const title=document.getElementById('teamProjTitle').value.trim();
  if(!title){toast('Give your project a title first','err');return}
  const p={
    id:uid('p'),title:title,
    category:document.getElementById('teamProjCategory').value,
    type:'team',
    description:document.getElementById('teamProjDesc').value.trim(),
    skills:document.getElementById('teamProjSkills').value.split(',').map(s=>s.trim()).filter(Boolean),
    ownerId:currentUser.id,mentorId:null,members:[],joinRequests:[],progress:0,status:'draft',featured:false,
    createdAt:new Date().toISOString().slice(0,10),
  };
  DB.projects.push(p);
  await saveCollection('scibridge_projects',DB.projects);
  toast('Team created — workspace is ready');
  location.href='team-workspace.html?id='+p.id;
}
function renderOpenTeams(){
  const openTeams=DB.projects.filter(p=>p.type==='team');
  const box=document.getElementById('openTeamsList');
  if(!openTeams.length){box.innerHTML='<div class="card empty-state" style="padding:var(--s6)">'+ICONS.users+'<p>No open teams yet — be the first to start one.</p></div>';return}
  box.innerHTML=openTeams.map(p=>{
    const cat=catInfo(p.category);
    const owner=userById(p.ownerId);
    const alreadyIn=currentUser&&(p.ownerId===currentUser.id||(p.members||[]).includes(currentUser.id));
    const pending=currentUser&&(p.joinRequests||[]).some(r=>r.userId===currentUser.id&&r.status==='pending');
    const joinBtn=alreadyIn?'<span class="badge-status active">On team</span>':pending?'<span class="badge-status pending">Requested</span>':'<button class="btn btn-outline btn-sm" onclick="requestJoinTeam(\''+p.id+'\')">Request to Join</button>';
    return '<div class="card" style="padding:var(--s5);margin-bottom:var(--s3);display:flex;justify-content:space-between;align-items:center;gap:var(--s4);flex-wrap:wrap"><div><div class="cat" style="margin-bottom:4px"><span class="d" style="background:'+cat.color+'"></span>'+p.category+'</div><div style="font-weight:600">'+p.title+'</div><div style="font-size:11.5px;color:var(--faint);font-family:var(--font-mono);margin-top:2px">Led by '+(owner?owner.name:'—')+' · '+((p.members||[]).length+1)+' members</div></div><div style="display:flex;gap:6px;align-items:center"><button class="btn btn-ghost btn-sm" onclick="location.href=\'project-detail.html?id='+p.id+'\'">View</button>'+joinBtn+'</div></div>';
  }).join('');
}
function initTeamSetupPage(){
  if(!requireLogin())return;
  populateCategorySelect('teamProjCategory');
  renderOpenTeams();
}
initPage('team-setup', initTeamSetupPage);
