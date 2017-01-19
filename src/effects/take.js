import createEffect from './createEffect';

export const handleTakeEffect = ([type], emitter, id) =>
    emitter.take(id, type);

export default createEffect('take', handleTakeEffect);
