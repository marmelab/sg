import sg from '../sg';
import createEffect from './createEffect';
import isGenerator from '../utils/isGenerator';

export const handleSpawnEffect = sgImpl => ([callable, ...args], emitter) => {
    if (isGenerator(callable)) {
        throw new Error('spawn effect need a Generator');
    }
    const promise = sgImpl(callable, emitter)(...args);

    return Promise.resolve(() => promise);
};

export default createEffect('spawn', handleSpawnEffect(sg));
