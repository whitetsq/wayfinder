
const state = { section:'全部', query:'', lang:'全部', access:'全部', collection:null, favOnly:false };
let SITES=[], COLLECTIONS=[], SECTIONS=[];

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const favs = () => { try { return new Set(JSON.parse(localStorage.getItem('zhijing-favs')||'[]')); } catch { return new Set(); } };
const saveFavs = f => localStorage.setItem('zhijing-favs', JSON.stringify([...f]));
const esc = (s='') => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const statusLabel = s => s.status==='watch' ? '复核中' : s.status==='archived' ? '已归档' : '推荐中';

function accessMatch(s){
  if(state.access==='全部') return true;
  if(state.access==='免费') return s.access.includes('免费');
  if(state.access==='付费') return s.access.includes('付费') || s.access.includes('会员') || s.access.includes('订阅');
  return true;
}
function languageMatch(s){
  if(state.lang==='全部') return true;
  if(state.lang==='中文') return s.language.includes('中文');
  if(state.lang==='EN') return s.language.split('/').includes('EN');
  return s.language===state.lang;
}
function filtered(){
  const q=state.query.trim().toLowerCase(), f=favs();
  let allowed=null;
  if(state.collection){
    const c=COLLECTIONS.find(x=>x.id===state.collection);
    allowed=new Set(c?.sites||[]);
  }
  return SITES.filter(s=>{
    if(s.status==='archived') return false;
    if(state.section!=='全部' && s.section!==state.section) return false;
    if(!languageMatch(s)) return false;
    if(!accessMatch(s)) return false;
    if(state.favOnly && !f.has(s.id)) return false;
    if(allowed && !allowed.has(s.id)) return false;
    if(!q) return true;
    const hay=[s.name,s.section,s.language,s.region,s.access,s.depth,s.cadence,s.why,s.caution,s.community_signal,...s.topics].join(' ').toLowerCase();
    return hay.includes(q);
  });
}
function renderNav(){
  $('#sectionNav').innerHTML=SECTIONS.map(s=>`<button class="nav-item ${state.section===s.id?'active':''}" data-section="${esc(s.id)}"><span>${esc(s.label)}</span><small>${esc(s.note)}</small></button>`).join('');
  $$('.nav-item').forEach(b=>b.onclick=()=>{state.section=b.dataset.section;state.collection=null;renderAll();});
}
function renderCollections(){
  $('#collectionGrid').innerHTML=COLLECTIONS.map(c=>{
    const names=c.sites.map(id=>SITES.find(s=>s.id===id)?.name).filter(Boolean).slice(0,5);
    return `<button class="collection" data-c="${c.id}">
      <div class="collection-top"><div><h3>${esc(c.name)}</h3><p>${esc(c.subtitle)}</p></div><span class="number">${c.sites.length}</span></div>
      <div class="collection-sites">${names.map(n=>`<span>${esc(n)}</span>`).join('')}</div>
    </button>`;
  }).join('');
  $$('.collection').forEach(b=>b.onclick=()=>{state.collection=b.dataset.c;state.section='全部';window.scrollTo({top:document.querySelector('.catalog-section').offsetTop-20,behavior:'smooth'});renderAll();});
}
function card(s){
  const on=favs().has(s.id);
  return `<article class="site-card" data-open-site="${esc(s.id)}">
    <div class="site-head">
      <div class="site-name"><h3><a class="site-title-link" href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.name)}</a></h3><span class="site-section">${esc(s.section)}</span>${s.status==='watch'?'<span class="site-status watch">复核中</span>':''}</div>
      <button class="star ${on?'on':''}" data-star="${s.id}" title="收藏">★</button>
    </div>
    <p class="why">${esc(s.why)}</p>
    ${s.caution?`<div class="caution">注意：${esc(s.caution)}</div>`:''}
    <div class="tags">${s.topics.slice(0,4).map(t=>`<span>${esc(t)}</span>`).join('')}</div>
    <div class="site-foot">
      <div class="meta"><span>${esc(s.language)}</span><span>${esc(s.region)}</span><span>${esc(s.access)}</span><span>${esc(s.depth)}</span></div>
      <div class="actions"><button data-detail="${s.id}">详情</button><a class="open-link" href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">打开 ↗</a></div>
    </div>
  </article>`;
}
function renderCatalog(){
  const list=filtered();
  const collection=state.collection?COLLECTIONS.find(c=>c.id===state.collection):null;
  $('#catalogTitle').textContent=collection?collection.name:(SECTIONS.find(s=>s.id===state.section)?.label||'全部站点');
  $('#catalogCount').textContent=`${list.length} / ${SITES.filter(s=>s.status!=='archived').length}`;
  $('#siteGrid').innerHTML=list.length?list.map(card).join(''):'<div class="empty">没有匹配结果。换个筛选条件试试。</div>';
  const chips=[];
  if(collection) chips.push(`书架：${collection.name}`);
  if(state.query) chips.push(`搜索：${state.query}`);
  if(state.lang!=='全部') chips.push(state.lang);
  if(state.access!=='全部') chips.push(state.access);
  if(state.favOnly) chips.push('仅收藏');
  $('#activeFilters').innerHTML=chips.map(c=>`<span class="filter-chip">${esc(c)}</span>`).join('');
  [...document.querySelectorAll('[data-open-site]')].forEach(card=>card.onclick=e=>{
    if(e.target.closest('a,button')) return;
    const s=SITES.find(x=>x.id===card.dataset.openSite);
    if(s) window.open(s.url,'_blank','noopener,noreferrer');
  });
  [...document.querySelectorAll('[data-star]')].forEach(b=>b.onclick=()=>{const f=favs(),id=b.dataset.star;f.has(id)?f.delete(id):f.add(id);saveFavs(f);renderCatalog();});
  [...document.querySelectorAll('[data-detail]')].forEach(b=>b.onclick=()=>openDetail(b.dataset.detail));
}
function openDetail(id){
  const s=SITES.find(x=>x.id===id); if(!s)return;
  $('#dialogContent').innerHTML=`
    <div class="kicker">${esc(s.section)} · ${esc(s.language)}</div>
    <h2 class="dialog-title">${esc(s.name)}</h2>
    <div class="dialog-url">${esc(s.url)}</div>
    <div class="dialog-grid">
      <div><b>访问</b><span>${esc(s.access)}</span></div>
      <div><b>深度</b><span>${esc(s.depth)}</span></div>
      <div><b>更新</b><span>${esc(s.cadence)}</span></div>
      <div><b>地区</b><span>${esc(s.region)}</span></div>
      <div><b>形式</b><span>${esc(s.format)}</span></div>
      <div><b>状态</b><span>${esc(statusLabel(s))}</span></div>
      <div><b>最后审阅</b><span>${esc(s.reviewed_on)}</span></div>
    </div>
    <p class="dialog-copy">${esc(s.why)}</p>
    ${s.community_signal?`<p class="dialog-copy"><strong>社区信号：</strong>${esc(s.community_signal)}</p>`:''}
    ${s.caution?`<div class="dialog-note">${esc(s.caution)}</div>`:''}
    <a class="dialog-open" href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">访问网站 ↗</a>`;
  $('#detailDialog').showModal();
}
function renderAll(){renderNav();renderCatalog();}
function initEvents(){
  $('#search').oninput=e=>{state.query=e.target.value;renderCatalog();};
  $('#langFilter').onchange=e=>{state.lang=e.target.value;renderCatalog();};
  $('#accessFilter').onchange=e=>{state.access=e.target.value;renderCatalog();};
  $('#favOnly').onclick=()=>{state.favOnly=!state.favOnly;$('#favOnly').classList.toggle('active',state.favOnly);renderCatalog();};
  $('#randomBtn').onclick=()=>{const p=filtered().filter(s=>s.status==='active');if(p.length)window.open(p[Math.floor(Math.random()*p.length)].url,'_blank','noopener,noreferrer');};
  $('#themeBtn').onclick=()=>{const t=document.documentElement.dataset.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=t;localStorage.setItem('zhijing-theme',t);};
  $('#closeDialog').onclick=()=>$('#detailDialog').close();
  document.addEventListener('keydown',e=>{if(e.key==='/' && document.activeElement.tagName!=='INPUT'){e.preventDefault();$('#search').focus();}});
}
const SITE_SHARDS = Array.from({length:8}, (_,i)=>`data/sites/${String(i+1).padStart(2,'0')}.json`);
Promise.all([
  Promise.all(SITE_SHARDS.map(path=>fetch(path).then(r=>r.json()))).then(parts=>parts.flat()),
  fetch('data/collections.json').then(r=>r.json()),
  fetch('data/sections.json').then(r=>r.json())
]).then(([sites,collections,sections])=>{
  SITES=sites;COLLECTIONS=collections;SECTIONS=sections;
  document.documentElement.dataset.theme=localStorage.getItem('zhijing-theme') || (matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');
  renderCollections();renderAll();initEvents();
});
