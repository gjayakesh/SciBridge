/* ===== mentor-apply.js ===== */
function handleMentorCredFile(el){
  const name=el.files[0]?el.files[0].name:'';
  document.getElementById('mentorCredFileList').innerHTML=name?'<div class="f">'+ICONS.file+' '+name+'</div>':'';
}
async function submitMentorApplication(){
  if(!currentUser){toast('Log in to apply','err');location.href='login.html';return}
  const expertise=document.getElementById('mentorExpertise').value.split(',').map(function(s){return s.trim()}).filter(Boolean);
  const years=Number(document.getElementById('mentorYears').value)||0;
  const bio=document.getElementById('mentorBio').value.trim();
  const fileEl=document.getElementById('mentorCredFile');
  const credFileName=fileEl.files[0]?fileEl.files[0].name:'';
  if(!expertise.length||!bio){toast('Fill in your expertise and bio','err');return}
  const app={id:uid('m'),applicantName:currentUser.name,applicantEmail:currentUser.email,expertise:expertise,yearsExperience:years,bio:bio,credentialFileName:credFileName,status:'pending',createdAt:new Date().toISOString().slice(0,10)};
  DB.mentorApps.push(app);
  await saveCollection('scibridge_mentor_apps',DB.mentorApps);
  document.getElementById('mentorAppStatus').innerHTML='<div class="auth-demo-note" style="margin-top:var(--s5)">Application submitted — status: <b style="color:var(--warn)">Pending Review</b>. The admin team will review it shortly.</div>';
  toast('Mentor application submitted');
}
function initMentorApplyPage(){
  if(!requireLogin())return;
  document.getElementById('mentorAppStatus').innerHTML='';
}
initPage('mentor-apply', initMentorApplyPage);
