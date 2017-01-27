import expect from 'expect';

import { handleSpawnEffect } from './spawn';

describe('handleSpawnEffect', () => {
    let sgImpl;
    let sgResultFn;
    before(() => {
        sgResultFn = expect.createSpy().andReturn(Promise.resolve('sgResult'));
        sgImpl = expect.createSpy().andReturn(sgResultFn);
    });

    it('should call sgImpl with received arg', () => {
        handleSpawnEffect(sgImpl)(['arg1_1', 'arg1_2', 'arg1_3'], 'emitter');
        expect(sgImpl).toHaveBeenCalledWith('arg1_1', 'emitter');
        expect(sgResultFn).toHaveBeenCalledWith('arg1_2', 'arg1_3');
    });

    it('should resolve to a function returning sgImpl resulting promise', (done) => {
        handleSpawnEffect(sgImpl)('arg1', 'arg2')
        .then((result) => {
            expect(result).toBeA('function');
            return result();
        })
        .then((handleCallResult) => {
            expect(handleCallResult).toEqual('sgResult');
            done();
        })
        .catch(done);
    });

    it('should reject to error thrown by sgImpl', (done) => {
        sgImpl = () => () => {
            throw new Error('Boom');
        };
        handleSpawnEffect(sgImpl)('arg1', 'arg2')
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
