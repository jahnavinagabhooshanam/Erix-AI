import serverless from 'serverless-http';
import app from '../../server/src/index.js';

const serverlessHandler = serverless(app);

export const handler = async (event, context) => {
  // Prevent AWS Lambda from waiting for MongoDB connections or sockets to close
  context.callbackWaitsForEmptyEventLoop = false;
  return await serverlessHandler(event, context);
};
