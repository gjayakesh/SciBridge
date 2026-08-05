/* ===== build-choice.js ===== */
async function startIndividualProject(){
  if(!currentUser){toast('Log in to start a project','err');location.href='login.html';return}
  let p=DB.projects.find(pr=>pr.type==='individual'&&pr.ownerId===currentUser.id&&pr.status==='draft');
  if(!p){
    p={id:uid('p'),title:'',category:CATEGORIES[0].name,type:'individual',description:'',skills:[],ownerId:currentUser.id,mentorId:null,members:[],progress:0,status:'draft',featured:false,files:[],updates:[],createdAt:new Date().toISOString().slice(0,10)};
    DB.projects.push(p);
    await saveCollection('scibridge_projects',DB.projects);
  }
  location.href='individual-workspace.html?id='+p.id;
}
function initBuildChoicePage(){
  if(!requireLogin())return;
}
initPage('build-choice', initBuildChoicePage);
