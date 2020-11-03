import supertest from 'supertest';
import faker from 'faker';
import { app } from '../../index';
import { ModelFactory } from '../../models/model.factory';
import { MODELS, SIGNUP_MODE, STATUS_CODES, USER_ROLES } from '../../constants';
import {
  correctUserProfileData,
  updateWrongEducationProfileData,
  updateWrongSkillsData,
  addCourse,
  addUser,
} from './__mocks__';
import IBetaTester from '../../models/interfaces/beta-tester.interface';

describe('User /users', () => {
  const userM = ModelFactory.getModel(MODELS.USER);
  const skillModel = ModelFactory.getModel(MODELS.SKILLS);
  const empModel = ModelFactory.getModel(MODELS.EMPLOYMENT_HISTORY);
  const eduModel = ModelFactory.getModel(MODELS.EDUCATION_HISTORY);
  const betaTesterModel = ModelFactory.getModel<IBetaTester>(MODELS.BETA_TESTER);
  const courseModel = ModelFactory.getModel(MODELS.COURSE);

  let token: any;
  let user: any;
  let courseId: string;

  beforeEach(async () => {
    await userM.deleteMany({});
    await skillModel.deleteMany({});
    await empModel.deleteMany({});
    await eduModel.deleteMany({});
    await betaTesterModel.deleteMany({});
    await courseModel.deleteMany({});

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
    await courseModel.deleteMany({});
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
          expect(res.status).toBe(STATUS_CODES.OK);
          expect(res.body).toHaveProperty('profile');
          expect(res.body.profile).toHaveProperty('email');
          expect(res.body.profile).toHaveProperty('firstName');
          // email should not be updated
          expect(res.body.profile.email).toEqual('test@email.com');
          expect(res.body.profile.firstName).toEqual('John');
          done();
        });
    });
  });

  describe('GET /users', () => {
    it('/users, should return 401 if not super admin', (done) => {
      supertest(app)
        .get(`/api/v1/users/`)
        .set('Authorization', `Bearer ${token}`)
        .end((err, res) => {
          expect(res.status).toBe(STATUS_CODES.FORBIDDEN);
          expect(res.body).toHaveProperty('message');
          expect(res.body.message).toBe(
            'You do not have the permissions to perform this operation'
          );
          done();
        });
    });

    it('/users, should return a list of all users', async (done) => {
      user = await userM.findByIdAndUpdate(
        user.id,
        {
          // @ts-ignore
          $push: { roles: [USER_ROLES.SUPER_ADMIN] },
        },
        { new: true }
      );

      supertest(app)
        .get(`/api/v1/users/`)
        .set('Authorization', `Bearer ${token}`)
        .end((err, res) => {
          expect(res.status).toBe(STATUS_CODES.OK);
          expect(res.body).toHaveProperty('data');
          expect(Array.isArray(res.body.data)).toBeTruthy();
          expect(res.body.data.length).toBe(1);
          done();
        });
    });

    it('/users/:id, should return a single user', async (done) => {
      user = await userM.findByIdAndUpdate(
        user.id,
        {
          // @ts-ignore
          $push: { roles: [USER_ROLES.SUPER_ADMIN] },
        },
        { new: true }
      );

      supertest(app)
        .get(`/api/v1/users/${user.id}`)
        .set('Authorization', `Bearer ${token}`)
        .end((err, res) => {
          expect(res.status).toBe(STATUS_CODES.OK);
          expect(res.body).toHaveProperty('profile');
          expect(Array.isArray(res.body.data)).toBeFalsy();
          expect(res.body.profile).toHaveProperty('_id');
          done();
        });
    });

    it('/users/me, should return an authenticated user profile', async (done) => {
      supertest(app)
        .get(`/api/v1/users/me`)
        .set('Authorization', `Bearer ${token}`)
        .end((err, res) => {
          expect(res.status).toBe(STATUS_CODES.OK);
          expect(res.body).toHaveProperty('profile');
          expect(Array.isArray(res.body.data)).toBeFalsy();
          expect(res.body.profile).toHaveProperty('_id');
          done();
        });
    });

    it('/users/:id/education, should return user education', async (done) => {
      await skillModel.create({
        _id: correctUserProfileData.skills[0],
        skill: 'Django',
      });

      supertest(app)
        .patch(`/api/v1/users/${user.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(correctUserProfileData)
        .end((err, res) => {
          expect(res.status).toBe(STATUS_CODES.OK);

          supertest(app)
            .get(`/api/v1/users/${user.id}/education`)
            .set('Authorization', `Bearer ${token}`)
            .end((err, res) => {
              expect(res.status).toBe(STATUS_CODES.OK);
              expect(res.body).toHaveProperty('data');
              expect(Array.isArray(res.body.data)).toBeTruthy();
              expect(res.body.data.length).toBeGreaterThan(0);
              done();
            });
        });
    });

    it('/users/:id/employment, should return user employment', async (done) => {
      await skillModel.create({
        _id: correctUserProfileData.skills[0],
        skill: 'Django',
      });

      supertest(app)
        .patch(`/api/v1/users/${user.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(correctUserProfileData)
        .end((err, res) => {
          expect(res.status).toBe(STATUS_CODES.OK);

          supertest(app)
            .get(`/api/v1/users/${user.id}/employment`)
            .set('Authorization', `Bearer ${token}`)
            .end((err, res) => {
              expect(res.status).toBe(STATUS_CODES.OK);
              expect(res.body).toHaveProperty('data');
              expect(Array.isArray(res.body.data)).toBeTruthy();
              expect(res.body.data.length).toBeGreaterThan(0);
              done();
            });
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
  describe('GET /users/talent?skills=id,id', () => {
    it('should successfully search talent based on skills', async (done) => {
      const skill = await skillModel.create({ skill: 'Javascript' });
      const newUser = await userM.create({
        email: 'test@gmail.com',
        username: 'usernametest',
        password: '@Spassword12',
      });
      await userM.findByIdAndUpdate(newUser.id, { $push: { skills: skill._id } }, { new: true });
      user = await userM.findByIdAndUpdate(
        user.id,
        {
          // @ts-ignore
          $push: { roles: [USER_ROLES.SUPER_ADMIN] },
        },
        { new: true }
      );
      supertest(app)
        .get(`/api/v1/users/talent?skills=${skill._id}`)
        .set('Authorization', `Bearer ${token}`)
        .end((err, res) => {
          expect(res.status).toBe(STATUS_CODES.OK);
          expect(res.body).toHaveProperty('data');
          done();
        });
    });

    it('should not search talent without permission', async (done) => {
      const skill = await skillModel.create({ skill: 'Javascript' });
      supertest(app)
        .get(`/api/v1/users/talent?skills=${skill._id}`)
        .set('Authorization', `Bearer ${token}`)
        .end((err, res) => {
          expect(res.status).toBe(STATUS_CODES.FORBIDDEN);
          expect(res.body).toHaveProperty('message');
          done();
        });
    });

    it('should not search talent if not found', async (done) => {
      const skill = await skillModel.create({ skill: 'Javascript' });
      user = await userM.findByIdAndUpdate(
        user.id,
        {
          // @ts-ignore
          $push: { roles: [USER_ROLES.RECRUITMENT_ADMIN] },
        },
        { new: true }
      );
      supertest(app)
        .get(`/api/v1/users/talent?skills=${skill._id}`)
        .set('Authorization', `Bearer ${token}`)
        .end((err, res) => {
          expect(res.status).toBe(STATUS_CODES.NOT_FOUND);
          expect(res.body).toHaveProperty('message');
          done();
        });
    });
  });
  describe('GET /users/talent?subscription=basic|standard|premium', () => {
    it('should successfully search talent based on subscription', async (done) => {
      const skill = await skillModel.create({ skill: 'Javascript' });
      const newUser = await userM.create({
        email: 'test@gmail.com',
        username: 'usernametest',
        password: '@Spassword12',
      });
      await userM.findByIdAndUpdate(newUser.id, { $push: { skills: skill._id } }, { new: true });
      user = await userM.findByIdAndUpdate(
        user.id,
        {
          // @ts-ignore
          $push: { roles: [USER_ROLES.COMPANY_ADMIN] },
        },
        { new: true }
      );
      supertest(app)
        .get(`/api/v1/users/talent?subscription=basic`)
        .set('Authorization', `Bearer ${token}`)
        .end((err, res) => {
          expect(res.status).toBe(STATUS_CODES.OK);
          expect(res.body).toHaveProperty('data');
          done();
        });
    });
  });

  describe('POST /addCourse', () => {
    beforeEach(async () => {
      const newUser = await userM.create(addUser(USER_ROLES.TRAINING_AFFILIATE));

      token = newUser.toAuthJSON().token;
    });

    it('should save new course', async () => {
      const newCourse = await supertest(app)
        .post('/api/v1/users/training/courses')
        .set('Authorization', `Bearer ${token}`)
        .send(addCourse);

      expect(newCourse.status).toEqual(STATUS_CODES.CREATED);

      expect(typeof newCourse.status).toEqual('number');
    });

    it('should return error when there is validation error', async () => {
      const newCourse = await supertest(app)
        .post('/api/v1/users/training/courses')
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(newCourse.status).toEqual(STATUS_CODES.BAD_REQUEST);
    });
  });

  describe('Super Admin /List all courses', () => {
    beforeEach(async () => {
      const newUser = await userM.create(addUser(USER_ROLES.SUPER_ADMIN));
      token = newUser.toAuthJSON().token;
    });

    it('should get all course', async () => {
      const course = await supertest(app)
        .get('/api/v1/users/training/courses')
        .set('Authorization', `Bearer ${token}`);

      expect(course.status).toEqual(STATUS_CODES.OK);

      expect(typeof course.status).toEqual('number');

      expect(course.body).toHaveProperty('courses');
    });
  });

  describe('Talent / List all courses', () => {
    beforeEach(async () => {
      const newUser = await userM.create(addUser(USER_ROLES.TALENT));

      token = newUser.toAuthJSON().token;
    });

    it('should get all course', async () => {
      const course = await supertest(app)
        .get('/api/v1/users/training/courses')
        .set('Authorization', `Bearer ${token}`);

      expect(course.status).toEqual(STATUS_CODES.OK);

      expect(typeof course.status).toEqual('number');

      expect(course.body).toHaveProperty('courses');
    });
  });

  describe('Super Admin / List specific courses', () => {
    beforeEach(async () => {
      const newUser = await userM.create(addUser(USER_ROLES.SUPER_ADMIN));

      const newCourse = await courseModel.create(addCourse);

      token = newUser.toAuthJSON().token;

      courseId = newCourse._id;
    });

    it('should get specific course', async () => {
      const course = await supertest(app)
        .get(`/api/v1/users/training/courses/${courseId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(course.status).toEqual(STATUS_CODES.OK);

      expect(typeof course.status).toEqual('number');

      expect(course.body).toHaveProperty('course');
    });
  });

  describe('Talent / List specific courses', () => {
    beforeEach(async () => {
      const newUser = await userM.create(addUser(USER_ROLES.TALENT));

      const newCourse = await courseModel.create(addCourse);

      token = newUser.toAuthJSON().token;

      courseId = newCourse._id;
    });

    it('should get specific course', async () => {
      const course = await supertest(app)
        .get(`/api/v1/users/training/courses/${courseId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(course.status).toEqual(STATUS_CODES.OK);

      expect(typeof course.status).toEqual('number');

      expect(course.body).toHaveProperty('course');
    });
  });

  describe('Update Course', () => {
    beforeEach(async () => {
      const newUser = await userM.create(addUser(USER_ROLES.SUPER_ADMIN));

      const newCourse = await courseModel.create(addCourse);

      token = newUser.toAuthJSON().token;

      courseId = newCourse._id;
    });
    it('should update course', async () => {
      const course = await supertest(app)
        .put(`/api/v1/users/training/courses/${courseId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(addCourse);

      expect(course.status).toEqual(STATUS_CODES.OK);

      expect(typeof course.status).toEqual('number');

      expect(course.body).toHaveProperty('message');
    });

    it('should return error when there is validation error', async () => {
      const course = await supertest(app)
        .put(`/api/v1/users/training/courses/${courseId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(course.status).toEqual(STATUS_CODES.BAD_REQUEST);
    });
  });
});
