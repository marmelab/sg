import zipObject from 'lodash.zipobject';

export const handleOneEffect = (effect, ctx) =>
    effect.handle(effect.args, ctx);

export const handleEffectArray = (effects, ctx) =>
    Promise.all(effects.map(effect => handleOneEffect(effect, ctx)));

export const handleEffectLitteral = (effects, ctx) => {
    const keys = Object.keys(effects);
    const effectArray = keys.map(key => effects[key]);

    return handleEffectArray(effectArray, ctx)
        .then(effectResults => zipObject(keys, effectResults));
};

export const getEffectPromise = (effect, ctx) => {
    if (effect.handle) {
        return handleOneEffect(effect, ctx);
    }
    if (Array.isArray(effect)) {
        return handleEffectArray(effect, ctx);
    }

    return handleEffectLitteral(effect, ctx);
};

export default ctx => (effect) =>
    getEffectPromise(effect, ctx);

