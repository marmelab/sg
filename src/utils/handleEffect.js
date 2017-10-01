import zipObject from 'lodash.zipobject';

export const handleOneEffect = (effect, task) =>
    effect.handle(effect.args, task);

export const handleEffectArray = (effects, task) =>
    Promise.all(effects.map(effect => handleOneEffect(effect, task)));

export const handleEffectLitteral = (effects, task) => {
    const keys = Object.keys(effects);
    const effectArray = keys.map(key => effects[key]);

    return handleEffectArray(effectArray, task)
        .then(effectResults => zipObject(keys, effectResults));
};

export const getEffectPromise = (effect, task) => {
    if (effect.handle) {
        return handleOneEffect(effect, task);
    }
    if (Array.isArray(effect)) {
        return handleEffectArray(effect, task);
    }

    return handleEffectLitteral(effect, task);
};

/*
 * Resolve an effect
 * effect: the effect to resolve, (effect | [effect, ...] | { effect, ...})
 * ctx: a context literal used to share state between effect
 * task: the task that triggered the effect
 * return a promise resolving with the effect result
 */
export default (effect, task) =>
    getEffectPromise(effect, task);

