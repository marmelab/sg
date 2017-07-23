import get from 'lodash.get';
import set from 'lodash.set';

import createEffect from '../createEffect';

export const handleTakeEffect = ([type], ctx) =>
    new Promise((resolve, reject) => {
        try {
            set(ctx, ['event', type], [
                ...get(ctx, ['event', type], []),
                payload => resolve(payload),
            ]);
        } catch (error) {
            reject(error);
        }
    });

export default createEffect('take', handleTakeEffect);
