function isGenerator(obj) {
  return 'function' == typeof obj.next && 'function' == typeof obj.throw;
}

function isGeneratorFunction(obj) {
    var constructor = obj.constructor;
    if (!constructor) return false;
    if ('GeneratorFunction' === constructor.name || 'GeneratorFunction' === constructor.displayName) return true;

    return isGenerator(constructor.prototype);
}

module.exports = function sg(iterator) {
    return new Promise((resolve, reject) => {
        function loop(next) {
            if(next.done) {
                resolve(next.value);
            }
            const [task, ...args] = next.value;
            if(typeof task !== 'function') {
                throw new Error(`yielded task must be callable got ${typeof task}`);
            }
            try {
                Promise.resolve(task(...args))
                .then(result => loop(iterator.next(result)))
                .catch(error => loop(iterator.throw(error)));
            } catch (error) {
                loop(iterator.throw(error));
            }
        }

        loop(iterator.next());
    });
}
