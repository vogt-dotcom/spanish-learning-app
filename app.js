(() => {
'use strict';
const D=window.DALE_DATA,C=window.DaleCore,KEY='dale-progress-v1',ids=new Set(D.terms.map(t=>t.id));
const icons={home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z"/>',practice:'<path d="m13 2-9 12h7l-1 8 10-13h-7Z"/>',book:'<path d="M12 5v16M3 3q5-1 9 2 4-3 9-2v16q-5-1-9 2-4-3-9-2Z"/>',chart:'<path d="M4 20V10m8 10V4m8 16v-7"/>',sound:'<path d="m11 4-6 5H2v6h3l6 5ZM15 8q4 4 0 8m3-11q7 7 0 14"/>',star:'<path d="m12 3 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1Z"/>',check:'<path d="m5 12 4 4L19 6"/>',close:'<path d="m6 6 12 12M18 6 6 18"/>',image:'<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8" cy="8" r="1.5"/><path d="m3 17 5-5 4 4 4-6 5 7"/>',cards:'<rect x="6" y="3" width="15" height="17" rx="2"/><path d="M3 7v13q0 2 2 2h12"/>',fire:'<path d="M13 2q2 7-2 10 5 1 6-4 7 8 1 13-8 5-13-2-4-7 4-12-1 5 2 6 3-3 2-11Z"/>',globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3q-8 9 0 18 8-9 0-18Z"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l4 2"/>',download:'<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',pen:'<path d="m4 16 12-12 4 4L8 20H4Zm10-10 4 4"/>'};
const icon=n=>'<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(icons[n]||icons.book)+'</svg>';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fresh=()=>({version:1,records:{},days:{},favorites:[],xp:0,goal:10});
let storageOK=true,p=fresh();
try{const saved=localStorage.getItem(KEY);if(saved)p=C.validateProgress(JSON.parse(saved),ids);}catch{storageOK=false;}
let page='learn',session=null,flash=null,lesson=null,query='',filter='all',origin='all',vpage=0,deck='all',length=10,toastTimer;
const today=()=>C.dayKey(),due=()=>D.terms.filter(t=>p.records[t.id]&&p.records[t.id].due<=Date.now());
function save(){try{localStorage.setItem(KEY,JSON.stringify(p));}catch{storageOK=false;toast('Progress could not be saved. Export a backup from Progress.');}}
function toast(s){const el=document.querySelector('#toast');el.textContent=s;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),4200);}
function label(t){return t.origin==='glossary'?'Your glossary':'Everyday essentials';}
function audio(text){
 if(!('speechSynthesis' in window)){toast('Speech playback is unavailable in this browser. Try another browser.');return;}
 speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='es-ES';u.rate=.85;const v=speechSynthesis.getVoices().find(v=>v.lang.startsWith('es'));if(v)u.voice=v;u.onerror=()=>toast('Audio could not play. Your device may need a Spanish voice or an internet connection.');speechSynthesis.speak(u);
}
function nav(next){if(session&&!session.finished){if(!confirm('Leave this practice? Completed answers are already saved.'))return;}session=null;flash=null;lesson=null;page=next;render();window.scrollTo(0,0);}
function heading(title,sub,extra=''){return '<div class="heading"><div><h1>'+title+'</h1><p>'+sub+'</p></div>'+extra+'</div>';}
function shell(body){
 const active=session||flash||lesson?'practice':page;
 return '<div class="layout"><aside class="sidebar"><a class="brand" href="#" data-nav="learn"><img src="assets/icon.svg" alt="">¡Dale!</a><p class="brand-tag">A little Spanish. Every day.</p><nav class="nav" aria-label="Main navigation">'+[['learn','home','Learn'],['practice','practice','Practice'],['vocabulary','book','Vocabulary'],['progress','chart','Progress']].map(([id,i,l])=>'<button data-nav="'+id+'" class="'+(active===id?'active':'')+'" '+(active===id?'aria-current="page"':'')+'>'+icon(i)+l+'</button>').join('')+'</nav><div class="sidebar-bottom"><strong>'+icon(glossaryIcon())+' Made for your Spanish</strong>Built around your listening glossary and the words you meet in real life.</div></aside><main class="content" id="main"><header class="topbar"><span class="breadcrumb">Your personal Spanish studio</span><span class="topbar-right"><span class="pill">'+icon('fire')+C.streak(p.days)+' day streak</span><span class="pill">'+icon('practice')+p.xp+' XP</span><span class="avatar" aria-label="Your profile">Y</span></span></header>'+(!storageOK?'<div class="notice">Browser storage is unavailable or saved data could not be read. Export a backup to keep your progress.</div>':'')+body+'<p class="footer-note">Un poco cada día. A little every day.</p></main></div>';
}
function glossaryIcon(){return 'globe';}
const btn=(text,attrs='',style='')=>'<button class="btn '+style+'" '+attrs+'>'+text+'</button>';
function learn(){
 const done=p.days[today()]||0,word=D.terms.filter(t=>t.origin==='glossary')[Math.floor(Date.now()/86400000)%160];
 return heading('Hola, Yannick.','Your next conversation starts here.','<span class="pill">'+icon('globe')+' Spanish · Your pace</span>')+
 '<div class="dashboard-top"><section class="hero"><div class="hero-copy"><div class="eyebrow">Your daily Spanish moment</div><h2>Small steps.<br>Real conversations.</h2><p>A fresh mix of words you know, new discoveries, and a little listening.</p>'+btn('Start daily practice','data-start="mixed"','light')+'</div><div class="hero-art" aria-hidden="true"><div class="art-card first"><img src="assets/coffee.svg" alt="">el café</div><div class="art-card second"><img src="assets/apple.svg" alt="">la manzana</div></div></section><section class="goal-card"><h3>Your daily goal</h3><div class="goal-ring" style="--pct:'+Math.min(100,done/p.goal*100)+'%"><div class="ring-inner"><strong>'+done+'<small> / '+p.goal+'</small></strong><small>answers practiced</small></div></div><small>'+(done>=p.goal?'Goal complete. ¡Muy bien!':'A few minutes goes a long way.')+'</small></section></div>'+
 '<div class="section-head"><h2>Find your flow</h2><button class="text-btn" data-nav="practice">All practice modes</button></div>'+practiceTiles(['review','picture','listening','flashcards'])+
 '<div class="bottom-grid"><section><div class="section-head"><h2>A little structure helps</h2><span class="badge">Mini lessons</span></div><div class="panel">'+D.lessons.slice(0,3).map((l,i)=>'<div class="lesson-row"><div class="tile-icon '+['','peach','green'][i]+'">'+icon('book')+'</div><div class="grow"><h3>'+l.title+'</h3><p>'+l.tag+'</p></div>'+btn('Explore','data-lesson="'+l.id+'"','secondary small')+'</div>').join('')+'</div></section><section><div class="section-head"><h2>From your glossary</h2><span class="badge">Word of the day</span></div><div class="panel daily-word"><span class="eyebrow muted">'+word.category+'</span><div class="spanish">'+esc(word.es)+'</div><p>'+esc(word.en)+'</p>'+(word.example?'<p class="example">'+esc(word.example)+'</p>':'<div class="spacer"></div>')+'<div class="card-actions"><button class="btn secondary small" data-speak="'+word.id+'">'+icon('sound')+' Hear it</button>'+favoriteButton(word)+'</div></div></section></div>';
}
const modes={
 mixed:['practice','Daily mix','A little of everything.',''],
 review:['clock','Smart review','Revisit words when they’re due.','peach'],
 picture:['image','Picture vocabulary','See it. Name it. Remember it.','green'],
 listening:['sound','Listening','Train your ear for Spanish.','purple'],
 flashcards:['cards','Flashcards','Flip, recall, and make it stick.',''],
 single:['check','Single answer','Find the one right meaning.','green'],
 multi:['cards','Multiple answers','Select every answer that fits.','purple'],
 typing:['pen','Write it out','Recall the Spanish yourself.','peach']
};
function practiceTiles(keys){return '<div class="practice-grid">'+keys.map(k=>'<button class="practice-card" data-start="'+k+'"><div class="tile-icon '+modes[k][3]+'">'+icon(modes[k][0])+'</div><h3>'+modes[k][1]+'</h3><p>'+modes[k][2]+(k==='review'?' <strong>'+due().length+' due</strong>':'')+'</p></button>').join('')+'</div>';}
function practice(){
 return heading('Make it yours.','Choose a way to practice. We’ll take care of the repetition.')+'<div class="panel session-settings"><label>Vocabulary deck <select id="deck"><option value="all">All vocabulary</option><option value="glossary" '+(deck==='glossary'?'selected':'')+'>Your glossary</option><option value="essentials" '+(deck==='essentials'?'selected':'')+'>Everyday essentials</option><option value="favorites" '+(deck==='favorites'?'selected':'')+'>Saved words</option></select></label><label>Session length <select id="length">'+[5,10,20].map(n=>'<option '+(length===n?'selected':'')+'>'+n+'</option>').join('')+'</select></label></div><div class="spacer"></div>'+practiceTiles(Object.keys(modes))+'<div class="section-head"><h2>Mini lessons</h2></div><div class="panel">'+D.lessons.map(l=>'<div class="lesson-row"><div class="tile-icon">'+icon('book')+'</div><div class="grow"><h3>'+l.title+'</h3><p>'+l.summary+'</p></div>'+btn('Explore','data-lesson="'+l.id+'"','secondary small')+'</div>').join('')+'</div>';
}
function favoriteButton(t){return '<button class="icon-btn '+(p.favorites.includes(t.id)?'selected':'')+'" data-favorite="'+t.id+'" aria-label="'+(p.favorites.includes(t.id)?'Unsave ':'Save ')+esc(t.es)+'" aria-pressed="'+p.favorites.includes(t.id)+'">'+icon('star')+'</button>';}
function vocab(){
 let ts=D.terms.filter(t=>(origin==='all'||t.origin===origin)&&(filter==='all'||filter==='saved'&&p.favorites.includes(t.id)||t.category===filter)&&C.normalize(t.es+' '+t.en).includes(C.normalize(query))).sort((a,b)=>a.es.localeCompare(b.es,'es'));
 const total=Math.ceil(ts.length/18);vpage=Math.min(vpage,Math.max(0,total-1));
 return heading('Words worth keeping.','Your glossary, plus a few everyday essentials.','<span class="pill">'+D.terms.length+' words & expressions</span>')+'<div class="toolbar"><input class="search" id="search" type="search" placeholder="Search Spanish or English…" aria-label="Search vocabulary" value="'+esc(query)+'"><select id="origin" aria-label="Vocabulary source"><option value="all">All sources</option><option value="glossary" '+(origin==='glossary'?'selected':'')+'>Your glossary · 160</option><option value="essentials" '+(origin==='essentials'?'selected':'')+'>Everyday essentials · 18</option></select></div><div class="chips">'+[['all','All words'],['Verbs','Verbs'],['Expressions','Expressions'],['Words','Words'],['saved','Saved']].map(([v,l])=>'<button class="chip '+(filter===v?'active':'')+'" data-filter="'+v+'" aria-pressed="'+(filter===v)+'">'+l+'</button>').join('')+'</div><div class="section-head"><small role="status">'+ts.length+' entries</small><button class="text-btn" data-nav="practice">Choose a practice mode</button></div><div class="vocab-grid">'+(ts.slice(vpage*18,(vpage+1)*18).map(t=>'<article class="vocab-card">'+(t.image?'<img src="assets/'+t.image+'.svg" alt="Illustration of '+esc(t.en)+'" loading="lazy">':'')+'<div><span class="badge">'+t.category+'</span></div><h3 lang="es">'+esc(t.es)+'</h3><p>'+esc(t.en)+'</p>'+(t.example?'<p class="muted" lang="es">'+esc(t.example)+'</p>':'')+'<div class="card-actions"><button class="icon-btn" data-speak="'+t.id+'" aria-label="Hear '+esc(t.es)+'">'+icon('sound')+'</button><small>'+label(t)+'</small>'+favoriteButton(t)+'</div>'+(t.sources.length?'<div>'+t.sources.map(s=>{const src=D.sources.find(x=>x.id===s);return src?'<a class="source-link" href="'+src.url+'" target="_blank" rel="noopener" title="'+esc(src.title)+'">'+s+'</a>':'';}).join(' · ')+'</div>':'')+'</article>').join('')||'<div class="empty"><h3>No words found</h3><p class="muted">Try a different search or save a word using its star.</p></div>')+'</div>'+(total>1?'<div class="pagination">'+btn('Previous','data-paginate="-1" '+(!vpage?'disabled':''),'ghost small')+'<span>'+(vpage+1)+' / '+total+'</span>'+btn('Next','data-paginate="1" '+(vpage>=total-1?'disabled':''),'ghost small')+'</div>':'')+sourcesPanel();
}
function sourcesPanel(){return '<section class="panel sources"><details><summary>About your vocabulary & sources</summary><p>Your glossary is a snapshot from '+D.updated+'. Source videos used automatic captions or AI transcription; context and regional notes are retained. New glossary additions can be imported into a future app update.</p>'+D.sources.map(s=>'<p><a href="'+s.url+'" target="_blank" rel="noopener">'+s.id+' · '+esc(s.title)+'</a><br><span class="muted">'+esc(s.method)+'</span></p>').join('')+'<p>Everyday essentials and mini lessons were added for this app. Vocabulary illustrations are original SVG artwork. Speech uses your browser’s available Spanish voice.</p></details></section>';}
function pool(){return D.terms.filter(t=>deck==='all'||deck==='favorites'&&p.favorites.includes(t.id)||t.origin===deck);}
function start(mode){
 let ts=pool();
 if(mode==='picture')ts=ts.filter(t=>t.image);
 if(mode==='review')ts=ts.filter(t=>p.records[t.id]&&p.records[t.id].due<=Date.now());
 if(!ts.length){toast(mode==='review'?'You’re all caught up for this deck. Try the daily mix.':mode==='picture'?'Picture words are in Everyday essentials. Select that deck or All vocabulary.':'Save some vocabulary first, or choose a different deck.');return;}
 if(mode==='flashcards'){flash={terms:C.chooseTerms(ts,p.records,length),index:0,flipped:false,done:0};session=null;render();return;}
 const selected=C.chooseTerms(ts,p.records,length);
 const grammar=C.shuffle(D.lessons.flatMap(l=>l.questions));
 const qs=selected.map((t,i)=>{
  const kind=mode==='mixed'?['single',t.image?'picture':'single','multi','listening','typing'][i%5]:mode==='review'?'single':mode;
  if(kind==='multi'){
   const m=C.makeMulti(ts);
   if(m)return m;
   return {...C.shuffle(grammar.filter(q=>q.answer.length>1))[0],type:'multi'};
  }
  return C.makeQuestion(t,D.terms,kind);
 });
 if(mode==='mixed'&&qs.length>=5)qs[qs.length-1]={...grammar[0],type:grammar[0].answer.length>1?'multi':'single',grammar:true};
 session={mode,questions:qs,index:0,selected:[],checked:false,results:[],finished:false};flash=null;lesson=null;render();window.scrollTo(0,0);
}
function record(term,correct){
 if(term)p.records[term.id]=C.schedule(p.records[term.id],correct);
 p.days[today()]=(p.days[today()]||0)+1;p.xp+=correct?10:2;save();
}
function sessionView(){
 if(session.finished)return resultsView();
 const q=session.questions[session.index],multi=q.answer?.length>1;
 return '<div class="session-wrap"><div class="session-top"><button class="icon-btn" data-exit aria-label="Leave practice">'+icon('close')+'</button><div class="progress-track" role="progressbar" aria-label="Session progress" aria-valuenow="'+session.index+'" aria-valuemin="0" aria-valuemax="'+session.questions.length+'"><div style="width:'+(session.index/session.questions.length*100)+'%"></div></div><small>'+(session.index+1)+' / '+session.questions.length+'</small></div><section class="question-card"><span class="badge">'+(q.grammar?'Mini grammar':q.type==='multi'?'Multiple answers':q.type==='typing'?'Write it out':q.type==='listening'?'Listening':q.type==='picture'?'Picture vocabulary':'Single answer')+'</span><h1>'+esc(q.prompt)+'</h1>'+(q.type==='picture'?'<img class="question-image" src="assets/'+q.term.image+'.svg" alt="Vocabulary illustration">':q.type==='listening'?'<button class="listen-btn" data-listen aria-label="Play Spanish audio">'+icon('sound')+'</button><p class="muted">Tap to listen · Spanish voice</p>':'<p class="question-word" '+(q.type!=='typing'?'lang="es"':'')+'>'+esc(q.hint||'')+'</p>')+(q.type==='typing'?'<label for="typed" class="sr-only">Your Spanish answer</label><input id="typed" class="answer-input" placeholder="Type in Spanish…" lang="es" autocomplete="off" autocapitalize="off" spellcheck="false" '+(session.checked?'disabled':'')+' value="'+esc(session.typed||'')+'"><small>Accents matter. Keep articles and prepositions.</small>':'<div class="question-options" role="group" aria-label="'+(multi?'Select all correct answers':'Select one answer')+'">'+q.options.map((o,i)=>'<button class="option '+(session.selected.includes(i)?'chosen ':'')+(session.checked?(q.answer.includes(i)?'correct ':session.selected.includes(i)?'incorrect ':''):'')+'" data-option="'+i+'" aria-pressed="'+session.selected.includes(i)+'" '+(session.checked?'disabled':'')+'><span class="key">'+(multi?(session.selected.includes(i)?'✓':'□'):i+1)+'</span><span>'+esc(o)+'</span></button>').join('')+'</div>')+(session.checked?'<div class="feedback '+(session.lastCorrect?'':'wrong')+'" role="status"><strong>'+(session.lastCorrect?'¡Muy bien! You got it.':'Keep going. Here’s the answer.')+'</strong><p>'+esc(q.type==='typing'?q.answerText:q.answer.map(i=>q.options[i]).join(' · '))+'</p><p class="muted">'+esc(q.explanation||'')+'</p>'+(q.type==='listening'?'<p lang="es">'+esc(q.term.es)+'</p>':'')+'</div>':'')+'<div class="question-footer"><small>'+(multi?'Select all correct answers.':q.type==='typing'?'Recall it before checking.':'Take your time. You’ve got this.')+'</small>'+btn(session.checked?(session.index===session.questions.length-1?'See results':'Continue'):'Check answer','id="check-answer" '+(!session.checked&&q.type!=='typing'&&!session.selected.length?'disabled':''))+'</div></section><p class="footer-note keyboard-note">Choose with 1–4 · Check or continue with Enter</p></div>';
}
function checkAnswer(){
 if(session.checked){session.index++;session.selected=[];session.checked=false;session.typed='';if(session.index>=session.questions.length)session.finished=true;render();window.scrollTo(0,0);return;}
 const q=session.questions[session.index];let correct;
 if(q.type==='typing'){const value=document.querySelector('#typed').value;if(!value.trim()){toast('Write an answer first.');return;}session.typed=value;correct=q.answerText.split(' / ').some(a=>C.normalize(value)===C.normalize(a));}
 else{if(!session.selected.length)return;correct=C.grade(session.selected,q.answer);}
 record(q.term,correct);session.lastCorrect=correct;session.results.push({q,correct});session.checked=true;render();document.querySelector('#check-answer').focus();
}
function resultsView(){
 const correct=session.results.filter(r=>r.correct).length,total=session.results.length,missed=session.results.filter(r=>!r.correct);
 return '<div class="session-wrap panel results"><div class="celebrate">'+icon('check')+'</div><span class="badge">Practice complete</span><h1 style="margin-top:16px">'+(correct===total?'¡Excelente!':'A little better already.')+'</h1><div class="result-score">'+correct+'<small> / '+total+'</small></div><p class="muted">'+(correct*10+(total-correct)*2)+' XP earned · '+(total?Math.round(correct/total*100):0)+'% accuracy</p><p class="muted">Word reviews are scheduled for '+(missed.length?'another look soon.':'the days ahead.')+'</p>'+(missed.length?'<div class="review-list"><h3>One more look</h3>'+missed.map(r=>'<div class="review-item"><strong>'+esc(r.q.term?.es||r.q.prompt)+'</strong><p>'+esc(r.q.answerText||r.q.answer.map(i=>r.q.options[i]).join(' · '))+'</p></div>').join('')+'</div>':'<div class="spacer"></div>')+'<div class="flash-controls">'+btn('Back to learning','data-finish','secondary')+btn('Practice again','data-restart')+'</div></div>';
}
function flashView(){
 if(flash.index>=flash.terms.length)return '<div class="session-wrap panel results"><h1>That’s a wrap. ¡Bien hecho!</h1><p class="muted" style="margin:20px 0">'+flash.done+' cards reviewed. Your next reviews are scheduled.</p>'+btn('Back to learning','data-finish')+'</div>';
 const t=flash.terms[flash.index];
 return '<div class="session-wrap"><div class="session-top"><button class="icon-btn" data-exit aria-label="Leave flashcards">'+icon('close')+'</button><div class="progress-track"><div style="width:'+(flash.index/flash.terms.length*100)+'%"></div></div><small>'+(flash.index+1)+' / '+flash.terms.length+'</small></div><button class="flashcard" id="flip" aria-label="Flip card"><small>'+label(t)+' · '+t.category+'</small>'+(t.image?'<br><img src="assets/'+t.image+'.svg" alt="Vocabulary illustration">':'')+'<h1 lang="es">'+esc(t.es)+'</h1>'+(flash.flipped?'<p>'+esc(t.en)+'</p><p class="muted">'+esc(t.example)+'</p>':'<p class="muted">Think of the meaning. Tap to reveal.</p>')+'</button><div class="flash-controls"><button class="btn secondary" data-speak="'+t.id+'">'+icon('sound')+' Listen</button></div>'+(flash.flipped?'<div class="flash-controls">'+btn('Still learning','data-rate="0"','ghost')+btn('Got it','data-rate="1"')+'</div>':'<p class="footer-note">Space to flip the card</p>')+'</div>';
}
function lessonView(){
 return '<div class="session-wrap"><button class="btn ghost small" data-finish>Back to learning</button><div class="spacer"></div><article class="panel"><span class="badge">'+lesson.tag+'</span><h1 style="margin-top:18px">'+lesson.title+'</h1><p class="lesson-body">'+esc(lesson.body)+'</p>'+btn('Try the questions','data-lesson-quiz')+'</article></div>';
}
function progress(){
 const rs=Object.values(p.records),attempts=rs.reduce((a,r)=>a+r.attempts,0),correct=rs.reduce((a,r)=>a+r.correct,0),learned=rs.filter(r=>r.repetitions>=3).length;
 const days=Array.from({length:14},(_,i)=>{const d=new Date();d.setDate(d.getDate()-13+i);return {key:C.dayKey(d),day:d.toLocaleDateString('en',{weekday:'narrow'}),date:d.toLocaleDateString('en',{month:'short',day:'numeric'})};});
 const max=Math.max(1,...days.map(d=>p.days[d.key]||0));
 return heading('Look how far you’ve come.','Every small practice adds up.')+'<div class="stats-grid">'+[[icon('practice'),p.xp,'Total XP'],[icon('book'),rs.length,'Words practiced'],[icon('check'),learned,'Words retained¹'],[icon('fire'),C.streak(p.days),'Day streak']].map(([i,n,l])=>'<div class="panel stat">'+i+'<strong>'+n+'</strong><small>'+l+'</small></div>').join('')+'</div><div class="bottom-grid"><section class="panel"><h2>A little, often.</h2><p class="muted">Your last 14 days</p><div class="heatmap">'+days.map(d=>'<div class="day-col" title="'+d.date+': '+(p.days[d.key]||0)+' answers"><div class="day-bar '+(p.days[d.key]?'has-study':'')+'" style="height:'+Math.max(5,(p.days[d.key]||0)/max*70)+'px"></div><small>'+d.day+'</small></div>').join('')+'</div><p class="muted" style="margin-top:22px">'+attempts+' word reviews · '+(attempts?Math.round(correct/attempts*100)+'% accuracy':'Your first session is waiting')+'</p><small>¹ Three consecutive successful word reviews. Quiz and grammar answers contribute to XP and the daily goal.</small></section><section class="panel"><h2>Ready when you are.</h2><p class="muted" style="margin:14px 0">'+due().length+' words are due for review. Reviews return after 1, 3, 7, 14, 30, and 60 days. Missed words return in 10 minutes.</p>'+btn('Review due words','data-start="review"','secondary')+'</section></div><div class="section-head"><h2>Your preferences & data</h2></div><div class="panel"><div class="settings-row"><div><h3>Daily goal</h3><p class="muted">A pace that fits your day.</p></div><select id="goal" aria-label="Daily goal">'+[5,10,20].map(n=>'<option value="'+n+'" '+(p.goal===n?'selected':'')+'>'+n+' answers / day</option>').join('')+'</select></div><div class="settings-row"><div><h3>Keep your progress</h3><p class="muted">Saved in this browser on this device. Export a backup to move it elsewhere.</p></div>'+btn(icon('download')+' Export backup','data-export','secondary')+'</div><div class="settings-row"><div><h3>Restore a backup</h3><p class="muted">Replaces this browser’s progress after confirmation.</p></div><label class="btn ghost file-label">Import backup<input type="file" id="import-progress" accept="application/json,.json" class="sr-only"></label></div><div class="settings-row"><div><h3>Start fresh</h3><p class="muted">Clear progress and saved words on this device.</p></div>'+btn('Reset progress','data-reset','ghost')+'</div></div><div class="spacer"></div>'+sourcesPanel();
}
function render(){
 document.querySelector('#app').innerHTML=shell(session?sessionView():flash?flashView():lesson?lessonView():({learn,practice,vocabulary:vocab,progress}[page]||learn)());
 document.title='¡Dale! — '+(session?'Practice':flash?'Flashcards':lesson?lesson.title:page.charAt(0).toUpperCase()+page.slice(1));
 bind();
}
function bind(){
 document.querySelectorAll('[data-nav]').forEach(el=>el.onclick=e=>{e.preventDefault();nav(el.dataset.nav);});
 document.querySelectorAll('[data-start]').forEach(el=>el.onclick=()=>start(el.dataset.start));
 document.querySelectorAll('[data-speak]').forEach(el=>el.onclick=()=>audio(D.terms.find(t=>t.id===el.dataset.speak).es));
 document.querySelectorAll('[data-favorite]').forEach(el=>el.onclick=()=>{const id=el.dataset.favorite;p.favorites=p.favorites.includes(id)?p.favorites.filter(x=>x!==id):[...p.favorites,id];save();render();});
 document.querySelectorAll('[data-lesson]').forEach(el=>el.onclick=()=>{lesson=D.lessons.find(l=>l.id===el.dataset.lesson);render();window.scrollTo(0,0);});
 document.querySelectorAll('[data-filter]').forEach(el=>el.onclick=()=>{filter=el.dataset.filter;vpage=0;render();});
 document.querySelectorAll('[data-paginate]').forEach(el=>el.onclick=()=>{vpage+=Number(el.dataset.paginate);render();window.scrollTo(0,0);});
 const search=document.querySelector('#search');if(search)search.oninput=()=>{const at=search.selectionStart;query=search.value;vpage=0;render();const fresh=document.querySelector('#search');fresh.focus();fresh.setSelectionRange(at,at);};
 const o=document.querySelector('#origin');if(o)o.onchange=()=>{origin=o.value;vpage=0;render();};
 const d=document.querySelector('#deck');if(d)d.onchange=()=>{deck=d.value;};
 const l=document.querySelector('#length');if(l)l.onchange=()=>{length=Number(l.value);};
 const g=document.querySelector('#goal');if(g)g.onchange=()=>{p.goal=Number(g.value);save();render();};
 document.querySelectorAll('[data-option]').forEach(el=>el.onclick=()=>selectOption(Number(el.dataset.option)));
 const check=document.querySelector('#check-answer');if(check)check.onclick=checkAnswer;
 const listen=document.querySelector('[data-listen]');if(listen)listen.onclick=()=>audio(session.questions[session.index].term.es);
 const exit=document.querySelector('[data-exit]');if(exit)exit.onclick=()=>{if(confirm('Leave practice? Completed answers are already saved.')){session=null;flash=null;page='practice';render();}};
 document.querySelectorAll('[data-finish]').forEach(el=>el.onclick=()=>{session=null;flash=null;lesson=null;page='learn';render();window.scrollTo(0,0);});
 const restart=document.querySelector('[data-restart]');if(restart)restart.onclick=()=>start(session.mode==='lesson'?'mixed':session.mode);
 const flip=document.querySelector('#flip');if(flip)flip.onclick=()=>{flash.flipped=!flash.flipped;render();};
 document.querySelectorAll('[data-rate]').forEach(el=>el.onclick=()=>{record(flash.terms[flash.index],el.dataset.rate==='1');flash.done++;flash.index++;flash.flipped=false;render();});
 const quiz=document.querySelector('[data-lesson-quiz]');if(quiz)quiz.onclick=()=>{session={mode:'lesson',questions:C.shuffle(lesson.questions).map(q=>({...q,type:q.answer.length>1?'multi':'single',grammar:true})),index:0,selected:[],checked:false,results:[],finished:false};lesson=null;render();};
 const exp=document.querySelector('[data-export]');if(exp)exp.onclick=()=>{const blob=new Blob([JSON.stringify(p,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='dale-progress-'+today()+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Backup exported. Keep it somewhere safe.');};
 const imp=document.querySelector('#import-progress');if(imp)imp.onchange=async()=>{const file=imp.files[0];if(!file)return;try{if(file.size>2000000)throw Error('File is too large');const next=C.validateProgress(JSON.parse(await file.text()),ids);if(confirm('Replace this browser’s current progress with this backup?')){p=next;save();render();toast('Progress restored. ¡Seguimos!');}}catch{toast('This is not a valid ¡Dale! progress backup.');}finally{imp.value='';}};
 const reset=document.querySelector('[data-reset]');if(reset)reset.onclick=()=>{if(confirm('Clear all ¡Dale! progress and saved words on this device? Export a backup first if you want to keep it.')){p=fresh();save();render();toast('Progress reset. A fresh start.');}};
}
function selectOption(i){
 if(!session||session.checked||session.finished)return;const q=session.questions[session.index];if(!q.options||i>=q.options.length)return;
 session.selected=q.answer.length>1?(session.selected.includes(i)?session.selected.filter(x=>x!==i):[...session.selected,i]):[i];render();
}
document.addEventListener('keydown',e=>{
 if(e.ctrlKey||e.metaKey||e.altKey||['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName)){if(e.key==='Enter'&&session&&document.activeElement?.id==='typed'){e.preventDefault();checkAnswer();}return;}
 if(session&&!session.finished){if(/^[1-4]$/.test(e.key)){e.preventDefault();selectOption(Number(e.key)-1);}else if(e.key==='Enter'){e.preventDefault();checkAnswer();}}
 else if(flash&&e.code==='Space'){e.preventDefault();document.querySelector('#flip')?.click();}
});
render();
if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
})();
