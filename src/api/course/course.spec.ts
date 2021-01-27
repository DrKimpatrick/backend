import supertest from 'supertest';
import { app } from '../../index';
import { ModelFactory } from '../../models/model.factory';
import { MODELS, STATUS_CODES, USER_ROLES, COURSE_VERIFICATION_STATUS } from '../../constants';
import { addCourse, addUser } from '../users/__mocks__';

describe('Courses', () => {
  const userM = ModelFactory.getModel(MODELS.USER);
  const courseModel = ModelFactory.getModel(MODELS.COURSE);

  let token: string;
  let user: any;
  let courseId: string;

  beforeEach(async () => {
    user = await userM.create(addUser(USER_ROLES.TRAINING_AFFILIATE));

    token = user.toAuthJSON().token;
  });

  describe('POST /api/v1/courses', () => {
    it('should save new course', async () => {
      const newCourse = await supertest(app)
        .post('/api/v1/courses')
        .set('Authorization', `Bearer ${token}`)
        .send(addCourse);

      expect(newCourse.status).toEqual(STATUS_CODES.CREATED);

      expect(typeof newCourse.status).toEqual('number');
    });

    it('should return error when there is validation error', async () => {
      const newCourse = await supertest(app)
        .post('/api/v1/courses')
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
        .get('/api/v1/courses')
        .set('Authorization', `Bearer ${token}`);

      expect(course.status).toEqual(STATUS_CODES.OK);

      expect(typeof course.status).toEqual('number');

      expect(course.body).toHaveProperty('data');
    });
  });

  describe('Talent / List all courses', () => {
    beforeEach(async () => {
      const newUser = await userM.create(addUser(USER_ROLES.TALENT));

      token = newUser.toAuthJSON().token;
    });

    it('should get all course', async () => {
      const course = await supertest(app)
        .get('/api/v1/courses')
        .set('Authorization', `Bearer ${token}`);

      expect(course.status).toEqual(STATUS_CODES.OK);

      expect(typeof course.status).toEqual('number');

      expect(course.body).toHaveProperty('data');
    });
  });

  describe('Super Admin / List specific courses', () => {
    beforeEach(async () => {
      const newUser = await userM.create(addUser(USER_ROLES.SUPER_ADMIN));

      const newCourse = await courseModel.create({ ...addCourse, userId: newUser._id });

      token = newUser.toAuthJSON().token;

      courseId = newCourse._id;
    });

    it('should get specific course', async () => {
      const course = await supertest(app)
        .get(`/api/v1/courses/${courseId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(course.status).toEqual(STATUS_CODES.OK);

      expect(typeof course.status).toEqual('number');

      expect(course.body).toHaveProperty('data');
    });
  });

  describe('Talent / List specific courses', () => {
    beforeEach(async () => {
      const newUser = await userM.create(addUser(USER_ROLES.TALENT));

      const newCourse = await courseModel.create({ ...addCourse, userId: newUser._id });

      token = newUser.toAuthJSON().token;

      courseId = newCourse._id;
    });

    it('should get specific course', async () => {
      const course = await supertest(app)
        .get(`/api/v1/courses/${courseId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(course.status).toEqual(STATUS_CODES.OK);

      expect(typeof course.status).toEqual('number');

      expect(course.body).toHaveProperty('data');
    });
  });

  describe('Update Course', () => {
    beforeEach(async () => {
      const newUser = await userM.create(addUser(USER_ROLES.SUPER_ADMIN));

      const newCourse = await courseModel.create({ ...addCourse, userId: newUser._id });

      token = newUser.toAuthJSON().token;

      courseId = newCourse._id;
    });
    it('should update course', async () => {
      const course = await supertest(app)
        .put(`/api/v1/courses/${courseId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(addCourse);

      expect(course.status).toEqual(STATUS_CODES.OK);

      expect(typeof course.status).toEqual('number');

      expect(course.body).toHaveProperty('message');
    });

    it('should return error when there is validation error', async () => {
      const course = await supertest(app)
        .put(`/api/v1/courses/${courseId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(course.status).toEqual(STATUS_CODES.BAD_REQUEST);
    });
  });

  describe('GET /List courses by status', () => {
    beforeEach(async () => {
      const newUser = await userM.create(addUser(USER_ROLES.SUPER_ADMIN));

      token = newUser.toAuthJSON().token;
    });
    it('should get courses by status', async () => {
      const course = await supertest(app)
        .get(`/api/v1/courses/status/${COURSE_VERIFICATION_STATUS.ACCEPTED}`)
        .set('Authorization', `Bearer ${token}`);

      expect(course.status).toEqual(STATUS_CODES.OK);

      expect(typeof course.status).toEqual('number');

      expect(course.body).toHaveProperty('data');

      expect(course.body).toHaveProperty('totalItems');
    });
  });

  describe('GET /List total number of courses by owner', () => {
    beforeEach(async () => {
      const newUser = await userM.create(addUser(USER_ROLES.TALENT));

      token = newUser.toAuthJSON().token;
    });
    it('should get total number of courses grouped by owner', async () => {
      const course = await supertest(app)
        .get(`/api/v1/courses/group/owner`)
        .set('Authorization', `Bearer ${token}`);

      expect(course.status).toEqual(STATUS_CODES.OK);

      expect(typeof course.status).toEqual('number');

      expect(course.body).toHaveProperty('data');
    });
  });
});
