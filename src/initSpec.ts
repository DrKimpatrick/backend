import { MongoClient } from './config/database';
import { ModelFactory } from './models/model.factory';
import { MODELS } from './constants';
import IBetaTester from './models/interfaces/beta-tester.interface';

const userM = ModelFactory.getModel(MODELS.USER);
const socialM = ModelFactory.getModel(MODELS.SOCIAL_AUTH);
const skillModel = ModelFactory.getModel(MODELS.SKILL);
const empModel = ModelFactory.getModel(MODELS.EMPLOYMENT_HISTORY);
const eduModel = ModelFactory.getModel(MODELS.EDUCATION_HISTORY);
const betaTesterModel = ModelFactory.getModel<IBetaTester>(MODELS.BETA_TESTER);
const courseModel = ModelFactory.getModel(MODELS.COURSE);
const userSkillsModel = ModelFactory.getModel(MODELS.USER_SKILLS);
const userCouponM = ModelFactory.getModel(MODELS.USER_COUPON);
const testModel = ModelFactory.getModel(MODELS.Test);
const answerModel = ModelFactory.getModel(MODELS.Answer);
const questionModel = ModelFactory.getModel(MODELS.Question);

const clearDb = async () => {
  await userM.deleteMany({});
  await socialM.deleteMany({});
  await skillModel.deleteMany({});
  await empModel.deleteMany({});
  await eduModel.deleteMany({});
  await betaTesterModel.deleteMany({});
  await courseModel.deleteMany({});
  await userSkillsModel.deleteMany({});
  await userCouponM.deleteMany({});
  await testModel.deleteMany({});
  await answerModel.deleteMany({});
  await questionModel.deleteMany({});
};

global.beforeAll(async () => {
  const client = MongoClient;
  await client.getClient();
});

global.beforeEach(async () => {
  await clearDb();
});

global.afterEach(async () => {
  await clearDb();
});
