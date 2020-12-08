import supertest from 'supertest';
import { app } from '../../index';
import { ModelFactory } from '../../models/model.factory';
import { MODELS, STATUS_CODES, USER_ROLES } from '../../constants';
import { addUser, addNewCompanyOrSchool as addNewCompany } from '../users/__mocks__';

describe('Company', () => {
  const userM = ModelFactory.getModel(MODELS.USER);
  const companyModel = ModelFactory.getModel(MODELS.COMPANY);

  let token: any;
  let companyId: string;
  let company: any;
  let userId: string;

  beforeEach(async () => {
    const user = await userM.create(addUser(USER_ROLES.RECRUITMENT_ADMIN));
    token = user.toAuthJSON().token;
    userId = user._id;

    const newCompany = await companyModel.create({
      ...addNewCompany(),
      userId,
    });
    companyId = newCompany._id;
    company = newCompany;
  });

  afterEach(async () => {
    await userM.deleteMany({});
    await companyModel.deleteMany({});
  });

  describe('Create new Company', () => {
    it('should create new company', async () => {
      const res = await supertest(app)
        .post('/api/v1/company')
        .set('Authorization', `Bearer ${token}`)
        .send(addNewCompany());
      expect(res.status).toEqual(STATUS_CODES.CREATED);
      expect(res.body).toHaveProperty('message');
    });

    it('should not create a new company if validations fails', async () => {
      const res = await supertest(app)
        .post('/api/v1/company')
        .set('Authorization', `Bearer ${token}`)
        .send({});
      expect(res.status).toEqual(STATUS_CODES.BAD_REQUEST);
      expect(res.body).toHaveProperty('errors');
      expect(Array.isArray(res.body.errors)).toBeTruthy();
    });

    it('should not create a company if user has roles other than HR/Company/Recruitment roles', async () => {
      const newUser = await userM.create(addUser(USER_ROLES.TALENT));
      const newUserToken = newUser.toAuthJSON().token;

      const res = await supertest(app)
        .post('/api/v1/company')
        .set('Authorization', `Bearer ${newUserToken}`)
        .send(addNewCompany());
      expect(res.status).toEqual(STATUS_CODES.FORBIDDEN);
      expect(res.body).toHaveProperty('message');
    });
  });

  describe('Get a specific company', () => {
    it('Should fetch a specific company', async () => {
      const res = await supertest(app)
        .get(`/api/v1/company/${companyId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toEqual(STATUS_CODES.OK);
      expect(res.body).toHaveProperty('data');
    });

    it('Should not fetch a specific company if not found', async () => {
      await companyModel.findByIdAndDelete(companyId);
      await userM.findByIdAndUpdate(
        company?.userId,
        {
          $pull: { companies: company?._id.toString() },
        },
        { new: true }
      );
      const res = await supertest(app)
        .get(`/api/v1/company/${companyId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toEqual(STATUS_CODES.BAD_REQUEST);
      expect(res.body).toHaveProperty('message');
    });

    it('Should not fetch a company with wrong id', async () => {
      const wrongCompanyId = '12kjkj232k232';
      const res = await supertest(app)
        .get(`/api/v1/company/${wrongCompanyId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toEqual(STATUS_CODES.BAD_REQUEST);
      expect(res.body).toHaveProperty('message');
    });
  });

  describe('Update a specific company', () => {
    it('should update a company', async () => {
      const res = await supertest(app)
        .patch(`/api/v1/company/${companyId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'company name updated' });
      expect(res.status).toEqual(STATUS_CODES.OK);
      expect(res.body).toHaveProperty('data');
    });

    it('should not update a company if user is not the owner or super admin', async () => {
      const newUser = await userM.create(addUser(USER_ROLES.RECRUITMENT_ADMIN));
      const newUserToken = newUser.toAuthJSON().token;

      const res = await supertest(app)
        .patch(`/api/v1/company/${companyId}`)
        .set('Authorization', `Bearer ${newUserToken}`)
        .send({ name: 'company name updated' });
      expect(res.status).toEqual(STATUS_CODES.UNAUTHORIZED);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('Delete a specific company', () => {
    it('should not delete a company if user is not the owner or super admin', async () => {
      const newUser = await userM.create(addUser(USER_ROLES.RECRUITMENT_ADMIN));
      const newUserToken = newUser.toAuthJSON().token;

      const res = await supertest(app)
        .delete(`/api/v1/company/${companyId}`)
        .set('Authorization', `Bearer ${newUserToken}`);
      expect(res.status).toEqual(STATUS_CODES.UNAUTHORIZED);
      expect(res.body).toHaveProperty('error');
    });

    it('should delete a company', async () => {
      const res = await supertest(app)
        .delete(`/api/v1/company/${companyId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toEqual(STATUS_CODES.NO_CONTENT);
    });
  });
});
