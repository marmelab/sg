import expect from 'expect';

import effectHandler from './effectHandler';

describe('effectHandler', () => {
    it('should call effect.handle with effect.args and second argument emitter and iterateSaga with promise resolving value', async () => {
        const handle = expect.createSpy().andReturn(Promise.resolve('effect result'));
        const effect = {
            handle,
            args: ['arg1', 'arg2'],
        };
        const iterateSaga = expect.createSpy();
        await effectHandler('emitter', 'id')(effect, iterateSaga);

        expect(handle).toHaveBeenCalledWith(['arg1', 'arg2'], 'emitter', 'id');
        expect(iterateSaga).toHaveBeenCalledWith('effect result');
    });

    it('should call effect.handle with effect.args and second argument emitter and iterateSaga with promise rejecting error and true ', async () => {
        const handle = expect.createSpy().andReturn(Promise.reject('effect error'));
        const effect = {
            handle,
            args: ['arg1', 'arg2'],
        };
        const iterateSaga = expect.createSpy();
        await effectHandler('emitter', 'id')(effect, iterateSaga);

        expect(handle).toHaveBeenCalledWith(['arg1', 'arg2'], 'emitter', 'id');
        expect(iterateSaga).toHaveBeenCalledWith('effect error', true);
    });

    it('should call all effect.handle if receiving an array of effect', async () => {
        const handle1 = expect.createSpy();
        const handle2 = expect.createSpy();
        const effects = [
            {
                handle: handle1,
                args: ['arg1', 'arg2'],
            }, {
                handle: handle2,
                args: ['arg3', 'arg4'],
            },
        ];
        const iterateSaga = expect.createSpy();
        await effectHandler('emitter', 'id')(effects, iterateSaga);

        expect(handle1).toHaveBeenCalledWith(['arg1', 'arg2'], 'emitter', 'id');
        expect(handle2).toHaveBeenCalledWith(['arg3', 'arg4'], 'emitter', 'id');
    });
});
