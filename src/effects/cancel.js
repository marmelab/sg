import createEffect from './createEffect';

export const handleCancelEffect = ([task], emitter) =>
new Promise((resolve, reject) => {
    try {
        task.cancel();
        emitter.emit('cancel', {
            target: task.id,
        });

        resolve();
    } catch (error) {
        reject(error);
    }
});

export default createEffect('cps', handleCancelEffect);
