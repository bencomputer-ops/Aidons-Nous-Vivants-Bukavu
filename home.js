const esc=t=>String(t??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    const {data}=await sb.from('activites').select('album,titre,type,url,created_at').order('created_at',{ascending:false});
    if(data&&data.length){
      const photos=data.filter(d=>d.type==='photo');
      const n={albums:new Set(data.map(d=>d.album)).size,photos:photos.length,videos:data.length-photos.length};
      const box=$('#nums');
      if(box){
        Object.keys(n).forEach(k=>{const el=$('[data-k='+k+']',box); if(el) el.dataset.to=n[k]});
        box.hidden=false;
        const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){$$('b[data-to]',box).forEach(count);io.disconnect()}}),{threshold:.3});
        io.observe(box);
      }
      const mo=$('#mosaic');
      if(mo&&photos.length){
        mo.innerHTML=photos.slice(0,5).map(p=>`<a class="tile" href="activites.html#album/${encodeURIComponent(p.album)}"><img loading="lazy" src="${esc(p.url)}" alt="${esc(p.titre)}"><span>${esc(p.album)}</span></a>`).join('');
        $('#recent').hidden=false;
      }
    }
  }catch(e){}
  try{ /* liens des réseaux : ceux saisis dans l'admin remplacent ceux de la page */
    const {data}=await sb.from('reglages').select('cle,valeur');
    (data||[]).forEach(r=>{const v=(r.valeur||'').trim(); if(v) $$('[data-s="'+r.cle+'"]').forEach(a=>a.href=/^https?:/i.test(v)?v:'https://'+v)});
  }catch(e){}
}
run();
})();


