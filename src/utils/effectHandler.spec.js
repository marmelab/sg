import expect from 'expect';

import effectHandler from './effectHandler';

describe('effectHandler', () => {
    it('should call effect.handle with effect.args and second argument emitter', () => {
        let handleCall;
        const handle = (...args) => {
            handleCall = args;
            return Promise.resolve();
        };
        const effect = {
            handle,
            args: ['arg1', 'arg2'],
        };

        effectHandler('emitter', 'id')(effect, () => Promise.resolve());

        expect(handleCall).toEqual([['arg1', 'arg2'], 'emitter', 'id']);
    });
});
