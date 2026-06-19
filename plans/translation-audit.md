# Prijevod Audit - MusafirBanjaLuka

## Pregled

Primarni jezik: **Bosanski (bs.json)**
Prevedeni jezici: Engleski (en.json), Njemački (de.json), Turski (tr.json)

---

## 1. Strukturni problemi - svim fajlovima nedostaju ključevi

Sljedeći `data-i18n` ključevi se koriste u [`index.html`](../index.html) ali **ne postoje ni u jednom** prijevodnom fajlu:

| Ključ             | Kontekst (HTML linija)       | Prijedlog za bs                                        |
| ----------------- | ---------------------------- | ------------------------------------------------------ |
| `historical_site` | 652                          | "Historijski lokalitet"                                |
| `city_center`     | 662, 753                     | "Gradski centar"                                       |
| `natural_wonder`  | 712                          | "Prirodno čudo"                                        |
| `free_entry`      | 732                          | "Besplatan ulaz"                                       |
| `map`             | 674, 703, 734, 763, 795, 824 | "Mapa" (bs.json ima `map_link` ali HTML koristi `map`) |

> **Napomena:** [`bs.json`](../lang/bs.json:118) trenutno ima `map_link` ali HTML nikad ne koristi `data-i18n="map_link"` - koristi `data-i18n="map"`. Potrebno dodati `map` ključ u sve fajlove.

---

## 2. Bosanski (bs.json) - primarni jezik

### Tipografske greške

| Linija | Trenutno       | Ispravljeno  |
| ------ | -------------- | ------------ |
| 21     | `smještenenih` | `smještenih` |

### Formatiranje JSON-a

| Linija  | Problem                       | Ispravka                                                 |
| ------- | ----------------------------- | -------------------------------------------------------- |
| 14      | `"centar":"Centar grada"`     | `"centar": "Centar grada"` (nedostaje space nakon colon) |
| 25      | 4 spaces umjesto 2            | Popraviti indentaciju                                    |
| 45      | `"free":"Besplatno"`          | `"free": "Besplatno"` (nedostaje space nakon colon)      |
| 57      | 5 spaces umjesto 2            | Popraviti indentaciju                                    |
| 65      | 4 spaces umjesto 2            | Popraviti indentaciju                                    |
| 107-118 | `,` na početku linija 118,119 | Popraviti format                                         |

### Dosljednost kapitalizacije

U bosanskom jeziku, nazivi/title-ovi se pišu **sentence case** (samo prva riječ velika), ne title case. Ispravke:

| Linija | Trenutno                             | Ispravljeno                                                      |
| ------ | ------------------------------------ | ---------------------------------------------------------------- |
| 5      | `"Muslimanski Restorani"`            | `"Muslimanski restorani"`                                        |
| 8      | `"Centralna Džamija"`                | `"Centralna džamija"`                                            |
| 12     | `"Ženski Odjel"`                     | `"Ženski odjel"`                                                 |
| 17     | `"Glavne Atrakcije"`                 | `"Glavne atrakcije"`                                             |
| 23     | `"Priroda i Parkovi"`                | `"Priroda i parkovi"`                                            |
| 31     | `"Brzi Linkovi"`                     | `"Brzi linkovi"`                                                 |
| 41     | `"Kibla Smjer"`                      | `"Smjer kible"` (prirodniji)                                     |
| 42     | `"Jugoistok (135° od Sjevera)"`      | `"Jugoistok (135° od sjevera)"`                                  |
| 47     | `"Historijski Spomenik"`             | `"Historijski spomenik"`                                         |
| 56     | `"Provjereno Meso"`                  | `"Provjereno meso"`                                              |
| 59     | `"Kupovina i Gastronomija"`          | `"Kupovina i gastronomija"`                                      |
| 60     | `"Stari Grad"`                       | `"Stari grad"`                                                   |
| 61     | `"Pješačka Zona"`                    | `"Pješačka zona"`                                                |
| 62     | `"Slobodan Pristup"`                 | `"Slobodan pristup"`                                             |
| 65     | `"Gradski Park"`                     | `"Gradski park"`                                                 |
| 67     | `"Mirno Utočište"`                   | `"Mirno utočište"`                                               |
| 68     | `"Vrbas Rijeka i Kanjon Tijesno"`    | `"Rijeka Vrbas i kanjon Tijesno"` (prirodniji red riječi)        |
| 70     | `"Avantura u Prirodi"`               | `"Avantura u prirodi"`                                           |
| 74     | `"Sportska Avantura"`                | `"Sportska avantura"`                                            |
| 80     | `"Osnovne Bosanske Fraze"`           | `"Osnovne bosanske fraze"`                                       |
| 82     | `"Fraze Knjiga"`                     | `"Rječnik fraza"` (gramatički ispravno)                          |
| 98     | `"Osnovne Informacije"`              | `"Osnovne informacije"`                                          |
| 100    | `"Osnovne Potrepštine za Putovanje"` | `"Osnovne potrepštine za putovanje"`                             |
| 101    | `"Smjer Kible"`                      | `"Smjer kible"`                                                  |
| 103    | `"Saznajte Više"`                    | `"Saznajte više"`                                                |
| 104    | `"Hitni Kontakti"`                   | `"Hitni kontakti"`                                               |
| 108    | `"Hitna pomoć: 124"`                 | `"Ambulanta: 124"` (isto kao hitna pomoć 112, treba razlikovati) |

### Prevod kvaliteta

| Linija | Trenutno        | Problem           | Ispravljeno     |
| ------ | --------------- | ----------------- | --------------- |
| 27     | `"Vidi & Radi"` | `&` nije bosanski | `"Vidi i radi"` |

---

## 3. Engleski (en.json)

- Dodati nedostajuće ključeve: `historical_site`, `city_center`, `natural_wonder`, `free_entry`, `map`
- Ostali prijevodi su dobri.

---

## 4. Njemački (de.json) - KRITIČNA GREŠKA

| Linija | Trenutno               | Značenje              | Ispravljeno             |
| ------ | ---------------------- | --------------------- | ----------------------- |
| 29     | `"nav_pray": "Betten"` | **"Kreveti"** (beds!) | `"Gebet"` ili `"Beten"` |

Ovo je kritična greška - "Betten" znači "kreveti" na njemačkom, dok "Beten" znači "moliti" ili "Gebet" znači "molitva".

Dodati nedostajuće ključeve: `historical_site`, `city_center`, `natural_wonder`, `free_entry`, `map`

---

## 5. Turski (tr.json)

| Linija | Trenutno                       | Problem                                                       | Ispravljeno                                           |
| ------ | ------------------------------ | ------------------------------------------------------------- | ----------------------------------------------------- |
| 2      | `"app_name": "HalalBanjaLuka"` | Nekonzistentno sa ostalim jezicima (imaju `MusafirBanjaLuka`) | `"MusafirBanjaLuka"` (osim ako je namjerno drugačije) |

Dodati nedostajuće ključeve: `historical_site`, `city_center`, `natural_wonder`, `free_entry`, `map`

---

## 6. Redoslijed ispravki

1. Popraviti [`bs.json`](../lang/bs.json) - primarni jezik (tipografija, formatiranje, kapitalizacija, dodati ključeve)
2. Popraviti [`de.json`](../lang/de.json) - kritična greška "Betten" + dodati ključeve
3. Popraviti [`tr.json`](../lang/tr.json) - app_name konzistentnost + dodati ključeve
4. Popraviti [`en.json`](../lang/en.json) - dodati ključeve
5. Verifikacija - provjeriti da svi `data-i18n` iz HTML-a imaju odgovarajući ključ u svim fajlovima
