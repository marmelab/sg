import sg from '../sg';
import createEffect from './createEffect';
import isGenerator from '../utils/isGenerator';

export const handleForkEffect = sgImpl => ([callable, ...args], emitter) => {
    if (isGenerator(callable)) {
        throw new Error('fork effect need a Generator');
    }
    const promise = sgImpl(callable, emitter)(...args);

    return Promise.resolve(() => promise);
};

export default createEffect('fork', handleForkEffect(sg));
