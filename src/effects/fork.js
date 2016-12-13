import sg from '../sg';
import createEffect from './createEffect';

export const handleForkEffect = sgImpl => ([callable, ...args], parentEmitter, emitter) => {
    const promise = sgImpl(callable, emitter)(...args);
    emitter.emit('fork', promise);

    return Promise.resolve(() => promise);
};

export default createEffect('fork', handleForkEffect(sg));
