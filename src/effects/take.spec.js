import expect from 'expect';
import SgEmitter from '../utils/SgEmitter';

import { handleTakeEffect } from './take';

describe('handleTakeEffect', () => {
    it('should call emitter.once with type and listener calling resolve with received payload', (done) => {
        const emitter = new SgEmitter();
        const parentEmitter = new SgEmitter();

        const promise = handleTakeEffect(['event'], parentEmitter, emitter);

        emitter.emit('event', 'payload');

        promise.then((result) => {
            expect(result).toEqual('payload');
            done();
        })
        .catch(done);
    });
});
