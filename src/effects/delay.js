import createEffect from './createEffect';

export const handleDelayEffect = ([timeout]) =>
    new Promise((resolve) => {
        setTimeout(resolve, timeout);
    });

export default createEffect('put', handleDelayEffect);
