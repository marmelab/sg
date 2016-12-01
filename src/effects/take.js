import createEffect from './createEffect';

export const handleTakeEffect = ([type], emitter) =>
    new Promise((resolve, reject) => {
        try {
            emitter.once(type, payload => resolve(payload));
        } catch (error) {
            reject(error);
        }
    });

export default createEffect('put', handleTakeEffect);
