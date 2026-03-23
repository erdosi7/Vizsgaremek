const request = require('supertest');
const app = require('../server');

describe('POST /api/register', () => {
  
  it('sikeres regisztráció esetén 201-et ad vissza', async () => {
    const response = await request(app)
      .post('/api/register')
      .send({
        nev: 'Jest Teszt',
        email: `jest${Date.now()}@email.hu`,
        jelszo: '123456',
        telefon: '+36 30 111 2222',
        cegnev: 'Jest Kft.'
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body).toHaveProperty('token');
  });

  it('hiányzó mező esetén 400-at ad vissza', async () => {
    const response = await request(app)
      .post('/api/register')
      .send({
        email: 'test@email.hu',
        jelszo: '123456'
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('duplikált email esetén 400-at ad vissza', async () => {
    const email = `duplikalt${Date.now()}@email.hu`;
    
    await request(app)
      .post('/api/register')
      .send({
        nev: 'Első User',
        email: email,
        jelszo: '123456',
        telefon: '+36 30 111 2222'
      });

    const response = await request(app)
      .post('/api/register')
      .send({
        nev: 'Második User',
        email: email,
        jelszo: '123456',
        telefon: '+36 30 333 4444'
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('Ez az email cím már regisztrálva van!');
  });

  afterAll(async () => {
    const db = app.get('db'); 
    if (db) {
      await db.end();
    }
  });
});