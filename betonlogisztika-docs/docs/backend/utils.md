# Utils mappa

Az utils mappában található a helpers.js fájl, amely segédfüggvényeket tartalmaz az alkalmazás működéséhez. Ilyen például a szállítási költség kiszámolásáért felelő calculateSzallitasKoltseg függvény, amely a távolság és a mennyiség alapján határozza meg a díjat, valamint a calculateAr függvény, amely a beton árát, a pumpa költségét, a betonszálak árát és a szállítási díjat összeadva kiszámolja a nettó és a bruttó végösszeget.

![Utils kód](/img/utils-kod.png)

Ezeket a függvényeket a controller-ek hívják meg, így az üzleti logika egy helyen, jól szervezetten található.
