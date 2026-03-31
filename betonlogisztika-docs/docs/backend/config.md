# Config mappa

A config mappában található a database.js fájl, amely létrehozza a kapcsolatot az adatbázissal:

- A host beállítja, hogy hol fut az adatbázis szerver (alapértelmezetten localhost)
- A user az adatbázis felhasználóneve (alapértelmezetten root)
- A password az adatbázishoz tartozó jelszó
- A database az adatbázis neve (alapértelmezetten beton_db)
- A connectionLimit meghatározza, hogy egyszerre hány kapcsolat lehet nyitva
- A .promise() biztosítja, hogy a lekérdezéseket async módon használhassuk

![Config kód](/img/config-kod.png)

A fájl induláskor ellenőrzi a kapcsolatot és kiírja a sikeres csatlakozást, valamint kilistázza az elérhető táblákat. A kapcsolat végén exportáljuk a db objektumot, hogy más fájlok is használhassák.
