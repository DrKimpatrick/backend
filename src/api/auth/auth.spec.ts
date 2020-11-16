import supertest from 'supertest';
import passport from 'passport';
import faker from 'faker';
import StrategyMock from './__mocks__/strategy';
import { socialAuthResponse } from './__mocks__/social-responses';
import { app } from '../../index';
import { ModelFactory } from '../../models/model.factory';
import { MODELS, SIGNUP_MODE, STATUS_CODES } from '../../constants';
import { generateVerificationToken } from '../../helpers/auth.helpers';
import { generateJWTToken } from '../../helpers';

describe('Auth /auth', () => {
  const userM = ModelFactory.getModel(MODELS.USER);

  describe('POST /login', () => {
    it('responds with error missing credentials', (done: any) => {
      supertest(app)
        .post('/api/v1/auth/login')
        .set('Accept', 'application/json')
        .send({})
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
      await userM.create({
        signupMode: SIGNUP_MODE.SOCIAL,
        firstName: 'Some Name',
        email: 'test@email.com',
        username: 'test@email.com',
        verified: true,
        password: 'really',
        roles: ['talent'],
      });

      supertest(app)
        .post('/api/v1/auth/login')
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .send({ username: 'test@email.com', password: 'really' })
        .expect('Content-Type', /json/)
        .end(async (req, res) => {
          expect(res.status).toBe(200);
          expect(res.body).toHaveProperty('refresh');
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
              expect(res.header.location).toContain(
                'http://localhost:3000/dashboard/auth/verify?data='
              );
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
              expect(res.header.location).toContain(
                'http://localhost:3000/dashboard/auth/verify?data='
              );
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
              expect(res.header.location).toContain(
                'http://localhost:3000/dashboard/auth/verify?data='
              );
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
      role: 'talent',
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
            expect.arrayContaining([expect.objectContaining({ email: expect.any(String) })])
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
          expect.arrayContaining([expect.objectContaining({ username: expect.any(String) })]);
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
            expect.arrayContaining([expect.objectContaining({ username: expect.any(String) })])
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
          expect.arrayContaining([expect.objectContaining({ password: expect.any(String) })]);
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
          expect.arrayContaining([expect.objectContaining({ password: expect.any(String) })]);
          done();
        });
    });
  });

  describe('GET /account-verify', () => {
    let removedUserToken: string;
    it('should verify user account', async (done) => {
      let testUser = await userM.create({
        email: 'testverify@test.com',
        username: 'verifytester',
        password: '#ThePassIs@strong',
      });
      const verificationToken = generateVerificationToken(testUser.id);
      removedUserToken = verificationToken;

      supertest(app)
        .post('/api/v1/auth/verify-account')
        .send({ token: verificationToken })
        .end(async (err, res) => {
          testUser = await userM.findById(testUser.id);

          expect(res.status).toBe(200);
          expect(testUser).toEqual(expect.objectContaining({ verified: true }));
          done();
        });
    });

    it('should not verify user again if already verified account', async (done) => {
      let testUser = await userM.create({
        email: 'testverify@test.com',
        username: 'verifytester',
        password: '#ThePassIs@strong',
      });
      const verificationToken = generateVerificationToken(testUser.id);
      removedUserToken = verificationToken;
      await userM.findByIdAndUpdate({ _id: testUser.id }, { verified: true });

      supertest(app)
        .post('/api/v1/auth/verify-account')
        .send({ token: verificationToken })
        .end(async (err, res) => {
          testUser = await userM.findById(testUser.id);

          expect(res.status).toBe(STATUS_CODES.BAD_REQUEST);
          expect(res.body).toHaveProperty('message');
          done();
        });
    });

    it('should not verify user account without a token', (done) => {
      supertest(app)
        .post('/api/v1/auth/verify-account')
        .send()
        .end(async (err, res) => {
          expect(res.status).toBe(401);
          expect(res.body).toHaveProperty('error');
          done();
        });
    });

    it('should not verify user account with and invalid token', async (done) => {
      const verificationToken = 'invalid.obviously';
      // const verificationUrl = `/api/v1/auth/verify-account?token=${verificationToken}`;

      supertest(app)
        .post('/api/v1/auth/verify-account')
        .send({ token: verificationToken })
        .end(async (err, res) => {
          expect(res.status).toBe(401);
          expect(res.body).toHaveProperty('error');
          done();
        });
    });

    it('should not verify user account if user not found', (done) => {
      supertest(app)
        .post('/api/v1/auth/verify-account')
        .send({ token: removedUserToken })
        .end(async (err, res) => {
          expect(res.status).toBe(STATUS_CODES.NOT_FOUND);
          expect(res.body).toHaveProperty('message');
          done();
        });
    });
  });

  describe('POST /forget-password', () => {
    const testUser = {
      email: 'resetpassword@test.com',
      username: 'resetpasswordtester',
      password: '#ThePassIs@strong',
    };

    it('should sent email for resetting password instructions', async (done) => {
      await userM.create(testUser);

      supertest(app)
        .post('/api/v1/auth/forget-password')
        .send({ email: testUser.email })
        .end(async (err, res) => {
          expect(res.status).toBe(STATUS_CODES.OK);
          expect(res.body).toHaveProperty('message');
          done();
        });
    });

    it('should not sent email for resetting password instructions with user not found', async (done) => {
      supertest(app)
        .post('/api/v1/auth/forget-password')
        .send({ email: testUser.email })
        .end(async (err, res) => {
          expect(res.status).toBe(STATUS_CODES.NOT_FOUND);
          expect(res.body).toHaveProperty('message');
          done();
        });
    });
  });

  describe('POST /reset-password', () => {
    const testUser = {
      email: 'resetpassword@test.com',
      username: 'resetpasswordtester',
      password: '#ThePassIs1@strong',
    };

    it('should reset password', async (done) => {
      const user = await userM.create(testUser);
      const resetPasswordToken = generateJWTToken({ userId: user._id }, 14400);
      const resetPasswordBody = {
        token: resetPasswordToken,
        password: 'ResetPassword1@strong',
        'confirm-password': 'ResetPassword1@strong',
      };
      supertest(app)
        .post('/api/v1/auth/reset-password')
        .send(resetPasswordBody)
        .end(async (err, res) => {
          expect(res.status).toBe(STATUS_CODES.OK);
          expect(res.body).toHaveProperty('message');
          done();
        });
    });

    it('should not reset password with expired token', async (done) => {
      const user = await userM.create(testUser);
      const resetPasswordToken = generateJWTToken({ userId: user._id }, -1);
      const resetPasswordBody = {
        token: resetPasswordToken,
        password: 'ResetPassword1@strong',
        'confirm-password': 'ResetPassword1@strong',
      };
      supertest(app)
        .post('/api/v1/auth/reset-password')
        .send(resetPasswordBody)
        .end(async (err, res) => {
          expect(res.status).toBe(STATUS_CODES.UNAUTHORIZED);
          expect(res.body.error).toBe('Token is invalid or expired');
          done();
        });
    });

    it('should not reset password with password not match', async (done) => {
      const user = await userM.create(testUser);
      const resetPasswordToken = generateJWTToken({ userId: user._id }, 14400);
      const resetPasswordBody = {
        token: resetPasswordToken,
        password: 'ResetPassword1@strong',
        'confirm-password': 'passwordNotMatch1@strong',
      };
      supertest(app)
        .post('/api/v1/auth/reset-password')
        .send(resetPasswordBody)
        .end(async (err, res) => {
          expect(res.status).toBe(STATUS_CODES.BAD_REQUEST);
          expect.arrayContaining([
            expect.objectContaining({ 'confirm-password': expect.any(String) }),
          ]);
          done();
        });
    });

    it('should not reset password with password not strong', async (done) => {
      const user = await userM.create(testUser);
      const resetPasswordToken = generateJWTToken({ userId: user._id }, 14400);
      const resetPasswordBody = {
        token: resetPasswordToken,
        password: 'notstrong',
        'confirm-password': 'notstrong',
      };
      supertest(app)
        .post('/api/v1/auth/reset-password')
        .send(resetPasswordBody)
        .end(async (err, res) => {
          expect(res.status).toBe(STATUS_CODES.BAD_REQUEST);
          expect.arrayContaining([expect.objectContaining({ password: expect.any(String) })]);
          done();
        });
    });
  });

  describe('GET /refresh', () => {
    it('should give new access token with a valid refresh token', async (done) => {
      const email = faker.internet.email();
      const username = faker.internet.userName();
      const password = 'easy.password';
      await userM.create({
        signupMode: SIGNUP_MODE.LOCAL,
        firstName: faker.name.firstName(),
        email,
        username,
        verified: true,
        password,
        roles: ['talent'],
      });

      supertest(app)
        .post('/api/v1/auth/login')
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .send({ username, password })
        .expect('Content-Type', /json/)
        .end(async (req, res) => {
          const refreshToken = res.body.refresh;

          supertest(app)
            .get('/api/v1/auth/refresh')
            .set('Accept', 'application/json')
            .set('Content-Type', 'application/json')
            .set('Authorization', `Bearer ${refreshToken}`)
            .expect('Content-Type', /json/)
            .end(async (req, res) => {
              expect(res.status).toBe(STATUS_CODES.OK);
              expect(res.body).toEqual(expect.objectContaining({ token: expect.any(String) }));
              done();
            });
        });
    });

    it('should not give new access token with an invalid refresh token', async (done) => {
      const email = faker.internet.email();
      const username = faker.internet.userName();
      const password = 'easier.password';
      await userM.create({
        signupMode: SIGNUP_MODE.LOCAL,
        firstName: faker.name.firstName(),
        email,
        username,
        verified: true,
        password,
        roles: ['talent'],
      });

      supertest(app)
        .post('/api/v1/auth/login')
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .send({ username, password })
        .expect('Content-Type', /json/)
        .end(async (req, res) => {
          const refreshToken = res.body.refresh + 'invalid';

          supertest(app)
            .get('/api/v1/auth/refresh')
            .set('Accept', 'application/json')
            .set('Content-Type', 'application/json')
            .set('Authorization', `Bearer ${refreshToken}`)
            .expect('Content-Type', /json/)
            .end(async (req, res) => {
              expect(res.status).toBe(STATUS_CODES.UNAUTHORIZED);
              expect(res.body).toEqual(expect.objectContaining({ message: expect.any(String) }));
              done();
            });
        });
    });

    it('should not give new access token with a missing refresh token', async (done) => {
      supertest(app)
        .get('/api/v1/auth/refresh')
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .set('Authorization', '')
        .expect('Content-Type', /json/)
        .end(async (req, res) => {
          expect(res.status).toBe(STATUS_CODES.UNAUTHORIZED);
          expect(res.body).toEqual(expect.objectContaining({ message: expect.any(String) }));
          done();
        });
    });
  });
});
