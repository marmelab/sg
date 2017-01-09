import expect from 'expect';

import { handleForkEffectFactory } from './fork';
import SgEmitter from '../utils/SgEmitter';

describe('handleForkEffectFactory', () => {
    let sgImpl;
    let sgResultFn;
    let emitter;
    before(() => {
        sgResultFn = expect.createSpy().andReturn(Promise.resolve('sgResult'));
        sgImpl = expect.createSpy().andReturn(sgResultFn);
        emitter = new SgEmitter();
    });

    it('should call sgImpl with received arg', () => {
        handleForkEffectFactory(sgImpl)(['arg1_1', 'arg1_2', 'arg1_3'], emitter, 'id');
        expect(sgImpl).toHaveBeenCalledWith('arg1_1', emitter, 'id');
        expect(sgResultFn).toHaveBeenCalledWith('arg1_2', 'arg1_3');
    });

    it('should resolve to a function returning sgImpl resulting promise', (done) => {
        handleForkEffectFactory(sgImpl)('arg1', emitter)
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
