import expect from 'expect';

import sg, { handleEffect } from '../src/sg';

import {
    call,
    cps,
    fork,
    put,
    take,
    takeEvery,
    cancel,
} from '../src/effects';

describe('sg', () => {
    it('should execute generator', (done) => {
        const add = (a, b) => a + b;
        const multiply = (a, b) => Promise.resolve(a * b);
        const substract = (a, b, cb) => cb(null, a - b);
        const boom = () => {
            throw new Error('boom');
        };
        function* compute(a, b) {
            const c = yield call(add, a, b);
            try {
                yield call(boom);
            } catch (error) {
                console.log(error);
            }

            const d = yield call(multiply, c, a);

            return yield cps(substract, d, b);
        }

        sg(compute)(2, 3)
        .then((result) => {
            expect(result).toBe(7);
            done();
        }).catch((error) => {
            done(error);
        });
    });

    it('should reject with error unhandled by generator', (done) => {
        function boom() {
            throw new Error('Boom');
        }
        function* bomb() {
            yield call(boom);
        }

        sg(bomb)()
        .then(() => {
            done(new Error('it should have thrown an error'));
        })
        .catch((error) => {
            expect(error.message).toBe('Boom');
            done();
        })
        .catch(done);
    });

    it('should reject with error throw directly by generator', (done) => {
        function* bomb() {
            throw new Error('Boom');
        }

        sg(bomb)()
        .then(() => {
            done(new Error('it should have thrown an error'));
        })
        .catch((error) => {
            expect(error.message).toBe('Boom');
            done();
        })
        .catch(done);
    });

    it('should handle array of effect', (done) => {
        const add = (a, b) => a + b;
        const multiply = (a, b) => Promise.resolve(a * b);
        const substract = (a, b, cb) => cb(null, a - b);
        function* compute(a, b) {
            return yield [
                call(add, a, b),
                call(multiply, a, b),
                cps(substract, a, b),
            ];
        }

        sg(compute)(2, 3)
        .then((result) => {
            expect(result).toEqual([5, 6, -1]);
            done();
        }).catch((error) => {
            done(error);
        });
    });

    describe('handleEffect', () => {
        it('should call effect.handle with effect.args and second argument emitter', () => {
            let handleCall;
            const handle = (...args) => {
                handleCall = args;
            };
            const effect = {
                handle,
                args: ['arg1', 'arg2'],
            };

            handleEffect(effect, 'parentEmitter', 'emitter');

            expect(handleCall).toEqual([['arg1', 'arg2'], 'parentEmitter', 'emitter']);
        });
    });

    describe('put take fork', () => {
        it('should reject with error thrown in forked generator', (done) => {
            function* sub() {
                throw new Error('sub Boom');
            }
            function* main() {
                try {
                    yield fork(sub);
                } catch (error) {
                    throw new Error(`I caught ${error.message}`);
                }
            }
            sg(main)()
            .then(() => {
                done(new Error('main should have been rejected with error from forked sub'));
            })
            .catch((error) => {
                expect(error.message).toBe('sub Boom');
                done();
            })
            .catch(done);
        });

        it('should be able to communicate between forked saga with put and take', (done) => {
            let payload;
            function* fork1() {
                yield put('from_fork1', 'fork1_payload');
            }

            function* fork2() {
                payload = yield take('from_fork1');
            }

            function* main() {
                yield fork(fork2);
                yield fork(fork1);
            }

            sg(main)()
            .then((result) => {
                expect(result).toBe(undefined);
                expect(payload).toBe('fork1_payload');
                done();
            })
            .catch(done);
        });

        it('should be able to communicate with nested saga', (done) => {
            let payload;

            function* fork1() {
                yield put('from_fork1', 'fork1_payload');
            }

            function* main() {
                yield fork(fork1);
                payload = yield take('from_fork1');
            }

            sg(main)()
            .then((result) => {
                expect(result).toBe(undefined);
                expect(payload).toBe('fork1_payload');
                done();
            })
            .catch(done);
        });

        it('should be able to propagate error form deeply nested saga', (done) => {
            function* fork2() {
                throw new Error('Boom from fork2');
            }

            function* fork1() {
                yield fork(fork2);
            }

            function* main() {
                yield fork(fork1);
            }

            sg(main)()
            .then(() => {
                done(new Error('sg should have been rejected'));
            })
            .catch((error) => {
                expect(error.message).toBe('Boom from fork2');
                done();
            });
        });
    });

    describe('takeEvery', () => {
        it('should call given generator on each taken effect', (done) => {
            const genCall = [];
            function* gen(...args) {
                genCall.push(args);
            }

            sg(function* () {
                const task = yield takeEvery('event', gen, 'arg1', 'arg2');
                yield put('event', 'first');
                yield put('event', 'second');
                yield cancel(task);
            })()
            .then(() => {
                expect(genCall).toEqual([
                    ['arg1', 'arg2', 'first'],
                    ['arg1', 'arg2', 'second'],
                ]);
                done();
            })
            .catch(done);
        });
    });
});
