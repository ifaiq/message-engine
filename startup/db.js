/**
 * DB startup module
 * @module
 */

import config from 'config';
import mongoose from 'mongoose';
import winston from 'winston';

const { NODE_ENV } = process.env;
const isDevOrProd = ['development', 'production'].includes(NODE_ENV);

/** Mongoose 6 always behaves as if useNewUrlParser, useUnifiedTopology, and useCreateIndex are true, and useFindAndModify is false. */
let options = {};
if (isDevOrProd) {
    options = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        keepAlive: true,
    };
}

let isSeed;

async function initDB(seed = false) {
    winston.debug('Initializing DB ...');
    isSeed = seed;
    let db;
    if (isDevOrProd) {
        db = `${config.get('DB.URI_CLOUD_PREFIX')}${config.get('DB.USERNAME')}:${config.get(`DBPW_CLOUD_${NODE_ENV}`)}@${config.get('DB.URI_CLOUD_HOST')}${config.get('DB.NAME')}${config.get('DB.URI_CLOUD_OPTIONS')}`;
    } else {
        db = `${config.get('DB.URI')}${config.get('DB.NAME')}${config.get('DB.OPTIONS')}`;
    }
    mongoose.connect(db, options).then(() => {
        winston.info(`MongoDB connection opened to ${isDevOrProd ? config.get('DB.URI_CLOUD_HOST') : db} on environment ${NODE_ENV}...`);
    });
}

const reconnectTimeout = 5000; // ms.
const db = mongoose.connection;

db.on('connecting', () => {
    winston.info('Connecting to MongoDB...');
});

db.on('error', (error) => {
    winston.error('MongoDB connection error', error);
    mongoose.disconnect();
});

db.on('connected', () => {
    winston.info('Connected to MongoDB!');
});

db.once('open', () => {
    winston.info('MongoDB connection opened!');
});

db.once('close', () => {
    winston.info('MongoDB connection closed!');
});

db.on('reconnected', () => {
    winston.info('MongoDB reconnected!');
});

db.on('disconnected', () => {
    if (isSeed) return;
    if (!(NODE_ENV === 'test')) {
        winston.error(`MongoDB disconnected! Reconnecting in ${reconnectTimeout / 1000}s...`);
        setTimeout(() => initDB(), reconnectTimeout);
    }
});

export {
    initDB,
    db as connection,
};
