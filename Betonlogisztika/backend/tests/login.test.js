const request = require('supertest');
const app = require('../app');

describe('POST /api/login', () => {
  
  let testEmail = `login${Date.now()}@email.hu`;

  beforeAll(async () => {
    await request(app)
      .post('/api/register')
      .send({
        nev: 'Login Teszt',
        email: testEmail,
        jelszo: '123456',
        telefon: '+36 30 111 2222',
        cegnev: 'Login Teszt Kft.'
      });
  });

  it('helyes adatokkal 200 OK és token', async () => {
    const response = await request(app)
      .post('/api/login')
      .send({
        email: testEmail,
        jelszo: '123456'
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body).toHaveProperty('token');
    expect(response.body.user).toHaveProperty('nev', 'Login Teszt');
    expect(response.body.user).toHaveProperty('jogosultsag', 'user');
  });

  it('rossz jelszóval 401 Unauthorized', async () => {
    const response = await request(app)
      .post('/api/login')
      .send({
        email: testEmail,
        jelszo: 'rosszjelszo'
      });

    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Hibás email vagy jelszó!');
  });

  it('nem létező emaillel 401 Unauthorized', async () => {
    const response = await request(app)
      .post('/api/login')
      .send({
        email: 'nemletezo@email.hu',
        jelszo: '123456'
      });

    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Hibás email vagy jelszó!');
  });

  it('hiányzó mezők esetén 400 Bad Request', async () => {
    const response = await request(app)
      .post('/api/login')
      .send({
        email: testEmail
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Email és jelszó megadása kötelező!');
  });

});