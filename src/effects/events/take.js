import get from 'lodash.get';
import set from 'lodash.set';

import listenerKey from './listenerKey';
import createEffect from '../createEffect';

export const handleTakeEffect = ([type], ctx) =>
    new Promise((resolve, reject) => {
        try {
            set(ctx, [listenerKey, type], [
                ...get(ctx, [listenerKey, type], []),
                payload => resolve(payload),
            ]);
        } catch (error) {
            reject(error);
        }
    });

export default createEffect('take', handleTakeEffect);
