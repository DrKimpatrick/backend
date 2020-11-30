import supertest from 'supertest';
import { app } from '../../index';
import { ModelFactory } from '../../models/model.factory';
import { MODELS, STATUS_CODES, USER_ROLES, SKILL_VERIFICATION_STATUS } from '../../constants';
import { addUser, addNewEmployment } from '../users/__mocks__';

describe('Employment', () => {
  const userM = ModelFactory.getModel(MODELS.USER);
  const empModel = ModelFactory.getModel(MODELS.EMPLOYMENT_HISTORY);

  let token: any;
  let employmentId: string;
  let userId: string;
  let user: any;

  beforeEach(async () => {
    user = await userM.create(addUser(USER_ROLES.TALENT));

    token = user.toAuthJSON().token;

    const newEmployment = await new empModel(addNewEmployment(user._id)).save();

    employmentId = newEmployment._id;

    userId = user._id;
  });

  describe('Add new Employment history', () => {
    it('save new employment history', async () => {
      const res = await supertest(app)
        .post('/api/v1/employment')
        .set('Authorization', `Bearer ${token}`)
        .send(addNewEmployment(userId));
      expect(res.status).toEqual(STATUS_CODES.CREATED);
      expect(res.body).toHaveProperty('message');
    });

    it('return validation error', async () => {
      const res = await supertest(app)
        .post('/api/v1/employment')
        .set('Authorization', `Bearer ${token}`)
        .send({});
      expect(res.status).toEqual(STATUS_CODES.BAD_REQUEST);
    });
  });

  describe('Get User Employment history', () => {
    it('list all employment history', async () => {
      const res = await supertest(app)
        .get('/api/v1/employment')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toEqual(STATUS_CODES.OK);
      expect(res.body).toHaveProperty('data');
    });

    it('list specific employment history', async () => {
      const res = await supertest(app)
        .get(`/api/v1/employment/${employmentId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toEqual(STATUS_CODES.OK);
      expect(res.body).toHaveProperty('data');
    });
  });

  describe('Update Employment history', () => {
    it('update employment history', async () => {
      const res = await supertest(app)
        .put(`/api/v1/employment/${employmentId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(addNewEmployment(userId));
      expect(res.status).toEqual(STATUS_CODES.OK);
      expect(res.body).toHaveProperty('message');
    });

    it('return validation error', async () => {
      const res = await supertest(app)
        .put(`/api/v1/employment/${employmentId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({});
      expect(res.status).toEqual(STATUS_CODES.BAD_REQUEST);
    });
  });

  describe('Delete Employment history', () => {
    it('delete', async () => {
      const res = await supertest(app)
        .delete(`/api/v1/employment/${employmentId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toEqual(STATUS_CODES.OK);
      expect(res.body).toHaveProperty('message');
    });
  });

  describe('Change Employment Status', () => {
    beforeEach(async () => {
      const newUser = await userM.create(addUser(USER_ROLES.SUPER_ADMIN));

      token = newUser.toAuthJSON().token;
    });
    it('should change verification status', async () => {
      const res = await supertest(app)
        .put(`/api/v1/employment/status/${employmentId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ verificationStatus: SKILL_VERIFICATION_STATUS.VERIFIED });

      expect(res.status).toEqual(STATUS_CODES.OK);
      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('message');
    });

    it('should return validation error when verification status not provided', async () => {
      const res = await supertest(app)
        .put(`/api/v1/employment/status/${employmentId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ verificationStatus: '' });

      expect(res.status).toEqual(STATUS_CODES.BAD_REQUEST);
    });

    it('should return error when employment not found', async () => {
      const res = await supertest(app)
        .put('/api/v1/employment/status/5fbf7863e1f4e723fab1ab1f')
        .set('Authorization', `Bearer ${token}`)
        .send({ verificationStatus: SKILL_VERIFICATION_STATUS.VERIFIED });

      expect(res.status).toEqual(STATUS_CODES.NOT_FOUND);

      expect(res.body).toHaveProperty('message');
    });
  });
});
