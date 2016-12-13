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

export const handleEffect = (effect, parentEmitter, emitter) => {
    if (Array.isArray(effect)) {
        return Promise.all(effect.map(e => e.handle(e.args, parentEmitter, emitter)));
    }

    return effect.handle(effect.args, parentEmitter, emitter);
};

function sg(generator, parentEmitter, emitter = new SgEmitter()) {
    if (!isGenerator(generator)) {
        throw new Error('sg need a generator function');
    }
    return (...args) => new Promise((resolve, reject) => {
        const forkedPromises = [];

        emitter.on('error', reject);
        emitter.on('fork', promise => forkedPromises.push(promise));

        setTimeout(() => {
            const iterator = generator(...args);

            function loop(next) {
                try {
                    if (next.done) {
                        return Promise.all(forkedPromises)
                        .then(() => resolve(next.value))
                        .catch(reject);
                    }
                    const effect = next.value;

                    return handleEffect(effect, parentEmitter, emitter)
                    .then(result => loop(iterator.next(result)))
                    .catch(error => loop(iterator.throw(error)))
                    .catch((error) => {
                        console.log({ error });
                        if (parentEmitter) {
                            parentEmitter.emit('error', error);
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
                reject(error);
            }
        }, 1);
    });
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
