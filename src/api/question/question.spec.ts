import supertest from 'supertest';
import faker from 'faker';
import { app } from '../../index';
import { USER_ROLES, MODELS, LANGUAGE, SKILL_LEVEL, QuestionType } from '../../constants';
import { addUser } from '../users/__mocks__';
import { ModelFactory } from '../../models/model.factory';
import { environment } from '../../config/environment';
import { STATUS_CODES, TimePolicy } from '../../constants';

let token: string;

const userModel = ModelFactory.getModel(MODELS.USER);
const testModel = ModelFactory.getModel(MODELS.Test);
const questionModel = ModelFactory.getModel(MODELS.Question);

describe('Question', () => {
  beforeEach(async () => {
    const user = await userModel.create(addUser(USER_ROLES.SUPER_ADMIN));

    token = `Bearer ${user.toAuthJSON().token}`;
  });

  describe('create multple choice question', () => {
    it('should create new multiple choice question', async () => {
      const createTest = await testModel.create({
        name: faker.name.firstName(),
        description: faker.lorem.paragraphs(),
        timePolicy: TimePolicy.Strict,
      });
      const res = await supertest(app)
        .post(`${environment.apiPrefix}/question/mcq`)
        .set('Authorization', token)
        .send({
          name: faker.name.firstName(),
          language: LANGUAGE.JAVASCRIPT,
          question: faker.lorem.sentence(),
          choice: ['java', 'php'],
          solution: ['java'],
          level: SKILL_LEVEL.BEGINNER,
          expectedTime: '1',
          questionType: QuestionType.MultipleChoice,
          testId: createTest._id,
        });

      expect(res.status).toEqual(STATUS_CODES.CREATED);

      expect(res.body).toHaveProperty('message');
    });

    it('should return validation error if no body sent', async () => {
      const res = await supertest(app)
        .post(`${environment.apiPrefix}/question/mcq`)
        .set('Authorization', token)
        .send({});

      expect(res.status).toEqual(STATUS_CODES.BAD_REQUEST);
    });

    it('should return validation error if invalid langauage, level , questionType, choice are sent', async () => {
      const res = await supertest(app)
        .post(`${environment.apiPrefix}/question/mcq`)
        .set('Authorization', token)
        .send({
          language: 'invalid',
          questionType: 'invalid',
          level: 'invalid',
          choice: [''],
        });

      expect(res.status).toEqual(STATUS_CODES.BAD_REQUEST);
    });

    it('should return validation error if invalid URL is sent when creating video question', async () => {
      const res = await supertest(app)
        .post(`${environment.apiPrefix}/question/mcq`)
        .set('Authorization', token)
        .send({
          question: 'invalid url',
          questionType: QuestionType.Video,
        });

      expect(res.status).toEqual(STATUS_CODES.BAD_REQUEST);
    });

    it('should return validation error if testId not found', async () => {
      const user = await userModel.create(addUser(USER_ROLES.SUPER_ADMIN));
      const res = await supertest(app)
        .post(`${environment.apiPrefix}/question/mcq`)
        .set('Authorization', token)
        .send({
          testId: user._id,
        });

      expect(res.status).toEqual(STATUS_CODES.BAD_REQUEST);
    });
  });

  describe('Get single question', () => {
    let question: any;

    beforeEach(async () => {
      const createTest = await testModel.create({
        name: faker.name.firstName(),
        description: faker.lorem.paragraphs(),
        timePolicy: TimePolicy.Strict,
      });
      question = await questionModel.create({
        name: faker.name.firstName(),
        language: LANGUAGE.JAVASCRIPT,
        question: faker.lorem.sentence(),
        choice: ['java', 'php'],
        solution: ['java'],
        level: SKILL_LEVEL.BEGINNER,
        expectedTime: '1',
        questionType: QuestionType.MultipleChoice,
        testId: createTest._id,
      });
    });

    it('should fetch a single question', async () => {
      const res = await supertest(app)
        .get(`${environment.apiPrefix}/question/${question._id}`)
        .set('Authorization', token);

      expect(res.status).toEqual(STATUS_CODES.OK);
    });

    it('should return not found when wrong ID is sent', async () => {
      const user = await userModel.create(addUser(USER_ROLES.SUPER_ADMIN));
      const res = await supertest(app)
        .get(`${environment.apiPrefix}/question/${user._id}`)
        .set('Authorization', token);

      expect(res.status).toEqual(STATUS_CODES.NOT_FOUND);
    });
  });

  describe('Update question', () => {
    let question: any;

    beforeEach(async () => {
      const createTest = await testModel.create({
        name: faker.name.firstName(),
        description: faker.lorem.paragraphs(),
        timePolicy: TimePolicy.Strict,
      });
      question = await questionModel.create({
        name: faker.name.firstName(),
        language: LANGUAGE.JAVASCRIPT,
        question: faker.lorem.sentence(),
        choice: ['java', 'php'],
        solution: ['java'],
        level: SKILL_LEVEL.BEGINNER,
        expectedTime: '1',
        questionType: QuestionType.MultipleChoice,
        testId: createTest._id,
      });
    });

    it('should update a question', async () => {
      const res = await supertest(app)
        .put(`${environment.apiPrefix}/question/mcq/${question._id}`)
        .set('Authorization', token);

      expect(res.status).toEqual(STATUS_CODES.OK);
    });

    it('should return not found when wrong ID is sent', async () => {
      const user = await userModel.create(addUser(USER_ROLES.SUPER_ADMIN));
      const res = await supertest(app)
        .put(`${environment.apiPrefix}/question/mcq/${user._id}`)
        .set('Authorization', token);

      expect(res.status).toEqual(STATUS_CODES.NOT_FOUND);
    });

    it('should update testId if is sent', async () => {
      const createTest = await testModel.create({
        name: faker.name.firstName(),
        description: faker.lorem.paragraphs(),
        timePolicy: TimePolicy.Strict,
      });
      const res = await supertest(app)
        .put(`${environment.apiPrefix}/question/mcq/${question._id}`)
        .set('Authorization', token)
        .send({
          testId: createTest._id,
        });

      expect(res.status).toEqual(STATUS_CODES.OK);
    });
  });

  describe('delete single question', () => {
    let question: any;

    beforeEach(async () => {
      const createTest = await testModel.create({
        name: faker.name.firstName(),
        description: faker.lorem.paragraphs(),
        timePolicy: TimePolicy.Strict,
      });
      question = await questionModel.create({
        name: faker.name.firstName(),
        language: LANGUAGE.JAVASCRIPT,
        question: faker.lorem.sentence(),
        choice: ['java', 'php'],
        solution: ['java'],
        level: SKILL_LEVEL.BEGINNER,
        expectedTime: '1',
        questionType: QuestionType.MultipleChoice,
        testId: createTest._id,
      });
    });

    it('should delete a question', async () => {
      const res = await supertest(app)
        .delete(`${environment.apiPrefix}/question/${question._id}`)
        .set('Authorization', token);

      expect(res.status).toEqual(STATUS_CODES.OK);
    });

    it('should return not found when ID question not exist', async () => {
      const user = await userModel.create(addUser(USER_ROLES.SUPER_ADMIN));
      const res = await supertest(app)
        .delete(`${environment.apiPrefix}/question/${user._id}`)
        .set('Authorization', token);

      expect(res.status).toEqual(STATUS_CODES.NOT_FOUND);
    });
  });
});
