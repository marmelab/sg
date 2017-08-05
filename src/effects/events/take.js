import createEffect from '../createEffect';

export const handleTakeEffect = emitter => ([type]) =>
    new Promise((resolve, reject) => {
        try {
            emitter.once(type, resolve);
        } catch (error) {
            reject(error);
        }
    });

export default emitter => createEffect('take', handleTakeEffect(emitter));
