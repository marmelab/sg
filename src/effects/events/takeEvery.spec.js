import expect from 'expect';

import { takeEverySaga } from './takeEvery';
import take from './take';
import fork from '../fork';

describe('takeEverySaga', () => {
    let iterator;
    function* gen() {
        yield Promise.resolve();
    }
    before(() => {
        iterator = takeEverySaga('type', gen, 'arg1', 'arg2');
    });

    it('should call take with type', () => {
        const next = iterator.next();
        expect(next.value).toEqual(take('type'));
    });

    it('should call fork with args + value returned by take', () => {
        const next = iterator.next('taken value');
        expect(next.value).toEqual(fork(gen, 'arg1', 'arg2', 'taken value'));
    });

    it('should call take with type again', () => {
        const next = iterator.next();
        expect(next.value).toEqual(take('type'));
    });
});
