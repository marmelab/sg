import sg from '../sg';
import createEffect from './createEffect';

export const handleSpawnEffect = sgImpl => ([callable, ...args]) => {
    const promise = sgImpl(callable)(...args);

    return Promise.resolve(() => promise);
};

export default createEffect('spawn', handleSpawnEffect(sg));
