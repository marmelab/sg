import uuid from 'uuid';

import isGenerator from './utils/isGenerator';
import callEffect from './effects/call';
import cpsEffect from './effects/cps';
import thunkEffect from './effects/thunk';
import coEffect from './effects/co';
import takeEffect from './effects/take';
import putEffect from './effects/put';
import spawnEffect from './effects/spawn';
import createEffect from './effects/createEffect';
import SgEmitter from './utils/SgEmitter';

export const handleEffect = (effect, emitter, id) => {
    if (Array.isArray(effect)) {
        return Promise.all(effect.map(e => e.handle(e.args, emitter, id)));
    }

    return effect.handle(effect.args, emitter, id);
};

function sg(generator, emitter = new SgEmitter(), parentId = null) {
    const id = uuid();
    if (!isGenerator(generator)) {
        throw new Error('sg need a generator function');
    }
    return (...args) => {
        const promise = new Promise((resolve, reject) => {
            const forkedPromises = [];

            emitter.on('error', e => e.id === id && reject(e));
            emitter.on('fork', p => p.id === id && forkedPromises.push(p));
            emitter.on('cancel', p => p.id === id && resolve());
            emitter.on('cancel', p => p.id === parentId && resolve());

            const iterator = generator(...args);

            function loop(next) {
                try {
                    if (next.done) {
                        return Promise.all(forkedPromises)
                        .then(() => resolve(next.value))
                        .catch(reject);
                    }
                    const effect = next.value;

                    return handleEffect(effect, emitter, id)
                    .then(result => loop(iterator.next(result)))
                    .catch(error => loop(iterator.throw(error)))
                    .catch((error) => {
                        console.log({ error });
                        if (parentId) {
                            error.id = parentId;
                            emitter.emit('error', error);
                        }

                        reject(error);
                    });
                } catch (error) {
                    console.log({ error });
                    return reject(error);
                }
            }
            try {
                loop(iterator.next());
            } catch (error) {
                error.id = parentId;
                emitter.emit('error', error);
                reject(error);
            }
        });

        promise.id = id;
        return promise;
    };
}

sg.call = callEffect;
sg.cps = cpsEffect;
sg.thunk = thunkEffect;
sg.co = coEffect;
sg.take = takeEffect;
sg.put = putEffect;
sg.spawn = spawnEffect;
sg.createEffect = createEffect;

export default sg;
