import supertest from 'supertest';
import { app } from '../../index';
import { ModelFactory } from '../../models/model.factory';
import { MODELS, STATUS_CODES, USER_ROLES } from '../../constants';
import { addUser, addNewCompanyOrSchool as addNewSchool } from '../users/__mocks__';

describe('School', () => {
  const userM = ModelFactory.getModel(MODELS.USER);
  const schoolModel = ModelFactory.getModel(MODELS.SCHOOL);

  let token: any;
  let schoolId: string;
  let school: any;
  let userId: string;

  beforeEach(async () => {
    const user = await userM.create(addUser(USER_ROLES.TRAINNING_ADMIN));
    token = user.toAuthJSON().token;
    userId = user._id;

    const newSchool = await schoolModel.create({
      ...addNewSchool(),
      userId,
    });
    schoolId = newSchool._id;
    school = newSchool;
  });

  afterEach(async () => {
    await userM.deleteMany({});
    await schoolModel.deleteMany({});
  });

  describe('Create new school', () => {
    it('should create new school', async () => {
      const res = await supertest(app)
        .post('/api/v1/school')
        .set('Authorization', `Bearer ${token}`)
        .send(addNewSchool());
      expect(res.status).toEqual(STATUS_CODES.CREATED);
      expect(res.body).toHaveProperty('message');
    });

    it('should not create a new school if validations fails', async () => {
      const res = await supertest(app)
        .post('/api/v1/school')
        .set('Authorization', `Bearer ${token}`)
        .send({});
      expect(res.status).toEqual(STATUS_CODES.BAD_REQUEST);
      expect(res.body).toHaveProperty('errors');
      expect(Array.isArray(res.body.errors)).toBeTruthy();
    });

    it('should not create a school if user has roles other than training or super admin roles', async () => {
      const newUser = await userM.create(addUser(USER_ROLES.TALENT));
      const newUserToken = newUser.toAuthJSON().token;

      const res = await supertest(app)
        .post('/api/v1/school')
        .set('Authorization', `Bearer ${newUserToken}`)
        .send(addNewSchool());
      expect(res.status).toEqual(STATUS_CODES.FORBIDDEN);
      expect(res.body).toHaveProperty('message');
    });
  });

  describe('Get a specific school', () => {
    it('Should fetch a specific school', async () => {
      const res = await supertest(app)
        .get(`/api/v1/school/${schoolId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toEqual(STATUS_CODES.OK);
      expect(res.body).toHaveProperty('data');
    });

    it('Should not fetch a specific school if not found', async () => {
      await schoolModel.findByIdAndDelete(schoolId);
      await userM.findByIdAndUpdate(
        school?.userId,
        {
          $pull: { schools: school?._id.toString() },
        },
        { new: true }
      );
      const res = await supertest(app)
        .get(`/api/v1/school/${schoolId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toEqual(STATUS_CODES.BAD_REQUEST);
      expect(res.body).toHaveProperty('message');
    });

    it('Should not fetch a school with wrong id', async () => {
      const wrongSchoolId = '12kjkj232k232';
      const res = await supertest(app)
        .get(`/api/v1/school/${wrongSchoolId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toEqual(STATUS_CODES.BAD_REQUEST);
      expect(res.body).toHaveProperty('message');
    });
  });

  describe('Update a specific school', () => {
    it('should update a school', async () => {
      const res = await supertest(app)
        .patch(`/api/v1/school/${schoolId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'school name updated' });
      expect(res.status).toEqual(STATUS_CODES.OK);
      expect(res.body).toHaveProperty('data');
    });

    it('should not update a school if user is not the owner or super admin', async () => {
      const newUser = await userM.create(addUser(USER_ROLES.TRAINNING_ADMIN));
      const newUserToken = newUser.toAuthJSON().token;

      const res = await supertest(app)
        .patch(`/api/v1/school/${schoolId}`)
        .set('Authorization', `Bearer ${newUserToken}`)
        .send({ name: 'school name updated' });
      expect(res.status).toEqual(STATUS_CODES.UNAUTHORIZED);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('Delete a specific school', () => {
    it('should not delete a school if user is not the owner or super admin', async () => {
      const newUser = await userM.create(addUser(USER_ROLES.TRAINNING_ADMIN));
      const newUserToken = newUser.toAuthJSON().token;

      const res = await supertest(app)
        .delete(`/api/v1/school/${schoolId}`)
        .set('Authorization', `Bearer ${newUserToken}`);
      expect(res.status).toEqual(STATUS_CODES.UNAUTHORIZED);
      expect(res.body).toHaveProperty('error');
    });

    it('should delete a school', async () => {
      const res = await supertest(app)
        .delete(`/api/v1/school/${schoolId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toEqual(STATUS_CODES.NO_CONTENT);
    });
  });
});
