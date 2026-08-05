/* ============================================================================
   SciBridge — shared.js
   Loaded on every page (before the page's own script). Provides icons, seed
   data, storage helpers, session handling, shared nav/footer, and utilities.
   Same tech stack as the single-file version: plain JS + the artifact
   storage API (window.storage) as the "database" layer — just split across
   real pages now instead of one SPA file.
   ============================================================================ */

const ICONS = {
  rocket:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 2c2.8 2 4.5 5.6 4.5 9.5 0 2-.5 3.8-1.3 5.3l-3.2 3.2-3.2-3.2C7.99 15.3 7.5 13.5 7.5 11.5 7.5 7.6 9.2 4 12 2z"/><circle cx="12" cy="10.5" r="1.7"/><path d="M8.5 15.5 5 17l1-3.7M15.5 15.5 19 17l-1-3.7M9.5 20l1.3-2.3h2.4L14.5 20"/></svg>',
  satellite:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="9" y="9" width="6" height="6" rx="1"/><path d="M4 6 7 9M20 6l-3 3M4 18l3-3M20 18l-3-3M2 4l3 3M19 4l3 3M2 20l3-3M19 20l3-3"/></svg>',
  habitat:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 12a8 8 0 0 1 16 0"/><path d="M4 12v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6"/><path d="M9 20v-5h6v5"/></svg>',
  mars:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="10.5" cy="13.5" r="6.5"/><path d="M15.5 8.5 20 4M20 4h-4.5M20 4v4.5"/></svg>',
  moon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z"/></svg>',
  astronomy:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="9" ry="3.5"/></svg>',
  ai:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="6" y="6" width="12" height="12" rx="2"/><circle cx="9.5" cy="9.5" r="1"/><circle cx="14.5" cy="9.5" r="1"/><path d="M9 15h6M12 2v4M12 18v4M2 12h4M18 12h4"/></svg>',
  robot:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="5" y="9" width="14" height="10" rx="2"/><circle cx="9.5" cy="14" r="1"/><circle cx="14.5" cy="14" r="1"/><path d="M12 9V5M9 5h6"/><path d="M2 13v2M22 13v2"/></svg>',
  electronics:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="8" y="8" width="8" height="8" rx="1"/><path d="M8 4v4M16 4v4M8 16v4M16 16v4M4 8h4M4 16h4M16 8h4M16 16h4"/></svg>',
  energy:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z"/></svg>',
  medicine:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 2v6M9 5h6"/><path d="M5 9h14l-1.2 10a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8L5 9z"/><path d="M9.5 13h5M12 10.5v5"/></svg>',
  users:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="9" cy="8" r="3.2"/><path d="M2.5 20c.6-3.6 3.2-6 6.5-6s5.9 2.4 6.5 6"/><circle cx="17.5" cy="9" r="2.6"/><path d="M15.5 12.2c2.6.3 4.6 2.3 5 5.3"/></svg>',
  chat:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 5h16v11H8l-4 4V5z"/></svg>',
  file:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M6 2h9l5 5v15H6V2z"/><path d="M15 2v5h5"/></svg>',
  tasks:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M8 10l2 2 4-4M8 16h8"/></svg>',
  calendar:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
  timeline:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 6h16M4 12h16M4 18h16"/><circle cx="8" cy="6" r="1.6" fill="currentColor" stroke="none"/><circle cx="15" cy="12" r="1.6" fill="currentColor" stroke="none"/><circle cx="10" cy="18" r="1.6" fill="currentColor" stroke="none"/></svg>',
  discuss:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M21 12a7 7 0 0 1-7 7H8l-5 3 1.2-4.4A7 7 0 1 1 21 12z"/></svg>',
  notes:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M6 2h9l5 5v15H6V2z"/><path d="M9 12h6M9 16h6M9 8h2"/></svg>',
  bell:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M6 9a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 13 6 9z"/><path d="M10 19a2 2 0 0 0 4 0"/></svg>',
  search:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>',
  bolt:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z"/></svg>',
  shield:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 2 4 5v6c0 5 3.4 8.6 8 11 4.6-2.4 8-6 8-11V5l-8-3z"/></svg>',
  upload:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 16V4M7 9l5-5 5 5M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/></svg>',
  plus:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 5v14M5 12h14"/></svg>',
  arrow:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  close:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 13l4 4L19 7"/></svg>',
  star:'<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2l3 6.5 7 .9-5.2 4.9 1.4 7-6.2-3.5-6.2 3.5 1.4-7L2 9.4l7-.9z"/></svg>',
  trash:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg>',
  edit:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>',
  award:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="8" r="5.5"/><path d="M8.5 13 7 21l5-2.5L17 21l-1.5-8"/></svg>',
  mentor:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="7" r="3.5"/><path d="M4.5 20c1-4 3.8-6.5 7.5-6.5S18.5 16 19.5 20"/><path d="M2 9l3-2 3 2M16 9l3-2 3 2"/></svg>',
  book:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v17H6.5A2.5 2.5 0 0 0 4 21.5v-17z"/><path d="M4 19a2.5 2.5 0 0 1 2.5-2.5H20"/></svg>',
  arrowLeft:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M19 12H5M11 18l-6-6 6-6"/></svg>',
  mail:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
};
function icon(name,cls){return `<span class="ic ${cls||''}" style="display:inline-flex">${ICONS[name]||''}</span>`}

/* ============================= CATEGORY MAP ============================= */
const CATEGORIES = [
  {name:'Rockets',icon:'rocket',color:'#FF8C42'},
  {name:'Satellites',icon:'satellite',color:'#5FD4E3'},
  {name:'Space Habitats',icon:'habitat',color:'#B7A6E8'},
  {name:'Mars Missions',icon:'mars',color:'#E8846F'},
  {name:'Moon Missions',icon:'moon',color:'#C9CDD8'},
  {name:'Astronomy',icon:'astronomy',color:'#6FDD8B'},
  {name:'AI',icon:'ai',color:'#5FD4E3'},
  {name:'Robotics',icon:'robot',color:'#F2C14E'},
  {name:'Electronics',icon:'electronics',color:'#FF8C42'},
  {name:'Renewable Energy',icon:'energy',color:'#6FDD8B'},
  {name:'Space Medicine',icon:'medicine',color:'#FF8A9E'},
];
function catInfo(name){return CATEGORIES.find(c=>c.name===name)||CATEGORIES[0]}

/* ============================= SEED DATA ============================= */
const SEED_USERS=[
 {id:'u1',name:'Ava Thornton',email:'ava.thornton@example.com',mobile:'+1 415 555 0148',password:'',country:'United States',state:'California',education:"Bachelor's Degree",institution:'UC San Diego',field:'Aerospace Engineering',skills:['CAD','Structural Analysis','Python'],interests:['Rockets','Mars Missions'],role:'student',status:'active',resumeFileName:'ava_thornton_resume.pdf',certFileNames:['aerospace_cert.pdf'],bio:'Third-year aerospace student focused on propulsion systems.',joinedAt:'2026-02-11'},
 {id:'u2',name:'Rohan Mehta',email:'rohan.mehta@example.com',mobile:'+91 98765 43210',password:'',country:'India',state:'Telangana',education:"Master's Degree",institution:'IIT Hyderabad',field:'Robotics',skills:['ROS','Embedded C','Machine Learning'],interests:['Robotics','AI'],role:'mentor',status:'active',resumeFileName:'rohan_mehta_cv.pdf',certFileNames:['robotics_msc.pdf'],bio:'Robotics researcher, 6 years in autonomous systems. Here to guide, not to own your project.',mentorRating:4.8,mentorExpertise:['Robotics','Electronics','Programming'],joinedAt:'2025-11-03'},
 {id:'u3',name:'Naledi Dube',email:'naledi.dube@example.com',mobile:'+27 71 555 0192',password:'',country:'South Africa',state:'Gauteng',education:'PhD Candidate',institution:'University of the Witwatersrand',field:'Astrophysics',skills:['Data Analysis','Python','Telescope Operations'],interests:['Astronomy','AI'],role:'student',status:'active',resumeFileName:'naledi_dube_resume.pdf',certFileNames:[],bio:'PhD candidate studying transient sky surveys.',joinedAt:'2026-04-22'},
];
const SEED_PROJECTS=[
 {id:'p1',title:'Athena-1 CubeSat',category:'Satellites',type:'team',description:'A 1U CubeSat designed to monitor atmospheric methane concentrations from low Earth orbit, built by a five-person student team.',skills:['RF Systems','Embedded C','Orbital Mechanics'],ownerId:'u1',mentorId:'u2',members:['u1','u3'],progress:62,status:'published',featured:true,createdAt:'2026-01-15'},
 {id:'p2',title:'Percival Rover Chassis',category:'Mars Missions',type:'team',description:'An open-source, low-cost rover chassis built and tested for rough Martian-analog terrain.',skills:['Mechanical Design','Robotics','Motor Control'],ownerId:'u2',mentorId:null,members:['u2'],progress:40,status:'published',featured:true,createdAt:'2026-03-02'},
 {id:'p3',title:'Helios Lunar Habitat Module',category:'Space Habitats',type:'team',description:'A 3D-printable lunar-regolith habitat module concept designed for sustained crew presence.',skills:['Structural Engineering','Materials Science','CAD'],ownerId:'u3',mentorId:'u2',members:['u3','u1'],progress:25,status:'published',featured:true,createdAt:'2026-05-19'},
 {id:'p4',title:'OrbitWatch AI',category:'AI',type:'individual',description:'A machine-learning pipeline for automated near-Earth object detection from ground telescope data.',skills:['Machine Learning','Python','Astronomy'],ownerId:'u3',mentorId:'u2',members:['u3'],progress:80,status:'published',featured:true,createdAt:'2025-12-08'},
 {id:'p5',title:'Aether Hybrid Rocket Engine',category:'Rockets',type:'team',description:'A student-led hybrid rocket engine project targeting a 10km amateur altitude record.',skills:['Propulsion','Fluid Dynamics','Safety Testing'],ownerId:'u1',mentorId:null,members:['u1','u2'],progress:55,status:'published',featured:false,createdAt:'2026-06-01'},
 {id:'p6',title:'VitaOrbit',category:'Space Medicine',type:'individual',description:'Research into countermeasures for bone-density loss during long-duration spaceflight.',skills:['Biomedical Research','Data Analysis'],ownerId:'u3',mentorId:null,members:['u3'],progress:15,status:'draft',featured:false,createdAt:'2026-07-10'},
];
const SEED_STORIES=[
 {name:'Team Athena',role:'CubeSat Team · 5 members',quote:'We started as three strangers on SciBridge. Eighteen months later our CubeSat design was shortlisted by a university nanosatellite programme.'},
 {name:'Priya Nair',role:'Individual builder · Aether Propulsion',quote:'I could not find anyone in my city studying propulsion. My SciBridge mentor, a former propulsion engineer, walked me through my first working motor test.'},
];
const SEED_EVENTS=[
 {date:'Sept 30, 2026',title:'Global CubeSat Design Challenge',desc:'Team registration closes — open to all skill levels.'},
 {date:'Every Friday',title:'Mentor Office Hours',desc:'Live Q&A with verified SciBridge mentors across every category.'},
 {date:'Oct 2026',title:'Mars Rover Design Sprint',desc:'Team formation opens for a two-week rapid design sprint.'},
];
const SEED_DOUBTS=[
 {id:'d1',subject:'Physics',question:'Why does specific impulse matter more than raw thrust when comparing rocket engine designs?',authorId:'u1',authorName:'Ava Thornton',status:'answered',createdAt:'2026-06-12',replies:[{authorName:'Rohan Mehta',role:'mentor',content:'Thrust tells you the push right now. Specific impulse tells you how efficiently you convert propellant into that push over time — it is the number that actually determines how much delta-v you get out of a given tank of fuel.',createdAt:'2026-06-12'}]},
 {id:'d2',subject:'Programming',question:'Best way to structure a Kalman filter for CubeSat attitude estimation on a resource-constrained MCU?',authorId:'u3',authorName:'Naledi Dube',status:'answered',createdAt:'2026-06-20',replies:[{authorName:'Rohan Mehta',role:'mentor',content:'Start with a fixed-point complementary filter before you reach for a full EKF — it is far cheaper on an MCU and is usually good enough for coarse attitude estimation.',createdAt:'2026-06-21'}]},
 {id:'d3',subject:'Electronics',question:'Which MCU family is realistic for a student CubeSat power budget under 2W average draw?',authorId:'u1',authorName:'Ava Thornton',status:'open',createdAt:'2026-07-24',replies:[]},
];
const SEED_MENTOR_APPS=[
 {id:'m1',applicantName:'Diego Fernandez',applicantEmail:'diego.fernandez@example.com',expertise:['Electronics','Programming'],yearsExperience:5,bio:'Embedded systems engineer working on flight computers for small-sat missions.',credentialFileName:'diego_fernandez_credentials.pdf',status:'pending',createdAt:'2026-07-18'},
];
const SEED_ANNOUNCEMENTS=[
 {id:'a1',title:'Welcome to SciBridge',content:'SciBridge is live. Explore projects, ask your first doubt, or start building today.',createdAt:'2026-07-01'},
];
const SEED_SITE_CONTENT={
  heroTitle:'BUILD THE THING THAT GETS US OFF-WORLD.',
  heroLede:'SciBridge connects students, engineers, scientists and mentors to design, build and launch real space projects — together, from wherever they are.',
  logoText:'SciBridge',
};

/* ============================= STORAGE HELPERS ============================= */
const STORAGE = window.storage || {
  async get(key, shared){
    try{
      const store = shared ? window.localStorage : window.sessionStorage;
      const value = store.getItem(key);
      return value === null ? {value:null} : {value:value};
    }catch(e){
      return {value:null};
    }
  },
  async set(key, value, shared){
    try{
      const store = shared ? window.localStorage : window.sessionStorage;
      store.setItem(key, value);
      return true;
    }catch(e){
      console.error('fallback storage save failed', key, e);
      return false;
    }
  }
};

async function loadCollection(key,seed){
  try{
    const res=await STORAGE.get(key,true);
    if(res&&res.value)return JSON.parse(res.value);
    throw new Error('empty');
  }catch(e){
    try{await STORAGE.set(key,JSON.stringify(seed),true);}catch(e2){}
    return JSON.parse(JSON.stringify(seed));
  }
}
async function saveCollection(key,data){
  try{await STORAGE.set(key,JSON.stringify(data),true);return true;}
  catch(e){console.error('storage save failed',key,e);return false;}
}
async function loadObject(key,seed){
  try{
    const res=await STORAGE.get(key,true);
    if(res&&res.value)return JSON.parse(res.value);
    throw new Error('empty');
  }catch(e){
    try{await STORAGE.set(key,JSON.stringify(seed),true);}catch(e2){}
    return JSON.parse(JSON.stringify(seed));
  }
}
async function saveObject(key,data){
  try{await STORAGE.set(key,JSON.stringify(data),true);return true;}
  catch(e){console.error('storage save failed',key,e);return false;}
}

/* ============================= UTIL ============================= */
function uid(prefix){return prefix+'_'+Date.now().toString(36)+Math.random().toString(36).slice(2,7)}
function initials(name){return (name||'?').split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase()}
function fmtDate(d){try{return new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}catch(e){return d}}
function toast(msg,type){
  const c=document.getElementById('toast-container');
  const el=document.createElement('div');
  el.className='toast'+(type==='err'?' err':'');
  el.innerHTML=`${icon(type==='err'?'close':'check')}<span>${msg}</span>`;
  c.appendChild(el);
  setTimeout(()=>{el.style.opacity='0';el.style.transform='translateX(40px)';el.style.transition='.3s';setTimeout(()=>el.remove(),300)},3400);
}
function userById(id){return DB.users.find(u=>u.id===id)}
function projectById(id){return DB.projects.find(p=>p.id===id)}

function hydrateIcons(root){
  (root||document).querySelectorAll('[data-icon]').forEach(el=>{
    const name=el.getAttribute('data-icon');
    if(ICONS[name]){el.innerHTML=ICONS[name];}
  });
}
/* ============================= REVEAL ON SCROLL ============================= */
let revealObserver;
function setupReveals(){
  if(typeof IntersectionObserver==='undefined'){
    document.querySelectorAll('.page .reveal:not(.in)').forEach(el=>el.classList.add('in'));
    return;
  }
  if(!revealObserver){
    revealObserver=new IntersectionObserver((entries)=>{
      entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');revealObserver.unobserve(e.target)}});
    },{threshold:.12});
  }
  document.querySelectorAll('.page .reveal:not(.in)').forEach(el=>revealObserver.observe(el));
}

/* ============================= STARFIELD CANVAS ============================= */
function initStarfield(){
  const canvas=document.getElementById('stars-canvas');
  const ctx=canvas.getContext('2d');
  let w,h,stars=[];
  function resize(){
    w=canvas.width=window.innerWidth;
    h=canvas.height=Math.max(window.innerHeight,document.body.scrollHeight);
    const count=Math.floor((w*h)/9000);
    stars=Array.from({length:Math.min(count,220)},()=>({
      x:Math.random()*w,y:Math.random()*h,r:Math.random()*1.3+.3,
      tw:Math.random()*Math.PI*2,speed:Math.random()*.015+.005,
    }));
  }
  let raf;
  const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function frame(t){
    ctx.clearRect(0,0,w,h);
    stars.forEach(s=>{
      const o=reduceMotion?0.5:(Math.sin(t*s.speed+s.tw)*.35+.55);
      ctx.beginPath();
      ctx.fillStyle=`rgba(236,238,244,${o*0.7})`;
      ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
      ctx.fill();
    });
    raf=requestAnimationFrame(frame);
  }
  resize();
  window.addEventListener('resize',resize);
  raf=requestAnimationFrame(frame);
}


/* ============================= CARD RENDER HELPERS (shared across pages) ============================= */
async function requestJoinTeam(id){
  if(!currentUser){toast('Log in to request to join','err');location.href='login.html';return}
  const p=projectById(id);
  if(!p)return;
  p.joinRequests=p.joinRequests||[];
  if(p.ownerId===currentUser.id||(p.members||[]).indexOf(currentUser.id)>-1){toast("You're already on this team",'err');return}
  if(p.joinRequests.some(function(r){return r.userId===currentUser.id&&r.status==='pending'})){toast('Request already sent — waiting on the team lead','err');return}
  p.joinRequests.push({id:uid('jr'),userId:currentUser.id,userName:currentUser.name,status:'pending',createdAt:new Date().toISOString().slice(0,10)});
  await saveCollection('scibridge_projects',DB.projects);
  toast('Request to join sent to the team lead');
  if(typeof renderOpenTeams==='function')renderOpenTeams();
  if(typeof renderProjectDetail==='function')renderProjectDetail(p);
}
function populateCategorySelect(id){
  document.getElementById(id).innerHTML=CATEGORIES.map(c=>'<option value="'+c.name+'">'+c.name+'</option>').join('');
}
function projectCardHTML(p){
  const owner=userById(p.ownerId);
  const cat=catInfo(p.category);
  const members=[owner,...(p.members||[]).map(userById)].filter(Boolean).filter((v,i,a)=>a.findIndex(x=>x.id===v.id)===i);
  return `<div class="card card-hover proj-card reveal" onclick="location.href='project-detail.html?id=${p.id}'">
    <div class="proj-thumb" style="--tint:${cat.color}22">${icon(cat.icon)}</div>
    <div class="cat"><span class="d" style="background:${cat.color}"></span>${p.category}</div>
    <h3>${p.title}</h3>
    <p>${p.description}</p>
    <div class="progress-bar"><div class="progress-fill" style="width:${p.progress}%"></div></div>
    <div class="proj-meta">
      <div class="avatars">${members.slice(0,3).map(m=>`<div class="avatar">${initials(m.name)}</div>`).join('')}</div>
      <span>${p.progress}% COMPLETE</span>
    </div>
  </div>`;
}
function renderMediaPlaceholders(count,iconName){
  let html='';
  for(let i=0;i<count;i++)html+='<div class="pd-media-item">'+ICONS[iconName]+'</div>';
  return html;
}

/* ============================================================================
   GLOBAL "DATABASE" + SESSION STATE
   DB.*      -> the shared collections (window.storage, shared:true) — same
               data every visitor of this artifact sees, exactly like before.
   currentUser / isAdminSession -> THIS visitor's session (window.storage,
               shared:false / "personal"), so it survives navigating between
               real pages without using localStorage/sessionStorage/cookies.
   ============================================================================ */
const DB={users:[],projects:[],doubts:[],mentorApps:[],stories:[],events:[],announcements:[],siteContent:{}};
let currentUser=null;
let isAdminSession=false;

async function loadDB(){
  const results=await Promise.all([
    loadCollection('scibridge_users',SEED_USERS),
    loadCollection('scibridge_projects',SEED_PROJECTS),
    loadCollection('scibridge_doubts',SEED_DOUBTS),
    loadCollection('scibridge_mentor_apps',SEED_MENTOR_APPS),
    loadCollection('scibridge_stories',SEED_STORIES),
    loadCollection('scibridge_events',SEED_EVENTS),
    loadCollection('scibridge_announcements',SEED_ANNOUNCEMENTS),
    loadObject('scibridge_site_content',SEED_SITE_CONTENT),
  ]);
  DB.users=results[0];DB.projects=results[1];DB.doubts=results[2];DB.mentorApps=results[3];
  DB.stories=results[4];DB.events=results[5];DB.announcements=results[6];DB.siteContent=results[7];
}

async function loadSession(){
  try{
    const res=await STORAGE.get('scibridge_session',false); // personal — not shared with other visitors
    if(!res||!res.value)throw new Error('no session');
    const s=JSON.parse(res.value);
    currentUser=(s&&s.userId)?(DB.users.find(u=>u.id===s.userId)||null):null;
    isAdminSession=!!(s&&s.isAdmin);
  }catch(e){
    currentUser=null;isAdminSession=false;
  }
}
async function saveSession(){
  try{
    await STORAGE.set('scibridge_session',JSON.stringify({userId:currentUser?currentUser.id:null,isAdmin:isAdminSession}),false);
  }catch(e){
    console.error('session save failed',e);
  }
}
async function logoutSession(){
  currentUser=null;isAdminSession=false;
  await saveSession();
}
function requireLogin(){
  if(!currentUser){toast('Log in to access that','err');setTimeout(()=>location.href='login.html',600);return false}
  return true;
}
function requireAdminSession(){
  if(!isAdminSession){location.href='admin-login.html';return false}
  return true;
}

/* ============================================================================
   TEAM WORKSPACE DATA — persisted per-project (shared storage), so unlike a
   single-page app, chat/tasks/notes/etc survive leaving and returning to a
   project's page.
   ============================================================================ */
function seedWorkspaceData(pid){
  const isSeedProject=SEED_PROJECTS.some(p=>p.id===pid);
  if(!isSeedProject)return {chat:[],files:[],tasks:[],milestones:[],notes:[],threads:[],events:[]};
  return {
    chat:[
      {authorId:'u2',authorName:'Rohan Mehta',content:'Pushed the updated power budget spreadsheet — can someone sanity check the solar panel numbers?',time:'10:14 AM'},
      {authorId:'u1',authorName:'Ava Thornton',content:'On it — will review after the structures review this afternoon.',time:'10:20 AM'},
    ],
    files:[
      {name:'power_budget_v3.xlsx',by:'Rohan Mehta',kind:'document',date:'2026-07-20'},
      {name:'structure_cad_rev2.step',by:'Ava Thornton',kind:'design',date:'2026-07-18'},
    ],
    tasks:[
      {id:uid('t'),text:'Finalize power budget spreadsheet',status:'in_progress'},
      {id:uid('t'),text:'Order flight-spare solar cells',status:'todo'},
      {id:uid('t'),text:'Draft structural test plan',status:'done'},
    ],
    milestones:[
      {id:uid('m'),name:'Preliminary Design Review',pct:100},
      {id:uid('m'),name:'Critical Design Review',pct:55},
      {id:uid('m'),name:'Environmental Testing',pct:10},
    ],
    notes:[{title:'Weekly Sync — Week 12',body:'Reviewed power budget, agreed on a solar panel vendor shortlist. Action: Ava to finalize CAD by Friday.',date:'2026-07-19'}],
    threads:[{id:uid('th'),title:'Which comms protocol — LoRa or UHF AX.25?',by:'Ava Thornton',replies:[{by:'Rohan Mehta',content:'AX.25 has better ground-station tooling support for a first mission — I would start there.'}]}],
    events:[{date:'2026-08-14',title:'Critical Design Review'},{date:'2026-08-22',title:'Team sync call'}],
  };
}
async function loadWorkspaceData(pid){
  return await loadObject('scibridge_workspace_'+pid,seedWorkspaceData(pid));
}
async function saveWorkspaceData(pid,data){
  return await saveObject('scibridge_workspace_'+pid,data);
}

/* ============================================================================
   CHROME — nav + footer, injected into every page's #navbar / #site-footer
   ============================================================================ */
function renderChrome(activePage){
  const logoText=(DB.siteContent&&DB.siteContent.logoText)||'SciBridge';
  const logoHTML=logoText.toLowerCase()==='scibridge'?'Sci<b>Bridge</b>':logoText;
  const nav=document.getElementById('navbar');
  if(nav){
    nav.innerHTML=`
    <div class="wrap">
      <a class="brand" href="index.html" style="text-decoration:none">
        <svg class="brand-mark" viewBox="0 0 40 40" fill="none">
          <circle cx="20" cy="20" r="3.4" fill="#FF8C42"/>
          <ellipse cx="20" cy="20" rx="18" ry="7" stroke="#5FD4E3" stroke-width="1.6"/>
          <ellipse cx="20" cy="20" rx="18" ry="7" stroke="#5FD4E3" stroke-width="1.6" transform="rotate(60 20 20)"/>
          <ellipse cx="20" cy="20" rx="18" ry="7" stroke="#3A4055" stroke-width="1.6" transform="rotate(120 20 20)"/>
        </svg>
        <span class="brand-word">${logoHTML}</span>
      </a>
      <div class="nav-links" id="navLinks">
        <a href="index.html" data-view="home" class="${activePage==='home'?'active':''}">Home</a>
        <a href="explore.html" data-view="explore" class="${activePage==='explore'?'active':''}">Explore Projects</a>
        <a href="about.html" data-view="about" class="${activePage==='about'?'active':''}">About</a>
        <a href="doubts.html" data-view="doubts" class="${activePage==='doubts'?'active':''}">Doubt Clarification</a>
      </div>
      <div class="nav-actions" id="navActions">${
        currentUser?`
          <button class="icon-btn" onclick="location.href='explore.html'" title="Search projects &amp; skills">${icon('search')}</button>
          <button class="icon-btn" id="notifBtn" onclick="toggleNotifPanel()" title="Notifications">${icon('bell')}</button>
          <a class="btn btn-outline btn-sm" href="dashboard.html">Dashboard</a>
          <a class="avatar" style="width:38px;height:38px;font-size:12px;margin-left:2px;background:var(--signal-dim);color:var(--signal);border:1px solid var(--line-hi);text-decoration:none" href="profile.html" title="${currentUser.name}">${initials(currentUser.name)}</a>
        `:`
          <a class="btn btn-ghost btn-sm" href="login.html">Log In</a>
          <a class="btn btn-primary btn-sm" href="signup.html">Sign Up</a>
        `
      }</div>
      <button class="nav-burger" onclick="toggleMobileNav()" aria-label="Menu">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
      </button>
    </div>`;
  }
  const foot=document.getElementById('site-footer');
  if(foot){
    foot.innerHTML=`
    <div class="wrap">
      <div class="foot-grid">
        <div class="foot-col">
          <div class="brand" style="margin-bottom:var(--s4)">
            <svg class="brand-mark" viewBox="0 0 40 40" fill="none" style="width:28px;height:28px">
              <circle cx="20" cy="20" r="3.4" fill="#FF8C42"/>
              <ellipse cx="20" cy="20" rx="18" ry="7" stroke="#5FD4E3" stroke-width="1.6"/>
              <ellipse cx="20" cy="20" rx="18" ry="7" stroke="#5FD4E3" stroke-width="1.6" transform="rotate(60 20 20)"/>
              <ellipse cx="20" cy="20" rx="18" ry="7" stroke="#3A4055" stroke-width="1.6" transform="rotate(120 20 20)"/>
            </svg>
            <span class="brand-word" style="font-size:18px">${logoHTML}</span>
          </div>
          <p style="color:var(--faint);font-size:13px;max-width:32ch">A platform where students, engineers, scientists and mentors build real space projects together.</p>
        </div>
        <div class="foot-col"><h5>Platform</h5>
          <a href="explore.html">Explore Projects</a>
          <a href="doubts.html">Doubt Clarification</a>
          <a href="mentor-apply.html">Become a Mentor</a>
          <a href="about.html">About SciBridge</a>
        </div>
        <div class="foot-col"><h5>Categories</h5>
          <a href="explore.html?category=Rockets">Rockets &amp; Satellites</a>
          <a href="explore.html?category=Mars%20Missions">Mars &amp; Moon Missions</a>
          <a href="explore.html?category=AI">AI &amp; Robotics</a>
          <a href="explore.html?category=Space%20Medicine">Space Medicine</a>
        </div>
        <div class="foot-col"><h5>Console</h5>
          <a href="login.html">Log In</a>
          <a href="signup.html">Sign Up</a>
          <a href="admin-login.html">Admin Login</a>
        </div>
      </div>
      <div class="foot-bottom">
        <span>© 2026 SCIBRIDGE · MISSION PLATFORM PROTOTYPE</span>
        <span>BUILT FOR STUDENTS, ENGINEERS, SCIENTISTS &amp; MENTORS</span>
      </div>
    </div>`;
  }
}
function toggleMobileNav(){document.getElementById('navLinks').classList.toggle('mobile-open')}
function closeMobileNav(){document.getElementById('navLinks').classList.remove('mobile-open')}
function toggleNotifPanel(){
  let p=document.getElementById('notifPanel');
  if(p){p.remove();return}
  p=document.createElement('div');
  p.id='notifPanel';
  p.className='card';
  p.style.cssText='position:fixed;top:76px;right:24px;width:340px;z-index:200;max-height:420px;overflow:auto;box-shadow:0 20px 60px rgba(0,0,0,.5)';
  const items=[
    {icon:'users',text:'Rohan Mehta invited you to join Athena-1 CubeSat',time:'2h ago'},
    {icon:'chat',text:'Mentor replied to your doubt in Physics',time:'1d ago'},
    {icon:'file',text:'New update posted on Percival Rover Chassis',time:'3d ago'},
  ];
  p.innerHTML=`<div class="console-head" style="border-radius:10px 10px 0 0"><span>NOTIFICATIONS</span><span onclick="toggleNotifPanel()" style="cursor:pointer">${icon('close')}</span></div>`+
    items.map(n=>`<div style="display:flex;gap:12px;padding:14px 16px;border-bottom:1px solid var(--line)">
      <div style="flex:none;width:32px;height:32px;border-radius:8px;background:var(--telemetry-dim);color:var(--telemetry);display:flex;align-items:center;justify-content:center">${icon(n.icon)}</div>
      <div><div style="font-size:13px">${n.text}</div><div style="font-size:11px;color:var(--faint);font-family:var(--font-mono);margin-top:4px">${n.time}</div></div>
    </div>`).join('');
  document.body.appendChild(p);
}

/* ============================================================================
   PAGE BOOTSTRAP — every page's own small <script> calls this once.
   ============================================================================ */
async function initPage(pageName,pageInitFn){
  try{
    await loadDB();
    await loadSession();
    renderChrome(pageName);
    initStarfield();
    hydrateIcons(document);
    if(typeof pageInitFn==='function'){
      await pageInitFn(new URLSearchParams(location.search));
    }
    setupReveals();
    hydrateIcons(document);
  }catch(e){
    console.error('Page init error',e);
  }finally{
    const loader=document.getElementById('loader');
    if(loader)loader.classList.add('hide');
  }
}
