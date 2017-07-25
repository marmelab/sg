import expect from 'expect';

import { handleSpawnEffect } from './spawn';

describe('handleSpawnEffect', () => {
    let newTaskImpl;
    let newTaskResultFn;
    before(() => {
        newTaskResultFn = expect.createSpy().andReturn(Promise.resolve('task object'));
        newTaskImpl = expect.createSpy().andReturn(newTaskResultFn);
    });

    it('should call newTaskImpl with received arg', () => {
        handleSpawnEffect(newTaskImpl)(['arg1_1', 'arg1_2', 'arg1_3'], 'emitter');
        expect(newTaskImpl).toHaveBeenCalledWith('arg1_1', 'emitter');
        expect(newTaskResultFn).toHaveBeenCalledWith('arg1_2', 'arg1_3');
    });

    it('should resolve to a function returning newTaskImpl resulting promise', (done) => {
        handleSpawnEffect(newTaskImpl)('arg1', 'arg2')
        .then((handleCallResult) => {
            expect(handleCallResult).toEqual('task object');
            done();
        })
        .catch(done);
    });

    it('should reject to error thrown by newTaskImpl', (done) => {
        newTaskImpl = () => () => {
            throw new Error('Boom');
        };
        handleSpawnEffect(newTaskImpl)('arg1', 'arg2')
        .then(() => {
            throw new Error('handleSpawnEffect should have been rejected');
        })
        .catch((error) => {
            expect(error.message).toBe('Boom');
            done();
        })
        .catch(done);
    });
});
