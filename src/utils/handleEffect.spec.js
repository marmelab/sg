import expect from 'expect';

import handleEffect from './handleEffect';

describe('handleEffect', () => {
    it('should call effect.handle with effect.args and second argument emitter', () => {
        let handleCall;
        const handle = (...args) => {
            handleCall = args;
        };
        const effect = {
            handle,
            args: ['arg1', 'arg2'],
        };

        handleEffect(effect, 'parentEmitter', 'emitter');

        expect(handleCall).toEqual([['arg1', 'arg2'], 'parentEmitter', 'emitter']);
    });
});
