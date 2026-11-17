/* Geochemical Isotope Calculator — pure, dependency-free numerical core. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.Geo = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const VERSION = '2.0.0';
  const sources = {
    fundamentals: { title: 'Kendall & Caldwell (1998) · Fundamentals of Isotope Geochemistry, USGS', url: 'https://wwwrcamnl.wr.usgs.gov/isoig/isopubs/itchch2.html' },
    mixing: { title: 'USGS WSP 2497 · Isotopic Mass Balance, Gleichungen 2–3', url: 'https://pubs.usgs.gov/wsp/wsp2497/pdf/wsp2497.pdf' },
    scales: { title: 'Camin et al. (2025) · IAEA scale definitions, Abschnitt 4.3', url: 'https://doi.org/10.1002/rcm.10018' },
    legacy: { title: 'Clark & Fritz (1997) · Environmental Isotopes in Hydrogeology, Skalenkonversion', url: 'https://doi.org/10.1201/9781482242911' },
    kim: { title: 'Kim & O’Neil (1997) · Calcite–water fractionation, Originalkalibrierung', url: 'https://doi.org/10.1016/S0016-7037(97)00169-5' }
  };
  const num = (key, label, unit, extra = {}) => ({key, label, unit, type: 'number', ...extra});
  const sel = (key, label, options, extra = {}) => ({key, label, type: 'select', options, ...extra});
  const scaleOptions = [['VPDB', 'VPDB'], ['VSMOW', 'VSMOW–SLAP']];
  const convention = () => sel('convention', 'δ¹⁸O-Skalenrelation', [['current', 'Camin 2025 · 1,03092 / 30,92 ‰'], ['legacy', 'Klassisch · 1,03091 / 30,91 ‰']]);
  const modules = {
    mixing: {
      title: 'δ¹³C-Mischung', short: 'Mischung', symbol: '¹³C', category: 'Massenbilanz',
      description: 'Zwei Endglieder mischen oder die Mischungsformel nach einer Unbekannten umstellen.',
      fields: [sel('target', 'Gesuchte Größe', [['mix', 'δ der Mischung'], ['fraction', 'Anteil fA'], ['a', 'δ von Endglied A'], ['b', 'δ von Endglied B']]),
        sel('weighting', 'Gewichtung', [['element', 'Anteil am Kohlenstoff'], ['bulk', 'Materialanteil mit C-Konzentrationen']]),
        num('a', 'δ¹³C Endglied A', '‰ VPDB', {hide: v => v.target === 'a'}), num('b', 'δ¹³C Endglied B', '‰ VPDB', {hide: v => v.target === 'b'}),
        num('mix', 'δ¹³C Mischung', '‰ VPDB', {hide: v => v.target === 'mix'}), num('fraction', 'Anteil fA', '0–1', {hide: v => v.target === 'fraction', hint: '0,30 entspricht 30 %. Im Materialmodus: Massen- oder Volumenanteil passend zur Konzentration.'}),
        num('ca', 'C-Konzentration A', 'gleiche Einheit', {hide: v => v.weighting !== 'bulk', hint: 'Beide Konzentrationen z. B. in mol/kg oder mol/L; keine gemischten Bezugsgrößen.'}),
        num('cb', 'C-Konzentration B', 'gleiche Einheit', {hide: v => v.weighting !== 'bulk'})],
      defaults: {target: 'mix', weighting: 'element'}, example: {target: 'mix', weighting: 'element', a: '-25', b: '-5', fraction: '0.3'},
      sourceIds: ['mixing', 'fundamentals']
    },
    fractionation: {
      title: 'α / ε / Δ', short: 'Fraktionierung', symbol: 'α', category: 'Fraktionierung',
      description: 'Fraktionierungsfaktor, Anreicherungsfaktor und δ-Differenz mit eindeutiger Richtung A/B.',
      fields: [sel('mode', 'Ausgangsgröße', [['deltas', 'δA und δB'], ['alpha', 'αA/B'], ['epsilon', 'εA/B = 1000 (α − 1)'], ['log', '1000 ln αA/B']]),
        sel('isotope', 'Isotopensystem', [['C13', 'δ¹³C'], ['O18', 'δ¹⁸O']]),
        num('a', 'δA', '‰', {hide: v => v.mode !== 'deltas'}), num('b', 'δB', '‰', {hide: v => v.mode !== 'deltas'}),
        sel('scaleA', 'Standard A', scaleOptions, {hide: v => v.isotope !== 'O18' || v.mode !== 'deltas'}),
        sel('scaleB', 'Standard B', scaleOptions, {hide: v => v.isotope !== 'O18' || v.mode !== 'deltas'}),
        convention(), num('value', 'Wert der Ausgangsgröße', 'α: 1; ε / 1000 ln α: ‰', {hide: v => v.mode === 'deltas'})],
      defaults: {mode: 'deltas', isotope: 'C13', scaleA: 'VPDB', scaleB: 'VPDB', convention: 'current'},
      example: {mode: 'deltas', isotope: 'C13', a: '-5', b: '-25', scaleA: 'VPDB', scaleB: 'VPDB', convention: 'current'}, sourceIds: ['fundamentals', 'scales']
    },
    temperature: {
      title: 'δ¹⁸O → Temperaturänderung', short: 'Temperaturänderung', symbol: 'ΔT', category: 'Paläotemperatur',
      description: 'Isotopenänderung in Eisvolumen- und Temperaturbeitrag zerlegen. Δ = später minus früher.',
      fields: [num('observed', 'Beobachtete Δδ¹⁸O im Carbonat', '‰ VPDB'), num('ice', 'Eisvolumenbeitrag zur Carbonatänderung', '‰ VPDB', {hint: 'Als Beitrag auf derselben Skala wie Δδc eingeben. Keine absolute Wasser-δ einsetzen.'}),
        num('sensitivity', 'Sensitivität s (positiv bei Abkühlung)', '‰ / °C', {hint: 'Aufgabenspezifischer positiver Betrag. ΔT = −(Δδc − Eisbeitrag) / s.'}),
        num('initialT', 'Anfangstemperatur T₀ (optional)', '°C', {optional: true})], defaults: {},
      example: {observed: '1.66', ice: '1', sensitivity: '0.25', initialT: ''}, sourceIds: ['fundamentals']
    },
    thermometer: {
      title: 'Calcit–Wasser-Thermometer', short: 'Absolute Temperatur', symbol: 'T°', category: 'Paläotemperatur',
      description: 'Absolute Gleichgewichtstemperatur nach Kim & O’Neil (1997), Originalkalibrierung.',
      fields: [num('calcite', 'δ¹⁸O Calcit', '‰'), sel('scaleC', 'Standard Calcit', scaleOptions), num('water', 'δ¹⁸O Wasser', '‰'), sel('scaleW', 'Standard Wasser', scaleOptions), convention(),
        sel('calibration', 'Datenkonvention bestätigen', [['', 'Bitte prüfen und auswählen'], ['KO97', 'Passend zur Originalkalibrierung KO97']])],
      defaults: {scaleC: 'VPDB', scaleW: 'VSMOW', convention: 'current', calibration: ''},
      example: {calcite: '-2', scaleC: 'VPDB', water: '0', scaleW: 'VSMOW', convention: 'current', calibration: 'KO97'}, sourceIds: ['kim', 'scales']
    },
    ice: {
      title: 'Eis-Massenbilanz', short: 'Eismassenbilanz', symbol: 'ice', category: 'Massenbilanz',
      description: 'Abtrennung eines Eisspeichers aus einem anfangs eisfreien, geschlossenen Wasserreservoir.',
      fields: [num('initial', 'δ¹⁸O Ozean, anfangs', '‰ VSMOW'), num('final', 'δ¹⁸O Ozean, danach', '‰ VSMOW'), num('iceDelta', 'Mittleres δ¹⁸O des abgetrennten Eises', '‰ VSMOW'), num('mass', 'Anfängliche Wassermasse M₀ (optional)', 'kg', {optional: true})],
      defaults: {}, example: {initial: '0', final: '1', iceDelta: '-40', mass: '1.4e21'}, sourceIds: ['mixing', 'fundamentals']
    },
    sea: {
      title: 'Meeresspiegelbezug', short: 'Meeresspiegel', symbol: '≈', category: 'Massenbilanz',
      description: 'Globales Meeresspiegeläquivalent aus Landeis oder eine ausdrücklich gewählte Isotopen-Sensitivität.',
      fields: [sel('mode', 'Berechnungsweg', [['volume', 'Landeisvolumen → Meeresspiegel'], ['isotope', 'Δδ¹⁸O Wasser → linearer Meeresspiegelbezug']]),
        sel('process', 'Prozess', [['melting', 'Landeis schmilzt (+ Meeresspiegel)'], ['growth', 'Landeis wächst (− Meeresspiegel)']], {hide: v => v.mode !== 'volume'}),
        num('volume', 'Betrag des Landeisvolumens', 'km³', {hide: v => v.mode !== 'volume'}), num('rhoIce', 'Eisdichte', 'kg / m³', {hide: v => v.mode !== 'volume'}),
        num('rhoWater', 'Wasserdichte für Wasseräquivalent', 'kg / m³', {hide: v => v.mode !== 'volume'}), num('area', 'Als konstant angenommene Ozeanfläche', 'km²', {hide: v => v.mode !== 'volume'}),
        num('waterChange', 'Δδ¹⁸O Wasser (später − früher)', '‰ VSMOW', {hide: v => v.mode !== 'isotope'}),
        num('coefficient', 'Positiver Betrag k', 'm / ‰', {hide: v => v.mode !== 'isotope', hint: 'Keine universelle Konstante. Aus der Aufgabenstellung übernehmen; Δh = −k · Δδw.'})],
      defaults: {mode: 'volume', process: 'melting'}, example: {mode: 'volume', process: 'melting', volume: '1000000', rhoIce: '917', rhoWater: '1000', area: '361000000'}, sourceIds: ['mixing']
    },
    rayleigh: {
      title: 'Rayleigh-Fraktionierung', short: 'Rayleigh', symbol: 'F', category: 'Fraktionierung',
      description: 'Restreservoir sowie momentan und kumulativ entferntes Produkt bei konstantem αProdukt/Rest.',
      fields: [sel('system', 'Isotopensystem und gemeinsamer Standard', [['C13', 'δ¹³C · VPDB'], ['O18', 'δ¹⁸O · VSMOW']]), num('initial', 'Anfangswert δ₀', '‰'), num('alpha', 'αProdukt/Rest = RProdukt / RRest', '1'), num('remaining', 'Verbleibender Anteil F', '0 < F ≤ 1')],
      defaults: {system: 'O18'}, example: {system: 'O18', initial: '0', alpha: '1.01', remaining: '0.5'}, sourceIds: ['fundamentals']
    },
    standards: {
      title: 'VSMOW ↔ VPDB', short: 'δ¹⁸O-Skalen', symbol: '↔', category: 'Referenzskalen',
      description: 'δ¹⁸O desselben Materials zwischen den Skalen umrechnen. Ausschließlich Sauerstoff-18.',
      fields: [sel('isotope', 'Isotopensystem', [['O18', 'δ¹⁸O'], ['C13', 'δ¹³C (keine Konversion)']]), num('delta', 'Isotopenwert', '‰'), sel('from', 'Ausgangsskala', scaleOptions), convention()],
      defaults: {isotope: 'O18', from: 'VPDB', convention: 'current'}, example: {isotope: 'O18', delta: '-2', from: 'VPDB', convention: 'current'}, sourceIds: ['scales', 'legacy']
    }
  };
  class InputError extends Error { constructor(message, field) { super(message); this.name = 'InputError'; this.field = field; } }
  function parseNumber(value, label = 'Wert', optional = false) {
    if (value === undefined || value === null || String(value).trim() === '') {
      if (optional) return null;
      throw new InputError(`${label}: Wert fehlt.`);
    }
    if (typeof value !== 'string' && typeof value !== 'number') throw new InputError(`${label}: ungültige Zahl.`);
    const s = String(value).trim().replace(/−/g, '-');
    if (!/^[+-]?(?:\d+(?:[.,]\d*)?|[.,]\d+)(?:[eE][+-]?\d+)?$/.test(s)) throw new InputError(`${label}: eine Zahl ohne Einheit eingeben (z. B. −2,5 oder 1.4e21). Keine Tausendertrennzeichen.`);
    const n = Number(s.replace(',', '.'));
    if (!Number.isFinite(n)) throw new InputError(`${label}: Zahl ist nicht endlich.`);
    return n;
  }
  function fmt(n, digits = 6) { return n == null ? '—' : Number(n).toLocaleString('de-DE', {maximumSignificantDigits: digits}); }
  function factor(c) { if (c === 'current') return [1.03092, 30.92]; if (c === 'legacy') return [1.03091, 30.91]; throw new InputError('Unbekannte Skalenrelation.', 'convention'); }
  function convert(delta, from, to, c = 'current') {
    if (!['VPDB', 'VSMOW'].includes(from) || !['VPDB', 'VSMOW'].includes(to)) throw new InputError('Standard muss VPDB oder VSMOW sein.');
    if (from === to) return delta;
    const [a,b] = factor(c);
    return from === 'VPDB' ? a * delta + b : (delta - b) / a;
  }
  function calculate(id, input) {
    const m = modules[id]; if (!m) throw new InputError('Unbekannte Berechnungsmethode.');
    const v = {...m.defaults, ...input}, values = {}, warnings = [], steps = [], outputs = [];
    for (const f of m.fields) {
      if (f.hide?.(v)) continue;
      if (f.type === 'select') {
        if (!f.options.some(o => o[0] === v[f.key])) throw new InputError(`${f.label}: ungültige Auswahl.`, f.key);
        values[f.key] = v[f.key];
      } else {
        try { values[f.key] = parseNumber(v[f.key], f.label, f.optional); }
        catch (e) { e.field = f.key; throw e; }
      }
    }
    const n = key => values[key];
    const check = (ok, message, field) => { if (!ok) throw new InputError(message, field); };
    const delta = (key) => { const x = n(key); check(x > -1000, 'δ muss größer als −1000 ‰ sein.', key); return x; };
    const positive = key => { const x = n(key); check(x > 0, 'Dieser Wert muss positiv sein.', key); return x; };
    const fraction = (key, open = false) => { const x = n(key); check((open ? x > 0 : x >= 0) && x <= 1, `Anteil muss ${open ? 'größer als 0 und ' : ''}zwischen ${open ? '> 0' : '0'} und 1 liegen.`, key); return x; };
    const out = (label, value, unit = '', key = '') => { check(Number.isFinite(value), 'Das Ergebnis liegt außerhalb des numerisch darstellbaren Bereichs. Eingaben prüfen.'); outputs.push({label,value,unit,key}); return value; };
    const step = (label, formula, substitution) => steps.push({label,formula,substitution});
    let formula = '', interpretation = '';
    if (id === 'mixing') {
      const bulk = v.weighting === 'bulk', ca = bulk ? positive('ca') : 1, cb = bulk ? positive('cb') : 1;
      let a, b, mix, f, w;
      if (v.target !== 'a') a = delta('a'); if (v.target !== 'b') b = delta('b');
      if (v.target !== 'mix') mix = delta('mix');
      if (v.target === 'fraction') {
        check(Math.abs(a-b) > 1e-12, 'Gleiche Endglieder: Anteil ist aus δ nicht eindeutig bestimmbar.', 'b');
        w = (mix-b)/(a-b);
        check(w >= -1e-12 && w <= 1+1e-12, 'Die Mischung liegt außerhalb der Endglieder. Keine physikalische Zweikomponentenmischung.', 'mix');
        w = Math.max(0,Math.min(1,w)); f = w*cb / (ca*(1-w)+w*cb);
        formula = 'wA = (δmix − δB) / (δA − δB)';
        step('Kohlenstoffanteil bestimmen', formula, `(${fmt(mix)} − (${fmt(b)})) / (${fmt(a)} − (${fmt(b)})) = ${fmt(w)}`);
        if (bulk) step('Materialanteil zurückrechnen', 'fA = wA · CB / [CA · (1 − wA) + wA · CB]', `fA = ${fmt(f)}`);
        out(bulk ? 'Materialanteil fA' : 'Kohlenstoffanteil fA', f, '1', 'fraction'); out('Anteil A', 100*f, '%');
      } else {
        f = fraction('fraction'); w = f*ca/(f*ca+(1-f)*cb);
        if (bulk) step('Kohlenstoffanteil aus Materialanteil', 'wA = fA CA / [fA CA + (1 − fA) CB]', `wA = ${fmt(w)}`);
        if (v.target === 'mix') { mix = w*a+(1-w)*b; formula = 'δmix ≈ wA · δA + (1 − wA) · δB'; step('Endglieder gewichten', formula, `${fmt(w)} · (${fmt(a)}) + ${fmt(1-w)} · (${fmt(b)}) = ${fmt(mix)} ‰`); out('δ¹³C Mischung', mix, '‰ VPDB', 'mix'); }
        else if (v.target === 'a') { check(w > 0, 'Bei Anteil A = 0 lässt sich δA nicht bestimmen.', 'fraction'); a = (mix-(1-w)*b)/w; check(a > -1000, 'Berechnetes δA ist physikalisch unzulässig.'); formula = 'δA ≈ [δmix − (1 − wA) δB] / wA'; step('Nach δA umstellen', formula, `δA = ${fmt(a)} ‰`); out('δ¹³C Endglied A', a, '‰ VPDB', 'a'); }
        else { check(w < 1, 'Bei Anteil A = 1 lässt sich δB nicht bestimmen.', 'fraction'); b = (mix-w*a)/(1-w); check(b > -1000, 'Berechnetes δB ist physikalisch unzulässig.'); formula = 'δB ≈ (δmix − wA δA) / (1 − wA)'; step('Nach δB umstellen', formula, `δB = ${fmt(b)} ‰`); out('δ¹³C Endglied B', b, '‰ VPDB', 'b'); }
      }
      if (bulk) out('Kohlenstoffanteil wA', w, '1');
      warnings.push('Lineare δ-Massenbilanz: exakt für Anteile des leichten Isotops, Näherung für Gesamt-C-Anteile. Für natürliche δ¹³C-Werte üblich; nicht für stark angereicherte Tracer. Alle δ¹³C-Werte auf VPDB.');
      interpretation = `Endglied A trägt ${fmt(100*w)} % zum Kohlenstoff bei. Konzentrationen und Materialanteile müssen dieselbe Massen- oder Volumenbasis verwenden.`;
    } else if (id === 'fractionation') {
      let alpha;
      if (v.mode === 'deltas') {
        let a = delta('a'), b = delta('b'); const scale = v.isotope === 'O18' ? 'VSMOW' : 'VPDB';
        if (v.isotope === 'O18') { a = convert(a,v.scaleA,scale,v.convention); b = convert(b,v.scaleB,scale,v.convention); step('Auf dieselbe Sauerstoffskala bringen', 'Beide δ-Werte → VSMOW–SLAP', `δA = ${fmt(a)} ‰; δB = ${fmt(b)} ‰ (${v.convention})`); }
        alpha = (1000+a)/(1000+b); formula = 'αA/B = RA / RB = (1000 + δA) / (1000 + δB)';
        step('Verhältnisse dividieren',formula,`(${fmt(1000+a)}) / (${fmt(1000+b)}) = ${fmt(alpha,10)}`);
        out(`ΔA−B = δA − δB (${scale})`,a-b,'‰');
      } else {
        const x = n('value');
        alpha = v.mode === 'alpha' ? x : v.mode === 'epsilon' ? 1+x/1000 : Math.exp(x/1000);
        formula = v.mode === 'alpha' ? 'α = Eingabewert' : v.mode === 'epsilon' ? 'α = 1 + ε / 1000' : 'α = exp[(1000 ln α) / 1000]';
        step('In α umrechnen', formula, `α = ${fmt(alpha,10)}`);
        warnings.push('Δ = δA − δB ist ohne Bezugswert δB nicht eindeutig bestimmbar.');
      }
      check(Number.isFinite(alpha) && alpha > 0, 'α muss endlich und größer als 0 sein.', 'value');
      // Put alpha first, retaining the scale-specific delta difference afterward.
      outputs.unshift({label:'Fraktionierungsfaktor αA/B',value:alpha,unit:'1',key:'alpha'});
      out('εA/B = 1000 (α − 1)',1000*(alpha-1),'‰','epsilon'); out('1000 ln αA/B',1000*Math.log(alpha),'‰','log');
      step('Anreicherungsfaktoren', 'ε = 1000 (α − 1); εln = 1000 ln α', `ε = ${fmt(1000*(alpha-1))} ‰; εln = ${fmt(1000*Math.log(alpha))} ‰`);
      interpretation = alpha > 1 ? 'A ist gegenüber B am schweren Isotop angereichert (αA/B > 1).' : alpha < 1 ? 'A ist gegenüber B am schweren Isotop abgereichert (αA/B < 1).' : 'A und B haben dasselbe Isotopenverhältnis.';
      warnings.push('ε, 1000 ln α und Δ sind verschiedene Größen. Ihre Gleichsetzung ist nur eine Näherung bei kleinen Fraktionierungen und passenden δ-Werten.');
    } else if (id === 'temperature') {
      const residual = n('observed') - n('ice'), s = positive('sensitivity'), change = -residual/s;
      formula = 'ΔT = −(Δδc − ΔδEis→c) / s';
      step('Eisvolumenbeitrag abziehen','ΔδTemperatur = Δδc − ΔδEis→c',`${fmt(n('observed'))} − ${fmt(n('ice'))} = ${fmt(residual)} ‰`);
      step('Temperaturänderung bestimmen',formula,`−(${fmt(residual)}) / ${fmt(s)} = ${fmt(change)} °C`);
      out('Temperaturänderung ΔT',change,'°C','change'); out('Temperaturbedingte Δδ¹⁸O',residual,'‰ VPDB');
      if (n('initialT') !== null) { check(n('initialT') > -273.15 && n('initialT')+change > -273.15,'Temperatur muss über dem absoluten Nullpunkt liegen.','initialT'); out('Endtemperatur T₁',n('initialT')+change,'°C'); step('Anfangstemperatur addieren','T₁ = T₀ + ΔT',`${fmt(n('initialT'))} + (${fmt(change)}) = ${fmt(n('initialT')+change)} °C`); }
      interpretation = change < 0 ? `${fmt(-change)} °C Abkühlung.` : change > 0 ? `${fmt(change)} °C Erwärmung.` : 'Keine Temperaturänderung im gewählten Modell.';
      warnings.push('Lineares Differenzmodell mit vorgegebener Sensitivität, keine absolute Thermometerkalibrierung. Der Eisbeitrag muss bereits auf die Carbonat-Δ-Skala abgebildet sein. Eine Wasseränderung auf VSMOW darf nicht ungeprüft abgezogen werden.');
    } else if (id === 'thermometer') {
      check(v.calibration === 'KO97','Bitte die zur Originalkalibrierung passende Datenkonvention bestätigen. Moderne Säureaufschluss-Korrekturen sind nicht automatisch kompatibel.','calibration');
      const c = convert(delta('calcite'),v.scaleC,'VSMOW',v.convention), w = convert(delta('water'),v.scaleW,'VSMOW',v.convention);
      const alpha = (1000+c)/(1000+w), denominator = 1000*Math.log(alpha)+32.42;
      check(denominator > 0,'Diese Werte ergeben keine physikalische Temperatur für die gewählte Kalibrierung.');
      const kelvin = 18030/denominator, t = kelvin-273.15;
      formula = 'T(K) = 18030 / [1000 ln αCalcit/Wasser + 32,42]';
      step('Skalen angleichen','δ¹⁸O Calcit und Wasser → VSMOW–SLAP',`δc = ${fmt(c)} ‰; δw = ${fmt(w)} ‰ (${v.convention})`);
      step('Fraktionierungsfaktor','α = (1000 + δc) / (1000 + δw)',`α = ${fmt(alpha,10)}`);
      step('Kalibrierung nach T auflösen',formula,`T = ${fmt(kelvin)} K = ${fmt(t)} °C`);
      out('Rekonstruierte Temperatur',t,'°C','temperature'); out('Absolute Temperatur',kelvin,'K'); out('αCalcit/Wasser',alpha,'1');
      if (t < 10 || t > 40) warnings.push('Extrapolation: Ergebnis außerhalb des experimentellen Bereichs 10–40 °C der Originalstudie.');
      warnings.push('Kim & O’Neil 1997, Originalgleichung: 1000 ln α = 18,03 · 1000/T − 32,42. Erfordert Daten mit passender Säurefraktionierungs-Konvention; kein universelles Foraminiferen-Thermometer. Biologische und kinetische Effekte sind nicht korrigiert.');
      interpretation = 'Gleichgewichtstemperatur für Calcit und Wasser unter den bestätigten Kalibrierungsannahmen.';
    } else if (id === 'ice') {
      const d0=delta('initial'), df=delta('final'), di=delta('iceDelta');
      check(Math.abs(df-di)>1e-12,'Ozean und Eis dürfen für diese Umstellung nicht dasselbe δ haben.','iceDelta');
      const f=(df-d0)/(df-di);
      check(f>=0 && f<1,'Eingaben ergeben keinen abgetrennten Eisanteil 0 ≤ f < 1. Vorzeichen und mittleres Eis-δ prüfen.');
      formula='fEis = (δOzean,1 − δOzean,0) / (δOzean,1 − δEis)';
      step('Bilanz ansetzen','M₀ δ₀ ≈ (M₀ − MEis) δ₁ + MEis δEis','fEis = MEis / M₀');
      step('Nach Eisanteil auflösen',formula,`(${fmt(df)} − ${fmt(d0)}) / (${fmt(df)} − (${fmt(di)})) = ${fmt(f)}`);
      out('Abgetrennter Eisanteil',f*100,'%','percent'); out('fEis der Anfangsmasse',f,'1');
      if(n('mass')!==null){const mass=positive('mass');out('Eismasse',mass*f,'kg');out('Verbleibende Ozeanmasse',mass*(1-f),'kg');step('Masse bestimmen','MEis = fEis M₀',`${fmt(f)} · ${fmt(mass)} = ${fmt(mass*f)} kg`);}
      interpretation=`${fmt(f*100)} % der Anfangswassermasse werden im Eisspeicher gebunden.`;
      warnings.push('Lineare δ-Massenbilanz in einem geschlossenen Zweireservoir-System; Eis-δ ist der Mittelwert des gesamten abgetrennten Eises, kein momentaner Gefrierwert. Näherung für Gesamtwassermassen. Keine Rayleigh-Gefriergeschichte.');
    } else if (id === 'sea') {
      let h;
      if(v.mode==='volume'){
        const vol=n('volume');check(vol>=0,'Volumenbetrag darf nicht negativ sein.','volume');
        const ri=positive('rhoIce'), rw=positive('rhoWater'), area=positive('area'), sign=v.process==='melting'?1:-1;
        h=sign*vol*ri/rw/area*1000;
        formula='Δh(m) = ± VEis(km³) · (ρEis/ρWasser) / AOzean(km²) · 1000';
        step('Wasseräquivalent','VWasser = VEis · ρEis / ρWasser',`${fmt(vol)} · ${fmt(ri)}/${fmt(rw)} = ${fmt(vol*ri/rw)} km³`);
        step('Auf Ozeanfläche verteilen',formula,`Δh = ${fmt(h)} m`);
        out('Meeresspiegeländerung Δh',h,'m','seaLevel');out('Wasseräquivalent',vol*ri/rw,'km³');
        warnings.push('Nur landgebundenes Eis. Konstante Ozeanfläche, keine lokale Isostasie, Gravitation, thermische Ausdehnung oder Änderung von Ozeanbecken. Gewählte Dichte definiert das Wasseräquivalent.');
      }else{
        const k=positive('coefficient');h=-k*n('waterChange');formula='Δh = −k · Δδ¹⁸OWasser';
        step('Vorgegebenen linearen Bezug anwenden',formula,`−${fmt(k)} · (${fmt(n('waterChange'))}) = ${fmt(h)} m`);out('Meeresspiegeländerung Δh',h,'m','seaLevel');
        warnings.push('Aufgabenspezifische lineare Näherung. k ist keine universelle Konstante. Nur den Eisvolumenanteil der Wasser-δ¹⁸O-Änderung verwenden, keinen unbereinigten Carbonatwert.');
      }
      interpretation=h>0?`${fmt(h)} m Anstieg des globalen Meeresspiegeläquivalents.`:h<0?`${fmt(-h)} m Absenkung des globalen Meeresspiegeläquivalents.`:'Keine Meeresspiegeländerung.';
    } else if (id === 'rayleigh') {
      const d0=delta('initial'), a=positive('alpha'), f=fraction('remaining',true), rr=(1+d0/1000)*Math.pow(f,a-1);
      const dr=1000*(rr-1), dp=1000*(a*rr-1), unit=v.system==='O18'?'‰ VSMOW':'‰ VPDB';
      formula='δRest = (δ₀ + 1000) F^(αProdukt/Rest − 1) − 1000';
      step('Restreservoir',formula,`(${fmt(d0)} + 1000) · ${fmt(f)}^(${fmt(a)} − 1) − 1000 = ${fmt(dr)} ‰`);
      step('Momentan entferntes Produkt','δProdukt,inst = α (δRest + 1000) − 1000',`δProdukt,inst = ${fmt(dp)} ‰`);
      out('δ Restreservoir',dr,unit,'residual');out('δ Produkt, momentan',dp,unit);
      if(f<1){const pooled=1000*((1+d0/1000)*(-Math.expm1(a*Math.log(f)))/(1-f)-1);out('δ Produkt, kumulativ',pooled,unit);step('Kumulatives Produkt','δProdukt,kum = (δ₀ + 1000)(1 − F^α)/(1 − F) − 1000',`δProdukt,kum = ${fmt(pooled)} ‰`);}else warnings.push('Bei F = 1 wurde kein Produkt entnommen. Der kumulative Produktwert ist daher nicht definiert.');
      interpretation=a>1?'Das entfernte Produkt ist gegenüber dem jeweiligen Rest angereichert; das Restreservoir wird leichter.':a<1?'Das entfernte Produkt ist gegenüber dem jeweiligen Rest abgereichert; das Restreservoir wird schwerer.':'Bei α = 1 tritt keine Fraktionierung auf.';
      warnings.push('Offenes Rayleigh-Modell: homogenes Restreservoir, sofortige irreversible Produktabtrennung, konstantes αProdukt/Rest. F ist streng der verbleibende Anteil des leichten Isotops; als Gesamtstoffanteil ist dies eine Näherung für natürliche Isotopenhäufigkeiten.');
    } else if (id === 'standards') {
      check(v.isotope==='O18','VSMOW ↔ VPDB ist hier ausschließlich für δ¹⁸O definiert. δ¹³C bleibt auf VPDB; keine Sauerstoffkonversion auf Kohlenstoff anwenden.','isotope');
      const d=delta('delta'), to=v.from==='VPDB'?'VSMOW':'VPDB', result=convert(d,v.from,to,v.convention), [a,b]=factor(v.convention);
      formula=v.from==='VPDB'?`δVSMOW = ${a} · δVPDB + ${b}`:`δVPDB = (δVSMOW − ${b}) / ${a}`;
      step('Gewählte Skalenrelation',formula,`${fmt(d)} ‰ ${v.from} → ${fmt(result,10)} ‰ ${to}`);
      out('δ¹⁸O auf Zielskala',result,`‰ ${to}`,'converted');
      interpretation=`Dasselbe Material, andere Referenzskala. Konvention: ${v.convention==='current'?'Camin et al. 2025':'klassische 1,03091-Relation'}.`;
      warnings.push('Dies ist eine Umrechnung des Standards, keine Calcit–Wasser-Fraktionierung und keine CO₂-Säureaufschluss-Korrektur. Die Rückumrechnung verwendet die algebraisch exakte Inverse derselben Relation.');
    }
    return {module:id,version:VERSION,values,formula,outputs,steps,warnings,interpretation,sources:m.sourceIds.map(s=>sources[s]),calculatedAt:new Date().toISOString()};
  }
  return {VERSION,modules,sources,InputError,parseNumber,fmt,convert,calculate};
});
