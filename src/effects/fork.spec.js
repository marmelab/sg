import expect from 'expect';

import { handleForkEffect } from './fork';

describe('handleForkEffect', () => {
    let sgImpl;
    let sgResultFn;
    before(() => {
        sgResultFn = expect.createSpy().andReturn(Promise.resolve('sgResult'));
        sgImpl = expect.createSpy().andReturn(sgResultFn);
    });

    it('should call sgImpl with received arg', () => {
        handleForkEffect(sgImpl)(['arg1_1', 'arg1_2', 'arg1_3'], 'emitter');
        expect(sgImpl).toHaveBeenCalledWith('arg1_1', 'emitter');
        expect(sgResultFn).toHaveBeenCalledWith('arg1_2', 'arg1_3');
    });

    it('should resolve to a function returning sgImpl resulting promise', (done) => {
        handleForkEffect(sgImpl)('arg1', 'emitter')
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
