/* ===== login.js ===== */
async function handleLogin(e){
  e.preventDefault();
  const email=document.getElementById('loginEmail').value.trim().toLowerCase();
  let user=DB.users.find(u=>u.email.toLowerCase()===email);
  if(!user){
    user={id:uid('guest'),name:'Guest Explorer',email:email||'guest@scibridge.space',role:'student',status:'active',skills:[],interests:[],country:'',state:'',education:'',institution:'',field:'',joinedAt:new Date().toISOString().slice(0,10)};
  }
  currentUser=user;
  await saveSession();
  toast(`Welcome back, ${user.name.split(' ')[0]}.`);
  location.href='dashboard.html';
}
function initLoginPage(){
  if(currentUser){location.href='dashboard.html';}
}
initPage('login', initLoginPage);
