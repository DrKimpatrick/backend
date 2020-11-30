import supertest from 'supertest';
import faker from 'faker';
import { format } from 'date-fns';
import { app } from '../../index';
import { ModelFactory } from '../../models/model.factory';
import {
  MODELS,
  SIGNUP_MODE,
  SKILL_VERIFICATION_STATUS,
  STATUS_CODES,
  USER_ROLES,
} from '../../constants';
import { addUser } from '../users/__mocks__';

describe('Education /education', () => {
  const userM = ModelFactory.getModel(MODELS.USER);
  const educationModel = ModelFactory.getModel(MODELS.EDUCATION_HISTORY);

  let token: any;
  let user: any;
  let education: any;

  const addEducToUser = async () => {
    expect(user.educationHistory.length).toEqual(0);
    education = await educationModel.create({
      schoolName: faker.name.title(),
      startDate: format(faker.date.past(1, new Date(2019, 0, 1)), 'yyyy-MM-dd'),
      endDate: format(new Date(), 'yyyy-MM-dd'),
    });
    user = await userM.findByIdAndUpdate(
      user.id,
      { $push: { educationHistory: education.id.toString() } },
      { new: true }
    );
    expect(user.educationHistory.length).toEqual(1);
  };

  beforeEach(async () => {
    user = await userM.create({
      signupMode: SIGNUP_MODE.LOCAL,
      firstName: 'Some Name',
      email: 'test@email.com',
      username: 'test@email.com',
      verified: true,
      password: 'really',
    });
    token = user.toAuthJSON().token;
    expect(Array.isArray(user.educationHistory)).toBeTruthy();
  });

  it('should Error on create an education record for this user', async (done) => {
    expect(user.educationHistory.length).toEqual(0);

    supertest(app)
      .post(`/api/v1/education`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        schoolName: faker.name.title(),
      })
      .end(async (err, res) => {
        expect(res.status).toBe(STATUS_CODES.BAD_REQUEST);
        expect(res.body).toHaveProperty('errors');
        expect(Array.isArray(res.body.errors)).toBeTruthy();

        user = await userM.findById(user._id).exec();
        expect(user.educationHistory.length).toEqual(0);
        done();
      });
  });

  it('should create an Education Record', async (done) => {
    expect(user.educationHistory.length).toEqual(0);

    supertest(app)
      .post(`/api/v1/education`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        schoolName: faker.name.title(),
        startDate: format(faker.date.past(1, new Date(2019, 0, 1)), 'yyyy-MM-dd'),
        endDate: format(new Date(), 'yyyy-MM-dd'),
      })
      .end(async (err, res) => {
        expect(res.status).toBe(STATUS_CODES.OK);
        expect(res.body).toHaveProperty('data');
        expect(res.body.data).toHaveProperty('_id');

        user = await userM.findById(user._id).exec();
        expect(user.educationHistory.length).toEqual(1);
        expect(user.educationHistory[0].toString()).toEqual(res.body.data._id);
        done();
      });
  });

  it('should fetch all Education Data', async (done) => {
    await addEducToUser();

    supertest(app)
      .get(`/api/v1/education`)
      .set('Authorization', `Bearer ${token}`)
      .end((err, res) => {
        expect(res.status).toBe(STATUS_CODES.OK);
        expect(res.body).toHaveProperty('data');
        expect(Array.isArray(res.body.data)).toBeTruthy();
        expect(res.body.data).toHaveLength(1);
        expect(res.body.data[0]._id).toEqual(education._id.toString());
        done();
      });
  });

  it('should fetch single Education set', async (done) => {
    await addEducToUser();

    supertest(app)
      .get(`/api/v1/education/${user._id}/${education._id}`)
      .set('Authorization', `Bearer ${token}`)
      .end((err, res) => {
        expect(res.status).toBe(STATUS_CODES.OK);
        expect(res.body).toHaveProperty('data');
        expect(Array.isArray(res.body.data)).toBeFalsy();
        expect(res.body.data).toHaveProperty('_id');
        expect(res.body.data._id).toEqual(education._id.toString());
        done();
      });
  });

  it('should Update single Education Hist', async (done) => {
    await addEducToUser();
    expect(education.verificationStatus).toEqual(SKILL_VERIFICATION_STATUS.UNVERIFIED);

    supertest(app)
      .patch(`/api/v1/education/${user._id}/${education._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ verificationStatus: SKILL_VERIFICATION_STATUS.VERIFIED })
      .end(async (err, res) => {
        expect(res.status).toBe(STATUS_CODES.OK);
        expect(res.body).toHaveProperty('data');
        expect(res.body.data).toHaveProperty('_id');
        expect(res.body.data._id).toEqual(education._id.toString());
        expect(res.body.data.verificationStatus).toEqual(SKILL_VERIFICATION_STATUS.UNVERIFIED);

        // user cannot verify their status, create a different super admin to do so
        const superUser = await userM.create({
          signupMode: SIGNUP_MODE.LOCAL,
          firstName: 'Some Name',
          email: faker.internet.email(),
          username: faker.internet.userName(),
          verified: true,
          password: 'really',
          roles: [USER_ROLES.SUPER_ADMIN],
        });

        const tkn = superUser.toAuthJSON().token;

        supertest(app)
          .patch(`/api/v1/education/${user._id}/${education._id}`)
          .set('Authorization', `Bearer ${tkn}`)
          .send({ verificationStatus: SKILL_VERIFICATION_STATUS.VERIFIED })
          .end((err, res) => {
            expect(res.status).toBe(STATUS_CODES.OK);
            expect(res.body).toHaveProperty('data');
            expect(res.body.data).toHaveProperty('_id');
            expect(res.body.data._id).toEqual(education._id.toString());
            expect(res.body.data.verificationStatus).toEqual(SKILL_VERIFICATION_STATUS.VERIFIED);

            done();
          });
      });
  });

  it('should Delete a Education Hist', async (done) => {
    await addEducToUser();

    supertest(app)
      .del(`/api/v1/education/${education._id}`)
      .set('Authorization', `Bearer ${token}`)
      .end(async (err, res) => {
        expect(res.status).toBe(STATUS_CODES.NO_CONTENT);

        education = await educationModel.findById(education._id).exec();
        user = await userM.findById(user._id).exec();

        expect(education).toBeNull();
        expect(user.educationHistory.length).toEqual(0);
        done();
      });
  });

  describe('Change Education Status', () => {
    let educationId: string;
    beforeEach(async () => {
      const newUser = await userM.create(addUser(USER_ROLES.SUPER_ADMIN));

      token = newUser.toAuthJSON().token;

      const newEducation = await educationModel.create({
        schoolName: faker.name.title(),
        startDate: format(faker.date.past(1, new Date(2019, 0, 1)), 'yyyy-MM-dd'),
        endDate: format(new Date(), 'yyyy-MM-dd'),
      });

      educationId = newEducation._id;
    });

    it('should allow admin to change education status', async () => {
      const res = await supertest(app)
        .put(`/api/v1/education/status/${educationId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ verificationStatus: SKILL_VERIFICATION_STATUS.VERIFIED });

      expect(res.status).toEqual(STATUS_CODES.OK);

      expect(res.body).toHaveProperty('data');

      expect(res.body).toHaveProperty('message');
    });

    it('should return validation error when verification status not provided', async () => {
      const res = await supertest(app)
        .put(`/api/v1/education/status/${educationId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ verificationStatus: '' });

      expect(res.status).toEqual(STATUS_CODES.BAD_REQUEST);
    });

    it('should return error when education not found', async () => {
      const res = await supertest(app)
        .put(`/api/v1/education/status/5fbf7863e1f4e723fab1ab1f`)
        .set('Authorization', `Bearer ${token}`)
        .send({ verificationStatus: SKILL_VERIFICATION_STATUS.VERIFIED });

      expect(res.status).toEqual(STATUS_CODES.NOT_FOUND);

      expect(res.body).toHaveProperty('message');
    });
  });
});
