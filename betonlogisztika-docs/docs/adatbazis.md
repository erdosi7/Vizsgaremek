# Adatbázis

Az adatbázisunk elengedhetetlen volt a projektünk létrehozásában, mivel biztosította az adatok strukturált tárolását és kezelését. Segítségével az információk könnyen elérhetők, módosíthatók és lekérdezhetők voltak, ami hozzájárult a rendszer megbízható működéséhez. Az adatbázis megfelelő felépítése alapot adott a szoftver hatékony fejlesztéséhez és teszteléséhez. A végleges adatbázisunk tervezése közben, sok problémába ütköztünk, így folyamatos fejlesztésre szorult.

![Adatbázis táblák](/img/adatbazis-tablak.png)

Az adatbázisunk 8 táblát tartalmaz:

## ajanlatok

- **id** – Egyedi azonosító
- **felhasznalo_id** – Ki kérte az ajánlatot (kapcsolat a felhasznalokkal)
- **ajanlatszam** – Egyedi ajánlatszám
- **beton_tipus_id** – Milyen beton (kapcsolat a beton_tipusokkal)
- **betonszal_tipus_id** – Milyen szálas a beton, lehet üres is
- **betongyarto_id** – Melyik cégtől kérte (kapcsolat a betongyartokkal)
- **mennyiseg** – Mennyi m³ kell
- **pumpa_szukseges** – Kell a betonpumpa (igen vagy nem)
- **szallitas_datum** – Mikorra kéri a rendelést
- **iranyitoszam, telepules, utca, hazszam** – Szállítási cím
- **latitude, longitude** – Koordináták a távolság számításhoz
- **tavolsag_keszthelytol** – Kiszámolt távolság (szállítási díjhoz)
- **beton_koltseg, pumpa_koltseg, betonszal_koltseg, szallitas_koltseg** – Részletes költségek
- **netto_osszeg** – Összeg Áfa nélkül
- **afa_osszeg** – Áfa (27%)
- **brutto_osszeg** – Végösszeg
- **statusz** – függőben, elfogadva, elutasítva, lejárt, megrendelve
- **letrehozas_datum** – Mikor jött létre az ajánlat
- **ervenyes_ig** – +30 nap az ajánlat érvényessége

## betongyartok

- **id** – Egyedi azonosító (1-től 9-ig)
- **nev** – Cég teljes neve
- **telephely_nev** – Telephely megnevezése
- **latitude, longitude** – Földrajzi koordináták (távolság számításhoz)
- **napi_kapacitas** – Maximum hány m³ betont tud szállítani egy nap
- **website** – Az eredeti cég oldalának címe
- **telefon** – Az eredeti cégek telefonszáma

## betongyarto_arak

- **id** – Egyedi azonosító
- **betongyarto_id** – Melyik céghez tartozik az ár (kapcsolat a betongyartokkal)
- **beton_tipus_id** – Melyik beton típushoz tartozik az ár (kapcsolat a beton_tipusokkal)
- **egysegar** – Az adott cég által kínált ár forintban

## betonszal_tipusok

- **id** – Egyedi azonosító
- **tipus_kod** – Rendszerben használt kód, pl. acel
- **megnevezes** – Felhasználó számára olvasható név
- **egysegar** – Mennyivel drágítja a betont (m³-enként)

## beton_tipusok

- **id** – Egyedi azonosító (1-tól 6-ig)
- **tipus_kod** – Szabványos kód, pl. c8-10
- **megnevezes** – Felhasználó számára olvasható adat, pl. Tömörbeton
- **egysegar** – Alapár

## ceg_napi_kapacitas

- **id** – Egyedi azonosító
- **betongyarto_id** – Melyik céghez tartozik a foglalás
- **datum** – Melyik napra vonatkozik a foglalás
- **lefoglalt_mennyiseg** – Összesen mennyi m³ van már lefoglalva erre a napra

## felhasznalok

- **id** – Egyedi azonosító amely automatikusan növekszik
- **nev** – Felhasználó teljes neve
- **email** – Egyedi, bejelentkezéshez használjuk
- **jelszo** – Titkosított jelszó
- **cegnev** – Opcionális, ha céges ügyfél
- **telefon** – Kapcsolattartáshoz
- **regisztracio_datum** – Automatikusan rögzítjük mikor regisztrált
- **jogosultsag** – User vagy admin

## megrendelesek

- **id** – Egyedi azonosító
- **megrendeles_szam** – Egyedi rendelésszám
- **ajanlat_id** – Melyik ajánlatból érkezett a rendelés
- **felhasznalo_id** – Ki rendelte
- **adoszam** – Kötelező adat
- **megjegyzes** – Opcionális megjegyzés
- **brutto_osszeg** – Végösszeg forintban
- **statusz** – feldolgozás alatt, szállítás alatt, véglegesítve, sikertelen
- **letrehozas_datum** – Mikor jött létre a megrendelés
- **szallitas_datum** – Mikorra kérik a szállítást
- **szallitas_iranyitoszam, szallitas_telepules, szallitas_utca, szallitas_hazszam** – Szállítási cím
- **szamlazasi_iranyitoszam, szamlazasi_telepules, szamlazasi_utca, szamlazasi_hazszam** – Számlázási cím