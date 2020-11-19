import { MongoClient } from './config/database';
import { ModelFactory } from './models/model.factory';
import { MODELS } from './constants';
import IBetaTester from './models/interfaces/beta-tester.interface';

(async () => {
  // Only start the server if the mongo connection is active
  const client = MongoClient;
  await client.getClient();
})();

const userM = ModelFactory.getModel(MODELS.USER);
const socialM = ModelFactory.getModel(MODELS.SOCIAL_AUTH);
const skillModel = ModelFactory.getModel(MODELS.SKILL);
const empModel = ModelFactory.getModel(MODELS.EMPLOYMENT_HISTORY);
const eduModel = ModelFactory.getModel(MODELS.EDUCATION_HISTORY);
const betaTesterModel = ModelFactory.getModel<IBetaTester>(MODELS.BETA_TESTER);
const courseModel = ModelFactory.getModel(MODELS.COURSE);
const userSkillsModel = ModelFactory.getModel(MODELS.USER_SKILLS);

const clearDb = async () => {
  await userM.deleteMany({});
  await socialM.deleteMany({});
  await skillModel.deleteMany({});
  await empModel.deleteMany({});
  await eduModel.deleteMany({});
  await betaTesterModel.deleteMany({});
  await courseModel.deleteMany({});
  await userSkillsModel.deleteMany({});
};

global.beforeEach(async () => {
  await clearDb();
});

global.afterEach(async () => {
  await clearDb();
});
