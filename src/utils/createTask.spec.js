import expect from 'expect';

import createTask from './createTask';

describe('createTask', () => {
    describe('resolve', () => {
        it('should resolve task.promise', async () => {
            const task = createTask();

            task.resolve('resolve value');

            const result = await task.promise;

            expect(result).toBe('resolve value');
        });
    });

    describe('reject', () => {
        it('should reject task.promise', async () => {
            const task = createTask();

            task.reject(new Error('Boom'));

            const result = await task.promise.catch(error => error);

            expect(result).toEqual(new Error('Boom'));
        });
    });

    describe('cancel', () => {
        it('should resolve task.promoise with a cancel message', async () => {
            const task = createTask();

            task.cancel();

            const result = await task.promise;

            expect(result).toEqual('this task has been cancelled');
        });
    });

    describe('onError', () => {
        it('should add listener called with the rejection error when task get rejected', async () => {
            const task = createTask();

            const errorHandler1 = expect.createSpy();
            const errorHandler2 = expect.createSpy();

            task.onError(errorHandler1);
            task.onError(errorHandler2);

            task.reject(new Error('Boom'));

            await task.promise.catch(() => null);

            expect(errorHandler1).toHaveBeenCalledWith(new Error('Boom'));
            expect(errorHandler2).toHaveBeenCalledWith(new Error('Boom'));
        });

        it('The listener should not be called if the task was resolved', async () => {
            const task = createTask();

            const errorHandler1 = expect.createSpy();
            const errorHandler2 = expect.createSpy();

            task.onError(errorHandler1);
            task.onError(errorHandler2);

            task.resolve();

            await task.promise;

            expect(errorHandler1).toNotHaveBeenCalled();
            expect(errorHandler2).toNotHaveBeenCalled();
        });

        it('The listener should not be called if the task was cancelled', async () => {
            const task = createTask();

            const errorHandler1 = expect.createSpy();
            const errorHandler2 = expect.createSpy();

            task.onError(errorHandler1);
            task.onError(errorHandler2);

            task.cancel();

            await task.promise;

            expect(errorHandler1).toNotHaveBeenCalled();
            expect(errorHandler2).toNotHaveBeenCalled();
        });
    });

    describe('onCancel', () => {
        it('should add listener called when the task get cancelled', async () => {
            const task = createTask();

            const cancelHandler1 = expect.createSpy();
            const cancelHandler2 = expect.createSpy();

            task.onCancel(cancelHandler1);
            task.onCancel(cancelHandler2);

            task.cancel();

            await task.promise;

            expect(cancelHandler1).toHaveBeenCalled();
            expect(cancelHandler2).toHaveBeenCalled();
        });

        it('The listener should not be called if the task was resolved', async () => {
            const task = createTask();

            const cancelHandler1 = expect.createSpy();
            const cancelHandler2 = expect.createSpy();

            task.onCancel(cancelHandler1);
            task.onCancel(cancelHandler2);

            task.resolve();

            await task.promise;

            expect(cancelHandler1).toNotHaveBeenCalled();
            expect(cancelHandler2).toNotHaveBeenCalled();
        });

        it('The listener should not be called if the task was rejected', async () => {
            const task = createTask();

            const cancelHandler1 = expect.createSpy();
            const cancelHandler2 = expect.createSpy();

            task.onCancel(cancelHandler1);
            task.onCancel(cancelHandler2);

            task.reject(new Error('Boom'));

            await task.promise.catch(() => null);

            expect(cancelHandler1).toNotHaveBeenCalled();
            expect(cancelHandler2).toNotHaveBeenCalled();
        });
    });


    describe('waitFor', () => {
        const pendingPromise = new Promise(() => null);
        const resolvedPromise = Promise.resolve();
        const rejectedPromise = Promise.reject(new Error('Boom'));

        it('should not resolve task if waitFor received an unresolved promise', (done) => {
            const task = createTask();

            task.waitFor(pendingPromise);
            task.waitFor(resolvedPromise);
            task.resolve();

            task.promise.then(() => {
                done(new Error('task.promise should not resolve'));
            });

            setTimeout(done, 1000);
        });

        it('should resolve task if waitFor received an resolved promise', (done) => {
            const task = createTask();

            task.waitFor(resolvedPromise);
            task.resolve();

            task.promise.then(() => {
                done();
            });
        });

        it('should reject task if waitFor received an rejected promise', (done) => {
            const task = createTask();

            task.waitFor(rejectedPromise);
            task.waitFor(resolvedPromise);
            task.waitFor(pendingPromise);
            task.resolve();

            task.promise
                .then(() => new Error('task.promise should have been rejected'))
                .catch((error) => {
                    expect(error.message).toEqual('Boom');
                    done();
                })
                .catch(done);
        });
    });
});
