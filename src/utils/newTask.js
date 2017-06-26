import uuid from 'uuid';
import isGenerator from './isGenerator';
import deferred from './deferred';
import sagaIterator from './sagaIterator';

export default function newTask(generator, ctx = {}) {
    const id = uuid();
    if (!isGenerator(generator)) {
        throw new Error('sg need a generator function');
    }
    return (...args) => {
        const { promise, resolve, reject } = deferred();
        const iterator = generator(...args);

        const forkedPromises = [];

        const waitFor = p => forkedPromises.push(p);

        const abortSaga = (error) => {
            reject(error);
        };

        const resolveSaga = value =>
            Promise.all(forkedPromises)
                .then(() => {
                    resolve(value);
                })
                .catch(abortSaga);

        const errorHandlers = [];

        const onError = fn =>
            errorHandlers.push(fn);

        promise.catch(error => errorHandlers.map(fn => fn(error)));

        const task = {
            id,
            waitFor,
            cancel: (error) => {
                reject(error);
                iterator.cancelled = true;
            },
            onError,
            done: () => promise,
        };

        const iterateSaga = sagaIterator(iterator, resolveSaga, abortSaga, {
            ...ctx,
            task,
        });

        iterateSaga();

        return task;
    };
}
