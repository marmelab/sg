import expect from 'expect';

import { handleForkEffectFactory } from './fork';

describe('handleForkEffectFactory', () => {
    let newTaskImpl;
    let newTaskResultFn;
    before(() => {
        newTaskResultFn = expect.createSpy().andReturn({
            done: expect.createSpy().andReturn(Promise.resolve('task object')),
            onError: expect.createSpy(),
        });
        newTaskImpl = expect.createSpy().andReturn(newTaskResultFn);
    });

    it('should call newTaskImpl with received arg', () => {
        handleForkEffectFactory(newTaskImpl)(['arg1_1', 'arg1_2', 'arg1_3'], { task: {} });
        expect(newTaskImpl).toHaveBeenCalledWith('arg1_1', { task: {} });
        expect(newTaskResultFn).toHaveBeenCalledWith('arg1_2', 'arg1_3');
    });

    it('should resolve to a function returning newTaskImpl resulting promise', (cb) => {
        const waitFor = expect.createSpy();
        const cancel = expect.createSpy();
        const onError = expect.createSpy();
        const onCancel = expect.createSpy();
        handleForkEffectFactory(newTaskImpl)('arg1', { task: { waitFor, cancel, onError, onCancel } })
        .then(result => result.done())
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
        handleForkEffectFactory(newTaskImpl)(['arg1_1', 'arg1_2', 'arg1_3'], { task: {} })
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
        newTaskResultFn = expect.createSpy().andReturn({
            done: expect.createSpy(),
            onError: newTaskOnError,
            cancel: 'newTaskCancel',
            abort: 'newTaskAbort',
        });
        newTaskImpl = expect.createSpy().andReturn(newTaskResultFn);
        handleForkEffectFactory(newTaskImpl)(['arg1_1', 'arg1_2', 'arg1_3'], { task: {
            cancel: 'ctxTaskCancel',
            abort: 'ctxTaskAbort',
            waitFor: expect.createSpy(),
            onError: ctxTaskOnError,
            onCancel: ctxTaskOnCancel,
        } })
            .catch(done)
            .then(() => {
                expect(newTaskOnError).toHaveBeenCalledWith('ctxTaskAbort');
                expect(ctxTaskOnError).toHaveBeenCalledWith('newTaskAbort');
                expect(ctxTaskOnCancel).toHaveBeenCalledWith('newTaskCancel');
                done();
            })
            .catch(done);
    });
});
