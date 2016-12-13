import createEffect from './createEffect';

export const handleTakeEffect = ([type], parentEmitter, emitter) =>
    new Promise((resolve, reject) => {
        try {
            emitter.once(type, payload => resolve(payload));
            if (parentEmitter) {
                parentEmitter.once(type, payload => resolve(payload));
            }
        } catch (error) {
            reject(error);
        }
    });

export default createEffect('take', handleTakeEffect);
