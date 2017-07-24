import expect from 'expect';

import { takeLatestSaga } from './takeLatest';
import take from './take';
import fork from '../fork';
import cancel from '../cancel';

describe('takeLatestSaga', () => {
    let iterator;
    function* gen() {
        yield Promise.resolve();
    }

    before(() => {
        iterator = takeLatestSaga('type', gen, 'arg1', 'arg2');
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
        const next = iterator.next('forked_task');
        expect(next.value).toEqual(take('type'));
    });

    it('should call cancel with task returned by previous fork', () => {
        const next = iterator.next();
        expect(next.value).toEqual(cancel('forked_task'));
    });
});
