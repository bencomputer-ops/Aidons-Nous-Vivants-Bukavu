const $=s=>document.querySelector(s);
const esc=t=>String(t??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

/* Connexion */
const READY = typeof sb!=='undefined' && !SUPABASE_URL.includes('VOTRE-PROJET');
if(!READY) $('#cfg').hidden=false;

function show(on){
  $('#login').hidden=on; $('#panel').hidden=!on; $('#out').hidden=!on;
  if(on){loadActs();loadMsgs()}
}
if(READY) sb.auth.getSession().then(({data})=>show(!!data.session));
$('#lf').onsubmit=async e=>{
  e.preventDefault();
  if(!READY){$('#cfg').hidden=false;return}
  const {error}=await sb.auth.signInWithPassword({email:$('#em').value,password:$('#pw').value});
  if(error) $('#lerr').textContent='E-mail ou mot de passe incorrect.'; else show(true);
};
$('#out').onclick=async e=>{e.preventDefault();await sb.auth.signOut();show(false)};

/* Onglets */
document.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>{
  document.querySelectorAll('[data-t]').forEach(x=>x.classList.toggle('on',x===b));
  $('#t-add').hidden=b.dataset.t!=='add'; $('#t-msgs').hidden=b.dataset.t!=='msgs';
});

/* Choix du type */
$('#type').onchange=()=>{
  const t=$('#type').value;

