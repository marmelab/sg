import expect from 'expect';

import { handleForkEffectFactory } from './fork';

describe('handleForkEffectFactory', () => {
    let newTaskImpl;
    let newTaskResultFn;
    before(() => {
        newTaskResultFn = expect.createSpy().andReturn({ done: expect.createSpy().andReturn(Promise.resolve('task object')) });
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
        handleForkEffectFactory(newTaskImpl)('arg1', { task: { waitFor, cancel } })
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
        newTaskResultFn = expect.createSpy().andReturn({
            done: expect.createSpy(),
            onError: newTaskOnError,
            cancel: 'newTaskCancel',
        });
        newTaskImpl = expect.createSpy().andReturn(newTaskResultFn);
        handleForkEffectFactory(newTaskImpl)(['arg1_1', 'arg1_2', 'arg1_3'], { task: {
            cancel: 'ctxTaskCancel',
            waitFor: expect.createSpy(),
            onError: ctxTaskOnError,
        } })
            .catch(done)
            .then(() => {
                expect(newTaskOnError).toHaveBeenCalledWith('ctxTaskCancel');
                expect(ctxTaskOnError).toHaveBeenCalledWith('newTaskCancel');
                done();
            })
            .catch(done);
    });
});
