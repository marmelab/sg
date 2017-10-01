import expect from 'expect';

import { handleForkEffectFactory } from './fork';

describe('handleForkEffectFactory', () => {
    let executeSagaImpl;
    let executeSagaResultFn;
    before(() => {
        executeSagaResultFn = expect.createSpy().andReturn({
            promise: Promise.resolve('task object'),
            onError: expect.createSpy(),
        });
        executeSagaImpl = expect.createSpy().andReturn(executeSagaResultFn);
    });

    it('should call executeSaga with received arg', () => {
        handleForkEffectFactory(executeSagaImpl)(['arg1_1', 'arg1_2', 'arg1_3']);
        expect(executeSagaImpl).toHaveBeenCalledWith('arg1_1');
        expect(executeSagaResultFn).toHaveBeenCalledWith('arg1_2', 'arg1_3');
    });

    it('should resolve to a function returning executeSaga resulting promise', (done) => {
        const waitFor = expect.createSpy();
        const cancel = expect.createSpy();
        const onError = expect.createSpy();
        const onCancel = expect.createSpy();
        handleForkEffectFactory(executeSagaImpl)('arg1', { waitFor, cancel, onError, onCancel })
        .then(result => result.promise)
        .then((result) => {
            expect(result).toBe('task object');
            done();
        })
        .catch(done);
    });

    it('should reject with error thrown by executeSaga if any', (done) => {
        executeSagaImpl = () => () => {
            throw new Error('Boom');
        };
        handleForkEffectFactory(executeSagaImpl)(['arg1_1', 'arg1_2', 'arg1_3'], 'task')
            .then(() => {
                throw new Error('handleForkEffect should have thrown an error');
            })
            .catch((error) => {
                expect(error.message).toBe('Boom');
                done();
            })
            .catch(done);
    });

    it('should cancel ctx.task if newTask get rejected', (done) => {
        const newTaskOnError = expect.createSpy();
        const ctxTaskOnError = expect.createSpy();
        const ctxTaskOnCancel = expect.createSpy();
        executeSagaResultFn = expect.createSpy().andReturn({
            done: expect.createSpy(),
            onError: newTaskOnError,
            cancel: 'newTaskCancel',
            reject: 'newTaskReject',
        });
        executeSagaImpl = expect.createSpy().andReturn(executeSagaResultFn);
        handleForkEffectFactory(executeSagaImpl)(['arg1_1', 'arg1_2', 'arg1_3'], {
            cancel: 'ctxTaskCancel',
            reject: 'ctxTaskReject',
            waitFor: expect.createSpy(),
            onError: ctxTaskOnError,
            onCancel: ctxTaskOnCancel,
        })
            .catch(done)
            .then(() => {
                expect(newTaskOnError).toHaveBeenCalledWith('ctxTaskReject');
                expect(ctxTaskOnError).toHaveBeenCalledWith('newTaskCancel');
                expect(ctxTaskOnCancel).toHaveBeenCalledWith('newTaskCancel');
                done();
            })
            .catch(done);
    });
});
