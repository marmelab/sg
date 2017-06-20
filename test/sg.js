import expect from 'expect';

import sg from '../src/sg';

import {
    call,
    cps,
    delay,
    events,
} from '../src/effects';

const {
    race,
    join,
    fork,
    spawn,
    put,
    take,
    takeEvery,
    takeLatest,
    cancel,
} = events;

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

    it('should reject with error directly thrown by generator', (done) => {
        function* bomb() {
            throw new Error('Boom');
        }sg(bomb)()
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

    describe('put take fork', () => {
        it('should reject with error thrown in forked generator', (done) => {
            function* sub() {
                yield call(() => {});
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
                yield put('event', '1');
                yield put('event', '2');
                yield put('event', '3');
                yield put('event', '4');
                yield put('event', '5');
                yield put('event', '6');
                yield put('event', '7');
                yield put('event', '8');
                yield call(() => new Promise(resolve => setTimeout(resolve, 100)));
                yield cancel(task);
            })()
            .then(() => {
                expect(genCall).toEqual([
                    ['arg1', 'arg2', '1'],
                    ['arg1', 'arg2', '2'],
                    ['arg1', 'arg2', '3'],
                    ['arg1', 'arg2', '4'],
                    ['arg1', 'arg2', '5'],
                    ['arg1', 'arg2', '6'],
                    ['arg1', 'arg2', '7'],
                    ['arg1', 'arg2', '8'],
                ]);
                done();
            })
            .catch(done);
        });
    });

    describe('takeLatest', () => {
        it('should call given generator on last taken effect', (done) => {
            const genCall = [];
            function* gen(...args) {
                yield call(() => new Promise(resolve => setTimeout(resolve, 10)));
                yield call(genCall.push.bind(genCall), args);
            }

            sg(function* () {
                const task = yield takeLatest('event', gen, 'arg1', 'arg2');
                yield put('event', '1');
                yield put('event', '2');
                yield put('event', '3');
                yield put('event', '4');
                yield put('event', '5');
                yield put('event', '6');
                yield put('event', '7');
                yield put('event', '8');
                yield call(() => new Promise(resolve => setTimeout(resolve, 100)));
                yield cancel(task);
            })()
            .then(() => {
                expect(genCall).toEqual([
                    ['arg1', 'arg2', '8'],
                ]);
                done();
            })
            .catch(done);
        });
    });

    describe('race', () => {
        it('should call both effect at once and return the result of the first', (done) => {
            let firstEffectSagaCall = false;
            let lastEffectSagaCall = false;
            const firstEffectSaga = function* () {
                firstEffectSagaCall = true;
                yield delay(100);
                return 'firstEffectResult';
            };
            const lastEffectSaga = function* () {
                lastEffectSagaCall = true;
                yield delay(200);
                return 'lastEffectResult';
            };
            sg(function* () {
                return yield race({
                    firstEffect: call(firstEffectSaga),
                    lastEffect: call(lastEffectSaga),
                });
            })()
            .then((result) => {
                expect(result).toEqual({
                    firstEffect: 'firstEffectResult',
                });
                expect(firstEffectSagaCall).toBe(true);
                expect(lastEffectSagaCall).toBe(true);
                done();
            })
            .catch(done);
        });

        it('should call both effect at once and return the result of the first', (done) => {
            let firstEffectSagaCall = false;
            let lastEffectSagaCall = false;
            const firstEffectSaga = function* () {
                firstEffectSagaCall = true;
                yield delay(200);
                return 'firstEffectResult';
            };
            const lastEffectSaga = function* () {
                lastEffectSagaCall = true;
                yield delay(1000);
                throw new Error('error from last effect');
            };
            sg(function* () {
                return yield race({
                    firstEffect: call(firstEffectSaga),
                    lastEffect: call(lastEffectSaga),
                });
            })()
            .then((result) => {
                expect(result).toEqual({
                    firstEffect: 'firstEffectResult',
                });
                expect(firstEffectSagaCall).toBe(true);
                expect(lastEffectSagaCall).toBe(true);
                done();
            })
            .catch(done);
        });

        it('should call both effect at once and throw the error of the first to throw', (done) => {
            let firstEffectSagaCall = false;
            let lastEffectSagaCall = false;
            const firstEffectSaga = function* () {
                firstEffectSagaCall = true;
                yield delay(200);
                throw new Error('firstEffect error');
            };
            const lastEffectSaga = function* () {
                lastEffectSagaCall = true;
                yield delay(1000);
                return 'lastEffectResult';
            };
            sg(function* () {
                return yield race({
                    firstEffect: call(firstEffectSaga),
                    lastEffect: call(lastEffectSaga),
                });
            })()
            .then(() => {
                throw new Error('saga should have been rejected with firstEffect error');
            })
            .catch((error) => {
                expect(error.message).toBe('firstEffect error');
                expect(firstEffectSagaCall).toBe(true);
                expect(lastEffectSagaCall).toBe(true);
                done();
            })
            .catch(done);
        });
    });

    describe('join', () => {
        it('should wait for spawned task to end and retrieve its result before resuming', (done) => {
            const spawnedGenCall = [];
            const spawnedGen = function* (...args) {
                yield call(spawnedGenCall.push.bind(spawnedGenCall), args);

                return 'spawnedResult';
            };

            const gen = function* () {
                const task = yield spawn(spawnedGen, 'arg');

                return yield join(task);
            };

            sg(gen)()
            .then((result) => {
                expect(result).toBe('spawnedResult');
                expect(spawnedGenCall).toEqual([['arg']]);
                done();
            })
            .catch(done);
        });

        it('should wait for spawned task to end before resuming and throw its error', (done) => {
            const spawnedGenCall = [];
            const spawnedGen = function* (...args) {
                yield call(spawnedGenCall.push.bind(spawnedGenCall), args);

                throw new Error('spawnedError');
            };

            const gen = function* () {
                const task = yield spawn(spawnedGen, 'arg');

                return yield join(task);
            };

            sg(gen)()
            .then(() => {
                throw new Error('gen promise should have been rejected');
            })
            .catch((error) => {
                expect(error.message).toBe('spawnedError');
                expect(spawnedGenCall).toEqual([['arg']]);
                done();
            })
            .catch(done);
        });
    });
});
