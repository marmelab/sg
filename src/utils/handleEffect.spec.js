import expect from 'expect';

import handleEffect from './handleEffect';

describe('handleEffect', () => {
    it('should call effect.handle with effect.args and second argument emitter', async () => {
        const handle = expect.createSpy().andReturn(Promise.resolve('effect result'));
        const effect = {
            handle,
            args: ['arg1', 'arg2'],
        };
        const result = await handleEffect(effect, 'task');
        expect(result).toBe('effect result');

        expect(handle).toHaveBeenCalledWith(['arg1', 'arg2'], 'task');
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
        const result = await handleEffect(effects, 'task');
        expect(result).toEqual(['effect1 result', 'effect2 result']);

        expect(handle1).toHaveBeenCalledWith(['arg1', 'arg2'], 'task');
        expect(handle2).toHaveBeenCalledWith(['arg3', 'arg4'], 'task');
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
        const result = await handleEffect(effects, 'task');
        expect(result).toEqual({
            effect1: 'effect1 result',
            effect2: 'effect2 result',
        });

        expect(handle1).toHaveBeenCalledWith(['arg1', 'arg2'], 'task');
        expect(handle2).toHaveBeenCalledWith(['arg3', 'arg4'], 'task');
    });
});
