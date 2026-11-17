/* Deliberately conservative rules, never a remote model or an arbitrary expression evaluator. */
(function(root,factory){const api=factory(typeof module==='object'&&module.exports?require('./advanced.js'):root.Geo);if(typeof module==='object'&&module.exports)module.exports=api;else root.GeoParser=api;})(globalThis,function(Geo){
  'use strict';
  const rules = {
    temperature: {
      observed: ['(?:benthic\\s+)?(?:δ\\s*18\\s*o|delta\\s*18\\s*o)(?:[- ]?(?:increase|change|shift|anstieg|änderung|abnahme|decrease))', 'observed', 'gesamtänderung', 'beobachtete[^=:\\n]{0,20}änderung'],
      ice: ['ice[- ]volume(?:\\s+(?:contribution|component|effect))?', 'eisvolumen(?:anteil|beitrag)', 'eisanteil', 'ice contribution'],
      sensitivity: ['(?:temperature\\s+)?sensitivity', '(?:temperatur)?sensitivität', 's'], initialT: ['initial temperature', 'anfangstemperatur', 't0']
    },
    mixing: {a:['δ\\s*(?:13\\s*c\\s*)?a','delta\\s*a','endglied\\s*a','endmember\\s*a'],b:['δ\\s*(?:13\\s*c\\s*)?b','delta\\s*b','endglied\\s*b','endmember\\s*b'],mix:['δ\\s*(?:13\\s*c\\s*)?mix','delta\\s*mix','mischung','mixture'],fraction:['f\\s*a','f','anteil\\s*a','fraction\\s*a'],ca:['c\\s*a','konzentration\\s*a','concentration\\s*a'],cb:['c\\s*b','konzentration\\s*b','concentration\\s*b']},
    fractionation: {a:['δ\\s*a','delta\\s*a'],b:['δ\\s*b','delta\\s*b'],value:['alpha','α','epsilon','ε','1000\\s*ln\\s*(?:alpha|α)']},
    thermometer: {calcite:['δ\\s*18\\s*o\\s*(?:calcite|calcit|c)','(?:calcite|calcit)[- ]?(?:δ\\s*18\\s*o|delta\\s*18\\s*o)'],water:['δ\\s*18\\s*o\\s*(?:water|wasser|w)','(?:water|wasser)[- ]?(?:δ\\s*18\\s*o|delta\\s*18\\s*o)']},
    ice: {initial:['δ\\s*0','delta\\s*0','initial\\s*(?:ocean\\s*)?(?:δ\\s*18\\s*o|delta)','ozean\\s*anfangs'],final:['δ\\s*1','delta\\s*1','final\\s*(?:ocean\\s*)?(?:δ\\s*18\\s*o|delta)','ozean\\s*danach'],iceDelta:['δ\\s*(?:ice|eis)','delta\\s*(?:ice|eis)','(?:ice|eis)[- ]?(?:δ\\s*18\\s*o|delta)'],mass:['m0','initial\\s*mass','anfängliche\\s*wassermasse']},
    sea: {volume:['landeisvolumen','ice\\s*volume','v\\s*(?:ice|eis)'],rhoIce:['eisdichte','rho\\s*(?:ice|eis)','ρ\\s*(?:ice|eis)'],rhoWater:['wasserdichte','rho\\s*(?:water|wasser)','ρ\\s*(?:water|wasser)'],area:['ozeanfläche','ocean\\s*area'],waterChange:['wasseränderung','water\\s*change','Δδ\\s*(?:water|wasser|w)'],coefficient:['coefficient','koeffizient','k']},
    rayleigh: {initial:['δ\\s*0','delta\\s*0','initial\\s*(?:δ|delta)','anfangswert'],alpha:['alpha','α'],remaining:['remaining(?:\\s*fraction)?','verbleibender\\s*anteil','f']},
    standards: {delta:['δ\\s*18\\s*o','delta\\s*18\\s*o','isotopenwert']},
    delta: {delta:['δ','delta'],relative:['r\\s*/\\s*rstandard','relative ratio','relatives verhältnis'],ratio:['absolute ratio','absolutes verhältnis'],reference:['rstandard','standard ratio']},
    burial: {surface:['surface temperature','oberflächentemperatur','t0'],temperature:['formation temperature','bildungstemperatur','temperatur am bildungsort'],gradient:['geothermal gradient','geothermischer gradient','gradient'],depth:['burial depth','versenkungstiefe','tiefe']},
    exchange: {initial:['δ0','delta0','primärwert'],equilibrium:['δeq','deltaeq','gleichgewichtswert'],waterConcentration:['cw','wasserkonzentration'],rockConcentration:['cr','gesteinskonzentration'],ratio:['wasser/gestein-verhältnis','water/rock ratio','n'],measured:['gemessener wert','measured delta'],reset:['reset fraction','reset-anteil']},
    screening: {srMin:['sr minimum','sr-untergrenze'],mnMax:['mn maximum','mn-obergrenze'],feMax:['fe maximum','fe-obergrenze'],water:['wasser-δ18o','water delta18o']}
  };
  function normalize(t){return t.normalize('NFKC').replace(/[−–]/g,'-').replace(/\r/g,'');}
  function detect(text){
    const t=normalize(text).toLowerCase();
    const scores=Object.fromEntries(Object.keys(Geo.modules).map(id=>[id,0]));
    if(/misch|mixt|endmember|endglied/.test(t))scores.mixing+=4;
    if(/δ\s*13\s*c/.test(t))scores.mixing+=1;
    if(/fraktionierung|fractionation|epsilon|ε|α|alpha/.test(t))scores.fractionation+=2;
    if(/cooling|abkühl|temperature change|temperaturänder|sensitivity|sensitivität/.test(t))scores.temperature+=6;
    if(/ice[- ]volume contribution|eisvolumenanteil/.test(t))scores.temperature+=2;
    if(/kim|o.neil|calcite.water|calcit.wasser|absolute temperatur/.test(t))scores.thermometer+=6;
    if(/ice.{0,12}mass|eis.{0,12}massenbilanz|eismassenbilanz/.test(t))scores.ice+=7;
    if(/sea[- ]?level|meeresspiegel|landeisvolumen/.test(t))scores.sea+=8;
    if(/rayleigh/.test(t))scores.rayleigh+=12;
    if(/vsmow/.test(t)&&/vpdb/.test(t)&&/convert|konver|umrechn|skalen/.test(t))scores.standards+=10;
    if(/wasser.gestein|water.rock|reset.anteil|δeq|deltaeq/.test(t))scores.exchange+=12;
    if(/gekoppelter? c.o|coupled c.o/.test(t))scores.exchangePair+=16;
    if(/geotherm|versenkungstiefe|burial depth/.test(t))scores.burial+=8;
    if(/fluidhypothesen|fluid.szenarien|fluid scenarios/.test(t))scores.scenarios+=14;
    if(/screening|brachiopod|schalenprüfung/.test(t))scores.screening+=16;
    if(/r\s*\/\s*rstandard|δ.notation|delta notation|isotopenverhältnis|isotope ratio/.test(t))scores.delta+=9;
    return Object.entries(scores).filter(([,s])=>s>0).sort((a,b)=>b[1]-a[1]).map(([id,score])=>({id,score,title:Geo.modules[id].title}));
  }
  function analyze(text, chosen){
    const t=normalize(text), candidates=detect(t), id=chosen||candidates[0]?.id;
    if(!id)return {module:null,candidates:[],suggestions:[],missing:[],messages:['Kein eindeutiger Aufgabentyp erkannt. Bitte Methode manuell wählen.']};
    const suggestions=[],messages=[],proposed={...Geo.modules[id].defaults};
    const add=(key,value,evidence,note='')=>{suggestions.push({key,value:String(value),evidence,note});proposed[key]=String(value);};
    const number='([+-]?(?:\\d+(?:[.,]\\d+)?|[.,]\\d+)(?:e[+-]?\\d+)?)';
    for(const [key,aliases] of Object.entries(rules[id]||{})){
      const re=new RegExp('(?<![\\p{L}\\p{N}])(?:'+aliases.join('|')+')(?:\\s*(?:=|:|of|von|is|ist|beträgt|um|by))?\\s*'+number+'\\s*(‰|per\\s*mil|permil|%|°c|k\\b|kg\\b|km\\s*3|km\\s*2|m\\s*/\\s*‰)?','giu');
      const hits=[...t.matchAll(re)];
      if(!hits.length)continue;
      const values=hits.map(h=>{
        let val=Geo.parseNumber(h[1]);
        if(['fraction','remaining','reset'].includes(key)&&h[2]==='%')val/=100;
        if(id==='temperature'&&key==='observed'&&/abnahme|decrease/i.test(h[0]))val=-Math.abs(val);
        return val;
      });
      if(new Set(values).size>1){messages.push(`${key}: mehrere verschiedene Angaben gefunden; bitte manuell zuordnen.`);continue;}
      const h=hits[0], unit=(h[2]||'').toLowerCase();
      const isotopeKeys=['a','b','mix','observed','ice','calcite','water','iceDelta','final','delta','waterChange'];
      if((isotopeKeys.includes(key)||(key==='initial'&&['ice','rayleigh'].includes(id)))&&unit&&!/^(‰|per\s*mil|permil)$/.test(unit)){messages.push(`${key}: unpassende Einheit statt ‰; kein Wert übernommen.`);continue;}
      if(['fraction','remaining','reset','alpha'].includes(key)&&unit&&!(unit==='%'&&key!=='alpha')){messages.push(`${key}: unpassende Einheit für einen dimensionslosen Anteil/Faktor; kein Wert übernommen.`);continue;}
      if((id==='temperature'&&key==='initialT'||['burial','thermometer'].includes(id)&&['temperature','surface'].includes(key))&&unit==='k'){add(key,values[0]-273.15,h[0],'Kelvin → °C');continue;}
      add(key,values[0],h[0],unit?'Einheit im Text gefunden.':'Einheit nicht sicher erkannt: Beschriftung der Eingabe prüfen.');
    }
    if(id==='mixing'){
      if(/(?:find|calculate|bestimme|berechne|gesucht).{0,35}(?:fraction|anteil|\bf\b)/i.test(t))add('target','fraction','Gesuchter Mischungsanteil');
      if(suggestions.some(s=>s.key==='ca'||s.key==='cb'))add('weighting','bulk','Konzentrationen erkannt');
    }
    if(id==='delta'){
      if(suggestions.some(s=>s.key==='ratio'))add('mode','fromAbsolute','Absolutes Verhältnis erkannt');
      else if(suggestions.some(s=>s.key==='relative'))add('mode','delta','Relatives Verhältnis erkannt');
      if(/δ\s*18\s*o|18o\/16o/i.test(t))add('system','O18','Sauerstoffsystem im Text');
    }
    if(id==='exchange'&&suggestions.some(s=>s.key==='reset'))add('target','reset','Ziel-Reset erkannt');
    else if(id==='exchange'&&suggestions.some(s=>s.key==='measured'))add('target','ratio','Gemessener Gesteinswert erkannt');
    if(id==='burial'&&/(?:gesucht|berechne|calculate|find).{0,25}(?:gradient)/i.test(t))add('target','gradient','Gesuchter Gradient');
    else if(id==='burial'&&/(?:gesucht|berechne|calculate|find).{0,25}(?:temperature|temperatur)/i.test(t))add('target','temperature','Gesuchte Temperatur');
    if(['screening','scenarios','exchangePair'].includes(id))messages.push('Tabellen und gekoppelte Endglieder bitte gezielt in die beschrifteten Eingabefelder übertragen. Sie werden aus Fließtext nicht automatisch zugeordnet.');
    if(id==='fractionation'){
      const hasPair=suggestions.some(s=>s.key==='a')&&suggestions.some(s=>s.key==='b');
      if(!hasPair&&suggestions.some(s=>s.key==='value'))add('mode',/1000\s*ln/i.test(t)?'log':/epsilon|ε/i.test(t)?'epsilon':'alpha','Ausgangsgröße im Text');
      if(/δ\s*18\s*o/i.test(t))add('isotope','O18','δ¹⁸O im Text');
    }
    if(id==='sea'&&/water\s*change|wasseränderung|coefficient|koeffizient/.test(t.toLowerCase()))add('mode','isotope','Linearer Isotopenbezug erkannt');
    if(id==='standards'){
      const direction=/\b(vpdb|vsmow)\s*(?:to|nach|→|in)\s*(vpdb|vsmow)\b/i.exec(t);
      if(direction)add('from',direction[1].toUpperCase(),'Explizite Umrechnungsrichtung');
      if(/δ\s*13\s*c/i.test(t)){add('isotope','C13','δ¹³C im Text');messages.push('δ¹³C erkannt: keine VSMOW/VPDB-Sauerstoffkonversion anwenden.');}
    }
    const missing=Geo.modules[id].fields.filter(f=>!f.optional&&!f.hide?.(proposed)&&(proposed[f.key]===undefined||String(proposed[f.key]).trim()==='')).map(f=>f.label);
    messages.push('Regelbasierter Vorschlag. Standards, Einheiten, Vorzeichen und gesuchte Größe vor dem Rechnen prüfen. Fehlende Parameter werden nicht ergänzt.');
    return {module:id,candidates,suggestions,missing,messages};
  }
  return {analyze,detect};
});
