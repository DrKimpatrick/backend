import supertest from 'supertest';
import express from 'express';

const app = express();

app.get('/user', (req, res) => {
  res.status(200).json({ name: 'john' });
});

describe('GET /user', () => {
  it('responds with json', (done) => {
    supertest(app)
      .get('/user')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, done);
  });
});
