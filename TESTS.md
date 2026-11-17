# Prüfung der Version 2.0.0

Die Prüfung verwendet Node.js und JavaScript; kein Python und keine kostenpflichtige API. Der Rechenkern wird unabhängig von der Oberfläche getestet.

## Numerische Sollwerte

| Testfall | Eingabe | Sollwert |
|---|---|---|
| δ¹³C-Mischung | A = −25 ‰, B = −5 ‰, fA = 0,30 | −11 ‰ VPDB |
| Anteil zurückrechnen | Mischung = −11 ‰, gleiche Endglieder | 0,30 |
| Endglieder zurückrechnen | Mischung −11 ‰, fA 0,30 | A = −25 ‰ bzw. B = −5 ‰ |
| Konzentrationsgewichtung | fA = 0,50, CA = 2, CB = 1, gleiche Endglieder | wA = 2/3, δmix = −18,333333… ‰ |
| α / ε / Δ | δA = −5 ‰, δB = −25 ‰ | α = 995/975 = 1,02051282051; ε = 20,5128205 ‰; 1000 ln α = 20,3052662 ‰; Δ = 20 ‰ |
| Temperaturfall aus dem früheren Chat | Gesamt 1,66 ‰, Eisbeitrag 1,00 ‰, s = 0,25 ‰/°C | ΔT = −2,64 °C |
| Optionales T0 | vorheriger Fall, T0 = 10 °C | T1 = 7,36 °C |
| Calcit–Wasser | α vorwärts aus 25 °C berechnet; Calcit auf VPDB, Wasser auf VSMOW | inverse Kalibrierung liefert 25 °C |
| Calcit-Beispiel in der App | δc = −2 ‰ VPDB, δw = 0 ‰ VSMOW, 1,03092-Relation | 23,05695031 °C |
| Eisbilanz | δ0 = 0, δ1 = 1, δEis = −40 ‰; M0 = 4100 kg | f = 1/41; MEis = 100 kg; MRest = 4000 kg |
| Meeresspiegel | VEis = 10⁶ km³, ρEis = 917, ρWasser = 1000 kg/m³, A = 361 · 10⁶ km² | +2,540166205 m beim Schmelzen; negatives Vorzeichen bei Wachstum |
| Linearer Meeresspiegelbezug | Δδw = 1 ‰, k = 120 m/‰ | −120 m |
| Rayleigh | δ0 = 0 ‰, αProdukt/Rest = 1,01, F = 0,5 | Rest −6,907504563 ‰; momentan +3,023420391 ‰; kumulativ +6,907504563 ‰ |
| Rayleigh ohne Fraktionierung | α = 1, beliebiges zulässiges F | alle vorhandenen δ = δ0 |
| Skalenrelation aktuell | 0 ‰ VPDB | 30,92 ‰ VSMOW–SLAP |
| Skalenrelation klassisch | 0 ‰ VPDB | 30,91 ‰ VSMOW |
| Skalen-Rundlauf | −100, −30, −2, 0, +50 ‰; beide Relationen | Rückkehr zum Ausgangswert innerhalb Gleitkommatoleranz |

## Automatisierte Tests

`node --test tests/*.test.cjs` prüft:

- alle 14 Modulbeispiele auf endliche Ergebnisse und vorhandene Rechenwege/Annahmen/Quellen;
- Zahlenparser mit Komma, Punkt, Unicode-Minus und Exponenten;
- alle Mischungs-Umstellungen und Konzentrationsgewichtung;
- singuläre Umstellungen, nicht physikalische Anteile, Null-/Negativsensitivität, fehlende Werte, nicht endliche Zahlen und falsche Eingabeformate;
- unterschiedliche Referenzskalen vor α-Bildung;
- unabhängige Vorwärts-/Rückwärtsrechnung des Thermometers;
- Eis-Massen-/Isotopenbilanz und Rayleigh-Produktbilanz;
- Rayleigh F = 1, F = 0, α = 1;
- beide Sauerstoff-Skalenrelationen und Verweigerung einer δ¹³C-Konversion;
- Erkennung der tatsächlichen englischen Textaufgabe aus dem früheren Chat;
- negative Änderungen, Prozentanteile, widersprüchliche Parameter und klar unpassende Einheiten;
- JSON-Import mit Schema-Validierung, neuen IDs und Zurücksetzen ungültiger Ergebnisse;
- Exportstruktur, numerische XLSX-Zellen, CSV-Formelschutz und HTML-Escaping.

Die Erweiterungen verwenden die bereitgestellten Daten aus Assignment 3. Der Temperaturänderungsfall stammt aus dem früheren Chat; weitere Grundfälle sind synthetische Kontrollrechnungen. Die Prüfungen belegen die implementierten Modelle, nicht die Eignung einer bestimmten Kalibrierung für eine unbesehene reale Probe.

## Prüfung der Oberfläche

Ergebnis am 11. November 2026: **18 automatisierte Tests bestanden, 0 fehlgeschlagen.**

Ergänzende Browser-Prüfungen unter `http://127.0.0.1:8796`:

- Startoberfläche und alle acht Beispieldatensätze geladen; IndexedDB-Speicherstatus sichtbar.
- Englische Temperaturaufgabe analysiert, genau drei Parameter vorgeschlagen, Auswahl übernommen und −2,64 °C berechnet.
- Sensitivität 0 erzeugt eine sichtbare Fehlermeldung; das bisherige Ergebnis wird entfernt. Dezimalkomma `0,25` stellt die gültige Berechnung wieder her.
- Aufgabe abgeschlossen und Seite neu geladen: Werte, Ergebnis und Abschlussstatus bleiben erhalten.
- Projekt als XLSX, CSV und JSON über die Oberfläche heruntergeladen.
- XLSX-ZIP-Struktur mit `unzip -t` unabhängig geprüft, ohne Fehler. Die abschließende native Excel-Ansicht konnte nicht verifiziert werden; daher keine Behauptung einer vollständigen Excel-Anwendungsprüfung.
- JSON über den Dateidialog wieder importiert: separates Projekt mit acht Aufgaben und gültigen Ergebnissen entstanden. Projekt anschließend erfolgreich umbenannt.
- Neue leere Mischungsaufgabe angelegt und manuell mit −25, −5 ‰ sowie 0,3 berechnet: −11 ‰. Gesuchte Größe auf Anteil umgestellt und aus −11 ‰ wieder 0,3 erhalten.
- PDF-Aktion aufgerufen; vollständiges Druckprotokoll mit acht Aufgaben, Eingaben und Rechenwegen im Dokument erzeugt. Druckaufruf danach abgebrochen. Eine gespeicherte PDF-Seitenfolge wurde nicht visuell verifiziert.
- Responsive Ansicht mit 390 × 844 Pixeln geprüft: Dokumentbreite = Ansichtsbreite = 390 Pixel, keine horizontale Überbreite; Eingaben und Ergebnisse untereinander lesbar.

Direkte Dateiseiten können im eingebetteten Vorschau-Browser nicht geöffnet werden; die Vorschau verwendet daher den mitgelieferten lokalen HTTP-Server. Der direkte `file://`-Start wurde in diesem Browser nicht geprüft. Die statische App enthält klassische Skripte statt Modulimports und keine `fetch`-Zugriffe, damit sie ohne Server aus `index.html` arbeiten kann. Falls ein Browser lokale Dateiseiten einschränkt, ist der mitgelieferte lokale Server der dokumentierte alternative Startweg.


## Ergänzungen am 17. November 2026

**31 automatisierte Tests bestanden, 0 fehlgeschlagen.** 13 neue Prüfungen ergänzen die bisherigen 18 Tests. Sie prüfen die vier Richtungen der δ-Definition, Austausch vorwärts/rückwärts und Grenzwerte, C–O-Kopplung, drei Thermometerrichtungen mit konsistenter Skala, Geothermie, Fluid-Szenarien, strikte Screening-Grenzen, fehlende/konstante Stichproben, Tabellenformate, Textregeln und Tabellenausgaben in allen Exporten.

| Assignment-3-Kontrolle | Sollwert / Ergebnis |
|---|---|
| 50 % O-Reset, kO = 1,85 | N = 0,3746741517 kg/kg |
| δO = −7 ‰, primär 0, Endpunkt −7,38 | N = 1,603436576 kg/kg; δC ≈ +3,98876175 ‰ |
| δC = +1 ‰, primär +4, Endpunkt −10 | N ≈ 481,52 kg/kg; δO nähert sich −7,38 ‰ |
| Zement −8 VPDB; Wasser −1, +2, +5 VSMOW | T = 49,737189; 68,059520; 88,521312 °C |
| T0 = 15 °C, Gradient 30 °C/km | z = 1,157906; 1,768651; 2,450710 km |
| Screening aller fünf Kriterien | B1, B2, B3, B5 bleiben; B4, B6, B7, B8 scheiden aus |
| δO-Mittel alle / gescreent | −5,9875 / −4,725 ‰ VPDB |
| Temperatur aus mittlerem δ, Wasser −1 VSMOW | 38,4286 / 31,7409 °C; Bias +6,68775 °C |
| Pearson-r alle / gescreent | ca. 0,898947 / 0,031607 |

Zusätzliche tatsächliche Browserkontrollen:

- Bestehender Arbeitsbereich der Version 1 bleibt erhalten; Assignment-3-Beispiele separat ergänzt.
- Reset-Anteil 1 erzeugt die korrekte Grenzwertmeldung; 0,5 mit Dezimalkomma berechnet wieder 0,374674 kg/kg.
- Screening zeigt alle acht Einzelentscheidungen und Ablehnungsgründe sowie den korrekten Bias. Nach Neuladen bleiben Daten und Berechnung erhalten.
- Formelbibliothek: Suche „Reset“ und Filter „Grundlagen & Standards“ liefern passende Module.
- Schmale Ansicht geprüft: Dokumentbreite entspricht Ansichtsbreite; Aufgabenleiste und Ergebnistabellen scrollen intern. Die eingebettete Browseransicht verwendet zusätzlich eine Zoomstufe.
- Screening als XLSX und JSON heruntergeladen. ZIP-Integrität, alle enthaltenen XML-Strukturen und numerische Tabellenzellen der XLSX unabhängig geprüft. Die native Excel-Anzeige wurde nicht erneut geprüft.
- Die PDF-Funktion nutzt weiterhin die dokumentierte Druckansicht. Eine neu gespeicherte PDF-Seitenfolge wurde in diesem Durchlauf nicht visuell geprüft.

Die angegebenen Rechengenauigkeiten belegen die korrekte Implementierung der gewählten Modelle; sie sind keine analytischen Messunsicherheiten. Die Originalkalibrierung und die Extrapolationshinweise müssen für reale Proben fachlich geprüft werden.
