const request = require('supertest');
const app = require('../server');

describe('POST /api/ajanlatok', () => {
  let userToken;
  let testEmail = `ajanlat${Date.now()}@email.hu`;

  beforeAll(async () => {

    await request(app)
      .post('/api/register')
      .send({
        nev: 'Ajánlat Teszt',
        email: testEmail,
        jelszo: '123456',
        telefon: '+36 30 111 2222',
        cegnev: 'Ajánlat Teszt Kft.'
      });

    const loginRes = await request(app)
      .post('/api/login')
      .send({
        email: testEmail,
        jelszo: '123456'
      });

    userToken = loginRes.body.token;
  });

  it('sikeres ajánlatkérés esetén 201 Created', async () => {
    const response = await request(app)
      .post('/api/ajanlatok')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        beton_tipus_id: 1,
        betonszal_tipus_id: 4,
        betongyarto_id: 1,
        mennyiseg: 10,
        pumpa_szukseges: false,
        szallitas_datum: "2026-03-20",
        iranyitoszam: "8360",
        telepules: "Keszthely",
        utca: "Pajta alja út",
        hazszam: "10",
        latitude: 46.771014,
        longitude: 17.242267,
        tavolsag_keszthelytol: 0
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.ajanlat).toHaveProperty('ajanlatszam');
    expect(response.body.ajanlat.status).toBe('függőben');
  });

  it('token nélkül 401 Unauthorized', async () => {
    const response = await request(app)
      .post('/api/ajanlatok')
      .send({
        beton_tipus_id: 1,
        betonszal_tipus_id: 4,
        betongyarto_id: 1,
        mennyiseg: 10
      });

    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe('Nincs bejelentkezve!');
  });

  it('hiányzó mezők esetén 400 Bad Request', async () => {
    const response = await request(app)
      .post('/api/ajanlatok')
      .set('Authorization', `Bearer ${userToken}`)
      .send({

      });

    expect(response.statusCode).toBe(400);
  });

  it('túl nagy mennyiség esetén kapacitás hiba', async () => {
    const response = await request(app)
      .post('/api/ajanlatok')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        beton_tipus_id: 1,
        betonszal_tipus_id: 4,
        betongyarto_id: 1,
        mennyiseg: 1000,
        pumpa_szukseges: false,
        szallitas_datum: "2026-03-20",
        iranyitoszam: "8360",
        telepules: "Keszthely",
        utca: "Pajta alja út",
        hazszam: "10",
        latitude: 46.771014,
        longitude: 17.242267,
        tavolsag_keszthelytol: 0
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toContain('szabad kapacitása');
  });
});