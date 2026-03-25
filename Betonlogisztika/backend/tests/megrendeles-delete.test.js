const request = require('supertest');
const app = require('../app');

describe('DELETE /api/megrendelesek/:id', () => {
  let userToken;
  let adminToken;
  let ajanlatId;
  let megrendelesId;
  let testEmail = `megrendelesdel${Date.now()}@email.hu`;

  beforeAll(async () => {
    await request(app)
      .post('/api/register')
      .send({
        nev: 'Megrendelés Törlés Teszt',
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
        mennyiseg: 8,
        pumpa_szukseges: false,
        szallitas_datum: "2026-04-10",
        iranyitoszam: "8360",
        telepules: "Keszthely",
        utca: "Pajta alja út",
        hazszam: "10",
        latitude: 46.771014,
        longitude: 17.242267,
        tavolsag_keszthelytol: 0
      });
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
    megrendelesId = rendelesRes.body.megrendeles.id;

    await request(app)
      .put(`/api/admin/megrendelesek/${megrendelesId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ statusz: 'sikertelen' });
  });

  it('sikeres törlés esetén 200 OK', async () => {
    const response = await request(app)
      .delete(`/api/megrendelesek/${megrendelesId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Megrendelés sikeresen törölve!');
  });

  it('token nélkül 401 Unauthorized', async () => {
    const response = await request(app)
      .delete(`/api/megrendelesek/${megrendelesId}`);

    expect(response.statusCode).toBe(401);
  });

  it('nem létező ID esetén 404 Not Found', async () => {
    const response = await request(app)
      .delete('/api/megrendelesek/99999')
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.statusCode).toBe(404);
  });

  it('más user rendelését nem lehet törölni', async () => {
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
      .delete(`/api/megrendelesek/${megrendelesId}`)
      .set('Authorization', `Bearer ${masikToken}`);

    expect(response.statusCode).toBe(404);
  });

  it('nem sikertelen státuszú rendelést nem lehet törölni', async () => {
    const ujAjanlat = await request(app)
      .post('/api/ajanlatok')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        beton_tipus_id: 1,
        betonszal_tipus_id: 4,
        betongyarto_id: 1,
        mennyiseg: 5,
        pumpa_szukseges: false,
        szallitas_datum: "2026-04-11",
        iranyitoszam: "8360",
        telepules: "Keszthely",
        utca: "Pajta alja út",
        hazszam: "10",
        latitude: 46.771014,
        longitude: 17.242267,
        tavolsag_keszthelytol: 0
      });

    await request(app)
      .put(`/api/admin/ajanlatok/${ujAjanlat.body.ajanlat.id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ statusz: 'elfogadva' });

    const ujRendeles = await request(app)
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

    const response = await request(app)
      .delete(`/api/megrendelesek/${ujRendeles.body.megrendeles.id}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('Csak sikertelen státuszú megrendelés törölhető!');
  });
});