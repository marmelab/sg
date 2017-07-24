import createEffect from './createEffect';

export const handleCancelEffect = ([task]) =>
new Promise((resolve, reject) => {
    try {
        task.cancel();

        resolve();
    } catch (error) {
        reject(error);
    }
});

export default createEffect('cps', handleCancelEffect);
