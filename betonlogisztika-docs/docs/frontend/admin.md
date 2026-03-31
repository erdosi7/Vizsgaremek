# Admin Dashboard

Az AdminDashboard.jsx felület a rendszer teljes körű felügyeletét és kezelését biztosítja az adminisztrátorok számára. Az oldal négy fő modulra tagolódik: ajánlatok, megrendelések, felhasználók és partnerek kezelése.

![Admin Dashboard](/img/admin-dashboard.png)

**Ajánlatok modul:** itt látható az összes leadott ajánlat, szűrhetők státusz szerint és kereshető a felhasználó neve, email-je vagy az ajánlatszám alapján. Az admin módosíthatja az ajánlatok státuszát, valamint törölheti azokat.

**Megrendelések modul:** az összes megrendelés megjelenik itt, státusz szerint szűrhetők és kereshető a felhasználó, rendelésszám vagy ajánlatszám alapján. Az admin itt is módosíthatja a státuszokat és törölheti a megrendeléseket.

**Felhasználók modul:** itt kezelhetők a regisztrált felhasználók. Az admin új felhasználót hozhat létre, szerkesztheti és törölheti. A törlés csak akkor lehetséges, ha a felhasználónak nincsenek ajánlatai vagy megrendelései.

**Partnerek modul:** a betongyártó partnerek kezelésére szolgál. Az admin új partnert vehet fel, szerkesztheti, valamint törölheti őket, ha nincsenek kapcsolódó foglalásaik.

Az oldal a főoldalon bemutatott egységes fejléccel és lábléccel rendelkezik.