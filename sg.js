import co from 'co';

function isIterator(obj) {
  return 'function' == typeof obj.next && 'function' == typeof obj.throw;
}

function isGenerator(obj) {
    var constructor = obj.constructor;
    if (!constructor) return false;
    if ('GeneratorFunction' === constructor.name || 'GeneratorFunction' === constructor.displayName) return true;

    return isIterator(constructor.prototype);
}

const call = (callable, ...args) => ({
    type: 'call',
    callable,
    args,
});

const cps = (callable, ...args) => ({
    type: 'cps',
    callable,
    args
});

const thunk = (callable, ...args) => ({
    type: 'thunk',
    callable,
    args
});

const coEffect = (callable, ...args) => ({
    type: 'co',
    callable,
    args
});

const getIterator = (generator, ...args) => {
    if (isIterator(generator)) {
        return generator;
    }
    if (!isGenerator(generator)) {
        throw new Error('sg expect either a generator or an iterator');
    }

    return generator(...args);
};

const handleCallEffect = ({ callable, args }) => {
    if(isGenerator(callable)) {
        return sg(callable, ...args);
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
    switch(effect.type) {
    case 'call':
        return handleCallEffect(effect);
    case 'cps':
        return handleCpsEffect(effect);
    case 'thunk':
        return handleThunkEffect(effect);
    case 'co':
        return handleCoEffect(effect);
    default:
        throw new Error(`Unrecognized effect: ${effect}`);
    }
}

function sg(generator, ...args) {
    const iterator = getIterator(generator, ...args);
    return new Promise((resolve, reject) => {
        function loop(next) {
            if(next.done) {
                return resolve(next.value);
            }
            const effect = next.value;
            try {
                return handleEffect(effect)
                .then(result => loop(iterator.next(result)))
                .catch(error => loop(iterator.throw(error)));
            } catch (error) {
                reject(error);
            }
        }

        loop(iterator.next());
    });
}

sg.call = call;
sg.cps = cps;
sg.thunk = thunk;
sg.co = coEffect;

module.exports = sg;
