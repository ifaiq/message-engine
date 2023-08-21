/**
* Initial tests
* @module
*/

import { jest } from '@jest/globals';
import request from 'supertest';
import server from '../index.js';
import { connection } from '../startup/db.js';

describe('/api', () => {
    jest.setTimeout(30000);
    beforeEach(async () => {
    });

    afterAll(async () => {
        await server.close();
        await connection.close();
    });

    async function exec() {
        const res = await request(server).get('/api');
        return res;
    }
    describe('get /api', () => {
        // TODO
        it('should return 200', async () => {
            const res = await exec();
            expect(res.status).toBe(200);
        });
    });
});
