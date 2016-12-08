import expect from 'expect';

import { handlePutEffect } from './put';

describe('handlePutEffect', () => {
    const parentEmitter = {
        emit: expect.createSpy(),
    };
    const emitter = {
        emit: expect.createSpy(),
    };

    it('should emit type with payload using received emitter', () => {
        handlePutEffect(['event', { payload: 'data' }], parentEmitter, emitter);
        expect(parentEmitter.emit).toHaveBeenCalledWith('event', { payload: 'data' });
        expect(emitter.emit).toHaveBeenCalledWith('event', { payload: 'data' });
    });

    it('should return a promise resolving to undefined', (done) => {
        handlePutEffect(['event', 'payload'], parentEmitter, emitter)
        .then((result) => {
            expect(result).toBe(undefined);
            done();
        })
        .catch(done);
    });
});
