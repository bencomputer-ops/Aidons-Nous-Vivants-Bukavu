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
  $('#fl').hidden=t==='youtube'; $('#yl').hidden=t!=='youtube';
  $('#files').accept=t==='photo'?'image/*':'video/*';
  $('#files').multiple=t==='photo';
};

/* Publier une activité */
$('#af').onsubmit=async e=>{
  e.preventDefault();
  const st=$('#ast'); st.textContent='Envoi en cours…';
  const album=$('#album').value.trim(), titre=$('#titre').value.trim(), type=$('#type').value;
  try{
    const rows=[];
    if(type==='youtube'){
      const m=$('#yt').value.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([\w-]{11})/);
      if(!m) throw new Error('Lien YouTube invalide');
      rows.push({album,titre,type,url:m[1]});
    }else{
      const files=[...$('#files').files];
      if(!files.length) throw new Error('Choisissez un fichier');
      for(const f of files){
        const path=Date.now()+'-'+f.name.replace(/[^\w.-]/g,'_');
        const {error}=await sb.storage.from('medias').upload(path,f);
        if(error) throw error;
        rows.push({album,titre,type,url:sb.storage.from('medias').getPublicUrl(path).data.publicUrl});
      }
    }
    const {error}=await sb.from('activites').insert(rows);
    if(error) throw error;
    st.textContent='✓ Publié : visible maintenant sur la page Activités';
    e.target.reset(); loadActs();
  }catch(err){st.textContent='Erreur : '+err.message}
};

/* Liste des publications */
async function loadActs(){
  const {data}=await sb.from('activites').select('*').order('created_at',{ascending:false});
  $('#albums').innerHTML=[...new Set((data||[]).map(a=>a.album))].map(a=>`<option value="${esc(a)}">`).join('');
  $('#acts').innerHTML=(data||[]).map(a=>`
    <div class="row"><span>${esc(a.titre)}<br><small>${esc(a.album)} · ${a.type}</small></span>
    <button class="mini" data-del="${a.id}" data-url="${esc(a.url)}" data-type="${a.type}">Supprimer</button></div>`).join('')||'<p>Rien de publié.</p>';
}
$('#acts').onclick=async e=>{
  const b=e.target.closest('[data-del]'); if(!b||!confirm('Supprimer cette publication ?'))return;
  if(b.dataset.type!=='youtube'){const p=b.dataset.url.split('/medias/')[1]; if(p) await sb.storage.from('medias').remove([decodeURIComponent(p)])}
  await sb.from('activites').delete().eq('id',b.dataset.del); loadActs();
};

/* Messages reçus */
async function loadMsgs(){
  const {data}=await sb.from('messages').select('*').order('created_at',{ascending:false});
  const n=(data||[]).filter(m=>!m.lu).length;
  $('#nb').textContent=n; $('#nb').hidden=!n;
  $('#msgs').innerHTML=(data||[]).map(m=>`
    <div class="msg ${m.lu?'':'new'}">
      <b>${esc(m.nom)}</b> <small>${new Date(m.created_at).toLocaleString('fr-FR')}</small>
      ${m.contact?`<br><small>${esc(m.contact)}</small>`:''}
      <p>${esc(m.message)}</p>
      ${m.lu?'':`<button class="mini" data-read="${m.id}">Marquer comme lu</button>`}
      <button class="mini" data-rm="${m.id}">Supprimer</button>
    </div>`).join('')||'<p>Aucun message pour l\'instant.</p>';
}
$('#msgs').onclick=async e=>{
  const r=e.target.dataset.read, d=e.target.dataset.rm;
  if(r) await sb.from('messages').update({lu:true}).eq('id',r);
  else if(d&&confirm('Supprimer ce message ?')) await sb.from('messages').delete().eq('id',d);
  else return;
  loadMsgs();
};
