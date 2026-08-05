/* ===== doubts.js ===== */
let doubtFilterSubject='All';
const SUBJECTS=['Physics','Mathematics','Engineering','Space Science','Programming','Electronics'];
function handleDoubtAttachment(el){
  const name=el.files[0]?el.files[0].name:'';
  document.getElementById('doubtAttachmentName').innerHTML=name?'<div class="f">'+ICONS.file+' '+name+'</div>':'';
}
async function submitDoubt(){
  if(!currentUser){toast('Log in to ask a question','err');location.href='login.html';return}
  const subject=document.getElementById('doubtSubject').value;
  const question=document.getElementById('doubtQuestion').value.trim();
  if(!question){toast('Write your question first','err');return}
  const d={id:uid('d'),subject:subject,question:question,authorId:currentUser.id,authorName:currentUser.name,status:'open',createdAt:new Date().toISOString().slice(0,10),replies:[]};
  DB.doubts.unshift(d);
  await saveCollection('scibridge_doubts',DB.doubts);
  document.getElementById('doubtQuestion').value='';
  document.getElementById('doubtAttachmentName').innerHTML='';
  toast('Question posted');
  renderDoubtFilter();renderDoubtsList();
}
function renderDoubtFilter(){
  const all=['All'].concat(SUBJECTS);
  document.getElementById('doubtFilterStrip').innerHTML=all.map(s=>{
    const count=s==='All'?DB.doubts.length:DB.doubts.filter(d=>d.subject===s).length;
    return '<span class="cat-pill'+(doubtFilterSubject===s?' active-pill':'')+'" onclick="setDoubtFilter(\''+s+'\')">'+s+' ('+count+')</span>';
  }).join('');
}
function setDoubtFilter(s){doubtFilterSubject=s;renderDoubtFilter();renderDoubtsList();}
function renderDoubtsList(){
  const list=doubtFilterSubject==='All'?DB.doubts:DB.doubts.filter(d=>d.subject===doubtFilterSubject);
  const box=document.getElementById('doubtsList');
  if(!list.length){box.innerHTML='<div class="card empty-state" style="padding:var(--s7)">'+ICONS.chat+'<p>No doubts here yet — ask the first one.</p></div>';return}
  box.innerHTML=list.map(d=>{
    const repliesHTML=(d.replies||[]).map(r=>'<div class="doubt-reply"><div class="avatar" style="margin-left:0;width:30px;height:30px;font-size:10px">'+initials(r.authorName)+'</div><div class="rb"><div class="rn">'+r.authorName+(r.role==='mentor'?'<span class="mtag">Mentor</span>':'')+'</div><p>'+r.content+'</p></div></div>').join('');
    return '<div class="card doubt-card"><div class="doubt-card-head"><span class="badge"><span class="dot" style="background:var(--telemetry)"></span>'+d.subject+'</span><span class="badge-status '+d.status+'">'+d.status+'</span></div><p class="doubt-q">'+d.question+'</p><div class="doubt-meta">Asked by '+d.authorName+' · '+fmtDate(d.createdAt)+'</div>'+repliesHTML+'<div class="doubt-reply-form"><input class="input" placeholder="Reply as a mentor (demo)…" id="reply-'+d.id+'"><button class="btn btn-outline btn-sm" onclick="addDoubtReply(\''+d.id+'\')">Reply</button></div></div>';
  }).join('');
}
async function addDoubtReply(id){
  if(!currentUser){toast('Log in to reply','err');location.href='login.html';return}
  const input=document.getElementById('reply-'+id);
  const content=input.value.trim();
  if(!content)return;
  const d=DB.doubts.find(x=>x.id===id);
  const isMentorish=currentUser.role==='mentor'||currentUser.role==='admin';
  d.replies=d.replies||[];
  d.replies.push({authorName:currentUser.name,role:isMentorish?'mentor':'student',content:content,createdAt:new Date().toISOString().slice(0,10)});
  d.status='answered';
  await saveCollection('scibridge_doubts',DB.doubts);
  input.value='';
  renderDoubtsList();
  toast('Reply posted');
}
function initDoubtsPage(){
  renderDoubtFilter();
  renderDoubtsList();
}
initPage('doubts', initDoubtsPage);
