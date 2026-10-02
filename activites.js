const $=s=>document.querySelector(s);
const esc=t=>String(t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let ALBUMS={}, current=null;

async function load(){
  const {data,error}=await sb.from('activites').select('*').order('created_at',{ascending:false});
  if(error){$('#grid').textContent='Impossible de charger les activités.';return}
  data.forEach(m=>(ALBUMS[m.album]=ALBUMS[m.album]||[]).push(m));
  current=Object.keys(ALBUMS)[0];
  if(!current){$('#grid').textContent="Aucune activité publiée pour l'instant.";return}
  draw();
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