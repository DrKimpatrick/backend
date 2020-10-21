import supertest from 'supertest';
import faker from 'faker';
import { app } from '../../index';
import { ModelFactory } from '../../models/model.factory';
import { MODELS, SIGNUP_MODE, STATUS_CODES } from '../../constants';
import {
  correctUserProfileData,
  updateWrongEducationProfileData,
  updateWrongSkillsData,
} from './__mocks__';
import IBetaTester from '../../models/interfaces/beta-tester.interface';

describe('User /users', () => {
  const userM = ModelFactory.getModel(MODELS.USER);
  const skillModel = ModelFactory.getModel(MODELS.SKILLS);
  const empModel = ModelFactory.getModel(MODELS.EMPLOYMENT_HISTORY);
  const eduModel = ModelFactory.getModel(MODELS.EDUCATION_HISTORY);
  const betaTesterModel = ModelFactory.getModel<IBetaTester>(MODELS.BETA_TESTER);

  let token: any;
  let user: any;

  beforeEach(async () => {
    await userM.deleteMany({});
    await skillModel.deleteMany({});
    await empModel.deleteMany({});
    await eduModel.deleteMany({});
    await betaTesterModel.deleteMany({});

    user = await userM.create({
      signupMode: SIGNUP_MODE.LOCAL,
      firstName: 'Some Name',
      email: 'test@email.com',
      username: 'test@email.com',
      verified: true,
      password: 'really',
    });
    token = user.toAuthJSON().token;
  });

  afterEach(async () => {
    await userM.deleteMany({});
    await skillModel.deleteMany({});
    await empModel.deleteMany({});
    await eduModel.deleteMany({});
    await betaTesterModel.deleteMany({});
  });

  describe('PATCH /users/:id', () => {
    it('should return an error when given wrong educationHistory', (done) => {
      supertest(app)
        .patch(`/api/v1/users/${user.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateWrongEducationProfileData)
        .end((err, res) => {
          expect(res.status).toBe(STATUS_CODES.BAD_REQUEST);
          expect(res.body).toHaveProperty('errors');
          expect(Array.isArray(res.body.errors)).toBeTruthy();
          done();
        });
    });

    it('should return an error when given wrong skills values', (done) => {
      supertest(app)
        .patch(`/api/v1/users/${user.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateWrongSkillsData)
        .end((err, res) => {
          expect(res.status).toBe(STATUS_CODES.BAD_REQUEST);
          expect(res.body).toHaveProperty('errors');
          expect(Array.isArray(res.body.errors)).toBeTruthy();
          expect(res.body.errors[0]).toHaveProperty('skills[0]');
          expect(res.body.errors[0]['skills[0]']).toBe('skills must have valid IDs');
          done();
        });
    });
    it('should return an error when skill is not found', (done) => {
      supertest(app)
        .patch(`/api/v1/users/${user.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(correctUserProfileData)
        .end((err, res) => {
          expect(res.status).toBe(STATUS_CODES.NOT_FOUND);
          expect(res.body).toHaveProperty('message');
          expect(res.body.message).toEqual(
            `Skills '${correctUserProfileData.skills[0]}', could not be found`
          );
          done();
        });
    });

    it('should return success 200 on valid data', async (done) => {
      await skillModel.create({
        _id: correctUserProfileData.skills[0],
        skill: 'Django',
      });

      supertest(app)
        .patch(`/api/v1/users/${user.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(correctUserProfileData)
        .end((err, res) => {
          expect(res.status).toBe(200);
          expect(res.body).toHaveProperty('profile');
          expect(res.body.profile).toHaveProperty('email');
          expect(res.body.profile.email).toEqual(correctUserProfileData.email);
          done();
        });
    });
  });

  describe('POST /users/beta-testers', () => {
    // const tester = await betaTesterModel.create({
    //   email: faker.internet.email(),
    //   name: faker.name.findName(),
    //   accountType: faker.random.arrayElement(['company', 'talent']),
    // });

    it('should successfully save beta tester information with valid data', (done) => {
      supertest(app)
        .post('/api/v1/users/beta-testers')
        .send({
          email: faker.internet.email(),
          name: faker.name.findName(),
          accountType: faker.random.arrayElement(['company', 'talent']),
        })
        .end((err, res) => {
          expect(res.status).toBe(201);
          expect(res.body).toHaveProperty('data');
          expect(res.body.data).toHaveProperty('email');
          done();
        });
    });

    it('should not save beta tester information with an empty request body', (done) => {
      supertest(app)
        .post('/api/v1/users/beta-testers')
        .send({})
        .end((err, res) => {
          expect(res.status).toBe(400);
          expect(res.body).toHaveProperty('errors');
          expect(res.body.errors).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                name: expect.any(String),
              }),
              expect.objectContaining({
                email: expect.any(String),
              }),
              expect.objectContaining({
                accountType: expect.any(String),
              }),
            ])
          );
          done();
        });
    });

    it('should not save beta tester information with an invalid email', (done) => {
      supertest(app)
        .post('/api/v1/users/beta-testers')
        .send({
          email: 'invalid',
          name: faker.name.findName(),
          accountType: faker.random.arrayElement(['company', 'talent', 'school']),
        })
        .end((err, res) => {
          expect(res.status).toBe(400);
          expect(res.body).toHaveProperty('errors');
          expect(res.body.errors).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                email: expect.any(String),
              }),
            ])
          );
          done();
        });
    });
  });
});
