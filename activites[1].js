window.__ok=true; /* signale à la page que ce fichier est bien chargé */
const $=s=>document.querySelector(s);
const esc=t=>String(t??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
window.addEventListener('error',e=>{const g=document.querySelector('#grid'); if(g) g.textContent='Erreur : '+e.message;});
let ALBUMS={}, ORDER=[], LIST=[], IDX=0;

const plural=(n,a,b)=>n+' '+(n>1?b:a);
function media(m){
  if(m.type==='photo') return `<img loading="lazy" decoding="async" src="${esc(m.url)}" alt="${esc(m.titre)}">`;
  if(m.type==='youtube') return `<img loading="lazy" src="https://img.youtube.com/vi/${esc(m.url)}/hqdefault.jpg" alt="${esc(m.titre)}"><b class="play">▶</b>`;
  return `<video preload="metadata" muted playsinline src="${esc(m.url)}#t=0.5"></video><b class="play">▶</b>`;
}
function cover(items){
  const m=items.find(x=>x.type==='photo')||items.find(x=>x.type==='youtube')||items[0];
  return m?media(m):'';
}
function counts(items){
  const p=items.filter(m=>m.type==='photo').length, v=items.length-p;
  return [p?plural(p,'photo','photos'):'', v?plural(v,'vidéo','vidéos'):''].filter(Boolean).join(' · ');
}

/* Vue 1 : la liste des albums */
function showAlbums(){
  $('#tabs').className=''; $('#tabs').innerHTML='';
  const g=$('#grid'); g.className='gal albums';
  g.innerHTML=ORDER.map(n=>`<a class="album" href="#album/${encodeURIComponent(n)}"><span class="cover">${cover(ALBUMS[n])}</span><span class="meta"><b>${esc(n)}</b><small>${counts(ALBUMS[n])}</small></span></a>`).join('');
}

/* Vue 2 : l'intérieur d'un album */
function showAlbum(name){
  const items=ALBUMS[name]; if(!items){location.hash='';return}
  const photos=items.filter(m=>m.type==='photo'), vids=items.filter(m=>m.type!=='photo');
  LIST=photos.concat(vids);
  $('#tabs').className='bar';
  $('#tabs').innerHTML=`<a class="back" href="#">← Tous les albums</a><h3 class="albtitle">${esc(name)}</h3>`;
  const g=$('#grid'); g.className='gal';
  const sec=(t,arr,off)=>arr.length?`<h4>${t} (${arr.length})</h4><div class="thumbs">${arr.map((m,i)=>`<button class="th" data-i="${off+i}" aria-label="${esc(m.titre)}">${media(m)}</button>`).join('')}</div>`:'';
  g.innerHTML=sec('Photos',photos,0)+sec('Vidéos',vids,photos.length);
}
function route(){
  if(!ORDER.length) return;
  const h=decodeURIComponent(location.hash.slice(1));
  if(h.startsWith('album/')) showAlbum(h.slice(6)); else showAlbums();
  scrollTo(0,0);
}

/* Agrandissement (photo / vidéo / YouTube) */
function openAt(i){
  IDX=(i+LIST.length)%LIST.length; const m=LIST[IDX];
  $('#lbc').innerHTML = m.type==='photo' ? `<img src="${esc(m.url)}" alt="${esc(m.titre)}">`
    : m.type==='video' ? `<video src="${esc(m.url)}" controls autoplay playsinline></video>`
    : `<iframe src="https://www.youtube.com/embed/${esc(m.url)}?autoplay=1" allow="autoplay;fullscreen" allowfullscreen></iframe>`;
  $('#lbt').textContent=m.titre; $('#lb').classList.add('on');
  document.querySelectorAll('#lb .nav').forEach(b=>b.hidden=LIST.length<2);
}
const closeMedia=()=>{$('#lb').classList.remove('on');$('#lbc').innerHTML=''};
/* Chargement depuis la base */
async function load(){
  $('#grid').textContent='Chargement…';
  try{
    if(typeof sb==='undefined') throw new Error('Supabase non chargé (vérifiez config.js)');
    const {data,error}=await sb.from('activites').select('*').order('created_at',{ascending:false});
    if(error) throw error;
    (data||[]).forEach(m=>(ALBUMS[m.album]=ALBUMS[m.album]||[]).push(m));
    ORDER=Object.keys(ALBUMS);
    if(!ORDER.length){$('#grid').textContent="Aucune activité publiée pour l'instant.";return}
    route();
  }catch(err){
    $('#grid').textContent='Impossible de charger les activités : '+(err.message||err);
  }
}
load();

['prev','next'].forEach(k=>{
  const b=document.createElement('button');
  b.className='nav '+k; b.textContent=k==='prev'?'‹':'›';
  b.setAttribute('aria-label',k==='prev'?'Précédent':'Suivant');
  b.onclick=()=>openAt(IDX+(k==='prev'?-1:1));
  if($('#lb')) $('#lb').appendChild(b);
});
if($('#lbx')) $('#lbx').onclick=closeMedia;
if($('#lb')) $('#lb').onclick=e=>{if(e.target.id==='lb')closeMedia()};
$('#grid').onclick=e=>{const b=e.target.closest('.th'); if(b) openAt(+b.dataset.i)};
addEventListener('keydown',e=>{
  if(!$('#lb')||!$('#lb').classList.contains('on')) return;
  if(e.key==='Escape') closeMedia();
  if(e.key==='ArrowLeft') openAt(IDX-1);
  if(e.key==='ArrowRight') openAt(IDX+1);
});
addEventListener('hashchange',route);

