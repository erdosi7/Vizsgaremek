const request = require('supertest');
const app = require('../server');

describe('GET /api/ajanlataim', () => {
  let userToken;
  let adminToken;
  let ajanlatId;
  let testEmail = `ajanlatget${Date.now()}@email.hu`;

  beforeAll(async () => {
    await request(app)
      .post('/api/register')
      .send({
        nev: 'Ajánlat GET Teszt',
        email: testEmail,
        jelszo: '123456',
        telefon: '+36 30 111 2222'
      });

    const userLogin = await request(app)
      .post('/api/login')
      .send({ email: testEmail, jelszo: '123456' });
    userToken = userLogin.body.token;

    const adminLogin = await request(app)
      .post('/api/login')
      .send({ email: 'admin@gmail.com', jelszo: 'admin67' });
    adminToken = adminLogin.body.token;

    const ajanlatRes = await request(app)
      .post('/api/ajanlatok')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        beton_tipus_id: 1,
        betonszal_tipus_id: 4,
        betongyarto_id: 1,
        mennyiseg: 12,
        pumpa_szukseges: true,
        szallitas_datum: "2026-03-25",
        iranyitoszam: "8360",
        telepules: "Keszthely",
        utca: "Pajta alja út",
        hazszam: "10",
        latitude: 46.771014,
        longitude: 17.242267,
        tavolsag_keszthelytol: 0
      });
    ajanlatId = ajanlatRes.body.ajanlat.id;
  });

  it('sikeres lekérés esetén 200 OK és lista', async () => {
    const response = await request(app)
      .get('/api/ajanlataim')
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.ajanlatok)).toBe(true);
    expect(response.body.ajanlatok.length).toBeGreaterThan(0);
    
    const found = response.body.ajanlatok.find(a => a.id === ajanlatId);
    expect(found).toBeDefined();
  expect(parseFloat(found.mennyiseg)).toBe(12);
    expect(found.statusz).toBe('függőben');
  });

  it('token nélkül 401 Unauthorized', async () => {
    const response = await request(app)
      .get('/api/ajanlataim');

    expect(response.statusCode).toBe(401);
  });

  it('rossz token esetén 403 Forbidden', async () => {
    const response = await request(app)
      .get('/api/ajanlataim')
      .set('Authorization', 'Bearer rossztoken');

    expect(response.statusCode).toBe(403);
  });

  it('más user nem látja a másik ajánlatait', async () => {
    const masikEmail = `masik${Date.now()}@email.hu`;
    await request(app)
      .post('/api/register')
      .send({
        nev: 'Másik User',
        email: masikEmail,
        jelszo: '123456',
        telefon: '+36 30 222 3333'
      });

    const masikLogin = await request(app)
      .post('/api/login')
      .send({ email: masikEmail, jelszo: '123456' });
    const masikToken = masikLogin.body.token;

    const response = await request(app)
      .get('/api/ajanlataim')
      .set('Authorization', `Bearer ${masikToken}`);

    expect(response.statusCode).toBe(200);
    
    const contains = response.body.ajanlatok.some(a => a.id === ajanlatId);
    expect(contains).toBe(false);
  });

  it('admin is látja a sajátjait, de nem a userekét', async () => {

    const adminResponse = await request(app)
      .get('/api/ajanlataim')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(adminResponse.statusCode).toBe(200);
    
    expect(Array.isArray(adminResponse.body.ajanlatok)).toBe(true);
  });
});