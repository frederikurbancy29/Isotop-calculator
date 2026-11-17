const {test}=require('node:test');
const assert=require('node:assert/strict');
const G=require('../advanced.js'),P=require('../parser.js'),S=require('../storage.js'),E=require('../exports.js');
const close=(a,b,t=1e-9)=>assert.ok(Math.abs(a-b)<=t*Math.max(1,Math.abs(b)),`${a} != ${b}`);
const calc=(id,overrides={})=>G.calculate(id,{...G.modules[id].example,...overrides});
const value=(r,key)=>r.outputs.find(o=>o.key===key)?.value;
test('All 14 methods belong to a thematic group, have use cases, formulas and sources',()=>{
  assert.equal(Object.keys(G.modules).length,14);
  for(const [id,m]of Object.entries(G.modules)){assert.ok(G.groups.includes(m.category),id);assert.ok(m.useCases.length&&m.equations.length);assert.ok(m.sourceIds.every(s=>G.sources[s]?.url));assert.equal(calc(id).version,'2.0.0');}
});
test('Delta definition: relative and absolute ratios, both directions and physical limits',()=>{
  close(calc('delta').outputs[0].value,.975);
  close(calc('delta',{mode:'delta',relative:.975}).outputs[0].value,-25);
  close(calc('delta',{mode:'absolute',reference:.01}).outputs[0].value,.00975);
  close(calc('delta',{mode:'fromAbsolute',ratio:.00975,reference:.01}).outputs[0].value,-25);
  for(const o of [{delta:-1000},{mode:'delta',relative:0},{mode:'absolute',reference:0},{system:'unknown'}])assert.throws(()=>calc('delta',o),G.InputError);
});
test('Open exchange: independent 50 and 95 percent reset, N=0 and element contrast',()=>{
  const oxygen=calc('exchange',{target:'reset',reset:.5});close(value(oxygen,'ratio'),Math.log(2)/1.85);close(value(oxygen,'reset'),50);
  close(calc('exchange',{ratio:0}).outputs[0].value,0);
  const carbon=calc('exchange',{target:'reset',reset:.95,initial:4,equilibrium:-10,waterConcentration:60.1,rockConcentration:120000});
  close(value(carbon,'ratio'),-Math.log(.05)*120000/60.1);close(carbon.outputs.at(-1).value,-9.3);
  assert.ok(value(carbon,'ratio')>5900);
});
test('Exchange inverse: measured O=-7 gives N=1.6034366; invalid endpoints do not yield a finite N',()=>{
  close(value(calc('exchange',{target:'ratio',measured:-7}),'ratio'),1.6034365755794244);
  for(const measured of [-7.38,-8,1])assert.throws(()=>calc('exchange',{target:'ratio',measured}),G.InputError);
  for(const o of [{ratio:-1},{waterConcentration:0},{rockConcentration:-1},{target:'reset',reset:1},{target:'reset',reset:-.1},{target:'ratio',initial:-7.38,measured:-7.38}])assert.throws(()=>calc('exchange',o),G.InputError);
});
test('Assignment 3 paired model: same N but independent C and O capacities',()=>{
  const a=calc('exchangePair');close(value(a,'ratio'),1.6034365755794244);close(value(a,'oxygen'),-7);close(value(a,'carbon'),3.988761750121846);
  const b=calc('exchangePair',{target:'carbon',measured:1});close(value(b,'ratio'),-Math.log(11/14)*120000/60.1);close(value(b,'carbon'),1);close(value(b,'oxygen'),-7.38);
  const zero=calc('exchangePair',{target:'ratio',ratio:0});close(value(zero,'oxygen'),0);close(value(zero,'carbon'),4);
});
test('Calcite thermometry inversions preserve standards and 25 degree equilibrium',()=>{
  const common={scaleC:'VPDB',scaleW:'VSMOW',convention:'current',calibration:'KO97',temperature:25};
  const alpha=Math.exp(18.03/298.15-.03242),expected=((1000-5)*alpha-1000-30.92)/1.03092;
  const c=calc('thermometer',{...common,target:'calcite',water:-5});close(value(c,'calcite'),expected);
  close(value(calc('thermometer',{...common,target:'water',calcite:expected}),'water'),-5);
  close(value(calc('thermometer',{...common,target:'temperature',water:-5,calcite:expected}),'temperature'),25);
  for(const o of [{calibration:''},{target:'water',temperature:-273.15},{target:'calcite',temperature:-274}])assert.throws(()=>calc('thermometer',o),G.InputError);
});
test('Burial model solves all three directions with dimensions and zero-depth constraints',()=>{
  close(calc('burial').outputs[0].value,2);
  close(calc('burial',{target:'temperature',depth:2}).outputs[0].value,75);
  close(calc('burial',{target:'gradient',depth:2}).outputs[0].value,30);
  for(const o of [{gradient:0},{temperature:10},{target:'gradient',depth:0},{target:'temperature',depth:-1}])assert.throws(()=>calc('burial',o),G.InputError);
});
test('Assignment 3 three fluid hypotheses give distinct temperatures, depths and conditional oil timing',()=>{
  const r=calc('scenarios'),rows=r.tables[0].rows;assert.equal(rows.length,3);
  close(rows[0][4],49.73718902268649);close(rows[0][5],1.1579063007562165);
  close(rows[2][4],88.52131203635537);close(rows[2][5],2.4507104012118455);
  assert.deepEqual(rows.map(row=>row[6]),['vor Ölzutritt','vor Ölzutritt','nach Ölzutritt']);
  assert.ok(r.warnings.some(w=>w.includes('Extrapolation')));
  assert.throws(()=>calc('scenarios',{data:'name;water\na;-1\na;2'}));
});
test('Assignment 3 screening retains B1/B2/B3/B5 and computes bias from mean delta',()=>{
  const r=calc('screening'),table=r.tables[0].rows;
  assert.deepEqual(table.filter(row=>row[1]==='ja').map(row=>row[0]),['B1','B2','B3','B5']);
  close(r.outputs.find(o=>o.label==='Mittel δ¹⁸O (alle)').value,-5.9875);
  close(r.outputs.find(o=>o.label==='Mittel δ¹⁸O (gescreent)').value,-4.725);
  const independentT=d=>18030/(1000*Math.log((1000+1.03092*d+30.92)/999)+32.42)-273.15;
  close(value(r,'bias'),independentT(-5.9875)-independentT(-4.725));
  assert.ok(table.find(row=>row[0]==='B7')[2].includes('Fasern'));
});
test('Strict screening rejects equality; missing and constant samples omit undefined statistics',()=>{
  const row='id;fabric;cl;Sr;Mn;Fe;d18O;d13C\nX;preserved fibres;non-luminescent;700;100;300;-4.6;2.1';
  const none=calc('screening',{data:row});close(value(none,'retained'),0);assert.equal(value(none,'bias'),undefined);assert.ok(none.warnings.some(w=>w.includes('Keine Probe')));
  const one=calc('screening',{data:row,srMin:699,mnMax:101,feMax:301});close(value(one,'retained'),1);close(value(one,'bias'),0);assert.ok(!one.outputs.some(o=>o.label.includes('Pearson')));
  assert.equal(G.statistics([{o:1,c:1},{o:1,c:2}]).r,null);
  close(G.statistics([{o:1,c:2},{o:2,c:4},{o:3,c:6}]).r,1);
  assert.throws(()=>calc('screening',{data:row.replace('preserved fibres','unknown fabric')}));
});
test('Delimited input accepts decimal commas, tabs and quoted text; refuses corrupt data',()=>{
  assert.equal(G.parseDelimited('name;water\n"Water; A";"-1,5"')[0].name,'Water; A');
  close(calc('scenarios',{data:'name\twater\nTest\t-1,5'}).tables[0].rows[0][1],-1.5);
  for(const data of ['', 'name;water\nA', 'name;name\nA;B', 'name;water\n"A;-1'])assert.throws(()=>G.parseDelimited(data),G.InputError);
  for(const data of ['name;water\nA;not a number','name;water\nA;-1000'])assert.throws(()=>calc('scenarios',{data}),G.InputError);
});
test('New text recognition is conservative, converts reset percent and lists missing tables/calibration',()=>{
  const a=P.analyze('Wasser-Gestein: δ0 = 0 ‰; δeq = -7,38 ‰; Cw = 888000; Cr = 480000; Reset-Anteil = 50 %.');
  assert.equal(a.module,'exchange');close(Number(a.suggestions.find(s=>s.key==='reset').value),.5);assert.equal(a.suggestions.find(s=>s.key==='target').value,'reset');
  const b=P.analyze('Geothermischer Gradient = 30; Oberflächentemperatur = 288.15 K; Bildungstemperatur = 75 °C.');assert.equal(b.module,'burial');close(Number(b.suggestions.find(s=>s.key==='surface').value),15);
  const s=P.analyze('Brachiopoden Screening.');assert.equal(s.module,'screening');assert.ok(s.missing.includes('Schalendaten als Tabelle'));assert.ok(s.missing.includes('Kalibrierung bestätigen'));
});
test('Assignment 3 tables survive JSON import and appear as numeric cells in all report formats',()=>{
  const p=S.assignmentProject(),copy=S.validateImport(JSON.parse(E.json([p])))[0];assert.equal(copy.tasks.length,5);assert.ok(copy.tasks.every(t=>t.calculated));
  const rows=E.rows([p]);assert.ok(rows.some(row=>row[3]==='Einzelprüfung der Proben'&&row[5]==='B7'));
  assert.ok(rows.some(row=>row[4]==='Zeile 1 · Sr (ppm)'&&row[5]===1150));
  assert.ok(E.csv([p]).includes('Einzelprüfung der Proben'));assert.ok(new TextDecoder().decode(E.xlsx([p])).includes('<v>1150</v>'));
  assert.ok(E.report([p]).includes('Fluidhypothesen und Reservoirdeutung'));assert.ok(E.report([p]).includes('Alle Kriterien erfüllt'));
});
