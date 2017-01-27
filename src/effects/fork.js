import sg from '../sg';
import createEffect from './createEffect';

export const handleForkEffectFactory = sgImpl => ([callable, ...args], emitter, id) =>
new Promise((resolve, reject) => {
    try {
        const promise = sgImpl(callable, emitter, id)(...args);
        promise.parentId = id;
        emitter.emit('fork', promise);
        resolve(() => promise);
    } catch (error) {
        reject(error);
    }
});

export const handleForkEffect = handleForkEffectFactory(sg);

export default createEffect('fork', handleForkEffect);
