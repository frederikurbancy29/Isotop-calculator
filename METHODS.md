# Formeln, Konventionen und Grenzen

Version 2.0.0 · Stand 17. November 2026.

## δ-Notation und Referenzen

δ = 1000 (RProbe / RStandard − 1), numerische Eingaben in ‰. α ist dimensionslos. Die App verwirft δ ≤ −1000 ‰ und nicht endliche Werte. Alle Rechnungen verwenden JavaScript-Gleitkommazahlen ohne Zwischenrundung. Die Oberfläche zeigt sechs, das Druckprotokoll zehn signifikante Stellen. CSV/XLSX/JSON behalten die berechneten numerischen Werte.

Quelle: [Kendall & Caldwell, Fundamentals of Isotope Geochemistry, USGS (1998)](https://wwwrcamnl.wr.usgs.gov/isoig/isopubs/itchch2.html).

## Zweikomponentenmischung

δmix ≈ wA δA + (1 − wA) δB.

Umstellungen:

- wA = (δmix − δB) / (δA − δB).
- δA = [δmix − (1 − wA) δB] / wA.
- δB = (δmix − wA δA) / (1 − wA).

Für einen Materialanteil fA mit passenden Konzentrationen CA und CB:

- wA = fA CA / [fA CA + (1 − fA) CB].
- fA = wA CB / [CA (1 − wA) + wA CB].

CA und CB müssen dieselbe Konzentrationseinheit und denselben Bezug besitzen, z. B. mol C/kg Material oder mol C/L. Die Wahl von Material-Massen- oder Volumenanteilen muss dazu passen. Die App prüft positive Zahlen; der gemeinsame Konzentrationsbezug wird vom Nutzer bestätigt, indem er das entsprechend beschriftete Feld benutzt. Alle Kohlenstoffwerte beziehen sich auf VPDB.

Die lineare Mischung von δ ist exakt, wenn w den Anteil des leichten Isotops repräsentiert. Für Gesamt-Kohlenstoffanteile ist es die übliche Näherung bei natürlichen Isotopenhäufigkeiten. Kein exaktes Tracer-Mischungsmodell für stark angereicherte Isotope. Identische Endglieder, nicht bestimmbare Endglieder bei Nullanteil und Mischungen außerhalb des Endgliedbereichs werden zurückgewiesen.

Quelle: [USGS WSP 2497, Isotopic Mass Balance, Gleichungen 2 und 3](https://pubs.usgs.gov/wsp/wsp2497/pdf/wsp2497.pdf). Die Umstellungen folgen algebraisch aus der angegebenen Bilanz.

## Fraktionierung

αA/B = RA/RB = (1000 + δA)/(1000 + δB), sofern beide δ-Werte dieselbe Referenz besitzen.

εA/B = 1000 (αA/B − 1).

εln = 1000 ln αA/B.

ΔA−B = δA − δB; die App verwendet Δ ausdrücklich in diesem Sinn, nicht für eine Mehrfachisotopenanomalie wie Δ¹⁷O.

Diese Größen sind nicht allgemein identisch. Bei Eingabe von α, ε oder εln allein kann Δ ohne δB nicht bestimmt werden. Sauerstoff-δ-Paare werden vor der Quotientenbildung auf VSMOW–SLAP umgerechnet. Kohlenstoff-δ-Paare haben einen gemeinsamen VPDB-Bezug.

Quelle: [USGS, Fundamentals of Isotope Geochemistry](https://wwwrcamnl.wr.usgs.gov/isoig/isopubs/itchch2.html).

## Temperaturänderung und Eisvolumenbeitrag

ΔδTemperatur = ΔδCarbonat − ΔδEis→Carbonat.

ΔT = −ΔδTemperatur / s; T1 = T0 + ΔT, falls T0 eingegeben wird.

Δ bezeichnet später minus früher. s ist der positive Betrag der aufgabenspezifischen Isotopensensitivität pro °C Abkühlung. Beide Δδ-Eingaben müssen auf derselben Carbonat-Skala stehen. Ein δ¹⁸O-Wasserwert oder eine Wasseränderung auf VSMOW darf nicht ungeprüft als Carbonatbeitrag eingesetzt werden. Für die Abbildung einer Wasseränderung auf eine Carbonatänderung sind ein Fraktionierungsmodell und eine konsistente Skalenrelation erforderlich.

Dies ist ein explizites lineares Unterrichtsmodell, keine universelle Kalibrierung. Die Zahlen des vorliegenden Chat-Beispiels definieren die Sensitivität und den Eisbeitrag: −(1,66 − 1,00)/0,25 = −2,64 °C. Ohne T0 wird keine absolute Temperatur erfunden. Analytische Unsicherheiten und ihre Fortpflanzung sind nicht implementiert.

Fachlicher Hintergrund zur Temperaturabhängigkeit: [USGS](https://wwwrcamnl.wr.usgs.gov/isoig/isopubs/itchch2.html). Der konkrete lineare Zusammenhang und die Zahlen stammen aus dem im Auftrag referenzierten früheren Chat.

## Absolute Temperatur aus Calcit und Wasser

Kim & O’Neil (1997), Originalgleichung:

1000 ln αCalcit/Wasser = 18,03 · 1000/T(K) − 32,42.

T(K) = 18030 / [1000 ln α + 32,42]; T(°C) = T(K) − 273,15.

Vor α-Bildung werden beide δ¹⁸O-Werte auf VSMOW–SLAP gebracht. Die Kalibrierung muss aktiv bestätigt werden. Sie bezieht sich auf die Original-Datenkonvention der Studie, einschließlich der dort verwendeten Säurefraktionierung. Eine moderne Laborkorrektur oder CO₂-Gasskala kann nicht allein durch die VPDB/VSMOW-Skalenkonversion kompatibel gemacht werden. Die App rechnet keine Säurefraktionierung automatisch um. Der experimentelle Niedertemperaturbereich ist 10–40 °C; außerhalb erscheint eine Extrapolationsmeldung. Keine Biologie-/Vital-, Spezies- oder kinetische Korrektur.

Primärquelle: [Kim & O’Neil (1997), Geochimica et Cosmochimica Acta 61, 3461–3475](https://doi.org/10.1016/S0016-7037(97)00169-5), [Autoren-/Universitätskopie](https://stable-isotopes.mcmaster.ca/publications/1997-Kim%26O%27Neil%281997%29-GCA-Calcite-new.pdf).

## Eis-Massenbilanz

Anfangs eisfreies geschlossenes Reservoir mit M0, δ0. Danach Ozean mit M0 − Mi, δ1 und Eis mit Mi, δi.

M0 δ0 ≈ (M0 − Mi) δ1 + Mi δi.

fi = Mi/M0 = (δ1 − δ0)/(δ1 − δi).

Mi = fi M0; MRest = (1 − fi) M0.

δi ist der Mittelwert des gesamten abgetrennten Eisspeichers. Die Rechnung ist eine lineare δ-Massenbilanz für Wasser, kein zeitabhängiges Gefriermodell. Keine Zufuhr, Verdunstung oder bereits vorhandenen zusätzlichen Eisreservoire. 0 ≤ fi < 1, alle δ-Werte auf VSMOW–SLAP. Ohne M0 werden nur Anteile ausgegeben.

Herleitung aus Massenerhaltung und der oben beschriebenen linearen Isotopenbilanz, siehe [USGS WSP 2497](https://pubs.usgs.gov/wsp/wsp2497/pdf/wsp2497.pdf).

## Meeresspiegeläquivalent

VWasser = VEis ρEis/ρWasser.

Δh(m) = Vorzeichen · VWasser(km³)/AOzean(km²) · 1000.

Positives Vorzeichen für Schmelzen von Landeis; negatives für Wachstum. Keine direkte Anwendung auf schwimmendes Meereis. Konstante Fläche, konstante vorgegebene Dichten. Keine lokale Isostasie, Änderung des Schwerefelds, Beckenform oder thermische Expansion. Beispieldichten und Ozeanfläche sind sichtbar editierbare Annahmen.

Alternativ: Δh = −k Δδ¹⁸OWasser, wobei k > 0 vom Nutzer aus seiner Aufgabe übernommen wird. Die App setzt keinen universellen m/‰-Faktor voraus. Der Wasserwert muss bereits den Eisvolumenbeitrag darstellen.

Herleitung: elementare Massen-/Volumenerhaltung und Einheitenumrechnung. Der lineare Isotopenkoeffizient ist eine vom Nutzer vorzugebende Modellannahme.

## Rayleigh

Konstantes αProdukt/Rest = RProdukt/RRest. Homogenes Reservoir, sofortige irreversible Produktabtrennung:

- δRest + 1000 = (δ0 + 1000) F^(α − 1).
- δProdukt,inst + 1000 = α (δRest + 1000).
- δProdukt,kum + 1000 = (δ0 + 1000) (1 − F^α)/(1 − F).

0 < F ≤ 1. Bei F = 1 existiert noch keine kumulativ abgetrennte Produktmenge; dafür gibt es kein Ergebnis. Die kumulative Formel nutzt `expm1` zur Stabilität bei F nahe 1. Exakt bezieht sich F auf das leichte Isotop; die Gleichsetzung mit verbleibendem Gesamtmaterial ist die natürliche-Häufigkeiten-Näherung. Für angereicherte Tracer ist ein anderes Modell nötig. α-Richtung muss Produkt/Rest sein; für α > 1 wird der Rest leichter.

Quelle: [USGS, Fundamentals of Isotope Geochemistry, Rayleigh distillation](https://wwwrcamnl.wr.usgs.gov/isoig/isopubs/itchch2.html). Der kumulative Ausdruck folgt aus der integrierten Bilanz.

## Standards: ausschließlich δ¹⁸O

Aktuelle in der App voreingestellte Relation nach Camin et al. (2025), Abschnitt 4.3:

δVSMOW–SLAP = 1,03092 δVPDB + 30,92 ‰.

δVPDB = (δVSMOW–SLAP − 30,92)/1,03092.

Optional die in vielen älteren Lehrmaterialien verwendete Relation:

δVSMOW = 1,03091 δVPDB + 30,91 ‰.

δVPDB = (δVSMOW − 30,91)/1,03091.

Die App verwendet dieselben Koeffizienten in Vor- und Rückrichtung und mischt keine gerundete, anders publizierte Inverse hinein. Die gewählte Relation erscheint im Rechenweg und Export. VSMOW ist in der Oberfläche als Kurzform für VSMOW–SLAP beschriftet.

Die Sauerstoff-Skalenrelation gilt für dasselbe Material. Sie ist weder die physikalische Calcit–Wasser-Fraktionierung noch die Umrechnung von säurefreigesetztem CO₂ zu Carbonat. Es gibt keine entsprechende Umrechnung von δ¹³C zwischen VPDB und VSMOW; der Rechner weist diese Auswahl zurück.

Quellen: [Camin et al. (2025), DOI 10.1002/rcm.10018](https://doi.org/10.1002/rcm.10018); [Korrektur 2026](https://doi.org/10.1002/rcm.70017) (betrifft Abschnitt 4.2, Anmerkung 3 zu VSMOW2/SLAP2, nicht die verwendete Skalenrelation); [Clark & Fritz (1997)](https://doi.org/10.1201/9781482242911) für die klassische Relation. Die App stellt beide Unterrichts-/Berichtskonventionen offen zur Wahl.


## Offener Wasser–Gestein-Austausch (Assignment 3, Problem 1)

Vereinfachtes Unterrichtsmodell mit unverändertem Fluid und festem Gleichgewichts-Endpunkt des Minerals:

- k = Cw/Cr; Konzentrationen auf demselben Massenbezug (hier ppm nach Masse).
- δr(N) = δeq + (δ0 − δeq) exp(−Nk).
- f = 1 − exp(−Nk) beschreibt den zurückgelegten Anteil des Isotopensignal-Abstands.
- N = −ln(1 − f)/k bzw. N = −ln[(δr − δeq)/(δ0 − δeq)]/k.

N ist kumulatives kg Wasser pro kg Gestein. Es ist weder Alter noch Porosität. δeq bezeichnet das **Gleichgewichtsmineral**, nicht unmittelbar das Wasser. Alle δ innerhalb eines Systems müssen dieselbe Skala besitzen. f ist nicht ohne zusätzliche Annahmen der Anteil tatsächlich ersetzten Minerals. Bei f = 1 ist N nur ein unendlicher Grenzwert; gleiche Endglieder machen die inverse Bestimmung unidentifizierbar. Messwerte außerhalb des zulässigen Intervalls werden abgewiesen.

Beim gekoppelten Modell wird dasselbe N mit jeweils eigenen kO und kC sowie Endgliedern verwendet. Die Lehrwerte sind kO = 888000/480000 = 1,85 und kC = 60,1/120000 ≈ 0,0005008333. Das erklärt, warum Sauerstoff schon stark verändert sein kann, während Kohlenstoff nahezu primär erscheint. Ein erhaltenes C-Signal garantiert kein erhaltenes O-Signal.

Modellquelle: vorgegebene vereinfachte Gleichung aus Assignment 3; fachlicher Kontext [Banner & Hanson (1990)](https://doi.org/10.1016/0016-7037(90)90128-8). Die App beansprucht nicht, deren vollständiges reaktives Austauschmodell zu simulieren.

## Inverse Thermometrie, Geothermie und Fluidhypothesen

Bei unabhängig bekanntem T liefert die bestätigte Kim–O’Neil-Gleichung α(T) = exp(18,03/TK − 0,03242). Mit beiden δ auf VSMOW gilt:

- δw + 1000 = (δc + 1000)/α(T).
- δc + 1000 = α(T)(δw + 1000).

Für die Ausgabe wird anschließend die gewünschte Skala konsistent verwendet. Die gleichen Kalibrierungsgrenzen wie bei der Temperaturrekonstruktion gelten.

Geothermisches Lehrmodell: T = T0 + Gz, z = (T − T0)/G und G = (T − T0)/z. G muss positiv sein, z wird in km eingegeben. Ein negativer Tiefenwert ist mit diesem einfachen Versenkungsmodell unvereinbar. Aus Tiefe folgt eine Zeitfolge nur bei bekannter monotoner Versenkung; Hebung, wechselnder Gradient oder heiße aufsteigende Fluide können sie entkoppeln.

Das Szenarienmodul hält das gemessene Calcit-δ fest und berechnet für jede Wasserhypothese α, T und z. „Vor/nach Ölzutritt“ ist eine bedingte Interpretation anhand einer angegebenen Ölzutrittstiefe. Ein gewünschtes Reservoir-Ergebnis darf nicht als Beweis für die Auswahl einer Fluidhypothese dienen. Alle drei Assignment-3-Szenarien liegen außerhalb des experimentellen Bereichs 10–40 °C und werden als Extrapolation gekennzeichnet.

## Screening und Statistik (Assignment 3, Problem 3)

Eine Probe bleibt nur bei gleichzeitig vollständig erhaltenen Fasern, nicht-lumineszierendem CL-Befund und **Sr > Srmin, Mn < Mnmax, Fe < Femax** erhalten. Die Grenzen sind strikt; Gleichheit genügt nicht. Sie sind aufgabenspezifisch, keine universellen Grenzwerte für alle Carbonate. Unbekannte Gefüge-/CL-Bezeichnungen werden nicht stillschweigend verworfen, sondern als Eingabefehler gemeldet. Mehrere Ablehnungsgründe bleiben sichtbar.

Je Gruppe werden ungewichtete arithmetische δ-Mittelwerte, Stichproben-s (n−1) und Pearson-r berechnet. r erfordert mindestens zwei Proben und Streuung in beiden Größen; andernfalls wird kein Zahlenwert erfunden. Keine verbleibende Probe bedeutet: kein gescreenter Mittelwert und kein Bias. Die Temperatur entsteht aus dem **mittleren δ**, nicht als Mittel der einzelnen Temperaturen. Bias = Talle − Tgescreent.

Mn kann CL aktivieren und Fe sie unterdrücken; deshalb belegt nicht-lumineszierendes Material allein keine Primärerhaltung. Korrelation ist eine Beschreibung, keine Diagnose eines eindeutigen Alterationsmechanismus. Ein geringes r belegt ebenfalls keine Primärerhaltung. Stichprobenstreuung ersetzt keine analytische Unsicherheitsfortpflanzung.

Quellen: Assignment-3-Lehrdaten; [Marshall (1992)](https://doi.org/10.1017/S0016756800008244), [Machel (1985)](https://journals.lib.unb.ca/index.php/GC/article/view/3427). Clumped-Isotope-Thermometrie wird ohne belegte Δ47-Kalibrierung nicht berechnet.
