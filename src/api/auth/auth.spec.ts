import supertest from 'supertest';
import passport from 'passport';
import StrategyMock from './__mocks__/strategy';
import { socialAuthResponse } from './__mocks__/social-responses';
import { app } from '../../index';

describe('Auth /auth', () => {
  describe('GET /login', () => {
    it('responds with json', (done: any) => {
      supertest(app)
        .get('/api/v1/auth/login')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200, done);
    });
  });

  describe('GET /google', () => {
    it('responds with a redirect to frontend', (done: any) => {
      supertest(app)
        .get('/api/v1/auth/google?redirect_url=https://test_url.com/')
        .set('Accept', 'application/json')
        .end((err, res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toContain('https://accounts.google.com/o/oauth2/v2');

          // @ts-ignore
          passport.use(new StrategyMock('google', undefined, socialAuthResponse));

          supertest(app)
            .get('/api/v1/auth/google/callback')
            .set('Accept', 'application/json')
            .end((err, res) => {
              expect(res.status).toBe(302);
              expect(res.header.location).toContain('https://test_url.com/?data=');
              done();
            });
        });
    });
  });

  describe('GET /github', () => {
    it('responds with a redirect to frontend', (done: any) => {
      supertest(app)
        .get('/api/v1/auth/github?redirect_url=https://test_url.com/')
        .set('Accept', 'application/json')
        .end((err, res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toContain('https://github.com/login/oauth/authorize');

          // @ts-ignore
          passport.use(new StrategyMock('github', undefined, socialAuthResponse));

          supertest(app)
            .get('/api/v1/auth/github/callback')
            .set('Accept', 'application/json')
            .end((err, res) => {
              expect(res.status).toBe(302);
              expect(res.header.location).toContain('https://test_url.com/?data=');
              done();
            });
        });
    });
  });

  describe('GET /linkedin', () => {
    it('responds with a redirect to frontend', (done: any) => {
      supertest(app)
        .get('/api/v1/auth/linkedin?redirect_url=https://test_url.com/')
        .set('Accept', 'application/json')
        .end((err, res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toContain('https://www.linkedin.com/oauth/v2/authorization');

          // @ts-ignore
          passport.use(new StrategyMock('linkedin', undefined, socialAuthResponse));

          supertest(app)
            .get('/api/v1/auth/linkedin/callback')
            .set('Accept', 'application/json')
            .end((err, res) => {
              expect(res.status).toBe(302);
              expect(res.header.location).toContain('https://test_url.com/?data=');
              done();
            });
        });
    });
  });
});
