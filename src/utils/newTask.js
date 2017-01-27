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
        const iterator = generator(...args);
        const next = iterator.next();

        const { promise, resolve, reject } = deferred();

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

        emitter.on('fork', (payload) => {
            if (payload.target !== id) {
                return;
            }
            forkedPromises.push(payload.task.done());
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

        function loop({ done, value }) {
            try {
                if (done) {
                    Promise.all(forkedPromises)
                    .then(() => {
                        resolve(value);
                    })
                    .catch(abortSaga);
                    return;
                }
                const effect = value;

                handleEffect(effect, emitter, id)
                .then(result => loop(iterator.next(result)))
                .catch(error => loop(iterator.throw(error)))
                .catch(abortSaga);
            } catch (error) {
                abortSaga(error);
            }
        }

        loop(next);

        return {
            id,
            cancel: () => resolve(),
            done: () => promise,
        };
    };
}
