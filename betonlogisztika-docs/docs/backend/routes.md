# Routes mappa

A routes mappában lévő fájljaink célja:

- Importálják az express-t, a router objektumot, a szükséges controller fájlokat, valamint az authenticateToken middleware-t
- Kezelik az adott táblákhoz vagy funkciókhoz tartozó útvonalakat
- Meghatározzák, hogy egy adott HTTP kérés, melyik controller függvényt hívja meg
- Exportálják a router modult, biztosítva, hogy a route-ok felhasználhatók legyenek más fájlokban

![Routes kód](/img/routes-kod.png)
