import uuid from 'uuid';
import SgEmitter from './SgEmitter';
import isGenerator from './isGenerator';
import deferred from './deferred';
import handleEffect from './handleEffect';

export default function newTask(generator, emitter, parentId = null) {
    const id = uuid();
    if (!emitter) {
        emitter = new SgEmitter(id);
    }
    if (!isGenerator(generator)) {
        throw new Error('sg need a generator function');
    }
    return (...args) => {
        const { promise, resolve, reject } = deferred();

        if (parentId) {
            emitter.emit('newTask', { target: parentId, id, promise });
        }

        const iterator = generator(...args);

        const forkedPromises = [];

        emitter.on('error', (payload) => {
            if (payload.target !== id) {
                return;
            }
            reject(payload.error);
            if (parentId) {
                emitter.emit('error', {
                    ...payload,
                    target: parentId,
                });
            }
        });

        emitter.on('newTask', (payload) => {
            if (payload.target !== id) {
                return;
            }
            forkedPromises.push(payload.promise);
        });

        emitter.on('cancel', (payload) => {
            if (payload.target !== parentId) {
                return;
            }
            resolve();
            emitter.emit('cancel', {
                ...payload,
                target: id,
            }); // tell saga children to cancel
        });

        const abortSaga = (error) => {
            reject(error);
            if (parentId) {
                emitter.emit('error', {
                    error,
                    target: parentId,
                });
            }
        };

        function loop(data, isError) {
            try {
                const { done, value } = isError ? iterator.throw(data) : iterator.next(data);
                if (iterator.cancelled) {
                    return;
                }
                if (done) {
                    Promise.all(forkedPromises)
                    .then(() => {
                        resolve(value);
                    })
                    .catch(abortSaga);
                    return;
                }

                handleEffect(value, emitter, id)
                .then(result => loop(result))
                .catch(error => loop(error, true))
                .catch(abortSaga);
            } catch (error) {
                abortSaga(error);
            }
        }

        loop();

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
