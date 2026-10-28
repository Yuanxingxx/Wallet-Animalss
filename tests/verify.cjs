const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..', 'miniprogram');
const content = require(path.join(root,'data/content'));
const {calculateResult} = require(path.join(root,'utils/score'));
assert.equal(content.questions.length,8);
content.questions.forEach((q,i)=>{assert.equal(q.id,i+1);assert.deepEqual(q.options.map(o=>o.key),['A','B','C','D']);});
const types=['joy','value','quality','explore'];
for(let i=0;i<4;i++)assert.equal(calculateResult(Array(8).fill('ABCD'[i])).primaryType,types[i]);
for(const value of [null,[],new Array(8),'AAAAAAAA',Array(8).fill('X'),Array(8).fill(null),['A','A','A','A','A','A','A',{}]])assert.throws(()=>calculateResult(value));
assert.equal(calculateResult('AABBCCDD'.split('')).primaryType,'explore');
assert.equal(calculateResult('AABBABCD'.split('')).primaryType,'value');
for(let n=0;n<65536;n++){
  let value=n;const answers=[];
  for(let i=0;i<8;i++){answers.push('ABCD'[value%4]);value=Math.floor(value/4);}
  const r=calculateResult(answers);
  const counts=types.map((_,i)=>answers.filter(x=>x==='ABCD'[i]).length);
  assert.deepEqual(types.map(t=>r.scores[t]),counts);
  const candidates=types.filter((_,i)=>counts[i]===Math.max(...counts));
  const expected=answers.slice().reverse().map(x=>types['ABCD'.indexOf(x)]).find(t=>candidates.includes(t));
  assert.equal(r.primaryType,expected);
  assert.equal(r.isTie,candidates.length>1);
  assert.deepEqual(r.tiedTypes,candidates);
  assert.equal(Boolean(r.tieNote),r.isTie);
  assert.ok(content.results[r.primaryType].description);
}
// Execute real page modules with only platform navigation and setData mocked.
let app;
vm.runInNewContext(fs.readFileSync(path.join(root,'app.js'),'utf8'),{App:v=>app=v});
let navigation=[],fail=false;
const xhs={};
for(const method of ['navigateTo','redirectTo'])xhs[method]=options=>{navigation.push({method,url:options.url});if(fail)options.fail();};
function page(name){let instance;const folder=path.join(root,'pages',name);
  vm.runInNewContext(fs.readFileSync(path.join(folder,name+'.js'),'utf8'),{
    Page:p=>instance=p,getApp:()=>app,xhs,
    require:relative=>require(path.resolve(folder,relative))
  });
  instance.setData=function(value){Object.assign(this.data,value);};
  instance.data=JSON.parse(JSON.stringify(instance.data));
  return instance;
}
const home=page('home');home.onShow();home.start();home.start();assert.equal(navigation.length,1);assert.equal(app.globalData.answers.length,8);
home.onShow();fail=true;home.start();assert.equal(home.data.busy,false);assert.ok(home.data.error);fail=false;
const quiz=page('quiz');quiz.onLoad();quiz.next();assert.equal(quiz.data.index,0);assert.ok(quiz.data.error);
quiz.choose({currentTarget:{dataset:{key:'X'}}});assert.equal(quiz.data.selected,'');
quiz.choose({currentTarget:{dataset:{key:'A'}}});quiz.next();quiz.previous();assert.equal(quiz.data.selected,'A');
quiz.choose({currentTarget:{dataset:{key:'B'}}});assert.equal(app.globalData.answers[0],'B');
for(let i=0;i<8;i++){quiz.renderQuestion(i);quiz.choose({currentTarget:{dataset:{key:'ABCD'[i%4]}}});}
fail=true;quiz.next();assert.equal(quiz.data.busy,false);assert.ok(quiz.data.error);fail=false;
quiz.next();assert.equal(navigation.at(-1).url,'/pages/result/result');
assert.equal(app.globalData.result.primaryType,'explore');
const result=page('result');result.onLoad();assert.equal(result.data.info.name,'灵感探索狐');assert.equal(result.data.result.isTie,true);
fail=true;result.restart();assert.equal(result.data.busy,false);assert.ok(result.data.error);fail=false;
result.restart();assert.ok(app.globalData.answers.every(x=>x===null));assert.equal(app.globalData.result,null);
const empty=page('result');empty.onLoad();assert.equal(empty.data.missing,true);empty.restart();assert.equal(navigation.at(-1).url,'/pages/quiz/quiz');
const config=JSON.parse(fs.readFileSync(path.join(root,'app.json'),'utf8'));
for(const route of config.pages)for(const ext of ['js','json','xhsml','css'])assert.ok(fs.existsSync(path.join(root,route+'.'+ext)));
function walk(folder){for(const entry of fs.readdirSync(folder,{withFileTypes:true})){const p=path.join(folder,entry.name);if(entry.isDirectory())walk(p);else if(p.endsWith('.json'))JSON.parse(fs.readFileSync(p,'utf8'));else if(p.endsWith('.js')){new vm.Script(fs.readFileSync(p,'utf8'),{filename:p});}}}
walk(root);
console.log('PASS: all 65,536 answer combinations, invalid inputs, native page flows, retry behavior, file/config integrity.');
