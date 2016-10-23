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

const getIterator = (generator, ...args) => {
    if (isIterator(generator)) {
        return generator;
    }
    if (!isGenerator(generator)) {
        throw new Error('sg expect either a generator or an iterator');
    }

    return generator(...args);
};

function sg(generator, ...args) {
    const iterator = getIterator(generator, ...args);
    return new Promise((resolve, reject) => {
        function loop(next) {
            if(next.done) {
                return resolve(next.value);
            }
            const effect = next.value;
            switch(effect.type) {
                case 'call':
                    if(isGenerator(effect.callable)) {
                        return sg(generator, ...args)
                        .then(result => loop(iterator.next(result)))
                        .catch(error => loop(iterator.throw(error)));
                    }
                    try {
                        return Promise.resolve(effect.callable(...effect.args))
                        .then(result => loop(iterator.next(result)))
                        .catch(error => loop(iterator.throw(error)));
                    } catch (error) {
                        return loop(iterator.throw(error));
                    }
                case 'cps':
                    try {
                        effect.callable(...effect.args, (error, result) => {
                            if (error) {
                                return loop(iterator.throw(error));
                            }

                            return loop(iterator.next(result));
                        });
                    } catch (error) {
                        return loop(iterator.throw(error));
                    }
                case 'thunk':
                    return callable(...args)((error, result) => {
                        if(error) {
                            return loop(iterator.throw(error));
                        }

                        return loop(iterator.next(result));
                    });
                default:
                    reject(new Error(`Unrecognized effect: ${effect}`));
            }
        }

        loop(iterator.next());
    });
}

sg.call = call;
sg.cps = cps;

module.exports = sg;
