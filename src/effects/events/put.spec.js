import expect from 'expect';

import { handlePutEffect } from './put';

describe('handlePutEffect', () => {
    const emitter = {
        put: expect.createSpy(),
    };

    it('should emit type with payload using received emitter', () => {
        handlePutEffect(['event', { payload: 'data' }], emitter, 'id');
        expect(emitter.put).toHaveBeenCalledWith('id', 'event', { payload: 'data' });
    });

    it('should return a promise resolving to undefined', (done) => {
        handlePutEffect(['event', 'payload'], emitter)
        .then((result) => {
            expect(result).toBe(undefined);
            done();
        })
        .catch(done);
    });
});
