# Middleware mappa

A middleware mappában tároltuk az auth.js fájlt, ami a JWT tokenek ellenőrzéséért felel. Az authenticateToken middleware kiolvassa a kérés fejlécéből a tokent, ellenőrzi annak érvényességét a titkos kulccsal, majd ha az érvényes, tovább engedi a kérést és a req.user-be elhelyezi a felhasználó adatait. Ha nincs token, 401-es, ha érvénytelen vagy lejárt, 403-as hibát küld vissza.

![Middleware kód](/img/middleware-kod.png)

A JWT token létrehozása az authController.js-ben történik regisztráció és bejelentkezés során. A token tartalmazza a felhasználó azonosítóját, email címét és jogosultságát, titkosítása a .env fájlban tárolt JWT_SECRET kulccsal történik, érvényességi ideje pedig 7 nap.
