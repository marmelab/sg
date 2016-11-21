export default (fn) => {
    const constructor = fn.constructor;
    if (!constructor) return false;
    if (constructor.name === 'GeneratorFunction' || constructor.displayName === 'GeneratorFunction') {
        return true;
    }

    return false;
};
