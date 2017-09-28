import zipObject from 'lodash.zipobject';

export const handleOneEffect = (effect, ctx, task) =>
    effect.handle(effect.args, ctx, task);

export const handleEffectArray = (effects, ctx, task) =>
    Promise.all(effects.map(effect => handleOneEffect(effect, ctx, task)));

export const handleEffectLitteral = (effects, ctx, task) => {
    const keys = Object.keys(effects);
    const effectArray = keys.map(key => effects[key]);

    return handleEffectArray(effectArray, ctx, task)
        .then(effectResults => zipObject(keys, effectResults));
};

export const getEffectPromise = (effect, ctx, task) => {
    if (effect.handle) {
        return handleOneEffect(effect, ctx, task);
    }
    if (Array.isArray(effect)) {
        return handleEffectArray(effect, ctx, task);
    }

    return handleEffectLitteral(effect, ctx, task);
};

/*
 * Resolve an effect
 * effect: the effect to resolve, (effect | [effect, ...] | { effect, ...})
 * ctx: a context literal used to share state between effect
 * task: the task that triggered the effect
 * return a promise resolving with the effect result
 */
export default (effect, ctx, task) =>
    getEffectPromise(effect, ctx, task);

