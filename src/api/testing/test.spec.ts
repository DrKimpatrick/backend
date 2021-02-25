import supertest from 'supertest';
import faker from 'faker';
import { app } from '../../index';
import { USER_ROLES, MODELS } from '../../constants';
import { addUser } from '../users/__mocks__';
import { ModelFactory } from '../../models/model.factory';
import { environment } from '../../config/environment';
import { STATUS_CODES, TimePolicy } from '../../constants';

let token: string;

const userModel = ModelFactory.getModel(MODELS.USER);

describe('testing', () => {
  beforeEach(async () => {
    const user = await userModel.create(addUser(USER_ROLES.SUPER_ADMIN));

    token = `Bearer ${user.toAuthJSON().token}`;
  });

  describe('create test', () => {
    it('should create new test', async () => {
      const res = await supertest(app)
        .post(`${environment.apiPrefix}/test`)
        .set('Authorization', token)
        .send({
          name: faker.name.firstName(),
          description: faker.lorem.paragraphs(),
          timePolicy: TimePolicy.Strict,
        });

      expect(res.status).toEqual(STATUS_CODES.CREATED);

      expect(res.body).toHaveProperty('message');
    });

    it('should return validation error', async () => {
      const res = await supertest(app)
        .post(`${environment.apiPrefix}/test`)
        .set('Authorization', token)
        .send({});

      expect(res.status).toEqual(STATUS_CODES.BAD_REQUEST);
    });
  });
});
