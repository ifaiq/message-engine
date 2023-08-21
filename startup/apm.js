/**
 * APM startup module
 * @module
 */

import config from 'config';
import apm from 'elastic-apm-node';
import winston from 'winston';

const { NODE_ENV } = process.env;
const isDevOrProd = ['development', 'production'].includes(NODE_ENV);
if (isDevOrProd) {
    apm.start({
        serverUrl: config.get('apm.serverUrl'),
        apiKey: config.get('apm.apmApiKey'),
        environment: process.env.NODE_ENV,
    });
    winston.info('APM Running!');
}
