import sg from '../sg';
import createEffect from './createEffect';

export const handleSpawnEffect = sgImpl => ([callable, ...args], emitter) =>
    new Promise((resolve, reject) => {
        try {
            const promise = sgImpl(callable, emitter)(...args);

            resolve(() => promise);
        } catch (error) {
            reject(error);
        }
    });

export default createEffect('spawn', handleSpawnEffect(sg));
