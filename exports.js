(function(root,factory){const api=factory(typeof module==='object'&&module.exports?require('./advanced.js'):root.Geo);if(typeof module==='object'&&module.exports)module.exports=api;else root.GeoExport=api;})(globalThis,function(Geo){
  'use strict';
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const status=s=>({open:'Offen',progress:'In Bearbeitung',done:'Abgeschlossen'}[s]||'Offen');
  const filename=name=>(name||'Isotopenprojekt').replace(/[^\p{L}\p{N}_.-]+/gu,'-').slice(0,90);
  function result(t){if(!t.calculated)return null;try{return Geo.calculate(t.module,t.inputs);}catch{return null;}}
  function rows(projects){
    const all=[['Projekt','Aufgabe','Methode','Bereich','Parameter / Schritt','Wert / Rechenweg','Einheit / Status','Quelle']];
    for(const p of projects){
      if(!p.tasks.length)all.push([p.name,'','','Projektbeschreibung',p.description,'','','']);
      for(const t of p.tasks){
        const m=Geo.modules[t.module],r=result(t),prefix=[p.name,t.title,m.title];
        all.push([...prefix,'Aufgabenstatus',status(t.status),r?'Berechnet':'Noch nicht berechnet','','']);
        all.push([...prefix,'Aufgabenstellung','Text',t.text,'','']);
        if(t.notes)all.push([...prefix,'Notizen','Text',t.notes,'','']);
        if(p.description)all.push([...prefix,'Projektbeschreibung','Text',p.description,'','']);
        const values={...m.defaults,...t.inputs};
        for(const f of m.fields){if(f.hide?.(values))continue;let value=values[f.key]??'';if(f.type==='select')value=f.options.find(o=>o[0]===value)?.[1]??value;else{try{const n=Geo.parseNumber(value,'',true);value=n??'';}catch{}}
          all.push([...prefix,'Eingabe',f.label,value,f.unit||'','']);}
        if(r){
          for(const o of r.outputs)all.push([...prefix,'Ergebnis',o.label,o.value,o.unit,'']);
          for(const table of r.tables||[])for(const [i,row]of table.rows.entries())for(const [j,value]of row.entries())all.push([...prefix,table.title,`Zeile ${i+1} · ${table.headers[j]}`,value,'','']);
          for(const s of r.steps)all.push([...prefix,'Rechenweg',s.label,s.formula+'\n'+s.substitution,'','']);
          all.push([...prefix,'Interpretation','Text',r.interpretation,'','']);
          for(const w of r.warnings)all.push([...prefix,'Annahme / Grenze','Text',w,'','']);
          for(const s of r.sources)all.push([...prefix,'Quelle',s.title,'','',s.url]);
        }
        all.push([...prefix,'Metadaten','Rechenkern',Geo.VERSION,'','']);
      }
    }return all;
  }
  function csv(projects){return '\uFEFF'+rows(projects).map(row=>row.map(v=>{
    let s=String(v??'');if(typeof v!=='number'&&/^[\s]*[=+\-@]/.test(s))s="'"+s;
    if(typeof v==='number')s=s.replace('.',',');return '"'+s.replace(/"/g,'""')+'"';
  }).join(';')).join('\r\n');}
  const encoder=new TextEncoder();
  function crc32(bytes){let crc=0xffffffff;for(const b of bytes){crc^=b;for(let i=0;i<8;i++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}return (crc^0xffffffff)>>>0;}
  function zip(files){
    const chunks=[],central=[];let offset=0;
    const header=(length)=>{const data=new Uint8Array(length);return {data,view:new DataView(data.buffer)};};
    for(const [path,content] of Object.entries(files)){
      const name=encoder.encode(path),body=typeof content==='string'?encoder.encode(content):content,crc=crc32(body),local=header(30+name.length);
      local.view.setUint32(0,0x04034b50,true);local.view.setUint16(4,20,true);local.view.setUint16(6,0x800,true);local.view.setUint16(12,0x21,true);local.view.setUint32(14,crc,true);local.view.setUint32(18,body.length,true);local.view.setUint32(22,body.length,true);local.view.setUint16(26,name.length,true);local.data.set(name,30);
      const c=header(46+name.length);c.view.setUint32(0,0x02014b50,true);c.view.setUint16(4,20,true);c.view.setUint16(6,20,true);c.view.setUint16(8,0x800,true);c.view.setUint16(14,0x21,true);c.view.setUint32(16,crc,true);c.view.setUint32(20,body.length,true);c.view.setUint32(24,body.length,true);c.view.setUint16(28,name.length,true);c.view.setUint32(42,offset,true);c.data.set(name,46);
      chunks.push(local.data,body);central.push(c.data);offset+=local.data.length+body.length;
    }
    const centralLength=central.reduce((n,b)=>n+b.length,0),end=header(22);end.view.setUint32(0,0x06054b50,true);end.view.setUint16(8,central.length,true);end.view.setUint16(10,central.length,true);end.view.setUint32(12,centralLength,true);end.view.setUint32(16,offset,true);
    const output=new Uint8Array(offset+centralLength+22);let pos=0;for(const c of [...chunks,...central,end.data]){output.set(c,pos);pos+=c.length;}return output;
  }
  function xml(s){return esc(String(s).replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g,'')).slice(0,100000);}
  function xlsx(projects){
    // Continue long texts on readable rows, well below Excel's 32767-character cell limit.
    const table=rows(projects).flatMap(row=>{const count=Math.max(...row.map(v=>typeof v==='string'?Math.ceil(v.length/1000):1),1);return Array.from({length:count},(_,i)=>row.map((v,j)=>typeof v==='string'&&v.length>1000?v.slice(i*1000,(i+1)*1000):i>0&&j===4?v+' (Fortsetzung '+(i+1)+')':v));});
    const widths=[27,27,30,23,43,88,25,65],ns='http://schemas.openxmlformats.org/spreadsheetml/2006/main';
    const data=table.map((row,i)=>{const lines=Math.max(...row.map((v,j)=>String(v??'').split('\n').reduce((n,line)=>n+Math.max(1,Math.ceil(line.length/(widths[j]-3))),0)));const height=i===0?30:Math.min(409,Math.max(20,lines*15+6));return `<row r="${i+1}" ht="${height}" customHeight="1">${row.map((v,j)=>{const ref=String.fromCharCode(65+j)+(i+1),style=i===0?'1':typeof v==='number'?'2':'3';return typeof v==='number'?`<c r="${ref}" s="${style}"><v>${v}</v></c>`:`<c r="${ref}" s="${style}" t="inlineStr"><is><t xml:space="preserve">${xml(String(v??''))}</t></is></c>`;}).join('')}</row>`;}).join('');
    return zip({
      '[Content_Types].xml':'<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>',
      '_rels/.rels':'<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>',
      'xl/workbook.xml':`<?xml version="1.0" encoding="UTF-8"?><workbook xmlns="${ns}" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Berechnungen" sheetId="1" r:id="rId1"/></sheets></workbook>`,
      'xl/_rels/workbook.xml.rels':'<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>',
      'xl/styles.xml':`<?xml version="1.0"?><styleSheet xmlns="${ns}"><fonts count="2"><font><sz val="11"/><name val="Calibri"/><color rgb="FF263B42"/></font><font><b/><sz val="11"/><name val="Calibri"/><color rgb="FFFFFFFF"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF234A46"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="1"><border/></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="4"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`,
      'xl/worksheets/sheet1.xml':`<?xml version="1.0" encoding="UTF-8"?><worksheet xmlns="${ns}"><dimension ref="A1:H${table.length}"/><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><cols><col min="1" max="2" width="27" customWidth="1"/><col min="3" max="3" width="30" customWidth="1"/><col min="4" max="4" width="23" customWidth="1"/><col min="5" max="5" width="43" customWidth="1"/><col min="6" max="6" width="88" customWidth="1"/><col min="7" max="7" width="25" customWidth="1"/><col min="8" max="8" width="65" customWidth="1"/></cols><sheetData>${data}</sheetData><autoFilter ref="A1:H${table.length}"/></worksheet>`
    });
  }
  function json(projects){return JSON.stringify({schema:'geochemical-isotope-calculator',schemaVersion:1,engineVersion:Geo.VERSION,exportedAt:new Date().toISOString(),projects:projects.map(p=>({...p,tasks:p.tasks.map(t=>({...t,result:result(t)}))}))},null,2);}
  function reportTables(r){return (r.tables||[]).map(table=>`<h3>${esc(table.title)}</h3><table class="report-data"><thead><tr>${table.headers.map(h=>`<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${table.rows.map(row=>`<tr>${row.map(c=>`<td>${esc(typeof c==='number'?Geo.fmt(c,10):c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`).join('');}
  function report(projects){return `<header class="print-heading"><div>GEOCHEMICAL ISOTOPE CALCULATOR</div><h1>Berechnungsprotokoll</h1><p>Rechenkern ${Geo.VERSION} · ${esc(new Date().toLocaleString('de-DE'))} · Werte ungerundet berechnet; Anzeige auf 10 signifikante Stellen.</p></header>`+projects.map(p=>`<section class="report-project"><h1>${esc(p.name)}</h1><p>${esc(p.description)}</p>${p.tasks.length?p.tasks.map(t=>{
      const r=result(t),m=Geo.modules[t.module],v={...m.defaults,...t.inputs};
      return `<article class="report-task"><div class="report-kicker">${esc(m.title)} · ${status(t.status)}</div><h2>${esc(t.title)}</h2>${t.text?`<h3>Aufgabenstellung</h3><p class="pre">${esc(t.text)}</p>`:''}<h3>Eingaben</h3><table><thead><tr><th>Parameter</th><th>Wert</th><th>Einheit</th></tr></thead><tbody>${m.fields.filter(f=>!f.hide?.(v)).map(f=>`<tr><td>${esc(f.label)}</td><td>${esc(f.type==='select'?f.options.find(o=>o[0]===v[f.key])?.[1]||v[f.key]:v[f.key]??'—')}</td><td>${esc(f.unit||'')}</td></tr>`).join('')}</tbody></table>${r?`<h3>Ergebnisse</h3><table><tbody>${r.outputs.map(o=>`<tr><th>${esc(o.label)}</th><td>${esc(Geo.fmt(o.value,10))} ${esc(o.unit)}</td></tr>`).join('')}</tbody></table><h3>Rechenweg</h3>${r.steps.map((s,i)=>`<div class="print-step"><b>${i+1}. ${esc(s.label)}</b><p>${esc(s.formula)}<br>${esc(s.substitution)}</p></div>`).join('')}${reportTables(r)}<p>${esc(r.interpretation)}</p><h3>Annahmen & Grenzen</h3><ul>${r.warnings.map(w=>`<li>${esc(w)}</li>`).join('')}</ul><h3>Quellen</h3><ul>${r.sources.map(s=>`<li>${esc(s.title)}<br>${esc(s.url)}</li>`).join('')}</ul>`:'<p>Entwurf: Noch kein gültiges Berechnungsergebnis.</p>'}${t.notes?`<h3>Notizen</h3><p class="pre">${esc(t.notes)}</p>`:''}</article>`;
    }).join(''):'<p>Dieses Projekt enthält noch keine Aufgaben.</p>'}</section>`).join('');}
  function download(content,name,type){const blob=new Blob([content],{type});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);}
  return {esc,filename,rows,csv,xlsx,json,report,download,crc32,zip,result};
});
