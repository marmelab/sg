import expect from 'expect';
import { handleCancelEffect } from './cancel';

import { CANCEL } from '../sg';

describe('handleCancelEffect', () => {
    it('should resolve and call task and emit the result as cancel', async () => {
        let emitCall;
        let cancelCall;
        const promise = {
            id: 'id',
            [CANCEL]: (...args) => {
                cancelCall = args;
            },
        };
        const task = () => promise;
        const emitter = {
            emit: (...args) => {
                emitCall = args;
            },
        };
        await handleCancelEffect([task], emitter);

        expect(cancelCall).toEqual([]);

        expect(emitCall).toEqual(['cancel', {
            target: 'id',
            promise,
        }]);
    });

    it('should reject if task thrown an error', (done) => {
        const task = () => {
            throw new Error('Boom');
        };
        const emitter = {
            emit: () => {},
        };
        handleCancelEffect([task], emitter)
        .then(() => {
            throw new Error('handleCancelEffect shoulod have thrown an error');
        })
        .catch((error) => {
            expect(error.message).toBe('Boom');
            done();
        })
        .catch(done);
    });
});
