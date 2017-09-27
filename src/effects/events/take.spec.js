import expect from 'expect';

import { handleTakeEffect } from './take';

describe('handleTakeEffect', () => {
    it('should add a listener to the context and resolve with the value passed to this listener', (done) => {
        let registeredListener;
        const eventEmitter = {
            once: expect.createSpy().andCall((type, listener) => {
                registeredListener = listener;
            }),
        };
        const promise = handleTakeEffect(eventEmitter)(['event']);
        expect(eventEmitter.once).toHaveBeenCalled();
        registeredListener('payload');
        promise.then((result) => {
            expect(result).toEqual('payload');
            done();
        })
        .catch(done);
    });
});
