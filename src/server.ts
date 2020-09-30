import http from 'http';
import { AddressInfo } from 'net';
import { app } from '.';
import { MongoClient } from './config/database';
import { logger } from './shared/winston';

(async () => {
  const port = process.env.PORT || 3500;
  // Only start the server if the mongo connection is active
  const client = MongoClient;
  await client.getClient();

  const server = http.createServer(app);

  server.listen(port, () => {
    const address: AddressInfo | string | null = server.address();

    if (address && typeof address !== 'string') {
      logger.info(`⚡️ Server is running at http://localhost:${port}`);
    } else {
      logger.error(`Unable to start server on port ${port}`);
    }
  });
})();
