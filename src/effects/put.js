import createEffect from './createEffect';

export const handlePutEffect = ([type, payload], parentEmitter, emitter) => {
    emitter.emit(type, payload);
    if (parentEmitter) {
        parentEmitter.emit(type, payload);
    }
    return Promise.resolve();
};

export default createEffect('put', handlePutEffect);
