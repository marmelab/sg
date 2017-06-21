import uuid from 'uuid';
import SgEmitter from '../effects/events/SgEmitter';
import isGenerator from './isGenerator';
import deferred from './deferred';
import effectHandler from './effectHandler';
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

        const handleEffect = effectHandler(ctx);

        const iterateSaga = sagaIterator(iterator, resolveSaga, abortSaga, handleEffect);

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
