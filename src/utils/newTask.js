import isGenerator from './isGenerator';
import deferred from './deferred';
import sagaIterator from './sagaIterator';

/*
 * Take a generator a context and some arguments, and execute the generator returning a task
 * Task:
 *      waitFor: add a promise for the task to waitFor before resolving used by the forkEffect to tell its parent task to wait for the new forked task to end
 *      abort: reject the internal promise with the given error, used internally to abort the task when the generator threw an error
 *      cancel: cancel the task, it's iteration get stopped, and the internal promise become resolved
 *      onError: add error listener to be called when the task intenal promise is rejected.
 *      onCancel: add cancel listener to be called when the task get cancelled
 *      done: function that return the internal promise
 */

export default function newTask(generator, ctx = {}) {
    if (!isGenerator(generator)) {
        throw new Error('sg need a generator function');
    }

    return (...args) => {
        const { promise, resolve, reject } = deferred();
        const iterator = generator(...args);

        const forkedPromises = [];

        const waitFor = p => forkedPromises.push(p);

        const resolveSaga = value =>
            Promise.all(forkedPromises)
                .then(() => {
                    resolve(value);
                })
                .catch(reject);

        const errorHandlers = [];
        const onError = fn =>
            errorHandlers.push(fn);

        const cancelHandlers = [];
        const onCancel = fn =>
            cancelHandlers.push(fn);

        promise.catch(error => errorHandlers.map(fn => fn(error)));

        const task = {
            waitFor,
            abort: reject,
            cancel: () => {
                iterator.cancelled = true;
                resolve();
                task.cancelled = true;
                cancelHandlers.map(handler => handler());
            },
            onError,
            onCancel,
            done: () => promise,
        };

        const iterateSaga = sagaIterator(iterator, resolveSaga, reject, ctx, task);

        iterateSaga();

        return task;
    };
}
