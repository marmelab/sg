import isGenerator from './utils/isGenerator';
import callEffect from './effects/call';
import cpsEffect from './effects/cps';
import thunkEffect from './effects/thunk';
import coEffect from './effects/co';
import createEffect from './effects/createEffect';
import SgEmitter from './utils/SgEmitter';

export const handleEffect = (effect, emitter) => {
    if (Array.isArray(effect)) {
        return Promise.all(effect.map(e => e.handle(e.args, emitter)));
    }

    return effect.handle(effect.args, emitter);
};

function sg(generator, emitter = new SgEmitter()) {
    if (!isGenerator(generator)) {
        throw new Error('sg need a generator function');
    }
    return (...args) => {
        const iterator = generator(...args);
        return new Promise((resolve, reject) => {
            function loop(next) {
                try {
                    if (next.done) {
                        return resolve(next.value);
                    }
                    const effect = next.value;

                    return handleEffect(effect, emitter)
                    .then(result => loop(iterator.next(result)))
                    .catch(error => loop(iterator.throw(error)))
                    .catch(error => reject(error));
                } catch (error) {
                    return reject(error);
                }
            }

            loop(iterator.next());
        });
    };
}

sg.call = callEffect;
sg.cps = cpsEffect;
sg.thunk = thunkEffect;
sg.co = coEffect;
sg.createEffect = createEffect;

export default sg;
