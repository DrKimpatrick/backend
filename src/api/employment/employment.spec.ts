import supertest from 'supertest';
import { app } from '../../index';
import { ModelFactory } from '../../models/model.factory';
import { MODELS, STATUS_CODES, USER_ROLES } from '../../constants';
import { addUser, addNewEmployment } from '../users/__mocks__';

describe('Employment', () => {
  const userM = ModelFactory.getModel(MODELS.USER);
  const empModel = ModelFactory.getModel(MODELS.EMPLOYMENT_HISTORY);

  let token: any;
  let employmentId: string;
  let userId: string;
  let user: any;

  beforeEach(async () => {
    await userM.deleteMany({});
    await empModel.deleteMany({});

    user = await userM.create(addUser(USER_ROLES.TALENT));

    token = user.toAuthJSON().token;

    const newEmployment = await new empModel(addNewEmployment(user._id)).save();

    employmentId = newEmployment._id;

    userId = user._id;
  });

  afterEach(async () => {
    await userM.deleteMany({});
    await empModel.deleteMany({});
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
});
