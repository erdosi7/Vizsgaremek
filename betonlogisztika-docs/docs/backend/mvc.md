# MVC technológia

A backendünket MVC (Model-View-Controller) technológiával hoztuk létre.

## Model (Modell)

Ez a réteg kezeli az adatbázis műveleteket és az üzleti logikát. Itt történik az adatok lekérdezése, mentése, validálása és formázása. A Model biztosítja, hogy az adatok mindig logikusak és érvényesek legyenek, mielőtt azok a Controllerek felé átadódnának. Ezáltal a kód tisztább, áttekinthetőbb és könnyebben tesztelhető.

## View (Nézet)

A nézet réteg felel a felhasználói felületért és a megjelenítésért. Ez az, amit a felhasználó lát és használ, pl. gombok, űrlapok. A View fogadja a felhasználói interakciókat, majd továbbítja azokat a Controller felé és amikor megérkeznek a kért adatok a Modeltől, gondoskodik azok szép, áttekinthető megjelenítéséről.

## Controller (Vezérlő)

A Controller a kapocs a Model és a View között. Fogadja a felhasználótól érkező kéréseket, ellenőrzi az adatokat, majd továbbítja a Model felé a szükséges műveleteket. Amikor a Model elvégezte a dolgát, a Controller összegyűjti az eredményeket és visszaküldi a Nézetnek, hogy az megtudja jeleníteni a felhasználónak. A Vezérlő egy nélkülözhetetlen közvetítő, ami a logikát és az adatkezelést is kézben tartja és gondoskodik arról, hogy a frontend mindig a legfrissebb adatokat lássa.