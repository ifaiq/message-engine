/**
 * Elastic Search Startup module
 * @module
 */

import { Client } from '@elastic/elasticsearch';
import config from 'config';
import winston from 'winston';

function getEsClient() {
    try {
        const { NODE_ENV } = process.env;
        let ESPW = '';
        if (NODE_ENV === 'production') {
            ESPW = config.get('ESPW_PROD');
        } else if (NODE_ENV === 'development') {
            ESPW = config.get('ESPW_DEV');
        }

        const esClient = new Client({
            cloud: {
                id: config.get('ES.CLOUD_ID'),
            },
            auth: {
                username: config.get('ES.USERNAME'),
                password: ESPW,
            },
        });

        return esClient;
    } catch (err) {
        winston.error(err);
        return err;
    }
}

export default getEsClient;
