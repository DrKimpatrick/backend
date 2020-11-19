import supertest from 'supertest';
import faker from 'faker';
import { app } from '../../index';
import { ModelFactory } from '../../models/model.factory';
import {
  MODELS,
  SIGNUP_MODE,
  SKILL_LEVEL,
  SKILL_VERIFICATION_STATUS,
  STATUS_CODES,
  USER_ROLES,
} from '../../constants';

describe('Skills /skills', () => {
  const userM = ModelFactory.getModel(MODELS.USER);
  const skillModel = ModelFactory.getModel(MODELS.SKILL);
  const userSkillModel = ModelFactory.getModel(MODELS.USER_SKILLS);

  let token: any;
  let user: any;

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
  });

  it('should return an error when given wrong data', async (done) => {
    user = await userM.findByIdAndUpdate(
      user.id,
      {
        // @ts-ignore
        $push: { roles: [USER_ROLES.SUPER_ADMIN] },
      },
      { new: true }
    );

    supertest(app)
      .post(`/api/v1/skills`)
      .set('Authorization', `Bearer ${token}`)
      .send([{}])
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
        $push: { roles: [USER_ROLES.SUPER_ADMIN] },
      },
      { new: true }
    );

    supertest(app)
      .post(`/api/v1/skills/`)
      .set('Authorization', `Bearer ${token}`)
      .send([{ skill }])
      .end((err, res) => {
        expect(res.status).toBe(STATUS_CODES.CREATED);
        expect(res.body).toHaveProperty('data');
        expect(Array.isArray(res.body.data)).toBeTruthy();
        expect(res.body.data[0]).toHaveProperty('skill');
        expect(res.body.data[0].skill).toEqual(skill);
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
        $push: { roles: [USER_ROLES.SUPER_ADMIN] },
      },
      { new: true }
    );

    const name = faker.name.title();
    const skill = await skillModel.create({ skill: name });
    expect(skill.skill).toEqual(name);

    supertest(app)
      .put(`/api/v1/skills/${skill._id}`)
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
        $push: { roles: [USER_ROLES.SUPER_ADMIN] },
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

  it('should Fail to create a User Skill set with invalid skill', async (done) => {
    const skill = faker.name.title();

    supertest(app)
      .post(`/api/v1/skills/me`)
      .set('Authorization', `Bearer ${token}`)
      .send([{ skill }])
      .end((err, res) => {
        expect(res.status).toBe(STATUS_CODES.BAD_REQUEST);
        expect(res.body).toHaveProperty('errors');
        expect(Array.isArray(res.body.errors)).toBeTruthy();
        expect(res.body.errors[0]['[0].skill']).toEqual('Skill must be a valid ID');
        done();
      });
  });

  it('should create a User Skill set', async (done) => {
    const skill = await skillModel.create({ skill: faker.name.title() });

    supertest(app)
      .post(`/api/v1/skills/me`)
      .set('Authorization', `Bearer ${token}`)
      .send([{ skill: skill.id.toString() }])
      .end((err, res) => {
        expect(res.status).toBe(STATUS_CODES.CREATED);
        expect(res.body).toHaveProperty('data');
        expect(Array.isArray(res.body.data)).toBeTruthy();
        expect(res.body.data[0]).toHaveProperty('skill');
        expect(res.body.data[0].skill).toHaveProperty('_id');
        expect(res.body.data[0].skill).toHaveProperty('skill');
        expect(res.body.data[0].skill._id).toEqual(skill._id.toString());
        expect(res.body.data[0].skill.skill).toEqual(skill.skill);
        done();
      });
  });

  it('should Return a list of User Skills', async (done) => {
    const skill = await skillModel.create({ skill: faker.name.title() });

    let userSkills = await userSkillModel.find({ user: user.id }).exec();
    expect(Array.isArray(userSkills)).toBeTruthy();
    expect(userSkills).toHaveLength(0);

    await userSkillModel.create({ skill: skill.id, user: user.id });

    supertest(app)
      .get(`/api/v1/skills/me`)
      .set('Authorization', `Bearer ${token}`)
      .end(async (err, res) => {
        expect(res.status).toBe(STATUS_CODES.OK);
        expect(res.body).toHaveProperty('data');
        expect(Array.isArray(res.body.data)).toBeTruthy();
        expect(res.body.data[0]).toHaveProperty('skill');
        expect(res.body.data[0].skill).toHaveProperty('_id');
        expect(res.body.data[0].skill).toHaveProperty('skill');
        expect(res.body.data[0].skill._id).toEqual(skill._id.toString());
        expect(res.body.data[0].skill.skill).toEqual(skill.skill);

        userSkills = await userSkillModel.find({ user: user.id }).exec();
        expect(Array.isArray(userSkills)).toBeTruthy();
        expect(userSkills).toHaveLength(1);

        done();
      });
  });

  it('should Update a User Skill Successfully', async (done) => {
    const skill = await skillModel.create({ skill: faker.name.title() });
    let userSkill = await userSkillModel.create({ skill: skill.id, user: user.id });

    expect(userSkill.verificationStatus).toEqual(SKILL_VERIFICATION_STATUS.UNVERIFIED);
    expect(userSkill.level).toEqual(SKILL_LEVEL.BEGINNER);

    supertest(app)
      .patch(`/api/v1/skills/me`)
      .set('Authorization', `Bearer ${token}`)
      .send([{ userSkill: userSkill.id.toString(), level: SKILL_LEVEL.INTERMEDIATE }])
      .end(async (err, res) => {
        expect(res.status).toBe(STATUS_CODES.OK);
        expect(res.body).toHaveProperty('data');
        expect(Array.isArray(res.body.data)).toBeTruthy();
        expect(res.body.data[0]).toHaveProperty('skill');
        expect(res.body.data[0]).toHaveProperty('_id');
        expect(res.body.data[0]._id).toEqual(userSkill._id.toString());
        expect(res.body.data[0].skill).toEqual(skill.id.toString());
        expect(res.body.data[0].verificationStatus).toEqual(SKILL_VERIFICATION_STATUS.UNVERIFIED);
        expect(res.body.data[0].level).toEqual(SKILL_LEVEL.INTERMEDIATE);

        userSkill = await userSkillModel.findOne({ skill: skill.id, user: user.id });
        expect(userSkill.verificationStatus).toEqual(SKILL_VERIFICATION_STATUS.UNVERIFIED);
        expect(userSkill.level).toEqual(SKILL_LEVEL.INTERMEDIATE);
        done();
      });
  });
});
