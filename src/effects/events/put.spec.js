import expect from 'expect';

import { handlePutEffect } from './put';
import listenerKey from './listenerKey';

describe('handlePutEffect', () => {

    it('should trigger corresponding listener in ctx', () => {
        const listener1 = expect.createSpy();
        const listener2 = expect.createSpy();
        const listener3 = expect.createSpy();
        const ctx = {
            [listenerKey]: {
                eventType: [listener1, listener2],
                otherType: [listener3],
            },
        };
        handlePutEffect(['eventType', { payload: 'data' }], ctx);
        expect(listener1).toHaveBeenCalledWith({ payload: 'data' });
        expect(listener2).toHaveBeenCalledWith({ payload: 'data' });
        expect(listener3).toNotHaveBeenCalled();
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
