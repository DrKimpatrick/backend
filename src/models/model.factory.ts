import { logger } from '../shared/winston';

const trimTs = (path: string) => {
  return path.substr(0, path.length - 3);
};

class ModelFactory {
  /**
   * Creates a modal of Type `name`
   * Returns the modal matching the name or null
   *
   * @param name
   * @returns {mongoose.Schema}
   */
  static getModel(name: string) {
    if (!name) return null;
    const modelName = name.toLowerCase();
    const filename = `${modelName}.model.ts`;

    try {
      const model = require(`./${trimTs(filename)}`);
      if (model.default !== undefined) {
        // in case it was exported as a default,
        // export default ModelName ...or....
        // module.exports = ModelName
        return model.default;
      }
      // in case it was exported in the most recommended way
      // exports = ModelName
      return model;
    } catch (e) {
      logger.error(e);
      logger.info(
        `You tried to import '${filename}' when you asked the model
         '${name}' which does not exist`
      );
      throw Error(e);
    }
  }
}

export { ModelFactory };
