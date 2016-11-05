const co = require('co');

const isGenerator = (fn) => {
    var constructor = fn.constructor;
    if (!constructor) return false;
    if (constructor.name === 'GeneratorFunction' || constructor.displayName === 'GeneratorFunction'){
        return true;
    }

    return false;
}

const createEffect = (type, handle, handleCtx) => (callable, ...args) => ({
    type,
    callable,
    args,
    handle: handle.bind(handleCtx, { callable, args }),
});

const handleCallEffect = ({ callable, args }) => {
    if(typeof callable !== 'function' || isGenerator(callable)) {
        throw new Error('Call effect take a function');
    }
    try {
        return Promise.resolve(callable(...args));
    } catch (error) {
        return Promise.reject(error);
    }
}

const handleCpsEffect = ({ callable, args }) => {
    return new Promise((resolve, reject) => {
        try {
            callable(...args, (error, result) => {
                if (error) {
                    return reject(error);
                }

                return resolve(result);
            });
        } catch (error) {
            return reject(error);
        }
    });
}

const handleThunkEffect = ({ callable, args }) => {
    return new Promise((resolve, reject) => {
        try {
            callable(...args)((error, result) => {
                if(error) {
                    return reject(error);
                }

                return resolve(result);
            });
        } catch (error) {
            return reject(error);
        }
    });
}

const handleCoEffect = ({ callable, args }) => {
    return co(callable(...args));
}

const handleEffect = (effect) => {
    return effect.handle(effect);
}

function sg(generator) {
    if (!isGenerator(generator)) {
        throw new Error('sg need a generator function');
    }
    return (...args) => {
        const iterator = generator(...args);
        return new Promise((resolve, reject) => {
            function loop(next) {
                if(next.done) {
                    return resolve(next.value);
                }
                const effect = next.value;
                try {
                    return effect.handle()
                    .then(result => loop(iterator.next(result)))
                    .catch(error => loop(iterator.throw(error)));
                } catch (error) {
                    reject(error);
                }
            }

            loop(iterator.next());
        });
    };
}

sg.call = createEffect('call', handleCallEffect);
sg.cps = createEffect('cps', handleCpsEffect);
sg.thunk = createEffect('thunk', handleThunkEffect);
sg.co = createEffect('co', handleCoEffect);

module.exports = sg;
