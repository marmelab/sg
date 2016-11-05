const co = require('co');

const isGenerator = (fn) => {
    var constructor = fn.constructor;
    if (!constructor) return false;
    if (constructor.name === 'GeneratorFunction' || constructor.displayName === 'GeneratorFunction'){
        return true;
    }

    return false;
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
                    return handleEffect(effect)
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

sg.call = call;
sg.cps = cps;
sg.thunk = thunk;
sg.co = co;

module.exports = sg;
