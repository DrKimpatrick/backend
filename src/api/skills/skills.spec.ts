import supertest from 'supertest';
import faker from 'faker';
import { app } from '../../index';
import { ModelFactory } from '../../models/model.factory';
import { MODELS, SIGNUP_MODE, STATUS_CODES, USER_ROLES } from '../../constants';

describe('Skills /skills', () => {
  const userM = ModelFactory.getModel(MODELS.USER);
  const skillModel = ModelFactory.getModel(MODELS.SKILLS);

  let token: any;
  let user: any;

  beforeEach(async () => {
    await userM.deleteMany({});
    await skillModel.deleteMany({});

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
  });

  it('should return an error when given wrong data', async (done) => {
    user = await userM.findByIdAndUpdate(
      user.id,
      {
        // @ts-ignore
        $push: { roles: [USER_ROLES.COMPANY_ADMIN] },
      },
      { new: true }
    );

    supertest(app)
      .post(`/api/v1/skills`)
      .set('Authorization', `Bearer ${token}`)
      .send({})
      .end((err, res) => {
        expect(res.status).toBe(STATUS_CODES.BAD_REQUEST);
        expect(res.body).toHaveProperty('errors');
        expect(Array.isArray(res.body.errors)).toBeTruthy();
        done();
      });
  });

  it('should create a Skill set', async (done) => {
    const skill = faker.name.title();

    user = await userM.findByIdAndUpdate(
      user.id,
      {
        // @ts-ignore
        $push: { roles: [USER_ROLES.COMPANY_ADMIN] },
      },
      { new: true }
    );

    supertest(app)
      .post(`/api/v1/skills/`)
      .set('Authorization', `Bearer ${token}`)
      .send({ skill })
      .end((err, res) => {
        expect(res.status).toBe(STATUS_CODES.OK);
        expect(res.body).toHaveProperty('data');
        expect(res.body.data).toHaveProperty('skill');
        expect(res.body.data.skill).toEqual(skill);
        done();
      });
  });

  it('should fetch all skill sets', async (done) => {
    const skill = await skillModel.create({ skill: faker.name.title() });

    supertest(app)
      .get(`/api/v1/skills/`)
      .set('Authorization', `Bearer ${token}`)
      .end((err, res) => {
        expect(res.status).toBe(STATUS_CODES.OK);
        expect(res.body).toHaveProperty('data');
        expect(Array.isArray(res.body.data)).toBeTruthy();
        expect(res.body.data).toHaveLength(1);
        expect(res.body.data[0]._id).toEqual(skill._id.toString());
        done();
      });
  });

  it('should fetch single skill set', async (done) => {
    const skill = await skillModel.create({ skill: faker.name.title() });

    supertest(app)
      .get(`/api/v1/skills/${skill._id}`)
      .set('Authorization', `Bearer ${token}`)
      .end((err, res) => {
        expect(res.status).toBe(STATUS_CODES.OK);
        expect(res.body).toHaveProperty('data');
        expect(Array.isArray(res.body.data)).toBeFalsy();
        expect(res.body.data).toHaveProperty('_id');
        expect(res.body.data._id).toEqual(skill._id.toString());
        done();
      });
  });

  it('should Update single skill set', async (done) => {
    user = await userM.findByIdAndUpdate(
      user.id,
      {
        // @ts-ignore
        $push: { roles: [USER_ROLES.COMPANY_ADMIN] },
      },
      { new: true }
    );

    const name = faker.name.title();
    const skill = await skillModel.create({ skill: name });
    expect(skill.skill).toEqual(name);

    supertest(app)
      .patch(`/api/v1/skills/${skill._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ skill: faker.name.title() })
      .end((err, res) => {
        expect(res.status).toBe(STATUS_CODES.OK);
        expect(res.body).toHaveProperty('data');
        expect(res.body.data).toHaveProperty('_id');
        expect(res.body.data._id).toEqual(skill._id.toString());
        expect(res.body.data.skill).not.toEqual(skill.skill);
        done();
      });
  });

  it('should Delete a single skill set', async (done) => {
    let skill = await skillModel.create({ skill: faker.name.title() });

    user = await userM.findByIdAndUpdate(
      user.id,
      {
        // @ts-ignore
        $push: { roles: [USER_ROLES.COMPANY_ADMIN] },
      },
      { new: true }
    );

    supertest(app)
      .del(`/api/v1/skills/${skill._id}`)
      .set('Authorization', `Bearer ${token}`)
      .end(async (err, res) => {
        expect(res.status).toBe(STATUS_CODES.NO_CONTENT);

        skill = await skillModel.findById(skill._id).exec();
        expect(skill).toBeNull();
        done();
      });
  });
});
