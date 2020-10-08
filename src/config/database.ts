import mongoose, { Connection, ConnectionOptions } from 'mongoose';
import { logger } from '../shared/winston';
import { environment } from './environment';

const mongoClient = (() => {
  const options: ConnectionOptions = {
    useCreateIndex: true,
    useNewUrlParser: true,
    keepAlive: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  };

  let instance: Connection;
  let exists: boolean;

  const getClient = async () => {
    try {
      await mongoose.connect(environment.dbUrl as string, options);
      

      const { connection } = mongoose;

      connection.on('error', (error: string) => {
        logger.error(`Database error occurred: ${error}`);
      });

      instance = connection;
      exists = true;
      logger.info('💾 Database connected');

      return instance;
    } catch (e) {
      logger.error(e);
      throw Error(`Unable to connect to database: ${e}`);
    }
  };

  return {
    getClient,
  };
})();

export { mongoClient as MongoClient };
