import createEffect from './createEffect';

export const handlePutEffect = ([type, payload], emitter, id) =>
    new Promise((resolve) => {
        emitter.put(id, type, payload);
        resolve();
    });

export default createEffect('put', handlePutEffect);
