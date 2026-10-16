const $=s=>document.querySelector(s);
const esc=t=>String(t??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let ALBUMS={}, current=null;

$('#grid').textContent='Chargement…';

async function load(){
  try{
    if(typeof sb==='undefined') throw new Error('Supabase non chargé (vérifiez config.js)');
    const {data,error}=await sb.from('activites').select('*').order('created_at',{ascending:false});
    if(error) throw error;
    (data||[]).forEach(m=>(ALBUMS[m.album]=ALBUMS[m.album]||[]).push(m));
    current=Object.keys(ALBUMS)[0];
    if(!current){$('#grid').textContent="Aucune activité publiée pour l'instant.";return}
    draw();
  }catch(err){
    $('#grid').textContent='Impossible de charger les activités : '+(err.message||err);
  }
}
function draw(){
  $('#tabs').innerHTML='';
  Object.keys(ALBUMS).forEach(n=>{
    const b=document.createElement('button');
    b.textContent=n; b.className=n===current?'on':'';
    b.onclick=()=>{current=n;draw()};
    $('#tabs').appendChild(b);
  });
  const g=$('#grid'); g.innerHTML='';
  ALBUMS[current].forEach(m=>{
    const b=document.createElement('button');
    b.className='item'+(m.type==='photo'?'':' vid');
    b.setAttribute('aria-label',m.titre);
    if(m.type==='photo') b.innerHTML=`<img loading="lazy" src="${esc(m.url)}" alt="${esc(m.titre)}">`;
    else if(m.type==='video') b.innerHTML=`<video preload="metadata" src="${esc(m.url)}#t=0.5" muted></video>`;
    else b.innerHTML=`<img loading="lazy" src="https://img.youtube.com/vi/${esc(m.url)}/hqdefault.jpg" alt="${esc(m.titre)}">`;
    b.innerHTML+=`<span>${esc(m.titre)}</span>`;
    b.onclick=()=>openMedia(m);
    g.appendChild(b);
  });
}
function openMedia(m){
  $('#lbc').innerHTML = m.type==='photo' ? `<img src="${esc(m.url)}" alt="${esc(m.titre)}">`
    : m.type==='video' ? `<video src="${esc(m.url)}" controls autoplay></video>`
    : `<iframe src="https://www.youtube.com/embed/${esc(m.url)}?autoplay=1" allow="autoplay;fullscreen" allowfullscreen></iframe>`;
  $('#lbt').textContent=m.titre; $('#lb').classList.add('on');
}
const closeMedia=()=>{$('#lb').classList.remove('on');$('#lbc').innerHTML=''};
$('#lbx').onclick=closeMedia;
addEventListener('keydown',e=>e.key==='Escape'&&closeMedia());
load();
