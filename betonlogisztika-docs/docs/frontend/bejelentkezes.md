# Bejelentkezés

A bejelentkezési felület az App.jsx-ben található LoginPage komponensben van megvalósítva. Az űrlap tartalmazza az email cím és jelszó mezőket, ahol a jelszó egy szem ikonra kattintva láthatóvá tehető.

![Bejelentkezés](/img/bejelentkezes.png)

A felhasználó adatait a rendszer ellenőrzi, majd sikeres hitelesítés esetén a válaszban kapott tokent elmenti a localStorage-ba, megjelenik egy sikeres visszajelző animáció, majd 3 másodperc múlva automatikusan átirányít a főoldalra. Hibás adatok esetén a megfelelő hibaüzenet jelenik meg. Az oldal a főoldalon bemutatott egységes fejléccel és lábléccel rendelkezik.

