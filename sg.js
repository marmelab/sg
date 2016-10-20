function isGenerator(obj) {
  return 'function' == typeof obj.next && 'function' == typeof obj.throw;
}

function isGeneratorFunction(obj) {
    var constructor = obj.constructor;
    if (!constructor) return false;
    if ('GeneratorFunction' === constructor.name || 'GeneratorFunction' === constructor.displayName) return true;

    return isGenerator(constructor.prototype);
}

module.exports = function sg(generator, ...args) {
    const iterator = generator(...args);
    function loop(next) {
        if(next.done) {
            return next.value;
        }
        const [task, ...args] = next.value;
        if(typeof task !== 'function') {
            throw new Error(`yielded task must be callable got ${task}`);
        }
        try {
            const result = task(...args);
            return loop(iterator.next(result));
        } catch (error) {
            return loop(iterator.throw(error));
        }
    }

    return loop(iterator.next());
}
