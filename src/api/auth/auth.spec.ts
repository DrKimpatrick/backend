import supertest from 'supertest';
import passport from 'passport';
import StrategyMock from './__mocks__/strategy';
import { socialAuthResponse } from './__mocks__/social-responses';
import { app } from '../../index';
import { CREATED, BAD_REQUEST } from '../../constants/statusCodes';
import { ModelFactory } from '../../models/model.factory';
import { MODELS } from '../../constants';

const userM = ModelFactory.getModel(MODELS.USER);

describe('Auth /auth', () => {
  beforeEach(async () => {
    await userM.deleteMany({});
  });

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
  describe('POST /register', () => {
    const newUser = {
      email: 'test@test.com',
      username: 'testname',
      password: '@Password123',
    };

    it('should be able to register user', (done) => {
      supertest(app)
        .post('/api/v1/auth/register')
        .send(newUser)
        .end((err, res) => {
          expect(res.status).toBe(CREATED);
          expect(res.body).toHaveProperty('profile');
          expect(res.body.token).not.toBeNull();
          done();
        });
    });

    it('should not register user with empty body', (done) => {
      supertest(app)
        .post('/api/v1/auth/register')
        .send({})
        .end((err, res) => {
          expect(res.status).toBe(BAD_REQUEST);
          expect(res.body).toHaveProperty('errors');
          done();
        });
    });

    it('should not register user while either username or email already exists', async (done) => {
      await userM.create(newUser);
      supertest(app)
        .post('/api/v1/auth/register')
        .send(newUser)
        .end((err, res) => {
          expect(res.status).toBe(BAD_REQUEST);
          expect(res.body).toHaveProperty('errors');
          done();
        });
    });

    it('should not register user if an email is invalid', (done) => {
      const newUser2 = {
        ...newUser,
        email: 'invalid email',
      };
      supertest(app)
        .post('/api/v1/auth/register')
        .send(newUser2)
        .end((err, res) => {
          expect(res.status).toBe(BAD_REQUEST);
          expect(res.body.errors[0].param).toBe('email');
          done();
        });
    });

    it('should not register user if username length is less than 5 or contain uppercase letter', (done) => {
      const newUser3 = {
        ...newUser,
        username: 'Ur',
      };
      supertest(app)
        .post('/api/v1/auth/register')
        .send(newUser3)
        .end((err, res) => {
          expect(res.status).toBe(BAD_REQUEST);
          expect(res.body.errors[0].param).toBe('username');
          done();
        });
    });

    it('should not register user if username contains special characters', (done) => {
      const newUser3 = {
        ...newUser,
        username: 'username @special characters ',
      };
      supertest(app)
        .post('/api/v1/auth/register')
        .send(newUser3)
        .end((err, res) => {
          expect(res.status).toBe(BAD_REQUEST);
          expect(res.body.errors[0].param).toBe('username');
          done();
        });
    });

    it('should not register user if password length is less than 8', (done) => {
      const newUser4 = {
        ...newUser,
        password: ' ',
      };
      supertest(app)
        .post('/api/v1/auth/register')
        .send(newUser4)
        .end((err, res) => {
          expect(res.status).toBe(BAD_REQUEST);
          expect(res.body.errors[0].param).toBe('password');
          done();
        });
    });

    it('should not register user if password is not strong ex:"@Password123" and not at least 8 characters', (done) => {
      const newUser4 = {
        ...newUser,
        password: 'simplepssw',
      };
      supertest(app)
        .post('/api/v1/auth/register')
        .send(newUser4)
        .end((err, res) => {
          expect(res.status).toBe(BAD_REQUEST);
          expect(res.body.errors[0].param).toBe('password');
          expect(res.body.errors[0].msg).toBe(
            'Password must contain an uppercase, lowercase, numeric, special character (!@#$%^&*), and at least 8 characters'
          );
          done();
        });
    });
  });
});
