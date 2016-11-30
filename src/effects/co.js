import co from 'co';

import createEffect from './createEffect';
import isGenerator from '../utils/isGenerator';

export const handleCoEffect = ([callable, ...args]) => {
    if (!isGenerator(callable)) {
        throw new Error(`coEfffect need a generator got ${typeof callable}`);
    }
    return co(callable(...args));
};

export default createEffect('co', handleCoEffect);
