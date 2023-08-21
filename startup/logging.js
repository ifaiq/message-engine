/**
 * Logging startup module
 * @module
 */
import ecsFormat from '@elastic/ecs-winston-format';
import config from 'config';
import 'express-async-errors';
import {
    createRequire,
} from 'module'; // construct the require method
import winston from 'winston';

import { ElasticsearchTransport } from 'winston-elasticsearch';
import getEsClient from './es.js';

const jsonRequire = createRequire(import.meta.url);
const { version, name: serviceName } = jsonRequire('../package.json');

const { NODE_ENV } = process.env;
const isDevOrProd = ['development', 'production'].includes(NODE_ENV);

const silent = NODE_ENV === 'test';

const winstonTransports = (apm) => {
    const transports = [
        new winston.transports.Console({
            colorize: true,
            prettyPrint: true,
            handleExceptions: true,
            handleRejections: true,
            level: config.get('dbLogs.consoleLevel'),
            silent,
        })];
    if (isDevOrProd) {
        transports.push(
            new ElasticsearchTransport({
                dataStream: true,
                index: `logs-${NODE_ENV}-${serviceName}`,
                level: config.get('dbLogs.level'),
                client: getEsClient(),
                apm,
                silent,
            }),
        );
    }

    return transports;
};
const serverVersion = winston.format((info) => {
    const newInfo = info;
    newInfo.serverVersion = version;
    return newInfo;
});

const customECSFormat = () => {
    const format = ecsFormat();
    return winston.format.combine(serverVersion(), format);
};

export default function log(apm) {
    winston.configure({
        format: customECSFormat(),
        transports: winstonTransports(apm),
        exitOnError: false,
    });
}

process.on('unhandledRejection', (reason, promise) => {
    // eslint-disable-next-line no-console
    console.log('Unhandled Rejection at: Promise', promise, 'reason:', reason);
    throw reason;
});
