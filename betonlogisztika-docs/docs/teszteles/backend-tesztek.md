# Backend tesztek

A backend működését Jest tesztekkel ellenőriztük. A tesztek a `tests` mappában találhatók.

## Tesztelt funkciók

- **Regisztráció** – sikeres regisztráció, hiányzó mezők kezelése, duplikált email ellenőrzése
- **Bejelentkezés** – helyes és hibás bejelentkezési kísérletek, hiányzó adatok
- **Ajánlatkérés** – sikeres ajánlatkérés, kapacitás ellenőrzés, hiányzó mezők
- **Ajánlatok listázása** – saját ajánlatok lekérése, jogosultság ellenőrzés
- **Megrendelés** – sikeres megrendelés, státuszkezelés, törlés
- **Admin funkciók** – felhasználók, ajánlatok, megrendelések kezelése

## Teszteredmények

A tesztek sikeresen lefutottak, mind a 31 teszt zöld.

![Backend tesztek](/img/teszteredmeny.png)
