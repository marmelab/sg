import expect from 'expect';

import { handlePutEffect as handlePutEffectFactory } from './put';

describe('handlePutEffect', () => {
    const eventEmitter = {
        emit: expect.createSpy(),
    };
    const handlePutEffect = handlePutEffectFactory(eventEmitter);

    beforeEach(() => {
        eventEmitter.emit.reset();
    });

    it('should trigger corresponding listener in ctx', () => {
        handlePutEffect(['eventType', { payload: 'data' }]);
        expect(eventEmitter.emit).toHaveBeenCalledWith('eventType', { payload: 'data' });
    });

    it('should return a promise resolving to undefined', (done) => {
        const ctx = {};
        handlePutEffect(['eventType', 'payload'], ctx)
        .then((result) => {
            expect(result).toBe(undefined);
            done();
        })
        .catch(done);
    });
});
