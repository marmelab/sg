import expect from 'expect';

import { handleForkEffect } from './fork';
import SgEmitter from '../utils/SgEmitter';

describe('handleForkEffect', () => {
    let sgImpl;
    let sgResultFn;
    let emitter;
    before(() => {
        sgResultFn = expect.createSpy().andReturn(Promise.resolve('sgResult'));
        sgImpl = expect.createSpy().andReturn(sgResultFn);
        emitter = new SgEmitter();
    });

    it('should call sgImpl with received arg', () => {
        handleForkEffect(sgImpl)(['arg1_1', 'arg1_2', 'arg1_3'], 'parentEmitter', emitter);
        expect(sgImpl).toHaveBeenCalledWith('arg1_1', emitter);
        expect(sgResultFn).toHaveBeenCalledWith('arg1_2', 'arg1_3');
    });

    it('should resolve to a function returning sgImpl resulting promise', (done) => {
        handleForkEffect(sgImpl)('arg1', 'parentEmitter', emitter)
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
