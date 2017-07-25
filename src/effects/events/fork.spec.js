import expect from 'expect';

import { handleForkEffectFactory } from './fork';
import SgEmitter from './SgEmitter';

describe('handleForkEffectFactory', () => {
    let newTaskImpl;
    let newTaskResultFn;
    let emitter;
    before(() => {
        newTaskResultFn = expect.createSpy().andReturn(Promise.resolve('task object'));
        newTaskImpl = expect.createSpy().andReturn(newTaskResultFn);
        emitter = new SgEmitter();
    });

    it('should call newTaskImpl with received arg', () => {
        handleForkEffectFactory(newTaskImpl)(['arg1_1', 'arg1_2', 'arg1_3'], emitter, 'id');
        expect(newTaskImpl).toHaveBeenCalledWith('arg1_1', emitter, 'id');
        expect(newTaskResultFn).toHaveBeenCalledWith('arg1_2', 'arg1_3');
    });

    it('should resolve to a function returning newTaskImpl resulting promise', (done) => {
        handleForkEffectFactory(newTaskImpl)('arg1', emitter)
        .then((result) => {
            expect(result).toBe('task object');
            done();
        })
        .catch(done);
    });

    it('should reject with error thrown by newTaskImpl if any', (done) => {
        newTaskImpl = () => () => {
            throw new Error('Boom');
        };
        handleForkEffectFactory(newTaskImpl)(['arg1_1', 'arg1_2', 'arg1_3'], emitter, 'id')
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
