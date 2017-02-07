import zipObject from 'lodash.zipobject';

export const handleOneEffect = (effect, emitter, id) =>
    effect.handle(effect.args, emitter, id);

export const handleEffectArray = (effects, emitter, id) =>
    Promise.all(effects.map(effect => handleOneEffect(effect, emitter, id)));

export const handleEffectLitteral = (effects, emitter, id) => {
    const keys = Object.keys(effects);
    const effectArray = keys.map(key => effects[key]);

    return handleEffectArray(effectArray, emitter, id)
        .then(effectResults => zipObject(keys, effectResults));
};

export const getEffectPromise = (effect, emitter, id) => {
    if (effect.handle) {
        return handleOneEffect(effect, emitter, id);
    }
    if (Array.isArray(effect)) {
        return handleEffectArray(effect, emitter, id);
    }

    return handleEffectLitteral(effect, emitter, id);
};

export default (emitter, id) => (effect, iterateSaga) => {
    const promise = getEffectPromise(effect, emitter, id);

    return promise
        .then(iterateSaga)
        .catch(error => iterateSaga(error, true));
};
