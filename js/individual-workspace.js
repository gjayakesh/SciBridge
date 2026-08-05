/* ===== individual-workspace.js ===== */
let indivDraft=null;
function handleIndivFiles(el){
  const names=Array.from(el.files).map(f=>f.name);
  indivDraft.files=(indivDraft.files||[]).concat(names);
  renderIndivFiles();
}
function renderIndivFiles(){
  const list=indivDraft.files||[];
  document.getElementById('indivFileList').innerHTML=list.length?list.map(n=>'<div class="f">'+ICONS.file+' '+n+'</div>').join(''):'<div class="hint">No files uploaded yet.</div>';
}
function updateIndivProgress(v){
  indivDraft.progress=Number(v);
  document.getElementById('indivProgressVal').textContent=v;
  document.getElementById('indivProgressFill').style.width=v+'%';
}
async function saveIndividualDraft(){
  indivDraft.title=document.getElementById('indivProjTitle').value.trim()||'Untitled Project';
  indivDraft.category=document.getElementById('indivProjCategory').value;
  indivDraft.skills=document.getElementById('indivProjSkills').value.split(',').map(s=>s.trim()).filter(Boolean);
  indivDraft.description=document.getElementById('indivProjDesc').value.trim();
  document.getElementById('indivTitle').textContent=indivDraft.title;
  await saveCollection('scibridge_projects',DB.projects);
  toast('Draft saved');
}
async function postIndivUpdate(){
  const input=document.getElementById('indivUpdateInput');
  const val=input.value.trim();
  if(!val)return;
  indivDraft.updates=indivDraft.updates||[];
  indivDraft.updates.unshift({content:val,createdAt:new Date().toISOString().slice(0,10)});
  input.value='';
  renderIndivUpdates();
  await saveCollection('scibridge_projects',DB.projects);
}
function renderIndivUpdates(){
  const list=indivDraft.updates||[];
  document.getElementById('indivUpdatesList').innerHTML=list.length?list.map(u=>'<div class="announce-item"><p>'+u.content+'</p><div class="t">'+fmtDate(u.createdAt)+'</div></div>').join(''):'<div class="hint">No updates posted yet.</div>';
}
function askMentorAboutIndiv(){
  const val=document.getElementById('indivMentorNote').value.trim();
  if(!val){toast('Write a note first','err');return}
  document.getElementById('indivMentorNote').value='';
  toast("Sent to available mentors — you'll be notified when one replies");
}
async function publishIndividualProject(){
  await saveIndividualDraft();
  indivDraft.status='published';
  document.getElementById('indivStatusBadge').textContent='published';
  document.getElementById('indivStatusBadge').className='badge-status published';
  await saveCollection('scibridge_projects',DB.projects);
  toast('Project published — it now appears in Explore Projects');
  location.href='project-detail.html?id='+indivDraft.id;
}
function initIndividualWorkspacePage(qs){
  if(!requireLogin())return;
  const id=qs.get('id');
  indivDraft=DB.projects.find(p=>p.id===id);
  if(!indivDraft || indivDraft.ownerId!==currentUser.id){
    toast('That project was not found','err');
    setTimeout(()=>location.href='build-choice.html',600);
    return;
  }
  populateCategorySelect('indivProjCategory');
  document.getElementById('indivProjTitle').value=indivDraft.title;
  document.getElementById('indivProjCategory').value=indivDraft.category;
  document.getElementById('indivProjSkills').value=(indivDraft.skills||[]).join(', ');
  document.getElementById('indivProjDesc').value=indivDraft.description;
  document.getElementById('indivTitle').textContent=indivDraft.title||'Individual Project';
  document.getElementById('indivStatusBadge').textContent=indivDraft.status;
  document.getElementById('indivStatusBadge').className='badge-status '+indivDraft.status;
  document.getElementById('indivProgressSlider').value=indivDraft.progress;
  document.getElementById('indivProgressVal').textContent=indivDraft.progress;
  document.getElementById('indivProgressFill').style.width=indivDraft.progress+'%';
  renderIndivFiles();
  renderIndivUpdates();
}
initPage('individual-workspace', initIndividualWorkspacePage);
