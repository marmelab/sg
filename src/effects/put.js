import createEffect from './createEffect';

export const handlePutEffect = ([type, payload], emitter, id) => {
    emitter.put(id, type, payload);
    return Promise.resolve();
};

export default createEffect('put', handlePutEffect);
