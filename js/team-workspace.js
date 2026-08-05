/* ===== team-workspace.js ===== */
let currentProjectId=null;
let currentTab='chat';
let wsData=null;
let calCursor=new Date();

const TW_TABS=[
  {key:'chat',label:'Chat',icon:'chat'},{key:'files',label:'Files',icon:'file'},{key:'tasks',label:'Tasks',icon:'tasks'},
  {key:'progress',label:'Progress',icon:'bolt'},{key:'notes',label:'Meeting Notes',icon:'notes'},{key:'discussion',label:'Discussion',icon:'discuss'},
  {key:'calendar',label:'Calendar',icon:'calendar'},{key:'timeline',label:'Timeline',icon:'timeline'},
];
function renderTWTabs(){
  document.getElementById('twTabs').innerHTML=TW_TABS.map(t=>'<div class="tw-tab'+(currentTab===t.key?' active':'')+'" onclick="setWorkspaceTab(\''+t.key+'\')">'+ICONS[t.icon]+'<span>'+t.label+'</span></div>').join('');
}
function setWorkspaceTab(key){currentTab=key;renderTWTabs();renderTWPanel();}
function renderTWPanel(){
  const p=projectById(currentProjectId);
  if(!p||!wsData)return;
  const fns={chat:renderTabChat,files:renderTabFiles,tasks:renderTabTasks,progress:renderTabProgress,notes:renderTabNotes,discussion:renderTabDiscussion,calendar:renderTabCalendar,timeline:renderTabTimeline};
  document.getElementById('twPanel').innerHTML=fns[currentTab](p,wsData);
  hydrateIcons(document.getElementById('twPanel'));
  if(currentTab==='chat')scrollChatToBottom();
  if(currentTab==='calendar')renderCalendarGrid(p,wsData);
}
function renderTWSidebar(p){
  document.getElementById('twDesc').value=p.description||'';
  document.getElementById('twSkillsTags').innerHTML=(p.skills||[]).map(s=>'<span class="tag">'+s+'</span>').join('');
  const mentor=p.mentorId?userById(p.mentorId):null;
  document.getElementById('twMentorBox').innerHTML=mentor?
    ('<div style="display:flex;align-items:center;gap:10px"><div class="avatar" style="margin-left:0;width:36px;height:36px">'+initials(mentor.name)+'</div><div><div style="font-weight:600;font-size:13px">'+mentor.name+'</div><div style="font-size:11px;color:var(--faint)">'+((mentor.mentorExpertise||[]).join(', '))+'</div></div></div>')
    :('<div class="hint" style="margin-bottom:8px">No mentor assigned yet.</div><button class="btn btn-outline btn-sm btn-block" onclick="assignRandomMentor()">Request a Mentor</button>');
  const members=(p.members||[]).map(userById).filter(Boolean);
  const owner=userById(p.ownerId);
  const all=[owner].concat(members).filter(function(v,i,a){return v&&a.findIndex(function(x){return x&&x.id===v.id})===i});
  document.getElementById('twMemberCount').textContent=all.length;
  document.getElementById('twMembersList').innerHTML=all.map(function(m){return '<div class="tw-member"><div class="avatar" style="margin-left:0;width:26px;height:26px;font-size:9px">'+initials(m.name)+'</div>'+m.name+'<span class="role">'+(m.id===p.ownerId?'Lead':'Member')+'</span></div>'}).join('');

  const isOwner=currentUser&&p.ownerId===currentUser.id;
  const pending=(p.joinRequests||[]).filter(r=>r.status==='pending');
  const reqBox=document.getElementById('twJoinRequests');
  if(reqBox){
    if(isOwner&&pending.length){
      reqBox.style.display='block';
      reqBox.innerHTML='<h4 class="ws-label">Join Requests ('+pending.length+')</h4>'+pending.map(function(r){
        return '<div class="tw-member" style="margin-bottom:6px"><div class="avatar" style="margin-left:0;width:26px;height:26px;font-size:9px">'+initials(r.userName)+'</div>'+r.userName+
          '<span style="margin-left:auto;display:flex;gap:4px"><button class="btn btn-outline btn-sm" style="padding:4px 8px;font-size:10px" onclick="acceptJoinRequest(\''+r.id+'\')">Accept</button><button class="btn btn-ghost btn-sm" style="padding:4px 8px;font-size:10px" onclick="declineJoinRequest(\''+r.id+'\')">Decline</button></span></div>';
      }).join('');
    }else{
      reqBox.style.display='none';
      reqBox.innerHTML='';
    }
  }
}
async function acceptJoinRequest(reqId){
  const p=projectById(currentProjectId);
  const req=(p.joinRequests||[]).find(r=>r.id===reqId);
  if(!req)return;
  req.status='accepted';
  p.members=p.members||[];
  if(!p.members.includes(req.userId))p.members.push(req.userId);
  await saveCollection('scibridge_projects',DB.projects);
  toast(req.userName+' joined the team');
  renderTWSidebar(p);
}
async function declineJoinRequest(reqId){
  const p=projectById(currentProjectId);
  const req=(p.joinRequests||[]).find(r=>r.id===reqId);
  if(!req)return;
  req.status='declined';
  await saveCollection('scibridge_projects',DB.projects);
  toast('Request declined');
  renderTWSidebar(p);
}
async function assignRandomMentor(){
  const p=projectById(currentProjectId);
  const mentors=DB.users.filter(u=>u.role==='mentor');
  if(!mentors.length){toast('No mentors available yet','err');return}
  p.mentorId=mentors[0].id;
  await saveCollection('scibridge_projects',DB.projects);
  toast('Mentor request sent — '+mentors[0].name+' will review your project');
  renderTWSidebar(p);
}
async function inviteToTeam(){
  const q=document.getElementById('twInviteInput').value.trim().toLowerCase();
  if(!q)return;
  const p=projectById(currentProjectId);
  const match=DB.users.find(u=>u.name.toLowerCase().includes(q)||u.email.toLowerCase().includes(q));
  if(!match){toast('No matching user found','err');return}
  p.members=p.members||[];
  if(p.members.includes(match.id)||p.ownerId===match.id){toast(match.name+' is already on the team','err');return}
  p.members.push(match.id);
  await saveCollection('scibridge_projects',DB.projects);
  toast(match.name+' added to the team');
  document.getElementById('twInviteInput').value='';
  renderTWSidebar(p);
}
async function saveTeamDetails(){
  const p=projectById(currentProjectId);
  p.description=document.getElementById('twDesc').value.trim();
  await saveCollection('scibridge_projects',DB.projects);
  toast('Details saved');
}
async function publishTeamProject(){
  const p=projectById(currentProjectId);
  p.status='published';
  document.getElementById('twStatusBadge').textContent='published';
  document.getElementById('twStatusBadge').className='badge-status published';
  await saveCollection('scibridge_projects',DB.projects);
  toast('Project published — visible in Explore Projects');
}

/* ---------- TAB: CHAT ---------- */
function renderTabChat(p,d){
  const msgs=d.chat.map(function(m){
    const isMe=currentUser&&m.authorId===currentUser.id;
    return '<div class="chat-msg'+(isMe?' me':'')+'"><div class="avatar" style="margin-left:0;width:28px;height:28px;font-size:10px;flex:none">'+initials(m.authorName)+'</div><div><div class="bubble">'+m.content+'</div><div class="meta">'+m.authorName+' · '+m.time+'</div></div></div>';
  }).join('');
  return '<h4 class="ws-label">Team Chat</h4><div class="chat-box" id="chatMessages">'+(msgs||'<div class="hint">No messages yet — say hello.</div>')+'</div><div class="chat-input-row"><input class="input" id="chatInput" placeholder="Message the team…" onkeydown="if(event.key===\'Enter\')sendChatMessage()"><button class="btn btn-primary btn-sm" onclick="sendChatMessage()">Send</button></div>';
}
async function sendChatMessage(){
  const input=document.getElementById('chatInput');
  const val=input.value.trim();
  if(!val)return;
  wsData.chat.push({authorId:currentUser?currentUser.id:'guest',authorName:currentUser?currentUser.name:'You',content:val,time:new Date().toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'})});
  input.value='';
  renderTWPanel();
  await saveWorkspaceData(currentProjectId,wsData);
}
function scrollChatToBottom(){
  const box=document.getElementById('chatMessages');
  if(box)box.scrollTop=box.scrollHeight;
}

/* ---------- TAB: FILES ---------- */
function renderTabFiles(p,d){
  const rows=d.files.map(function(f){return '<div class="mini-proj"><div class="ic-box">'+ICONS.file+'</div><div style="flex:1"><div style="font-weight:600;font-size:13px">'+f.name+'</div><div style="font-size:11px;color:var(--faint);font-family:var(--font-mono)">'+f.by+' · '+fmtDate(f.date)+'</div></div><span class="tag">'+f.kind+'</span></div>'}).join('');
  return '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--s4)"><h4 class="ws-label" style="margin:0">Shared Files</h4><label class="btn btn-outline btn-sm" style="cursor:pointer">Upload<input type="file" multiple style="display:none" onchange="uploadTeamFile(this)"></label></div><div>'+(rows||'<div class="hint">No files shared yet.</div>')+'</div>';
}
async function uploadTeamFile(el){
  Array.from(el.files).forEach(function(f){wsData.files.unshift({name:f.name,by:currentUser?currentUser.name:'You',kind:'document',date:new Date().toISOString().slice(0,10)})});
  toast('File added to shared files (preview only — not stored on a server)');
  renderTWPanel();
  await saveWorkspaceData(currentProjectId,wsData);
}

/* ---------- TAB: TASKS ---------- */
function renderTabTasks(p,d){
  const cols={todo:'TO DO',in_progress:'IN PROGRESS',done:'DONE'};
  const colHTML=Object.keys(cols).map(function(k){
    const items=d.tasks.filter(function(t){return t.status===k}).map(function(t){return '<div class="task-item" onclick="cycleTask(\''+t.id+'\')"><span>'+t.text+'</span><span class="x" onclick="event.stopPropagation();deleteTask(\''+t.id+'\')">'+ICONS.close+'</span></div>'}).join('');
    return '<div class="task-col"><h5>'+cols[k]+' ('+d.tasks.filter(function(t){return t.status===k}).length+')</h5>'+(items||'<div class="hint">Empty</div>')+'</div>';
  }).join('');
  return '<div style="display:flex;gap:8px;margin-bottom:var(--s4)"><input class="input" id="taskInput" placeholder="Add a task…" onkeydown="if(event.key===\'Enter\')addTeamTask()"><button class="btn btn-primary btn-sm" onclick="addTeamTask()">Add</button></div><div class="hint" style="margin-bottom:var(--s4)">Click a task to move it forward: To Do → In Progress → Done.</div><div class="task-cols">'+colHTML+'</div>';
}
async function addTeamTask(){
  const input=document.getElementById('taskInput');
  const val=input.value.trim();
  if(!val)return;
  wsData.tasks.push({id:uid('t'),text:val,status:'todo'});
  input.value='';
  renderTWPanel();
  await saveWorkspaceData(currentProjectId,wsData);
}
async function cycleTask(id){
  const t=wsData.tasks.find(function(x){return x.id===id});
  const order=['todo','in_progress','done'];
  t.status=order[(order.indexOf(t.status)+1)%order.length];
  renderTWPanel();
  await saveWorkspaceData(currentProjectId,wsData);
}
async function deleteTask(id){
  wsData.tasks=wsData.tasks.filter(function(x){return x.id!==id});
  renderTWPanel();
  await saveWorkspaceData(currentProjectId,wsData);
}

/* ---------- TAB: PROGRESS ---------- */
function renderTabProgress(p,d){
  const milestones=d.milestones.map(function(m){return '<div style="margin-bottom:var(--s4)"><div style="display:flex;justify-content:space-between;font-size:12.5px;margin-bottom:6px"><span>'+m.name+'</span><span style="font-family:var(--font-mono);color:var(--dim)">'+m.pct+'%</span></div><div class="progress-bar" style="cursor:pointer" onclick="bumpMilestone(\''+m.id+'\')" title="Click to advance"><div class="progress-fill" style="width:'+m.pct+'%"></div></div></div>'}).join('');
  return '<h4 class="ws-label">Overall Completion — '+p.progress+'%</h4><input type="range" min="0" max="100" value="'+p.progress+'" oninput="updateTeamProgress(this.value)" style="width:100%;margin-bottom:var(--s3)"><div class="progress-bar" style="margin-bottom:var(--s7)"><div class="progress-fill" style="width:'+p.progress+'%"></div></div><h4 class="ws-label">Milestones <span style="text-transform:none;color:var(--faint);font-weight:400;font-family:var(--font-body);letter-spacing:0">— click a bar to advance it</span></h4>'+milestones+'<div style="display:flex;gap:8px;margin-top:var(--s4)"><input class="input" id="milestoneInput" placeholder="Add a milestone…" onkeydown="if(event.key===\'Enter\')addMilestone()"><button class="btn btn-outline btn-sm" onclick="addMilestone()">Add</button></div>';
}
async function updateTeamProgress(v){
  const p=projectById(currentProjectId);
  p.progress=Number(v);
  await saveCollection('scibridge_projects',DB.projects);
  renderTWPanel();
}
async function bumpMilestone(id){
  const m=wsData.milestones.find(function(x){return x.id===id});
  m.pct=Math.min(100,m.pct+25);
  renderTWPanel();
  await saveWorkspaceData(currentProjectId,wsData);
}
async function addMilestone(){
  const input=document.getElementById('milestoneInput');
  const val=input.value.trim();
  if(!val)return;
  wsData.milestones.push({id:uid('m'),name:val,pct:0});
  input.value='';
  renderTWPanel();
  await saveWorkspaceData(currentProjectId,wsData);
}

/* ---------- TAB: MEETING NOTES ---------- */
function renderTabNotes(p,d){
  const list=d.notes.map(function(n){return '<div class="card" style="padding:var(--s4);margin-bottom:var(--s3)"><div style="display:flex;justify-content:space-between;gap:var(--s3)"><h5 style="font-size:13.5px;font-weight:600">'+n.title+'</h5><span style="font-family:var(--font-mono);font-size:10px;color:var(--faint);flex:none">'+fmtDate(n.date)+'</span></div><p style="font-size:12.5px;color:var(--dim);margin-top:6px">'+n.body+'</p></div>'}).join('');
  return '<h4 class="ws-label">Meeting Notes</h4><div style="margin-bottom:var(--s5)"><input class="input" id="noteTitleInput" placeholder="Meeting title" style="margin-bottom:8px"><textarea class="textarea" id="noteBodyInput" placeholder="Notes / summary…" style="min-height:70px"></textarea><button class="btn btn-outline btn-sm" style="margin-top:8px" onclick="addMeetingNote()">Save Note</button></div>'+(list||'<div class="hint">No meeting notes yet.</div>');
}
async function addMeetingNote(){
  const title=document.getElementById('noteTitleInput').value.trim();
  const body=document.getElementById('noteBodyInput').value.trim();
  if(!title||!body){toast('Add a title and some notes','err');return}
  wsData.notes.unshift({title:title,body:body,date:new Date().toISOString().slice(0,10)});
  toast('Meeting note saved');
  renderTWPanel();
  await saveWorkspaceData(currentProjectId,wsData);
}

/* ---------- TAB: DISCUSSION ---------- */
function renderTabDiscussion(p,d){
  const list=d.threads.map(function(t){
    const replies=(t.replies||[]).map(function(r){return '<div style="padding:8px 0 8px 16px;border-left:2px solid var(--line);margin-top:8px"><div style="font-size:12px;font-weight:600">'+r.by+'</div><div style="font-size:12.5px;color:var(--dim)">'+r.content+'</div></div>'}).join('');
    return '<div class="card" style="padding:var(--s4);margin-bottom:var(--s3)"><div style="font-weight:600;font-size:13.5px">'+t.title+'</div><div style="font-family:var(--font-mono);font-size:10px;color:var(--faint);margin-top:4px;text-transform:uppercase;letter-spacing:.04em">Started by '+t.by+'</div>'+replies+'<div style="display:flex;gap:6px;margin-top:10px"><input class="input" style="font-size:12.5px;padding:8px 10px" id="reply-th-'+t.id+'" placeholder="Reply…"><button class="btn btn-ghost btn-sm" onclick="replyToThread(\''+t.id+'\')">Reply</button></div></div>';
  }).join('');
  return '<h4 class="ws-label">Discussion Board</h4><div style="display:flex;gap:8px;margin-bottom:var(--s5)"><input class="input" id="threadInput" placeholder="Start a discussion topic…"><button class="btn btn-outline btn-sm" onclick="addDiscussionThread()">Post</button></div>'+(list||'<div class="hint">No discussions yet.</div>');
}
async function addDiscussionThread(){
  const input=document.getElementById('threadInput');
  const val=input.value.trim();
  if(!val)return;
  wsData.threads.unshift({id:uid('th'),title:val,by:currentUser?currentUser.name:'You',replies:[]});
  input.value='';
  renderTWPanel();
  await saveWorkspaceData(currentProjectId,wsData);
}
async function replyToThread(id){
  const input=document.getElementById('reply-th-'+id);
  const val=input.value.trim();
  if(!val)return;
  const t=wsData.threads.find(function(x){return x.id===id});
  t.replies=t.replies||[];
  t.replies.push({by:currentUser?currentUser.name:'You',content:val});
  renderTWPanel();
  await saveWorkspaceData(currentProjectId,wsData);
}

/* ---------- TAB: CALENDAR ---------- */
function renderTabCalendar(p,d){
  return '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--s4)"><button class="icon-btn" onclick="calendarShift(-1)">'+ICONS.arrowLeft+'</button><h4 id="calMonthLabel" style="font-family:var(--font-mono);text-transform:uppercase;font-size:13px;letter-spacing:.05em"></h4><button class="icon-btn" onclick="calendarShift(1)">'+ICONS.arrow+'</button></div><div class="cal-grid" id="calGrid"></div><div class="hint" style="margin-top:var(--s4)">Marked days come from this project\'s calendar events.</div>';
}
function calendarShift(dir){
  calCursor.setMonth(calCursor.getMonth()+dir);
  renderCalendarGrid(projectById(currentProjectId),wsData);
}
function renderCalendarGrid(p,d){
  const label=document.getElementById('calMonthLabel');
  if(!label)return;
  label.textContent=calCursor.toLocaleDateString('en-US',{month:'long',year:'numeric'});
  const year=calCursor.getFullYear(),month=calCursor.getMonth();
  const firstDow=new Date(year,month,1).getDay();
  const daysInMonth=new Date(year,month+1,0).getDate();
  const eventDates={};
  (d.events||[]).forEach(function(e){eventDates[e.date]=true});
  const dows=['S','M','T','W','T','F','S'];
  let cells=dows.map(function(x){return '<div class="cal-dow">'+x+'</div>'}).join('');
  for(let i=0;i<firstDow;i++)cells+='<div class="cal-cell dim"></div>';
  for(let day=1;day<=daysInMonth;day++){
    const iso=year+'-'+String(month+1).padStart(2,'0')+'-'+String(day).padStart(2,'0');
    const hasEvent=!!eventDates[iso];
    cells+='<div class="cal-cell'+(hasEvent?' has-event':'')+'">'+day+(hasEvent?'<span class="ev-dot"></span>':'')+'</div>';
  }
  document.getElementById('calGrid').innerHTML=cells;
}

/* ---------- TAB: TIMELINE ---------- */
function renderTabTimeline(p,d){
  const items=d.milestones.map(function(m){return {date:null,label:m.name,sub:m.pct+'% complete'}}).concat((d.events||[]).map(function(e){return {date:e.date,label:e.title,sub:'Scheduled event'}}));
  const dated=items.filter(function(i){return i.date}).sort(function(a,b){return a.date.localeCompare(b.date)});
  const undated=items.filter(function(i){return !i.date});
  const ordered=dated.concat(undated);
  const html=ordered.map(function(i){return '<div class="tl-item"><div class="tl-date">'+(i.date?fmtDate(i.date):'Milestone')+'</div><h5>'+i.label+'</h5><p>'+i.sub+'</p></div>'}).join('');
  return '<h4 class="ws-label">Project Timeline</h4><div class="tl-track">'+(html||'<div class="hint">No timeline entries yet.</div>')+'</div>';
}

/* ---------- PAGE INIT ---------- */
async function initTeamWorkspacePage(qs){
  if(!requireLogin())return;
  const id=qs.get('id');
  const p=projectById(id);
  if(!p){toast('Team not found','err');setTimeout(()=>location.href='team-setup.html',600);return}
  currentProjectId=id;
  currentTab='chat';
  calCursor=new Date();
  wsData=await loadWorkspaceData(id);
  document.getElementById('twTitle').textContent=p.title;
  document.getElementById('twCatEyebrow').textContent=p.category;
  document.getElementById('twStatusBadge').textContent=p.status;
  document.getElementById('twStatusBadge').className='badge-status '+p.status;
  renderTWSidebar(p);
  renderTWTabs();
  renderTWPanel();
}
initPage('team-workspace', initTeamWorkspacePage);
