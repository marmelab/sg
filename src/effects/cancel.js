import createEffect from './createEffect';

export const handleCancelEffect = ([task], emitter) => {
    const promise = task();
    emitter.emit('cancel', { promise });

    return Promise.resolve();
};

export default createEffect('cps', handleCancelEffect);
