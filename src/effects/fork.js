import sg from '../sg';
import createEffect from './createEffect';

export const handleForkEffectFactory = sgImpl => ([callable, ...args], emitter, id) => {
    const promise = sgImpl(callable, emitter, id)(...args);
    emitter.emit(`fork_${id}`, promise);

    return Promise.resolve(() => promise);
};

export const handleForkEffect = handleForkEffectFactory(sg);

export default createEffect('fork', handleForkEffect);
