const {test}=require('node:test');
const assert=require('node:assert/strict');
const G=require('../advanced.js');
const P=require('../parser.js');
const S=require('../storage.js');
const E=require('../exports.js');
function close(actual,expected,tol=1e-10){assert.ok(Math.abs(actual-expected)<=tol*Math.max(1,Math.abs(expected)),`${actual} != ${expected}`);}
const output=(id,v,i=0)=>G.calculate(id,v).outputs[i].value;
test('Number parsing: German/English, signs, exponent, blanks, invalid units',()=>{
  close(G.parseNumber('−2,5'),-2.5);close(G.parseNumber('1.4e21'),1.4e21);close(G.parseNumber('.5'),.5);assert.equal(G.parseNumber('', '',true),null);
  for(const x of ['', '1,2.3','Infinity','NaN','10 kg','30%','1 000',{},true])assert.throws(()=>G.parseNumber(x),G.InputError);
});
test('Every supplied example computes finite outputs and documents assumptions',()=>{for(const [id,m]of Object.entries(G.modules)){const r=G.calculate(id,m.example);assert.ok(r.steps.length);assert.ok(r.warnings.length);assert.ok(r.sources.length);assert.ok(r.outputs.every(o=>Number.isFinite(o.value)));}});
test('Carbon mixing and all inverse directions return independent hand values',()=>{
  close(output('mixing',{a:-25,b:-5,fraction:.3}),-11);
  close(output('mixing',{target:'fraction',a:-25,b:-5,mix:-11}),.3);
  close(output('mixing',{target:'a',b:-5,mix:-11,fraction:.3}),-25);
  close(output('mixing',{target:'b',a:-25,mix:-11,fraction:.3}),-5);
  close(output('mixing',{a:-25,b:-5,fraction:0}),-5);close(output('mixing',{a:-25,b:-5,fraction:1}),-25);
});
test('Concentrations alter isotope contribution; inverse recovers material share',()=>{
  close(output('mixing',{a:-25,b:-5,fraction:.5,weighting:'bulk',ca:2,cb:1}),-55/3);
  close(output('mixing',{target:'fraction',a:-25,b:-5,mix:-55/3,weighting:'bulk',ca:2,cb:1}),.5);
});
test('Mixing rejects identical endmembers, extrapolation, missing concentration and singular inversions',()=>{
  for(const v of [{target:'fraction',a:5,b:5,mix:5},{target:'fraction',a:-25,b:-5,mix:10},{target:'a',b:0,mix:1,fraction:0},{target:'b',a:0,mix:1,fraction:1},{a:0,b:2,fraction:.5,weighting:'bulk'},{a:-1000,b:0,fraction:.5},{a:0,b:2,fraction:1.1}])assert.throws(()=>G.calculate('mixing',v),G.InputError);
});
test('Alpha, epsilon, logarithmic epsilon and Delta are kept distinct',()=>{
  const r=G.calculate('fractionation',{a:-5,b:-25});close(r.outputs[0].value,995/975);close(r.outputs.find(o=>o.key==='epsilon').value,20.5128205128205);close(r.outputs.find(o=>o.key==='log').value,20.3052661607455);close(r.outputs[1].value,20);
  close(output('fractionation',{mode:'epsilon',value:10}),1.01);close(output('fractionation',{mode:'log',value:1000*Math.log(1.01)}),1.01);
  assert.throws(()=>G.calculate('fractionation',{mode:'alpha',value:0}));assert.throws(()=>G.calculate('fractionation',{mode:'epsilon',value:-1000}));
});
test('Oxygen delta pairs convert to one standard before alpha; identical material gives 1',()=>{
  close(output('fractionation',{isotope:'O18',mode:'deltas',a:0,b:30.92,scaleA:'VPDB',scaleB:'VSMOW',convention:'current'}),1);
});
test('Prior-chat example gives 2.64 degrees cooling and correct optional absolute T',()=>{
  close(output('temperature',{observed:'1,66',ice:'1,0',sensitivity:'0,25'}),-2.64);
  close(G.calculate('temperature',{observed:1.66,ice:1,sensitivity:.25,initialT:10}).outputs[2].value,7.36);
  close(output('temperature',{observed:-1,ice:0,sensitivity:.25}),4);
  assert.throws(()=>G.calculate('temperature',{observed:1,ice:0,sensitivity:0}));assert.throws(()=>G.calculate('temperature',{observed:1,ice:0,sensitivity:-.25}));
});
test('Calcite thermometer recovers prescribed 25 °C via independent forward relation',()=>{
  const alpha=Math.exp(18.03/298.15-.03242),deltaC=1000*(alpha-1),vpdb=(deltaC-30.92)/1.03092;
  close(output('thermometer',{calcite:vpdb,scaleC:'VPDB',water:0,scaleW:'VSMOW',convention:'current',calibration:'KO97'}),25);
  assert.throws(()=>G.calculate('thermometer',{calcite:vpdb,scaleC:'VPDB',water:0,scaleW:'VSMOW',convention:'current'}));
});
test('Ice fraction conserves starting mass and linear isotope inventory',()=>{
  const r=G.calculate('ice',{initial:0,final:1,iceDelta:-40,mass:4100});close(r.outputs[1].value,1/41);close(r.outputs[2].value,100);close(r.outputs[3].value,4000);close(4000*1+100*(-40),0);
  close(output('ice',{initial:0,final:0,iceDelta:-40}),0);
  assert.throws(()=>G.calculate('ice',{initial:0,final:-1,iceDelta:-40}));assert.throws(()=>G.calculate('ice',{initial:0,final:1,iceDelta:1}));
});
test('Sea-level volume handles km to m, density and direction; coefficient is explicit',()=>{
  close(output('sea',{volume:361000000,rhoIce:1000,rhoWater:1000,area:361000000}),1000);
  close(output('sea',{process:'growth',volume:1000000,rhoIce:917,rhoWater:1000,area:361000000}),-2.54016620498615);
  close(output('sea',{mode:'isotope',waterChange:1,coefficient:120}),-120);
  assert.throws(()=>G.calculate('sea',{mode:'isotope',waterChange:1}));
});
test('Rayleigh: exact powers, pooled balance, alpha orientation, boundaries',()=>{
  const r=G.calculate('rayleigh',{initial:0,alpha:1.01,remaining:.5});close(r.outputs[0].value,-6.90750456296407);close(r.outputs[1].value,3.02342039140635);close(r.outputs[2].value,6.90750456296407);close(.5*r.outputs[0].value+.5*r.outputs[2].value,0);
  const zero=G.calculate('rayleigh',{initial:-10,alpha:1,remaining:.2});for(const o of zero.outputs)close(o.value,-10);
  const f1=G.calculate('rayleigh',{initial:0,alpha:1.01,remaining:1});assert.equal(f1.outputs.length,2);close(f1.outputs[0].value,0);
  for(const f of [0,-.1,1.1])assert.throws(()=>G.calculate('rayleigh',{initial:0,alpha:1.01,remaining:f}));
});
test('Standards: modern and legacy, exact inverse roundtrips, isotope guard',()=>{
  close(output('standards',{isotope:'O18',delta:0,from:'VPDB',convention:'current'}),30.92);
  close(output('standards',{isotope:'O18',delta:0,from:'VPDB',convention:'legacy'}),30.91);
  for(const c of ['current','legacy'])for(const d of [-100,-30,-2,0,50])close(G.convert(G.convert(d,'VPDB','VSMOW',c),'VSMOW','VPDB',c),d);
  assert.throws(()=>G.calculate('standards',{isotope:'C13',delta:0,from:'VPDB'}));
});
test('Prior-chat English text proposes exactly observed, ice and sensitivity',()=>{
  const a=P.analyze('Calculate the deep-water cooling from a benthic δ¹⁸O increase of 1.66 ‰, assuming an ice-volume contribution of 1.0 ‰ and a sensitivity of 0.25 ‰ per °C cooling.');
  assert.equal(a.module,'temperature');assert.deepEqual(Object.fromEntries(a.suggestions.map(s=>[s.key,s.value])),{observed:'1.66',ice:'1',sensitivity:'0.25'});assert.equal(a.missing.length,0);
});
test('Rule parser handles decimal comma, percent, negative shifts; never fills missing sensitivity',()=>{
  const mix=P.analyze('Mischung: δA = −25 ‰; δB = −5 ‰; fA = 30 %.');assert.equal(mix.module,'mixing');close(Number(mix.suggestions.find(s=>s.key==='fraction').value),.3);
  const t=P.analyze('Calculate cooling: δ18O decrease of 1.66 ‰; ice-volume contribution of 1.0 ‰.');assert.equal(t.suggestions.find(s=>s.key==='observed').value,'-1.66');assert.ok(t.missing.some(s=>s.includes('Sensitivität')));
});
test('Rule parser rejects conflicting values and clear unit mismatches',()=>{
  const a=P.analyze('Mischung: δA = -25 ‰; δA = -20 ‰; δB = -5 ‰; fA = 0.3;');assert.ok(!a.suggestions.some(s=>s.key==='a'));assert.ok(a.messages.some(s=>s.includes('mehrere')));
  const b=P.analyze('Mischung: δA = 25 %; δB = 2 °C; fA = 0.3;');assert.ok(!b.suggestions.some(s=>s.key==='a'||s.key==='b'));
  assert.equal(P.analyze('Homework 18, page 3.').module,null);
});
test('JSON import validates schema, copies IDs, recomputes validity, rejects unsupported and oversized input',()=>{
  const seed=S.seed(),projects=S.validateImport(JSON.parse(E.json(seed.projects)));assert.equal(projects[0].tasks.length,8);assert.notEqual(projects[0].id,seed.projects[0].id);assert.notEqual(projects[0].tasks[0].id,seed.projects[0].tasks[0].id);
  seed.projects[0].tasks[0].inputs.sensitivity='0';seed.projects[0].tasks[0].status='done';const invalid=S.validateImport(seed);assert.equal(invalid[0].tasks[0].calculated,false);assert.equal(invalid[0].tasks[0].status,'open');
  assert.throws(()=>S.validateImport({projects:[]}));seed.projects[0].tasks[0].module='__proto__';assert.throws(()=>S.validateImport(seed));
});
test('CSV formula injection guarded; XLSX stores text as inline strings, numbers as numbers; report escapes HTML',()=>{
  const data=S.seed().projects;data[0].name='=1+1';data[0].tasks[0].title='<img src=x onerror=alert(1)>';
  assert.ok(E.csv(data).includes('"\'=1+1"'));const bytes=E.xlsx(data);assert.equal(new DataView(bytes.buffer).getUint32(0,true),0x04034b50);const xml=new TextDecoder().decode(bytes);assert.ok(xml.includes('t="inlineStr"'));assert.ok(xml.includes('<v>-11</v>'));assert.ok(!E.report(data).includes('<img src=x'));
});
