import supertest from 'supertest';
import { app } from '../..';

describe('GET /login', () => {
  it('responds with json', (done: any) => {
    supertest(app)
      .get('/api/v1/auth/login')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, done);
  });
});
