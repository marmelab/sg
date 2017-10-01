import expect from 'expect';

import { handleSpawnEffectFactory } from './spawn';

describe('handleSpawnEffect', () => {
    let executeSagaImpl;
    let executeSagaResultFn;
    before(() => {
        executeSagaResultFn = expect.createSpy().andReturn({
            promise: Promise.resolve('task object'),
            onError: expect.createSpy(),
        });
        executeSagaImpl = expect.createSpy().andReturn(executeSagaResultFn);
    });

    it('should call executeSagaImpl with received arg', () => {
        handleSpawnEffectFactory(executeSagaImpl)(['arg1_1', 'arg1_2', 'arg1_3']);
        expect(executeSagaImpl).toHaveBeenCalledWith('arg1_1');
        expect(executeSagaResultFn).toHaveBeenCalledWith('arg1_2', 'arg1_3');
    });

    it('should resolve to a function returning executeSagaImpl resulting promise', (cb) => {
        const waitFor = expect.createSpy();
        const cancel = expect.createSpy();
        const onError = expect.createSpy();
        handleSpawnEffectFactory(executeSagaImpl)('arg1', { task: { waitFor, cancel, onError } })
            .then(result => result.promise)
            .then((result) => {
                expect(result).toBe('task object');
                cb();
            })
            .catch(cb);
    });

    it('should reject with error thrown by executeSagaImpl if any', (done) => {
        executeSagaImpl = () => () => {
            throw new Error('Boom');
        };
        handleSpawnEffectFactory(executeSagaImpl)(['arg1_1', 'arg1_2', 'arg1_3'], { task: {} })
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
