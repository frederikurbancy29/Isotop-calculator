# Geochemical Isotope Calculator

Kostenlose, lokale Web-App für geochemische Isotopenaufgaben. Statisches HTML/CSS/JavaScript, ohne Python, Installation, Build-Schritt, Benutzerkonto, API-Schlüssel oder externe Bibliotheken. Die Anwendung lädt keine Schriftarten, Skripte oder Daten aus dem Internet.

## Als Website auf GitHub Pages

Die Anwendung ist für statisches Hosting vorbereitet. Im Repository liegen `index.html`, die JavaScript-/CSS-Dateien und `package.json` direkt auf der obersten Ebene. Wird sie in ein bereits bestehendes Projekt integriert, müssen die Pfade im Veröffentlichungsablauf entsprechend angepasst werden.

1. Den Inhalt dieses Projektordners in das gewünschte GitHub-Repository übernehmen.
2. Im Repository unter **Settings → Pages → Build and deployment → Source** die Option **GitHub Actions** auswählen.
3. Die Änderung auf den Standardbranch des Repositories übertragen. Der Ablauf **Test and publish calculator** prüft die Berechnungen und veröffentlicht anschließend die Website. Er kann auch über **Actions → Run workflow** auf dem Standardbranch gestartet werden. Bei einem privaten Repository bleibt die Veröffentlichung zunächst aus; nach Freischaltung von Pages kann beim manuellen Start **publish_site** aktiviert werden. Öffentliche Repositories veröffentlichen automatisch.
4. Die tatsächliche Website-Adresse wird nach erfolgreicher Veröffentlichung bei **Settings → Pages** und in der Deployment-Ausgabe angezeigt.

Die vorbereitete Datei `.github/workflows/pages.yml` führt Tests auch für andere Branches und Pull Requests aus. Veröffentlicht wird ausschließlich eine geprüfte Fassung des Standardbranches. `scripts/build.mjs` erstellt dafür `dist/` aus den neun Dateien der Browseranwendung und einer `.nojekyll`-Datei. `dist/` wird automatisch erzeugt und gehört nicht in die Versionsverwaltung. Es sind keine zusätzlichen Pakete nötig.

Lokal kann dieselbe Vorbereitung mit `npm run build` oder `node scripts/build.mjs` geprüft werden. Der Doppelklick-Start von `index.html` funktioniert weiterhin ohne diesen Vorbereitungsschritt.

GitHub Pages ist bei GitHub Free für öffentliche Repositories verfügbar. Für eine Veröffentlichung aus einem privaten Repository ist ein entsprechender GitHub-Tarif erforderlich. Quellen: [GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages), [Veröffentlichung über GitHub Actions](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

**Projekte bleiben lokal:** Auch beim Aufruf der veröffentlichten Website liegen eigene Eingaben und Aufgaben im Speicher des jeweiligen Browsers. Das Hosting ergänzt keinen Benutzer-Login und keine Synchronisierung zwischen Geräten. Vor dem Wechsel von der Dateiversion oder `localhost` zur Website Projekte als JSON sichern und dort importieren.

## Sofort starten

1. Das heruntergeladene ZIP vollständig entpacken.
2. Den Ordner `geochemical-isotope-calculator` öffnen.
3. `index.html` im Browser öffnen, z. B. per Doppelklick oder „Öffnen mit“ → Safari, Chrome, Firefox oder Edge.

Alle Dateien im Ordner zusammenlassen. Die Anwendung braucht aktiviertes JavaScript und einen aktuellen Browser. Für die direkte Dateinutzung ist keine Internetverbindung erforderlich. Browser unterscheiden sich darin, wie sie Speicher für `file://`-Seiten behandeln. Bleibe beim gleichen Browserprofil und Dateipfad und sichere Projekte regelmäßig als JSON. Wenn der Browser keinen dauerhaften Speicher bereitstellt, zeigt die App das ausdrücklich an.

## Optional: unter einer festen lokalen Adresse starten

Falls direkte Dateiseiten im Browser eingeschränkt sind, kann ein mitgelieferter lokaler Server verwendet werden. Dafür ist lediglich Node.js ab Version 18 nötig; es müssen keine Pakete installiert werden.

Im Projektordner:

```sh
node server.mjs
```

Dann die angezeigte Adresse im Browser öffnen: `http://127.0.0.1:8796`. Der Server ist nur auf diesem Computer erreichbar. Mit `Ctrl+C` beenden. Alternativ: `npm start`. Die Oberfläche und alle Berechnungen funktionieren auch hier ohne Internetverbindung. Port optional über die Umgebungsvariable `PORT` ändern.

Die Dateiseite und die HTTP-Seite haben verschiedene Browser-Speicher. Projekte über JSON zwischen beiden übertragen. Für mehrere Browserfenster gilt: Nach einem Speichervorgang in einem anderen Fenster zeigt die App einen Konflikthinweis und stoppt weitere automatische Schreibvorgänge in der älteren Ansicht.

## Arbeiten mit Projekten und Aufgaben

- Projektordner erstellen, umbenennen, beschreiben und löschen.
- Aufgaben erstellen, benennen, duplizieren, zwischen Projekten verschieben und löschen.
- Aufgabenstellung und eigene Notizen speichern.
- Status: Offen, In Bearbeitung, Abgeschlossen. Abschluss erst nach gültiger Berechnung.
- Aufgaben durchsuchen und nach Status filtern.
- Parameteränderungen machen ein bisheriges Ergebnis ungültig. Nach Änderungen erneut berechnen.
- `Ctrl+Enter` bzw. `Cmd+Enter` berechnet die aktive Aufgabe.
- Jede Änderung wird automatisch lokal gespeichert. Der Speicherstatus steht oben rechts.

Beim ersten Öffnen enthält „Isotopen · Übungsatelier“ acht Grundbeispiele; „Assignment 3 · Diagenese“ enthält fünf weitere Aufgaben mit den bereitgestellten Lehrdaten. Bestehende Arbeitsbereiche bleiben erhalten; dort ergänzt „Assignment-3-Beispiele“ das neue Projekt auf Wunsch. Eigene neue Aufgaben starten mit leeren Zahlenfeldern. „Beispiel laden“ setzt die Zahlenfelder auf die dokumentierten Übungswerte.

## Berechnungsmodule

Die Formelbibliothek ordnet 14 Module nach sieben Themen und lässt sich nach Formel, Thema oder Anwendungsfall durchsuchen. Jede Methode erläutert ihren Zweck, die Voraussetzungen und die verwendeten Quellen.

| Modul | Unterstützte Wege |
|---|---|
| δ ↔ Isotopenverhältnis | Relatives R/RStandard oder absolutes R mit ausdrücklich eingegebenem Referenzwert |
| δ¹³C-Mischung | δmix, fA, δA oder δB; C-Anteil oder konzentrationsgewichteter Materialanteil |
| α / ε / Δ | δ-Paar → α, ε, 1000 ln α und Δ; α, ε oder 1000 ln α ineinander umrechnen |
| δ¹⁸O-Temperaturänderung | Eisvolumenbeitrag abziehen; ΔT und optional Endtemperatur |
| Calcit–Wasser-Thermometer | Temperatur, Wasser-δ oder Calcit-δ; Kim & O’Neil 1997, Originalkonvention ausdrücklich bestätigen |
| Eis-Massenbilanz | Eisanteil und optional Eis-/Restwassermasse |
| Meeresspiegelbezug | Landeisvolumen mit Dichtekorrektur; alternativ vorgegebener linearer Isotopenbezug |
| Rayleigh | Restreservoir, momentanes und kumulatives Produkt |
| VSMOW ↔ VPDB | Ausschließlich δ¹⁸O; aktuelle oder klassische Relation, konsistente exakte Rückrichtung |

| Wasser–Gestein-Austausch | Mineral-δ, kumulatives N oder N für einen Ziel-Reset |
| Gekoppelter C–O-Austausch | Gleiches N für zwei Systeme, N aus gemessenem O oder C |
| Geothermie & Versenkung | T, z oder positiver Gradient im linearen Modell |
| Zement: Fluide & Ölzutritt | Mehrere Wasserhypothesen, T, z und bedingte Zeitfolge |
| Brachiopoden-Screening & Bias | Gefüge/CL/Spurenelemente; Mittelwerte, Stichproben-s, Pearson-r und Temperatur-Bias |

Die vollständigen Konventionen und Grenzen stehen direkt beim Ergebnis und in [METHODS.md](METHODS.md). Es gibt keine automatische Fehlerfortpflanzung. Die ausgegebene Anzahl an Ziffern ist keine Aussage über die Messunsicherheit.

## Eingaben und Textanalyse

Dezimalpunkt und Dezimalkomma werden akzeptiert. Keine Tausendertrennzeichen verwenden. Einheiten nicht ins Zahlenfeld schreiben, sondern die angegebene Einheit verwenden. `1.4e21` ist zulässig. Anteile stehen zwischen 0 und 1: `0,3` entspricht 30 %.

Die regelbasierte Erkennung läuft vollständig lokal. Sie interpretiert nur bestimmte Beschriftungen und Formulierungen; sie ist kein allgemeines Sprachmodell. Sie schlägt Werte zusammen mit Textbelegen vor und ergänzt keine fehlenden Zahlen. Mehrdeutige, widersprüchliche oder klar falsch dimensionierte Angaben werden zurückgehalten. Alle Vorschläge sind vor Übernahme abwählbar. Nach Übernahme Standards, Einheiten, Richtung, Vorzeichen und gesuchte Größe prüfen.

Gut erkennbare Beispiele:

```text
Mischung: δA = −25 ‰; δB = −5 ‰; fA = 30 %.
```

```text
Calculate the deep-water cooling from a benthic δ¹⁸O increase of 1.66 ‰,
assuming an ice-volume contribution of 1.0 ‰ and a sensitivity of
0.25 ‰ per °C cooling.
```

Komplexe mehrteilige Assignments in einzelne Aufgaben aufteilen. Nicht erkannte Parameter manuell eintragen. Das Wechseln der Methode setzt die Eingabeparameter zurück; Aufgabenstellung und Notizen bleiben erhalten.

## Exporte und Sicherungen

Einzelaufgaben, Projektordner und der gesamte Arbeitsbereich lassen sich exportieren:

- **PDF / Drucken:** Die App erstellt ein vollständiges Druckprotokoll. Im Druckdialog „Als PDF sichern“ bzw. „Save as PDF“ wählen. Papierformat A4; Browser-Kopf-/Fußzeilen bei Bedarf ausschalten. Eine PDF entsteht über den Browser, nicht über einen externen Dienst.
- **Excel (.xlsx):** Echte, im Browser erzeugte OOXML-Arbeitsmappe. Eine filterbare Tabelle enthält auch alle Zellen der Szenarien- und Screening-Tabellen sowie numerische Eingaben/Ergebnisse sowie Textformeln, Rechenschritte, Einheiten, Annahmen und Quellen. Ergebnisse sind feste Protokollwerte; Excel ist hier kein zweiter Berechnungskern.
- **CSV:** UTF-8 mit BOM, Semikolon und Dezimalkomma. Zahlen bleiben Zahlen; potenziell ausführbare Texte werden gegen Tabellenformel-Injektion geschützt.
- **JSON:** Vollständige Sicherung mit Aufgaben, Parameterwerten, Notizen, Status und Rechenkern-Version. Dieses Format wird wieder importiert.

„Projekte importieren“ fügt Kopien mit neuen Kennungen hinzu und überschreibt keine bestehende Aufgabe. Zahlen und Berechnungen werden beim Import neu validiert. Ungültige gespeicherte Ergebnisse werden als offene Entwürfe übernommen. Maximal 20 MB, 500 Projekte und 5000 Aufgaben pro Import. PDF, Excel und CSV werden nicht wieder importiert.

Browser-Speicher ist keine Datei-Sicherung. Das Löschen der Browserdaten, Privatmodus oder Wechsel von Browser/Profil/Pfad kann gespeicherte Daten entfernen oder unzugänglich machen. „Alles sichern“ → JSON regelmäßig verwenden.

## Prüfung und Quellen

Siehe [TESTS.md](TESTS.md) für Sollwerte und durchgeführte Prüfungen. Der frühere Chat lieferte den Testfall zur 2,64-°C-Abkühlung. Assignment 3 wurde anhand der bereitgestellten Datei „Sedimentary Geochemistry · Assignment 3 · Reading altered rocks“ ergänzt. Übernommen wurden die für die Rechnung benötigten Lehrdaten und Modellannahmen; die Originaldatei und personenbezogene Angaben werden nicht veröffentlicht. Weitere Beispiele sind konstruierte Prüfbeispiele. Eine Δ47-/Clumped-Isotope-Kalibrierung ist nicht implementiert, weil dafür keine aufgabenspezifischen Koeffizienten vorliegen.

Quellen sind in der App, den Exporten und [METHODS.md](METHODS.md) enthalten. Externe Quellenlinks benötigen zum Öffnen Internet; sie sind für den Betrieb der App nicht nötig.

## Projektstruktur und Weiterentwicklung

```text
index.html       Einstiegspunkt
styles.css       Responsive Oberfläche und A4-Druckansicht
app.js           Oberfläche, Projekte, Aufgaben und Bedienung
engine.js        Grundlegende Isotopenberechnungen
advanced.js      Assignment-3-Modelle, Statistik, inverse Thermometrie, Themen
parser.js        Lokale Textregeln mit Textbelegen
storage.js       IndexedDB / localStorage und Importschema
exports.js       JSON, CSV, XLSX und Druckprotokolle
server.mjs       Optionaler, ausschließlich lokaler HTTP-Server
tests/           Unabhängige Rechen- und Integrationsprüfungen
examples/        Importierbare Beispielsicherung
```

Tests mit Node.js, ohne Installation von Abhängigkeiten:

```sh
npm test
```

Oder direkt `node --test tests/*.test.cjs`. Das Programm nutzt normale Browser-APIs und speichert keine personenbezogenen Daten außerhalb dieses Geräts. Lizenz: MIT, siehe [LICENSE](LICENSE).
