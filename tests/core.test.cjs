const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
const ctx={};vm.createContext(ctx);
vm.runInContext(fs.readFileSync('core.js','utf8'),ctx);
vm.runInContext(fs.readFileSync('data.js','utf8').replace('window.DALE_DATA','globalThis.DATA'),ctx);
const C=ctx.DaleCore,D=ctx.DATA;
assert.equal(D.terms.length,178);
assert.equal(new Set(D.terms.map(t=>t.id)).size,178);
assert.equal(D.terms.filter(t=>t.origin==='glossary').length,160);
assert.equal(D.sources.length,7);
for(const t of D.terms){assert.ok(t.es&&t.en);for(const s of t.sources)assert.ok(D.sources.some(x=>x.id===s));if(t.image)assert.ok(fs.existsSync('assets/'+t.image+'.svg'));}
assert.ok(C.grade([0,2],[2,0]));assert.ok(!C.grade([0],[0,2]));assert.ok(!C.grade([0,1,2],[0,2]));
assert.equal(C.normalize('  ¿Dónde   está? '),'dónde está');
assert.notEqual(C.normalize('si'),C.normalize('sí'));
let r=C.schedule(null,true,0);assert.equal(r.interval,1);assert.equal(r.due,86400000);
r=C.schedule(r,true,0);assert.equal(r.interval,3);
r=C.schedule(r,false,1000);assert.equal(r.repetitions,0);assert.equal(r.due,601000);assert.equal(r.attempts,3);
assert.equal(C.streak({'2026-11-21':5,'2026-11-22':5},'2026-11-23'),2);
assert.equal(C.streak({'2026-11-20':5},'2026-11-23'),0);
const chosen=C.chooseTerms(D.terms,{'g-1':{due:0},'g-2':{due:99999999}},2,100);
assert.equal(chosen[0].id,'g-1');
for(let i=0;i<100;i++){const q=C.makeQuestion(D.terms[i],D.terms);assert.equal(new Set(q.options).size,4);assert.equal(q.options[q.answer[0]],D.terms[i].en);const m=C.makeMulti(D.terms);assert.equal(m.answer.length,2);assert.equal(m.options.length,4);}
const ids=new Set(D.terms.map(t=>t.id));const good={version:1,records:{},days:{'2026-11-23':5},favorites:['g-1','deleted'],xp:50,goal:10};
assert.equal(C.validateProgress(good,ids).favorites.length,1);
assert.throws(()=>C.validateProgress({...good,xp:-1},ids));
assert.throws(()=>C.validateProgress({...good,records:{'g-1':{due:NaN}}},ids));
for(const l of D.lessons)for(const q of l.questions){assert.ok(q.answer.length);q.answer.forEach(i=>assert.ok(q.options[i]));}
console.log('All curriculum, quiz, review scheduling, streak and backup tests passed.');
