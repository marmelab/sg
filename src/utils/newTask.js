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

        const abortSaga = (error) => {
            reject(error);
        };

        const resolveSaga = value =>
            Promise.all(forkedPromises)
                .then(() => {
                    resolve(value);
                })
                .catch(abortSaga);

        const iterateSaga = sagaIterator(iterator, resolveSaga, abortSaga, ctx);

        iterateSaga();

        const task = {
            id,
            cancel: () => {
                resolve();
                iterator.cancelled = true;
            },
            done: () => promise,
        };

        return task;
    };
}
