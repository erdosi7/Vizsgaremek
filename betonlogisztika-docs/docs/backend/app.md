# App.js fájl

Az app.js fájl az Express alkalmazás központi konfigurációs pontja. Itt történik a middleware-k beállítása: a cors lehetővé teszi a frontend és backend közötti kommunikációt, az express.json() pedig a JSON formátumban érkező kérések feldolgozását.

Emellett itt kerülnek beillesztésre a különböző route-ok (auth, ajanlat, megrendeles, partner, admin), amelyek a beérkező kéréseket a megfelelő controller-ekhez irányítják. A fájl végén exportáljuk az app objektumot, amelyet a server.js használ a szerver indításhoz.
