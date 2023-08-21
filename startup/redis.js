/**
* Redis Startup module
* @module
*/

import config from 'config';

const REDIS_HOST = config.get('REDIS_HOST');
const REDIS_PORT = config.get('REDIS_PORT');

const redis = { redis: { port: REDIS_PORT, host: REDIS_HOST } };

export default redis;
