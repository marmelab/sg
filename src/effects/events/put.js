import get from 'lodash.get';
import set from 'lodash.set';

import createEffect from '../createEffect';

export const handlePutEffect = ([type, payload], ctx) =>
    new Promise((resolve, reject) => {
        try {
            const events = get(ctx, ['event', type], []);
            if (events) {
                events.map(fn => fn(payload));
                set(ctx, ['event', type], []);
            }

            setTimeout(resolve, 0);
        } catch (error) {
            reject(error);
        }
    });

export default createEffect('put', handlePutEffect);
