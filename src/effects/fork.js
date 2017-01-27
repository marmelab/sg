import sg from '../sg';
import createEffect from './createEffect';

export const handleForkEffectFactory = sgImpl => ([callable, ...args], emitter, id) =>
new Promise((resolve, reject) => {
    try {
        const promise = sgImpl(callable, emitter, id)(...args);
        emitter.emit('fork', {
            promise,
            id: promise.id,
            parentId: id,
        });
        resolve(() => promise);
    } catch (error) {
        reject(error);
    }
});

export const handleForkEffect = handleForkEffectFactory(sg);

export default createEffect('fork', handleForkEffect);
