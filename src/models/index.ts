import { Model } from 'mongoose';
import { ModelFactory } from './model.factory';

class MongoWrapper extends Model {
  static getModel(name: string) {
    const model = ModelFactory.getModel(name);
    Object.assign(this, model);
    return this;
  }
}

export default MongoWrapper;
