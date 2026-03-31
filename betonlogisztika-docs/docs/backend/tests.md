# Tests mappa

A tests mappában helyeztük el a backend működését ellenőrző Jest teszteket. A Jest egy elterjedt JavaScript tesztelő keretrendszer, amelyet a Node.js alkalmazások tesztelésére használunk.

![Tests mappa](/img/tests-mappa.png)

Segítségével ellenőrizzük, hogy az API végpontok megfelelően működnek-e, a hibás bemenetekre a várt hibaüzeneteket adják e vissza, valamint, hogy az adatbázis műveletek helyesen futnak-e le.

Nálunk például a register.test.js a következő adatokat vizsgálja: a sikeres regisztrációt, a hiányzó mezők esetén kapott 400-as hibát, valamint a duplikált email cím kezelését. A login.test.js pedig a helyes és hibás bejelentkezési kísérleteket, valamint a hiányzó adatokkal küldött kérések kezelését teszteli.

![Teszteredmény](/img/teszteredmeny.png)
