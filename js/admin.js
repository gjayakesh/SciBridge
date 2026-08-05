/* ===== admin.js ===== */
function escapeAttr(s){return (s||'').replace(/"/g,'&quot;')}

const ADMIN_TABS=[
  {key:'overview',label:'Overview',icon:'bolt'},
  {key:'users',label:'Users',icon:'users'},
  {key:'mentors',label:'Mentor Apps',icon:'award'},
  {key:'projects',label:'Projects',icon:'rocket'},
  {key:'content',label:'Site Content (CMS)',icon:'edit'},
  {key:'announcements',label:'Announcements',icon:'bell'},
];
let adminTab='overview';
function renderAdminTabs(){
  document.getElementById('adminTabs').innerHTML=ADMIN_TABS.map(function(t){return '<div class="tw-tab'+(adminTab===t.key?' active':'')+'" onclick="setAdminTab(\''+t.key+'\')">'+ICONS[t.icon]+'<span>'+t.label+'</span></div>'}).join('');
}
function setAdminTab(key){adminTab=key;renderAdminTabs();renderAdminPanel();}
function renderAdminPanel(){
  const fns={overview:renderAdminOverview,users:renderAdminUsers,mentors:renderAdminMentors,projects:renderAdminProjects,content:renderAdminContent,announcements:renderAdminAnnouncements};
  document.getElementById('adminPanelBody').innerHTML=fns[adminTab]();
  hydrateIcons(document.getElementById('adminPanelBody'));
  if(adminTab==='users')filterAdminUsersTable();
  if(adminTab==='content')renderAdminContentLists();
}

/* ---------- OVERVIEW ---------- */
function renderAdminOverview(){
  const stats=[
    {label:'Total Users',value:DB.users.length,color:'var(--telemetry)'},
    {label:'Total Projects',value:DB.projects.length,color:'var(--signal)'},
    {label:'Pending Mentor Apps',value:DB.mentorApps.filter(function(a){return a.status==='pending'}).length,color:'var(--warn)'},
    {label:'Open Doubts',value:DB.doubts.filter(function(d){return d.status==='open'}).length,color:'var(--go)'},
  ];
  return '<div class="admin-stat-grid">'+stats.map(function(s){return '<div class="console"><div class="console-head"><span>'+s.label.toUpperCase()+'</span><span class="dot" style="background:'+s.color+'"></span></div><div class="console-body" style="text-align:center;padding:var(--s6)"><div style="font-family:var(--font-mono);font-size:36px;font-weight:600;color:'+s.color+'">'+s.value+'</div></div></div>'}).join('')+'</div><div class="auth-demo-note" style="margin-top:var(--s6)">Every number here is computed live from the shared demo directory — try registering a new account or posting a doubt, then come back to this tab.</div>';
}

/* ---------- USERS ---------- */
function renderAdminUsers(){
  return '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--s4);flex-wrap:wrap;gap:var(--s3)">' +
    '<div style="display:flex;align-items:center;gap:var(--s3)">' +
      '<h4 class="ws-label" style="margin:0">All Registered Users ('+DB.users.length+')</h4>' +
      '<button class="btn btn-primary btn-sm" onclick="openAddUserModal()">+ Add User</button>' +
    '</div>' +
    '<input class="input" id="adminUserSearch" placeholder="Search users…" style="width:220px;font-size:12.5px;padding:8px 10px" oninput="filterAdminUsersTable()">' +
  '</div>' +
  '<div style="overflow-x:auto"><table class="admin-table"><thead><tr><th>Name</th><th>Email</th><th>Mobile</th><th>Country</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead><tbody id="adminUsersTbody"></tbody></table></div>' +
  '<div class="auth-demo-note" style="margin-top:var(--s5)">This table reads directly from SciBridge\'s shared user directory — every account created in this preview appears here, exactly as a real admin CMS would show it.</div>';
}
function filterAdminUsersTable(){
  const searchEl=document.getElementById('adminUserSearch');
  const q=(searchEl&&searchEl.value||'').toLowerCase();
  const filtered=DB.users.filter(function(u){return !q||u.name.toLowerCase().indexOf(q)>-1||u.email.toLowerCase().indexOf(q)>-1});
  document.getElementById('adminUsersTbody').innerHTML=filtered.map(function(u){
    return '<tr><td>'+u.name+'</td><td>'+u.email+'</td><td>'+(u.mobile||'—')+'</td><td>'+(u.country||'—')+'</td><td><span class="badge-status '+(u.role==='mentor'?'approved':'open')+'">'+u.role+'</span></td><td><span class="badge-status '+u.status+'">'+u.status+'</span></td><td style="white-space:nowrap"><button class="btn btn-ghost btn-sm" onclick="toggleUserStatus(\''+u.id+'\')">'+(u.status==='active'?'Suspend':'Activate')+'</button> <button class="btn btn-ghost btn-sm" onclick="openChangePasswordModal(\''+u.id+'\')">Password</button> <button class="btn btn-ghost btn-sm" style="color:var(--danger)" onclick="removeUser(\''+u.id+'\')">Remove</button></td></tr>';
  }).join('')||'<tr><td colspan="7" style="text-align:center;color:var(--faint);padding:var(--s6)">No users match.</td></tr>';
}
async function toggleUserStatus(id){
  const u=userById(id);
  u.status=u.status==='active'?'suspended':'active';
  await saveCollection('scibridge_users',DB.users);
  toast(u.name+' is now '+u.status);
  renderAdminPanel();
}
async function removeUser(id){
  DB.users=DB.users.filter(function(u){return u.id!==id});
  await saveCollection('scibridge_users',DB.users);
  toast('User removed');
  renderAdminPanel();
}

/* ---------- ADMIN MODALS ---------- */
function getOrCreateModalContainer() {
  let modalContainer = document.getElementById('admin-modal-container');
  if (!modalContainer) {
    modalContainer = document.createElement('div');
    modalContainer.id = 'admin-modal-container';
    modalContainer.className = 'modal-overlay';
    document.body.appendChild(modalContainer);
  }
  return modalContainer;
}

function closeModal() {
  const container = document.getElementById('admin-modal-container');
  if (container) {
    container.classList.remove('active');
    container.innerHTML = '';
  }
}

function openAddUserModal() {
  const container = getOrCreateModalContainer();
  container.innerHTML = `
    <div class="modal-card">
      <div class="modal-header">
        <h3>Create New User</h3>
        <button class="close-modal-btn" onclick="closeModal()">${ICONS.close}</button>
      </div>
      <form id="addUserForm" onsubmit="handleAddUserSubmit(event)">
        <div class="modal-body">
          <div class="field">
            <label>Full Name</label>
            <input class="input" id="newUserName" placeholder="Jane Doe" required>
          </div>
          <div class="field">
            <label>Email Address</label>
            <input class="input" type="email" id="newUserEmail" placeholder="jane@example.com" required>
          </div>
          <div class="grid-2">
            <div class="field">
              <label>Password</label>
              <input class="input" type="password" id="newUserPassword" placeholder="••••••••" required>
            </div>
            <div class="field">
              <label>Mobile</label>
              <input class="input" id="newUserMobile" placeholder="+1 555 0199">
            </div>
          </div>
          <div class="grid-2">
            <div class="field">
              <label>Role</label>
              <select class="select" id="newUserRole">
                <option value="student">Student</option>
                <option value="mentor">Mentor</option>
              </select>
            </div>
            <div class="field">
              <label>Country</label>
              <input class="input" id="newUserCountry" placeholder="United States">
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" type="button" onclick="closeModal()">Cancel</button>
          <button class="btn btn-primary" type="submit">Create User</button>
        </div>
      </form>
    </div>
  `;
  container.classList.add('active');
  hydrateIcons(container);
}

async function handleAddUserSubmit(e) {
  e.preventDefault();
  const email = document.getElementById('newUserEmail').value.trim();
  if (DB.users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    toast('A user with this email already exists', 'err');
    return;
  }
  const newUser = {
    id: uid('u'),
    name: document.getElementById('newUserName').value.trim(),
    email: email,
    mobile: document.getElementById('newUserMobile').value.trim(),
    password: document.getElementById('newUserPassword').value,
    country: document.getElementById('newUserCountry').value.trim(),
    role: document.getElementById('newUserRole').value,
    status: 'active',
    skills: [],
    interests: [],
    joinedAt: new Date().toISOString().slice(0, 10)
  };
  DB.users.push(newUser);
  await saveCollection('scibridge_users', DB.users);
  toast('User ' + newUser.name + ' created successfully');
  closeModal();
  renderAdminPanel();
}

function openChangePasswordModal(userId) {
  const user = userById(userId);
  if (!user) return;
  const container = getOrCreateModalContainer();
  container.innerHTML = `
    <div class="modal-card">
      <div class="modal-header">
        <h3>Change Password</h3>
        <button class="close-modal-btn" onclick="closeModal()">${ICONS.close}</button>
      </div>
      <form id="changePasswordForm" onsubmit="handleChangePasswordSubmit(event, '${userId}')">
        <div class="modal-body">
          <p style="font-size: 14px; margin-bottom: var(--s4); color: var(--dim)">
            Update password for <strong>${user.name}</strong> (${user.email}).
          </p>
          <div class="field">
            <label>New Password</label>
            <input class="input" type="password" id="changeUserPassword" placeholder="••••••••" required minlength="4">
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" type="button" onclick="closeModal()">Cancel</button>
          <button class="btn btn-primary" type="submit">Update Password</button>
        </div>
      </form>
    </div>
  `;
  container.classList.add('active');
  hydrateIcons(container);
}

async function handleChangePasswordSubmit(e, userId) {
  e.preventDefault();
  const user = userById(userId);
  if (!user) return;
  const newPw = document.getElementById('changeUserPassword').value;
  user.password = newPw;
  await saveCollection('scibridge_users', DB.users);
  toast('Password updated for ' + user.name);
  closeModal();
}

/* ---------- MENTOR APPLICATIONS ---------- */
function renderAdminMentors(){
  const rows=DB.mentorApps.map(function(a){
    return '<div class="card" style="padding:var(--s5);margin-bottom:var(--s3)"><div style="display:flex;justify-content:space-between;align-items:flex-start;gap:var(--s4);flex-wrap:wrap"><div><div style="font-weight:600">'+a.applicantName+'</div><div style="font-size:11.5px;color:var(--faint);font-family:var(--font-mono)">'+a.applicantEmail+' · '+a.yearsExperience+' yrs experience</div><div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap">'+a.expertise.map(function(e){return '<span class="tag">'+e+'</span>'}).join('')+'</div><p style="font-size:13px;color:var(--dim);margin-top:8px;max-width:60ch">'+a.bio+'</p></div><span class="badge-status '+a.status+'">'+a.status+'</span></div>'+(a.status==='pending'?'<div style="display:flex;gap:8px;margin-top:var(--s4)"><button class="btn btn-primary btn-sm" onclick="reviewMentorApp(\''+a.id+'\',\'approved\')">Approve</button><button class="btn btn-danger btn-sm" onclick="reviewMentorApp(\''+a.id+'\',\'rejected\')">Reject</button></div>':'')+'</div>';
  }).join('');
  return '<h4 class="ws-label">Mentor Applications ('+DB.mentorApps.length+')</h4>'+(rows||'<div class="hint">No applications yet.</div>');
}
async function reviewMentorApp(id,decision){
  const app=DB.mentorApps.find(function(a){return a.id===id});
  app.status=decision;
  if(decision==='approved'){
    const user=DB.users.find(function(u){return u.email===app.applicantEmail});
    if(user){user.role='mentor';user.mentorExpertise=app.expertise;user.mentorRating=5.0;}
    await saveCollection('scibridge_users',DB.users);
  }
  await saveCollection('scibridge_mentor_apps',DB.mentorApps);
  toast('Application '+decision);
  renderAdminPanel();
}

/* ---------- PROJECTS ---------- */
function renderAdminProjects(){
  const rows=DB.projects.map(function(p){
    return '<tr><td>'+p.title+'</td><td>'+p.category+'</td><td>'+p.type+'</td><td><span class="badge-status '+p.status+'">'+p.status+'</span></td><td>'+p.progress+'%</td><td>'+(p.featured?'★':'—')+'</td><td style="white-space:nowrap"><button class="btn btn-ghost btn-sm" onclick="toggleFeatured(\''+p.id+'\')">'+(p.featured?'Unfeature':'Feature')+'</button> <button class="btn btn-ghost btn-sm" style="color:var(--danger)" onclick="removeProject(\''+p.id+'\')">Remove</button></td></tr>';
  }).join('');
  return '<h4 class="ws-label">All Projects ('+DB.projects.length+')</h4><div style="overflow-x:auto"><table class="admin-table"><thead><tr><th>Title</th><th>Category</th><th>Type</th><th>Status</th><th>Progress</th><th>Featured</th><th>Actions</th></tr></thead><tbody>'+(rows||'<tr><td colspan="7" style="text-align:center;color:var(--faint);padding:var(--s6)">No projects yet.</td></tr>')+'</tbody></table></div>';
}
async function toggleFeatured(id){
  const p=projectById(id);
  p.featured=!p.featured;
  await saveCollection('scibridge_projects',DB.projects);
  toast(p.featured?'Featured on homepage':'Removed from homepage feature');
  renderAdminPanel();
}
async function removeProject(id){
  DB.projects=DB.projects.filter(function(p){return p.id!==id});
  await saveCollection('scibridge_projects',DB.projects);
  toast('Project removed');
  renderAdminPanel();
}

/* ---------- SITE CONTENT (CMS) ---------- */
function renderAdminContent(){
  return '<h4 class="ws-label">Homepage Content</h4>'+
  '<div class="field"><label>Hero Title</label><input class="input" id="cmsHeroTitle" value="'+escapeAttr(DB.siteContent.heroTitle)+'"></div>'+
  '<div class="field"><label>Hero Subtitle</label><textarea class="textarea" id="cmsHeroLede">'+DB.siteContent.heroLede+'</textarea></div>'+
  '<div class="field"><label>Logo Text</label><input class="input" id="cmsLogoText" value="'+escapeAttr(DB.siteContent.logoText)+'"></div>'+
  '<button class="btn btn-primary" onclick="saveSiteContent()">Save &amp; Publish to Homepage</button>'+
  '<hr style="border:none;border-top:1px solid var(--line);margin:var(--s7) 0">'+
  '<div class="cms-grid">'+
    '<div><h4 class="ws-label">Success Stories</h4><div id="cmsStoriesList"></div><div style="display:flex;gap:6px;margin-top:var(--s3)"><input class="input" id="cmsStoryName" placeholder="Name" style="font-size:12px"><input class="input" id="cmsStoryQuote" placeholder="Quote" style="font-size:12px"></div><button class="btn btn-outline btn-sm btn-block" style="margin-top:8px" onclick="addStory()">+ Add Story</button></div>'+
    '<div><h4 class="ws-label">Upcoming Events</h4><div id="cmsEventsList"></div><div style="display:flex;gap:6px;margin-top:var(--s3)"><input class="input" id="cmsEventDate" placeholder="Date" style="font-size:12px"><input class="input" id="cmsEventTitle" placeholder="Title" style="font-size:12px"></div><button class="btn btn-outline btn-sm btn-block" style="margin-top:8px" onclick="addEvent()">+ Add Event</button></div>'+
  '</div>'+
  '<div class="auth-demo-note" style="margin-top:var(--s6)">Changes here save to SciBridge\'s shared content store and appear on the homepage for everyone viewing this preview immediately.</div>';
}
function renderAdminContentLists(){
  document.getElementById('cmsStoriesList').innerHTML=DB.stories.map(function(s,i){return '<div class="mini-proj"><div style="flex:1;min-width:0"><div style="font-weight:600;font-size:12.5px">'+s.name+'</div><div style="font-size:11.5px;color:var(--dim);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">"'+s.quote+'"</div></div><span style="cursor:pointer;color:var(--faint);flex:none" onclick="removeStory('+i+')">'+ICONS.trash+'</span></div>';}).join('')||'<div class="hint">No stories yet.</div>';
  document.getElementById('cmsEventsList').innerHTML=DB.events.map(function(e,i){return '<div class="mini-proj"><div style="flex:1"><div style="font-weight:600;font-size:12.5px">'+e.title+'</div><div style="font-size:11px;color:var(--faint);font-family:var(--font-mono)">'+e.date+'</div></div><span style="cursor:pointer;color:var(--faint);flex:none" onclick="removeEvent('+i+')">'+ICONS.trash+'</span></div>';}).join('')||'<div class="hint">No events yet.</div>';
  hydrateIcons(document.getElementById('cmsStoriesList'));
  hydrateIcons(document.getElementById('cmsEventsList'));
}
async function saveSiteContent(){
  DB.siteContent.heroTitle=document.getElementById('cmsHeroTitle').value.trim();
  DB.siteContent.heroLede=document.getElementById('cmsHeroLede').value.trim();
  DB.siteContent.logoText=document.getElementById('cmsLogoText').value.trim()||'SciBridge';
  await saveObject('scibridge_site_content',DB.siteContent);
  toast('Homepage content published');
}
async function addStory(){
  const name=document.getElementById('cmsStoryName').value.trim();
  const quote=document.getElementById('cmsStoryQuote').value.trim();
  if(!name||!quote){toast('Add a name and quote','err');return}
  DB.stories.unshift({name:name,role:'SciBridge Contributor',quote:quote});
  await saveCollection('scibridge_stories',DB.stories);
  document.getElementById('cmsStoryName').value='';document.getElementById('cmsStoryQuote').value='';
  renderAdminContentLists();
  toast('Story added to homepage');
}
async function removeStory(i){
  DB.stories.splice(i,1);
  await saveCollection('scibridge_stories',DB.stories);
  renderAdminContentLists();
}
async function addEvent(){
  const date=document.getElementById('cmsEventDate').value.trim();
  const title=document.getElementById('cmsEventTitle').value.trim();
  if(!date||!title){toast('Add a date and title','err');return}
  DB.events.push({date:date,title:title,desc:'Added via admin CMS'});
  await saveCollection('scibridge_events',DB.events);
  document.getElementById('cmsEventDate').value='';document.getElementById('cmsEventTitle').value='';
  renderAdminContentLists();
  toast('Event added to homepage');
}
async function removeEvent(i){
  DB.events.splice(i,1);
  await saveCollection('scibridge_events',DB.events);
  renderAdminContentLists();
}

/* ---------- ANNOUNCEMENTS ---------- */
function renderAdminAnnouncements(){
  const list=DB.announcements.map(function(a){return '<div class="card" style="padding:var(--s4);margin-bottom:var(--s3);display:flex;justify-content:space-between;gap:var(--s4)"><div><div style="font-weight:600;font-size:13.5px">'+a.title+'</div><p style="font-size:12.5px;color:var(--dim);margin-top:4px">'+a.content+'</p><div style="font-family:var(--font-mono);font-size:10px;color:var(--faint);margin-top:6px">'+fmtDate(a.createdAt)+'</div></div><span style="cursor:pointer;color:var(--faint);flex:none" onclick="removeAnnouncement(\''+a.id+'\')">'+ICONS.trash+'</span></div>';}).join('');
  return '<h4 class="ws-label">Post an Announcement</h4><div class="field"><input class="input" id="annTitle" placeholder="Title"></div><div class="field"><textarea class="textarea" id="annBody" placeholder="Message…" style="min-height:80px"></textarea></div><button class="btn btn-primary" onclick="addAnnouncement()">Post to Dashboard</button><hr style="border:none;border-top:1px solid var(--line);margin:var(--s6) 0"><h4 class="ws-label">Live Announcements</h4>'+(list||'<div class="hint">None yet.</div>');
}
async function addAnnouncement(){
  const title=document.getElementById('annTitle').value.trim();
  const content=document.getElementById('annBody').value.trim();
  if(!title||!content){toast('Add a title and message','err');return}
  DB.announcements.unshift({id:uid('a'),title:title,content:content,createdAt:new Date().toISOString().slice(0,10)});
  await saveCollection('scibridge_announcements',DB.announcements);
  toast('Announcement posted');
  renderAdminPanel();
}
async function removeAnnouncement(id){
  DB.announcements=DB.announcements.filter(function(a){return a.id!==id});
  await saveCollection('scibridge_announcements',DB.announcements);
  renderAdminPanel();
}

/* ---------- PAGE INIT ---------- */
async function adminLogout(){
  isAdminSession=false;
  await saveSession();
  toast('Logged out of admin console');
  location.href='index.html';
}
function initAdminPage(){
  if(!requireAdminSession())return;
  renderAdminTabs();
  renderAdminPanel();
}
initPage('admin', initAdminPage);
