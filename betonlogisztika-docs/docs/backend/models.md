# Models mappa

A models mappában találhatók az adatbázis tábláinak fájljai. Natív SQL lekérdezéseket használtunk a mysql2 csomag segítségével, ami nagyobb rugalmasságot biztosít a bonyolultabb lekérdezéseknél is. A modellek JavaScript osztályokként vannak megírva, így objektum-orientált módon tudjuk kezelni az adatokat.

![Models kód](/img/models-kod.png)

A modellek tartalmazzák az adatbázis műveleteket, a validációkat, valamint egymás metódusait is hívhatják. A fájlok végén az exportálás teszi elérhetővé a modelleket a controllerek számára.

- Kapcsolódik más modellekhez, vagyis a többi táblához
- Elvégzi a szükséges validációkat az adott mezőkhöz, pl. a jelszó legalább 6 karakter hosszúnak kell lenni a regisztrációhoz
- Automatikusan generál egyedi azonosítókat
- Törlés előtt ellenőrzi a függőségeket
