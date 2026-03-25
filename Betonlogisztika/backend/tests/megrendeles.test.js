const request = require('supertest');
const app = require('../app');

describe('POST /api/megrendelesek', () => {
  let userToken;
  let adminToken;
  let ajanlatId;
  let testEmail = `megrendeles${Date.now()}@email.hu`;
  let adminEmail = 'admin@gmail.com';
  let adminJelszo = 'admin67';

  beforeAll(async () => {
    await request(app)
      .post('/api/register')
      .send({
        nev: 'Megrendelés Teszt',
        email: testEmail,
        jelszo: '123456',
        telefon: '+36 30 111 2222',
        cegnev: 'Megrendelés Teszt Kft.'
      });

    const loginRes = await request(app)
      .post('/api/login')
      .send({
        email: testEmail,
        jelszo: '123456'
      });
    userToken = loginRes.body.token;

    const adminLogin = await request(app)
      .post('/api/login')
      .send({
        email: adminEmail,
        jelszo: adminJelszo
      });
    adminToken = adminLogin.body.token;

    const ajanlatRes = await request(app)
      .post('/api/ajanlatok')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        beton_tipus_id: 1,
        betonszal_tipus_id: 4,
        betongyarto_id: 1,
        mennyiseg: 10,
        pumpa_szukseges: false,
        szallitas_datum: "2026-03-30",
        iranyitoszam: "8360",
        telepules: "Keszthely",
        utca: "Pajta alja út",
        hazszam: "10",
        latitude: 46.771014,
        longitude: 17.242267,
        tavolsag_keszthelytol: 0
      });
    
    if (ajanlatRes.body && ajanlatRes.body.ajanlat && ajanlatRes.body.ajanlat.id) {
      ajanlatId = ajanlatRes.body.ajanlat.id;
    } else {
      console.error('Ajánlat létrehozás sikertelen:', ajanlatRes.body);
      return;
    }

    await request(app)
      .put(`/api/admin/ajanlatok/${ajanlatId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        statusz: 'elfogadva'
      });
  });

  it('sikeres megrendelés esetén 201 Created', async () => {
    const response = await request(app)
      .post('/api/megrendelesek')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        ajanlat_id: ajanlatId,
        szallitas_iranyitoszam: "8360",
        szallitas_telepules: "Keszthely",
        szallitas_utca: "Pajta alja út",
        szallitas_hazszam: "10",
        szamlazasi_iranyitoszam: "8360",
        szamlazasi_telepules: "Keszthely",
        szamlazasi_utca: "Pajta alja út",
        szamlazasi_hazszam: "10",
        adoszam: "12345678-1-23",
        megjegyzes: "Teszt rendelés"
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.megrendeles).toHaveProperty('megrendeles_szam');
    expect(response.body.megrendeles.statusz).toBe('feldolgozás alatt');
  });

  it('nem elfogadott ajánlattal 400 Bad Request', async () => {
    const ujAjanlat = await request(app)
      .post('/api/ajanlatok')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        beton_tipus_id: 1,
        betonszal_tipus_id: 4,
        betongyarto_id: 1,
        mennyiseg: 5,
        pumpa_szukseges: false,
        szallitas_datum: "2026-03-31",
        iranyitoszam: "8360",
        telepules: "Keszthely",
        utca: "Pajta alja út",
        hazszam: "10",
        latitude: 46.771014,
        longitude: 17.242267,
        tavolsag_keszthelytol: 0
      });

    if (!ujAjanlat.body || !ujAjanlat.body.ajanlat) {
      console.error('Ajánlat létrehozás sikertelen:', ujAjanlat.body);
      return;
    }

    const response = await request(app)
      .post('/api/megrendelesek')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        ajanlat_id: ujAjanlat.body.ajanlat.id,
        szallitas_iranyitoszam: "8360",
        szallitas_telepules: "Keszthely",
        szallitas_utca: "Pajta alja út",
        szallitas_hazszam: "10",
        szamlazasi_iranyitoszam: "8360",
        szamlazasi_telepules: "Keszthely",
        szamlazasi_utca: "Pajta alja út",
        szamlazasi_hazszam: "10",
        adoszam: "12345678-1-23"
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('Csak elfogadott ajánlat rendelhető meg!');
  });

  it('token nélkül 401 Unauthorized', async () => {
    const response = await request(app)
      .post('/api/megrendelesek')
      .send({
        ajanlat_id: ajanlatId,
        szallitas_iranyitoszam: "8360",
        szallitas_telepules: "Keszthely",
        szallitas_utca: "Pajta alja út",
        szallitas_hazszam: "10",
        szamlazasi_iranyitoszam: "8360",
        szamlazasi_telepules: "Keszthely",
        szamlazasi_utca: "Pajta alja út",
        szamlazasi_hazszam: "10",
        adoszam: "12345678-1-23"
      });

    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe('Nincs bejelentkezve!');
  });

  it('nem létező ajánlattal 404 Not Found', async () => {
    const response = await request(app)
      .post('/api/megrendelesek')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        ajanlat_id: 99999, 
        szallitas_iranyitoszam: "8360",
        szallitas_telepules: "Keszthely",
        szallitas_utca: "Pajta alja út",
        szallitas_hazszam: "10",
        szamlazasi_iranyitoszam: "8360",
        szamlazasi_telepules: "Keszthely",
        szamlazasi_utca: "Pajta alja út",
        szamlazasi_hazszam: "10",
        adoszam: "12345678-1-23"
      });

    expect(response.statusCode).toBe(404);
    expect(response.body.message).toBe('Ajánlat nem található!');
  });

  it('hiányzó mezők esetén 400 Bad Request', async () => {
    const response = await request(app)
      .post('/api/megrendelesek')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        ajanlat_id: ajanlatId
      });

    expect(response.statusCode).toBe(400);
  });
});