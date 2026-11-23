/* Pure learning logic, shared by the UI and regression tests. */
(function(root) {
'use strict';
const DAY=86400000;
const normalize=s=>s.toLocaleLowerCase('es').normalize('NFC').replace(/[¿?¡!.,;:]/g,'').replace(/\s+/g,' ').trim();
const dayKey=(date=new Date())=>[date.getFullYear(),String(date.getMonth()+1).padStart(2,'0'),String(date.getDate()).padStart(2,'0')].join('-');
const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
function grade(selected,answer){return selected.length===answer.length&&selected.every(x=>answer.includes(x));}
function schedule(previous,correct,now=Date.now()){
 const p=previous||{};
 const repetitions=correct?(p.repetitions||0)+1:0;
 const interval=correct?[1,3,7,14,30,60][Math.min(repetitions-1,5)]:0;
 return {repetitions,interval,due:now+(correct?interval*DAY:10*60000),attempts:(p.attempts||0)+1,correct:(p.correct||0)+(correct?1:0)};
}
function chooseTerms(terms,records,limit=10,now=Date.now()){
 const rank=t=>!records[t.id]?1:records[t.id].due<=now?0:2;
 return shuffle(terms).sort((a,b)=>rank(a)-rank(b)).slice(0,limit);
}
function makeQuestion(term,all,kind='single'){
 if(kind==='typing')return {type:'typing',prompt:'Write the Spanish for',hint:term.en,term,answerText:term.es,explanation:term.example||term.en};
 const candidates=all.filter(t=>t.id!==term.id&&t.en!==term.en);
 const related=candidates.filter(t=>t.category===term.category&&(kind!=='picture'||t.image));
 const peers=related.length>=3?related:candidates;
 const distractors=shuffle(peers).filter((t,i,a)=>a.findIndex(x=>x.en===t.en)===i).slice(0,3);
 const picture=kind==='picture'&&term.image;
 let options=shuffle([term,...distractors]).map(t=>picture?t.es:t.en);
 return {type:kind==='picture'&&term.image?'picture':kind==='listening'?'listening':'single',prompt:kind==='listening'?'Listen. What does it mean?':kind==='picture'&&term.image?'Which Spanish word matches?':'What does this mean?',hint:term.es,options,answer:[options.indexOf(picture?term.es:term.en)],term,explanation:term.es+' = '+term.en+(term.example?' · '+term.example:'')};
}
function makeMulti(terms){
 const target=shuffle(['Verbs','Expressions','Words'].filter(c=>terms.filter(t=>t.category===c).length>=2&&terms.filter(t=>t.category!==c).length>=2))[0];
 if(!target)return null;
 const yes=shuffle(terms.filter(t=>t.category===target)).slice(0,2),no=shuffle(terms.filter(t=>t.category!==target)).slice(0,2);
 const choices=shuffle([...yes,...no]);
 return {type:'multi',prompt:'Select all the '+target.toLowerCase()+'.',hint:'Select every matching entry.',options:choices.map(t=>t.es),answer:choices.map((t,i)=>t.category===target?i:-1).filter(i=>i>=0),explanation:yes.map(t=>t.es+' = '+t.en).join(' · ')};
}
function streak(days,today=dayKey()){
 const d=new Date(today+'T12:00:00');let count=0;
 if(!days[dayKey(d)])d.setDate(d.getDate()-1);
 while(days[dayKey(d)]){count++;d.setDate(d.getDate()-1);}
 return count;
}
function validateProgress(p,ids){
 if(!p||p.version!==1||typeof p.records!=='object'||!p.records||typeof p.days!=='object'||!p.days||!Array.isArray(p.favorites)||!Number.isFinite(p.xp)||p.xp<0)throw Error('Invalid progress file');
 const out={version:1,records:{},days:{},favorites:p.favorites.filter(x=>ids.has(x)),xp:Math.floor(p.xp),goal:[5,10,20].includes(p.goal)?p.goal:10};
 for(const [id,r] of Object.entries(p.records)){if(!ids.has(id))continue;if(!r||!['repetitions','interval','due','attempts','correct'].every(k=>Number.isFinite(r[k])&&r[k]>=0)||r.correct>r.attempts)throw Error('Invalid review record');out.records[id]=r;}
 for(const [d,n] of Object.entries(p.days)){if(!/^\d{4}-\d{2}-\d{2}$/.test(d)||!Number.isInteger(n)||n<0)throw Error('Invalid study history');out.days[d]=n;}
 return out;
}
root.DaleCore={normalize,dayKey,shuffle,grade,schedule,chooseTerms,makeQuestion,makeMulti,streak,validateProgress};
})(typeof window!=='undefined'?window:globalThis);
