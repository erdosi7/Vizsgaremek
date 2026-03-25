const request = require('supertest');
const app = require('../app');

describe('GET /api/megrendeleim', () => {
  let userToken;
  let adminToken;
  let ajanlatId;
  let megrendelesId;
  let testEmail = `megrendeleimget${Date.now()}@email.hu`;

  beforeAll(async () => {
    await request(app)
      .post('/api/register')
      .send({
        nev: 'Megrendelés GET Teszt',
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
        mennyiseg: 7,
        pumpa_szukseges: false,
        szallitas_datum: "2026-04-20",
        iranyitoszam: "8360",
        telepules: "Keszthely",
        utca: "Pajta alja út",
        hazszam: "10",
        latitude: 46.771014,
        longitude: 17.242267,
        tavolsag_keszthelytol: 0
      });
    
    if (!ajanlatRes.body || !ajanlatRes.body.ajanlat) {
      console.error('Ajánlat létrehozás sikertelen:', ajanlatRes.body);
      throw new Error('Ajánlat létrehozás sikertelen');
    }
    
    ajanlatId = ajanlatRes.body.ajanlat.id;
  
    await request(app)
      .put(`/api/admin/ajanlatok/${ajanlatId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ statusz: 'elfogadva' });

    const rendelesRes = await request(app)
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
        adoszam: "12345678-1-23"
      });
    
    if (!rendelesRes.body || !rendelesRes.body.megrendeles) {
      console.error('Megrendelés létrehozás sikertelen:', rendelesRes.body);
      throw new Error('Megrendelés létrehozás sikertelen');
    }
    
    megrendelesId = rendelesRes.body.megrendeles.id;
  });

  it('sikeres lekérés esetén 200 OK és lista', async () => {
    const response = await request(app)
      .get('/api/megrendeleim')
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.megrendelesek)).toBe(true);
    expect(response.body.megrendelesek.length).toBeGreaterThan(0);
    
    const found = response.body.megrendelesek.find(m => m.id === megrendelesId);
    expect(found).toBeDefined();
    expect(found.statusz).toBe('feldolgozás alatt');
  });

  it('token nélkül 401 Unauthorized', async () => {
    const response = await request(app)
      .get('/api/megrendeleim');

    expect(response.statusCode).toBe(401);
  });

  it('rossz token esetén 403 Forbidden', async () => {
    const response = await request(app)
      .get('/api/megrendeleim')
      .set('Authorization', 'Bearer rossztoken');

    expect(response.statusCode).toBe(403);
  });

  it('más user nem látja a rendeléseimet', async () => {
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
      .get('/api/megrendeleim')
      .set('Authorization', `Bearer ${masikToken}`);

    expect(response.statusCode).toBe(200);
    
    const contains = response.body.megrendelesek.some(m => m.id === megrendelesId);
    expect(contains).toBe(false);
  });

  it('üres lista esetén is 200 OK', async () => {
    const ujEmail = `uj${Date.now()}@email.hu`;
    await request(app)
      .post('/api/register')
      .send({
        nev: 'Új User',
        email: ujEmail,
        jelszo: '123456',
        telefon: '+36 30 333 4444'
      });

    const ujLogin = await request(app)
      .post('/api/login')
      .send({ email: ujEmail, jelszo: '123456' });
    const ujToken = ujLogin.body.token;

    const response = await request(app)
      .get('/api/megrendeleim')
      .set('Authorization', `Bearer ${ujToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.megrendelesek).toEqual([]);
  });
});