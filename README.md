# Szoftverfejlesztő és tesztelő záróvizsga – Vizsgaremek

**Résztvevők:** Erdősi Zsombor | Fáró Sebestyén

---

## Tartalomjegyzék

1. [Vizsgaremek célkitűzése](#vizsgaremek-célkitűzése)
2. [Feladat leírása, bemutatása](#feladat-leírása-bemutatása)
3. [Adatbázis architektúra](#adatbázis-architektúra)
4. [Szoftvertesztelés](#szoftvertesztelés)
5. [Tervezett vállalásaim – Fáró Sebestyén](#tervezett-vállalásaim--fáró-sebestyén)
6. [Tervezett vállalásaim – Erdősi Zsombor](#tervezett-vállalásaim--erdősi-zsombor)
7. [Fejlesztési eszközök](#fejlesztési-eszközök)
8. [Környezet és futtatás lépésről lépésre](#környezet-és-futtatás-lépésről-lépésre)

---

## Vizsgaremek célkitűzése

A webes alkalmazás célja, hogy egy online felületen tegyük lehetővé a betonrendeléssel és ajánlatkéréssel kapcsolatos összes fontos folyamat lebonyolítását, a regisztrációtól egészen a rendelés követéséig.

---

## Feladat leírása, bemutatása

Az alkalmazás használatához a felhasználónak regisztrálnia és bejelentkeznie kell, amely kötelező ajánlatkérés vagy megrendelés leadása esetén.

A bejelentkezést követően a felhasználó az alábbi funkciókat érheti el:

- **Ajánlatkérés** – Rövid űrlap kitöltése után a rendszer automatikus ajánlatot generál.
- **Megrendelés leadása** – Űrlap alapú rendszer segítségével.
- **Árkalkulátor** – Néhány adat megadását követően a rendszer automatikusan kiszámítja a várható árat ajánlatkérésnél.
- **Rendeléskövetés** – A felhasználó nyomon követheti rendelése állapotát.
- **Kapcsolat és információk** – Gyors kapcsolatteremtést biztosító elérhetőségi adatok, emailben való kapcsolatfelvétel.

Az alkalmazás kapcsolatban áll több betonszállító céggel, így a felhasználó kiválaszthatja, melyik szolgáltatótól szeretne rendelni (pl. távolság vagy elérhetőség alapján).

---

## Adatbázis architektúra

Az alkalmazás MySQL adatbázist használ, amely a következő főbb táblákból épül fel:

- **felhasznalok** – regisztrált felhasználók adatai (név, email, jelszó, jogosultság)
- **ajanlatok** – leadott ajánlatok (beton típus, mennyiség, ár, státusz)
- **megrendelesek** – leadott megrendelések (szállítási cím, adószám, státusz)
- **betongyartok** – partnerek (cégadatok, koordináták, napi kapacitás)
- **beton_tipusok** – elérhető beton típusok és árak
- **betonszal_tipusok** – betonszál opciók
- **betongyarto_arak** – cégekhez tartozó betonárak
- **ceg_napi_kapacitas** – napi kapacitás foglalások nyomon követése

Az adatbázis normalizált, idegen kulcsokkal biztosítja az adatintegritást.

---

## Szoftvertesztelés

A projekt során két szinten végeztünk tesztelést:

### Backend tesztek (Jest)

A backend API végpontjait Jest keretrendszerrel teszteltük. A tesztek a `tests` mappában találhatók és a következő területeket fedik le:

- Regisztráció (sikeres, hiányzó mezők, duplikált email)
- Bejelentkezés (helyes/rossz adatok, hiányzó mezők)
- Ajánlatkérés (sikeres mentés, kapacitás ellenőrzés)
- Ajánlatok lekérése (jogosultság ellenőrzés)
- Megrendelés (létrehozás, státuszkezelés, törlés)
- Admin funkciók (felhasználók, ajánlatok, megrendelések kezelése)

**Eredmény:** 31 teszt, mind sikeresen lefutott.

### Frontend tesztek (Selenium)

A felhasználói felület működését Selenium WebDriver segítségével teszteltük valós böngészőben. A tesztek a `tests/selenium` mappában találhatók:

- Regisztrációs űrlap validáció
- Bejelentkezési folyamat
- Ajánlatkérés űrlap kitöltése és beküldése
- Admin felület moduljainak ellenőrzése
- Kapcsolat űrlap működése

**Eredmény:** 30 teszt, mind sikeresen lefutott.

---

## Tervezett vállalásaim – Fáró Sebestyén

### Frontend
- Felhasználókezelés (regisztráció, bejelentkezés, kijelentkezés)
- Betongyártó telephelyek kezelése
- Webes design kialakítása
- Főoldal tervezése
- Frontend tesztelése (Selenium)

### Backend
- Adattáblák kezelése
- Adatbázis-tervezés (ER, EER diagramok készítése)
- Adatbázis kapcsolatok és modellek létrehozása
- API végpontok implementálása (pl. ajánlatok, partnerek)

---

## Tervezett vállalásaim – Erdősi Zsombor

### Frontend
- Ajánlatkérés kezelése
- Kapcsolatfelvétel emailben
- Megrendelések kezelése
- Partnereink oldal létrehozása

### Backend
- Backend szerver tervezése (Node.js + Express)
- Hibakezelés és validációk implementálása 
- Admin funkciók backend támogatása
- JWT autentikáció és middleware fejlesztés
- Végpontok tesztelése


---

## Fejlesztési eszközök

- **Frontend:** React + Vite
- **Backend:** Node.js + Express
- **Adatbázis:** MySQL
- **Tesztelés:** Jest (backend), Selenium (frontend)
- **Konténerizáció:** Docker
- **Verziókezelés:** Git + GitHub
- **Dokumentáció:** Docusaurus

---

## Környezet és futtatás

### Előfeltételek

- Node.js telepítve
- Docker és Docker Compose telepítve
- Git telepítve

### Futtatás lépései

1. **Adatbázis indítása:**  
   `docker-compose up -d`

2. **Backend indítása:**  
   `cd backend && npm install && npm start`  
   → Elérhető: `http://localhost:3000`

3. **Frontend indítása:**  
   `cd frontend && npm install && npm run dev`  
   → Elérhető: `http://localhost:5173`

4. **Dokumentáció indítása:**  
   `cd betonlogisztika-docs && npm install && npm start -- --port 3001`  
   → Elérhető: `http://localhost:3001`

5. **Backend tesztek futtatása:**  
   `cd backend && npm test`

6. **Selenium tesztek futtatása:**  
   `cd frontend && npm run test:selenium`  
   (Ehhez a backendnek és frontendnek is futnia kell)

---

### Összefoglaló táblázat

| Komponens | Parancs | Port |
|-----------|---------|------|
| Adatbázis | `docker-compose up -d` | 3306 |
| Backend | `cd backend && npm start` | 3000 |
| Frontend | `cd frontend && npm run dev` | 5173 |
| Dokumentáció | `cd betonlogisztika-docs && npm start -- --port 3001` | 3001 |
| Backend tesztek | `cd backend && npm test` | - |
| Selenium tesztek | `cd frontend && npm run test:selenium` | - |

