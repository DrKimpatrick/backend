import { MongoClient } from './config/database';

(async () => {
  // Only start the server if the mongo connection is active
  const client = MongoClient;
  await client.getClient();
})();
