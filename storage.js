(function(root,factory){const api=factory(typeof module==='object'&&module.exports?require('./advanced.js'):root.Geo);if(typeof module==='object'&&module.exports)module.exports=api;else root.GeoStore=api;})(globalThis,function(Geo){
  'use strict';
  const KEY='geochemical-isotope-calculator-v1';
  const uid=()=>globalThis.crypto?.randomUUID?.()||`g-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  const now=()=>new Date().toISOString();
  function task(module='temperature', title='Neue Aufgabe', inputs){return {id:uid(),title,module,inputs:{...Geo.modules[module].defaults,...inputs},status:'open',text:'',notes:'',calculated:false,updatedAt:now()};}
  function project(name='Neues Projekt'){return {id:uid(),name,description:'',tasks:[],createdAt:now(),updatedAt:now()};}
  function seed(){
    const p=project('Isotopen · Übungsatelier');p.description='Dokumentierte Beispiele zum Ausprobieren. Eigene Aufgaben mit „Neue Aufgabe“ anlegen.';
    const titles={temperature:'Eisvolumen & Abkühlung',mixing:'Zwei Kohlenstoffquellen',fractionation:'Fraktionierungsfaktor A/B',thermometer:'Calcit im Gleichgewicht',ice:'Eis aus dem Ozean',sea:'Landeis & Meeresspiegel',rayleigh:'Ein offenes Reservoir',standards:'Zwei Sauerstoffskalen'};
    for(const id of ['temperature','mixing','fractionation','ice','sea','rayleigh','standards','thermometer']){const t=task(id,titles[id],Geo.modules[id].example);t.calculated=true;t.notes='Beispielaufgabe; keine Original-Assignment-Datei.';p.tasks.push(t);}
    p.tasks[0].text='Calculate the deep-water cooling from a benthic δ¹⁸O increase of 1.66 ‰, assuming an ice-volume contribution of 1.0 ‰ and a sensitivity of 0.25 ‰ per °C cooling.';
    return {schema:'geochemical-isotope-calculator',schemaVersion:1,engineVersion:Geo.VERSION,revision:0,projects:[p,assignmentProject()],activeProject:p.id,activeTask:p.tasks[0].id,exportedAt:null};
  }
  function assignmentProject(){
    const p=project('Assignment 3 · Diagenese');p.description='Lehrdaten aus Assignment 3: Fluidkontakt, Zementbildung und Brachiopoden-Screening. Alle Modellannahmen bleiben editierbar.';
    const cases=[['exchange','Wie viel Wasser für einen O-Reset?',{...Geo.modules.exchange.example,target:'reset',reset:'0.5'}],['exchangePair','Probe 1: Aus O das C-Signal vorhersagen',Geo.modules.exchangePair.example],['exchangePair','Probe 2: Aus C das O-Signal vorhersagen',{...Geo.modules.exchangePair.example,target:'carbon',measured:'1'}],['scenarios','Drei Fluide und der Ölzutritt',Geo.modules.scenarios.example],['screening','Acht Brachiopoden: Screening und Bias',Geo.modules.screening.example]];
    for(const [id,title,inputs]of cases){const t=task(id,title,inputs);t.calculated=true;t.status='progress';t.notes='Aufgabenspezifische Lehrdaten, kein universelles Naturmodell. Originaldokumente werden nicht hochgeladen.';p.tasks.push(t);}return p;
  }
  function validateImport(data){
    if(!data||typeof data!=='object'||data.schema!=='geochemical-isotope-calculator'||data.schemaVersion!==1||!Array.isArray(data.projects))throw new Error('Keine gültige Projektsicherung (Schema-Version 1 erwartet).');
    if(data.projects.length>500)throw new Error('Maximal 500 Projekte je Import.');
    let count=0;const ids=new Set();
    const string=(v,max,label)=>{if(typeof v!=='string'||v.length>max)throw new Error(`${label}: Text fehlt oder ist zu lang.`);return v;};
    const projects=data.projects.map(p=>{
      const fresh=project(string(p.name,200,'Projektname'));fresh.description=string(p.description||'',5000,'Projektbeschreibung');
      if(!Array.isArray(p.tasks))throw new Error('Aufgabenliste fehlt.');
      fresh.tasks=p.tasks.map(t=>{
        if(++count>5000)throw new Error('Maximal 5000 Aufgaben je Import.');
        if(!Object.hasOwn(Geo.modules,t.module))throw new Error('Unbekannte Berechnungsmethode im Import.');
        const clean=task(t.module,string(t.title,300,'Aufgabentitel'));
        clean.text=string(t.text||'',100000,'Aufgabentext');clean.notes=string(t.notes||'',20000,'Notizen');
        if(!t.inputs||typeof t.inputs!=='object'||Array.isArray(t.inputs))throw new Error('Ungültige Eingabedaten.');
        for(const f of Geo.modules[t.module].fields){if(Object.hasOwn(t.inputs,f.key)){const value=t.inputs[f.key];if(!['string','number'].includes(typeof value)||String(value).length>(f.type==='text'?100000:300))throw new Error('Ungültiger Parameterwert.');clean.inputs[f.key]=String(value);}}
        clean.calculated=t.calculated===true;clean.status=['open','progress','done'].includes(t.status)?t.status:'open';
        if(clean.calculated){try{Geo.calculate(clean.module,clean.inputs);}catch{clean.calculated=false;clean.status='open';}}
        if(clean.status==='done'&&!clean.calculated)clean.status='open';
        // IDs are intentionally regenerated: import is additive and never overwrites local work.
        ids.add(clean.id);return clean;
      });return fresh;
    });
    return projects;
  }
  let db=null,backend='memory',queue=Promise.resolve();
  function request(req){return new Promise((resolve,reject)=>{req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});}
  async function init(){
    try{
      db=await new Promise((resolve,reject)=>{const req=indexedDB.open(KEY,1);req.onupgradeneeded=()=>req.result.createObjectStore('state');req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);req.onblocked=()=>reject(new Error('Datenbank blockiert'));});
      db.onversionchange=()=>db.close();backend='indexeddb';
      const saved=await request(db.transaction('state').objectStore('state').get('workspace'));
      if(saved)return {data:saved,backend};
    }catch{db=null;}
    try{const raw=localStorage.getItem(KEY);if(raw){if(!db)backend='localStorage';return {data:JSON.parse(raw),backend};}if(!db){localStorage.setItem(KEY+'-probe','1');localStorage.removeItem(KEY+'-probe');backend='localStorage';}}catch{}
    return {data:null,backend};
  }
  function save(data){
    const snapshot=JSON.parse(JSON.stringify(data));
    const job=async()=>{
      if(db){
        await new Promise((resolve,reject)=>{const tx=db.transaction('state','readwrite');tx.objectStore('state').put(snapshot,'workspace');tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||new Error('Speicherung abgebrochen'));});
        backend='indexeddb';
        try{localStorage.setItem(KEY,JSON.stringify(snapshot));}catch{}
        return backend;
      }
      if(backend==='localStorage'){localStorage.setItem(KEY,JSON.stringify(snapshot));return backend;}
      throw new Error('Der Browser erlaubt keine dauerhafte Speicherung. Bitte JSON-Sicherung herunterladen.');
    };
    queue=queue.catch(()=>{}).then(job);return queue;
  }
  return {KEY,uid,task,project,seed,assignmentProject,validateImport,init,save};
});
