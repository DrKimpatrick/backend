import supertest from 'supertest';
import passport from 'passport';
import StrategyMock from './__mocks__/strategy';
import { socialAuthResponse } from './__mocks__/social-responses';
import { app } from '../../index';
import { ModelFactory } from '../../models/model.factory';
import { MODELS, SIGNUP_MODE, STATUS_CODES } from '../../constants';
import { generateVerificationToken } from '../../helpers/auth.helpers';
import { environment } from '../../config/environment';

describe('Auth /auth', () => {
  const userM = ModelFactory.getModel(MODELS.USER);
  const socialM = ModelFactory.getModel(MODELS.SOCIAL_AUTH);

  beforeEach(async () => {
    await userM.deleteMany({});
    await socialM.deleteMany({});
  });

  describe('POST /login', () => {
    it('responds with error missing credentials', (done: any) => {
      supertest(app)
        .post('/api/v1/auth/login')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .end((req, res) => {
          expect(res.status).toBe(401);
          expect(res.body).toHaveProperty('message');
          expect(res.body.message).toEqual('Missing credentials');

          done();
        });
    });

    it('responds with error invalid user or password', (done: any) => {
      supertest(app)
        .post('/api/v1/auth/login')
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .send({ username: 'test@email.com', password: 'really' })
        .expect('Content-Type', /json/)
        .end((req, res) => {
          expect(res.status).toBe(401);
          expect(res.body).toHaveProperty('error');
          expect(res.body.error).toEqual('username or password is invalid');

          done();
        });
    });

    it('responds with valid user details and token', async (done: any) => {
      let user = await userM.create({
        signupMode: SIGNUP_MODE.SOCIAL,
        firstName: 'Some Name',
        email: 'test@email.com',
        username: 'test@email.com',
        verified: true,
        password: 'really',
      });

      supertest(app)
        .post('/api/v1/auth/login')
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .send({ username: 'test@email.com', password: 'really' })
        .expect('Content-Type', /json/)
        .end(async (req, res) => {
          user = await userM.findById(user.id).select('+refreshToken').exec();

          expect(res.status).toBe(200);
          expect(res.body).toHaveProperty('refresh');
          // @ts-ignore
          expect(res.body.refresh).toEqual(user.refreshToken);
          expect(res.body).toHaveProperty('token');
          expect(res.body).toHaveProperty('profile');

          done();
        });
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
          expect(res.status).toBe(STATUS_CODES.CREATED);
          expect(res.body).toHaveProperty('message');
          done();
        });
    });

    it('should not register user with empty body', (done) => {
      supertest(app)
        .post('/api/v1/auth/register')
        .send({})
        .end((err, res) => {
          expect(res.status).toBe(STATUS_CODES.BAD_REQUEST);
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
          expect(res.status).toBe(STATUS_CODES.BAD_REQUEST);
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
          expect(res.status).toBe(STATUS_CODES.BAD_REQUEST);
          expect(res.body.errors).toEqual(
            expect.arrayContaining([expect.objectContaining({ param: 'email' })])
          );
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
          expect(res.status).toBe(STATUS_CODES.BAD_REQUEST);
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
          expect(res.status).toBe(STATUS_CODES.BAD_REQUEST);
          expect(res.body.errors).toEqual(
            expect.arrayContaining([expect.objectContaining({ param: 'username' })])
          );
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
          expect(res.status).toBe(STATUS_CODES.BAD_REQUEST);
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
          expect(res.status).toBe(STATUS_CODES.BAD_REQUEST);
          expect(res.body.errors[0].param).toBe('password');
          expect(res.body.errors[0].msg).toBe(
            'Password must contain an uppercase, lowercase, numeric, special character (!@#$%^&*), and at least 8 characters'
          );
          done();
        });
    });
  });

  describe('GET /account-verify', () => {
    it('should verify user account', async (done) => {
      let testUser = await userM.create({
        email: 'testverify@test.com',
        username: 'verifytester',
        password: '#ThePassIs@strong',
      });
      const verificationToken = generateVerificationToken(testUser.id);
      const verificationUrl = `/api/v1/auth/verify-account?token=${verificationToken}`;

      supertest(app)
        .get(verificationUrl)
        .set('Accept', 'application/json')
        .end(async (err, res) => {
          testUser = await userM.findById(testUser.id);

          expect(res.status).toBe(200);
          expect(testUser).toEqual(expect.objectContaining({ verified: true }));
          done();
        });
    });

    it('should not verify user account without a token', async (done) => {
      let testUser = await userM.create({
        email: 'testverify@test.com',
        username: 'verifytester',
        password: '#ThePassIs@strong',
      });
      const verificationToken = '';
      const verificationUrl = `/api/v1/auth/verify-account?token=${verificationToken}`;

      supertest(app)
        .get(verificationUrl)
        .set('Accept', 'application/json')
        .end(async (err, res) => {
          testUser = await userM.findById(testUser.id);

          expect(res.status).toBe(401);
          expect(res.body).toHaveProperty('error');
          done();
        });
    });

    it('should not verify user account with and invalid token', async (done) => {
      let testUser = await userM.create({
        email: 'testverify@test.com',
        username: 'verifytester',
        password: '#ThePassIs@strong',
      });
      const verificationToken = 'invalid.obviously';
      const verificationUrl = `/api/v1/auth/verify-account?token=${verificationToken}`;

      supertest(app)
        .get(verificationUrl)
        .set('Accept', 'application/json')
        .end(async (err, res) => {
          testUser = await userM.findById(testUser.id);

          expect(res.status).toBe(401);
          expect(res.body).toHaveProperty('error');
          done();
        });
    });
  });
});
