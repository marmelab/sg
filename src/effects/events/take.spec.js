import expect from 'expect';

import { handleTakeEffect } from './take';

describe('handleTakeEffect', () => {
    it('should add a listener to the context and resolve with the value passed to this listener', (done) => {
        const ctx = {};
        const promise = handleTakeEffect(['event'], ctx);
        expect(ctx.event.event).toBeA('array');
        expect(ctx.event.event[0]).toBeA('function');
        ctx.event.event[0]('payload');
        promise.then((result) => {
            expect(result).toEqual('payload');
            done();
        })
        .catch(done);
    });
});
