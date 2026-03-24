# **Szoftverfejlesztő és tesztelő záróvizsga – Vizsgaremek**

## **Résztvevők**
- Erdősi Zsombor  
- Fáró Sebestyén  

---

## **Tartalomjegyzék**
- [Vizsgaremek célkitűzése](#vizsgaremek-célkitűzése)
- [Feladat leírása, bemutatása](#feladat-leírása-bemutatása)
- [Tervezett vállalásaim – Fáró Sebestyén](#tervezett-vállalásaim--fáró-sebestyén)
- [Tervezett vállalásaim – Erdősi Zsombor](#tervezett-vállalásaim--erdősi-zsombor)
- [Tesztelés](#tesztelés)

---

## **Vizsgaremek célkitűzése**

A webes alkalmazás célja, hogy egy online felületen tegyük lehetővé a betonrendeléssel kapcsolatos összes fontos folyamat lebonyolítását, a regisztrációtól egészen a rendelés követéséig.

---

## **Feladat leírása, bemutatása**

Az alkalmazás használatához a felhasználónak regisztrálnia és bejelentkeznie kell, amely kötelező ajánlatkérés vagy megrendelés leadása esetén.

A bejelentkezést követően a felhasználó az alábbi funkciókat érheti el:

- **Ajánlatkérés**  
  Rövid űrlap kitöltése után a rendszer automatikus ajánlatot generál.

- **Megrendelés leadása és időpontfoglalás**  
  Űrlap és naptár alapú időpontfoglaló rendszer segítségével.

- **Árkalkulátor**  
  Néhány adat megadását követően a rendszer automatikusan kiszámítja a várható árat.

- **Rendeléskövetés**  
  A felhasználó valós időben nyomon követheti rendelése állapotát.

- **Kapcsolat és információk**  
  Gyors kapcsolatteremtést biztosító elérhetőségi adatok.

Az alkalmazás kapcsolatban áll több betonszállító céggel, így a felhasználó kiválaszthatja, melyik szolgáltatótól szeretne rendelni (pl. távolság vagy elérhetőség alapján).

---

## **Tervezett vállalásaim – Fáró Sebestyén**

### **Frontend**
- Felhasználókezelés (regisztráció, bejelentkezés, kijelentkezés)
- Betongyártó telephelyek kezelése
- Ajánlatkérés kezelése

### **Backend**
- Backend szerver tervezése (Node.js / ASP alapú kiszolgáló)
- Adatbázis-tervezés (ER, EER diagramok készítése)
- Kontrollerek létrehozása

---

## **Tervezett vállalásaim – Erdősi Zsombor**

### **Frontend**
- Webes alkalmazás design kialakítása
- Felhasználói kapcsolatok kezelése
- Megrendelések kezelése

### **Backend**
- Adattáblák kezelése
- Modellek megtervezése
- Végpontok tesztelése

---

## **Tesztelés**

- Backend oldali tesztek készítése **NUnit** segítségével  
- Frontend oldali automatizált tesztek készítése **Selenium** használatával
