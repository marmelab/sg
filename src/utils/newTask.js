import deferred from './deferred';

const CANCEL = Symbol('CANCEL');

/*
 * Take a generator a context and some arguments, and execute the generator returning a task
 * Task:
 *      waitFor: add a promise for the task to waitFor before resolving used by the forkEffect to tell its parent task to wait for the new forked task to end
 *      abort: reject the internal promise with the given error, used internally to abort the task when the generator threw an error
 *      cancel: cancel the task, it's iteration get stopped, and the internal promise become resolved
 *      onError: add error listener to be called when the task intenal promise is rejected.
 *      onCancel: add cancel listener to be called when the task get cancelled
 *      promise: a promise that will resolve when the task end or reject if it fail
 */

export default function newTask() {
    const { promise, resolve, reject } = deferred();

    const forkedPromises = [];

    const waitFor = p => forkedPromises.push(p);

    const errorHandlers = [];
    const onError = fn => errorHandlers.push(fn);

    const cancelHandlers = [];
    const onCancel = fn => cancelHandlers.push(fn);

    let cancelled = false;

    const taskPromise = promise
        .then((value) => {
            if (value === CANCEL) {
                cancelled = true;
                cancelHandlers.map(handler => handler());
                return 'this task has been cancelled';
            }
            return Promise.all(forkedPromises).then(() => value);
        })
        .catch((error) => {
            errorHandlers.map(fn => fn(error));
            throw error;
        });

    const task = {
        waitFor,
        reject,
        resolve,
        cancel: () => resolve(CANCEL),
        onError,
        onCancel,
        cancelled: () => cancelled,
        promise: taskPromise,
    };

    return task;
}
