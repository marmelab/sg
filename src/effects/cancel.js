import createEffect from './createEffect';

export const handleCancelEffect = ([task], emitter) =>
new Promise((resolve, reject) => {
    try {
        const promise = task();
        emitter.emit('cancel', promise);

        resolve();
    } catch (error) {
        reject(error);
    }
});

export default createEffect('cps', handleCancelEffect);
