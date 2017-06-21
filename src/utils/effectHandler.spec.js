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
        await effectHandler('ctx')(effect, iterateSaga);

        expect(handle).toHaveBeenCalledWith(['arg1', 'arg2'], 'ctx');
        expect(iterateSaga).toHaveBeenCalledWith('effect result');
    });

    it('should call effect.handle with effect.args and second argument emitter and iterateSaga with promise rejecting error and true ', async () => {
        const handle = expect.createSpy().andReturn(Promise.reject('effect error'));
        const effect = {
            handle,
            args: ['arg1', 'arg2'],
        };
        const iterateSaga = expect.createSpy();
        await effectHandler('ctx')(effect, iterateSaga);

        expect(handle).toHaveBeenCalledWith(['arg1', 'arg2'], 'ctx');
        expect(iterateSaga).toHaveBeenCalledWith('effect error', true);
    });

    it('should call all effect.handle if receiving an array of effect', async () => {
        const handle1 = expect.createSpy().andReturn(Promise.resolve('effect1 result'));
        const handle2 = expect.createSpy().andReturn(Promise.resolve('effect2 result'));
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
        await effectHandler('ctx')(effects, iterateSaga);

        expect(handle1).toHaveBeenCalledWith(['arg1', 'arg2'], 'ctx');
        expect(handle2).toHaveBeenCalledWith(['arg3', 'arg4'], 'ctx');
        expect(iterateSaga).toHaveBeenCalledWith(['effect1 result', 'effect2 result']);
    });

    it('should call all effect.handle if receiving a literal of effect', async () => {
        const handle1 = expect.createSpy().andReturn(Promise.resolve('effect1 result'));
        const handle2 = expect.createSpy().andReturn(Promise.resolve('effect2 result'));
        const effects = {
            effect1: {
                handle: handle1,
                args: ['arg1', 'arg2'],
            },
            effect2: {
                handle: handle2,
                args: ['arg3', 'arg4'],
            },
        };
        const iterateSaga = expect.createSpy();
        await effectHandler('ctx')(effects, iterateSaga);

        expect(handle1).toHaveBeenCalledWith(['arg1', 'arg2'], 'ctx');
        expect(handle2).toHaveBeenCalledWith(['arg3', 'arg4'], 'ctx');
        expect(iterateSaga).toHaveBeenCalledWith({
            effect1: 'effect1 result',
            effect2: 'effect2 result',
        });
    });
});
