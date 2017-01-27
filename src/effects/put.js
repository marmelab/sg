import createEffect from './createEffect';

export const handlePutEffect = ([type, payload], emitter, id) =>
    new Promise((resolve, reject) => {
        try {
            emitter.put(id, type, payload);
            resolve();
        } catch (error) {
            reject(error);
        }
    });

export default createEffect('put', handlePutEffect);
