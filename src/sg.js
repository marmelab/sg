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

            emitter.on('error', e => {
                if (e.id !== id) {
                    return;
                }
                reject(e);
                if (parentId) {
                    e.id = parentId;
                    emitter.emit('error', e);
                }
            });
            emitter.on('fork', p => p.parentId === id && forkedPromises.push(p));
            emitter.on('cancel', p => (p.id === id || p.id === parentId) && resolve());

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
                                error.id = parentId;
                                emitter.emit('error', error);
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
                            error.id = parentId;
                            emitter.emit('error', error);
                        }
                    });
                } catch (error) {
                    reject(error);
                    if (parentId) {
                        error.id = parentId;
                        emitter.emit('error', error);
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
