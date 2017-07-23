import expect from 'expect';

import { handleTakeEffect } from './take';
import listenerKey from './listenerKey';

describe('handleTakeEffect', () => {
    it('should add a listener to the context and resolve with the value passed to this listener', (done) => {
        const ctx = {};
        const promise = handleTakeEffect(['event'], ctx);
        expect(ctx[listenerKey].event).toBeA('array');
        expect(ctx[listenerKey].event[0]).toBeA('function');
        ctx[listenerKey].event[0]('payload');
        promise.then((result) => {
            expect(result).toEqual('payload');
            done();
        })
        .catch(done);
    });
});
