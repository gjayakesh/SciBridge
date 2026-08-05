/* ===== home.js ===== */
function renderHomeCatStrip(){
  document.getElementById('homeCatStrip').innerHTML=CATEGORIES.map(c=>
    `<span class="cat-pill" onclick="location.href='explore.html?category='+encodeURIComponent('${c.name}')"><span class="d" style="background:${c.color}"></span>${c.name}</span>`
  ).join('');
}
function renderHomeFeatured(){
  const featured=DB.projects.filter(p=>p.featured).slice(0,6);
  const list=featured.length?featured:DB.projects.slice(0,6);
  document.getElementById('homeFeaturedProjects').innerHTML=list.map(projectCardHTML).join('');
  requestAnimationFrame(()=>document.querySelectorAll('#homeFeaturedProjects .progress-fill').forEach(el=>el.style.width=el.style.width));
}
function renderHomeStories(){
  document.getElementById('homeStories').innerHTML=DB.stories.map(s=>`
    <div class="card story-card reveal">
      <div class="quote">"${s.quote}"</div>
      <div class="who"><div class="avatar" style="margin-left:0">${initials(s.name)}</div>${s.name} · ${s.role}</div>
    </div>`).join('');
}
function renderHomeEvents(){
  document.getElementById('homeEventsBody').innerHTML=DB.events.map(e=>`
    <div class="event-row">
      <div class="event-date">${e.date}</div>
      <div style="flex:1"><div class="event-title">${e.title}</div><div class="event-desc">${e.desc}</div></div>
    </div>`).join('');
}
function animateConsoleCounts(){
  const activeProjects=DB.projects.filter(p=>p.status==='published').length;
  const mentors=DB.users.filter(u=>u.role==='mentor'&&u.status==='active').length;
  const contributors=DB.users.length;
  const targets=[activeProjects,mentors,contributors,11];
  document.querySelectorAll('#consoleStats .value').forEach((el,i)=>{
    const target=targets[i];let cur=0;
    const step=Math.max(1,Math.ceil(target/24));
    const t=setInterval(()=>{cur=Math.min(target,cur+step);el.textContent=String(cur).padStart(2,'0');if(cur>=target)clearInterval(t)},30);
  });
}
function tickClock(){
  const el=document.getElementById('consoleClock');
  if(!el)return;
  const d=new Date();
  el.textContent=d.toUTCString().split(' ')[4]+' UTC';
}
function initHomePage(){
  document.getElementById('heroLede').textContent=DB.siteContent.heroLede;
  if(DB.siteContent.heroTitle && DB.siteContent.heroTitle!==SEED_SITE_CONTENT.heroTitle){
    document.getElementById('heroTitle').textContent=DB.siteContent.heroTitle;
  }
  renderHomeCatStrip();
  renderHomeFeatured();
  renderHomeStories();
  renderHomeEvents();
  animateConsoleCounts();
  tickClock();
  setInterval(tickClock,1000);
}
initPage('home', initHomePage);
