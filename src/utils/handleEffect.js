export default (effect, emitter, id) => {
    if (Array.isArray(effect)) {
        return Promise.all(effect.map(e => e.handle(e.args, emitter, id)));
    }

    return effect.handle(effect.args, emitter, id);
};
