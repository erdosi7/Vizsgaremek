# ER Modell

A tervezési fázisban az ER-modellt hívtuk segítségül, hogy még a kódolás előtt tisztázzuk a tárolni kívánt adatok típusait és azok egymáshoz való viszonyát. Ez a modell segít elkerülni a logikai ellentmondásokat, és egyértelmű térképet ad a teljes adatbázis struktúráról.

![ER Diagram](/img/er-diagram.png)

## Kapcsolatok

### felhasznalok ↔ ajanlatok (Egy a többhöz)
- Egy felhasználó több ajánlatot is kérhet
- Minden ajánlat pontosan egy felhasználóhoz tartozik
- *Miért?* Hogy tudjuk, ki kérte az ajánlatot, és később a saját ajánlatai között láthassa.

### felhasznalok ↔ megrendelesek (Egy a többhöz)
- Egy felhasználó több megrendelést is leadhat
- Minden megrendelés pontosan egy felhasználóhoz tartozik
- *Miért?* A felhasználó csak a saját megrendeléseit láthassa, és az admin tudja, ki rendelt.

### ajanlatok ↔ megrendelesek (Egy az egyhez)
- Egy ajánlatból legfeljebb egy megrendelés születhet
- Minden megrendelés pontosan egy ajánlathoz tartozik
- *Miért?* Így követhető, hogy melyik ajánlatból lett végül megrendelés.

### betongyartok ↔ ajanlatok (Egy a többhöz)
- Egy cég több ajánlatban is szerepelhet
- Minden ajánlat pontosan egy céghez tartozik
- *Miért?* Hogy tudjuk, melyik cégtől kérte a felhasználó az ajánlatot.

### betongyartok ↔ ceg_napi_kapacitas (Egy a többhöz)
- Egy cégnek több napra is lehet kapacitás foglalása
- Minden kapacitásfoglalás pontosan egy céghez tartozik
- *Miért?* Hogy nyomon követhessük, mennyit foglaltak le egy cégtől egy adott napon.

### beton_tipusok ↔ ajanlatok (Egy a többhöz)
- Egy beton típus több ajánlatban is szerepelhet
- Minden ajánlat pontosan egy beton típushoz tartozik
- *Miért?* Egységesíti a beton típusok kezelését.

### betonszal_tipusok ↔ ajanlatok (Egy a többhöz)
- Egy szál típus több ajánlatban is szerepelhet
- Minden ajánlat pontosan egy szál típushoz tartozhat (vagy NULL, ha nem kértek szálat)
- *Miért?* A szálas beton opciók egységes kezelése.

### betongyartok ↔ beton_tipusok (Több a többhöz)
- Egy cég több betontípust is rendelhet
- Egy beton típus több cégtől is elérhető
- A kapcsolattábla (betongyarto_arak) tárolja az árat is
- *Miért?* Mert ugyanaz a beton típus más-más áron lehet a különböző cégeknél.

## Struktúra

- **Normalizáció:** Elkerüljük az adatok többszörös tárolását
- **Adatintegritás:** Idegen kulcsokkal biztosítjuk, hogy ne lehessen nem létező rekordra hivatkozni
- **Történeti adatok:** Az ajánlatokban tárolt árak megőrzik a korabeli értékeket
- **Kapacitáskezelés:** A ceg_napi_kapacitas tábla külön választva lehetővé teszi, hogy naponta kövessük a foglalásokat
- **Rugalmasság:** Könnyen bővíthető új cégekkel, beton típusokkal