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
        handleSpawnEffect(sgImpl)(['arg1_1', 'arg1_2', 'arg1_3'], 'arg2');
        expect(sgImpl).toHaveBeenCalledWith('arg1_1', 'arg2');
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
});
