# Formelbibliothek · Version 2.0

14 Module, nach Thema und Anwendungsfall. Details und Modellgrenzen: [METHODS.md](METHODS.md).

## Grundlagen & Standards

### VSMOW ↔ VPDB

δ¹⁸O desselben Materials zwischen den Skalen umrechnen. Ausschließlich Sauerstoff-18.

- Carbonat und Wasser auf dieselbe δ¹⁸O-Skala bringen

- δVSMOW = 1,03092 δVPDB + 30,92 ‰ (aktuelle Relation)

Berechnungskennung: `standards`.

### δ ↔ Isotopenverhältnis

δ-Notation in ein relatives oder absolutes Isotopenverhältnis umrechnen und zurück.

- δ-Notation verstehen
- Verhältnisse konsistent vergleichen

- δ = 1000(R/RStandard − 1)

Berechnungskennung: `delta`.

## Mischung & Massenbilanz

### δ¹³C-Mischung

Zwei Endglieder mischen oder die Mischungsformel nach einer Unbekannten umstellen.

- Quellenanteile aus δ¹³C bestimmen
- C-Konzentrationen berücksichtigen
- Endglied oder Mischungswert rekonstruieren

- δmix ≈ wA δA + (1 − wA) δB

Berechnungskennung: `mixing`.

## Fraktionierung & offene Systeme

### α / ε / Δ

Fraktionierungsfaktor, Anreicherungsfaktor und δ-Differenz mit eindeutiger Richtung A/B.

- A/B-Richtung prüfen
- ε und 1000 ln α unterscheiden

- αA/B = (1000 + δA)/(1000 + δB)
- ε = 1000(α − 1); εln = 1000 ln α; Δ = δA − δB

Berechnungskennung: `fractionation`.

### Rayleigh-Fraktionierung

Restreservoir sowie momentan und kumulativ entferntes Produkt bei konstantem αProdukt/Rest.

- Restreservoir bei Entnahme
- Momentanes und kumulatives Produkt

- δRest + 1000 = (δ₀ + 1000) F^(α − 1)

Berechnungskennung: `rayleigh`.

## Diagenese & Gesteine

### Wasser–Gestein-Austausch

Gesteins-δ, Wasser/Gestein-Verhältnis N oder einen vorgegebenen Reset-Anteil berechnen.

- Assignment 3, Problem 1A/B
- N für 50 % oder 95 % Reset
- Signalveränderung aus Fluidkontakt

- δr = δeq + (δ₀ − δeq) exp(−N Cw/Cr)
- f = 1 − exp(−N Cw/Cr)

Berechnungskennung: `exchange`.

### Gekoppelter C–O-Austausch

Dasselbe N für Sauerstoff und Kohlenstoff verwenden; aus einem Messwert das andere System vorhersagen.

- Assignment 3, Problem 1C
- Unterschiedliche Erhaltung von C und O

- Gleiches N; kO = Cw,O/Cr,O und kC = Cw,C/Cr,C

Berechnungskennung: `exchangePair`.

## Temperatur & Versenkung

### Calcit–Wasser-Thermometer

Temperatur, Wasser-δ¹⁸O oder Calcit-δ¹⁸O aus dem Gleichgewicht nach Kim & O’Neil 1997 bestimmen.

- Bildungstemperatur von Calcit
- Fluid-δ bei unabhängig bekannter Temperatur
- Erwartetes Calcit-δ vorhersagen

- 1000 ln α = 18030/TK − 32,42
- α = (1000 + δc)/(1000 + δw) auf gemeinsamer Skala

Berechnungskennung: `thermometer`.

### Geothermie & Versenkung

Linearen geothermischen Gradienten nach Tiefe, Temperatur oder Gradient umstellen.

- Temperatur in Modell-Tiefe übersetzen

- T = T₀ + G z

Berechnungskennung: `burial`.

### Zement: Fluide & Ölzutritt

Mehrere Wasserhypothesen zu einem Calcitwert vergleichen: Temperatur, Tiefe und zeitliche Deutung.

- Assignment 3, Problem 2
- Fluidhypothesen vergleichen
- Porenverschluss vor/nach Ölzutritt

- Calcit-δ → α je Wasser → T → z → Vergleich mit Ölzutritt

Berechnungskennung: `scenarios`.

## Eis & Paläoklima

### δ¹⁸O → Temperaturänderung

Isotopenänderung in Eisvolumen- und Temperaturbeitrag zerlegen. Δ = später minus früher.

- Eisvolumenbeitrag abziehen
- Erwärmung oder Abkühlung aus Δδ¹⁸O

- ΔT = −(Δδc − Eisbeitrag)/s

Berechnungskennung: `temperature`.

### Eis-Massenbilanz

Abtrennung eines Eisspeichers aus einem anfangs eisfreien, geschlossenen Wasserreservoir.

- Mittleren Eisanteil aus einer geschlossenen Bilanz bestimmen

- fEis = (δ₁ − δ₀)/(δ₁ − δEis)

Berechnungskennung: `ice`.

### Meeresspiegelbezug

Globales Meeresspiegeläquivalent aus Landeis oder eine ausdrücklich gewählte Isotopen-Sensitivität.

- Landeisvolumen in Wasseräquivalent umrechnen
- Vorgegebenen m/‰-Zusammenhang anwenden

- Δh = ± VEis ρEis/(ρWasser AOzean)
- Alternativ Δh = −k Δδw

Berechnungskennung: `sea`.

## Probenprüfung & Statistik

### Brachiopoden-Screening & Bias

Gefüge, CL und Spurenelemente prüfen; Mittelwerte, Pearson-r und Temperatur-Bias vergleichen.

- Assignment 3, Problem 3
- Behalten oder verwerfen begründen
- Mittelwerte, Pearson-r und Bias

- Alle Kriterien müssen gleichzeitig erfüllt sein
- r = Σ[(xi − x̄)(yi − ȳ)]/√(Σ(xi − x̄)² Σ(yi − ȳ)²)
- Bias = Talle − Tgescreent

Berechnungskennung: `screening`.
