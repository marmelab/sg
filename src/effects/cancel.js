import createEffect from './createEffect';
import { CANCEL } from '../sg';

export const handleCancelEffect = ([task], emitter) =>
new Promise((resolve, reject) => {
    try {
        const promise = task();
        promise[CANCEL]();
        emitter.emit('cancel', {
            promise,
            target: promise.id,
        });

        resolve();
    } catch (error) {
        reject(error);
    }
});

export default createEffect('cps', handleCancelEffect);
