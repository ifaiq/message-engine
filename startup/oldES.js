/**
 * Elastic Search Startup module
 * @module
 */

import config from 'config';
import elasticSearchPKG from 'elasticsearch';
import fs from 'fs';

const { Client } = elasticSearchPKG;

function getEsClient() {
    let ESPW = '';
    if (process.env.NODE_ENV === 'production') {
        ESPW = config.get('ESPW_PROD');
    } else if (process.env.NODE_ENV === 'development') {
        ESPW = config.get('ESPW_DEV');
    }

    const key = fs.readFileSync(`./${config.get('ES.key')}`); // must be on the system
    const ca = [fs.readFileSync(`./${config.get('ES.ca')}`)]; // must be on the system

    const esClient = new Client({
        host: [{
            host: config.get('ES.HOST1'),
            port: config.get('ES.PORT'),
            protocol: 'https',
            auth: `${config.get('ES.USERNAME')}:${ESPW}`,
        }],
        ssl: {
            ca,
            key,
            cert: key,
            rejectUnauthorized: true,
        },
    });
    return esClient;
}

export default getEsClient;
