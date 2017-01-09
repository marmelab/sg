import sg from '../sg';
import createEffect from './createEffect';

export const handleSpawnEffect = sgImpl => ([callable, ...args], emitter) => {
    const promise = sgImpl(callable, emitter)(...args);

    return Promise.resolve(() => promise);
};

export default createEffect('spawn', handleSpawnEffect(sg));
