import createEffect from './createEffect';

export const handlePutEffect = ([type, payload], emitter) => {
    emitter.emit(type, payload);
    return Promise.resolve();
};

export default createEffect('put', handlePutEffect);
