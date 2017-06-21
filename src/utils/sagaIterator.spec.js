import expect from 'expect';

import { sagaIteratorFactory as sagaIterator } from './sagaIterator';

describe('sagaIterator', () => {
    it('should return a iterateSaga function', () => {
        expect(sagaIterator()).toBeA('function');
    });

    describe('iterateSaga', () => {
        it('should return if iterator.cancelled is true without trying to do anything', () => {
            const iterator = {
                cancelled: true,
                next: expect.createSpy(),
                throw: expect.createSpy(),
            };
            const resolveSaga = expect.createSpy();
            const abortSaga = expect.createSpy();
            const handleEffect = expect.createSpy();

            const iterateSaga = sagaIterator(handleEffect)(iterator, resolveSaga, abortSaga, 'ctx');
            iterateSaga();
            expect(resolveSaga).toNotHaveBeenCalled();
            expect(abortSaga).toNotHaveBeenCalled();
            expect(iterator.next).toNotHaveBeenCalled();
            expect(iterator.throw).toNotHaveBeenCalled();
            expect(handleEffect).toNotHaveBeenCalled();
        });

        it('should call iterator.next with data if isError is false', () => {
            const iterator = {
                cancelled: false,
                next: expect.createSpy(),
                throw: expect.createSpy(),
            };
            const resolveSaga = expect.createSpy();
            const abortSaga = expect.createSpy();
            const handleEffect = expect.createSpy();

            const iterateSaga = sagaIterator(handleEffect)(iterator, resolveSaga, abortSaga, 'ctx');
            iterateSaga('data', false);
            expect(iterator.next).toHaveBeenCalledWith('data');
            expect(iterator.throw).toNotHaveBeenCalled();
        });

        it('should call resolveSaga with next.value if iterator.next returned done: true', () => {
            const iterator = {
                cancelled: false,
                next: expect.createSpy().andReturn({ done: true, value: 'next value' }),
                throw: expect.createSpy(),
            };
            const resolveSaga = expect.createSpy();
            const abortSaga = expect.createSpy();
            const handleEffect = expect.createSpy();

            const iterateSaga = sagaIterator(handleEffect)(iterator, resolveSaga, abortSaga, 'ctx');
            iterateSaga('data', false);
            expect(iterator.next).toHaveBeenCalledWith('data');
            expect(resolveSaga).toHaveBeenCalledWith('next value');
            expect(abortSaga).toNotHaveBeenCalled();
            expect(iterator.throw).toNotHaveBeenCalled();
            expect(handleEffect).toNotHaveBeenCalled();
        });

        it('should call abortSaga if iterator.next thrown an error', () => {
            const iterator = {
                cancelled: false,
                next: expect.createSpy().andThrow('Boom'),
                throw: expect.createSpy(),
            };
            const resolveSaga = expect.createSpy();
            const abortSaga = expect.createSpy();
            const handleEffect = expect.createSpy();

            const iterateSaga = sagaIterator(handleEffect)(iterator, resolveSaga, abortSaga, 'ctx');
            iterateSaga('data', false);
            expect(iterator.next).toHaveBeenCalledWith('data');
            expect(iterator.throw).toNotHaveBeenCalled();
            expect(resolveSaga).toNotHaveBeenCalled();
            expect(abortSaga).toHaveBeenCalledWith('Boom');
            expect(handleEffect).toNotHaveBeenCalled();
        });

        it('should call handleEffect with value if iterator.next done is false', () => {
            const iterator = {
                cancelled: false,
                next: expect.createSpy().andReturn({ done: false, value: 'next value' }),
                throw: expect.createSpy(),
            };
            const resolveSaga = expect.createSpy();
            const abortSaga = expect.createSpy();
            const handleEffect = expect.createSpy().andReturn(Promise.reject('stop'));

            const iterateSaga = sagaIterator(handleEffect)(iterator, resolveSaga, abortSaga, 'ctx');
            iterateSaga('data', false);
            expect(iterator.next).toHaveBeenCalledWith('data');
            expect(iterator.throw).toNotHaveBeenCalled();
            expect(resolveSaga).toNotHaveBeenCalled();
            expect(abortSaga).toNotHaveBeenCalled();
            expect(handleEffect).toHaveBeenCalledWith('next value', 'ctx');
        });

        it('should call iterator.throw with data if isError is true', () => {
            const iterator = {
                cancelled: false,
                next: expect.createSpy(),
                throw: expect.createSpy(),
            };
            const resolveSaga = expect.createSpy();
            const abortSaga = expect.createSpy();
            const handleEffect = expect.createSpy();

            const iterateSaga = sagaIterator(handleEffect)(iterator, resolveSaga, abortSaga, 'ctx');
            iterateSaga('data', true);
            expect(iterator.throw).toHaveBeenCalledWith('data');
            expect(iterator.next).toNotHaveBeenCalled();
        });

        it('should call resolveSaga with next.value if iterator.throw returned done: true', () => {
            const iterator = {
                cancelled: false,
                next: expect.createSpy(),
                throw: expect.createSpy().andReturn({ done: true, value: 'next value' }),
            };
            const resolveSaga = expect.createSpy();
            const abortSaga = expect.createSpy();
            const handleEffect = expect.createSpy();

            const iterateSaga = sagaIterator(handleEffect)(iterator, resolveSaga, abortSaga);
            iterateSaga('data', true);
            expect(iterator.throw).toHaveBeenCalledWith('data');
            expect(resolveSaga).toHaveBeenCalledWith('next value');
            expect(abortSaga).toNotHaveBeenCalled();
            expect(iterator.next).toNotHaveBeenCalled();
            expect(handleEffect).toNotHaveBeenCalled();
        });

        it('should call abortSaga if iterator.throw thrown an error', () => {
            const iterator = {
                cancelled: false,
                next: expect.createSpy(),
                throw: expect.createSpy().andThrow('Boom'),
            };
            const resolveSaga = expect.createSpy();
            const abortSaga = expect.createSpy();
            const handleEffect = expect.createSpy();

            const iterateSaga = sagaIterator(handleEffect)(iterator, resolveSaga, abortSaga, 'ctx');
            iterateSaga('data', true);
            expect(iterator.throw).toHaveBeenCalledWith('data');
            expect(iterator.next).toNotHaveBeenCalled();
            expect(resolveSaga).toNotHaveBeenCalled();
            expect(abortSaga).toHaveBeenCalledWith('Boom');
            expect(handleEffect).toNotHaveBeenCalled();
        });

        it('should call handleEffect with value if iterator.throw done is false', () => {
            let alreadyCalled = false;
            const iterator = {
                cancelled: false,
                next: expect.createSpy(),
                throw: expect.createSpy().andCall(() => {
                    if (alreadyCalled) {
                        return {
                            done: true,
                        };
                    }
                    alreadyCalled = true;
                    return { done: false, value: 'next value' };
                }),
            };
            const resolveSaga = expect.createSpy();
            const abortSaga = expect.createSpy();
            const handleEffect = expect.createSpy().andReturn(Promise.reject('stop'));

            const iterateSaga = sagaIterator(handleEffect)(iterator, resolveSaga, abortSaga, 'ctx');
            iterateSaga('data', true);
            expect(iterator.throw).toHaveBeenCalledWith('data');
            expect(iterator.next).toNotHaveBeenCalled();
            expect(resolveSaga).toNotHaveBeenCalled();
            expect(abortSaga).toNotHaveBeenCalled();
            expect(handleEffect).toHaveBeenCalledWith('next value', 'ctx');
        });
    });
});
