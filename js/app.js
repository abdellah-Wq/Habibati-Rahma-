const PASSWORD='2005';
const tracks=[
  {name:'Arousat Al Noor',src:'assets/arousat-alnoor.mp3'},
  {name:'Zawjati',src:'assets/zawjati.mp3'}
];
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const gate=$('#gate'), experience=$('#experience'), code=$('#code'), hint=$('#code-hint');
let unlocked=false, trackIndex=0, lastChapter=-1, heartTimer=null;

function unlock(){
  if(code.value.trim()!==PASSWORD){
    code.value=''; hint.textContent='That code is not quite right. Try again.'; hint.classList.add('error');
    code.classList.remove('shake'); void code.offsetWidth; code.classList.add('shake'); return;
  }
  unlocked=true; gate.classList.add('hide'); experience.hidden=false; document.body.classList.add('live');
  burst(28); setTimeout(()=>scrollToChapter(0),350);
}
$('#enter').onclick=unlock; code.onkeydown=e=>{if(e.key==='Enter')unlock()};

const chapters=$$('.chapter, .filmstrip');
const rail=$('#chapterRail');
chapters.forEach((ch,i)=>{const d=document.createElement('button');d.className='rail-dot';d.title=`Chapter ${String(i+1).padStart(2,'0')}`;d.setAttribute('aria-label',d.title);d.onclick=()=>ch.scrollIntoView({behavior:'smooth'});rail.appendChild(d)});
const dots=$$('.rail-dot');
const observer=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if(!entry.isIntersecting)return;
    const i=chapters.indexOf(entry.target); if(i<0)return;
    entry.target.classList.add('active'); entry.target.querySelectorAll('.reveal').forEach(el=>el.classList.add('show'));
    dots.forEach((d,k)=>d.classList.toggle('active',k===i));
    if(unlocked && i!==lastChapter){
      lastChapter=i; burst(i===0?18:14);
      if(entry.target.classList.contains('photo-chapter')) setTimeout(()=>burst(7),360);
    }
  });
},{threshold:.48}); chapters.forEach(c=>observer.observe(c));

function scrollToChapter(i){(chapters[i]||chapters[0]).scrollIntoView({behavior:'smooth'});}
$$('[data-scroll]').forEach(b=>b.onclick=()=>scrollToChapter(+b.dataset.scroll));
$$('[data-go]').forEach(b=>b.onclick=()=>scrollToChapter(+b.dataset.go));
$('#replay').onclick=()=>scrollToChapter(0);

function heart(x=Math.random()*100){
  const h=document.createElement('span'); h.className='heart'; h.textContent=Math.random()<.18?'♡':'♥';
  h.style.left=x+'%'; h.style.setProperty('--drift',(Math.random()*220-110)+'px'); h.style.setProperty('--duration',(4+Math.random()*5.5)+'s'); h.style.setProperty('--rotate',(Math.random()*360-180)+'deg'); h.style.fontSize=(11+Math.random()*20)+'px';
  $('#hearts').appendChild(h); setTimeout(()=>h.remove(),10500);
}
function burst(n=18){for(let i=0;i<n;i++)setTimeout(()=>heart(6+Math.random()*88),i*30)}
$('#heartButton').onclick=()=>burst(30); $$('[data-hearts]').forEach(b=>b.onclick=()=>burst(+b.dataset.hearts));

// Music player
const audio=$('#audio'), play=$('#playTrack'), prev=$('#prevTrack'), next=$('#nextTrack'), mute=$('#muteTrack'), seek=$('#seek'), volume=$('#volume');
const title=$('#trackTitle'), status=$('#trackStatus'), now=$('#timeNow'), total=$('#timeTotal');
function fmt(sec){if(!isFinite(sec))return'0:00';return `${Math.floor(sec/60)}:${String(Math.floor(sec%60)).padStart(2,'0')}`}
function loadTrack(i,autoplay=false){trackIndex=(i+tracks.length)%tracks.length;audio.src=tracks[trackIndex].src;title.textContent=tracks[trackIndex].name;seek.value=0;audio.load();status.textContent='Ready';if(autoplay)playAudio()}
function playAudio(){audio.play().then(()=>{play.textContent='Ⅱ';status.textContent='Now playing'}).catch(()=>{status.textContent='Press play to start'})}
play.onclick=()=>audio.paused?playAudio():(audio.pause(),play.textContent='▶',status.textContent='Paused');
prev.onclick=()=>loadTrack(trackIndex-1,true); next.onclick=()=>loadTrack(trackIndex+1,true); audio.onended=()=>loadTrack(trackIndex+1,true);
mute.onclick=()=>{audio.muted=!audio.muted;mute.textContent=audio.muted?'🔇':'🔊'}; volume.oninput=()=>audio.volume=+volume.value; audio.volume=.72;
audio.ontimeupdate=()=>{if(audio.duration){seek.value=audio.currentTime/audio.duration*100;now.textContent=fmt(audio.currentTime);total.textContent=fmt(audio.duration)}};
seek.oninput=()=>{if(audio.duration)audio.currentTime=seek.value/100*audio.duration};
$$('[data-track]').forEach(b=>b.onclick=()=>loadTrack(+b.dataset.track,true)); loadTrack(0,false);

// Drawers
function openDrawer(id){document.body.classList.add('drawer-open');$('#'+id).classList.add('open');$('#'+id).setAttribute('aria-hidden','false')}
function closeDrawers(){document.body.classList.remove('drawer-open');$$('.drawer').forEach(d=>{d.classList.remove('open');d.setAttribute('aria-hidden','true')})}
$('#soundButton').onclick=()=>openDrawer('musicPanel');$('#modeButton').onclick=()=>openDrawer('modePanel');$('#drawerBackdrop').onclick=closeDrawers;$$('[data-close]').forEach(b=>b.onclick=closeDrawers);

// Modes
$$('[data-mode]').forEach(b=>b.onclick=()=>{document.body.classList.remove('cinematic','peaceful','romantic');document.body.classList.add(b.dataset.mode);closeDrawers();burst(b.dataset.mode==='romantic'?20:8)});

// Modal prayers
const modal=$('#modal'), modalTitle=$('#modalTitle'), modalText=$('#modalText'), modalEyebrow=$('#modalEyebrow');
const wishes={
 peace:['A prayer for your peace','May Allah place sakinah in your heart, make what feels heavy lighter, protect you from what drains you, and surround you with people who bring mercy, patience and safety.'],
 knowledge:['A prayer for your path','May Allah bless your learning, make beneficial knowledge easy for you, increase you in understanding, and open doors where your effort becomes a source of goodness for you and others.'],
 future:['A prayer for your future','May Allah write for you a future filled with barakah, dignity, sincere companionship, meaningful work, peaceful family moments and choices that bring you closer to what is good.']
};
function openModal(eyebrowText,titleText,text){modalEyebrow.textContent=eyebrowText;modalTitle.textContent=titleText;modalText.textContent=text;modal.classList.add('open');modal.setAttribute('aria-hidden','false');burst(18)}
$$('[data-wish]').forEach(b=>b.onclick=()=>{const w=wishes[b.dataset.wish];openModal('A little prayer',w[0],w[1])});
$('#modalClose').onclick=()=>{modal.classList.remove('open');modal.setAttribute('aria-hidden','true')}; modal.onclick=e=>{if(e.target===modal)$('#modalClose').click()}; $('#modalHeart').onclick=()=>burst(35);

// Breathing activity
$('[data-breathe]').onclick=()=>{openModal('A ten-second pause','Breathe slowly','Unclench your jaw. Lower your shoulders. Breathe in gently. Breathe out even more slowly. You do not need to solve everything in one moment.');let n=10;const tick=setInterval(()=>{if(!modal.classList.contains('open'))return clearInterval(tick);if(n>0){modalTitle.textContent=`Breathe · ${n}`;n--}else{modalTitle.textContent='You made it ♥';clearInterval(tick)}},1000)};

// Letter
const letter=$('#letter'); function openLetter(){letter.classList.add('open');letter.setAttribute('aria-hidden','false');burst(25)} $('#openLetter').onclick=openLetter; $('#letterButton').onclick=openLetter; $('#letterClose').onclick=()=>{letter.classList.remove('open');letter.setAttribute('aria-hidden','true')}; letter.onclick=e=>{if(e.target===letter)$('#letterClose').click()};

// Touch swipe between chapters
let touchX=0,touchY=0;document.addEventListener('touchstart',e=>{touchX=e.changedTouches[0].clientX;touchY=e.changedTouches[0].clientY},{passive:true});document.addEventListener('touchend',e=>{if(!unlocked)return;const dx=e.changedTouches[0].clientX-touchX,dy=e.changedTouches[0].clientY-touchY;if(Math.abs(dx)>70&&Math.abs(dx)>Math.abs(dy)*1.2){const active=dots.findIndex(d=>d.classList.contains('active'));scrollToChapter(Math.max(0,Math.min(chapters.length-1,active+(dx<0?1:-1))))}},{passive:true});

// Ambient hearts: gentle, not constant noise
function ambient(){if(!unlocked)return;heart(Math.random()*100);heartTimer=setTimeout(ambient,2400+Math.random()*2800)}setTimeout(ambient,5000);

// Keyboard shortcuts
window.addEventListener('keydown',e=>{if(!unlocked)return;if(e.key==='Escape'){closeDrawers();$('#modalClose').click();$('#letterClose').click()}if(e.key===' '&&!e.target.matches('input,button')){e.preventDefault();play.click()}if(e.key==='ArrowDown'||e.key==='ArrowRight'){const i=dots.findIndex(d=>d.classList.contains('active'));scrollToChapter(Math.min(chapters.length-1,i+1))}if(e.key==='ArrowUp'||e.key==='ArrowLeft'){const i=dots.findIndex(d=>d.classList.contains('active'));scrollToChapter(Math.max(0,i-1))}});
