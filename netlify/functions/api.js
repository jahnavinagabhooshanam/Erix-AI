import serverless from 'serverless-http';
import app from '../../server/src/index.js';

export const handler = serverless(app, { basePath: '/.netlify/functions/api' });
