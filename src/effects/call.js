import sg from '../sg';
import createEffect from './createEffect';
import assertIsCallable from '../utils/assertIsCallable';
import isGenerator from '../utils/isGenerator';

export const handleCallEffect = ([callable, ...args], ctx) => {
    if (isGenerator(callable)) {
        return sg(callable, ctx)(...args);
    }
    assertIsCallable(callable);
    try {
        return Promise.resolve(callable(...args));
    } catch (error) {
        return Promise.reject(error);
    }
};

export default createEffect('call', handleCallEffect);
