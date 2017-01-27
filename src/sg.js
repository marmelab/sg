import uuid from 'uuid';

import isGenerator from './utils/isGenerator';
import SgEmitter from './utils/SgEmitter';

export const handleEffect = (effect, emitter, id) => {
    if (Array.isArray(effect)) {
        return Promise.all(effect.map(e => e.handle(e.args, emitter, id)));
    }

    return effect.handle(effect.args, emitter, id);
};

function sg(generator, emitter, parentId = null) {
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
        const promise = new Promise((resolve, reject) => {
            const forkedPromises = [];

            emitter.on('error', (payload) => {
                if (payload.id !== id) {
                    return;
                }
                reject(payload.error);
                if (parentId) {
                    emitter.emit('error', {
                        ...payload,
                        id: parentId,
                    });
                }
            });
            emitter.on('fork', (payload) => {
                if (payload.parentId !== id) {
                    return;
                }
                forkedPromises.push(payload.promise);
            });
            emitter.on('cancel', (payload) => {
                if (payload.id !== id && payload.id !== parentId) {
                    return;
                }
                resolve();
                if (payload.id !== id) { // saga parent have been cancelled
                    emitter.emit('cancel', {
                        ...payload,
                        id,
                    }); // tell saga children to cancel
                }
            });

            function loop({ done, value }) {
                try {
                    if (done) {
                        Promise.all(forkedPromises)
                        .then(() => {
                            resolve(value);
                        })
                        .catch((error) => {
                            reject(error);
                            if (parentId) {
                                emitter.emit('error', {
                                    error,
                                    id: parentId,
                                });
                            }
                        });
                        return;
                    }
                    const effect = value;

                    handleEffect(effect, emitter, id)
                    .then(result => loop(iterator.next(result)))
                    .catch(error => loop(iterator.throw(error)))
                    .catch((error) => {
                        reject(error);
                        if (parentId) {
                            emitter.emit('error', {
                                error,
                                id: parentId,
                            });
                        }
                    });
                } catch (error) {
                    reject(error);
                    if (parentId) {
                        emitter.emit('error', {
                            error,
                            id: parentId,
                        });
                    }
                }
            }

            loop(next);
        });

        promise.id = id;
        return promise;
    };
}

export default sg;
