import expect from 'expect';

import { handleSpawnEffectFactory } from './spawn';

describe('handleSpawnEffect', () => {
    let newTaskImpl;
    let newTaskResultFn;
    before(() => {
        newTaskResultFn = expect.createSpy().andReturn({
            promise: Promise.resolve('task object'),
            onError: expect.createSpy(),
        });
        newTaskImpl = expect.createSpy().andReturn(newTaskResultFn);
    });

    it('should call newTaskImpl with received arg', () => {
        handleSpawnEffectFactory(newTaskImpl)(['arg1_1', 'arg1_2', 'arg1_3']);
        expect(newTaskImpl).toHaveBeenCalledWith('arg1_1');
        expect(newTaskResultFn).toHaveBeenCalledWith('arg1_2', 'arg1_3');
    });

    it('should resolve to a function returning newTaskImpl resulting promise', (cb) => {
        const waitFor = expect.createSpy();
        const cancel = expect.createSpy();
        const onError = expect.createSpy();
        handleSpawnEffectFactory(newTaskImpl)('arg1', { task: { waitFor, cancel, onError } })
            .then(result => result.promise)
            .then((result) => {
                expect(result).toBe('task object');
                cb();
            })
            .catch(cb);
    });

    it('should reject with error thrown by newTaskImpl if any', (done) => {
        newTaskImpl = () => () => {
            throw new Error('Boom');
        };
        handleSpawnEffectFactory(newTaskImpl)(['arg1_1', 'arg1_2', 'arg1_3'], { task: {} })
            .then(() => {
                throw new Error('handleForkEffect should have thrown an error');
            })
            .catch((error) => {
                expect(error.message).toBe('Boom');
                done();
            })
            .catch(done);
    });
});
