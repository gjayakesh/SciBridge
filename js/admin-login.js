/* ===== admin-login.js ===== */
const ADMIN_CREDS={email:'admin@scibridge.space',password:'SciBridgeAdmin!'};
async function handleAdminLogin(e){
  e.preventDefault();
  const email=document.getElementById('adminEmail').value.trim();
  const pw=document.getElementById('adminPassword').value;
  if(email===ADMIN_CREDS.email&&pw===ADMIN_CREDS.password){
    isAdminSession=true;
    await saveSession();
    toast('Welcome to Mission Control');
    location.href='admin.html';
  }else{
    toast('Incorrect admin credentials','err');
  }
}
function initAdminLoginPage(){
  if(isAdminSession){location.href='admin.html';}
}
initPage('admin-login', initAdminLoginPage);
