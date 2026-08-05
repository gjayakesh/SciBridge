/* ===== signup.js ===== */
let wizardStep=1;
let suSkills=[];
let suInterests=[];
let suFiles={resumeFileName:'',certFileNames:[]};

function setupChipInput(inputId,arr,boxId){
  const input=document.getElementById(inputId);
  input.addEventListener('keydown',(e)=>{
    if(e.key==='Enter'&&input.value.trim()){
      e.preventDefault();
      arr.push(input.value.trim());
      input.value='';
      renderChips(boxId,arr,inputId);
    }
  });
}
function renderChips(boxId,arr,inputId){
  const box=document.getElementById(boxId);
  const input=document.getElementById(inputId);
  Array.from(box.querySelectorAll('.chip')).forEach(c=>c.remove());
  arr.forEach((val,i)=>{
    const chip=document.createElement('span');
    chip.className='chip';
    chip.innerHTML=val+' <button type="button" onclick="removeChip(\''+boxId+'\','+i+')">&times;</button>';
    box.insertBefore(chip,input);
  });
}
function removeChip(boxId,i){
  const arr=boxId==='skillsChipBox'?suSkills:suInterests;
  arr.splice(i,1);
  renderChips(boxId,arr,boxId==='skillsChipBox'?'skillsInput':'interestsInput');
}
function handleFileSelect(inputEl,field,multi){
  if(multi){
    const names=Array.from(inputEl.files).map(f=>f.name);
    suFiles[field]=names;
    document.getElementById('certsFileList').innerHTML=names.map(n=>'<div class="f">'+ICONS.file+' '+n+'</div>').join('');
  }else{
    const name=inputEl.files[0]?inputEl.files[0].name:'';
    suFiles[field]=name;
    document.getElementById('resumeFileList').innerHTML=name?'<div class="f">'+ICONS.file+' '+name+'</div>':'';
  }
}
function wizardValidateStep(step){
  if(step===1){
    const name=document.getElementById('suName').value.trim();
    const email=document.getElementById('suEmail').value.trim();
    const mobile=document.getElementById('suMobile').value.trim();
    const pw=document.getElementById('suPassword').value;
    const pw2=document.getElementById('suPassword2').value;
    if(!name||!email||!mobile||!pw){toast('Fill in every field to continue','err');return false}
    if(pw!==pw2){toast('Passwords do not match','err');return false}
    if(DB.users.some(u=>u.email.toLowerCase()===email.toLowerCase())){toast('That email is already registered — try logging in','err');return false}
    return true;
  }
  return true;
}
function goToStep(step){
  wizardStep=step;
  document.querySelectorAll('.wizard-step').forEach(s=>s.classList.toggle('active',Number(s.dataset.step)===step));
  for(let i=1;i<=5;i++){
    document.getElementById('stepBar'+i).querySelector('i').style.width=i<=step?'100%':'0%';
    document.getElementById('stepLabel'+i).classList.toggle('active',i===step);
  }
  document.getElementById('suBackBtn').style.visibility=step===1?'hidden':'visible';
  document.getElementById('suNextBtn').textContent=step===5?'Create Account →':'Continue →';
  if(step===5)renderReview();
}
function wizardNext(){
  if(!wizardValidateStep(wizardStep))return;
  if(wizardStep===5){submitSignup();return}
  goToStep(wizardStep+1);
}
function wizardBack(){if(wizardStep>1)goToStep(wizardStep-1)}
function renderReview(){
  const rows=[
    ['Name',document.getElementById('suName').value],
    ['Email',document.getElementById('suEmail').value],
    ['Mobile',document.getElementById('suMobile').value],
    ['Country / State',(document.getElementById('suCountry').value||'—')+' / '+(document.getElementById('suState').value||'—')],
    ['Education',document.getElementById('suEducation').value],
    ['Institution',document.getElementById('suInstitution').value||'—'],
    ['Field of Study',document.getElementById('suField').value||'—'],
    ['Skills',suSkills.join(', ')||'—'],
    ['Interests',suInterests.join(', ')||'—'],
    ['Resume',suFiles.resumeFileName||'Not uploaded'],
    ['Certificates',(suFiles.certFileNames||[]).join(', ')||'Not uploaded'],
  ];
  document.getElementById('reviewBox').innerHTML=rows.map(r=>'<div class="review-row"><span>'+r[0]+'</span><span>'+r[1]+'</span></div>').join('');
}
async function submitSignup(){
  const newUser={
    id:uid('u'),
    name:document.getElementById('suName').value.trim(),
    email:document.getElementById('suEmail').value.trim(),
    mobile:document.getElementById('suMobile').value.trim(),
    country:document.getElementById('suCountry').value.trim(),
    state:document.getElementById('suState').value.trim(),
    education:document.getElementById('suEducation').value,
    institution:document.getElementById('suInstitution').value.trim(),
    field:document.getElementById('suField').value.trim(),
    skills:[...suSkills],
    interests:[...suInterests],
    resumeFileName:suFiles.resumeFileName,
    certFileNames:suFiles.certFileNames||[],
    role:'student',status:'active',
    joinedAt:new Date().toISOString().slice(0,10),
  };
  DB.users.push(newUser);
  await saveCollection('scibridge_users',DB.users);
  currentUser=newUser;
  await saveSession();
  toast('Account created. Welcome, '+newUser.name.split(' ')[0]+'.');
  location.href='dashboard.html';
}
function initSignupPage(){
  setupChipInput('skillsInput',suSkills,'skillsChipBox');
  setupChipInput('interestsInput',suInterests,'interestsChipBox');
  if(currentUser){location.href='dashboard.html';}
}
initPage('signup', initSignupPage);
